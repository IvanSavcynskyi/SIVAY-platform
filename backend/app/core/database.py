from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# --- Async Engine ---
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=True,
)

# --- Session Factory ---
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# --- Declarative Base for ORM Models ---
class Base(DeclarativeBase):
    pass


# --- FastAPI Dependency ---
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
