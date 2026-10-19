import { useEffect, useId, useState } from 'react';
import Button from '../../../components/Button/Button';
import { IconCheck, IconPin, IconPolygon, IconSearch, IconShield } from '../../../components/AnalysisIcons/AnalysisIcons';
import GoogleMapView from '../../../components/GoogleMap/GoogleMapView';
import { isMapsConfigured } from '../../../components/GoogleMap/loadGoogleMaps';
import { DrawPolygonLayer, FieldBoundaryLayer, LocationMarker } from '../../../components/GoogleMap/MapLayers';
import { createField, listFields } from '../../../services/analysisApi';
import { geocodePlace } from '../../../services/geocoding';
import { formatHa } from '../../../utils/format';
import { isSelfIntersecting, parseCoordinate, pathBounds, polygonAreaHa } from '../../../utils/geo';
import { INPUT_CLASS, InfoNote, LinkButton } from './ui';

const MIN_FIELD_HA = 0.05;
const DEMO_BOUNDARY = [
  { lat: 49.5, lng: 34.5 },
  { lat: 49.5, lng: 34.5069 },
  { lat: 49.504522, lng: 34.5069 },
  { lat: 49.504522, lng: 34.5 },
];

export default function FieldStep({ onFieldReady }) {
  const ids = useId();
  const [tab, setTab] = useState('search');
  const [mode, setMode] = useState('locate');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [place, setPlace] = useState(null);
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [coordError, setCoordError] = useState('');
  const [drawPoints, setDrawPoints] = useState([]);
  const [boundary, setBoundary] = useState(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [savedFields, setSavedFields] = useState([]);
  const [previewField, setPreviewField] = useState(null);
  const [focus, setFocus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listFields()
      .then((fields) => {
        if (!cancelled && Array.isArray(fields)) setSavedFields(fields);
      })
      .catch(() => {
        if (!cancelled) setSavedFields([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmed = query.trim();
  useEffect(() => {
    if (tab !== 'search' || trimmed.length < 3) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const results = await geocodePlace(trimmed);
        if (cancelled) return;
        setSuggestions(results);
        if (!results.length) setSearchError('Нічого не знайдено. Спробуйте іншу назву або введіть координати.');
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setSearchError('Пошук недоступний. Перевірте налаштування Google Maps або введіть координати.');
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, tab]);

  const shownSuggestions = trimmed.length >= 3 ? suggestions : [];

  const choosePlace = (s) => {
    setPlace(s);
    setFocus(s.viewport ? { bounds: s.viewport } : { center: s.center, zoom: 14 });
  };

  const applyCoords = () => {
    const lat = parseCoordinate(coords.lat, -90, 90);
    const lng = parseCoordinate(coords.lng, -180, 180);
    if (lat == null || lng == null) {
      setCoordError('Введіть коректні координати: широта від −90 до 90, довгота від −180 до 180.');
      return;
    }
    setCoordError('');
    const center = { lat, lng };
    setPlace({ id: `coords-${lat}-${lng}`, title: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, subtitle: '', region: '', center });
    setFocus({ center, zoom: 16 });
  };

  const startDrawing = () => {
    setMode('draw');
    setDrawPoints([]);
    setFormError('');
  };

  const finishDrawing = () => {
    if (drawPoints.length < 3) return;
    if (isSelfIntersecting(drawPoints)) {
      setFormError('Межі перетинають самі себе. Видаліть останню точку або почніть спочатку.');
      return;
    }
    if (polygonAreaHa(drawPoints) < MIN_FIELD_HA) {
      setFormError('Контур занадто малий. Позначте межі всього поля.');
      return;
    }
    setFormError('');
    setBoundary(drawPoints);
    setName(`Поле №${savedFields.length + 1}`);
    setMode('edit');
    const bounds = pathBounds(drawPoints);
    if (bounds) {
      setFocus({ bounds });
    }
  };

  const cancelDrawing = () => {
    setMode('locate');
    setDrawPoints([]);
    setBoundary(null);
    setPreviewField(null);
    setFormError('');
  };

  const saveField = async () => {
    if (!name.trim()) {
      setFormError('Вкажіть назву поля.');
      return;
    }
    if (isSelfIntersecting(boundary)) {
      setFormError('Межі перетинають самі себе. Перетягніть точки так, щоб контур не перетинався.');
      return;
    }
    setSaving(true);
    try {
      const field = await createField({ name: name.trim(), region: place?.region ?? '', boundary, areaHa: polygonAreaHa(boundary) });
      onFieldReady(field);
    } catch (error) {
      setFormError(error.message || 'Не вдалося зберегти поле.');
    } finally {
      setSaving(false);
    }
  };

  const createDemoField = async () => {
    setSaving(true);
    try {
      const field = await createField({ name: 'Демо-поле', region: 'Полтавська область', boundary: DEMO_BOUNDARY, areaHa: polygonAreaHa(DEMO_BOUNDARY) });
      onFieldReady(field);
    } catch (error) {
      setFormError(error.message || 'Не вдалося створити демо-поле.');
    } finally {
      setSaving(false);
    }
  };

  const previewSaved = (fieldId) => {
    const field = savedFields.find((f) => f.id === fieldId);
    if (!field || !Array.isArray(field.boundary)) return;
    setPreviewField(field);
    setMode('saved');
    const bounds = pathBounds(field.boundary);
    if (bounds) {
      setFocus({ bounds });
    }
  };

  const area = mode === 'draw' ? polygonAreaHa(drawPoints) : boundary ? polygonAreaHa(boundary) : 0;
  const tabClass = (active) =>
    `flex h-11 flex-1 cursor-pointer items-center justify-center rounded-[10px] px-3 text-[14px] md:h-10 ${
      active ? 'border border-border-soft bg-white font-bold text-brand-dark shadow-[0_3px_5px_rgba(8,46,32,0.1)]' : 'font-semibold text-muted'
    }`;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_424px] xl:gap-7">
      <GoogleMapView className="h-[340px] md:h-[440px] xl:h-[560px]" focus={focus} ariaLabel="Карта вибору поля">
        {mode === 'locate' && place && <LocationMarker position={place.center} label={place.title} />}
        {mode === 'draw' && <DrawPolygonLayer points={drawPoints} onAddPoint={(pt) => setDrawPoints((p) => [...p, pt])} onClose={finishDrawing} />}
        {mode === 'edit' && boundary && <FieldBoundaryLayer path={boundary} editable onChange={setBoundary} />}
        {mode === 'saved' && previewField && <FieldBoundaryLayer path={previewField.boundary} showVertices />}
      </GoogleMapView>

      <div className="flex min-w-0 flex-col gap-4">
        {mode === 'locate' && (
          <>
            <div className="flex gap-1 rounded-[14px] bg-surface-panel p-1" role="tablist" aria-label="Спосіб пошуку місця">
              <button type="button" role="tab" aria-selected={tab === 'search'} className={tabClass(tab === 'search')} onClick={() => setTab('search')}>Пошук місця</button>
              <button type="button" role="tab" aria-selected={tab === 'coords'} className={tabClass(tab === 'coords')} onClick={() => setTab('coords')}>Координати</button>
            </div>

            {tab === 'search' ? (
              <div className="flex flex-col gap-2">
                <label htmlFor={`${ids}-q`} className="text-[13px] font-semibold text-brand-text">Населений пункт, громада або область</label>
                <div className="flex h-[52px] items-center gap-2.5 rounded-[14px] border-[1.5px] border-border-main bg-white px-4 focus-within:border-brand">
                  <IconSearch size={18} className="text-muted" />
                  <input
                    id={`${ids}-q`}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Наприклад, с. Хомутець"
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-brand-text placeholder:text-muted"
                  />
                </div>
                {searching && <p className="m-0 text-[13px] text-muted" role="status">Шукаємо…</p>}
                {searchError && !searching && <p className="m-0 text-[13px] text-danger" role="alert">{searchError}</p>}
                {shownSuggestions.length > 0 && (
                  <ul className="m-0 mt-1 list-none overflow-hidden rounded-[14px] border border-border-soft bg-white p-0">
                    {shownSuggestions.map((s) => {
                      const selected = place?.id === s.id;
                      return (
                        <li key={s.id} className="border-b border-border-soft last:border-b-0">
                          <button
                            type="button"
                            onClick={() => choosePlace(s)}
                            aria-pressed={selected}
                            className={`flex min-h-[52px] w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left ${selected ? 'bg-brand-tint' : 'bg-white hover:bg-brand-tint'}`}
                          >
                            <IconPin size={16} className={selected ? 'text-brand-dark' : 'text-muted'} />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-[14px] font-semibold text-brand-text">{s.title}</span>
                              {s.subtitle && <span className="truncate text-[13px] text-muted">{s.subtitle}</span>}
                            </span>
                            {selected && <IconCheck size={16} className="text-brand-dark" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['lat', 'Широта', '49.98765'],
                    ['lng', 'Довгота', '33.45678'],
                  ].map(([key, label, ph]) => (
                    <div key={key} className="flex flex-col gap-2">
                      <label htmlFor={`${ids}-${key}`} className="text-[13px] font-semibold text-brand-text">{label}</label>
                      <input
                        id={`${ids}-${key}`}
                        inputMode="decimal"
                        value={coords[key]}
                        onChange={(e) => setCoords((c) => ({ ...c, [key]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && applyCoords()}
                        placeholder={ph}
                        className={INPUT_CLASS}
                        aria-invalid={Boolean(coordError)}
                      />
                    </div>
                  ))}
                </div>
                <p className="m-0 text-[13px] text-muted">Десяткові градуси, наприклад 49.98765 (крапка або кома).</p>
                {coordError && <p className="m-0 text-[13px] text-danger" role="alert">{coordError}</p>}
                <Button variant="secondary" size="sm" className="w-full" onClick={applyCoords}>Показати на карті</Button>
              </div>
            )}

            {savedFields.length > 0 && (
              <div className="flex flex-col gap-2">
                <label htmlFor={`${ids}-saved`} className="text-[13px] font-semibold text-brand-text">Або оберіть збережене поле</label>
                <select id={`${ids}-saved`} className={INPUT_CLASS} defaultValue="" onChange={(e) => previewSaved(e.target.value)}>
                  <option value="" disabled>Оберіть поле…</option>
                  {savedFields.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} · {formatHa(f.areaHa)}</option>
                  ))}
                </select>
              </div>
            )}

            <InfoNote>
              <strong>Пошук лише переміщує карту до вибраного місця.</strong> Він не визначає ваше поле автоматично — позначте його межі на карті.
            </InfoNote>
            <Button className="h-[52px] w-full text-base" onClick={startDrawing}>
              <span className="inline-flex items-center gap-2"><IconPolygon size={18} />Позначити межі поля</span>
            </Button>
            {!isMapsConfigured() && (
              <div className="flex flex-col gap-2 rounded-[14px] border border-dashed border-border-main p-3.5">
                <p className="m-0 text-[13px] leading-[1.5] text-muted">Ключ Google Maps не налаштовано. Щоб переглянути наступні кроки без карти, створіть демо-поле (лише для перегляду, зберігається у вашому браузері).</p>
                <Button variant="secondary" size="sm" className="w-full" disabled={saving} onClick={createDemoField}>Створити демо-поле (без карти)</Button>
              </div>
            )}
            <Privacy />
          </>
        )}

        {mode === 'draw' && (
          <>
            <div>
              <h3 className="m-0 text-lg font-bold text-brand-text">Позначте межі поля</h3>
              <p className="m-0 mt-1 text-[14px] leading-[1.5] text-muted">
                Торкайтеся карти (або клацайте), щоб додавати кути поля — щонайменше три. Щоб завершити, натисніть першу точку або кнопку нижче.
              </p>
            </div>
            <div className="rounded-[14px] bg-surface-panel px-4 py-3 text-[14px] text-brand-text" role="status">
              Точок: <strong>{drawPoints.length}</strong> · Площа: <strong>{drawPoints.length >= 3 ? formatHa(area) : '—'}</strong>
            </div>
            {formError && <InfoNote tone="error">{formError}</InfoNote>}
            <Button className="h-[52px] w-full text-base" disabled={drawPoints.length < 3} onClick={finishDrawing}>Завершити контур</Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="sm" disabled={drawPoints.length === 0} onClick={() => setDrawPoints((p) => p.slice(0, -1))}>Видалити точку</Button>
              <Button variant="secondary" size="sm" onClick={cancelDrawing}>Скасувати</Button>
            </div>
          </>
        )}

        {mode === 'edit' && (
          <>
            <div>
              <h3 className="m-0 text-lg font-bold text-brand-text">Межі поля · {formatHa(area)}</h3>
              <p className="m-0 mt-1 text-[14px] leading-[1.5] text-muted">Перетягніть точки на карті, щоб уточнити межі. Після збереження зовнішня межа поля стає постійною.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={`${ids}-name`} className="text-[13px] font-semibold text-brand-text">Назва поля</label>
              <input id={`${ids}-name`} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={INPUT_CLASS} />
            </div>
            {formError && <InfoNote tone="error">{formError}</InfoNote>}
            <Button className="h-[52px] w-full text-base" arrow disabled={saving} onClick={saveField}>{saving ? 'Зберігаємо…' : 'Зберегти поле'}</Button>
            <Button variant="secondary" size="sm" className="w-full" onClick={startDrawing}>Перемалювати межі</Button>
          </>
        )}

        {mode === 'saved' && previewField && (
          <>
            <div>
              <h3 className="m-0 text-lg font-bold text-brand-text">{previewField.name}</h3>
              <p className="m-0 mt-1 text-[14px] text-muted">{formatHa(previewField.areaHa)}{previewField.region ? ` · ${previewField.region}` : ''}</p>
            </div>
            <InfoNote tone="success">Межі поля вже збережені й не змінюються. Далі оберіть сезон та ділянки.</InfoNote>
            <Button className="h-[52px] w-full text-base" arrow onClick={() => onFieldReady(previewField)}>Використати це поле</Button>
            <LinkButton className="self-start" onClick={cancelDrawing}>Обрати інше місце або поле</LinkButton>
          </>
        )}
      </div>
    </div>
  );
}

function Privacy() {
  return (
    <p className="m-0 flex items-center gap-2 text-[13px] leading-[1.5] text-muted">
      <IconShield size={16} className="text-brand-dark" />
      Дані поля використовуються лише для цього розрахунку.
    </p>
  );
}
