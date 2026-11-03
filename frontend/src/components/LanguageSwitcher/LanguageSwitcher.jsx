import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon/Icon';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('lang.selectAria', 'Обрати мову / Choose language')}
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-150 md:h-11 md:w-11 ${
          isOpen
            ? 'border-brand-dark bg-brand-soft/70 text-brand-dark shadow-sm ring-2 ring-brand/30'
            : 'border-border-main bg-white text-brand-text hover:border-brand hover:bg-brand-soft/40 hover:text-brand-dark'
        }`}
        title={language === 'uk' ? 'Мова: Українська' : 'Language: English'}
      >
        <Icon name="globe" size={20} className="text-current" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={t('lang.title', 'MOBA / LANGUAGE')}
          className="absolute right-0 top-full z-[120] mt-2 w-[190px] rounded-2xl border border-border-soft bg-white p-2.5 shadow-[0_10px_25px_-5px_rgba(15,35,25,0.12),0_8px_10px_-6px_rgba(15,35,25,0.08)]"
        >
          <div className="px-3 pt-1 pb-2 text-[11px] font-bold tracking-wider text-muted uppercase select-none">
            {t('lang.title', 'MOBA / LANGUAGE')}
          </div>

          <div className="flex flex-col gap-1" role="group">
            {supportedLanguages.map((item) => {
              const isActive = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => selectLanguage(item.code)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[14px] transition-colors ${
                    isActive
                      ? 'bg-[#edf5ff] font-bold text-[#1a73e8]'
                      : 'font-medium text-brand-text hover:bg-surface-panel'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <Icon name="check" size={16} strokeWidth={2.5} className="shrink-0 text-[#1a73e8]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

