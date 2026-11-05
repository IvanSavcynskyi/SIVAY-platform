import { useEffect, useId, useMemo, useState } from 'react';
import Button from '../../../components/Button/Button';
import { IconCheck, IconSearch, IconShield } from '../../../components/AnalysisIcons/AnalysisIcons';
import { getLocalizedCrops } from '../../../constants/crops';
import { useLanguage } from '../../../context/LanguageContext';
import { listCropProposals, proposeCrop } from '../../../services/analysisApi';
import { formatHa } from '../../../utils/format';
import { INPUT_CLASS, InfoNote, LinkButton } from './ui';

export default function CropsStep({ field, season, selectedIds, onChange, onBack, onEditSeason, onSubmit, submitting, result }) {
  const ids = useId();
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalName, setProposalName] = useState('');
  const [proposalError, setProposalError] = useState('');
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    let cancelled = false;
    listCropProposals()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setProposals(list);
      })
      .catch(() => {
        if (!cancelled) setProposals([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const localizedCrops = useMemo(() => getLocalizedCrops(t), [t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? localizedCrops.filter((c) => c.name.toLowerCase().includes(q) || (c.group && c.group.toLowerCase().includes(q)))
      : localizedCrops;
  }, [query, localizedCrops]);

  const toggle = (id) => onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  const submitProposal = async () => {
    const name = proposalName.trim();
    if (name.length < 2) {
      setProposalError(t('analysisPage.cropsStep.proposalNameRequired'));
      return;
    }
    if (localizedCrops.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setProposalError(t('analysisPage.cropsStep.proposalAlreadyExists'));
      return;
    }
    try {
      const created = await proposeCrop(name);
      setProposals((list) => [...list, created]);
      setProposalName('');
      setProposalError('');
      setProposalOpen(false);
    } catch (e) {
      setProposalError(e.message || t('analysisPage.cropsStep.proposalFailed'));
    }
  };

  const seasonPlots = Array.isArray(season?.plots) ? season.plots.filter(Boolean) : [];
  const labels = seasonPlots.map((p) => p.label).join(', ');

  const summaryItems = [
    [t('analysisPage.cropsStep.fieldSummaryLabel'), `${field?.name || t('analysisPage.cropsStep.defaultField')} · ${formatHa(field?.areaHa, language)}`],
    [t('analysisPage.cropsStep.seasonSummaryLabel'), String(season?.year ?? '—')],
    [t('analysisPage.cropsStep.plotsSummaryLabel'), `${seasonPlots.length} — ${labels || '—'}`],
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl bg-surface-panel px-4 py-3.5 md:px-5">
        {summaryItems.map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-bold tracking-[0.6px] text-muted uppercase">{label}</span>
            <span className="text-[14px] font-bold text-brand-text">{value}</span>
          </div>
        ))}
        <LinkButton className="ml-auto min-h-10" onClick={onEditSeason}>
          {t('analysisPage.cropsStep.change')}
        </LinkButton>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-7">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex h-[52px] items-center gap-2.5 rounded-[14px] border-[1.5px] border-border-main bg-white px-4 focus-within:border-brand">
            <IconSearch size={18} className="text-muted" />
            <label htmlFor={`${ids}-q`} className="sr-only">
              {t('analysisPage.cropsStep.searchCropAria')}
            </label>
            <input
              id={`${ids}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('analysisPage.cropsStep.searchCropPlaceholder')}
              className="min-w-0 flex-1 bg-transparent text-[15px] text-brand-text placeholder:text-muted"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="m-0 rounded-[14px] border border-border-soft p-4 text-[14px] text-muted" role="status">
              {t('analysisPage.cropsStep.noCropsFound')}
            </p>
          ) : (
            <ul className="m-0 list-none overflow-hidden rounded-[14px] border border-border-soft bg-white p-0" aria-label={t('analysisPage.cropsStep.cropsListAria')}>
              {filtered.map((crop) => {
                const checked = selectedIds.includes(crop.id);
                return (
                  <li key={crop.id} className="border-b border-border-soft last:border-b-0">
                    <label className={`flex min-h-[52px] cursor-pointer items-center gap-3 px-4 py-2 ${checked ? 'bg-brand-tint' : 'bg-white hover:bg-brand-tint'}`}>
                      <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(crop.id)} />
                      <span className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border-2 text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand/55 ${checked ? 'border-brand bg-brand' : 'border-border-main bg-white'}`}>
                        {checked && <IconCheck size={14} />}
                      </span>
                      <span className="flex-1 text-[15px] font-semibold text-brand-text">{crop.name}</span>
                      <span className="text-[13px] text-muted">{crop.group}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-[#bbf7d0] bg-brand-tint p-4">
          <div>
            <h3 className="m-0 text-[15px] font-bold text-brand-text">
              {t('analysisPage.cropsStep.proposeTitle')}
            </h3>
            <p className="m-0 mt-1 text-[13px] leading-[1.5] text-muted">
              {t('analysisPage.cropsStep.proposeDesc')}
            </p>
          </div>
          {proposalOpen ? (
            <div className="flex flex-col gap-2">
              <label htmlFor={`${ids}-p`} className="text-[13px] font-semibold text-brand-text">
                {t('analysisPage.cropsStep.cropNameLabel')}
              </label>
              <input id={`${ids}-p`} value={proposalName} onChange={(e) => setProposalName(e.target.value)} maxLength={60} className={INPUT_CLASS} />
              {proposalError && <p className="m-0 text-[13px] text-danger" role="alert">{proposalError}</p>}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" onClick={() => setProposalOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button size="sm" onClick={submitProposal}>
                  {t('analysisPage.cropsStep.submitProposalBtn')}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setProposalOpen(true)}>
              {t('analysisPage.cropsStep.openProposalBtn')}
            </Button>
          )}
          {proposals.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {proposals.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-[10px] bg-white px-3 py-2 text-[13px]">
                  <span className="truncate font-semibold text-brand-text">{p.name}</span>
                  <span className="shrink-0 text-muted">{t('analysisPage.cropsStep.pendingApproval')}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {result && (
        <InfoNote tone="success">
          <strong>{t('analysisPage.cropsStep.resultNotice', { id: result.id.slice(-6) })}</strong>
          <br />
          {t('analysisPage.cropsStep.resultNoticeSub')}
        </InfoNote>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Button variant="secondary" className="w-full md:w-auto" onClick={onBack}>
            {t('analysisPage.cropsStep.backToStep2')}
          </Button>
          <p className="m-0 flex items-center gap-2 text-[13px] text-muted">
            <IconShield size={16} className="text-brand-dark" />
            {t('analysisPage.cropsStep.privacyNotice')}
          </p>
        </div>
        <Button className="w-full md:w-auto" arrow disabled={selectedIds.length === 0 || submitting} onClick={onSubmit}>
          {submitting
            ? t('analysisPage.cropsStep.submitBtnSaving')
            : selectedIds.length
            ? t('analysisPage.cropsStep.submitBtnActive', { count: selectedIds.length })
            : t('analysisPage.cropsStep.submitBtnEmpty')}
        </Button>
      </div>
    </div>
  );
}
