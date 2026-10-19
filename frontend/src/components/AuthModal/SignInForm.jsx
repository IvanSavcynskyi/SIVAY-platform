import Button from '../Button/Button';
import { useNotice } from '../Notice/NoticeProvider';
import { useAuth } from '../../context/useAuth';
import AuthField from './AuthField';
import GoogleIcon from './GoogleIcon';
import useAuthForm from './useAuthForm';
import { validateCurrentPassword, validateEmail } from './validators';

const VALIDATORS = { email: validateEmail, password: validateCurrentPassword };

export default function SignInForm({ onNavigate, onClose }) {
  const { showNotice } = useNotice();
  const { login } = useAuth();
  const { values, errors, formError, setFormError, submitting, handleChange, handleSubmit } =
    useAuthForm({ email: '', password: '' }, VALIDATORS);

  const submit = handleSubmit(async (formValues) => {
    const result = await login(formValues);

    if (result.ok) {
      const displayName = result.user?.first_name || result.user?.email || formValues.email;
      showNotice(`Вітаємо, ${displayName}! Ви успішно увійшли.`);
      onClose();
      return;
    }

    setFormError(result.message || 'Не вдалося увійти. Перевірте дані та спробуйте ще раз.');
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 id="auth-modal-title" className="m-0 text-2xl font-bold leading-[1.2] text-brand-text focus:outline-none md:text-[28px]">
          Вітаємо знову!
        </h2>
        <p className="m-0 text-[15px] leading-[1.5] text-muted">
          Увійдіть до свого акаунта SIVAY, щоб продовжити роботу зі своїми полями.
        </p>
      </div>

      <Button
        variant="secondary"
        className="w-full gap-2.5 text-base md:gap-3 md:text-[17px]"
        onClick={() => showNotice('Вхід через Google наразі не підключений на бекенді.')}
      >
        <span className="inline-flex items-center gap-2.5 md:gap-3">
          <GoogleIcon />
          <span>Увійти через Google</span>
        </span>
      </Button>

      <div className="flex items-center gap-3 text-[13px] leading-[1.4] text-muted before:h-px before:flex-1 before:bg-border-main after:h-px after:flex-1 after:bg-border-main">
        <span>або</span>
      </div>

      <form className="flex flex-col gap-4 md:gap-5" onSubmit={submit} noValidate>
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
          <div className="flex flex-col gap-2">
            <AuthField
              label="Пароль"
              icon="lock-keyhole"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Введіть пароль"
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent py-1.5 text-sm font-semibold text-brand-dark hover:underline"
                onClick={() => onNavigate('forgot')}
              >
                Забули пароль?
              </button>
            </div>
          </div>
        </div>

        {formError && (
          <p className="m-0 rounded-xl border border-[#f4c7c3] bg-danger-soft p-3 px-3.5 text-sm leading-[1.4] text-danger" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" arrow disabled={submitting} className="w-full">
          {submitting ? 'Входимо…' : 'Увійти'}
        </Button>
      </form>

      <button
        type="button"
        className="w-full cursor-pointer border-0 bg-transparent py-2 text-center text-[15px] leading-[1.3] text-muted hover:[&>span]:underline"
        onClick={() => onNavigate('signup')}
      >
        Ще не маєте акаунта? <span className="font-semibold text-brand-dark">Зареєструватися</span>
      </button>
    </>
  );
}
