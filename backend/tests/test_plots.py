"""
Тести модуля Plots та PostGIS-валідації ST_Within.

Ключова логіка:
- Ділянка (Plot) має СУВОРО знаходитись всередині батьківського поля (Field).
- Якщо координати виходять за межі поля → 400 Bad Request.

Структура URL (вкладений ресурс):
  POST   /api/v1/fields/{field_id}/plots/
  GET    /api/v1/fields/{field_id}/plots/
  GET    /api/v1/fields/{field_id}/plots/{plot_id}
  DELETE /api/v1/fields/{field_id}/plots/{plot_id}
"""
import pytest
from httpx import AsyncClient

# ---------------------------------------------------------------------------
# Тестові GeoJSON-дані
# ---------------------------------------------------------------------------

# Батьківське поле: прямокутник 30.0–30.1 / 50.0–50.1
FIELD_GEOJSON = {
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

# Валідна ділянка: добре всередині поля (відступ 0.01° з кожного боку)
VALID_PLOT_GEOJSON = {
    "type": "Polygon",
    "coordinates": [
        [
            [30.01, 50.01],
            [30.09, 50.01],
            [30.09, 50.09],
            [30.01, 50.09],
            [30.01, 50.01],
        ]
    ],
}

# Невалідна ділянка: повністю поза межами поля
INVALID_PLOT_GEOJSON = {
    "type": "Polygon",
    "coordinates": [
        [
            [31.0, 51.0],
            [31.1, 51.0],
            [31.1, 51.1],
            [31.0, 51.1],
            [31.0, 51.0],
        ]
    ],
}


# ---------------------------------------------------------------------------
# Допоміжна функція: створити поле та повернути його ID
# ---------------------------------------------------------------------------
async def _create_field(client: AsyncClient, headers: dict) -> int:
    resp = await client.post(
        "/api/v1/fields/",
        json={"name": "Батьківське поле", "geom": FIELD_GEOJSON},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# Тести
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_valid_plot(async_client: AsyncClient, auth_headers: dict):
    """
    Ділянка всередині поля:
    - ST_Within повертає True
    - Сервер відповідає 201
    - total_area розрахована PostGIS
    """
    field_id = await _create_field(async_client, auth_headers)

    response = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": VALID_PLOT_GEOJSON},
        headers=auth_headers,
    )
    assert response.status_code == 201, response.text

    data = response.json()
    assert data["field_id"] == field_id
    assert data["total_area"] is not None
    assert data["total_area"] > 0


@pytest.mark.asyncio
async def test_create_invalid_plot_outside_field(
    async_client: AsyncClient, auth_headers: dict
):
    """
    Ділянка поза межами поля:
    - ST_Within повертає False
    - Сервер відповідає 400 Bad Request
    """
    field_id = await _create_field(async_client, auth_headers)

    response = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": INVALID_PLOT_GEOJSON},
        headers=auth_headers,
    )
    assert response.status_code == 400, (
        f"Очікували 400, отримали {response.status_code}: {response.text}"
    )
    # Відповідь має містити опис помилки
    assert "detail" in response.json()


@pytest.mark.asyncio
async def test_list_plots_by_field(async_client: AsyncClient, auth_headers: dict):
    """GET /fields/{field_id}/plots/ повертає всі ділянки поля."""
    field_id = await _create_field(async_client, auth_headers)

    # Додаємо дві валідні ділянки
    for _ in range(2):
        await async_client.post(
            f"/api/v1/fields/{field_id}/plots/",
            json={"geom": VALID_PLOT_GEOJSON},
            headers=auth_headers,
        )

    response = await async_client.get(
        f"/api/v1/fields/{field_id}/plots/", headers=auth_headers
    )
    assert response.status_code == 200
    plots = response.json()
    assert isinstance(plots, list)
    assert len(plots) == 2


@pytest.mark.asyncio
async def test_get_plot_by_id(async_client: AsyncClient, auth_headers: dict):
    """GET /fields/{field_id}/plots/{plot_id} повертає конкретну ділянку."""
    field_id = await _create_field(async_client, auth_headers)

    create_resp = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": VALID_PLOT_GEOJSON},
        headers=auth_headers,
    )
    plot_id = create_resp.json()["id"]

    response = await async_client.get(
        f"/api/v1/fields/{field_id}/plots/{plot_id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == plot_id


@pytest.mark.asyncio
async def test_plot_access_requires_auth(async_client: AsyncClient, auth_headers: dict):
    """Запит до ділянок без токена повертає 401."""
    field_id = await _create_field(async_client, auth_headers)

    response = await async_client.get(f"/api/v1/fields/{field_id}/plots/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_plot(async_client: AsyncClient, auth_headers: dict):
    """DELETE /fields/{field_id}/plots/{plot_id} повертає 204."""
    field_id = await _create_field(async_client, auth_headers)

    create_resp = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": VALID_PLOT_GEOJSON},
        headers=auth_headers,
    )
    plot_id = create_resp.json()["id"]

    delete_resp = await async_client.delete(
        f"/api/v1/fields/{field_id}/plots/{plot_id}", headers=auth_headers
    )
    assert delete_resp.status_code == 204

    # Ділянка більше не доступна
    get_resp = await async_client.get(
        f"/api/v1/fields/{field_id}/plots/{plot_id}", headers=auth_headers
    )
    assert get_resp.status_code == 404
