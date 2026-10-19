import test from 'node:test';
import assert from 'node:assert/strict';

import {
  pathBounds,
  polygonAreaHa,
  polygonCentroid,
} from '../src/utils/geo.js';

import {
  makePlot,
  splitPlotsByLine,
  mergePlots,
  removePlot,
  movePlotVertex,
  totalAreaHa,
  MAX_PLOTS,
} from '../src/pages/NewAnalysis/lib/plots.js';

import {
  createField,
  createSeason,
  saveSeasonLayout,
  saveCropRecord,
  listFields,
} from '../src/services/analysisApi.js';

// Setup mock localStorage in Node.js environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

const SQUARE_BOUNDARY = [
  { lat: 50.0, lng: 30.0 },
  { lat: 50.0, lng: 30.01 },
  { lat: 50.01, lng: 30.01 },
  { lat: 50.01, lng: 30.0 },
];

test('1. pathBounds: returns null for invalid or empty inputs and valid bbox for points', () => {
  assert.equal(pathBounds([]), null);
  assert.equal(pathBounds(null), null);
  assert.equal(pathBounds(undefined), null);
  assert.equal(pathBounds([{ lat: NaN, lng: 30 }]), null);

  const bounds = pathBounds(SQUARE_BOUNDARY);
  assert.notEqual(bounds, null);
  assert.equal(bounds.south, 50.0);
  assert.equal(bounds.north, 50.01);
  assert.equal(bounds.west, 30.0);
  assert.equal(bounds.east, 30.01);
});

test('2. polygonAreaHa & polygonCentroid: defensive calculations', () => {
  assert.equal(polygonAreaHa([]), 0);
  assert.equal(polygonAreaHa(null), 0);
  assert.equal(polygonAreaHa([{ lat: 50, lng: 30 }]), 0);

  const area = polygonAreaHa(SQUARE_BOUNDARY);
  assert.ok(area > 0, 'Area should be greater than 0');

  assert.equal(polygonCentroid([]), null);
  assert.equal(polygonCentroid(null), null);

  const c = polygonCentroid(SQUARE_BOUNDARY);
  assert.ok(c && Number.isFinite(c.lat) && Number.isFinite(c.lng));
  assert.ok(c.lat > 50.0 && c.lat < 50.01);
  assert.ok(c.lng > 30.0 && c.lng < 30.01);
});

test('3. splitPlotsByLine: splits polygon into two parts and conserves total area', () => {
  const plot = makePlot(SQUARE_BOUNDARY, { label: 'A' });
  const a = { lat: 49.99, lng: 30.005 };
  const b = { lat: 50.02, lng: 30.005 };

  const { plots, splitCount } = splitPlotsByLine([plot], a, b);
  assert.equal(splitCount, 1);
  assert.equal(plots.length, 2);
  assert.equal(plots[0].label, 'A');
  assert.equal(plots[1].label, 'B');

  const origArea = plot.areaHa;
  const splitTotal = totalAreaHa(plots);
  assert.ok(Math.abs(origArea - splitTotal) < 0.01, 'Total area must be conserved');
});

test('4. splitPlotsByLine: splits multiple plots crossed by the same line', () => {
  const plot = makePlot(SQUARE_BOUNDARY, { label: 'A' });
  // First vertical split -> 2 plots
  const { plots: twoPlots } = splitPlotsByLine([plot], { lat: 49.99, lng: 30.005 }, { lat: 50.02, lng: 30.005 });
  assert.equal(twoPlots.length, 2);

  // Second horizontal split crossing BOTH plots -> should yield 4 plots
  const { plots: fourPlots, splitCount } = splitPlotsByLine(
    twoPlots,
    { lat: 50.005, lng: 29.99 },
    { lat: 50.005, lng: 30.02 }
  );
  assert.equal(splitCount, 2);
  assert.equal(fourPlots.length, 4);

  const origArea = plot.areaHa;
  const fourTotal = totalAreaHa(fourPlots);
  assert.ok(Math.abs(origArea - fourTotal) < 0.01, 'Total area must be conserved across multi-splits');
});

test('5. splitPlotsByLine: line that does not intersect returns splitCount 0', () => {
  const plot = makePlot(SQUARE_BOUNDARY, { label: 'A' });
  const outsideA = { lat: 50.02, lng: 30.02 };
  const outsideB = { lat: 50.03, lng: 30.03 };

  const { plots, splitCount } = splitPlotsByLine([plot], outsideA, outsideB);
  assert.equal(splitCount, 0);
  assert.equal(plots.length, 1);
});

test('6. splitPlotsByLine: enforces MAX_PLOTS limit', () => {
  const manyPlots = [];
  for (let i = 0; i < MAX_PLOTS; i += 1) {
    manyPlots.push(makePlot(SQUARE_BOUNDARY, { label: `P${i}` }));
  }
  const a = { lat: 49.99, lng: 30.005 };
  const b = { lat: 50.02, lng: 30.005 };

  const { plots, splitCount } = splitPlotsByLine(manyPlots, a, b);
  assert.equal(splitCount, 0);
  assert.equal(plots.length, MAX_PLOTS);
});

test('7. mergePlots: merges adjacent plots and rejects invalid or conflicting merges', () => {
  const plot = makePlot(SQUARE_BOUNDARY, { label: 'A' });
  const a = { lat: 49.99, lng: 30.005 };
  const b = { lat: 50.02, lng: 30.005 };
  const { plots } = splitPlotsByLine([plot], a, b);

  // Merge the two halves
  const merged = mergePlots(plots, plots[0].id, plots[1].id);
  assert.equal(merged.error, undefined);
  assert.equal(merged.plots.length, 1);
  assert.ok(Math.abs(merged.plots[0].areaHa - plot.areaHa) < 0.01);

  // Rejects merge if crops conflict
  plots[0].cropId = 'corn';
  plots[1].cropId = 'wheat';
  const conflict = mergePlots(plots, plots[0].id, plots[1].id);
  assert.ok(conflict.error);
});

test('8. removePlot: protects plots with crop records and ensures at least one plot remains', () => {
  const p1 = makePlot(SQUARE_BOUNDARY, { id: 'p1', label: 'A', cropId: 'wheat' });
  const p2 = makePlot(SQUARE_BOUNDARY, { id: 'p2', label: 'B', cropId: null });

  // Cannot remove plot with crop
  const r1 = removePlot([p1, p2], 'p1');
  assert.ok(r1.error);

  // Can remove plot without crop
  const r2 = removePlot([p1, p2], 'p2');
  assert.equal(r2.error, undefined);
  assert.equal(r2.plots.length, 1);

  // Cannot remove last remaining plot
  const r3 = removePlot([p1], 'p1');
  assert.ok(r3.error);
});

test('9. movePlotVertex: forbids moving boundary vertices and forbids moving outside field', () => {
  const plot = makePlot(SQUARE_BOUNDARY, { label: 'A' });
  // External boundary point (cannot move)
  const boundaryPt = SQUARE_BOUNDARY[0];
  const newPt = { lat: 50.005, lng: 30.005 };

  const res1 = movePlotVertex([plot], SQUARE_BOUNDARY, boundaryPt, newPt);
  assert.ok(res1.error);
  assert.match(res1.error, /Зовнішню межу поля/);

  // Moving outside boundary
  const outsidePt = { lat: 51.0, lng: 31.0 };
  const res2 = movePlotVertex([plot], SQUARE_BOUNDARY, newPt, outsidePt);
  assert.ok(res2.error);
});

test('10. movePlotVertex: successfully moves shared internal vertex and rejects invalid moves', () => {
  const plot = makePlot(SQUARE_BOUNDARY, { label: 'A' });
  const { plots: twoPlots } = splitPlotsByLine([plot], { lat: 49.99, lng: 30.005 }, { lat: 50.02, lng: 30.005 });
  const { plots: fourPlots } = splitPlotsByLine(twoPlots, { lat: 50.005, lng: 29.99 }, { lat: 50.005, lng: 30.02 });

  const internalPt = { lat: 50.005, lng: 30.005 };
  const targetPt = { lat: 50.006, lng: 30.006 };

  // Successfully moves shared internal vertex, conserving total area
  const moved = movePlotVertex(fourPlots, SQUARE_BOUNDARY, internalPt, targetPt);
  assert.equal(moved.error, undefined);
  assert.ok(Math.abs(totalAreaHa(moved.plots) - totalAreaHa(fourPlots)) < 0.01);

  // Moving to an invalid point outside field is rejected
  const outsidePt = { lat: 50.05, lng: 30.05 };
  const rejected = movePlotVertex(fourPlots, SQUARE_BOUNDARY, internalPt, outsidePt);
  assert.ok(rejected.error);
});

test('11. Season rules: create field, add previous seasons, isolate layouts', async () => {
  localStorage.clear();

  // 1. Create Field
  const field = await createField({
    name: 'Тестове Поле',
    region: 'Київська обл.',
    boundary: SQUARE_BOUNDARY,
    areaHa: 10,
  });

  const curYear = new Date().getFullYear();
  assert.ok(field.id);
  assert.ok(field.seasons[curYear]);
  assert.equal(field.seasons[curYear].plots.length, 1);

  // Set crop on current season
  await saveCropRecord(field.id, curYear, field.seasons[curYear].plots[0].id, 'corn');

  // 2. Add previous season (curYear - 1) in copy mode
  const fAfterS1 = await createSeason(field.id, { mode: 'copy' });
  const prevYear1 = curYear - 1;
  assert.ok(fAfterS1.seasons[prevYear1]);
  // Geometry copied, but crop is null
  assert.equal(fAfterS1.seasons[prevYear1].plots.length, 1);
  assert.equal(fAfterS1.seasons[prevYear1].plots[0].cropId, null);

  // 3. Add second previous season (curYear - 2) in single mode
  const fAfterS2 = await createSeason(field.id, { mode: 'single' });
  const prevYear2 = curYear - 2;
  assert.ok(fAfterS2.seasons[prevYear2]);
  assert.equal(fAfterS2.seasons[prevYear2].plots.length, 1);

  // 4. Duplicate season creation attempt should fail with SEASON_EXISTS
  await assert.rejects(
    async () => {
      await createSeason(field.id, { mode: 'copy', year: prevYear1 });
    },
    (err) => err.code === 'SEASON_EXISTS'
  );

  // 5. Layout editing in historical season is independent
  const a = { lat: 49.99, lng: 30.005 };
  const b = { lat: 50.02, lng: 30.005 };
  const { plots: splitPlots } = splitPlotsByLine(fAfterS2.seasons[prevYear2].plots, a, b);
  assert.equal(splitPlots.length, 2);

  const fAfterLayout = await saveSeasonLayout(field.id, prevYear2, splitPlots);
  // prevYear2 has 2 plots now
  assert.equal(fAfterLayout.seasons[prevYear2].plots.length, 2);
  // curYear still has 1 plot and still has 'corn' crop
  assert.equal(fAfterLayout.seasons[curYear].plots.length, 1);
  assert.equal(fAfterLayout.seasons[curYear].plots[0].cropId, 'corn');
  // prevYear1 still has 1 plot
  assert.equal(fAfterLayout.seasons[prevYear1].plots.length, 1);

  // 6. Persistence check
  const allFields = await listFields();
  const reloaded = allFields.find((f) => f.id === field.id);
  assert.equal(reloaded.seasons[prevYear2].plots.length, 2);
  assert.equal(reloaded.seasons[curYear].plots.length, 1);
});
