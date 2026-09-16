--
-- PostgreSQL database dump
--

\restrict sbSST5p7od3nLsW0w1QDckPAZrrB79eFQ7tltQaRaoxpY1IIusZFZjxgijzmNb7

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-09-16 10:13:31

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 41450)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--



--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 277 (class 1255 OID 41489)
-- Name: auto_hash_password(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_hash_password() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
BEGIN
    -- Если пароль не начинается с '$2' (bcrypt) — хэшируем
    IF NEW.пароль NOT LIKE '$2%' THEN
         NEW.пароль := hash_password(NEW.пароль::text);
    END IF;
    RETURN NEW;
END;
$_$;


ALTER FUNCTION public.auto_hash_password() OWNER TO postgres;

--
-- TOC entry 292 (class 1255 OID 33273)
-- Name: check_additive_not_in_use(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_additive_not_in_use() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    usage_count INTEGER;
BEGIN
    -- Проверяем, используется ли добавка в составе растворов
    SELECT COUNT(*) INTO usage_count
    FROM состав_раствора
    WHERE id_добавка = OLD.id_добавка;
    
    -- Если используется, запрещаем удаление
    IF usage_count > 0 THEN
        RAISE EXCEPTION 'Невозможно удалить добавку "%", так как она используется в % растворе(ах)!', 
            OLD.название, usage_count;
    END IF;
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION public.check_additive_not_in_use() OWNER TO postgres;

--
-- TOC entry 282 (class 1255 OID 33270)
-- Name: check_additive_stock(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_additive_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    stock DECIMAL;
    additive_name VARCHAR(100);
BEGIN
    -- Получаем текущий остаток и название добавки
    SELECT остаток_объем, название INTO stock, additive_name
    FROM добавки
    WHERE id_добавка = NEW.id_добавка;
    
    -- Если остатка меньше, чем нужно — ОШИБКА
    IF stock < NEW.количество_добавки THEN
        RAISE EXCEPTION 'Недостаточно добавки "%"! Остаток: %, требуется: %', 
            additive_name, stock, NEW.количество_добавки;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_additive_stock() OWNER TO postgres;

--
-- TOC entry 276 (class 1255 OID 41488)
-- Name: check_password(character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_password(user_login character varying, user_password text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT пароль INTO stored_hash
    FROM пользователи
    WHERE логин = user_login;
    
    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN stored_hash = crypt(user_password, stored_hash);
END;
$$;


ALTER FUNCTION public.check_password(user_login character varying, user_password text) OWNER TO postgres;

--
-- TOC entry 295 (class 1255 OID 33276)
-- Name: check_watering_data(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_watering_data() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Проверяем, что объем воды положительный
    IF NEW.объем_воды <= 0 THEN
        RAISE EXCEPTION 'Объем воды должен быть положительным числом!';
    END IF;
    
    -- Проверяем, что длительность полива положительная
    IF NEW.длительность_полива <= 0 THEN
        RAISE EXCEPTION 'Длительность полива должна быть положительным числом!';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_watering_data() OWNER TO postgres;

--
-- TOC entry 289 (class 1255 OID 33271)
-- Name: decrease_additive_stock(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrease_additive_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Уменьшаем остаток добавки на использованное количество
    UPDATE добавки
    SET остаток_объем = остаток_объем - NEW.количество_добавки
    WHERE id_добавка = NEW.id_добавка;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.decrease_additive_stock() OWNER TO postgres;

--
-- TOC entry 275 (class 1255 OID 41487)
-- Name: hash_password(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.hash_password(password text) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));  -- bcrypt
END;
$$;


ALTER FUNCTION public.hash_password(password text) OWNER TO postgres;

--
-- TOC entry 293 (class 1255 OID 33274)
-- Name: log_valve_state_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_valve_state_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Если состояние изменилось, записываем в лог
    IF OLD.состояние IS DISTINCT FROM NEW.состояние THEN
        RAISE NOTICE 'Клапан % (ID: %) изменил состояние с "%" на "%"', 
            OLD.модель, OLD.id_клапана, OLD.состояние, NEW.состояние;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_valve_state_change() OWNER TO postgres;

--
-- TOC entry 291 (class 1255 OID 33272)
-- Name: update_solution_total_volume(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_solution_total_volume() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_volume DECIMAL;
    solution_id INTEGER;
BEGIN
    -- Определяем ID раствора в зависимости от операции
    IF TG_OP = 'DELETE' THEN
        solution_id = OLD.id_раствора;
    ELSE
        solution_id = NEW.id_раствора;
    END IF;
    
    -- Пересчитываем общий объем раствора как сумму всех добавок
    SELECT COALESCE(SUM(количество_добавки), 0) INTO total_volume
    FROM состав_раствора
    WHERE id_раствора = solution_id;
    
    -- Обновляем общий объем в таблице история_раствора
    UPDATE история_раствора
    SET общий_объем = total_volume
    WHERE id_раствора = solution_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.update_solution_total_volume() OWNER TO postgres;

--
-- TOC entry 294 (class 1255 OID 33275)
-- Name: update_watering_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_watering_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Если время начала полива не указано, устанавливаем текущее время
    IF NEW.время_начала_полива IS NULL THEN
        NEW.время_начала_полива = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_watering_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 25229)
-- Name: баки; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."баки" (
    "id_бака" integer NOT NULL,
    "объем" numeric(10,2) NOT NULL,
    "id_назначения_бака" integer
);


ALTER TABLE public."баки" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25228)
-- Name: баки_id_бака_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."баки_id_бака_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."баки_id_бака_seq" OWNER TO postgres;

--
-- TOC entry 5004 (class 0 OID 0)
-- Dependencies: 225
-- Name: баки_id_бака_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."баки_id_бака_seq" OWNED BY public."баки"."id_бака";


--
-- TOC entry 230 (class 1259 OID 25255)
-- Name: добавки; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."добавки" (
    "id_добавки" integer NOT NULL,
    "название" character varying(100) NOT NULL,
    "остаток_объем" numeric(10,2),
    "ед_измерения" character varying(10) DEFAULT 'кг'::character varying,
    CONSTRAINT "добавки_ед_измерения_check" CHECK ((("ед_измерения")::text = ANY ((ARRAY['кг'::character varying, 'л'::character varying])::text[])))
);


ALTER TABLE public."добавки" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 25254)
-- Name: добавки_id_добавка_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."добавки_id_добавка_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."добавки_id_добавка_seq" OWNER TO postgres;

--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 229
-- Name: добавки_id_добавка_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."добавки_id_добавка_seq" OWNED BY public."добавки"."id_добавки";


--
-- TOC entry 228 (class 1259 OID 25241)
-- Name: ежедневные_условия; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public."ежедневные_условия" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25240)
-- Name: ежедневные_условия_id_ежуслов_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ежедневные_условия_id_ежуслов_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ежедневные_условия_id_ежуслов_seq" OWNER TO postgres;

--
-- TOC entry 5010 (class 0 OID 0)
-- Dependencies: 227
-- Name: ежедневные_условия_id_ежуслов_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ежедневные_условия_id_ежуслов_seq" OWNED BY public."ежедневные_условия"."id_ежуслов";


--
-- TOC entry 236 (class 1259 OID 25314)
-- Name: история_дренажа; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."история_дренажа" (
    "id_дренажа" integer NOT NULL,
    "id_полива" integer,
    "время_измерения" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "объем_дренажа" numeric(10,2)
);


ALTER TABLE public."история_дренажа" OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 25313)
-- Name: история_дренажа_id_дренажа_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."история_дренажа_id_дренажа_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."история_дренажа_id_дренажа_seq" OWNER TO postgres;

--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 235
-- Name: история_дренажа_id_дренажа_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."история_дренажа_id_дренажа_seq" OWNED BY public."история_дренажа"."id_дренажа";


--
-- TOC entry 234 (class 1259 OID 25297)
-- Name: история_поливов; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."история_поливов" (
    "id_полива" integer NOT NULL,
    "id_ежуслов" integer,
    "id_раствора" integer,
    "время_начала_полива" timestamp without time zone NOT NULL,
    "длительность_полива" integer,
    "объем_воды" numeric(10,2)
);


ALTER TABLE public."история_поливов" OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 25296)
-- Name: история_поливов_id_полива_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."история_поливов_id_полива_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."история_поливов_id_полива_seq" OWNER TO postgres;

--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 233
-- Name: история_поливов_id_полива_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."история_поливов_id_полива_seq" OWNED BY public."история_поливов"."id_полива";


--
-- TOC entry 232 (class 1259 OID 25264)
-- Name: история_раствора; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."история_раствора" (
    "id_раствора" integer NOT NULL,
    "id_бака" integer,
    "дата" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "общий_объем" numeric(10,2)
);


ALTER TABLE public."история_раствора" OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 25263)
-- Name: история_раствора_id_раствора_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."история_раствора_id_раствора_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."история_раствора_id_раствора_seq" OWNER TO postgres;

--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 231
-- Name: история_раствора_id_раствора_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."история_раствора_id_раствора_seq" OWNED BY public."история_раствора"."id_раствора";


--
-- TOC entry 221 (class 1259 OID 25197)
-- Name: клапаны; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public."клапаны" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 25196)
-- Name: клапаны_id_клапана_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."клапаны_id_клапана_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."клапаны_id_клапана_seq" OWNER TO postgres;

--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 220
-- Name: клапаны_id_клапана_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."клапаны_id_клапана_seq" OWNED BY public."клапаны"."id_клапана";


--
-- TOC entry 224 (class 1259 OID 25222)
-- Name: назначение_баков; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."назначение_баков" (
    "id_назначения" integer NOT NULL,
    "описание" character varying(100) NOT NULL
);


ALTER TABLE public."назначение_баков" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 25221)
-- Name: назначение_баков_id_назначения_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."назначение_баков_id_назначения_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."назначение_баков_id_назначения_seq" OWNER TO postgres;

--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 223
-- Name: назначение_баков_id_назначения_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."назначение_баков_id_назначения_seq" OWNED BY public."назначение_баков"."id_назначения";


--
-- TOC entry 217 (class 1259 OID 25179)
-- Name: пользователи; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."пользователи" (
    "id_пользователя" integer NOT NULL,
    "логин" character varying(50) NOT NULL,
    "пароль" character varying(255) NOT NULL
);


ALTER TABLE public."пользователи" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 25178)
-- Name: пользователи_id_пользователя_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."пользователи_id_пользователя_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."пользователи_id_пользователя_seq" OWNER TO postgres;

--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 216
-- Name: пользователи_id_пользователя_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."пользователи_id_пользователя_seq" OWNED BY public."пользователи"."id_пользователя";


--
-- TOC entry 238 (class 1259 OID 25340)
-- Name: состав_раствора; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."состав_раствора" (
    "id_состава" integer NOT NULL,
    "id_раствора" integer,
    "id_добавки" integer,
    "количество_добавки" numeric(10,2) NOT NULL,
    "ед_измерения" character varying(10),
    CONSTRAINT "состав_раствора_ед_измерения_check" CHECK ((("ед_измерения")::text = ANY ((ARRAY['кг'::character varying, 'л'::character varying])::text[])))
);


ALTER TABLE public."состав_раствора" OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 25339)
-- Name: состав_раствора_id_состава_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."состав_раствора_id_состава_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."состав_раствора_id_состава_seq" OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 237
-- Name: состав_раствора_id_состава_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."состав_раствора_id_состава_seq" OWNED BY public."состав_раствора"."id_состава";


--
-- TOC entry 219 (class 1259 OID 25188)
-- Name: список_блока_теплиц; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."список_блока_теплиц" (
    "id_блока_теплиц" integer NOT NULL,
    "название" character varying(100) NOT NULL,
    "описание" text
);


ALTER TABLE public."список_блока_теплиц" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 25187)
-- Name: список_блока_тепл_id_блока_теплиц_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."список_блока_тепл_id_блока_теплиц_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."список_блока_тепл_id_блока_теплиц_seq" OWNER TO postgres;

--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 218
-- Name: список_блока_тепл_id_блока_теплиц_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."список_блока_тепл_id_блока_теплиц_seq" OWNED BY public."список_блока_теплиц"."id_блока_теплиц";


--
-- TOC entry 222 (class 1259 OID 25206)
-- Name: теплицы_клапаны; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."теплицы_клапаны" (
    "id_клапана" integer NOT NULL,
    "id_блока_теплиц" integer NOT NULL
);


ALTER TABLE public."теплицы_клапаны" OWNER TO postgres;

--
-- TOC entry 4794 (class 2604 OID 25232)
-- Name: баки id_бака; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."баки" ALTER COLUMN "id_бака" SET DEFAULT nextval('public."баки_id_бака_seq"'::regclass);


--
-- TOC entry 4796 (class 2604 OID 25258)
-- Name: добавки id_добавки; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."добавки" ALTER COLUMN "id_добавки" SET DEFAULT nextval('public."добавки_id_добавка_seq"'::regclass);


--
-- TOC entry 4795 (class 2604 OID 25244)
-- Name: ежедневные_условия id_ежуслов; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ежедневные_условия" ALTER COLUMN "id_ежуслов" SET DEFAULT nextval('public."ежедневные_условия_id_ежуслов_seq"'::regclass);


--
-- TOC entry 4801 (class 2604 OID 25317)
-- Name: история_дренажа id_дренажа; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_дренажа" ALTER COLUMN "id_дренажа" SET DEFAULT nextval('public."история_дренажа_id_дренажа_seq"'::regclass);


--
-- TOC entry 4800 (class 2604 OID 25300)
-- Name: история_поливов id_полива; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_поливов" ALTER COLUMN "id_полива" SET DEFAULT nextval('public."история_поливов_id_полива_seq"'::regclass);


--
-- TOC entry 4798 (class 2604 OID 25267)
-- Name: история_раствора id_раствора; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_раствора" ALTER COLUMN "id_раствора" SET DEFAULT nextval('public."история_раствора_id_раствора_seq"'::regclass);


--
-- TOC entry 4791 (class 2604 OID 25200)
-- Name: клапаны id_клапана; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."клапаны" ALTER COLUMN "id_клапана" SET DEFAULT nextval('public."клапаны_id_клапана_seq"'::regclass);


--
-- TOC entry 4793 (class 2604 OID 25225)
-- Name: назначение_баков id_назначения; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."назначение_баков" ALTER COLUMN "id_назначения" SET DEFAULT nextval('public."назначение_баков_id_назначения_seq"'::regclass);


--
-- TOC entry 4789 (class 2604 OID 25182)
-- Name: пользователи id_пользователя; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."пользователи" ALTER COLUMN "id_пользователя" SET DEFAULT nextval('public."пользователи_id_пользователя_seq"'::regclass);


--
-- TOC entry 4803 (class 2604 OID 25343)
-- Name: состав_раствора id_состава; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."состав_раствора" ALTER COLUMN "id_состава" SET DEFAULT nextval('public."состав_раствора_id_состава_seq"'::regclass);


--
-- TOC entry 4790 (class 2604 OID 25191)
-- Name: список_блока_теплиц id_блока_теплиц; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."список_блока_теплиц" ALTER COLUMN "id_блока_теплиц" SET DEFAULT nextval('public."список_блока_тепл_id_блока_теплиц_seq"'::regclass);


--
-- TOC entry 4821 (class 2606 OID 25234)
-- Name: баки баки_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."баки"
    ADD CONSTRAINT "баки_pkey" PRIMARY KEY ("id_бака");


--
-- TOC entry 4827 (class 2606 OID 25262)
-- Name: добавки добавки_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."добавки"
    ADD CONSTRAINT "добавки_pkey" PRIMARY KEY ("id_добавки");


--
-- TOC entry 4823 (class 2606 OID 25248)
-- Name: ежедневные_условия ежедневные_услов_id_клапана_дата_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ежедневные_условия"
    ADD CONSTRAINT "ежедневные_услов_id_клапана_дата_key" UNIQUE ("id_клапана", "дата");


--
-- TOC entry 4825 (class 2606 OID 25246)
-- Name: ежедневные_условия ежедневные_условия_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ежедневные_условия"
    ADD CONSTRAINT "ежедневные_условия_pkey" PRIMARY KEY ("id_ежуслов");


--
-- TOC entry 4833 (class 2606 OID 25320)
-- Name: история_дренажа история_дренажа_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_дренажа"
    ADD CONSTRAINT "история_дренажа_pkey" PRIMARY KEY ("id_дренажа");


--
-- TOC entry 4831 (class 2606 OID 25302)
-- Name: история_поливов история_поливов_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_поливов"
    ADD CONSTRAINT "история_поливов_pkey" PRIMARY KEY ("id_полива");


--
-- TOC entry 4829 (class 2606 OID 25270)
-- Name: история_раствора история_раствора_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_раствора"
    ADD CONSTRAINT "история_раствора_pkey" PRIMARY KEY ("id_раствора");


--
-- TOC entry 4815 (class 2606 OID 25205)
-- Name: клапаны клапаны_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."клапаны"
    ADD CONSTRAINT "клапаны_pkey" PRIMARY KEY ("id_клапана");


--
-- TOC entry 4819 (class 2606 OID 25227)
-- Name: назначение_баков назначение_баков_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."назначение_баков"
    ADD CONSTRAINT "назначение_баков_pkey" PRIMARY KEY ("id_назначения");


--
-- TOC entry 4809 (class 2606 OID 25184)
-- Name: пользователи пользователи_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."пользователи"
    ADD CONSTRAINT "пользователи_pkey" PRIMARY KEY ("id_пользователя");


--
-- TOC entry 4811 (class 2606 OID 25186)
-- Name: пользователи пользователи_логин_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."пользователи"
    ADD CONSTRAINT "пользователи_логин_key" UNIQUE ("логин");


--
-- TOC entry 4835 (class 2606 OID 25346)
-- Name: состав_раствора состав_раствора_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."состав_раствора"
    ADD CONSTRAINT "состав_раствора_pkey" PRIMARY KEY ("id_состава");


--
-- TOC entry 4813 (class 2606 OID 25195)
-- Name: список_блока_теплиц список_блока_теплиц_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."список_блока_теплиц"
    ADD CONSTRAINT "список_блока_теплиц_pkey" PRIMARY KEY ("id_блока_теплиц");


--
-- TOC entry 4817 (class 2606 OID 25210)
-- Name: теплицы_клапаны теплицы_клапаны_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."теплицы_клапаны"
    ADD CONSTRAINT "теплицы_клапаны_pkey" PRIMARY KEY ("id_клапана", "id_блока_теплиц");


--
-- TOC entry 4848 (class 2620 OID 33280)
-- Name: добавки trigger_check_additive_in_use; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_additive_in_use BEFORE DELETE ON public."добавки" FOR EACH ROW EXECUTE FUNCTION public.check_additive_not_in_use();


--
-- TOC entry 4851 (class 2620 OID 33277)
-- Name: состав_раствора trigger_check_stock; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_stock BEFORE INSERT ON public."состав_раствора" FOR EACH ROW EXECUTE FUNCTION public.check_additive_stock();


--
-- TOC entry 4849 (class 2620 OID 33283)
-- Name: история_поливов trigger_check_watering_data; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_watering_data BEFORE INSERT OR UPDATE ON public."история_поливов" FOR EACH ROW EXECUTE FUNCTION public.check_watering_data();


--
-- TOC entry 4852 (class 2620 OID 33278)
-- Name: состав_раствора trigger_decrease_stock; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_decrease_stock AFTER INSERT ON public."состав_раствора" FOR EACH ROW EXECUTE FUNCTION public.decrease_additive_stock();


--
-- TOC entry 4846 (class 2620 OID 41490)
-- Name: пользователи trigger_hash_password; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_hash_password BEFORE INSERT OR UPDATE OF "пароль" ON public."пользователи" FOR EACH ROW EXECUTE FUNCTION public.auto_hash_password();


--
-- TOC entry 4847 (class 2620 OID 33281)
-- Name: клапаны trigger_log_valve_state; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_valve_state BEFORE UPDATE OF "состояние" ON public."клапаны" FOR EACH ROW EXECUTE FUNCTION public.log_valve_state_change();


--
-- TOC entry 4850 (class 2620 OID 33282)
-- Name: история_поливов trigger_set_watering_time; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_set_watering_time BEFORE INSERT ON public."история_поливов" FOR EACH ROW EXECUTE FUNCTION public.update_watering_timestamp();


--
-- TOC entry 4853 (class 2620 OID 33279)
-- Name: состав_раствора trigger_update_solution_volume; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_solution_volume AFTER INSERT OR DELETE OR UPDATE ON public."состав_раствора" FOR EACH ROW EXECUTE FUNCTION public.update_solution_total_volume();


--
-- TOC entry 4838 (class 2606 OID 25235)
-- Name: баки баки_id_назначения_бака_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."баки"
    ADD CONSTRAINT "баки_id_назначения_бака_fkey" FOREIGN KEY ("id_назначения_бака") REFERENCES public."назначение_баков"("id_назначения");


--
-- TOC entry 4839 (class 2606 OID 25249)
-- Name: ежедневные_условия ежедневные_условия_id_клапана_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ежедневные_условия"
    ADD CONSTRAINT "ежедневные_условия_id_клапана_fkey" FOREIGN KEY ("id_клапана") REFERENCES public."клапаны"("id_клапана") ON DELETE CASCADE;


--
-- TOC entry 4843 (class 2606 OID 25321)
-- Name: история_дренажа история_дренажа_id_полива_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_дренажа"
    ADD CONSTRAINT "история_дренажа_id_полива_fkey" FOREIGN KEY ("id_полива") REFERENCES public."история_поливов"("id_полива") ON DELETE CASCADE;


--
-- TOC entry 4841 (class 2606 OID 25303)
-- Name: история_поливов история_поливов_id_ежуслов_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_поливов"
    ADD CONSTRAINT "история_поливов_id_ежуслов_fkey" FOREIGN KEY ("id_ежуслов") REFERENCES public."ежедневные_условия"("id_ежуслов");


--
-- TOC entry 4842 (class 2606 OID 25308)
-- Name: история_поливов история_поливов_id_раствора_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_поливов"
    ADD CONSTRAINT "история_поливов_id_раствора_fkey" FOREIGN KEY ("id_раствора") REFERENCES public."история_раствора"("id_раствора");


--
-- TOC entry 4840 (class 2606 OID 25271)
-- Name: история_раствора история_раствора_id_бака_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."история_раствора"
    ADD CONSTRAINT "история_раствора_id_бака_fkey" FOREIGN KEY ("id_бака") REFERENCES public."баки"("id_бака");


--
-- TOC entry 4844 (class 2606 OID 25352)
-- Name: состав_раствора состав_раствора_id_добавка_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."состав_раствора"
    ADD CONSTRAINT "состав_раствора_id_добавка_fkey" FOREIGN KEY ("id_добавки") REFERENCES public."добавки"("id_добавки");


--
-- TOC entry 4845 (class 2606 OID 25347)
-- Name: состав_раствора состав_раствора_id_раствора_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."состав_раствора"
    ADD CONSTRAINT "состав_раствора_id_раствора_fkey" FOREIGN KEY ("id_раствора") REFERENCES public."история_раствора"("id_раствора") ON DELETE CASCADE;


--
-- TOC entry 4836 (class 2606 OID 25216)
-- Name: теплицы_клапаны теплицы_клапаны_id_блока_теплиц_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."теплицы_клапаны"
    ADD CONSTRAINT "теплицы_клапаны_id_блока_теплиц_fkey" FOREIGN KEY ("id_блока_теплиц") REFERENCES public."список_блока_теплиц"("id_блока_теплиц") ON DELETE CASCADE;


--
-- TOC entry 4837 (class 2606 OID 25211)
-- Name: теплицы_клапаны теплицы_клапаны_id_клапана_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."теплицы_клапаны"
    ADD CONSTRAINT "теплицы_клапаны_id_клапана_fkey" FOREIGN KEY ("id_клапана") REFERENCES public."клапаны"("id_клапана") ON DELETE CASCADE;


--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE "баки"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."баки" TO app_user;


--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 225
-- Name: SEQUENCE "баки_id_бака_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."баки_id_бака_seq" TO app_user;


--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE "добавки"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."добавки" TO app_user;


--
-- TOC entry 5008 (class 0 OID 0)
-- Dependencies: 229
-- Name: SEQUENCE "добавки_id_добавка_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."добавки_id_добавка_seq" TO app_user;


--
-- TOC entry 5009 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE "ежедневные_условия"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."ежедневные_условия" TO app_user;


--
-- TOC entry 5011 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE "ежедневные_условия_id_ежуслов_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."ежедневные_условия_id_ежуслов_seq" TO app_user;


--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE "история_дренажа"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."история_дренажа" TO app_user;


--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 235
-- Name: SEQUENCE "история_дренажа_id_дренажа_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."история_дренажа_id_дренажа_seq" TO app_user;


--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE "история_поливов"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."история_поливов" TO app_user;


--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 233
-- Name: SEQUENCE "история_поливов_id_полива_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."история_поливов_id_полива_seq" TO app_user;


--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE "история_раствора"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."история_раствора" TO app_user;


--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 231
-- Name: SEQUENCE "история_раствора_id_раствора_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."история_раствора_id_раствора_seq" TO app_user;


--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE "клапаны"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."клапаны" TO app_user;


--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 220
-- Name: SEQUENCE "клапаны_id_клапана_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."клапаны_id_клапана_seq" TO app_user;


--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE "назначение_баков"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."назначение_баков" TO app_user;


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 223
-- Name: SEQUENCE "назначение_баков_id_назначения_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."назначение_баков_id_назначения_seq" TO app_user;


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 217
-- Name: TABLE "пользователи"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."пользователи" TO app_user;


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 216
-- Name: SEQUENCE "пользователи_id_пользователя_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."пользователи_id_пользователя_seq" TO app_user;


--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE "состав_раствора"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."состав_раствора" TO app_user;


--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 237
-- Name: SEQUENCE "состав_раствора_id_состава_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."состав_раствора_id_состава_seq" TO app_user;


--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 219
-- Name: TABLE "список_блока_теплиц"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."список_блока_теплиц" TO app_user;


--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 218
-- Name: SEQUENCE "список_блока_тепл_id_блока_теплиц_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."список_блока_тепл_id_блока_теплиц_seq" TO app_user;


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE "теплицы_клапаны"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."теплицы_клапаны" TO app_user;


-- Completed on 2026-09-16 10:13:31

--
-- PostgreSQL database dump complete
--

\unrestrict sbSST5p7od3nLsW0w1QDckPAZrrB79eFQ7tltQaRaoxpY1IIusZFZjxgijzmNb7

