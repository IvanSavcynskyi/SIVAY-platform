"""
Тести модуля Fields (полів).
Покриває: створення поля (з авторозрахунком площі), список полів,
захист ендпоінтів від неавторизованих запитів.
"""
import pytest
from httpx import AsyncClient

# ---------------------------------------------------------------------------
# Тестові GeoJSON-дані (прямокутник ~0.1° × 0.1° в центральній Україні)
# ---------------------------------------------------------------------------
VALID_FIELD_GEOJSON = {
    "type": "Polygon",
    "coordinates": [
        [
            [30.0, 50.0],
            [30.1, 50.0],
            [30.1, 50.1],
            [30.0, 50.1],
            [30.0, 50.0],
        ]
    ],
}


@pytest.mark.asyncio
async def test_create_field_success(async_client: AsyncClient, auth_headers: dict):
    """
    POST /fields/ з валідним GeoJSON:
    - статус 201
    - площа (total_area) розрахована PostGIS (не null, > 0)
    - поле прив'язано до поточного юзера
    """
    payload = {
        "name": "Тестове поле Альфа",
        "geom": VALID_FIELD_GEOJSON,
        "region": "Київська область",
    }
    response = await async_client.post(
        "/api/v1/fields/", json=payload, headers=auth_headers
    )
    assert response.status_code == 201, response.text

    data = response.json()
    assert data["name"] == "Тестове поле Альфа"
    assert data["region"] == "Київська область"
    assert "id" in data
    assert "user_id" in data

    # Площа має бути розрахована автоматично PostGIS (> 0 га)
    assert data["total_area"] is not None
    assert data["total_area"] > 0


@pytest.mark.asyncio
async def test_create_field_total_area_is_computed(
    async_client: AsyncClient, auth_headers: dict
):
    """
    Перевірка, що total_area розраховується PostGIS незалежно від клієнта.
    Клієнт НЕ передає total_area — воно має з'явитись у відповіді.
    """
    payload = {"name": "Поле без площі", "geom": VALID_FIELD_GEOJSON}
    response = await async_client.post(
        "/api/v1/fields/", json=payload, headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["total_area"] is not None
    assert response.json()["total_area"] > 0


@pytest.mark.asyncio
async def test_list_fields_authenticated(async_client: AsyncClient, auth_headers: dict):
    """GET /fields/ повертає список полів поточного юзера."""
    # Спершу створимо два поля
    for i in range(2):
        await async_client.post(
            "/api/v1/fields/",
            json={"name": f"Поле {i}", "geom": VALID_FIELD_GEOJSON},
            headers=auth_headers,
        )

    response = await async_client.get("/api/v1/fields/", headers=auth_headers)
    assert response.status_code == 200
    fields = response.json()
    assert isinstance(fields, list)
    assert len(fields) == 2


@pytest.mark.asyncio
async def test_list_fields_unauthenticated(async_client: AsyncClient):
    """GET /fields/ без токена повертає 401."""
    response = await async_client.get("/api/v1/fields/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_field_by_id(async_client: AsyncClient, auth_headers: dict):
    """GET /fields/{id} повертає деталі конкретного поля."""
    create_resp = await async_client.post(
        "/api/v1/fields/",
        json={"name": "Деталізоване поле", "geom": VALID_FIELD_GEOJSON},
        headers=auth_headers,
    )
    field_id = create_resp.json()["id"]

    response = await async_client.get(
        f"/api/v1/fields/{field_id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == field_id


@pytest.mark.asyncio
async def test_get_field_not_found(async_client: AsyncClient, auth_headers: dict):
    """GET /fields/99999 для неіснуючого поля повертає 404."""
    response = await async_client.get("/api/v1/fields/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_field(async_client: AsyncClient, auth_headers: dict):
    """DELETE /fields/{id} повертає 204 і поле зникає зі списку."""
    create_resp = await async_client.post(
        "/api/v1/fields/",
        json={"name": "Поле для видалення", "geom": VALID_FIELD_GEOJSON},
        headers=auth_headers,
    )
    field_id = create_resp.json()["id"]

    delete_resp = await async_client.delete(
        f"/api/v1/fields/{field_id}", headers=auth_headers
    )
    assert delete_resp.status_code == 204

    # Після видалення поле недоступне
    get_resp = await async_client.get(
        f"/api/v1/fields/{field_id}", headers=auth_headers
    )
    assert get_resp.status_code == 404
