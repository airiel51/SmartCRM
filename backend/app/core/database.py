import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("smartcrm.database")

# Test connection or fallback
engine = None
SessionLocal = None

try:
    if settings.USE_SQLITE_FALLBACK:
        # Check if Postgres can be reached, or use SQLite
        try:
            test_engine = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 2}
            )
            with test_engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL database.")
            engine = test_engine
        except Exception as e:
            logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite for local development: {settings.SQLITE_DB_PATH}")
            engine = create_engine(
                settings.SQLITE_DB_PATH,
                connect_args={"check_same_thread": False}
            )
    else:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
except Exception as err:
    logger.error(f"Error initializing database engine: {err}. Defaulting to SQLite.")
    engine = create_engine(
        settings.SQLITE_DB_PATH,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
