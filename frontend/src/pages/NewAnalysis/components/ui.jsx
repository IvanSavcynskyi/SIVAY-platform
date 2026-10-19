import { colorForLabel } from '../lib/plots';
import { IconInfo } from '../../../components/AnalysisIcons/AnalysisIcons';

export const INPUT_CLASS =
  'h-[52px] w-full rounded-[14px] border-[1.5px] border-border-main bg-white px-4 text-[15px] text-brand-text transition-colors focus:border-brand';

export function InfoNote({ children, tone = 'info' }) {
  const tones = {
    info: 'border-[#c7dbff] bg-sky',
    success: 'border-[#bbf7d0] bg-brand-tint',
    error: 'border-[#f3c9c5] bg-danger-soft',
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-[14px] border px-3.5 py-3 text-[13.5px] leading-[1.5] text-brand-text ${tones[tone]}`} role={tone === 'error' ? 'alert' : undefined}>
      {tone === 'info' && <IconInfo size={18} className="mt-0.5 text-[#2563eb]" />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function PlotBadge({ label, size = 'md' }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${size === 'md' ? 'h-7 w-7 text-[13px]' : 'h-6 w-6 text-xs'}`}
      style={{ background: colorForLabel(label) }}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

export function Chip({ active = false, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`min-h-10 cursor-pointer rounded-full border px-3.5 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? 'border-brand bg-brand-tint text-brand-dark' : 'border-border-main bg-white text-brand-text hover:border-brand'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export const LinkButton = ({ className = '', ...rest }) => (
  <button type="button" className={`cursor-pointer text-[14px] font-semibold text-brand-dark hover:underline disabled:cursor-not-allowed disabled:text-muted/50 disabled:no-underline ${className}`} {...rest} />
);
