import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon/Icon';
import ForgotPasswordForm from './ForgotPasswordForm';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

const CLOSE_ON_BACKDROP_CLICK = true;

const FORMS = {
  signin: SignInForm,
  signup: SignUpForm,
  forgot: ForgotPasswordForm,
};

export default function AuthModal({ view, onNavigate, onClose }) {
  const panelRef = useRef(null);
  const pressStartedOnBackdrop = useRef(false);

  useEffect(() => {
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const firstField = hasFinePointer ? panel.querySelector('[data-autofocus]') : null;

    (firstField || panel).focus();
  }, [view]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const panel = panelRef.current;
      const items = panel?.querySelectorAll(FOCUSABLE_SELECTOR);

      if (!items || items.length === 0) {
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active) || active === panel) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const Form = FORMS[view];

  if (!Form) {
    return null;
  }

  const handleBackdropPointerDown = (event) => {
    pressStartedOnBackdrop.current = event.target === event.currentTarget;
  };

  const handleBackdropClick = (event) => {
    const shouldClose =
      CLOSE_ON_BACKDROP_CLICK && pressStartedOnBackdrop.current && event.target === event.currentTarget;

    pressStartedOnBackdrop.current = false;

    if (shouldClose) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex overflow-y-auto overscroll-contain bg-[rgba(5,23,15,0.55)] p-[max(16px,env(safe-area-inset-top,0px))_max(16px,env(safe-area-inset-right,0px))_max(16px,env(safe-area-inset-bottom,0px))_max(16px,env(safe-area-inset-left,0px))] animate-auth-fade-in md:py-[max(24px,env(safe-area-inset-top,0px))] md:pb-[max(24px,env(safe-area-inset-bottom,0px))]"
      onPointerDown={handleBackdropPointerDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="m-auto flex w-full max-w-[520px] flex-col gap-4 rounded-[20px] border border-border-main bg-white p-5 shadow-[0_10px_14px_rgba(8,45,32,0.06)] animate-auth-pop-in focus:outline-none md:gap-5 md:rounded-3xl md:p-9 xl:max-w-[480px] xl:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-darkest shadow-button">
              <Icon name="sprout" size={24} />
            </span>
            <div className="flex flex-col gap-0.5 whitespace-nowrap">
              <span className="text-[22px] font-semibold leading-[1.2] tracking-[0.4px] text-brand-text">SIVAY</span>
            </div>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-[18px] border border-border-soft bg-[#f7fbf8] text-brand-text transition-colors hover:bg-brand-tint"
            aria-label="Закрити"
            onClick={onClose}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <Form key={view} onNavigate={onNavigate} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
