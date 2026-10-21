import { useEffect, useRef, useState } from 'react';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import { useNotice } from '../Notice/useNotice';
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
        <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-soft text-brand-dark" aria-hidden="true">
          <Icon name="check-circle" size={28} />
        </span>

        <div className="flex flex-col gap-2">
          <h2 id="auth-modal-title" ref={titleRef} tabIndex={-1} className="m-0 text-2xl font-bold leading-[1.2] text-brand-text focus:outline-none md:text-[28px]">
            Перевірте пошту
          </h2>
          <p className="m-0 text-[15px] leading-[1.5] text-muted">
            Якщо акаунт з адресою <strong className="font-semibold text-brand-text [overflow-wrap:anywhere]">{sentTo}</strong> існує, ми
            надішлемо на неї посилання для створення нового пароля.
          </p>
        </div>

        <Button arrow onClick={() => onNavigate('signin')} className="w-full">
          Повернутися до входу
        </Button>

        <button
          type="button"
          className="w-full cursor-pointer border-0 bg-transparent py-2 text-center text-[15px] leading-[1.3] text-muted hover:[&>span]:underline"
          onClick={() => setSentTo(null)}
        >
          Не отримали лист? <span className="font-semibold text-brand-dark">Спробувати ще раз</span>
        </button>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 id="auth-modal-title" className="m-0 text-2xl font-bold leading-[1.2] text-brand-text focus:outline-none md:text-[28px]">
          Відновлення пароля
        </h2>
        <p className="m-0 text-[15px] leading-[1.5] text-muted">
          Вкажіть електронну пошту, і ми надішлемо посилання для створення нового пароля.
        </p>
      </div>

      <form ref={formRef} className="flex flex-col gap-4 md:gap-5" onSubmit={submit} noValidate>
        <div className="flex flex-col gap-3.5 md:gap-4">
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
          <p className="m-0 rounded-xl border border-[#f4c7c3] bg-danger-soft p-3 px-3.5 text-sm leading-[1.4] text-danger" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" arrow disabled={submitting} className="w-full">
          Надіслати посилання
        </Button>
      </form>

      <button
        type="button"
        className="w-full cursor-pointer border-0 bg-transparent py-2 text-center text-[15px] leading-[1.3] text-muted hover:[&>span]:underline"
        onClick={() => onNavigate('signin')}
      >
        Згадали пароль? <span className="font-semibold text-brand-dark">Увійти</span>
      </button>
    </>
  );
}
