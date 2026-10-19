import { makePlot } from '../pages/NewAnalysis/lib/plots.js';

const STORAGE_KEY = 'sivay.analysis.v1';
const CURRENT_YEAR = new Date().getFullYear();

const emptyDb = () => ({ fields: [], requests: [], cropProposals: [] });
const clone = (v) => JSON.parse(JSON.stringify(v));
const uid = (prefix) => `${prefix}_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
const fail = (code, message) => Object.assign(new Error(message), { code });

const cleanPlot = (p) => ({
  id: p.id,
  label: p.label || 'A',
  path: Array.isArray(p.path) ? p.path : [],
  areaHa: Number.isFinite(p.areaHa) ? p.areaHa : 0,
  cropId: p.cropId ?? null,
});

function normalizeField(field) {
  if (!field || typeof field !== 'object') return null;
  const boundary = Array.isArray(field.boundary)
    ? field.boundary.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
    : [];

  const seasons = {};
  if (field.seasons && typeof field.seasons === 'object') {
    for (const [y, s] of Object.entries(field.seasons)) {
      const year = Number(y);
      if (Number.isFinite(year) && s && typeof s === 'object') {
        const rawPlots = Array.isArray(s.plots) ? s.plots : [];
        const plots = rawPlots.filter((p) => p && Array.isArray(p.path)).map(cleanPlot);
        seasons[year] = {
          year,
          plots: plots.length > 0 ? plots : [cleanPlot(makePlot(boundary, { label: 'A' }))],
          updatedAt: s.updatedAt || new Date().toISOString(),
        };
      }
    }
  }

  const seasonYears = Object.keys(seasons);
  if (seasonYears.length === 0 && boundary.length >= 3) {
    seasons[CURRENT_YEAR] = {
      year: CURRENT_YEAR,
      plots: [cleanPlot(makePlot(boundary, { label: 'A' }))],
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...field,
    boundary,
    seasons,
  };
}

function read() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const db = raw ? { ...emptyDb(), ...JSON.parse(raw) } : emptyDb();
    if (Array.isArray(db.fields)) {
      db.fields = db.fields.map(normalizeField).filter(Boolean);
    } else {
      db.fields = [];
    }
    if (!Array.isArray(db.requests)) db.requests = [];
    if (!Array.isArray(db.cropProposals)) db.cropProposals = [];
    return db;
  } catch {
    return emptyDb();
  }
}

function write(db) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  } catch {
    throw fail('STORAGE_FAILED', 'Не вдалося зберегти дані у браузері.');
  }
}

function getField(db, fieldId) {
  const field = db.fields.find((f) => f.id === fieldId);
  if (!field) throw fail('FIELD_NOT_FOUND', 'Поле не знайдено.');
  return field;
}

export const latestYear = (field) => {
  if (!field?.seasons || typeof field.seasons !== 'object') {
    throw fail('NO_VALID_SEASON', 'Не знайдено сезонів для цього поля.');
  }
  const availableYears = Object.keys(field.seasons)
    .map(Number)
    .filter((year) => Number.isFinite(year) && year <= CURRENT_YEAR);

  if (availableYears.length === 0) {
    throw fail('NO_VALID_SEASON', 'Не знайдено сезону поточного року або раніше.');
  }

  return Math.max(...availableYears);
};

export async function listFields() {
  return clone(read().fields);
}

export async function createField({ name, region, boundary, areaHa }) {
  const db = read();
  const validBoundary = Array.isArray(boundary)
    ? boundary.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
    : [];

  const field = {
    id: uid('field'),
    name: name || 'Поле',
    region: region || '',
    boundary: validBoundary,
    areaHa: Number.isFinite(areaHa) ? areaHa : 0,
    createdAt: new Date().toISOString(),
    seasons: {
      [CURRENT_YEAR]: {
        year: CURRENT_YEAR,
        plots: [cleanPlot(makePlot(validBoundary, { label: 'A' }))],
        updatedAt: new Date().toISOString(),
      },
    },
  };
  db.fields.push(field);
  write(db);
  return clone(field);
}

export async function saveSeasonLayout(fieldId, year, plots) {
  const db = read();
  const field = getField(db, fieldId);
  const numericYear = Number(year);
  if (!field.seasons || !field.seasons[numericYear]) {
    throw fail('SEASON_NOT_FOUND', 'Сезон не знайдено.');
  }
  if (!Array.isArray(plots) || !plots.length) {
    throw fail('NO_PLOTS', 'У сезоні має бути хоча б одна ділянка.');
  }
  field.seasons[numericYear] = {
    ...field.seasons[numericYear],
    plots: plots.map(cleanPlot),
    updatedAt: new Date().toISOString(),
  };
  write(db);
  return clone(field);
}

export async function createSeason(fieldId, { mode = 'copy', year: explicitYear } = {}) {
  const db = read();
  const field = getField(db, fieldId);

  const existingYears = Object.keys(field.seasons || {})
    .map(Number)
    .filter((y) => Number.isFinite(y));

  const minYear = existingYears.length > 0 ? Math.min(...existingYears) : CURRENT_YEAR;
  const targetYear = explicitYear != null ? Number(explicitYear) : minYear - 1;

  if (!Number.isFinite(targetYear) || targetYear < 1900 || targetYear > CURRENT_YEAR) {
    throw fail('INVALID_SEASON', 'Некоректний рік для створення сезону.');
  }

  if (field.seasons[targetYear]) {
    throw fail('SEASON_EXISTS', `Сезон ${targetYear} уже існує.`);
  }

  const sourceSeason = field.seasons[minYear] || Object.values(field.seasons)[0];
  const plots =
    mode === 'copy' && sourceSeason && Array.isArray(sourceSeason.plots) && sourceSeason.plots.length > 0
      ? sourceSeason.plots.map((p) =>
          cleanPlot({
            ...makePlot(p.path, { label: p.label }),
            cropId: null,
          })
        )
      : [cleanPlot(makePlot(field.boundary, { label: 'A' }))];

  field.seasons[targetYear] = {
    year: targetYear,
    plots,
    updatedAt: new Date().toISOString(),
  };

  write(db);
  return clone(field);
}

export async function saveCropRecord(fieldId, year, plotId, cropId) {
  const db = read();
  const field = getField(db, fieldId);
  const numericYear = Number(year);
  const season = field.seasons?.[numericYear];
  if (!season) throw fail('SEASON_NOT_FOUND', 'Сезон не знайдено.');
  const plot = season.plots?.find((p) => p.id === plotId);
  if (!plot) throw fail('PLOT_NOT_FOUND', 'Ділянку не знайдено.');
  plot.cropId = cropId || null;
  season.updatedAt = new Date().toISOString();
  write(db);
  return clone(field);
}

export async function proposeCrop(name) {
  const db = read();
  const proposal = { id: uid('proposal'), name, status: 'pending', createdAt: new Date().toISOString() };
  db.cropProposals.push(proposal);
  write(db);
  return clone(proposal);
}

export async function listCropProposals() {
  return clone(read().cropProposals);
}

export async function submitAnalysisRequest(payload) {
  const db = read();
  const request = { id: uid('analysis'), status: 'saved_locally', createdAt: new Date().toISOString(), ...payload };
  db.requests.push(request);
  write(db);
  return clone(request);
}
