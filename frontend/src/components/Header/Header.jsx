import { useEffect, useRef, useState } from 'react';
import AppLink from '../AppLink/AppLink';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import { useNotice } from '../Notice/NoticeProvider';
import { NAV_LINKS } from '../../constants/siteLinks';
import './Header.css';

const WIDE_SCREEN_QUERY = '(min-width: 768px)';
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

export default function Header({ activeLink = 'home' }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null);
  const closeRef = useRef(null);
  const menuRef = useRef(null);
  const { showNotice } = useNotice();

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

  const handleLogin = () => {
    closeMenu();
    showNotice('Вхід ще не реалізовано.');
  };

  const handleRegister = () => {
    closeMenu();
    showNotice('Реєстрація ще не реалізована.');
  };

  return (
    <header className={`header${isOpen ? ' header--open' : ''}`}>
      <div className="header__inner">
        <AppLink href="/" className="header__brand" aria-label="SIVAY — на головну">
          <span className="header__emblem">
            <Icon name="sprout" />
          </span>
          <span className="header__brand-text">
            <span className="header__brand-name">SIVAY</span>
          </span>
        </AppLink>

        <button
          ref={toggleRef}
          type="button"
          className="header__toggle"
          aria-label="Відкрити меню"
          aria-expanded={isOpen}
          aria-controls="site-menu"
          onClick={() => setIsOpen(true)}
        >
          <Icon name="menu" />
        </button>

        <div className="header__scrim" onClick={closeMenuAndReturnFocus} aria-hidden="true" />

        <div id="site-menu" ref={menuRef} className="header__menu">
          <button
            ref={closeRef}
            type="button"
            className="header__close"
            aria-label="Закрити меню"
            onClick={closeMenuAndReturnFocus}
          >
            <Icon name="x" />
          </button>

          <nav className="header__nav" aria-label="Основна навігація">
            <ul className="header__list">
              {NAV_LINKS.map((link) => {
                const isActive = link.id === activeLink;

                return (
                  <li key={link.id}>
                    <AppLink
                      href={link.href}
                      ready={link.ready}
                      className={`header__link${isActive ? ' header__link--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={closeMenu}
                    >
                      <Icon name={link.icon} />
                      <span>{link.label}</span>
                    </AppLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="header__actions">
            <Button variant="secondary" size="sm" onClick={handleLogin}>
              Увійти
            </Button>
            <Button size="sm" onClick={handleRegister}>
              Зареєструватися
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}