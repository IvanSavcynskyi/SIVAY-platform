import { useEffect, useId, useMemo, useState } from 'react';
import Button from '../../../components/Button/Button';
import { IconCheck, IconSearch, IconShield } from '../../../components/AnalysisIcons/AnalysisIcons';
import { CROPS } from '../../../constants/crops';
import { listCropProposals, proposeCrop } from '../../../services/analysisApi';
import { formatHa } from '../../../utils/format';
import { INPUT_CLASS, InfoNote, LinkButton } from './ui';

/** Step 3 — pick the crops to compare. Multi-select, searchable. */
export default function CropsStep({ field, season, selectedIds, onChange, onBack, onEditSeason, onSubmit, submitting, result }) {
  const ids = useId();
  const [query, setQuery] = useState('');
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalName, setProposalName] = useState('');
  const [proposalError, setProposalError] = useState('');
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    let cancelled = false;
    listCropProposals().then((list) => {
      if (!cancelled) setProposals(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? CROPS.filter((c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)) : CROPS;
  }, [query]);

  const toggle = (id) => onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  const submitProposal = async () => {
    const name = proposalName.trim();
    if (name.length < 2) {
      setProposalError('Вкажіть назву культури.');
      return;
    }
    if (CROPS.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setProposalError('Така культура вже є у списку.');
      return;
    }
    try {
      const created = await proposeCrop(name);
      setProposals((list) => [...list, created]);
      setProposalName('');
      setProposalError('');
      setProposalOpen(false);
    } catch (e) {
      setProposalError(e.message || 'Не вдалося надіслати пропозицію.');
    }
  };

  const labels = season.plots.map((p) => p.label).join(', ');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl bg-surface-panel px-4 py-3.5 md:px-5">
        {[
          ['Поле', `${field.name} · ${formatHa(field.areaHa)}`],
          ['Сезон', String(season.year)],
          ['Ділянки', `${season.plots.length} — ${labels}`],
        ].map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-bold tracking-[0.6px] text-muted uppercase">{label}</span>
            <span className="text-[14px] font-bold text-brand-text">{value}</span>
          </div>
        ))}
        <LinkButton className="ml-auto min-h-10" onClick={onEditSeason}>Змінити</LinkButton>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-7">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex h-[52px] items-center gap-2.5 rounded-[14px] border-[1.5px] border-border-main bg-white px-4 focus-within:border-brand">
            <IconSearch size={18} className="text-muted" />
            <label htmlFor={`${ids}-q`} className="sr-only">Пошук культури</label>
            <input id={`${ids}-q`} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Пошук культури" className="min-w-0 flex-1 bg-transparent text-[15px] text-brand-text placeholder:text-muted" />
          </div>

          {filtered.length === 0 ? (
            <p className="m-0 rounded-[14px] border border-border-soft p-4 text-[14px] text-muted" role="status">Нічого не знайдено. Запропонуйте власну культуру.</p>
          ) : (
            <ul className="m-0 list-none overflow-hidden rounded-[14px] border border-border-soft bg-white p-0" aria-label="Культури">
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
            <h3 className="m-0 text-[15px] font-bold text-brand-text">Не знайшли потрібну культуру?</h3>
            <p className="m-0 mt-1 text-[13px] leading-[1.5] text-muted">Запропонуйте свою. Вона з’явиться у списку лише після підтвердження адміністратором.</p>
          </div>
          {proposalOpen ? (
            <div className="flex flex-col gap-2">
              <label htmlFor={`${ids}-p`} className="text-[13px] font-semibold text-brand-text">Назва культури</label>
              <input id={`${ids}-p`} value={proposalName} onChange={(e) => setProposalName(e.target.value)} maxLength={60} className={INPUT_CLASS} />
              {proposalError && <p className="m-0 text-[13px] text-danger" role="alert">{proposalError}</p>}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" onClick={() => setProposalOpen(false)}>Скасувати</Button>
                <Button size="sm" onClick={submitProposal}>Надіслати</Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setProposalOpen(true)}>Запропонувати власну культуру</Button>
          )}
          {proposals.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {proposals.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-[10px] bg-white px-3 py-2 text-[13px]">
                  <span className="truncate font-semibold text-brand-text">{p.name}</span>
                  <span className="shrink-0 text-muted">Очікує підтвердження</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {result && (
        <InfoNote tone="success">
          <strong>Дані для аналізу збережено (запит {result.id.slice(-6)}).</strong>
          <br />
          Розрахунок культур ще не підключено: на цьому кроці немає сервісу аналізу, тому результатів, прибутковості чи прогнозів тут немає навмисно.
        </InfoNote>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Button variant="secondary" className="w-full md:w-auto" onClick={onBack}>Назад до кроку 2</Button>
          <p className="m-0 flex items-center gap-2 text-[13px] text-muted"><IconShield size={16} className="text-brand-dark" />Дані поля використовуються лише для цього розрахунку.</p>
        </div>
        <Button className="w-full md:w-auto" arrow disabled={selectedIds.length === 0 || submitting} onClick={onSubmit}>
          {submitting ? 'Зберігаємо…' : selectedIds.length ? `Перейти до аналізу (${selectedIds.length})` : 'Оберіть культури'}
        </Button>
      </div>
    </div>
  );
}
