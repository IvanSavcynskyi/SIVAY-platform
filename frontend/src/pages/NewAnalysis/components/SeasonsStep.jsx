import { useMemo, useRef, useState } from 'react';
import Button from '../../../components/Button/Button';
import GoogleMapView from '../../../components/GoogleMap/GoogleMapView';
import { DrawLineLayer, FieldBoundaryLayer, PlotsLayer } from '../../../components/GoogleMap/MapLayers';
import { CROPS, getCropName } from '../../../constants/crops';
import { createSeason, saveCropRecord, saveSeasonLayout } from '../../../services/analysisApi';
import { formatHa, plotsWord } from '../../../utils/format';
import { pathBounds } from '../../../utils/geo';
import { MAX_PLOTS, mergePlots, movePlotVertex, removePlot, splitPlotsByLine, totalAreaHa, withColors } from '../lib/plots';
import { Chip, INPUT_CLASS, InfoNote, PlotBadge } from './ui';

const TOOLS = [
  ['split', 'Лінія розрізу'],
  ['merge', 'Об’єднати ділянки'],
  ['boundaries', 'Редагувати межі'],
  ['delete', 'Видалити ділянку'],
];
const NO_IDS = [];

function Legend() {
  return (
    <div className="rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-brand-text shadow-[0_3px_5px_rgba(8,46,32,0.1)]">
      <div className="flex items-center gap-2"><span className="h-[3px] w-4 rounded bg-brand" />Межа поля</div>
      <div className="mt-1 flex items-center gap-2"><span className="h-3 w-4 rounded-sm bg-[#bfd4fb]" />Ділянки сезону</div>
    </div>
  );
}

export default function SeasonsStep({ field, onFieldChange, onConfirm }) {
  const currentYear = new Date().getFullYear();

const years = useMemo(
  () =>
    Object.keys(field.seasons)
      .map(Number)
      .filter((year) => year <= currentYear)
      .sort((a, b) => b - a),
  [field.seasons, currentYear]
);

const latestYear = years[0];
const earliestYear = years[years.length - 1];

const [activeYear, setActiveYear] = useState(
  () => latestYear
);

  const [mode, setMode] = useState('view'); 
  const [cropPlotId, setCropPlotId] = useState(null);
  const [cropDraft, setCropDraft] = useState('');
  const [editPlots, setEditPlots] = useState([]);
  const editPlotsRef = useRef([]);
  const [tool, setTool] = useState('split');
  const [mergeSel, setMergeSel] = useState(NO_IDS);
  const [newSeasonMode, setNewSeasonMode] = useState('copy');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState(() => ({ bounds: pathBounds(field.boundary) }));

  const season = field.seasons[activeYear];
  const isLatest = activeYear === latestYear;
  const editing = mode === 'edit';
  const plots = useMemo(() => withColors(editing ? editPlots : season.plots), [editing, editPlots, season.plots]);
  const cropPlot = plots.find((p) => p.id === cropPlotId);

  const setEdit = (next) => {
    editPlotsRef.current = next;
    setEditPlots(next);
  };
  const error = (text) => setNotice({ type: 'error', text });
  const info = (text) => setNotice({ type: 'info', text });
  const run = async (task) => {
    setBusy(true);
    try {
      await task();
    } catch (e) {
      error(e.message || 'Сталася помилка. Спробуйте ще раз.');
    } finally {
      setBusy(false);
    }
  };

  const selectYear = (year) => {
    setActiveYear(year);
    setMode('view');
    setNotice(null);
    setFocus({ bounds: pathBounds(field.boundary) });
  };

  const openCrop = (plotId) => {
    const plot = season.plots.find((p) => p.id === plotId);
    if (!plot) return;
    setCropPlotId(plotId);
    setCropDraft(plot.cropId ?? '');
    setMode('crop');
    setNotice(null);
  };

  const saveCrop = () =>
    run(async () => {
      onFieldChange(await saveCropRecord(field.id, activeYear, cropPlotId, cropDraft || null));
      setMode('view');
      info(`Запис культури для ділянки ${cropPlot.label} збережено.`);
    });

  const startEdit = () => {
    setEdit(season.plots.map((p) => ({ ...p })));
    setTool('split');
    setMergeSel(NO_IDS);
    setMode('edit');
    info('Проведіть лінію через поле: клацніть у двох місцях. Лінія розділить усі ділянки, які перетинає.');
  };

  const confirmEdit = () =>
    run(async () => {
      onFieldChange(await saveSeasonLayout(field.id, activeYear, editPlotsRef.current));
      setMode('view');
      info(`Розбивку сезону ${activeYear} збережено. Інші сезони не змінено.`);
    });

  const pickTool = (next) => {
    setTool(next);
    setMergeSel(NO_IDS);
    const hints = {
      split: 'Клацніть у двох місцях карти — лінія розділить усі ділянки, які вона перетинає.',
      merge: 'Оберіть на карті дві сусідні ділянки та натисніть «Об’єднати вибрані».',
      boundaries: 'Перетягуйте точки меж між ділянками. Зовнішня межа поля незмінна.',
      delete: 'Натисніть ділянку на карті або «Видалити» у списку. Ділянки із записом культури видалити не можна.',
    };
    info(hints[next]);
  };

  const handleSplit = (a, b) => {
    const result = splitPlotsByLine(editPlotsRef.current, a, b);
    if (result.splitCount === 0) {
      error(editPlotsRef.current.length >= MAX_PLOTS ? `Максимум ${MAX_PLOTS} ділянок.` : 'Лінія не розділила жодної ділянки. Проведіть її через поле.');
      return;
    }
    setEdit(result.plots);
    setNotice(null);
  };

  const handleMerge = () => {
    const result = mergePlots(editPlotsRef.current, mergeSel[0], mergeSel[1]);
    if (result.error) return error(result.error);
    setEdit(result.plots);
    setMergeSel(NO_IDS);
    return setNotice(null);
  };

  const handleDelete = (id) => {
    const result = removePlot(editPlotsRef.current, id);
    if (result.error) return error(result.error);
    setEdit(result.plots);
    return setNotice(null);
  };

  const handlePlotClick = (id) => {
    if (mode === 'view' || mode === 'crop') return openCrop(id);
    if (!editing) return undefined;
    if (tool === 'delete') return handleDelete(id);
    if (tool === 'merge') return setMergeSel((sel) => (sel.includes(id) ? sel.filter((s) => s !== id) : sel.length >= 2 ? [sel[1], id] : [...sel, id]));
    return undefined;
  };

  const handleVertexMove = (oldPt, newPt) => {
    const result = movePlotVertex(editPlotsRef.current, field.boundary, oldPt, newPt);
    if (result.error) {
      error(result.error);
      return false;
    }
    setEdit(result.plots);
    return true;
  };

  const handleNewSeason = () =>
    run(async () => {
      const updated = await createSeason(field.id, { mode: newSeasonMode });
      const createdYear = Object.keys(updated.seasons).map(Number).find((y) => !field.seasons[y]);
      onFieldChange(updated);
      setActiveYear(createdYear);
      setMode('view');
      setFocus({ bounds: pathBounds(field.boundary) });
      info(`Сезон ${createdYear} створено. Інші сезони лишилися без змін — розбивку цього сезону можна змінити кнопкою «Редагувати розбивку».`);
    });

  const otherYears = years.filter((y) => y !== activeYear).reverse();
  const summarize = (y) => field.seasons[y].plots.map((p) => `${p.label} ${getCropName(p.cropId) ?? '—'}`).join(' · ');
  const selectedIds = mode === 'crop' && cropPlotId ? [cropPlotId] : editing && tool === 'merge' ? mergeSel : NO_IDS;
  const interactive = mode === 'view' || mode === 'crop' || (editing && (tool === 'merge' || tool === 'delete'));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-muted">Сезон</span>
          <div role="tablist" aria-label="Сезон" className="flex flex-1 gap-1 rounded-[14px] border border-border-soft bg-surface-panel p-1 md:flex-none">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                role="tab"
                aria-selected={y === activeYear}
                disabled={editing}
                onClick={() => selectYear(y)}
                className={`h-10 flex-1 cursor-pointer rounded-[10px] px-4 text-[15px] disabled:cursor-not-allowed md:flex-none ${
                  y === activeYear ? 'border border-[#bbf7d0] bg-brand-tint font-bold text-brand-dark' : 'border border-transparent font-semibold text-muted'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
            <Button
                variant="secondary"
                size="sm"
                className="w-full md:w-auto"
                disabled={editing || busy}
                onClick={() => {
                  setMode('newSeason');
                  setNotice(null);
                }}
              >
                Додати попередній сезон
              </Button>
      </div>

      {editing && (
        <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Інструменти розбивки">
          {TOOLS.map(([id, label]) => (
            <Chip key={id} active={tool === id} onClick={() => pickTool(id)}>{label}</Chip>
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-7">
        <GoogleMapView
          className="h-[340px] md:h-[440px] xl:h-[520px]"
          focus={focus}
          badge={editing ? 'Межа поля — незмінна' : 'Межа поля — постійна'}
          legend={<Legend />}
          ariaLabel={`Карта ділянок сезону ${activeYear}`}
        >
          <FieldBoundaryLayer path={field.boundary} showVertices />
          <PlotsLayer
            plots={plots}
            selectedIds={selectedIds}
            interactive={interactive}
            editable={editing && tool === 'boundaries'}
            onPlotClick={handlePlotClick}
            onVertexMove={handleVertexMove}
            onStructureChange={() => error('Додавати чи видаляти точки не можна — лише переміщувати наявні.')}
          />
          {editing && tool === 'split' && <DrawLineLayer onComplete={handleSplit} />}
        </GoogleMapView>

        <div className="flex min-w-0 flex-col gap-3">
          {mode === 'view' && (
            <>
              <div>
                <h3 className="m-0 text-lg font-bold text-brand-text">Ділянки сезону {activeYear}</h3>
                <p className="m-0 mt-0.5 text-[14px] text-muted">{plots.length} {plotsWord(plots.length)} · {formatHa(totalAreaHa(plots))}</p>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {plots.map((p) => (
                  <li key={p.id} className="flex min-h-[56px] items-center gap-3 rounded-[14px] border border-border-main bg-white px-3.5 py-2">
                    <PlotBadge label={p.label} />
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-[15px] font-semibold ${p.cropId ? 'text-brand-text' : 'text-muted'}`}>{getCropName(p.cropId) ?? 'Культуру не вказано'}</div>
                      <div className="text-[13px] text-muted">{formatHa(p.areaHa)}</div>
                    </div>
                    <button type="button" className="min-h-10 cursor-pointer px-1 text-[14px] font-bold text-brand-dark hover:underline" onClick={() => openCrop(p.id)}>Змінити</button>
                  </li>
                ))}
              </ul>
              <InfoNote tone="success">
                <strong>Межі ділянок — окремо для кожного року</strong>
                <br />
                <span className="text-muted">Однакові літери в різні роки — різні території. Зміна розбивки одного сезону не впливає на інші.</span>
              </InfoNote>
              <div className="flex flex-col gap-2.5">
                <Button variant="secondary" size="sm" className="w-full" onClick={startEdit}>Редагувати розбивку {activeYear}</Button>
                {isLatest ? (
                  <Button className="h-[52px] w-full text-base" arrow onClick={() => onConfirm(activeYear)}>Далі: культури сезону {activeYear + 1}</Button>
                ) : (
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => selectYear(latestYear)}>До поточного сезону {latestYear}</Button>
                )}
              </div>
            </>
          )}

          {mode === 'crop' && cropPlot && (
            <>
              <div>
                <h3 className="m-0 text-lg font-bold text-brand-text">Культура ділянки {cropPlot.label} · {activeYear}</h3>
                <p className="m-0 mt-0.5 text-[14px] text-muted">{formatHa(cropPlot.areaHa)} · запис належить сезону {activeYear} та цій ділянці.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="crop-select" className="text-[13px] font-semibold text-brand-text">Культура, що росла в сезоні {activeYear}</label>
                <select id="crop-select" className={INPUT_CLASS} value={cropDraft} onChange={(e) => setCropDraft(e.target.value)}>
                  <option value="">Не вказано</option>
                  {CROPS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {CROPS.slice(0, 6).map((c) => (
                  <Chip key={c.id} active={cropDraft === c.id} onClick={() => setCropDraft(cropDraft === c.id ? '' : c.id)}>{c.name}</Chip>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="sm" onClick={() => setMode('view')}>Скасувати</Button>
                <Button size="sm" disabled={busy} onClick={saveCrop}>Зберегти</Button>
              </div>
              {otherYears.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="m-0 text-[13px] font-bold text-brand-text">Записи інших сезонів</h4>
                  {otherYears.map((y) => (
                    <div key={y} className="flex items-center gap-3 rounded-[14px] border border-border-main bg-white px-3.5 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-bold text-brand-text">{y} · {field.seasons[y].plots.length} {plotsWord(field.seasons[y].plots.length)}</div>
                        <div className="truncate text-[13px] text-muted">{summarize(y)}</div>
                      </div>
                      <button type="button" className="min-h-10 cursor-pointer px-1 text-[13px] font-bold text-brand-dark hover:underline" onClick={() => selectYear(y)}>Переглянути</button>
                    </div>
                  ))}
                  <p className="m-0 text-[12.5px] leading-[1.5] text-muted">Літери ділянок у різних роках — різні території, тому записи не об’єднуються.</p>
                </div>
              )}
            </>
          )}

          {editing && (
            <>
              <div>
                <h3 className="m-0 text-lg font-bold text-brand-text">Редагування розбивки · {activeYear}</h3>
                <p className="m-0 mt-0.5 text-[14px] leading-[1.5] text-muted">Зміни стосуються лише сезону {activeYear}.</p>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {plots.map((p) => (
                  <li key={p.id} className="flex min-h-[52px] items-center gap-3 rounded-[14px] border border-border-main bg-white px-3.5 py-2">
                    <PlotBadge label={p.label} />
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-[15px] font-semibold ${p.cropId ? 'text-brand-text' : 'text-muted'}`}>{getCropName(p.cropId) ?? 'Культуру не вказано'}</div>
                      <div className="text-[13px] text-muted">{formatHa(p.areaHa)}</div>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(p.cropId)}
                      className="min-h-10 cursor-pointer px-1 text-[14px] font-bold text-brand-dark hover:underline disabled:cursor-not-allowed disabled:text-muted/50 disabled:no-underline"
                      onClick={() => handleDelete(p.id)}
                    >
                      Видалити
                    </button>
                  </li>
                ))}
              </ul>
              {plots.some((p) => p.cropId) && (
                <p className="m-0 text-[12.5px] text-muted">Видалення недоступне для ділянок із записом культури ({plots.filter((p) => p.cropId).map((p) => p.label).join(', ')}).</p>
              )}
              {tool === 'merge' && (
                <Button variant="secondary" size="sm" disabled={mergeSel.length !== 2} onClick={handleMerge}>Об’єднати вибрані</Button>
              )}
              <button
                type="button"
                className="min-h-11 cursor-pointer rounded-[14px] border border-dashed border-border-main text-[14px] font-bold text-brand-dark hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
                disabled={plots.length >= MAX_PLOTS}
                onClick={() => pickTool('split')}
              >
                + Додати ділянку
              </button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="sm" onClick={() => { setMode('view'); setNotice(null); }}>Скасувати</Button>
                <Button size="sm" disabled={busy} onClick={confirmEdit}>Підтвердити</Button>
              </div>
            </>
          )}

          {mode === 'newSeason' && (
            <>
              <div>
                <h3 className="m-0 text-lg font-bold text-brand-text">Попередній сезон {earliestYear - 1}</h3>
                <p className="m-0 mt-0.5 text-[14px] leading-[1.5] text-muted">Межі ділянок кожного року окремі. Попередні сезони не зміняться.</p>
              </div>
              {[
                ['copy', `Скопіювати розбивку ${earliestYear}`, 'Ті самі ділянки, але без записів культур — далі їх можна змінити.'],
                ['single', 'Одне поле без розбивки', 'Весь контур поля як одна ділянка.'],
              ].map(([id, title, text]) => (
                <label key={id} className={`flex min-h-[64px] cursor-pointer items-start gap-3 rounded-[14px] border p-3.5 ${newSeasonMode === id ? 'border-brand bg-brand-tint' : 'border-border-main bg-white'}`}>
                  <input type="radio" name="new-season-mode" className="mt-1 h-4 w-4 accent-[#19c463]" checked={newSeasonMode === id} onChange={() => setNewSeasonMode(id)} />
                  <span>
                    <span className="block text-[15px] font-bold text-brand-text">{title}</span>
                    <span className="block text-[13px] leading-[1.5] text-muted">{text}</span>
                  </span>
                </label>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="sm" onClick={() => setMode('view')}>Скасувати</Button>
                <Button size="sm" disabled={busy} onClick={handleNewSeason}>Створити сезон</Button>
              </div>
            </>
          )}

          {notice && <InfoNote tone={notice.type === 'error' ? 'error' : 'info'}>{notice.text}</InfoNote>}
        </div>
      </div>
    </div>
  );
}
