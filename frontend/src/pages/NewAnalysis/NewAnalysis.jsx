import { useState } from 'react';
import { getCropName } from '../../constants/crops';
import { submitAnalysisRequest } from '../../services/analysisApi';
import { formatHa, plotsWord } from '../../utils/format';
import { totalAreaHa } from './lib/plots';
import AccordionSection from './components/AccordionSection';
import CropsStep from './components/CropsStep';
import FieldStep from './components/FieldStep';
import SeasonsStep from './components/SeasonsStep';

export default function NewAnalysis() {
  const [openStep, setOpenStep] = useState(1);
  const [field, setField] = useState(null);
  const [seasonYear, setSeasonYear] = useState(null);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const season = field && seasonYear ? field.seasons[seasonYear] : null;
  const done = { 1: Boolean(field), 2: Boolean(season), 3: Boolean(result) };
  const canOpen = { 1: true, 2: Boolean(field), 3: Boolean(season) };

  const sectionProps = (n) => {
    const open = openStep === n && canOpen[n];
    return {
      id: `analysis-step-${n}`,
      number: n,
      open,
      status: open ? 'current' : done[n] ? 'complete' : 'upcoming',
      onToggle: () => setOpenStep(open ? 0 : n),
      onChange: () => setOpenStep(n),
    };
  };

  const handleFieldReady = (picked) => {
    setField(picked);
    setSeasonYear(null);
    setSelectedCrops([]);
    setResult(null);
    setOpenStep(2);
  };

  const handleSeasonConfirm = (year) => {
    setSeasonYear(year);
    setResult(null);
    setOpenStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      setResult(
        await submitAnalysisRequest({
          fieldId: field.id,
          season: season.year,
          plots: season.plots.map((p) => ({ id: p.id, label: p.label, areaHa: p.areaHa, cropId: p.cropId })),
          candidateCropIds: selectedCrops,
        }),
      );
    } catch (e) {
      setSubmitError(e.message || 'Не вдалося зберегти дані.');
    } finally {
      setSubmitting(false);
    }
  };

  const step2Summary = season
    ? `Сезон ${season.year} · ${season.plots.length} ${plotsWord(season.plots.length)} · ${formatHa(totalAreaHa(season.plots))} · ${season.plots
        .map((p) => `${p.label} — ${getCropName(p.cropId) ?? 'не вказано'}`)
        .join(', ')}`
    : 'Сезони, поділ поля на ділянки та культури, що на них росли.';

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-12 md:px-8 md:pt-9 xl:px-20 xl:pt-[42px] xl:pb-14">
      <header className="mb-6 flex flex-col gap-2 md:mb-7">
        <p className="m-0 text-[13px] font-bold tracking-[0.4px] text-brand-dark uppercase">Новий розрахунок</p>
        <h1 className="m-0 text-[32px] leading-[1.14] font-bold text-brand-text md:text-[42px]">Новий аналіз</h1>
        <p className="m-0 max-w-[720px] text-[15px] leading-[1.55] text-muted md:text-[17px]">
          Оберіть поле, додайте культури сезону та розрахуйте найкращий варіант для господарства.
        </p>
      </header>

      <div className="flex flex-col gap-3.5">
        <AccordionSection
          {...sectionProps(1)}
          title="Оберіть поле"
          summary={
            field
              ? `${field.name} · ${formatHa(field.areaHa)}${field.region ? ` · ${field.region}` : ''}`
              : 'Знайдіть населений пункт на карті — це лише переміщення до місця. Далі позначте межі свого поля.'
          }
        >
          <FieldStep onFieldReady={handleFieldReady} />
        </AccordionSection>

        <AccordionSection
          {...sectionProps(2)}
          title="Ділянки та попередні культури"
          summary={step2Summary}
        >
          {field && <SeasonsStep key={field.id} field={field} onFieldChange={setField} onConfirm={handleSeasonConfirm} />}
        </AccordionSection>

        <AccordionSection
          {...sectionProps(3)}
          title={openStep === 3 ? 'Які культури розглядаємо?' : 'Культури цього сезону'}
          summary={
            result
              ? `Обрано культур: ${selectedCrops.length}`
              : 'Оберіть культури, які SIVAY порівняє для цього поля та сезону. Можна вибрати кілька.'
          }
        >
          {season && (
            <CropsStep
              field={field}
              season={season}
              selectedIds={selectedCrops}
              onChange={(ids) => {
                setSelectedCrops(ids);
                setResult(null);
              }}
              onBack={() => setOpenStep(2)}
              onEditSeason={() => setOpenStep(2)}
              onSubmit={handleSubmit}
              submitting={submitting}
              result={result}
            />
          )}
          {submitError && <p className="m-0 mt-3 text-[14px] text-danger" role="alert">{submitError}</p>}
        </AccordionSection>
      </div>
    </main>
  );
}
