import sys
import os
import pytest
import psycopg2

# generators/tests/conftest.py
# Добавляем generators/src/ в sys.path,
# чтобы работали импорты:
#   from generator import ...
#   from generator_drenage import ...
#   from config import get_db_config
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)


@pytest.fixture(scope="session")
def db_conn():
    """Подключение к тестовой БД (читает env-переменные)."""
    from config import get_db_config
    conn = psycopg2.connect(**get_db_config())
    yield conn
    conn.close()


@pytest.fixture(scope="function")
def clean_db(db_conn):
    """Очистка и заполнение тестовыми данными."""
    cursor = db_conn.cursor()
    try:
        cursor.execute("""
            TRUNCATE TABLE ежедневные_условия, история_поливов, история_дренажа
            RESTART IDENTITY CASCADE;
        """)
        cursor.execute("""
            INSERT INTO история_поливов (id_полива, объем_воды) VALUES
            (1, 100.0), (2, 200.0), (3, 150.0);
        """)
        db_conn.commit()
    finally:
        cursor.close()

    yield db_conn

    cursor = db_conn.cursor()
    try:
        cursor.execute("""
            TRUNCATE TABLE ежедневные_условия, история_дренажа
            RESTART IDENTITY CASCADE;
        """)
        db_conn.commit()
    finally:
        cursor.close()