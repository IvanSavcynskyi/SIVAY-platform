import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon/Icon';
import ForgotPasswordForm from './ForgotPasswordForm';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import './AuthModal.css';

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
      className="auth-overlay"
      onPointerDown={handleBackdropPointerDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
      >
        <div className="auth-modal__header">
          <div className="auth-brand">
            <span className="auth-brand__emblem">
              <Icon name="sprout" />
            </span>
            <span className="auth-brand__text">
              <span className="auth-brand__name">SIVAY</span>
            </span>
          </div>
          <button type="button" className="auth-modal__close" aria-label="Закрити" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {}
        <Form key={view} onNavigate={onNavigate} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
