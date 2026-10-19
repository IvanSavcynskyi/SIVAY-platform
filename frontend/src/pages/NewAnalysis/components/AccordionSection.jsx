import { IconCheck, IconChevronDown, IconChevronUp } from '../../../components/AnalysisIcons/AnalysisIcons';

export default function AccordionSection({ id, number, title, summary, status, open, onToggle, onChange, children }) {
  const locked = status === 'upcoming';
  const complete = status === 'complete';

  const shell = open
    ? 'rounded-3xl border-2 border-brand bg-white shadow-[0_10px_14px_rgba(13,45,32,0.12)]'
    : complete
      ? 'rounded-3xl border border-[#bbf7d0] bg-brand-tint'
      : 'rounded-[20px] border border-dashed border-border-main bg-[#fbfdfc]';

  const circle = complete && !open
    ? 'border-brand bg-brand text-white'
    : locked
      ? 'border border-border-main bg-surface-panel text-muted'
      : 'border-2 border-brand bg-brand-tint text-brand-dark';

  return (
    <section className={shell} aria-labelledby={`${id}-title`}>
      <div className="flex items-center gap-3 px-4 py-3.5 md:gap-4 md:px-[22px] md:py-[18px]">
        <button
          type="button"
          className={`flex min-w-0 flex-1 items-center gap-3 text-left md:gap-4 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          aria-expanded={open}
          aria-controls={`${id}-body`}
          aria-disabled={locked}
          onClick={locked ? undefined : onToggle}
        >
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[17px] font-bold ${circle}`}>
            {complete && !open ? <IconCheck size={20} /> : number}
          </span>
          <span className="flex min-w-0 flex-col gap-[3px]">
            <h2 id={`${id}-title`} className={`m-0 text-[17px] leading-[1.25] font-bold tracking-[-0.2px] md:text-[20px] ${locked ? 'text-muted' : 'text-brand-text'}`}>
              {title}
            </h2>
            <span className={`text-[14px] leading-[1.4] md:text-[15px] ${complete && !open ? 'font-medium text-brand-dark' : 'text-muted'}`}>{summary}</span>
          </span>
        </button>

        <span
          className={`hidden shrink-0 items-center gap-1 rounded-full px-3 py-[5px] text-[13px] font-semibold md:inline-flex ${
            open ? 'bg-brand text-brand-darkest' : complete ? 'bg-[#dcfce7] text-brand-dark' : 'bg-surface-panel text-muted'
          }`}
        >
          {complete && !open && <IconCheck size={14} />}
          {open ? 'Поточний крок' : complete ? 'Заповнено' : 'Наступний крок'}
        </span>

        {complete && !open && (
          <button type="button" className="hidden shrink-0 cursor-pointer text-[15px] font-semibold text-brand-dark hover:underline md:inline" onClick={onChange}>
            Змінити
          </button>
        )}

        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={locked}
          onClick={onToggle}
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-border-main bg-white text-brand-text disabled:cursor-not-allowed"
        >
          {open ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
        </button>
      </div>

      {open && (
        <div id={`${id}-body`} className="border-t border-border-soft px-4 pt-4 pb-5 md:px-[22px] md:pt-5 md:pb-[22px]">
          {children}
        </div>
      )}
    </section>
  );
}
