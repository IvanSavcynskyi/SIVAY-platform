import { useEffect, useRef, useState } from 'react';
import AppLink from '../AppLink/AppLink';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import { useAuthModal } from '../AuthModal/AuthModalProvider';
import { NAV_LINKS } from '../../constants/siteLinks';

const WIDE_SCREEN_QUERY = '(min-width: 768px)';
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

export default function Header({ activeLink = 'home' }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null);
  const closeRef = useRef(null);
  const menuRef = useRef(null);
  const { openAuth } = useAuthModal();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const mediaQuery = window.matchMedia(WIDE_SCREEN_QUERY);

    const handleResize = (event) => {
      if (event.matches) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const items = menuRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);

      if (!items || items.length === 0) {
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    mediaQuery.addEventListener('change', handleResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      mediaQuery.removeEventListener('change', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const closeMenuAndReturnFocus = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  const getReturnFocusTarget = (event) =>
    window.matchMedia(WIDE_SCREEN_QUERY).matches ? event.currentTarget : toggleRef.current;

  const handleLogin = (event) => {
    const returnFocusTo = getReturnFocusTarget(event);
    closeMenu();
    openAuth('signin', returnFocusTo);
  };

  const handleRegister = (event) => {
    const returnFocusTo = getReturnFocusTarget(event);
    closeMenu();
    openAuth('signup', returnFocusTo);
  };

  const handleProfile = (event) => {
    const returnFocusTo = getReturnFocusTarget(event);
    closeMenu();
    openAuth('signin', returnFocusTo);
  };

  return (
    <header className="border-b border-border-main bg-white">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between px-4 py-3 md:flex-wrap md:gap-y-4 md:px-8 md:py-5 xl:min-h-[88px] xl:flex-nowrap xl:py-4">
        <AppLink href="/" className="mr-auto flex items-center gap-3 text-inherit no-underline" aria-label="SIVAY — на головну">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#DCFCE7] text-brand-darkest shadow-button md:h-10 md:w-10">
            <Icon name="sprout" size={22} className="md:h-6 md:w-6" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold leading-[1.2] tracking-[0.4px] text-brand-text md:text-[22px]">SIVAY</span>
          </span>
        </AppLink>

        <button
          ref={toggleRef}
          type="button"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-border-main bg-white text-brand-text md:hidden"
          aria-label="Відкрити меню"
          aria-expanded={isOpen}
          aria-controls="site-menu"
          onClick={() => setIsOpen(true)}
        >
          <Icon name="menu" size={24} />
        </button>

        {}
        <div
          className={`fixed inset-0 z-[90] bg-[rgba(16,26,36,0.45)] transition-[opacity,visibility] duration-250 ease-out md:hidden ${
            isOpen ? 'pointer-events-auto visible opacity-100' : 'pointer-events-none invisible opacity-0'
          }`}
          onClick={closeMenuAndReturnFocus}
          aria-hidden="true"
        />

        {}
        <div
          id="site-menu"
          ref={menuRef}
          className={`fixed top-0 right-0 bottom-0 z-[100] flex w-[min(300px,100%)] flex-col gap-5 overflow-y-auto rounded-l-3xl border border-r-0 border-border-soft bg-white p-5 pb-6 shadow-[0_0_20px_rgba(13,45,32,0.2)] transition-[transform,visibility] duration-250 ease-out md:contents md:visible md:translate-x-0 ${
            isOpen ? 'visible translate-x-0' : 'invisible translate-x-full md:visible md:translate-x-0'
          }`}
        >
          <button
            ref={closeRef}
            type="button"
            className="grid h-10 w-10 shrink-0 cursor-pointer self-end place-items-center rounded-[18px] border border-border-soft bg-[#f7fbf8] text-brand-text md:hidden"
            aria-label="Закрити меню"
            onClick={closeMenuAndReturnFocus}
          >
            <Icon name="x" size={20} />
          </button>

          <nav className="md:order-3 md:flex-[1_0_100%] xl:order-none xl:mr-8 xl:flex-none" aria-label="Основна навігація">
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 md:flex-row md:justify-between xl:gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = link.id === activeLink;

                const linkClasses = [
                  'flex items-center gap-3 h-[50px] px-3.5 border rounded-[14px] text-[17px] font-semibold no-underline transition-colors',
                  'md:h-auto md:gap-1.5 md:py-2.5 md:px-3 md:rounded-full md:text-base',
                  'xl:gap-2 xl:rounded-[10px]',
                  isActive
                    ? 'border-brand-soft bg-brand-tint text-brand-dark md:border-brand xl:border-brand'
                    : 'border-transparent text-brand-text hover:bg-brand-tint md:border-border-main md:bg-white xl:border-transparent xl:bg-transparent xl:hover:bg-brand-tint',
                ].join(' ');

                return (
                  <li key={link.id}>
                    <AppLink
                      href={link.id === 'profile' ? '#' : link.href}
                      ready={link.id === 'profile' ? true : link.ready}
                      className={linkClasses}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={link.id === 'profile' ? handleProfile : closeMenu}
                    >
                      <Icon name={link.icon} size={22} className="shrink-0 md:h-5 md:w-5" />
                      <span>{link.label}</span>
                    </AppLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-col gap-2.5 border-t border-border-main pt-5 md:order-2 md:flex-row md:gap-3 md:border-t-0 md:pt-0 xl:order-none">
            <Button
              variant="secondary"
              size="sm"
              className="h-14 w-full text-[17px] md:h-11 md:w-auto md:text-[15px]"
              onClick={handleLogin}
            >
              Увійти
            </Button>
            <Button
              size="sm"
              className="h-14 w-full text-[17px] md:h-11 md:w-auto md:text-[15px]"
              onClick={handleRegister}
            >
              Зареєструватися
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}