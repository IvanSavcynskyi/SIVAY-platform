import { useEffect, useRef } from 'react';
import { pathsEqual, polygonCentroid } from '../../utils/geo';
import { useMap } from './mapContext';

const NO_IDS = [];
const PIN_SVG =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#052f23" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function addMarker(maps, map, { position, content, clickable = false, zIndex }) {
  if (!maps || !map || !position || !Number.isFinite(position.lat) || !Number.isFinite(position.lng)) {
    return null;
  }
  try {
    if (maps.marker?.AdvancedMarkerElement) {
      return new maps.marker.AdvancedMarkerElement({ map, position, content, gmpClickable: clickable, zIndex });
    }
  } catch {
    return null;
  }
  return null;
}

const removeMarker = (marker) => {
  if (marker) {
    try {
      marker.map = null;
    } catch {
      // safe
    }
  }
};

const readPath = (polygon) => {
  if (!polygon) return [];
  const path = polygon.getPath?.();

  if (!path || typeof path.getArray !== 'function') {
    const paths = polygon.getPaths?.();
    if (paths && typeof paths.getAt === 'function' && paths.getLength() > 0) {
      const first = paths.getAt(0);
      if (first && typeof first.getArray === 'function') {
        return first.getArray().map((point) => (point.toJSON ? point.toJSON() : { lat: point.lat(), lng: point.lng() }));
      }
    }
    return [];
  }

  return path.getArray().map((point) => (point.toJSON ? point.toJSON() : { lat: point.lat(), lng: point.lng() }));
};

function replacePath(maps, polygon, points) {
  if (!polygon || !maps || !Array.isArray(points)) return;
  const valid = points.filter((pt) => pt && Number.isFinite(pt.lat) && Number.isFinite(pt.lng));
  const latLngs = valid.map((pt) => new maps.LatLng(pt.lat, pt.lng));
  const arr = polygon.getPath?.();
  if (arr && typeof arr.clear === 'function' && typeof arr.push === 'function') {
    arr.clear();
    latLngs.forEach((pt) => arr.push(pt));
  } else if (typeof polygon.setPaths === 'function') {
    polygon.setPaths([latLngs]);
  }
}

export function LocationMarker({ position, label }) {
  const { map, maps } = useMap();
  useEffect(() => {
    if (!map || !maps || !position) return undefined;
    const content = el('div', 'flex flex-col items-center gap-1.5');
    const pin = el('div', 'grid h-11 w-11 place-items-center rounded-full border-[3px] border-white bg-brand shadow-[0_3px_5px_rgba(8,46,32,0.3)]');
    pin.innerHTML = PIN_SVG;
    content.appendChild(pin);
    if (label) content.appendChild(el('div', 'max-w-[220px] truncate rounded-[10px] bg-white px-3 py-1.5 text-[13px] font-bold text-brand-text shadow-[0_3px_5px_rgba(8,46,32,0.15)]', label));
    content.style.transform = 'translateY(calc(100% - 22px))';
    const marker = addMarker(maps, map, { position, content });
    return () => removeMarker(marker);
  }, [map, maps, position, label]);
  return null;
}

export function FieldBoundaryLayer({ path, editable = false, showVertices = false, onChange }) {
  const { map, maps } = useMap();
  const polygonRef = useRef(null);
  const suppress = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const initialPathRef = useRef(path);

  useEffect(() => {
    if (!map || !maps) return undefined;
    const initialPath = initialPathRef.current;
    const valid = Array.isArray(initialPath)
      ? initialPath.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
      : [];

    const polygon = new maps.Polygon({
      map,
      paths: valid.map((pt) => new maps.LatLng(pt.lat, pt.lng)),
      strokeColor: '#19c463',
      strokeWeight: 3,
      fillColor: '#19c463',
      fillOpacity: 0.1,
      editable,
      clickable: editable,
      zIndex: 5,
    });
    polygonRef.current = polygon;
    const arr = polygon.getPath?.();
    const emit = () => {
      if (!suppress.current && polygonRef.current) {
        onChangeRef.current?.(readPath(polygonRef.current));
      }
    };
    const listeners = [];
    if (editable && arr && typeof arr.addListener === 'function') {
      listeners.push(
        arr.addListener('set_at', emit),
        arr.addListener('insert_at', emit),
        arr.addListener('remove_at', emit),
      );
    }
    return () => {
      listeners.forEach((l) => l?.remove?.());
      polygon.setMap(null);
      polygonRef.current = null;
    };
  }, [map, maps, editable]);

  useEffect(() => {
    const polygon = polygonRef.current;
    if (!polygon || !path || !maps) return;
    const current = readPath(polygon);
    if (!pathsEqual(current, path)) {
      suppress.current = true;
      replacePath(maps, polygon, path);
      suppress.current = false;
    }
  }, [maps, path]);

  useEffect(() => {
    if (!showVertices || !path || !map || !maps) return undefined;
    const valid = path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
    const markers = valid.map((position) => {
      const dot = el('div', 'h-3 w-3 rounded-full border-2 border-brand bg-white shadow');
      dot.style.transform = 'translateY(50%)';
      return addMarker(maps, map, { position, content: dot, zIndex: 6 });
    });
    return () => markers.forEach(removeMarker);
  }, [map, maps, path, showVertices]);

  return null;
}

export function PlotsLayer({ plots = [], selectedIds = NO_IDS, interactive = false, editable = false, onPlotClick, onVertexMove, onStructureChange }) {
  const { map, maps } = useMap();
  const entries = useRef(new Map());
  const suppress = useRef(false);
  const latest = useRef({});

  useEffect(() => {
    latest.current = { plots, onPlotClick, onVertexMove, onStructureChange };
  });

  useEffect(() => {
    if (!map || !maps) return undefined;
    const store = entries.current;

    const destroy = (entry) => {
      entry.listeners.forEach((l) => l?.remove?.());
      entry.polygon.setMap(null);
      removeMarker(entry.marker);
    };

    const create = (plot) => {
      const validPath = Array.isArray(plot.path)
        ? plot.path.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
        : [];
      const polygon = new maps.Polygon({
        map,
        paths: validPath.map((pt) => new maps.LatLng(pt.lat, pt.lng)),
        strokeColor: '#ffffff',
        strokeOpacity: 0.95,
      });
      const arr = polygon.getPath?.();
      const listeners = [
        polygon.addListener('click', () => latest.current.onPlotClick?.(plot.id)),
      ];
      if (arr && typeof arr.addListener === 'function') {
        listeners.push(
          arr.addListener('set_at', (index, previous) => {
            if (suppress.current) return;
            const currentPt = arr.getAt(index);
            if (!currentPt) return;
            const accepted = latest.current.onVertexMove?.(previous.toJSON(), currentPt.toJSON());
            if (accepted === false) {
              suppress.current = true;
              arr.setAt(index, previous);
              suppress.current = false;
            }
          }),
          ...['insert_at', 'remove_at'].map((evt) =>
            arr.addListener(evt, () => {
              if (suppress.current) return;
              const current = latest.current.plots?.find((p) => p.id === plot.id);
              if (current) {
                suppress.current = true;
                replacePath(maps, polygon, current.path);
                suppress.current = false;
              }
              latest.current.onStructureChange?.();
            }),
          ),
        );
      }
      return { polygon, listeners, marker: null, markerKey: '' };
    };

    const validPlots = Array.isArray(plots) ? plots.filter((p) => p && Array.isArray(p.path)) : [];
    const ids = new Set(validPlots.map((p) => p.id));
    store.forEach((entry, id) => {
      if (!ids.has(id)) {
        destroy(entry);
        store.delete(id);
      }
    });

    validPlots.forEach((plot) => {
      let entry = store.get(plot.id);
      if (!entry) {
        entry = create(plot);
        store.set(plot.id, entry);
      }
      const selected = Array.isArray(selectedIds) && selectedIds.includes(plot.id);
      entry.polygon.setOptions({
        fillColor: plot.color,
        fillOpacity: selected ? 0.62 : 0.38,
        strokeWeight: selected ? 3 : 1.5,
        editable,
        clickable: interactive,
        zIndex: selected ? 4 : 3,
      });
      if (!pathsEqual(readPath(entry.polygon), plot.path)) {
        suppress.current = true;
        replacePath(maps, entry.polygon, plot.path);
        suppress.current = false;
      }

      const centroid = polygonCentroid(plot.path);
      const key = `${plot.label}|${plot.color}|${selected}`;
      if (centroid && Number.isFinite(centroid.lat) && Number.isFinite(centroid.lng)) {
        if (key !== entry.markerKey) {
          removeMarker(entry.marker);
          const badge = el(
            'div',
            `grid h-7 w-7 place-items-center rounded-full border-2 text-[13px] font-bold text-white shadow-md ${selected ? 'border-brand-darkest' : 'border-white'}`,
            plot.label,
          );
          badge.style.background = plot.color;
          badge.style.transform = 'translateY(50%)';
          entry.marker = addMarker(maps, map, { position: centroid, content: badge, zIndex: 7 });
          entry.markerKey = key;
        } else if (entry.marker) {
          entry.marker.position = centroid;
        }
      }
    });
  }, [map, maps, plots, selectedIds, interactive, editable]);

  useEffect(() => {
    const store = entries.current;
    return () => {
      store.forEach((entry) => {
        entry.listeners.forEach((l) => l?.remove?.());
        entry.polygon.setMap(null);
        removeMarker(entry.marker);
      });
      store.clear();
    };
  }, []);

  return null;
}

export function DrawPolygonLayer({ points = [], onAddPoint, onClose }) {
  const { map, maps } = useMap();
  const handlers = useRef({});

  useEffect(() => {
    handlers.current = { onAddPoint, onClose };
  });

  useEffect(() => {
    if (!map) return undefined;
    const listener = map.addListener('click', (e) => {
      if (e.latLng) handlers.current.onAddPoint?.(e.latLng.toJSON());
    });
    map.setOptions({ draggableCursor: 'crosshair' });
    return () => {
      listener?.remove?.();
      map.setOptions({ draggableCursor: null });
    };
  }, [map]);

  useEffect(() => {
    if (!map || !maps) return undefined;
    const valid = Array.isArray(points)
      ? points.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
      : [];

    const polygon = new maps.Polygon({
      map,
      paths: valid.map((pt) => new maps.LatLng(pt.lat, pt.lng)),
      strokeColor: '#19c463',
      strokeWeight: 3,
      fillColor: '#19c463',
      fillOpacity: 0.15,
      clickable: false,
      zIndex: 5,
    });
    const markers = valid.map((position, index) => {
      const closable = index === 0 && valid.length >= 3;
      const dot = el(
        'div',
        closable
          ? 'h-6 w-6 cursor-pointer rounded-full border-[3px] border-white bg-brand shadow-[0_0_0_3px_rgba(25,196,99,0.4)]'
          : 'h-3.5 w-3.5 rounded-full border-2 border-brand bg-white shadow',
      );
      dot.style.transform = 'translateY(50%)';
      const marker = addMarker(maps, map, { position, content: dot, clickable: closable, zIndex: 8 });
      if (closable && marker) {
        marker.addListener('click', () => handlers.current.onClose?.());
      }
      return marker;
    });
    return () => {
      polygon.setMap(null);
      markers.forEach(removeMarker);
    };
  }, [map, maps, points]);

  return null;
}

export function DrawLineLayer({ onComplete }) {
  const { map, maps } = useMap();
  const handler = useRef(onComplete);

  useEffect(() => {
    handler.current = onComplete;
  });

  useEffect(() => {
    if (!map || !maps) return undefined;
    let first = null;
    let preview = null;
    let dot = null;
    const clear = () => {
      preview?.setMap?.(null);
      removeMarker(dot);
      preview = null;
      dot = null;
      first = null;
    };
    const clickListener = map.addListener('click', (e) => {
      if (!e.latLng) return;
      const pt = e.latLng.toJSON();
      if (!first) {
        first = pt;
        const content = el('div', 'h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-darkest shadow');
        content.style.transform = 'translateY(50%)';
        dot = addMarker(maps, map, { position: pt, content, zIndex: 9 });
        preview = new maps.Polyline({
          map,
          path: [pt, pt],
          strokeOpacity: 0,
          clickable: false,
          zIndex: 9,
          icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#ffffff', scale: 3 }, offset: '0', repeat: '12px' }],
        });
      } else {
        const a = first;
        clear();
        handler.current?.(a, pt);
      }
    });
    const moveListener = map.addListener('mousemove', (e) => {
      if (first && preview && e.latLng) preview.setPath([first, e.latLng.toJSON()]);
    });
    map.setOptions({ draggableCursor: 'crosshair' });
    return () => {
      clickListener?.remove?.();
      moveListener?.remove?.();
      clear();
      map.setOptions({ draggableCursor: null });
    };
  }, [map, maps]);

  return null;
}
