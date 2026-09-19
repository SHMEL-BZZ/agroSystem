import psycopg2
import random

DB_CONFIG = {
    'host': '172.25.25.97',
    'port': 5432,
    'database': 'watering',
    'user': 'app_user',
    'password': 'AppPassword123!'
}

def generate_drainage(polyv_volume):
    """
    Генерирует общий объём дренажа для одного полива
    
    Параметры:
        polyv_volume (float): Объём воды в поливе (литры)
    
    Возвращает:
        float: Объём дренажа (литры)
    """
    # Преобразуем Decimal в float
    volume = float(polyv_volume)
    
    # Дренаж: 10-35% от объёма полива
    drainage_percent = random.uniform(0.0, 0.03)
    drainage_volume = volume * drainage_percent
    
    return round(drainage_volume, 1)

def main():
    print("\nГЕНЕРАТОР ДРЕНАЖА (средние значения)")
    print("=" * 40)
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Находим поливы без дренажа
        cursor.execute("""
            SELECT id_полива, объем_воды 
            FROM история_поливов 
            WHERE id_полива NOT IN (
                SELECT DISTINCT id_полива FROM история_дренажа
            )
            ORDER BY id_полива;
        """)
        
        polyvy = cursor.fetchall()
        
        if not polyvy:
            print("Все поливы уже имеют дренаж.")
            cursor.close()
            conn.close()
            return
        
        print(f"Найдено поливов без дренажа: {len(polyvy)}")
        print("Генерация...\n")
        
        for polyv_id, volume in polyvy:
            drainage = generate_drainage(volume)
            
            cursor.execute("""
                INSERT INTO история_дренажа (id_полива, объем_дренажа)
                VALUES (%s, %s)
            """, (polyv_id, drainage))
            
            print(f"  Полив {polyv_id}: {drainage} л (дренаж) из {float(volume)} л (полив)")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\nГотово! Дренаж добавлен для всех поливов.")
        
    except Exception as e:
        print(f"Ошибка: {e}")

if __name__ == "__main__":
    main()