"""
Интеграционные тесты generator_drenage.py.
"""
from generator_drenage import generate_drainage_for_db


def test_generate_drainage_creates_records(clean_db):
    """Для 3 тестовых поливов создаются 3 записи дренажа."""
    conn = clean_db
    cursor = conn.cursor()

    results = generate_drainage_for_db(cursor)
    conn.commit()

    assert len(results) == 3
    ids = sorted(r[0] for r in results)
    assert ids == [1, 2, 3]

    cursor.execute("SELECT COUNT(*) FROM история_дренажа")
    assert cursor.fetchone()[0] == 3


def test_generate_drainage_no_duplicates(clean_db):
    """Повторный запуск не добавляет дубликаты."""
    conn = clean_db
    cursor = conn.cursor()

    generate_drainage_for_db(cursor)
    conn.commit()

    second_run = generate_drainage_for_db(cursor)
    conn.commit()

    assert second_run == []

    cursor.execute("SELECT COUNT(*) FROM история_дренажа")
    assert cursor.fetchone()[0] == 3


def test_generate_drainage_values_positive(clean_db):
    """Все сохранённые значения дренажа неотрицательные."""
    conn = clean_db
    cursor = conn.cursor()

    generate_drainage_for_db(cursor)
    conn.commit()

    cursor.execute("SELECT объем_дренажа FROM история_дренажа")
    for (value,) in cursor.fetchall():
        assert value >= 0.0


def test_generate_drainage_empty_db(clean_db):
    """Если нет поливов — пустой результат."""
    conn = clean_db
    cursor = conn.cursor()

    cursor.execute("TRUNCATE TABLE история_поливов CASCADE;")
    conn.commit()

    results = generate_drainage_for_db(cursor)
    conn.commit()

    assert results == []


def test_generate_drainage_skips_existing(clean_db):
    """Полив с уже существующим дренажом не обрабатывается."""
    conn = clean_db
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO история_дренажа (id_полива, объем_дренажа)
        VALUES (1, 5.0);
    """)
    conn.commit()

    results = generate_drainage_for_db(cursor)
    conn.commit()

    processed_ids = [r[0] for r in results]
    assert 1 not in processed_ids
    assert sorted(processed_ids) == [2, 3]


def test_generate_drainage_links_correctly(clean_db):
    """Все id_полива в дренаже ссылаются на существующие поливы."""
    conn = clean_db
    cursor = conn.cursor()

    generate_drainage_for_db(cursor)
    conn.commit()

    cursor.execute("""
        SELECT COUNT(*) FROM история_дренажа д
        LEFT JOIN история_поливов п ON д.id_полива = п.id_полива
        WHERE п.id_полива IS NULL;
    """)
    orphans = cursor.fetchone()[0]
    assert orphans == 0