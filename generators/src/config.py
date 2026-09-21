import os

def get_db_config():
    """Возвращает конфиг БД из переменных окружения или дефолтный"""
    return {
        'host': os.getenv('DB_HOST', '172.25.25.97'),
        'port': int(os.getenv('DB_PORT', 5432)),
        'database': os.getenv('DB_NAME', 'watering'),
        'user': os.getenv('DB_USER', 'app_user'),
        'password': os.getenv('DB_PASSWORD', 'AppPassword123!')
    }