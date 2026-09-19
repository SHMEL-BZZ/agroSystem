--
-- PostgreSQL database dump
--

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-09-18 13:39:31

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE FUNCTION public.auto_hash_password() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
BEGIN
    IF NEW.пароль NOT LIKE '$2%' THEN
        NEW.пароль := public.hash_password(NEW.пароль);
    END IF;
    RETURN NEW;
END;
$_$;


--ALTER FUNCTION public.auto_hash_password() OWNER TO postgres;


CREATE FUNCTION public.check_additive_not_in_use() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    usage_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO usage_count
    FROM public.состав_раствора
    WHERE id_добавки = OLD.id_добавки;

    IF usage_count > 0 THEN
        RAISE EXCEPTION 'Невозможно удалить добавку "%", так как она используется в % растворе(ах)!',
            OLD.название, usage_count;
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION public.check_additive_not_in_use() OWNER TO postgres;


CREATE FUNCTION public.check_additive_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    stock DECIMAL;
    additive_name VARCHAR(100);
BEGIN
    SELECT остаток_объем, название INTO stock, additive_name
    FROM public.добавки
    WHERE id_добавки = NEW.id_добавки;

    IF stock < NEW.количество_добавки THEN
        RAISE EXCEPTION 'Недостаточно добавки "%"! Остаток: %, требуется: %',
            additive_name, stock, NEW.количество_добавки;
    END IF;

    RETURN NEW;
END;
$$;


--  ALTER FUNCTION public.check_additive_stock() OWNER TO postgres;


CREATE FUNCTION public.check_password(user_login character varying, user_password text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT пароль INTO stored_hash
    FROM public.пользователи
    WHERE логин = user_login;

    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN stored_hash = public.crypt(user_password, stored_hash);
END;
$$;


-- ALTER FUNCTION public.check_password(user_login character varying, user_password text) OWNER TO postgres;


CREATE FUNCTION public.check_watering_data() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.объем_воды <= 0 THEN
        RAISE EXCEPTION 'Объем воды должен быть положительным числом!';
    END IF;

    IF NEW.длительность_полива <= 0 THEN
        RAISE EXCEPTION 'Длительность полива должна быть положительным числом!';
    END IF;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.check_watering_data() OWNER TO postgres;


CREATE FUNCTION public.decrease_additive_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE public.добавки
    SET остаток_объем = остаток_объем - NEW.количество_добавки
    WHERE id_добавки = NEW.id_добавки;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.decrease_additive_stock() OWNER TO postgres;


CREATE FUNCTION public.hash_password(password text) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN public.crypt(password, public.gen_salt('bf'));
END;
$$;


-- ALTER FUNCTION public.hash_password(password text) OWNER TO postgres;


CREATE FUNCTION public.log_valve_state_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.состояние IS DISTINCT FROM NEW.состояние THEN
        RAISE NOTICE 'Клапан % (ID: %) изменил состояние с "%" на "%"',
            OLD.модель, OLD.id_клапана, OLD.состояние, NEW.состояние;
    END IF;

    RETURN NEW;
END;
$$;


-- ALTER FUNCTION public.log_valve_state_change() OWNER TO postgres;


CREATE FUNCTION public.update_solution_total_volume() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_volume DECIMAL;
    solution_id INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        solution_id = OLD.id_раствора;
    ELSE
        solution_id = NEW.id_раствора;
    END IF;

    SELECT COALESCE(SUM(количество_добавки), 0) INTO total_volume
    FROM public.состав_раствора
    WHERE id_раствора = solution_id;

    UPDATE public.история_раствора
    SET общий_объем = total_volume
    WHERE id_раствора = solution_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;


--ALTER FUNCTION public.update_solution_total_volume() OWNER TO postgres;


CREATE FUNCTION public.update_watering_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.время_начала_полива IS NULL THEN
        NEW.время_начала_полива = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$;


--ALTER FUNCTION public.update_watering_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public."баки" (
    "id_бака" integer NOT NULL,
    "объем" numeric(10,2) NOT NULL,
    "id_назначения_бака" integer
);


-- ALTER TABLE public."баки" OWNER TO postgres;


CREATE SEQUENCE public."баки_id_бака_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."баки_id_бака_seq" OWNER TO postgres;


ALTER SEQUENCE public."баки_id_бака_seq" OWNED BY public."баки"."id_бака";


CREATE TABLE public."добавки" (
    "id_добавки" integer NOT NULL,
    "название" character varying(100) NOT NULL,
    "остаток_объем" numeric(10,2),
    "ед_измерения" character varying(10) DEFAULT 'кг'::character varying,
    CONSTRAINT "добавки_ед_измерения_check" CHECK ((("ед_измерения")::text = ANY ((ARRAY['кг'::character varying, 'л'::character varying])::text[])))
);


-- ALTER TABLE public."добавки" OWNER TO postgres;


CREATE SEQUENCE public."добавки_id_добавка_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public."добавки_id_добавка_seq" OWNER TO postgres;


ALTER SEQUENCE public."добавки_id_добавка_seq" OWNED BY public."добавки"."id_добавки";


CREATE TABLE public."ежедневные_условия" (
    "id_ежуслов" integer NOT NULL,
    "id_клапана" integer,
    "дата" date NOT NULL,
    "температура_по_дню" numeric(5,2),
    "погода" character varying(50),
    "ср_влажность" numeric(5,2),
    "ср_электропроводность" numeric(5,2),
    "ср_ph" numeric(4,2)
);


--ALTER TABLE public."ежедневные_условия" OWNER TO postgres;


CREATE SEQUENCE public."ежедневные_условия_id_ежуслов_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."ежедневные_условия_id_ежуслов_seq" OWNER TO postgres;


ALTER SEQUENCE public."ежедневные_условия_id_ежуслов_seq" OWNED BY public."ежедневные_условия"."id_ежуслов";


CREATE TABLE public."история_дренажа" (
    "id_дренажа" integer NOT NULL,
    "id_полива" integer,
    "время_измерения" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "объем_дренажа" numeric(10,2)
);


--ALTER TABLE public."история_дренажа" OWNER TO postgres;


CREATE SEQUENCE public."история_дренажа_id_дренажа_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."история_дренажа_id_дренажа_seq" OWNER TO postgres;


ALTER SEQUENCE public."история_дренажа_id_дренажа_seq" OWNED BY public."история_дренажа"."id_дренажа";


CREATE TABLE public."история_поливов" (
    "id_полива" integer NOT NULL,
    "id_ежуслов" integer,
    "id_раствора" integer,
    "время_начала_полива" timestamp without time zone NOT NULL,
    "длительность_полива" integer,
    "объем_воды" numeric(10,2)
);


--ALTER TABLE public."история_поливов" OWNER TO postgres;


CREATE SEQUENCE public."история_поливов_id_полива_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."история_поливов_id_полива_seq" OWNER TO postgres;


ALTER SEQUENCE public."история_поливов_id_полива_seq" OWNED BY public."история_поливов"."id_полива";


CREATE TABLE public."история_раствора" (
    "id_раствора" integer NOT NULL,
    "id_бака" integer,
    "дата" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "общий_объем" numeric(10,2)
);


--ALTER TABLE public."история_раствора" OWNER TO postgres;


CREATE SEQUENCE public."история_раствора_id_раствора_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."история_раствора_id_раствора_seq" OWNER TO postgres;


ALTER SEQUENCE public."история_раствора_id_раствора_seq" OWNED BY public."история_раствора"."id_раствора";


CREATE TABLE public."клапаны" (
    "id_клапана" integer NOT NULL,
    "производитель" character varying(50),
    "модель" character varying(50),
    "тип_конструкции" character varying(50),
    "диаметр" numeric(5,2),
    "состояние" character varying(20) DEFAULT 'работает'::character varying,
    CONSTRAINT "клапаны_состояние_check" CHECK ((("состояние")::text = ANY ((ARRAY['работает'::character varying, 'отключен'::character varying, 'аварийное'::character varying])::text[]))),
    CONSTRAINT "клапаны_тип_конструкции_check" CHECK ((("тип_конструкции")::text = ANY ((ARRAY['электромагнитный'::character varying, 'шаровый'::character varying, 'дисковый'::character varying, 'игольчатый'::character varying])::text[])))
);


--ALTER TABLE public."клапаны" OWNER TO postgres;


CREATE SEQUENCE public."клапаны_id_клапана_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."клапаны_id_клапана_seq" OWNER TO postgres;


ALTER SEQUENCE public."клапаны_id_клапана_seq" OWNED BY public."клапаны"."id_клапана";


CREATE TABLE public."назначение_баков" (
    "id_назначения" integer NOT NULL,
    "описание" character varying(100) NOT NULL
);


--ALTER TABLE public."назначение_баков" OWNER TO postgres;


CREATE SEQUENCE public."назначение_баков_id_назначения_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."назначение_баков_id_назначения_seq" OWNER TO postgres;


ALTER SEQUENCE public."назначение_баков_id_назначения_seq" OWNED BY public."назначение_баков"."id_назначения";


CREATE TABLE public."пользователи" (
    "id_пользователя" integer NOT NULL,
    "логин" character varying(50) NOT NULL,
    "пароль" character varying(255) NOT NULL
);


ALTER TABLE public."пользователи" OWNER TO postgres;


CREATE SEQUENCE public."пользователи_id_пользователя_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."пользователи_id_пользователя_seq" OWNER TO postgres;


ALTER SEQUENCE public."пользователи_id_пользователя_seq" OWNED BY public."пользователи"."id_пользователя";


CREATE TABLE public."состав_раствора" (
    "id_состава" integer NOT NULL,
    "id_раствора" integer,
    "id_добавки" integer,
    "количество_добавки" numeric(10,2) NOT NULL,
    "ед_измерения" character varying(10),
    CONSTRAINT "состав_раствора_ед_измерения_check" CHECK ((("ед_измерения")::text = ANY ((ARRAY['кг'::character varying, 'л'::character varying])::text[])))
);


ALTER TABLE public."состав_раствора" OWNER TO postgres;


CREATE SEQUENCE public."состав_раствора_id_состава_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public."состав_раствора_id_состава_seq" OWNER TO postgres;


ALTER SEQUENCE public."состав_раствора_id_состава_seq" OWNED BY public."состав_раствора"."id_состава";


CREATE TABLE public."список_блока_теплиц" (
    "id_блока_теплиц" integer NOT NULL,
    "название" character varying(100) NOT NULL,
    "описание" text
);


--ALTER TABLE public."список_блока_теплиц" OWNER TO postgres;


CREATE SEQUENCE public."список_блока_тепл_id_блока_теплиц_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--ALTER SEQUENCE public."список_блока_тепл_id_блока_теплиц_seq" OWNER TO postgres;


ALTER SEQUENCE public."список_блока_тепл_id_блока_теплиц_seq" OWNED BY public."список_блока_теплиц"."id_блока_теплиц";


CREATE TABLE public."теплицы_клапаны" (
    "id_клапана" integer NOT NULL,
    "id_блока_теплиц" integer NOT NULL
);


--ALTER TABLE public."теплицы_клапаны" OWNER TO postgres;


ALTER TABLE ONLY public."баки" ALTER COLUMN "id_бака" SET DEFAULT nextval('public."баки_id_бака_seq"'::regclass);
ALTER TABLE ONLY public."добавки" ALTER COLUMN "id_добавки" SET DEFAULT nextval('public."добавки_id_добавка_seq"'::regclass);
ALTER TABLE ONLY public."ежедневные_условия" ALTER COLUMN "id_ежуслов" SET DEFAULT nextval('public."ежедневные_условия_id_ежуслов_seq"'::regclass);
ALTER TABLE ONLY public."история_дренажа" ALTER COLUMN "id_дренажа" SET DEFAULT nextval('public."история_дренажа_id_дренажа_seq"'::regclass);
ALTER TABLE ONLY public."история_поливов" ALTER COLUMN "id_полива" SET DEFAULT nextval('public."история_поливов_id_полива_seq"'::regclass);
ALTER TABLE ONLY public."история_раствора" ALTER COLUMN "id_раствора" SET DEFAULT nextval('public."история_раствора_id_раствора_seq"'::regclass);
ALTER TABLE ONLY public."клапаны" ALTER COLUMN "id_клапана" SET DEFAULT nextval('public."клапаны_id_клапана_seq"'::regclass);
ALTER TABLE ONLY public."назначение_баков" ALTER COLUMN "id_назначения" SET DEFAULT nextval('public."назначение_баков_id_назначения_seq"'::regclass);
ALTER TABLE ONLY public."пользователи" ALTER COLUMN "id_пользователя" SET DEFAULT nextval('public."пользователи_id_пользователя_seq"'::regclass);
ALTER TABLE ONLY public."состав_раствора" ALTER COLUMN "id_состава" SET DEFAULT nextval('public."состав_раствора_id_состава_seq"'::regclass);
ALTER TABLE ONLY public."список_блока_теплиц" ALTER COLUMN "id_блока_теплиц" SET DEFAULT nextval('public."список_блока_тепл_id_блока_теплиц_seq"'::regclass);


ALTER TABLE ONLY public."баки" ADD CONSTRAINT "баки_pkey" PRIMARY KEY ("id_бака");
ALTER TABLE ONLY public."добавки" ADD CONSTRAINT "добавки_pkey" PRIMARY KEY ("id_добавки");
ALTER TABLE ONLY public."ежедневные_условия" ADD CONSTRAINT "ежедневные_услов_id_клапана_дата_key" UNIQUE ("id_клапана", "дата");
ALTER TABLE ONLY public."ежедневные_условия" ADD CONSTRAINT "ежедневные_условия_pkey" PRIMARY KEY ("id_ежуслов");
ALTER TABLE ONLY public."история_дренажа" ADD CONSTRAINT "история_дренажа_pkey" PRIMARY KEY ("id_дренажа");
ALTER TABLE ONLY public."история_поливов" ADD CONSTRAINT "история_поливов_pkey" PRIMARY KEY ("id_полива");
ALTER TABLE ONLY public."история_раствора" ADD CONSTRAINT "история_раствора_pkey" PRIMARY KEY ("id_раствора");
ALTER TABLE ONLY public."клапаны" ADD CONSTRAINT "клапаны_pkey" PRIMARY KEY ("id_клапана");
ALTER TABLE ONLY public."назначение_баков" ADD CONSTRAINT "назначение_баков_pkey" PRIMARY KEY ("id_назначения");
ALTER TABLE ONLY public."пользователи" ADD CONSTRAINT "пользователи_pkey" PRIMARY KEY ("id_пользователя");
ALTER TABLE ONLY public."пользователи" ADD CONSTRAINT "пользователи_логин_key" UNIQUE ("логин");
ALTER TABLE ONLY public."состав_раствора" ADD CONSTRAINT "состав_раствора_pkey" PRIMARY KEY ("id_состава");
ALTER TABLE ONLY public."список_блока_теплиц" ADD CONSTRAINT "список_блока_теплиц_pkey" PRIMARY KEY ("id_блока_теплиц");
ALTER TABLE ONLY public."теплицы_клапаны" ADD CONSTRAINT "теплицы_клапаны_pkey" PRIMARY KEY ("id_клапана", "id_блока_теплиц");


CREATE TRIGGER trigger_check_additive_in_use BEFORE DELETE ON public."добавки" FOR EACH ROW EXECUTE FUNCTION public.check_additive_not_in_use();
CREATE TRIGGER trigger_check_stock BEFORE INSERT ON public."состав_раствора" FOR EACH ROW EXECUTE FUNCTION public.check_additive_stock();
CREATE TRIGGER trigger_check_watering_data BEFORE INSERT OR UPDATE ON public."история_поливов" FOR EACH ROW EXECUTE FUNCTION public.check_watering_data();
CREATE TRIGGER trigger_decrease_stock AFTER INSERT ON public."состав_раствора" FOR EACH ROW EXECUTE FUNCTION public.decrease_additive_stock();
CREATE TRIGGER trigger_hash_password BEFORE INSERT OR UPDATE OF "пароль" ON public."пользователи" FOR EACH ROW EXECUTE FUNCTION public.auto_hash_password();
CREATE TRIGGER trigger_log_valve_state BEFORE UPDATE OF "состояние" ON public."клапаны" FOR EACH ROW EXECUTE FUNCTION public.log_valve_state_change();
CREATE TRIGGER trigger_set_watering_time BEFORE INSERT ON public."история_поливов" FOR EACH ROW EXECUTE FUNCTION public.update_watering_timestamp();
CREATE TRIGGER trigger_update_solution_volume AFTER INSERT OR DELETE OR UPDATE ON public."состав_раствора" FOR EACH ROW EXECUTE FUNCTION public.update_solution_total_volume();


ALTER TABLE ONLY public."баки" ADD CONSTRAINT "баки_id_назначения_бака_fkey" FOREIGN KEY ("id_назначения_бака") REFERENCES public."назначение_баков"("id_назначения");
ALTER TABLE ONLY public."ежедневные_условия" ADD CONSTRAINT "ежедневные_условия_id_клапана_fkey" FOREIGN KEY ("id_клапана") REFERENCES public."клапаны"("id_клапана") ON DELETE CASCADE;
ALTER TABLE ONLY public."история_дренажа" ADD CONSTRAINT "история_дренажа_id_полива_fkey" FOREIGN KEY ("id_полива") REFERENCES public."история_поливов"("id_полива") ON DELETE CASCADE;
ALTER TABLE ONLY public."история_поливов" ADD CONSTRAINT "история_поливов_id_ежуслов_fkey" FOREIGN KEY ("id_ежуслов") REFERENCES public."ежедневные_условия"("id_ежуслов");
ALTER TABLE ONLY public."история_поливов" ADD CONSTRAINT "история_поливов_id_раствора_fkey" FOREIGN KEY ("id_раствора") REFERENCES public."история_раствора"("id_раствора");
ALTER TABLE ONLY public."история_раствора" ADD CONSTRAINT "история_раствора_id_бака_fkey" FOREIGN KEY ("id_бака") REFERENCES public."баки"("id_бака");
ALTER TABLE ONLY public."состав_раствора" ADD CONSTRAINT "состав_раствора_id_добавка_fkey" FOREIGN KEY ("id_добавки") REFERENCES public."добавки"("id_добавки");
ALTER TABLE ONLY public."состав_раствора" ADD CONSTRAINT "состав_раствора_id_раствора_fkey" FOREIGN KEY ("id_раствора") REFERENCES public."история_раствора"("id_раствора") ON DELETE CASCADE;
ALTER TABLE ONLY public."теплицы_клапаны" ADD CONSTRAINT "теплицы_клапаны_id_блока_теплиц_fkey" FOREIGN KEY ("id_блока_теплиц") REFERENCES public."список_блока_теплиц"("id_блока_теплиц") ON DELETE CASCADE;
ALTER TABLE ONLY public."теплицы_клапаны" ADD CONSTRAINT "теплицы_клапаны_id_клапана_fkey" FOREIGN KEY ("id_клапана") REFERENCES public."клапаны"("id_клапана") ON DELETE CASCADE;


GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."баки" TO app_user;
GRANT ALL ON SEQUENCE public."баки_id_бака_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."добавки" TO app_user;
GRANT ALL ON SEQUENCE public."добавки_id_добавка_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."ежедневные_условия" TO app_user;
GRANT ALL ON SEQUENCE public."ежедневные_условия_id_ежуслов_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."история_дренажа" TO app_user;
GRANT ALL ON SEQUENCE public."история_дренажа_id_дренажа_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."история_поливов" TO app_user;
GRANT ALL ON SEQUENCE public."история_поливов_id_полива_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."история_раствора" TO app_user;
GRANT ALL ON SEQUENCE public."история_раствора_id_раствора_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."клапаны" TO app_user;
GRANT ALL ON SEQUENCE public."клапаны_id_клапана_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."назначение_баков" TO app_user;
GRANT ALL ON SEQUENCE public."назначение_баков_id_назначения_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."пользователи" TO app_user;
GRANT ALL ON SEQUENCE public."пользователи_id_пользователя_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."состав_раствора" TO app_user;
GRANT ALL ON SEQUENCE public."состав_раствора_id_состава_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."список_блока_теплиц" TO app_user;
GRANT ALL ON SEQUENCE public."список_блока_тепл_id_блока_теплиц_seq" TO app_user;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."теплицы_клапаны" TO app_user;


-- Completed on 2026-09-18 13:39:32

--
-- PostgreSQL database dump complete
--
