"""
Интеграционные тесты generator.py — работа с реальной БД.
"""
from datetime import date

from generator import generate_sensor_data, save_to_database, SCENARIOS, VALVE_OFFSETS


def test_save_to_database_insert(clean_db):
    """Запись реально попадает в БД."""
    conn = clean_db
    cursor = conn.cursor()

    data = generate_sensor_data(1, SCENARIOS[1])
    save_to_database(cursor, 1, data)
    conn.commit()

    cursor.execute("""
        SELECT id_клапана, температура_по_дню, погода,
               ср_влажность, ср_электропроводность, ср_ph
        FROM ежедневные_условия
        WHERE id_клапана = %s AND дата = %s
    """, (1, date.today()))

    row = cursor.fetchone()
    assert row is not None, "Запись не найдена в БД"
    assert row[0] == 1
    assert row[1] == data['temp']
    assert row[2] == data['weather']
    assert row[3] == data['humidity']
    assert row[4] == data['ec']
    assert row[5] == data['ph']


def test_save_to_database_upsert(clean_db):
    """Повторная вставка за тот же день обновляет запись."""
    conn = clean_db
    cursor = conn.cursor()

    data1 = {'temp': 25.0, 'weather': 'солнечно',
             'humidity': 60.0, 'ec': 2.0, 'ph': 6.0}
    data2 = {'temp': 30.0, 'weather': 'жара',
             'humidity': 55.0, 'ec': 2.5, 'ph': 6.3}

    save_to_database(cursor, 1, data1)
    save_to_database(cursor, 1, data2)
    conn.commit()

    cursor.execute("""
        SELECT COUNT(*), MAX(температура_по_дню)
        FROM ежедневные_условия
        WHERE id_клапана = 1
    """)
    count, temp = cursor.fetchone()

    assert count == 1, "UPSERT не должен создавать дубликат"
    assert temp == 30.0, "Запись должна обновиться"


def test_save_to_database_multiple_valves(clean_db):
    """Разные клапаны сохраняются отдельными строками."""
    conn = clean_db
    cursor = conn.cursor()

    for valve_id in VALVE_OFFSETS.keys():
        data = generate_sensor_data(valve_id, SCENARIOS[1])
        save_to_database(cursor, valve_id, data)
    conn.commit()

    cursor.execute("SELECT COUNT(DISTINCT id_клапана) FROM ежедневные_условия")
    assert cursor.fetchone()[0] == len(VALVE_OFFSETS)


def test_save_to_database_weather_saved(clean_db):
    """Погода сохраняется как текст."""
    conn = clean_db
    cursor = conn.cursor()

    data = {'temp': 22.0, 'weather': 'облачно',
            'humidity': 70.0, 'ec': 1.9, 'ph': 6.1}

    save_to_database(cursor, 2, data)
    conn.commit()

    cursor.execute("""
        SELECT погода FROM ежедневные_условия
        WHERE id_клапана = 2 AND дата = %s
    """, (date.today(),))

    result = cursor.fetchone()
    assert result is not None
    assert result[0] == 'облачно'