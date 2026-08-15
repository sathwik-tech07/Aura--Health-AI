from pathlib import Path
import sqlite3

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "aurahealth.db"
DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_sqlite_migrations():
    """
    Safely inspects existing SQLite schema and adds any missing columns
    (e.g., 'role' in users, 'user_id' in appointments/conversations) without data loss.
    """
    try:
        conn = sqlite3.connect(DB_PATH.as_posix())
        cursor = conn.cursor()

        # Check users table columns
        cursor.execute("PRAGMA table_info(users);")
        user_cols = [row[1] for row in cursor.fetchall()]
        if "role" not in user_cols and len(user_cols) > 0:
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(40) NOT NULL DEFAULT 'patient';")
            conn.commit()
            print("[DB Migration] Added 'role' column to users table.")

        # Check appointments table columns
        cursor.execute("PRAGMA table_info(appointments);")
        appt_cols = [row[1] for row in cursor.fetchall()]
        if "user_id" not in appt_cols and len(appt_cols) > 0:
            cursor.execute("ALTER TABLE appointments ADD COLUMN user_id INTEGER;")
            conn.commit()
            print("[DB Migration] Added 'user_id' column to appointments table.")

        # Check conversations table columns
        cursor.execute("PRAGMA table_info(conversations);")
        conv_cols = [row[1] for row in cursor.fetchall()]
        if "user_id" not in conv_cols and len(conv_cols) > 0:
            cursor.execute("ALTER TABLE conversations ADD COLUMN user_id INTEGER;")
            conn.commit()
            print("[DB Migration] Added 'user_id' column to conversations table.")

        conn.close()
    except Exception as e:
        print(f"[DB Migration Warning] Auto-migration check: {e}")


def init_db() -> None:
    from app import models

    Base.metadata.create_all(bind=engine)
    run_sqlite_migrations()
