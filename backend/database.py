import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# En local usa SQLite (samy.db). En despliegue (Render/Railway) puedes
# definir la variable de entorno DATABASE_URL apuntando a PostgreSQL,
# por ejemplo: postgresql://usuario:clave@host:5432/samy_db
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./samy.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
