import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generator import generate_sensor_data, save_to_database, SCENARIOS

# ==========================================
# 1. РЕАЛЬНАЯ РЕАЛИЗАЦИЯ (Курсор БД)
# ==========================================
class RealDatabaseCursor:
    """Имитация реального курсора базы данных (как psycopg2)"""
    def execute(self, query, params):
        print(f"[БД] Выполнен реальный SQL-запрос. Данные: {params}")

# ==========================================
# 2. ПОДМЕНА РЕАЛИЗАЦИИ (Тестовая заглушка)
# ==========================================
class MockDatabaseCursor:
    """Тестовая заглушка: вместо БД просто сохраняет данные в список"""
    def __init__(self):
        self.saved_data = []
        
    def execute(self, query, params):
        self.saved_data.append(params)
        print(f"[MOCK] Заглушка сохранила данные в память: {params}")

# ==========================================
# 3. ОДИН ПОТРЕБИТЕЛЬ (Функция для запуска)
# ==========================================
def run_save_test(cursor, cursor_name):
    print(f"\n--- Проверка с реализацией: {cursor_name} ---")
    scenario = SCENARIOS[1] # Берем сценарий "Лето"
    
    # 1. Генерируем данные (код модуля не меняется)
    data = generate_sensor_data(valve_id=1, scenario_config=scenario)
    print(f"Сгенерированные данные: {data}")
    
    # 2. Сохраняем через переданный курсор (код модуля не меняется)
    save_to_database(cursor, valve_id=1, data=data)

if __name__ == "__main__":
    # Подключаем реальную реализацию
    real_cursor = RealDatabaseCursor()
    run_save_test(real_cursor, "REAL DB (PostgreSQL)")
    
    # Подключаем заглушку
    mock_cursor = MockDatabaseCursor()
    run_save_test(mock_cursor, "MOCK DB (Заглушка)")
    
    print("\n[УСПЕХ] Код потребителя (generate_sensor_data) не менялся!")