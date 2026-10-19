import { makePlot } from '../pages/NewAnalysis/lib/plots';

const STORAGE_KEY = 'sivay.analysis.v1';
const CURRENT_YEAR = new Date().getFullYear();

const emptyDb = () => ({ fields: [], requests: [], cropProposals: [] });
const clone = (v) => JSON.parse(JSON.stringify(v));
const uid = (prefix) => `${prefix}_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
const fail = (code, message) => Object.assign(new Error(message), { code });

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyDb(), ...JSON.parse(raw) } : emptyDb();
  } catch {
    return emptyDb();
  }
}

function write(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    throw fail('STORAGE_FAILED', 'Не вдалося зберегти дані у браузері.');
  }
}

function getField(db, fieldId) {
  const field = db.fields.find((f) => f.id === fieldId);
  if (!field) throw fail('FIELD_NOT_FOUND', 'Поле не знайдено.');
  return field;
}

const latestYear = (field) => {
  const availableYears = Object.keys(field.seasons)
    .map(Number)
    .filter((year) => year <= CURRENT_YEAR);

  if (availableYears.length === 0) {
    throw fail('NO_VALID_SEASON', 'Не знайдено сезону поточного року або раніше.');
  }

  return Math.max(...availableYears);
};
const cleanPlot = (p) => ({ id: p.id, label: p.label, path: p.path, areaHa: p.areaHa, cropId: p.cropId ?? null });

export async function listFields() {
  return clone(read().fields);
}

export async function createField({ name, region, boundary, areaHa }) {
  const db = read();
  const field = {
    id: uid('field'),
    name,
    region: region || '',
    boundary,
    areaHa,
    createdAt: new Date().toISOString(),
    seasons: {
      [CURRENT_YEAR]: { year: CURRENT_YEAR, plots: [cleanPlot(makePlot(boundary, { label: 'A' }))], updatedAt: new Date().toISOString() },
    },
  };
  db.fields.push(field);
  write(db);
  return clone(field);
}

export async function saveSeasonLayout(fieldId, year, plots) {
  const db = read();
  const field = getField(db, fieldId);
  if (!field.seasons[year]) throw fail('SEASON_NOT_FOUND', 'Сезон не знайдено.');
  if (year !== latestYear(field)) throw fail('SEASON_LAYOUT_LOCKED', 'Розбивку минулих сезонів змінити не можна.');
  if (!plots.length) throw fail('NO_PLOTS', 'У сезоні має бути хоча б одна ділянка.');
  field.seasons[year] = { ...field.seasons[year], plots: plots.map(cleanPlot), updatedAt: new Date().toISOString() };
  write(db);
  return clone(field);
}

export async function createSeason(fieldId, { mode }) {
  const db = read();
  const field = getField(db, fieldId);

  const sourceYear = latestYear(field);
  const sourceSeason = field.seasons[sourceYear];
  const year = sourceYear - 1;

  if (field.seasons[year]) {
    throw fail('SEASON_EXISTS', `Сезон ${year} уже існує.`);
  }

  if (year < 1900) {
    throw fail('INVALID_SEASON', 'Не вдалося визначити попередній сезон.');
  }

  const plots =
    mode === 'copy'
      ? sourceSeason.plots.map((p) =>
          cleanPlot({
            ...makePlot(p.path, { label: p.label }),
            cropId: null,
          })
        )
      : [cleanPlot(makePlot(field.boundary, { label: 'A' }))];

  field.seasons[year] = {
    year,
    plots,
    updatedAt: new Date().toISOString(),
  };

  write(db);
  return clone(field);
}

export async function saveCropRecord(fieldId, year, plotId, cropId) {
  const db = read();
  const field = getField(db, fieldId);
  const season = field.seasons[year];
  const plot = season?.plots.find((p) => p.id === plotId);
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
