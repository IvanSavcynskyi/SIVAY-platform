import { useMemo, useRef, useState } from 'react';
import Button from '../../../components/Button/Button';
import GoogleMapView from '../../../components/GoogleMap/GoogleMapView';
import { DrawLineLayer, FieldBoundaryLayer, PlotsLayer } from '../../../components/GoogleMap/MapLayers';
import { getCropName, getLocalizedCrops } from '../../../constants/crops';
import { useLanguage } from '../../../context/LanguageContext';
import { createSeason, saveCropRecord, saveSeasonLayout } from '../../../services/analysisApi';
import { formatHa, plotsWord } from '../../../utils/format';
import { pathBounds } from '../../../utils/geo';
import { MAX_PLOTS, mergePlots, movePlotVertex, removePlot, splitPlotsByLine, totalAreaHa, withColors } from '../lib/plots';
import { Chip, INPUT_CLASS, InfoNote, PlotBadge } from './ui';

const NO_IDS = [];

function Legend({ t }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-brand-text shadow-[0_3px_5px_rgba(8,46,32,0.1)]">
      <div className="flex items-center gap-2"><span className="h-[3px] w-4 rounded bg-brand" />{t('analysisPage.seasonsStep.legendField')}</div>
      <div className="mt-1 flex items-center gap-2"><span className="h-3 w-4 rounded-sm bg-[#bfd4fb]" />{t('analysisPage.seasonsStep.legendPlots')}</div>
    </div>
  );
}

export default function SeasonsStep({ field, onFieldChange, onConfirm }) {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const fieldSeasons = field?.seasons;
  const years = useMemo(() => {
    if (!fieldSeasons || typeof fieldSeasons !== 'object') return [];
    return Object.keys(fieldSeasons)
      .map(Number)
      .filter((year) => Number.isFinite(year) && year <= currentYear)
      .sort((a, b) => b - a);
  }, [fieldSeasons, currentYear]);

  const latestYear = years[0] ?? currentYear;
  const earliestYear = years.length > 0 ? years[years.length - 1] : currentYear;

  const [activeYear, setActiveYear] = useState(() => latestYear);

  const effectiveYear =
    field?.seasons && activeYear in field.seasons
      ? activeYear
      : (latestYear in (field?.seasons || {}) ? latestYear : years[0]);

  const season = field?.seasons?.[effectiveYear] || null;
  const canEditLayout = Boolean(season);
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
  const [focus, setFocus] = useState(() => {
    const bounds = pathBounds(field?.boundary);
    return bounds ? { bounds } : null;
  });

  const editing = mode === 'edit';
  const seasonPlots = useMemo(
    () => (Array.isArray(season?.plots) ? season.plots.filter(Boolean) : []),
    [season]
  );
  const plots = useMemo(
    () => withColors(editing ? editPlots : seasonPlots),
    [editing, editPlots, seasonPlots]
  );
  const cropPlot = plots.find((p) => p.id === cropPlotId);

  const localizedCrops = useMemo(() => getLocalizedCrops(t), [t]);

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
      error(e.message || t('analysisPage.seasonsStep.notices.genericError'));
    } finally {
      setBusy(false);
    }
  };

  const selectYear = (year) => {
    setActiveYear(year);
    setMode('view');
    setNotice(null);
    const bounds = pathBounds(field?.boundary);
    if (bounds) {
      setFocus({ bounds });
    }
  };

  const openCrop = (plotId) => {
    const plot = seasonPlots.find((p) => p.id === plotId);
    if (!plot) return;
    setCropPlotId(plotId);
    setCropDraft(plot.cropId ?? '');
    setMode('crop');
    setNotice(null);
  };

  const saveCrop = () =>
    run(async () => {
      onFieldChange(await saveCropRecord(field.id, effectiveYear, cropPlotId, cropDraft || null));
      setMode('view');
      info(t('analysisPage.seasonsStep.notices.cropSaved', { label: cropPlot?.label || '' }));
    });

  const startEdit = () => {
    setEdit(seasonPlots.map((p) => ({ ...p })));
    setTool('split');
    setMergeSel(NO_IDS);
    setMode('edit');
    info(t('analysisPage.seasonsStep.hints.splitInit'));
  };

  const confirmEdit = () =>
    run(async () => {
      onFieldChange(await saveSeasonLayout(field.id, effectiveYear, editPlotsRef.current));
      setMode('view');
      info(t('analysisPage.seasonsStep.notices.layoutSaved', { year: effectiveYear }));
    });

  const pickTool = (next) => {
    setTool(next);
    setMergeSel(NO_IDS);
    const hints = {
      split: t('analysisPage.seasonsStep.hints.split'),
      merge: t('analysisPage.seasonsStep.hints.merge'),
      boundaries: t('analysisPage.seasonsStep.hints.boundaries'),
      delete: t('analysisPage.seasonsStep.hints.delete'),
    };
    info(hints[next]);
  };

  const handleSplit = (a, b) => {
    if (editPlotsRef.current.length >= MAX_PLOTS) {
      error(t('analysisPage.seasonsStep.notices.maxPlots', { max: MAX_PLOTS }));
      return;
    }
    const result = splitPlotsByLine(editPlotsRef.current, a, b);
    if (result.splitCount === 0) {
      error(t('analysisPage.seasonsStep.notices.splitNoCut'));
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
      const targetYear = earliestYear - 1;
      const updated = await createSeason(field.id, { mode: newSeasonMode, year: targetYear });
      onFieldChange(updated);
      setActiveYear(targetYear);
      setMode('view');
      info(t('analysisPage.seasonsStep.notices.seasonCreated', { year: targetYear }));
    });

  const otherYears = years.filter((y) => y !== effectiveYear).reverse();
  const summarize = (y) => {
    const s = field?.seasons?.[y];
    if (!s || !Array.isArray(s.plots)) return '—';
    return s.plots.map((p) => `${p.label} ${getCropName(p.cropId, t) ?? '—'}`).join(' · ');
  };
  const selectedIds = mode === 'crop' && cropPlotId ? [cropPlotId] : editing && tool === 'merge' ? mergeSel : NO_IDS;
  const interactive = mode === 'view' || mode === 'crop' || (editing && (tool === 'merge' || tool === 'delete'));

  const toolsList = [
    ['split', t('analysisPage.seasonsStep.tools.split')],
    ['merge', t('analysisPage.seasonsStep.tools.merge')],
    ['boundaries', t('analysisPage.seasonsStep.tools.boundaries')],
    ['delete', t('analysisPage.seasonsStep.tools.delete')],
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-muted">{t('analysisPage.seasonsStep.seasonLabel')}</span>
          <div role="tablist" aria-label={t('analysisPage.seasonsStep.seasonLabel')} className="flex flex-1 gap-1 rounded-[14px] border border-border-soft bg-surface-panel p-1 md:flex-none">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                role="tab"
                aria-selected={y === effectiveYear}
                disabled={editing}
                onClick={() => selectYear(y)}
                className={`h-10 flex-1 cursor-pointer rounded-[10px] px-4 text-[15px] disabled:cursor-not-allowed md:flex-none ${
                  y === effectiveYear ? 'border border-[#bbf7d0] bg-brand-tint font-bold text-brand-dark' : 'border border-transparent font-semibold text-muted'
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
          {t('analysisPage.seasonsStep.addPrevSeasonBtn')}
        </Button>
      </div>

      {editing && (
        <div className="flex flex-wrap gap-2" role="toolbar" aria-label={t('analysisPage.seasonsStep.toolbarAria')}>
          {toolsList.map(([id, label]) => (
            <Chip key={id} active={tool === id} onClick={() => pickTool(id)}>{label}</Chip>
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-7">
        <GoogleMapView
          className="h-[340px] md:h-[440px] xl:h-[520px]"
          focus={focus}
          badge={editing ? t('analysisPage.seasonsStep.mapBadgeEditing') : t('analysisPage.seasonsStep.mapBadgeViewing')}
          legend={<Legend t={t} />}
          ariaLabel={t('analysisPage.seasonsStep.mapAria', { year: effectiveYear })}
        >
          <FieldBoundaryLayer path={field.boundary} showVertices />
          <PlotsLayer
            plots={plots}
            selectedIds={selectedIds}
            interactive={interactive}
            editable={editing && tool === 'boundaries'}
            onPlotClick={handlePlotClick}
            onVertexMove={handleVertexMove}
            onStructureChange={() => error(t('analysisPage.seasonsStep.notices.noAddOrRemovePoints'))}
          />
          {editing && tool === 'split' && <DrawLineLayer onComplete={handleSplit} />}
        </GoogleMapView>

        <div className="flex min-w-0 flex-col gap-3">
          {mode === 'view' && (
            <>
              <div>
                <h3 className="m-0 text-lg font-bold text-brand-text">
                  {t('analysisPage.seasonsStep.plotsTitle', { year: effectiveYear })}
                </h3>
                <p className="m-0 mt-0.5 text-[14px] text-muted">
                  {plots.length} {plotsWord(plots.length, language)} · {formatHa(totalAreaHa(plots), language)}
                </p>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {plots.map((p) => (
                  <li key={p.id} className="flex min-h-[56px] items-center gap-3 rounded-[14px] border border-border-main bg-white px-3.5 py-2">
                    <PlotBadge label={p.label} />
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-[15px] font-semibold ${p.cropId ? 'text-brand-text' : 'text-muted'}`}>
                        {getCropName(p.cropId, t) ?? t('analysisPage.seasonsStep.cropNotSpecified')}
                      </div>
                      <div className="text-[13px] text-muted">{formatHa(p.areaHa, language)}</div>
                    </div>
                    <button
                      type="button"
                      className="min-h-10 cursor-pointer px-1 text-[14px] font-bold text-brand-dark hover:underline"
                      onClick={() => openCrop(p.id)}
                    >
                      {t('analysisPage.seasonsStep.change')}
                    </button>
                  </li>
                ))}
              </ul>
              <InfoNote tone="success">
                <strong>{t('analysisPage.seasonsStep.independentPlotsTitle')}</strong>
                <br />
                <span className="text-muted">{t('analysisPage.seasonsStep.independentPlotsDesc')}</span>
              </InfoNote>
              {canEditLayout && (
                <div className="flex flex-col gap-2.5">
                  <Button variant="secondary" size="sm" className="w-full" onClick={startEdit}>
                    {t('analysisPage.seasonsStep.editDivision')}
                  </Button>
                  <Button className="h-[52px] w-full text-base" arrow onClick={() => onConfirm(effectiveYear)}>
                    {t('analysisPage.seasonsStep.nextCrops', { year: effectiveYear })}
                  </Button>
                </div>
              )}
            </>
          )}

          {mode === 'crop' && cropPlot && (
            <>
              <div>
                <h3 className="m-0 text-lg font-bold text-brand-text">
                  {t('analysisPage.seasonsStep.cropTitle', { label: cropPlot.label, year: effectiveYear })}
                </h3>
                <p className="m-0 mt-0.5 text-[14px] text-muted">
                  {formatHa(cropPlot.areaHa, language)} · {t('analysisPage.seasonsStep.cropDesc', { year: effectiveYear })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="crop-select" className="text-[13px] font-semibold text-brand-text">
                  {t('analysisPage.seasonsStep.cropSelectLabel', { year: effectiveYear })}
                </label>
                <select id="crop-select" className={INPUT_CLASS} value={cropDraft} onChange={(e) => setCropDraft(e.target.value)}>
                  <option value="">{t('analysisPage.seasonsStep.cropNotSet')}</option>
                  {localizedCrops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {localizedCrops.slice(0, 6).map((c) => (
                  <Chip key={c.id} active={cropDraft === c.id} onClick={() => setCropDraft(cropDraft === c.id ? '' : c.id)}>{c.name}</Chip>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="sm" onClick={() => setMode('view')}>
                  {t('common.cancel')}
                </Button>
                <Button size="sm" disabled={busy} onClick={saveCrop}>
                  {t('common.save')}
                </Button>
              </div>
              {otherYears.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="m-0 text-[13px] font-bold text-brand-text">
                    {t('analysisPage.seasonsStep.otherSeasonsTitle')}
                  </h4>
                  {otherYears.map((y) => (
                    <div key={y} className="flex items-center gap-3 rounded-[14px] border border-border-main bg-white px-3.5 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-bold text-brand-text">
                          {y} · {field?.seasons?.[y]?.plots?.length || 0} {plotsWord(field?.seasons?.[y]?.plots?.length || 0, language)}
                        </div>
                        <div className="truncate text-[13px] text-muted">{summarize(y)}</div>
                      </div>
                      <button
                        type="button"
                        className="min-h-10 cursor-pointer px-1 text-[13px] font-bold text-brand-dark hover:underline"
                        onClick={() => selectYear(y)}
                      >
                        {t('analysisPage.seasonsStep.viewSeason')}
                      </button>
                    </div>
                  ))}
                  <p className="m-0 text-[12.5px] leading-[1.5] text-muted">
                    {t('analysisPage.seasonsStep.otherSeasonsHint')}
                  </p>
                </div>
              )}
            </>
          )}

          {editing && (
            <>
              <div>
                <h3 className="m-0 text-lg font-bold text-brand-text">
                  {t('analysisPage.seasonsStep.editingTitle', { year: effectiveYear })}
                </h3>
                <p className="m-0 mt-0.5 text-[14px] leading-[1.5] text-muted">
                  {t('analysisPage.seasonsStep.editingDesc', { year: effectiveYear })}
                </p>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {plots.map((p) => (
                  <li key={p.id} className="flex min-h-[52px] items-center gap-3 rounded-[14px] border border-border-main bg-white px-3.5 py-2">
                    <PlotBadge label={p.label} />
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-[15px] font-semibold ${p.cropId ? 'text-brand-text' : 'text-muted'}`}>
                        {getCropName(p.cropId, t) ?? t('analysisPage.seasonsStep.cropNotSpecified')}
                      </div>
                      <div className="text-[13px] text-muted">{formatHa(p.areaHa, language)}</div>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(p.cropId)}
                      className="min-h-10 cursor-pointer px-1 text-[14px] font-bold text-brand-dark hover:underline disabled:cursor-not-allowed disabled:text-muted/50 disabled:no-underline"
                      onClick={() => handleDelete(p.id)}
                    >
                      {t('analysisPage.seasonsStep.deletePlot')}
                    </button>
                  </li>
                ))}
              </ul>
              {plots.some((p) => p.cropId) && (
                <p className="m-0 text-[12.5px] text-muted">
                  {t('analysisPage.seasonsStep.cannotDeleteWithCrop', {
                    plots: plots.filter((p) => p.cropId).map((p) => p.label).join(', '),
                  })}
                </p>
              )}
              {tool === 'merge' && (
                <Button variant="secondary" size="sm" disabled={mergeSel.length !== 2} onClick={handleMerge}>
                  {t('analysisPage.seasonsStep.mergeSelected')}
                </Button>
              )}
              <button
                type="button"
                className="min-h-11 cursor-pointer rounded-[14px] border border-dashed border-border-main text-[14px] font-bold text-brand-dark hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
                disabled={plots.length >= MAX_PLOTS}
                onClick={() => pickTool('split')}
              >
                {t('analysisPage.seasonsStep.addPlotBtn')}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="sm" onClick={() => { setMode('view'); setNotice(null); }}>
                  {t('common.cancel')}
                </Button>
                <Button size="sm" disabled={busy} onClick={confirmEdit}>
                  {t('analysisPage.seasonsStep.confirmBtn')}
                </Button>
              </div>
            </>
          )}

          {mode === 'newSeason' && (
            <>
              <div>
                <h3 className="m-0 text-lg font-bold text-brand-text">
                  {t('analysisPage.seasonsStep.newSeasonTitle', { year: earliestYear - 1 })}
                </h3>
                <p className="m-0 mt-0.5 text-[14px] leading-[1.5] text-muted">
                  {t('analysisPage.seasonsStep.newSeasonDesc')}
                </p>
              </div>
              {[
                ['copy', t('analysisPage.seasonsStep.modeCopyTitle', { year: earliestYear }), t('analysisPage.seasonsStep.modeCopyDesc')],
                ['single', t('analysisPage.seasonsStep.modeSingleTitle'), t('analysisPage.seasonsStep.modeSingleDesc')],
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
                <Button variant="secondary" size="sm" onClick={() => setMode('view')}>
                  {t('common.cancel')}
                </Button>
                <Button size="sm" disabled={busy} onClick={handleNewSeason}>
                  {t('analysisPage.seasonsStep.createSeasonBtn')}
                </Button>
              </div>
            </>
          )}

          {notice && <InfoNote tone={notice.type === 'error' ? 'error' : 'info'}>{notice.text}</InfoNote>}
        </div>
      </div>
    </div>
  );
}
