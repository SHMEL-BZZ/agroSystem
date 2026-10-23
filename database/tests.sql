-- ============================================================
-- ТЕСТ 1. check_additive_stock: нельзя списать больше остатка
-- ============================================================
DO $$
DECLARE
    v_stock_before NUMERIC;
    v_stock_after  NUMERIC;
BEGIN
    SELECT остаток_объем INTO v_stock_before FROM добавки WHERE id_добавки = 1;
    INSERT INTO состав_раствора (id_добавки, количество_добавки) VALUES (1, 1);
    SELECT остаток_объем INTO v_stock_after FROM добавки WHERE id_добавки = 1;
    IF v_stock_after <> v_stock_before - 1 THEN
        RAISE EXCEPTION 'FAIL: check_additive_stock не уменьшил остаток';
    END IF;
    RAISE NOTICE 'TEST PASSED: check_additive_stock работает';
END $$;

-- ============================================================
-- ТЕСТ 2. check_additive_stock: граница
-- ============================================================
DO $$
BEGIN
    BEGIN
        INSERT INTO состав_раствора (id_добавки, количество_добавки) VALUES (1, 999999);
        RAISE EXCEPTION 'FAIL: триггер не сработал';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLERRM LIKE '%FAIL%' THEN RAISE; END IF;
            RAISE NOTICE 'TEST PASSED: check_additive_stock отверг списание 999999';
    END;
END $$;

-- ============================================================
-- ТЕСТ 3. check_password: правильный пароль
-- ============================================================
DO $$
DECLARE
    v_result BOOLEAN;
BEGIN
    SELECT check_password('user1', 'correct_password') INTO v_result;
    IF v_result IS NOT TRUE THEN
        RAISE EXCEPTION 'FAIL: check_password отверг правильный пароль';
    END IF;
    RAISE NOTICE 'TEST PASSED: check_password принимает правильный пароль';
END $$;

-- ============================================================
-- ТЕСТ 4. check_password: неправильный пароль
-- ============================================================
DO $$
DECLARE
    v_result BOOLEAN;
BEGIN
    SELECT check_password('user1', 'wrong_password') INTO v_result;
    IF v_result IS NOT FALSE THEN
        RAISE EXCEPTION 'FAIL: check_password принял неверный пароль';
    END IF;
    RAISE NOTICE 'TEST PASSED: check_password отвергает неверный пароль';
END $$;

-- ============================================================
-- ТЕСТ 5. UNIQUE на login
-- ============================================================
DO $$
BEGIN
    BEGIN
        INSERT INTO пользователи (login, password, email) VALUES ('admin', 'hash', 'admin2@example.com');
        RAISE EXCEPTION 'FAIL: UNIQUE на логин не сработал';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'TEST PASSED: UNIQUE на логин работает';
    END;
END $$;

-- ============================================================
-- ТЕСТ 6. NOT NULL на password
-- ============================================================
DO $$
BEGIN
    BEGIN
        INSERT INTO пользователи (login, password, email) VALUES ('user_null', NULL, 'null@example.com');
        RAISE EXCEPTION 'FAIL: NOT NULL на пароль не сработал';
    EXCEPTION
        WHEN not_null_violation THEN
            RAISE NOTICE 'TEST PASSED: NOT NULL на пароль работает';
    END;
END $$;

-- ============================================================
-- ТЕСТ 7. CHECK на ед_измерения
-- ============================================================
DO $$
BEGIN
    BEGIN
        INSERT INTO добавки (название, ед_измерения, остаток_объем) VALUES ('Тестовая', 'шт', 100);
        RAISE EXCEPTION 'FAIL: CHECK на ед_измерения не сработал';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'TEST PASSED: CHECK на ед_измерения работает';
    END;
END $$;

-- ============================================================
-- ТЕСТ 8. check_additive_not_in_use
-- ============================================================
DO $$
BEGIN
    BEGIN
        DELETE FROM добавки WHERE id_добавки = 1;
        RAISE EXCEPTION 'FAIL: check_additive_not_in_use не сработал';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLERRM LIKE '%FAIL%' THEN RAISE; END IF;
            RAISE NOTICE 'TEST PASSED: check_additive_not_in_use работает';
    END;
END $$;

-- ============================================================
-- ТЕСТ 9. decrease_additive_stock
-- ============================================================
DO $$
DECLARE
    v_before NUMERIC;
    v_after  NUMERIC;
BEGIN
    SELECT остаток_объем INTO v_before FROM добавки WHERE id_добавки = 1;
    INSERT INTO состав_раствора (id_добавки, количество_добавки) VALUES (1, 1);
    SELECT остаток_объем INTO v_after FROM добавки WHERE id_добавки = 1;

    IF v_after <> v_before - 1 THEN
        RAISE EXCEPTION 'FAIL: decrease_additive_stock не сработал (% -> %)', v_before, v_after;
    END IF;
    RAISE NOTICE 'TEST PASSED: decrease_additive_stock работает (% -> %)', v_before, v_after;
END $$;

-- ============================================================
-- ТЕСТ 10. CHECK на состояние клапана
-- ============================================================
DO $$
BEGIN
    BEGIN
        INSERT INTO valves (название, состояние) VALUES ('Тестовый клапан', 'несуществующее_состояние');
        RAISE EXCEPTION 'FAIL: CHECK на состояние клапана не сработал';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'TEST PASSED: CHECK на состояние клапана работает';
    END;
END $$;

-- ============================================================
-- ТЕСТ 11. check_watering_data
-- ============================================================
DO $$
BEGIN
    BEGIN
        INSERT INTO watering_data (id_клапана, объём_воды, длительность) VALUES (1, 0, 10);
        RAISE EXCEPTION 'FAIL: check_watering_data не сработал';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'TEST PASSED: check_watering_data запрещает нулевой объём';
    END;
END $$;

-- ============================================================
-- ТЕСТ 12. auto_hash_password
-- ============================================================
DO $$
DECLARE
    v_hash TEXT;
BEGIN
    INSERT INTO пользователи (login, password, email) VALUES ('hash_test', 'plain_password', 'hash@example.com') RETURNING password INTO v_hash;

    IF v_hash NOT LIKE '$2%' THEN
        RAISE EXCEPTION 'FAIL: auto_hash_password не захешировал пароль (%)', v_hash;
    END IF;
    RAISE NOTICE 'TEST PASSED: auto_hash_password хеширует пароль (bcrypt)';
END $$;

-- ============================================================
-- ТЕСТ 13. FK ON DELETE CASCADE
-- ============================================================
DO $$
DECLARE
    v_confdeltype "char";
BEGIN
    SELECT confdeltype INTO v_confdeltype FROM pg_constraint WHERE conname = 'состав_раствора_id_добавки_fkey';

    IF v_confdeltype <> 'c' THEN
        RAISE EXCEPTION 'FAIL: FK ON DELETE CASCADE отсутствует (confdeltype=%)', v_confdeltype;
    END IF;
    RAISE NOTICE 'TEST PASSED: FK ON DELETE CASCADE на состав_раствора существует';
END $$;

-- ============================================================
-- ТЕСТ 14. Инвариант сид-данных
-- ============================================================
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM пользователи;
    IF v_count < 6 THEN
        RAISE EXCEPTION 'FAIL: пользователей меньше 6 (%)', v_count;
    END IF;
    RAISE NOTICE 'TEST PASSED: пользователей %', v_count;
END $$;