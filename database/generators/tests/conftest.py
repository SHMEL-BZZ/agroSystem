import sys
import os
import pytest
import psycopg2

# Добавляем generators/src/ в sys.path
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)


@pytest.fixture(scope="session")
def db_conn():
    """Подключение к тестовой БД (env-переменные задаёт workflow)."""
    from config import get_db_config
    conn = psycopg2.connect(**get_db_config())
    yield conn
    conn.close()


@pytest.fixture(scope="function")
def clean_db(db_conn):
    """
    Очистка и заливка тестовых данных перед каждым тестом.
    Сбрасывает возможную «сломанную» транзакцию rollback-ом.
    """
    db_conn.rollback()

    cursor = db_conn.cursor()
    try:
        # 1. Очищаем всё, что используем. RESTART IDENTITY сбросит sequences.
        cursor.execute("""
            TRUNCATE TABLE 
                ежедневные_условия,
                история_дренажа,
                история_поливов,
                клапаны
            RESTART IDENTITY CASCADE;
        """)

        # 2. Клапаны (родительская таблица для ежедневные_условия)
        cursor.execute("""
            INSERT INTO клапаны 
                (id_клапана, производитель, модель, тип_конструкции, диаметр, состояние) 
            VALUES
                (1, 'TestCorp', 'Model-A', 'электромагнитный', 10.50, 'работает'),
                (2, 'TestCorp', 'Model-B', 'шаровый',          15.00, 'работает'),
                (3, 'TestCorp', 'Model-C', 'дисковый',         20.00, 'работает'),
                (4, 'TestCorp', 'Model-D', 'игольчатый',       12.75, 'работает');
        """)

        # 3. Поливы для теста дренажа
        cursor.execute("""
            INSERT INTO история_поливов (id_полива, объем_воды) VALUES
            (1, 100.0), (2, 200.0), (3, 150.0);
        """)

        db_conn.commit()
    except Exception:
        db_conn.rollback()
        raise
    finally:
        cursor.close()

    yield db_conn

    # Чистим после теста
    db_conn.rollback()
    cursor = db_conn.cursor()
    try:
        cursor.execute("""
            TRUNCATE TABLE ежедневные_условия, история_дренажа
            RESTART IDENTITY CASCADE;
        """)
        db_conn.commit()
    except Exception:
        db_conn.rollback()
        raise
    finally:
        cursor.close()