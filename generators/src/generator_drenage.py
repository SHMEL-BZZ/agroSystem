import psycopg2
import random
from config import get_db_config


def calculate_drainage_volume(polyv_volume):
    """Возвращает объём дренажа для одного полива (литры)"""
    volume = float(polyv_volume)
    drainage_percent = random.uniform(0.0, 0.03)
    return round(volume * drainage_percent, 1)


def generate_drainage_for_db(cursor):
    """Находит поливы без дренажа и создаёт записи. Возвращает список (id, объём)."""
    cursor.execute("""
        SELECT id_полива, объем_воды 
        FROM история_поливов 
        WHERE id_полива NOT IN (
            SELECT DISTINCT id_полива FROM история_дренажа
        )
        ORDER BY id_полива;
    """)
    polyvy = cursor.fetchall()

    results = []
    for polyv_id, volume in polyvy:
        drainage = calculate_drainage_volume(volume)
        cursor.execute("""
            INSERT INTO история_дренажа (id_полива, объем_дренажа)
            VALUES (%s, %s)
        """, (polyv_id, drainage))
        results.append((polyv_id, drainage))
    return results


def main():
    print("\nГЕНЕРАТОР ДРЕНАЖА")
    print("=" * 40)

    conn = psycopg2.connect(**get_db_config())
    cursor = conn.cursor()
    try:
        results = generate_drainage_for_db(cursor)
        conn.commit()
        if not results:
            print("Все поливы уже имеют дренаж.")
        else:
            for pid, vol in results:
                print(f"  Полив {pid}: {vol} л")
            print(f"\nГотово! Обработано {len(results)} поливов.")
    except Exception as e:
        print(f"Ошибка: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()