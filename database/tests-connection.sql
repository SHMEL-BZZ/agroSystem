--Тест 1: уникальность login
DO $$ BEGIN
  INSERT INTO users(login, password) VALUES('dup', 'x');
  INSERT INTO users(login, password) VALUES('dup', 'y');
  RAISE EXCEPTION 'Ожидалась ошибка уникальности';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'OK: unique_violation';
END $$;

--Тест 2: CHECK на email
DO $$ BEGIN
  INSERT INTO users(login, email) VALUES('u2', 'not-an-email');
  RAISE EXCEPTION 'Ожидалась ошибка CHECK';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'OK: check_violation';
END $$;

--Тест 3: pgcrypto работает
SELECT crypt('secret', gen_salt('bf')) IS NOT NULL AS pgcrypto_ok;