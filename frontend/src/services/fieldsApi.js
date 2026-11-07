import { apiRequest, getStoredToken } from '../components/AuthModal/authApi.js';
import { geoJSONToPath, pathToGeoJSON, polygonAreaHa } from '../utils/geo.js';
import { getFieldPlotsHistory, hydrateFieldSeasons } from './historyApi.js';

const CURRENT_YEAR = new Date().getFullYear();


export function normalizeFieldResponse(field) {
  if (!field || typeof field !== 'object') return null;

  const boundary = geoJSONToPath(field.geom);
  const areaHa =
    field.total_area != null && Number.isFinite(Number(field.total_area))
      ? Number(field.total_area)
      : polygonAreaHa(boundary);

  return {
    id: field.id,
    name: field.name || 'Поле',
    region: field.region || '',
    boundary,
    areaHa,
    total_area: areaHa,
    geom: field.geom,
    user_id: field.user_id,
  };
}


function buildFieldWithSeasonPlots(fieldData, plotData, boundary, fallbackAreaHa) {
  const normalizedBoundary = Array.isArray(boundary) && boundary.length >= 3
    ? boundary
    : geoJSONToPath(fieldData.geom);

  const fieldArea =
    fieldData.total_area != null && Number.isFinite(Number(fieldData.total_area))
      ? Number(fieldData.total_area)
      : (fallbackAreaHa || polygonAreaHa(normalizedBoundary));

  const plotPath = plotData?.geom ? geoJSONToPath(plotData.geom) : normalizedBoundary;
  const plotArea =
    plotData?.total_area != null && Number.isFinite(Number(plotData.total_area))
      ? Number(plotData.total_area)
      : fieldArea;

  const plotId = plotData?.id || 1;

  return {
    id: fieldData.id,
    name: fieldData.name || 'Поле',
    region: fieldData.region || '',
    boundary: normalizedBoundary,
    areaHa: fieldArea,
    total_area: fieldArea,
    geom: fieldData.geom,
    user_id: fieldData.user_id,
    seasons: {
      [CURRENT_YEAR]: {
        year: CURRENT_YEAR,
        plots: [
          {
            id: plotId,
            label: 'A',
            path: plotPath,
            areaHa: plotArea,
            cropId: null,
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    },
  };
}


export async function listFields() {
  const token = getStoredToken();
  if (!token) {
    return [];
  }

  const result = await apiRequest('/api/v1/fields/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      return [];
    }
    throw new Error(result.message || 'Не вдалося отримати список полів з сервера.');
  }

  const rawList = Array.isArray(result.data) ? result.data : [];
  const fields = rawList.map(normalizeFieldResponse).filter(Boolean);

 
  fields.sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'uk', { sensitivity: 'base', numeric: true })
  );

  return fields;
}


export async function createField({ name, region, boundary, areaHa }) {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Для збереження поля увійдіть, будь ласка, до свого акаунта.');
  }

  if (!Array.isArray(boundary) || boundary.length < 3) {
    throw new Error('Контур поля повинен мати щонайменше 3 точки.');
  }

  const geom = pathToGeoJSON(boundary);

  const payload = {
    name: (name || 'Поле').trim(),
    region: region ? region.trim() : null,
    geom,
  };

  const fieldResult = await apiRequest('/api/v1/fields/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!fieldResult.ok) {
    throw new Error(fieldResult.message || 'Не вдалося створити поле на сервері.');
  }

  const fieldData = fieldResult.data;
  const fieldId = fieldData.id;

 
  let plotData = null;
  const plotResult = await apiRequest(`/api/v1/fields/${fieldId}/plots/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ geom }),
  });

  if (plotResult.ok) {
    plotData = plotResult.data;
  }

  return buildFieldWithSeasonPlots(fieldData, plotData, boundary, areaHa);
}


export async function getFieldWithPlots(fieldId) {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Для вибору поля увійдіть, будь ласка, до свого акаунта.');
  }

  const fieldResult = await apiRequest(`/api/v1/fields/${fieldId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!fieldResult.ok) {
    throw new Error(fieldResult.message || 'Не вдалося завантажити дані поля.');
  }

  const fieldData = fieldResult.data;
  const boundary = geoJSONToPath(fieldData.geom);

  
  const plotsResult = await apiRequest(`/api/v1/fields/${fieldId}/plots/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let plots;
  if (plotsResult.ok && Array.isArray(plotsResult.data) && plotsResult.data.length > 0) {
    plots = plotsResult.data.map((p, idx) => ({
      id: p.id,
      label: String.fromCharCode(65 + (idx % 26)),
      path: geoJSONToPath(p.geom),
      areaHa: p.total_area != null ? Number(p.total_area) : polygonAreaHa(geoJSONToPath(p.geom)),
      cropId: null,
    }));
  } else {
   
    const geom = pathToGeoJSON(boundary);
    const newPlotResult = await apiRequest(`/api/v1/fields/${fieldId}/plots/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ geom }),
    });

    if (newPlotResult.ok) {
      const p = newPlotResult.data;
      plots = [
        {
          id: p.id,
          label: 'A',
          path: geoJSONToPath(p.geom),
          areaHa: p.total_area != null ? Number(p.total_area) : fieldData.total_area,
          cropId: null,
        },
      ];
    } else {
      plots = [
        {
          id: 1,
          label: 'A',
          path: boundary,
          areaHa: fieldData.total_area || polygonAreaHa(boundary),
          cropId: null,
        },
      ];
    }
  }

  const historyMap = await getFieldPlotsHistory(plots);
  const seasons = hydrateFieldSeasons(fieldData, plots, historyMap);

  return {
    id: fieldData.id,
    name: fieldData.name || 'Поле',
    region: fieldData.region || '',
    boundary,
    areaHa: fieldData.total_area || polygonAreaHa(boundary),
    total_area: fieldData.total_area,
    geom: fieldData.geom,
    user_id: fieldData.user_id,
    seasons,
  };
}


export async function deleteField(fieldId) {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Для видалення поля увійдіть, будь ласка, до свого акаунта.');
  }

  const result = await apiRequest(`/api/v1/fields/${fieldId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!result.ok) {
    throw new Error(result.message || 'Не вдалося видалити поле.');
  }

  return true;
}
