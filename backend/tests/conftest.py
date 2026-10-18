# uv run pytest -v
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.core.database import Base, get_db
from app.main import app as fastapi_app
from sqlalchemy.pool import NullPool
# Імпортуємо всі моделі, щоб Base.metadata знала про всі таблиці
import app.models  # noqa: F401
from app.models.crop import Crop

import sys
import asyncio

import os
from dotenv import load_dotenv

if sys.platform == "win32":
    # Використовуємо SelectorEventLoop для стабільної роботи asyncpg на Windows
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
# ---------------------------------------------------------------------------
# Тестова БД (потрібна база sivay_test_db з активованим PostGIS)
# ---------------------------------------------------------------------------

# Завантажуємо змінні з .env файлу
load_dotenv()

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/sivay_test_db"
)

# ---------------------------------------------------------------------------
# Engine — scope="session"
# Таблиці створюються ОДИН РАЗ для всього тестового запуску.
# Завдяки asyncio_default_fixture_loop_scope="session" в pyproject.toml
# цей engine та всі його з'єднання живуть на одному event loop.
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=NullPool  
)

    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


# ---------------------------------------------------------------------------
# db_session — scope="function"
# Пряма сесія БД для:
#   а) вставки seed-даних (seeded_crop)
#   б) перевірки стану БД у тестах (cascade-тест)
#
# TEARDOWN: після закриття сесії виконує TRUNCATE всіх таблиць.
# async_client залежить від db_session → його teardown завжди відбувається
# раніше, тобто всі HTTP-сесії закриті ДО TRUNCATE.
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine) -> AsyncSession:
    async with AsyncSession(test_engine, expire_on_commit=False) as session:
        yield session
    # ↑ session.close() викликається автоматично при виході з async with

    # Сесія закрита → безпечно очищати таблиці
    async with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(
                text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE')
            )


# ---------------------------------------------------------------------------
# async_client — scope="function"
# HTTP-клієнт, який спілкується з FastAPI через ASGI (без мережі).
#
# ВАЖЛИВО: override_get_db відкриває НОВУ сесію на кожен HTTP-запит,
# а не передає db_session. Це гарантує:
#   - Реалістичну поведінку (endpoint сам керує своєю транзакцією)
#   - Відсутність конфліктів identity map між HTTP та тестовим кодом
#   - Видимість даних між запитами (кожна сесія комітить до реальної БД)
#
# Залежність від db_session забезпечує правильний порядок teardown:
#   async_client teardown (clear overrides) → db_session teardown (TRUNCATE)
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="function")
async def async_client(test_engine) -> AsyncClient:
    async def override_get_db():
        async with AsyncSession(test_engine, expire_on_commit=False) as session:
            yield session

    fastapi_app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=fastapi_app), base_url="http://test"
    ) as client:
        yield client

    fastapi_app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# _cleanup_tables — autouse=True, scope="function"
# Запускається автоматично після КОЖНОГО тесту.
# Очищає всі таблиці у зворотному порядку залежностей (FK-safe).
# Це необхідно, бо async_client не залежить від db_session, тому TRUNCATE
# у db_session.teardown не гарантується для тестів без явного db_session.
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(autouse=True, scope="function")
async def _cleanup_tables(test_engine):
    yield  # тест виконується тут
    async with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(
                text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE')
            )


# ---------------------------------------------------------------------------
# auth_headers — scope="function"
# Реєструє тестового юзера та повертає Bearer-токен.
# Реєстрація та логін виконуються через HTTP (endpoint комітить юзера в БД).
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="function")
async def auth_headers(async_client: AsyncClient) -> dict:
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "testuser@sivay.com", "password": "securepass123"},
    )
    assert reg_response.status_code == 201, (
        f"Не вдалося зареєструвати тестового юзера: {reg_response.text}"
    )

    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "testuser@sivay.com", "password": "securepass123"},
    )
    assert login_response.status_code == 200, (
        f"Не вдалося залогінитись: {login_response.text}"
    )

    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# seeded_crop — scope="function"
# Вставляє культуру напряму через db_session (не через HTTP).
# await db_session.commit() → дані видимі для HTTP-ендпоінтів,
# які відкривають свої власні сесії через override_get_db.
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="function")
async def seeded_crop(db_session: AsyncSession) -> int:
    """Вставляє тестову культуру в crops та повертає її ID."""
    crop = Crop(name="Пшениця тестова")
    db_session.add(crop)
    await db_session.commit()
    await db_session.refresh(crop)
    return crop.id
