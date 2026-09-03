import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Real MySQL Server URL (handles '@' in password safely)
MYSQL_PASSWORD = quote_plus("Prathamesh@04")
MYSQL_DATABASE_URL = f"mysql+pymysql://root:{MYSQL_PASSWORD}@localhost:3306/loopback_enterprise"

# Fallback to local SQLite if MySQL server is unreachable
DATABASE_URL = os.getenv("DATABASE_URL", MYSQL_DATABASE_URL)

# Force SQLite databases to resolve to the workspace root directory (outside backend/)
# to prevent Uvicorn reload-on-write loop.
if DATABASE_URL.startswith("sqlite:"):
    prefix = "sqlite:///" if DATABASE_URL.startswith("sqlite:///") else "sqlite://"
    db_path_part = DATABASE_URL[len(prefix):]
    db_filename = os.path.basename(db_path_part) or "loopback.db"
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    DATABASE_URL = f"sqlite:///{os.path.join(root_dir, db_filename)}"

import subprocess
import time

def try_start_mysql_service():
    print("[DATABASE] Attempting to start MySQL service (MySQL80) automatically...")
    try:
        # Run net start MySQL80 to start the service on Windows
        subprocess.run(["cmd", "/c", "net start MySQL80"], capture_output=True, text=True, timeout=10)
    except Exception as e:
        print(f"[DATABASE WARNING] Could not start MySQL80 service: {e}")

connected = False
for attempt in range(1, 6):
    try:
        if DATABASE_URL.startswith("sqlite"):
            engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
            with engine.connect() as conn:
                pass
            print(f"[DATABASE] Successfully connected to SQLite Database ({DATABASE_URL})!")
            connected = True
            break
        else:
            engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
            with engine.connect() as conn:
                pass
            print("[DATABASE] Successfully connected to Live MySQL Server (loopback_enterprise)!")
            connected = True
            break
    except Exception as e:
        print(f"[DATABASE WARNING] Connection attempt {attempt}/5 failed: {e}")
        if not DATABASE_URL.startswith("sqlite") and attempt == 1:
            try_start_mysql_service()
        if attempt < 5:
            print("[DATABASE] Retrying in 2 seconds...")
            time.sleep(2)

if not connected:
    print("[DATABASE WARNING] Could not connect to primary database server. Falling back to SQLite.")
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "loopback.db"))
    DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print(f"[DATABASE] Connected to Fallback SQLite Database ({DATABASE_URL})")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()