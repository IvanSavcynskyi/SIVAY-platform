import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { IconMinus, IconPlus, IconTarget } from '../AnalysisIcons/AnalysisIcons';
import { GOOGLE_MAPS_MAP_ID, hasAuthFailed, isMapsConfigured, loadGoogleMaps, subscribeAuthFailure } from './loadGoogleMaps';
import { MapContext } from './mapContext';

const UKRAINE = { lat: 49.0, lng: 31.5 };
const controlBtn = 'grid h-11 w-11 cursor-pointer place-items-center text-brand-text transition-colors hover:bg-brand-tint md:h-[38px] md:w-[38px]';

export default function GoogleMapView({ focus, badge, legend, className = '', children, ariaLabel }) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [mapType, setMapType] = useState('satellite');
  const [initial] = useState({ center: UKRAINE, zoom: 6 });
  const [error, setError] = useState(() => {
    if (!isMapsConfigured()) return 'MISSING_KEY';
    return hasAuthFailed() ? 'AUTH_FAILED' : null;
  });

  const effectiveAriaLabel = ariaLabel || t('googleMap.defaultAriaLabel');

  useEffect(() => {
    if (!isMapsConfigured()) return undefined;
    let cancelled = false;
    let mapsApi = null;
    let created = null;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        mapsApi = maps;
        created = new maps.Map(containerRef.current, {
          center: initial.center,
          zoom: initial.zoom,
          mapId: GOOGLE_MAPS_MAP_ID,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          clickableIcons: false,
          keyboardShortcuts: false,
          gestureHandling: window.matchMedia('(pointer: coarse)').matches ? 'cooperative' : 'greedy',
        });
        setCtx({ map: created, maps });
      })
      .catch(() => {
        if (!cancelled) setError('LOAD_FAILED');
      });
    const unsubscribe = subscribeAuthFailure(() => setError('AUTH_FAILED'));
    return () => {
      cancelled = true;
      unsubscribe();
      if (created && mapsApi) mapsApi.event.clearInstanceListeners(created);
    };
  }, [initial]);

  useEffect(() => {
    if (!ctx || !focus) return;
    const { map, maps } = ctx;
    try {
      if (focus.bounds) {
        const { south, north, west, east } = focus.bounds;
        if (Number.isFinite(south) && Number.isFinite(north) && Number.isFinite(west) && Number.isFinite(east) && south <= north) {
          map.fitBounds(focus.bounds, 32);
          maps.event.addListenerOnce(map, 'idle', () => {
            if ((map.getZoom() ?? 0) > 19) map.setZoom(19);
          });
        }
      } else if (focus.center) {
        const { lat, lng } = focus.center;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          map.setCenter(focus.center);
          map.setZoom(focus.zoom ?? 14);
        }
      }
    } catch {
      // Safe fallback
    }
  }, [ctx, focus]);

  useEffect(() => {
    if (ctx) ctx.map.setMapTypeId(mapType);
  }, [ctx, mapType]);

  const zoomBy = (delta) => ctx && ctx.map.setZoom((ctx.map.getZoom() ?? 6) + delta);
  const recenter = () => {
    if (!ctx || !focus) return;
    try {
      if (focus.bounds) {
        const { south, north, west, east } = focus.bounds;
        if (Number.isFinite(south) && Number.isFinite(north) && Number.isFinite(west) && Number.isFinite(east) && south <= north) {
          ctx.map.fitBounds(focus.bounds, 32);
        }
      } else if (focus.center) {
        const { lat, lng } = focus.center;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          ctx.map.setCenter(focus.center);
          ctx.map.setZoom(focus.zoom ?? 14);
        }
      }
    } catch {
      // Safe fallback
    }
  };

  const getProblem = (code) => {
    if (!code) return null;
    switch (code) {
      case 'MISSING_KEY':
        return {
          title: t('googleMap.missingKeyTitle'),
          text: t('googleMap.missingKeyText'),
        };
      case 'AUTH_FAILED':
        return {
          title: t('googleMap.rejectedKeyTitle'),
          text: t('googleMap.rejectedKeyText'),
        };
      case 'LOAD_FAILED':
        return {
          title: t('googleMap.failedLoadTitle'),
          text: t('googleMap.failedLoadText'),
        };
      default:
        return null;
    }
  };

  const problem = getProblem(error);

  return (
    <div className={`relative isolate overflow-hidden rounded-[20px] bg-[#1f2a25] md:rounded-[28px] ${className}`}>
      <div ref={containerRef} className="absolute inset-0" role="application" aria-label={effectiveAriaLabel} />

      {problem && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-surface-alt p-6 text-center" role="alert">
          <div className="max-w-sm">
            <p className="m-0 text-lg font-bold text-brand-text">{problem.title}</p>
            <p className="m-0 mt-2 text-[15px] leading-[1.5] text-muted">{problem.text}</p>
          </div>
        </div>
      )}

      {ctx && !problem && (
        <>
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-2">
            <div className="pointer-events-auto">
              {badge && <span className="inline-flex rounded-full bg-white px-3 py-1.5 text-[13px] font-bold text-brand-dark shadow-[0_3px_5px_rgba(8,46,32,0.1)]">{badge}</span>}
            </div>
            <div className="pointer-events-auto ml-auto flex gap-1 rounded-xl bg-white p-1 shadow-[0_3px_5px_rgba(8,46,32,0.1)]" role="group" aria-label={t('googleMap.mapTypeAria')}>
              {[
                ['roadmap', t('googleMap.roadmap')],
                ['satellite', t('googleMap.satellite')],
              ].map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={mapType === type}
                  onClick={() => setMapType(type)}
                  className={`h-10 cursor-pointer rounded-[9px] border px-3 text-[13px] md:h-[34px] ${
                    mapType === type ? 'border-[#bbf7d0] bg-brand-tint font-bold text-brand-dark' : 'border-transparent font-semibold text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute right-3 bottom-8 z-10 flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_3px_10px_rgba(8,46,32,0.1)]">
            <button type="button" className={controlBtn} aria-label={t('googleMap.zoomIn')} onClick={() => zoomBy(1)}><IconPlus size={18} /></button>
            <button type="button" className={controlBtn} aria-label={t('googleMap.zoomOut')} onClick={() => zoomBy(-1)}><IconMinus size={18} /></button>
            <button type="button" className={controlBtn} aria-label={t('googleMap.recenter')} onClick={recenter}><IconTarget size={18} /></button>
          </div>

          {legend && <div className="pointer-events-none absolute bottom-8 left-3 z-10">{legend}</div>}

          <MapContext.Provider value={ctx}>{children}</MapContext.Provider>
        </>
      )}
    </div>
  );
}
