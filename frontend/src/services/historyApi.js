import { apiRequest, getStoredToken } from '../components/AuthModal/authApi.js';
import { resolveCropId } from './cropsApi.js';

const CURRENT_YEAR = new Date().getFullYear();


export async function getPlotHistory(plotId) {
  if (!plotId) return [];

  const token = getStoredToken();
  if (!token) return [];

  const result = await apiRequest(`/api/v1/plots/${plotId}/history/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!result.ok) {
    return [];
  }

  return Array.isArray(result.data) ? result.data : [];
}


export async function savePlotCropHistory({ plotId, year, cropId }) {
  if (!plotId) {
    throw new Error('ID ділянки є обов’язковим.');
  }

  const numericYear = Number(year);
  if (!Number.isFinite(numericYear) || numericYear < 1900 || numericYear > CURRENT_YEAR + 1) {
    throw new Error('Некоректний рік сезону.');
  }

  const resolvedCropId = resolveCropId(cropId);
  if (!resolvedCropId) {
    throw new Error('Необхідно обрати культуру.');
  }

  const token = getStoredToken();
  if (!token) {
    throw new Error('Для збереження історії увійдіть, будь ласка, до акаунта.');
  }

  const result = await apiRequest(`/api/v1/plots/${plotId}/history/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      crop_id: resolvedCropId,
      year: numericYear,
    }),
  });

  if (!result.ok) {
    throw new Error(result.message || 'Не вдалося зберегти запис посіву на сервері.');
  }

  return result.data;
}


export async function getFieldPlotsHistory(plots) {
  const historyMap = new Map();
  if (!Array.isArray(plots) || plots.length === 0) {
    return historyMap;
  }

  const validPlots = plots.filter((p) => p && p.id);

  const results = await Promise.allSettled(
    validPlots.map((plot) => getPlotHistory(plot.id))
  );

  results.forEach((res, idx) => {
    const plot = validPlots[idx];
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      historyMap.set(plot.id, res.value);
    } else {
      historyMap.set(plot.id, []);
    }
  });

  return historyMap;
}

export function hydrateFieldSeasons(field, basePlots, historyMap) {
  const plotsList = Array.isArray(basePlots) && basePlots.length > 0
    ? basePlots
    : [{ id: 1, label: 'A', path: field?.boundary || [], areaHa: field?.areaHa || 0, cropId: null }];

  const seasons = {};
  const yearsSet = new Set();
  yearsSet.add(CURRENT_YEAR);

 
  if (historyMap && typeof historyMap.forEach === 'function') {
    historyMap.forEach((records) => {
      if (Array.isArray(records)) {
        records.forEach((r) => {
          if (r && Number.isFinite(Number(r.year))) {
            yearsSet.add(Number(r.year));
          }
        });
      }
    });
  }

  Array.from(yearsSet)
    .sort((a, b) => b - a)
    .forEach((year) => {
      seasons[year] = {
        year,
        plots: plotsList.map((plot) => {
          const plotRecords = historyMap?.get?.(plot.id) || [];
          const record = plotRecords.find((r) => Number(r.year) === year);
          return {
            ...plot,
            cropId: record ? record.crop_id : null,
          };
        }),
        updatedAt: new Date().toISOString(),
      };
    });

  return seasons;
}
