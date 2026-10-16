import { ensureCCW, isSelfIntersecting, mergePolygons, pointInPolygon, pointNearBoundary, polygonAreaHa, samePoint, splitPolygonByLine } from '../../../utils/geo';

export const PLOT_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6', '#ef4444', '#ec4899', '#84cc16', '#06b6d4', '#f97316', '#6366f1', '#a855f7', '#10b981'];
export const MAX_PLOTS = PLOT_COLORS.length;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const newPlotId = () => `plot_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
export const nextLabel = (plots) => [...LETTERS].find((l) => !plots.some((p) => p.label === l));
export const colorForLabel = (label) => PLOT_COLORS[Math.max(0, LETTERS.indexOf(label)) % PLOT_COLORS.length];
export const withColors = (plots) => plots.map((p) => ({ ...p, color: colorForLabel(p.label) }));
export const totalAreaHa = (plots) => plots.reduce((s, p) => s + p.areaHa, 0);

export function makePlot(path, { label = 'A', cropId = null, id = newPlotId() } = {}) {
  const ring = ensureCCW(path);
  return { id, label, path: ring, areaHa: polygonAreaHa(ring), cropId };
}

export function splitPlotsByLine(plots, a, b) {
  const used = [...plots];
  const result = [];
  let count = plots.length;
  let splitCount = 0;
  for (const plot of plots) {
    const rings = count < MAX_PLOTS ? splitPolygonByLine(plot.path, a, b) : null;
    if (!rings) {
      result.push(plot);
      continue;
    }
    const first = makePlot(rings[0], { id: plot.id, label: plot.label, cropId: plot.cropId });
    const second = makePlot(rings[1], { label: nextLabel(used), cropId: plot.cropId });
    used.push(second);
    result.push(first, second);
    count += 1;
    splitCount += 1;
  }
  return { plots: result, splitCount };
}

export function mergePlots(plots, idA, idB) {
  const a = plots.find((p) => p.id === idA);
  const b = plots.find((p) => p.id === idB);
  if (!a || !b) return { error: 'Оберіть дві ділянки.' };
  if (a.cropId && b.cropId && a.cropId !== b.cropId) {
    return { error: 'Ділянки мають різні записи культур. Спершу приберіть запис в одній із них.' };
  }
  const ring = mergePolygons(a.path, b.path);
  if (!ring) return { error: 'Ділянки не мають спільної межі — об’єднати їх неможливо.' };
  const merged = makePlot(ring, { id: a.id, label: a.label, cropId: a.cropId ?? b.cropId });
  return { plots: plots.filter((p) => p.id !== idB).map((p) => (p.id === idA ? merged : p)) };
}

export function removePlot(plots, id) {
  const plot = plots.find((p) => p.id === id);
  if (!plot) return { error: 'Ділянку не знайдено.' };
  if (plot.cropId) return { error: `Видалення недоступне для ділянки ${plot.label}: у неї є запис культури.` };
  if (plots.length <= 1) return { error: 'У сезоні має лишитися хоча б одна ділянка.' };
  return { plots: plots.filter((p) => p.id !== id) };
}

export function movePlotVertex(plots, fieldBoundary, oldPt, newPt) {
  if (pointNearBoundary(oldPt, fieldBoundary)) return { error: 'Зовнішню межу поля змінювати не можна — вона постійна.' };
  if (!pointInPolygon(newPt, fieldBoundary)) return { error: 'Точка має лишатися всередині меж поля.' };
  const next = plots.map((p) => {
    if (!p.path.some((v) => samePoint(v, oldPt))) return p;
    const path = p.path.map((v) => (samePoint(v, oldPt) ? { lat: newPt.lat, lng: newPt.lng } : v));
    return { ...p, path, areaHa: polygonAreaHa(path) };
  });
  if (next.some((p) => isSelfIntersecting(p.path))) return { error: 'Межі ділянки не можуть перетинатися.' };
  return { plots: next };
}
