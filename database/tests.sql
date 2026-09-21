-- Проверка 1: триггер check_additive_stock не даёт списать больше остатка
DO $$
BEGIN
    BEGIN
        INSERT INTO public."состав_раствора"
            ("id_раствора", "id_добавки", "количество_добавки", "ед_измерения")
        VALUES (1, 1, 999999, 'кг');
        RAISE EXCEPTION 'ПРОВАЛ: триггер check_additive_stock не сработал';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLERRM LIKE 'Недостаточно добавки%' THEN
                RAISE NOTICE 'OK: check_additive_stock работает';
            ELSE
                RAISE;
            END IF;
    END;
END $$;

-- Проверка 2: check_password принимает правильный пароль
DO $$
BEGIN
    IF NOT public.check_password('admin', 'admin123') THEN
        RAISE EXCEPTION 'ПРОВАЛ: check_password не принимает admin/admin123';
    END IF;
    RAISE NOTICE 'OK: check_password работает';
END $$;

-- Проверка 3: в таблице пользователи минимум 6 записей
DO $$
DECLARE cnt integer;
BEGIN
    SELECT COUNT(*) INTO cnt FROM public."пользователи";
    IF cnt < 6 THEN
        RAISE EXCEPTION 'ПРОВАЛ: ожидалось >=6 пользователей, найдено %', cnt;
    END IF;
    RAISE NOTICE 'OK: пользователей %', cnt;
END $$;