"""
Тести модуля авторизації.
Покриває: реєстрацію, логін, неправильний пароль.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient):
    """Успішна реєстрація повертає 201 та email у відповіді."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "new@sivay.com", "password": "strongpass1"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@sivay.com"
    assert "id" in data
    # Пароль не має потрапляти у відповідь
    assert "password" not in data
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient):
    """Повторна реєстрація з тим самим email повертає 400."""
    payload = {"email": "dup@sivay.com", "password": "strongpass1"}
    await async_client.post("/api/v1/auth/register", json=payload)

    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient):
    """Успішний логін повертає JWT-токен."""
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "login@sivay.com", "password": "strongpass1"},
    )
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "login@sivay.com", "password": "strongpass1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient):
    """Логін з неправильним паролем повертає 401."""
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "wrongpass@sivay.com", "password": "correctpass"},
    )
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "wrongpass@sivay.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(async_client: AsyncClient, auth_headers: dict):
    """GET /me повертає профіль поточного юзера при наявному токені."""
    response = await async_client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert "email" in response.json()


@pytest.mark.asyncio
async def test_get_me_unauthenticated(async_client: AsyncClient):
    """GET /me без токена повертає 401."""
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401
