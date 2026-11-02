import test from 'node:test';
import assert from 'node:assert/strict';

import {
  geoJSONToPath,
  pathToGeoJSON,
} from '../src/utils/geo.js';

import {
  createField,
  deleteField,
  getFieldWithPlots,
  listFields,
  normalizeFieldResponse,
} from '../src/services/fieldsApi.js';

import { setStoredToken, clearStoredToken } from '../src/components/AuthModal/authApi.js';

// Setup mock localStorage and sessionStorage in Node.js environment
const localStore = new Map();
const sessionStore = new Map();

globalThis.localStorage = {
  getItem: (key) => (localStore.has(key) ? localStore.get(key) : null),
  setItem: (key, value) => localStore.set(key, String(value)),
  removeItem: (key) => localStore.delete(key),
  clear: () => localStore.clear(),
};

globalThis.sessionStorage = {
  getItem: (key) => (sessionStore.has(key) ? sessionStore.get(key) : null),
  setItem: (key, value) => sessionStore.set(key, String(value)),
  removeItem: (key) => sessionStore.delete(key),
  clear: () => sessionStore.clear(),
};

const SAMPLE_PATH = [
  { lat: 50.0, lng: 30.0 },
  { lat: 50.0, lng: 30.05 },
  { lat: 50.05, lng: 30.05 },
  { lat: 50.05, lng: 30.0 },
];

test.beforeEach(() => {
  localStore.clear();
  sessionStore.clear();
  clearStoredToken();
});

test('1. pathToGeoJSON: converts path to GeoJSON Polygon and closes ring', () => {
  const geojson = pathToGeoJSON(SAMPLE_PATH);

  assert.equal(geojson.type, 'Polygon');
  assert.equal(Array.isArray(geojson.coordinates), true);
  assert.equal(geojson.coordinates.length, 1);

  const ring = geojson.coordinates[0];
  // 4 original points + 1 closing point
  assert.equal(ring.length, 5);

  // GeoJSON coordinates order: [lng, lat]
  assert.deepEqual(ring[0], [30.0, 50.0]);
  assert.deepEqual(ring[1], [30.05, 50.0]);
  assert.deepEqual(ring[2], [30.05, 50.05]);
  assert.deepEqual(ring[3], [30.0, 50.05]);
  assert.deepEqual(ring[4], [30.0, 50.0]); // closed ring matches first point
});

test('2. pathToGeoJSON: throws error on less than 3 points', () => {
  assert.throws(() => pathToGeoJSON([]), /Контур поля повинен містити щонайменше 3 точки/);
  assert.throws(() => pathToGeoJSON([{ lat: 50, lng: 30 }, { lat: 51, lng: 30 }]), /Контур поля повинен містити щонайменше 3 точки/);
});

test('3. geoJSONToPath: converts GeoJSON Polygon to Google Maps points and strips duplicate closing point', () => {
  const geojson = {
    type: 'Polygon',
    coordinates: [
      [
        [30.0, 50.0],
        [30.05, 50.0],
        [30.05, 50.05],
        [30.0, 50.05],
        [30.0, 50.0],
      ],
    ],
  };

  const path = geoJSONToPath(geojson);
  assert.equal(path.length, 4);
  assert.deepEqual(path[0], { lat: 50.0, lng: 30.0 });
  assert.deepEqual(path[1], { lat: 50.0, lng: 30.05 });
  assert.deepEqual(path[2], { lat: 50.05, lng: 30.05 });
  assert.deepEqual(path[3], { lat: 50.05, lng: 30.0 });
});

test('4. geoJSONToPath: returns empty array for null or non-polygon data', () => {
  assert.deepEqual(geoJSONToPath(null), []);
  assert.deepEqual(geoJSONToPath({ type: 'Point', coordinates: [30, 50] }), []);
  assert.deepEqual(geoJSONToPath({ type: 'Polygon', coordinates: [] }), []);
});

test('5. normalizeFieldResponse: normalizes backend Field model into frontend format', () => {
  const backendField = {
    id: 42,
    name: 'Поле біля річки',
    region: 'Черкаська область',
    total_area: 15.75,
    user_id: 7,
    geom: {
      type: 'Polygon',
      coordinates: [
        [
          [31.0, 49.0],
          [31.1, 49.0],
          [31.1, 49.1],
          [31.0, 49.0],
        ],
      ],
    },
  };

  const normalized = normalizeFieldResponse(backendField);
  assert.equal(normalized.id, 42);
  assert.equal(normalized.name, 'Поле біля річки');
  assert.equal(normalized.region, 'Черкаська область');
  assert.equal(normalized.areaHa, 15.75);
  assert.equal(normalized.total_area, 15.75);
  assert.equal(normalized.boundary.length, 3);
  assert.deepEqual(normalized.boundary[0], { lat: 49.0, lng: 31.0 });
});

test('6. listFields: returns empty array when unauthenticated', async () => {
  clearStoredToken();
  const fields = await listFields();
  assert.deepEqual(fields, []);
});

test('7. listFields: fetches fields with Bearer token and sorts alphabetically', async () => {
  setStoredToken('test_jwt_token');

  let requestedUrl = null;
  let requestedHeaders = null;

  globalThis.fetch = async (url, options) => {
    requestedUrl = url;
    requestedHeaders = options?.headers;
    return {
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 1,
          name: 'Яблуневе',
          total_area: 10,
          region: 'Полтава',
          geom: { type: 'Polygon', coordinates: [[[34, 49], [34.1, 49], [34.1, 49.1], [34, 49]]] },
        },
        {
          id: 2,
          name: 'Берегове',
          total_area: 25,
          region: 'Полтава',
          geom: { type: 'Polygon', coordinates: [[[34, 49], [34.1, 49], [34.1, 49.1], [34, 49]]] },
        },
      ],
    };
  };

  const fields = await listFields();

  assert.equal(requestedUrl, '/api/v1/fields/');
  assert.equal(requestedHeaders?.Authorization, 'Bearer test_jwt_token');
  assert.equal(fields.length, 2);
  // Alphabetical sort: 'Берегове' before 'Яблуневе'
  assert.equal(fields[0].name, 'Берегове');
  assert.equal(fields[1].name, 'Яблуневе');
});

test('8. createField: creates field on backend and immediately creates base plot', async () => {
  setStoredToken('test_jwt_token');

  const calls = [];

  globalThis.fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options?.body || '{}') });

    if (url === '/api/v1/fields/') {
      return {
        ok: true,
        status: 201,
        json: async () => ({
          id: 101,
          name: 'Нове поле',
          region: 'Вінницька область',
          total_area: 18.5,
          user_id: 1,
          geom: pathToGeoJSON(SAMPLE_PATH),
        }),
      };
    }

    if (url === '/api/v1/fields/101/plots/') {
      return {
        ok: true,
        status: 201,
        json: async () => ({
          id: 501,
          field_id: 101,
          total_area: 18.5,
          geom: pathToGeoJSON(SAMPLE_PATH),
        }),
      };
    }

    return { ok: false, status: 404, json: async () => ({ detail: 'Not found' }) };
  };

  const created = await createField({
    name: 'Нове поле',
    region: 'Вінницька область',
    boundary: SAMPLE_PATH,
    areaHa: 18.5,
  });

  // Verify two calls were made in sequence
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, '/api/v1/fields/');
  assert.equal(calls[0].body.name, 'Нове поле');
  assert.equal(calls[0].body.geom.type, 'Polygon');

  assert.equal(calls[1].url, '/api/v1/fields/101/plots/');
  assert.equal(calls[1].body.geom.type, 'Polygon');

  // Verify created field structure for Step 2
  assert.equal(created.id, 101);
  assert.equal(created.name, 'Нове поле');
  assert.equal(created.areaHa, 18.5);
  const currentYear = new Date().getFullYear();
  assert.ok(created.seasons[currentYear]);
  assert.equal(created.seasons[currentYear].plots.length, 1);
  assert.equal(created.seasons[currentYear].plots[0].id, 501);
  assert.equal(created.seasons[currentYear].plots[0].label, 'A');
});

test('9. getFieldWithPlots: loads field and attaches existing plots from database', async () => {
  setStoredToken('test_jwt_token');

  globalThis.fetch = async (url) => {
    if (url === '/api/v1/fields/77') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: 77,
          name: 'Поле 77',
          region: 'Київщина',
          total_area: 30.0,
          geom: pathToGeoJSON(SAMPLE_PATH),
        }),
      };
    }

    if (url === '/api/v1/fields/77/plots/') {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 801,
            field_id: 77,
            total_area: 15.0,
            geom: pathToGeoJSON(SAMPLE_PATH),
          },
          {
            id: 802,
            field_id: 77,
            total_area: 15.0,
            geom: pathToGeoJSON(SAMPLE_PATH),
          },
        ],
      };
    }

    return { ok: false, status: 404, json: async () => ({}) };
  };

  const field = await getFieldWithPlots(77);

  assert.equal(field.id, 77);
  assert.equal(field.name, 'Поле 77');
  const currentYear = new Date().getFullYear();
  assert.equal(field.seasons[currentYear].plots.length, 2);
  assert.equal(field.seasons[currentYear].plots[0].id, 801);
  assert.equal(field.seasons[currentYear].plots[0].label, 'A');
  assert.equal(field.seasons[currentYear].plots[1].id, 802);
  assert.equal(field.seasons[currentYear].plots[1].label, 'B');
});

test('10. deleteField: sends DELETE request with Bearer token', async () => {
  setStoredToken('test_jwt_token');

  let deleteUrl = null;
  let deleteMethod = null;

  globalThis.fetch = async (url, options) => {
    deleteUrl = url;
    deleteMethod = options?.method;
    return { ok: true, status: 204, json: async () => ({}) };
  };

  const success = await deleteField(99);
  assert.equal(success, true);
  assert.equal(deleteUrl, '/api/v1/fields/99');
  assert.equal(deleteMethod, 'DELETE');
});

