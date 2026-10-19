const M_PER_DEG_LAT = 110540;
const M_PER_DEG_LNG = 111320;
const SAME_POINT_EPS = 1e-7;

export function samePoint(a, b) {
  if (!a || !b || !Number.isFinite(a.lat) || !Number.isFinite(a.lng) || !Number.isFinite(b.lat) || !Number.isFinite(b.lng)) {
    return false;
  }
  return Math.abs(a.lat - b.lat) < SAME_POINT_EPS && Math.abs(a.lng - b.lng) < SAME_POINT_EPS;
}

export function pathsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((p, i) => samePoint(p, b[i]));
}

export function makeProjector(points) {
  const valid = Array.isArray(points) ? points.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng)) : [];
  const n = valid.length || 1;
  const lat0 = valid.length > 0 ? valid.reduce((s, p) => s + p.lat, 0) / n : 49.0;
  const lng0 = valid.length > 0 ? valid.reduce((s, p) => s + p.lng, 0) / n : 31.5;
  const kx = M_PER_DEG_LNG * Math.cos((lat0 * Math.PI) / 180);
  return {
    toXY: (p) => ({
      x: ((p?.lng ?? lng0) - lng0) * (kx || 1),
      y: ((p?.lat ?? lat0) - lat0) * M_PER_DEG_LAT,
    }),
    toLL: (q) => ({
      lat: lat0 + (q?.y ?? 0) / M_PER_DEG_LAT,
      lng: lng0 + (q?.x ?? 0) / (kx || 1),
    }),
  };
}

function shoelace(xy) {
  if (!Array.isArray(xy) || xy.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < xy.length; i += 1) {
    const j = (i + 1) % xy.length;
    s += (xy[i]?.x ?? 0) * (xy[j]?.y ?? 0) - (xy[j]?.x ?? 0) * (xy[i]?.y ?? 0);
  }
  return s / 2;
}

export function polygonAreaHa(path) {
  if (!Array.isArray(path) || path.length < 3) return 0;
  const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length < 3) return 0;
  const { toXY } = makeProjector(valid);
  return Math.abs(shoelace(valid.map(toXY))) / 10000;
}

export function ensureCCW(path) {
  if (!Array.isArray(path) || path.length < 3) return Array.isArray(path) ? [...path] : [];
  const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length < 3) return [...valid];
  const s = shoelace(valid.map((p) => ({ x: p.lng, y: p.lat })));
  return s < 0 ? [...valid].reverse() : [...valid];
}

export function polygonCentroid(path) {
  if (!Array.isArray(path) || path.length === 0) return null;
  const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length === 0) return null;
  if (valid.length < 3) return { lat: valid[0].lat, lng: valid[0].lng };
  const { toXY, toLL } = makeProjector(valid);
  const xy = valid.map(toXY);
  let sum = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < xy.length; i += 1) {
    const j = (i + 1) % xy.length;
    const f = xy[i].x * xy[j].y - xy[j].x * xy[i].y;
    sum += f;
    cx += (xy[i].x + xy[j].x) * f;
    cy += (xy[i].y + xy[j].y) * f;
  }
  if (Math.abs(sum) < 1e-9) return { lat: valid[0].lat, lng: valid[0].lng };
  const res = toLL({ x: cx / (3 * sum), y: cy / (3 * sum) });
  if (!Number.isFinite(res.lat) || !Number.isFinite(res.lng)) {
    return { lat: valid[0].lat, lng: valid[0].lng };
  }
  return res;
}

export function pathBounds(path) {
  if (!Array.isArray(path) || path.length === 0) return null;
  const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length === 0) return null;
  const lats = valid.map((p) => p.lat);
  const lngs = valid.map((p) => p.lng);
  return {
    south: Math.min(...lats),
    north: Math.max(...lats),
    west: Math.min(...lngs),
    east: Math.max(...lngs),
  };
}

export function pointInPolygon(pt, path) {
  if (!pt || !Array.isArray(path) || path.length < 3) return false;
  if (!Number.isFinite(pt.lat) || !Number.isFinite(pt.lng)) return false;
  const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length < 3) return false;
  let inside = false;
  for (let i = 0, j = valid.length - 1; i < valid.length; j = i, i += 1) {
    const a = valid[i];
    const b = valid[j];
    if (a.lat > pt.lat !== b.lat > pt.lat && pt.lng < ((b.lng - a.lng) * (pt.lat - a.lat)) / (b.lat - a.lat) + a.lng) {
      inside = !inside;
    }
  }
  return inside;
}

export function pointNearBoundary(pt, path, tolMeters = 0.75) {
  if (!pt || !Array.isArray(path) || path.length < 2) return false;
  if (!Number.isFinite(pt.lat) || !Number.isFinite(pt.lng)) return false;
  const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length < 2) return false;
  const { toXY } = makeProjector(valid);
  const p = toXY(pt);
  const xy = valid.map(toXY);
  for (let i = 0; i < xy.length; i += 1) {
    const a = xy[i];
    const b = xy[(i + 1) % xy.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    if (Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)) <= tolMeters) return true;
  }
  return false;
}

function orient(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function segmentsCross(p1, p2, p3, p4) {
  const d1 = orient(p3, p4, p1);
  const d2 = orient(p3, p4, p2);
  const d3 = orient(p1, p2, p3);
  const d4 = orient(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

export function isSelfIntersecting(path) {
  if (!Array.isArray(path) || path.length < 4) return false;
  const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length < 4) return false;
  const { toXY } = makeProjector(valid);
  const xy = valid.map(toXY);
  const n = xy.length;
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 2; j < n; j += 1) {
      if (i === 0 && j === n - 1) continue;
      if (segmentsCross(xy[i], xy[(i + 1) % n], xy[j], xy[(j + 1) % n])) return true;
    }
  }
  return false;
}

export function splitPolygonByLine(path, a, b) {
  if (!Array.isArray(path) || path.length < 3 || !a || !b) return null;
  if (!Number.isFinite(a.lat) || !Number.isFinite(a.lng) || !Number.isFinite(b.lat) || !Number.isFinite(b.lng)) return null;
  const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length < 3) return null;
  const { toXY, toLL } = makeProjector(valid);
  const pts = valid.map(toXY);
  const A = toXY(a);
  const B = toXY(b);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  if (Math.hypot(dx, dy) < 0.5) return null;
  const side = pts.map((p) => {
    const s = dx * (p.y - A.y) - dy * (p.x - A.x);
    return s === 0 ? 1e-9 : s;
  });
  const n = pts.length;
  const crossings = [];
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    if (side[i] > 0 !== side[j] > 0) {
      const t = side[i] / (side[i] - side[j]);
      crossings.push({
        edge: i,
        pt: { x: pts[i].x + t * (pts[j].x - pts[i].x), y: pts[i].y + t * (pts[j].y - pts[i].y) },
      });
    }
  }
  if (crossings.length !== 2) return null;
  const [c1, c2] = crossings;
  const len2 = dx * dx + dy * dy;
  const u1 = ((c1.pt.x - A.x) * dx + (c1.pt.y - A.y) * dy) / len2;
  const u2 = ((c2.pt.x - A.x) * dx + (c2.pt.y - A.y) * dy) / len2;
  const minU = Math.min(u1, u2);
  const maxU = Math.max(u1, u2);
  if (maxU < -0.05 || minU > 1.05) return null;

  const ring1 = [c1.pt];
  for (let k = c1.edge + 1; k <= c2.edge; k += 1) ring1.push(pts[k]);
  ring1.push(c2.pt);
  const ring2 = [c2.pt];
  let k = (c2.edge + 1) % n;
  for (;;) {
    ring2.push(pts[k]);
    if (k === c1.edge) break;
    k = (k + 1) % n;
  }
  ring2.push(c1.pt);
  const out = [ring1.map(toLL), ring2.map(toLL)];
  if (out.some((r) => polygonAreaHa(r) < 0.005)) return null;
  return out;
}

export function mergePolygons(pa, pb) {
  if (!Array.isArray(pa) || !Array.isArray(pb) || pa.length < 3 || pb.length < 3) return null;
  const a = ensureCCW(pa);
  const b = ensureCCW(pb);
  const na = a.length;
  const nb = b.length;
  for (let i = 0; i < na; i += 1) {
    for (let j = 0; j < nb; j += 1) {
      if (samePoint(a[i], b[(j + 1) % nb]) && samePoint(a[(i + 1) % na], b[j])) {
        const ring = [];
        for (let k = 0; k < na; k += 1) ring.push(a[(i + 1 + k) % na]);
        for (let k = 0; k < nb - 2; k += 1) ring.push(b[(j + 2 + k) % nb]);
        return ring;
      }
    }
  }
  return null;
}

export function parseCoordinate(value, min, max) {
  const text = String(value ?? '').trim();
  if (text === '') return null;
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}
