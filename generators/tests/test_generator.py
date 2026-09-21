"""
Тесты для generator.py (генератор ежедневных условий).
Часть — unit (без БД), часть — интеграционные (с тестовой БД).
"""
import pytest
from datetime import date

from generator import generate_sensor_data, save_to_database, SCENARIOS, VALVE_OFFSETS


# ============================================================
# UNIT-ТЕСТЫ (без БД)
# ============================================================

@pytest.mark.parametrize("valve_id", list(VALVE_OFFSETS.keys()))
def test_generate_sensor_data_within_ranges(valve_id):
    """Значения не должны выходить за рамки сценария + offset клапана."""
    scenario = SCENARIOS[1]  # Лето
    offset = VALVE_OFFSETS[valve_id]

    for _ in range(200):  # прогоняем много раз, чтобы поймать случайные выбросы
        data = generate_sensor_data(valve_id, scenario)

        assert scenario['temp_range'][0] + offset['temp'] <= data['temp'] \
            <= scenario['temp_range'][1] + offset['temp']

        assert scenario['humidity_range'][0] + offset['humidity'] <= data['humidity'] \
            <= scenario['humidity_range'][1] + offset['humidity']

        assert scenario['ec_range'][0] + offset['ec'] <= data['ec'] \
            <= scenario['ec_range'][1] + offset['ec']

        assert scenario['ph_range'][0] + offset['ph'] <= data['ph'] \
            <= scenario['ph_range'][1] + offset['ph']

        assert data['weather'] in scenario['weather']


def test_generate_sensor_data_keys():
    """Функция возвращает ровно ожидаемый набор ключей."""
    data = generate_sensor_data(1, SCENARIOS[1])
    assert set(data.keys()) == {'temp', 'humidity', 'ec', 'ph', 'weather'}


def test_generate_sensor_data_rounding():
    """Проверяем округление: temp/humidity — 1 знак, ec/ph — 2 знака."""
    data = generate_sensor_data(1, SCENARIOS[1])
    assert round(data['temp'], 1) == data['temp']
    assert round(data['humidity'], 1) == data['humidity']
    assert round(data['ec'], 2) == data['ec']
    assert round(data['ph'], 2) == data['ph']


def test_generate_sensor_data_unknown_valve():
    """Для неизвестного клапана offset = 0 — функция не должна падать."""
    data = generate_sensor_data(999, SCENARIOS[1])
    assert set(data.keys()) == {'temp', 'humidity', 'ec', 'ph', 'weather'}


def test_generate_sensor_data_clamping():
    """
    Проверяем ограничители (clamp):
    temp ≤ 45, humidity ≤ 95, ec ≤ 5.0, ph ≤ 8.0.
    Берём экстремальный сценарий, чтобы гарантированно выйти за пределы.
    """
    crazy_scenario = {
        'temp_range': (44, 46),
        'humidity_range': (93, 95),
        'ec_range': (4.9, 5.1),
        'ph_range': (7.9, 8.0),
        'weather': ['жара'],
        'interval_seconds': 10,
    }

    for _ in range(100):
        data = generate_sensor_data(3, crazy_scenario)
        assert data['temp'] <= 45
        assert data['humidity'] <= 95
        assert data['ec'] <= 5.0
        assert data['ph'] <= 8.0


def test_generate_sensor_data_min_clamping():
    """Проверяем нижние границы clamp."""
    crazy_scenario = {
        'temp_range': (-5, 0),
        'humidity_range': (0, 5),
        'ec_range': (0.0, 0.3),
        'ph_range': (3.0, 4.0),
        'weather': ['холод'],
        'interval_seconds': 10,
    }

    for _ in range(100):
        data = generate_sensor_data(4, crazy_scenario)
        assert data['temp'] >= 0
        assert data['humidity'] >= 20
        assert data['ec'] >= 0.5
        assert data['ph'] >= 4.5


# ============================================================
# ИНТЕГРАЦИОННЫЕ ТЕСТЫ (с БД)
# ============================================================

def test_save_to_database_insert(clean_db):
    """Проверяем, что запись реально попадает в БД."""
    conn = clean_db
    cursor = conn.cursor()

    scenario = SCENARIOS[1]
    data = generate_sensor_data(1, scenario)

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
    """Повторная вставка того же клапана в тот же день обновляет запись."""
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
    assert temp == 30.0, "Запись должна обновиться новым значением"


def test_save_to_database_multiple_valves(clean_db):
    """Разные клапаны сохраняются отдельными строками."""
    conn = clean_db
    cursor = conn.cursor()

    scenario = SCENARIOS[1]
    for valve_id in VALVE_OFFSETS.keys():
        data = generate_sensor_data(valve_id, scenario)
        save_to_database(cursor, valve_id, data)
    conn.commit()

    cursor.execute("SELECT COUNT(DISTINCT id_клапана) FROM ежедневные_условия")
    assert cursor.fetchone()[0] == len(VALVE_OFFSETS)


def test_save_to_database_weather_saved(clean_db):
    """Проверяем, что погода сохраняется как текст, а не NULL."""
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