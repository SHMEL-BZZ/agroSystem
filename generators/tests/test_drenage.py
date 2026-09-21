"""
Тесты для generator_drenage.py.
"""
import pytest
from decimal import Decimal

from generator_drenage import calculate_drainage_volume, generate_drainage_for_db


# ============================================================
# UNIT-ТЕСТЫ (без БД)
# ============================================================

@pytest.mark.parametrize("volume", [0.0, 10.0, 100.0, 1000.0, 10000.0])
def test_calculate_drainage_volume_range(volume):
    """
    Дренаж в диапазоне 0–3 % от объёма (текущая формула).
    Если поменяете формулу на 10–35 %, обновите границы здесь.
    """
    for _ in range(100):
        result = calculate_drainage_volume(volume)
        # +0.05 — запас на округление до 1 знака
        assert 0.0 <= result <= volume * 0.03 + 0.05


def test_calculate_drainage_volume_returns_float():
    assert isinstance(calculate_drainage_volume(100), float)


def test_calculate_drainage_volume_decimal_input():
    """Функция должна принимать Decimal и не падать."""
    result = calculate_drainage_volume(Decimal("150.5"))
    assert isinstance(result, float)
    assert result >= 0.0


def test_calculate_drainage_volume_zero():
    """При нулевом объёме дренаж тоже 0."""
    assert calculate_drainage_volume(0) == 0.0


def test_calculate_drainage_volume_rounding():
    """Результат округлён до 1 знака."""
    result = calculate_drainage_volume(123.45)
    assert round(result, 1) == result


# ============================================================
# ИНТЕГРАЦИОННЫЕ ТЕСТЫ (с БД)
# ============================================================

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

    assert second_run == [], "Повторный запуск не должен ничего создавать"

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
    """Если нет поливов без дренажа — возвращается пустой список."""
    conn = clean_db
    cursor = conn.cursor()

    cursor.execute("TRUNCATE TABLE история_поливов RESTART IDENTITY CASCADE;")
    conn.commit()

    results = generate_drainage_for_db(cursor)
    conn.commit()

    assert results == []


def test_generate_drainage_skips_existing(clean_db):
    """Полив с уже существующим дренажом не обрабатывается повторно."""
    conn = clean_db
    cursor = conn.cursor()

    # Вручную добавляем дренаж для полива №1
    cursor.execute("""
        INSERT INTO история_дренажа (id_полива, объем_дренажа)
        VALUES (1, 5.0);
    """)
    conn.commit()

    results = generate_drainage_for_db(cursor)
    conn.commit()

    processed_ids = [r[0] for r in results]
    assert 1 not in processed_ids, "Полив с существующим дренажом не должен обрабатываться"
    assert sorted(processed_ids) == [2, 3]


def test_generate_drainage_links_correctly(clean_db):
    """id_полива в дренаже соответствует существующим поливам."""
    conn = clean_db
    cursor = conn.cursor()

    generate_drainage_for_db(cursor)
    conn.commit()

    # Проверяем, что все id_полива в дренаже есть в история_поливов
    cursor.execute("""
        SELECT COUNT(*) FROM история_дренажа д
        LEFT JOIN история_поливов п ON д.id_полива = п.id_полива
        WHERE п.id_полива IS NULL;
    """)
    orphans = cursor.fetchone()[0]
    assert orphans == 0, f"Найдены записи дренажа без полива: {orphans}"