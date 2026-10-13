import { useEffect, useRef, useState } from 'react';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import { useNotice } from '../Notice/NoticeProvider';
import AuthField from './AuthField';
import useAuthForm from './useAuthForm';
import { requestPasswordReset } from './authApi';
import { validateEmail } from './validators';

const VALIDATORS = { email: validateEmail };

export default function ForgotPasswordForm({ onNavigate }) {
  const { showNotice } = useNotice();
  const { values, errors, formError, setFormError, submitting, handleChange, handleSubmit } =
    useAuthForm({ email: '' }, VALIDATORS);

  const [sentTo, setSentTo] = useState(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const previousSentTo = useRef(null);

  useEffect(() => {
    if (previousSentTo.current === sentTo) {
      return;
    }

    previousSentTo.current = sentTo;

    if (sentTo) {
      titleRef.current?.focus();
    } else {
      formRef.current?.elements.email?.focus();
    }
  }, [sentTo]);

  const submit = handleSubmit(async (formValues) => {
    const result = await requestPasswordReset(formValues);

    if (result.notConnected) {
      showNotice('Відновлення пароля ще не реалізовано: лист не надсилається.');
      setSentTo(formValues.email.trim());
      return;
    }

    if (result.ok) {
      setSentTo(formValues.email.trim());
      return;
    }

    setFormError(result.message || 'Не вдалося надіслати посилання. Спробуйте ще раз.');
  });

  if (sentTo) {
    return (
      <>
        <span className="auth-success__badge" aria-hidden="true">
          <Icon name="check-circle" size={28} />
        </span>

        <div className="auth-modal__heading">
          <h2 id="auth-modal-title" ref={titleRef} tabIndex={-1} className="auth-modal__title">
            Перевірте пошту
          </h2>
          <p className="auth-modal__text">
            Якщо акаунт з адресою <strong className="auth-modal__email">{sentTo}</strong> існує, ми
            надішлемо на неї посилання для створення нового пароля.
          </p>
        </div>

        <Button arrow onClick={() => onNavigate('signin')}>
          Повернутися до входу
        </Button>

        <button type="button" className="auth-switch" onClick={() => setSentTo(null)}>
          Не отримали лист? <span>Спробувати ще раз</span>
        </button>
      </>
    );
  }

  return (
    <>
      <div className="auth-modal__heading">
        <h2 id="auth-modal-title" className="auth-modal__title">
          Відновлення пароля
        </h2>
        <p className="auth-modal__text">
          Вкажіть електронну пошту, і ми надішлемо посилання для створення нового пароля.
        </p>
      </div>

      <form ref={formRef} className="auth-form" onSubmit={submit} noValidate>
        <div className="auth-fields">
          <AuthField
            label="Електронна пошта"
            icon="mail"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
          />
        </div>

        {formError && (
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" arrow disabled={submitting}>
          Надіслати посилання
        </Button>
      </form>

      <button type="button" className="auth-switch" onClick={() => onNavigate('signin')}>
        Згадали пароль? <span>Увійти</span>
      </button>
    </>
  );
}
