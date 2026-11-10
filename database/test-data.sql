-- ============================================================
-- Тестовые данные для модуля watering
-- Запуск:
--   psql -h localhost -U app_user -d watering \
--         -v ON_ERROR_STOP=1 -f database/test-data.sql
-- ============================================================

\set ON_ERROR_STOP on

-- Пользователи (минимум 6)
INSERT INTO users (login, password, email) VALUES
    ('admin',    crypt('admin_pass',    gen_salt('bf')), 'admin@example.com'),
    ('user1',    crypt('correct_password', gen_salt('bf')), 'user1@example.com'),
    ('user2',    crypt('user2_pass',   gen_salt('bf')), 'user2@example.com'),
    ('user3',    crypt('user3_pass',   gen_salt('bf')), 'user3@example.com'),
    ('agronom',  crypt('agro_pass',    gen_salt('bf')), 'agro@example.com'),
    ('operator', crypt('oper_pass',    gen_salt('bf')), 'oper@example.com')
ON CONFLICT (login) DO NOTHING;

-- Добавки (ед_измерения: 'кг' или 'л')
INSERT INTO добавки (название, ед_измерения, остаток) VALUES
    ('Азотное удобрение', 'кг', 10.00),
    ('Калийное удобрение', 'кг', 20.00),
    ('Кислота',           'л',  5.00)
ON CONFLICT DO NOTHING;

-- Клапаны (состояние: 'работает', 'отключен', 'аварийное')
INSERT INTO valves (название, состояние) VALUES
    ('Клапан 1', 'работает'),
    ('Клапан 2', 'отключен'),
    ('Клапан 3', 'аварийное')
ON CONFLICT DO NOTHING;

-- Растворы
INSERT INTO solutions (название, общий_объём) VALUES
    ('Раствор A', 100.00),
    ('Раствор B', 200.00)
ON CONFLICT DO NOTHING;

-- Состав раствора (для триггера decrease_additive_stock)
INSERT INTO состав_раствора (id_раствора, id_добавка, количество) VALUES
    (1, 1, 1.00),
    (1, 2, 2.00),
    (2, 3, 0.50)
ON CONFLICT DO NOTHING;

-- Ежедневные условия
INSERT INTO ежедневные_условия (id_клапана, дата, температура, влажность, ес, ph) VALUES
    (1, '2025-06-15', 25.0, 60.0, 1.8, 6.0),
    (1, '2025-06-16', 26.0, 62.0, 1.9, 6.1),
    (2, '2025-06-15', 24.0, 58.0, 1.7, 5.9)
ON CONFLICT DO NOTHING;