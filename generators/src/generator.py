import psycopg2
import random
from datetime import datetime, date
import time

from config import get_db_config  

SCENARIOS = {
    1: {
        'name': 'Лето',
        'temp_range': (25, 35),
        'humidity_range': (50, 70),
        'ec_range': (2.0, 2.8),
        'ph_range': (6.0, 6.5),
        'weather': ['солнечно', 'солнечно', 'солнечно', 'облачно', 'жара'],
        'interval_seconds': 60 * 60 * 24
    },
    2: {
        'name': 'Осень / Весна',
        'temp_range': (15, 25),
        'humidity_range': (60, 80),
        'ec_range': (1.8, 2.4),
        'ph_range': (5.8, 6.3),
        'weather': ['облачно', 'переменная облачность', 'дождь', 'солнечно', 'пасмурно'],
        'interval_seconds': 60 * 60 * 24
    },
    3: {
        'name': 'Тестовый режим',
        'temp_range': (20, 30),
        'humidity_range': (55, 75),
        'ec_range': (1.8, 2.6),
        'ph_range': (5.8, 6.4),
        'weather': ['солнечно', 'облачно', 'дождь'],
        'interval_seconds': 10
    }
}

VALVE_OFFSETS = {
    1: {'temp': +1, 'humidity': -2, 'ec': +0.1, 'ph': +0.1},
    2: {'temp': +2, 'humidity': -5, 'ec': -0.1, 'ph': +0.2},
    3: {'temp': +3, 'humidity': -3, 'ec': +0.2, 'ph': -0.1},
    4: {'temp': -1, 'humidity': +3, 'ec': -0.1, 'ph': +0.1},
}

def choose_scenario():
    print("\nГЕНЕРАТОР ДАННЫХ - ВЫБОР СЦЕНАРИЯ")
    print("  1. Лето (жарко, солнечно)")
    print("  2. Осень / Весна (умеренно)")
    print("  3. Тестовый режим (каждые 10 сек)")
    
    while True:
        try:
            choice = int(input("Выберите сценарий (1-3): "))
            if choice in SCENARIOS:
                return choice
            print("Введите число от 1 до 3")
        except ValueError:
            print("Введите число")

def generate_sensor_data(valve_id, scenario_config):
    temp_min, temp_max = scenario_config['temp_range']
    hum_min, hum_max = scenario_config['humidity_range']
    ec_min, ec_max = scenario_config['ec_range']
    ph_min, ph_max = scenario_config['ph_range']
    
    temp = random.uniform(temp_min, temp_max)
    humidity = random.uniform(hum_min, hum_max)
    ec = random.uniform(ec_min, ec_max)
    ph = random.uniform(ph_min, ph_max)
    
    offset = VALVE_OFFSETS.get(valve_id, {'temp': 0, 'humidity': 0, 'ec': 0, 'ph': 0})
    temp += offset['temp']
    humidity += offset['humidity']
    ec += offset['ec']
    ph += offset['ph']
    
    temp = max(0, min(45, temp))
    humidity = max(20, min(95, humidity))
    ec = max(0.5, min(5.0, ec))
    ph = max(4.5, min(8.0, ph))
    
    weather = random.choice(scenario_config['weather'])
    
    return {
        'temp': round(temp, 1),
        'humidity': round(humidity, 1),
        'ec': round(ec, 2),
        'ph': round(ph, 2),
        'weather': weather
    }

def save_to_database(cursor, valve_id, data):
    query = """
        INSERT INTO ежедневные_условия 
        (id_клапана, дата, температура_по_дню, погода, ср_влажность, ср_электропроводность, ср_ph)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id_клапана, дата) DO UPDATE SET
            температура_по_дню = EXCLUDED.температура_по_дню,
            погода = EXCLUDED.погода,
            ср_влажность = EXCLUDED.ср_влажность,
            ср_электропроводность = EXCLUDED.ср_электропроводность,
            ср_ph = EXCLUDED.ср_ph;
    """
    cursor.execute(query, (
        valve_id, date.today(), data['temp'], data['weather'],
        data['humidity'], data['ec'], data['ph']
    ))


def main():
    scenario_choice = choose_scenario()
    scenario_config = SCENARIOS[scenario_choice]
    interval = scenario_config['interval_seconds']
    scenario_name = scenario_config['name']

    print(f"\nГенератор запущен в режиме: {scenario_name}")
    print(f"Интервал: {interval} секунд")

    conn = psycopg2.connect(**get_db_config())
    cursor = conn.cursor()
    cycle_count = 0

    try:
        while True:
            cycle_count += 1
            print(f"\nЦикл {cycle_count} ({datetime.now().strftime('%H:%M:%S')})")

            for valve_id in VALVE_OFFSETS.keys():
                data = generate_sensor_data(valve_id, scenario_config)
                save_to_database(cursor, valve_id, data)
                print(f"Сохранено: клапан {valve_id}")

            conn.commit()
            time.sleep(interval)

    except KeyboardInterrupt:
        print(f"\nОстановлен. Циклов: {cycle_count}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()