"""
Краш-тест архітектури: Plot History + каскадне видалення.

Сценарій:
  1. Поле → Ділянка → Запис plot_history (з реальним crop_id із довідника)
  2. Перевірка GET /plots/{plot_id}/history/ → 200 з даними
  3. DELETE /fields/{field_id} → 204
  4. Прямий запит до БД: ділянка та її plot_history фізично відсутні

Перевіряє весь ланцюжок CASCADE:
  users → fields → plots → plot_history
"""
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.plot import Plot
from app.models.plot_history import PlotHistory

# ---------------------------------------------------------------------------
# Тестові GeoJSON-дані (ті самі, що в test_plots.py)
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# Тест: повний сценарій створення та каскадного видалення
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_plot_history_success(
    async_client: AsyncClient,
    auth_headers: dict,
    seeded_crop: int,
):
    """
    Створення запису в plot_history для існуючої ділянки.
    crop_id береться з фікстури seeded_crop.
    """
    # Крок 1: створити поле
    field_resp = await async_client.post(
        "/api/v1/fields/",
        json={"name": "Поле для історії", "geom": FIELD_GEOJSON},
        headers=auth_headers,
    )
    assert field_resp.status_code == 201
    field_id = field_resp.json()["id"]

    # Крок 2: створити ділянку в цьому полі
    plot_resp = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": VALID_PLOT_GEOJSON},
        headers=auth_headers,
    )
    assert plot_resp.status_code == 201
    plot_id = plot_resp.json()["id"]

    # Крок 3: записати в plot_history
    history_resp = await async_client.post(
        f"/api/v1/plots/{plot_id}/history/",
        json={"crop_id": seeded_crop, "year": 2024},
        headers=auth_headers,
    )
    assert history_resp.status_code == 201, history_resp.text

    data = history_resp.json()
    assert data["plot_id"] == plot_id
    assert data["crop_id"] == seeded_crop
    assert data["year"] == 2024


@pytest.mark.asyncio
async def test_get_plot_history(
    async_client: AsyncClient,
    auth_headers: dict,
    seeded_crop: int,
):
    """GET /plots/{plot_id}/history/ повертає список записів, відсортованих за роком (спадання)."""
    # Підготовка: поле → ділянка
    field_resp = await async_client.post(
        "/api/v1/fields/",
        json={"name": "Поле для читання історії", "geom": FIELD_GEOJSON},
        headers=auth_headers,
    )
    field_id = field_resp.json()["id"]

    plot_resp = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": VALID_PLOT_GEOJSON},
        headers=auth_headers,
    )
    plot_id = plot_resp.json()["id"]

    # Додаємо 3 записи різних років
    for year in [2022, 2023, 2024]:
        await async_client.post(
            f"/api/v1/plots/{plot_id}/history/",
            json={"crop_id": seeded_crop, "year": year},
            headers=auth_headers,
        )

    # Отримуємо історію
    get_resp = await async_client.get(
        f"/api/v1/plots/{plot_id}/history/", headers=auth_headers
    )
    assert get_resp.status_code == 200

    history = get_resp.json()
    assert isinstance(history, list)
    assert len(history) == 3

    # Перевіряємо порядок: найновіший рік першим (DESC)
    years = [h["year"] for h in history]
    assert years == sorted(years, reverse=True), (
        f"Очікували спадний порядок: {sorted(years, reverse=True)}, отримали: {years}"
    )


@pytest.mark.asyncio
async def test_cascade_delete_field_removes_plots_and_history(
    async_client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
    seeded_crop: int,
):
    """
    КРАШ-ТЕСТ КАСКАДНОГО ВИДАЛЕННЯ:

    DELETE /fields/{field_id}
      → plots.field_id ON DELETE CASCADE  → ділянки видаляються
      → plot_history.plot_id ON DELETE CASCADE → записи історії видаляються

    Перевіряємо БД напряму через db_session.
    """
    # Крок 1: створити поле
    field_resp = await async_client.post(
        "/api/v1/fields/",
        json={"name": "Поле для каскадного тесту", "geom": FIELD_GEOJSON},
        headers=auth_headers,
    )
    assert field_resp.status_code == 201
    field_id = field_resp.json()["id"]

    # Крок 2: створити ділянку
    plot_resp = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": VALID_PLOT_GEOJSON},
        headers=auth_headers,
    )
    assert plot_resp.status_code == 201
    plot_id = plot_resp.json()["id"]

    # Крок 3: записати в plot_history
    history_resp = await async_client.post(
        f"/api/v1/plots/{plot_id}/history/",
        json={"crop_id": seeded_crop, "year": 2023},
        headers=auth_headers,
    )
    assert history_resp.status_code == 201
    history_id = history_resp.json()["id"]

    # Переконуємось, що все є в БД перед видаленням
    plot_before = await db_session.get(Plot, plot_id)
    assert plot_before is not None, "Ділянка має існувати в БД перед видаленням поля"

    history_before = await db_session.get(PlotHistory, history_id)
    assert history_before is not None, "Запис історії має існувати в БД"

    # Крок 4: видалити ПОЛЕ
    delete_resp = await async_client.delete(
        f"/api/v1/fields/{field_id}", headers=auth_headers
    )
    assert delete_resp.status_code == 204

    # Крок 5: перевірити CASCADE в БД через db_session
    # Очищаємо кеш сесії, щоб отримати актуальний стан із БД
    db_session.expire_all()

    # Ділянка має бути видалена (CASCADE: fields → plots)
    plot_stmt = select(Plot).where(Plot.id == plot_id)
    plot_result = await db_session.execute(plot_stmt)
    assert plot_result.scalars().first() is None, (
        f"Plot {plot_id} має бути видалений разом із полем (ON DELETE CASCADE)"
    )

    # Запис history має бути видалений (CASCADE: plots → plot_history)
    history_stmt = select(PlotHistory).where(PlotHistory.id == history_id)
    history_result = await db_session.execute(history_stmt)
    assert history_result.scalars().first() is None, (
        f"PlotHistory {history_id} має бути видалений разом із ділянкою (ON DELETE CASCADE)"
    )


@pytest.mark.asyncio
async def test_history_requires_auth(async_client: AsyncClient, auth_headers: dict):
    """GET /plots/{plot_id}/history/ без токена повертає 401."""
    # Спочатку створимо ділянку
    field_resp = await async_client.post(
        "/api/v1/fields/",
        json={"name": "Поле auth test", "geom": FIELD_GEOJSON},
        headers=auth_headers,
    )
    field_id = field_resp.json()["id"]

    plot_resp = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": VALID_PLOT_GEOJSON},
        headers=auth_headers,
    )
    plot_id = plot_resp.json()["id"]

    # Запит без токена
    response = await async_client.get(f"/api/v1/plots/{plot_id}/history/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_plot_history_upsert_and_crud(
    async_client: AsyncClient,
    auth_headers: dict,
    seeded_crop: int,
    db_session: AsyncSession,
):
    """Тест upsert (POST з однаковим роком оновлює crop_id), а також PUT та DELETE."""
    # Створимо поле та ділянку
    field_resp = await async_client.post(
        "/api/v1/fields/",
        json={"name": "Поле для upsert тесту", "geom": FIELD_GEOJSON},
        headers=auth_headers,
    )
    field_id = field_resp.json()["id"]

    plot_resp = await async_client.post(
        f"/api/v1/fields/{field_id}/plots/",
        json={"geom": VALID_PLOT_GEOJSON, "label": "A"},
        headers=auth_headers,
    )
    plot_id = plot_resp.json()["id"]

    # 1. Перший POST: 2024 рік, seeded_crop
    create_resp1 = await async_client.post(
        f"/api/v1/plots/{plot_id}/history/",
        json={"crop_id": seeded_crop, "year": 2024},
        headers=auth_headers,
    )
    assert create_resp1.status_code == 201
    hist_id = create_resp1.json()["id"]
    assert create_resp1.json()["crop_id"] == seeded_crop

    # 2. Створимо другу культуру в БД для зміни
    from app.models.crop import Crop
    second_crop = Crop(name="Кукурудза Тестова")
    db_session.add(second_crop)
    await db_session.commit()
    await db_session.refresh(second_crop)

    # 3. Другий POST на той самий рік 2024 — перевіряємо UPSERT
    create_resp2 = await async_client.post(
        f"/api/v1/plots/{plot_id}/history/",
        json={"crop_id": second_crop.id, "year": 2024},
        headers=auth_headers,
    )
    assert create_resp2.status_code == 201
    assert create_resp2.json()["id"] == hist_id  # той самий запис!
    assert create_resp2.json()["crop_id"] == second_crop.id

    # Перевіримо, що запис в історії тільки ОДИН
    list_resp = await async_client.get(
        f"/api/v1/plots/{plot_id}/history/",
        headers=auth_headers,
    )
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    # 4. Перевірка PUT: зміна назад на seeded_crop
    put_resp = await async_client.put(
        f"/api/v1/plots/{plot_id}/history/{hist_id}",
        json={"crop_id": seeded_crop},
        headers=auth_headers,
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["crop_id"] == seeded_crop

    # 5. Перевірка DELETE: видалення запису
    delete_resp = await async_client.delete(
        f"/api/v1/plots/{plot_id}/history/{hist_id}",
        headers=auth_headers,
    )
    assert delete_resp.status_code == 204

    # Перевірка: список порожній
    list_after_delete = await async_client.get(
        f"/api/v1/plots/{plot_id}/history/",
        headers=auth_headers,
    )
    assert list_after_delete.status_code == 200
    assert len(list_after_delete.json()) == 0
