import Button from '../Button/Button';
import { useNotice } from '../Notice/NoticeProvider';
import AuthField from './AuthField';
import GoogleIcon from './GoogleIcon';
import useAuthForm from './useAuthForm';
import { signUp } from './authApi';
import { validateEmail, validateName, validateNewPassword } from './validators';

const VALIDATORS = { name: validateName, email: validateEmail, password: validateNewPassword };

export default function SignUpForm({ onNavigate, onClose }) {
  const { showNotice } = useNotice();
  const { values, errors, formError, setFormError, submitting, handleChange, handleSubmit } =
    useAuthForm({ name: '', email: '', password: '' }, VALIDATORS);

  const submit = handleSubmit(async (formValues) => {
    const result = await signUp(formValues);


    if (result.ok) {
  showNotice('Акаунт успішно створено! Тепер увійдіть у свій акаунт.');
  onNavigate('signin');
  return;
}

    setFormError(result.message || 'Не вдалося створити акаунт. Спробуйте ще раз.');
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 id="auth-modal-title" className="m-0 text-2xl font-bold leading-[1.2] text-brand-text focus:outline-none md:text-[28px]">
          Створіть акаунт
        </h2>
        <p className="m-0 text-[15px] leading-[1.5] text-muted">
          Зареєструйтеся, щоб аналізувати свої поля та отримувати рекомендації.
        </p>
      </div>

      <Button
        variant="secondary"
        className="w-full gap-2.5 text-base md:gap-3 md:text-[17px]"
        onClick={() => showNotice('Реєстрація через Google ще не реалізована.')}
      >
        <span className="inline-flex items-center gap-2.5 md:gap-3">
          <GoogleIcon />
          <span>Продовжити з Google</span>
        </span>
      </Button>

      <div className="flex items-center gap-3 text-[13px] leading-[1.4] text-muted before:h-px before:flex-1 before:bg-border-main after:h-px after:flex-1 after:bg-border-main">
        <span>або</span>
      </div>

      <form className="flex flex-col gap-4 md:gap-5" onSubmit={submit} noValidate>
        <div className="flex flex-col gap-3.5 md:gap-4">
          <AuthField
            label="Ім’я"
            icon="user"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Ваше ім’я"
            autoComplete="name"
            autoFocus
          />
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
          />
          <AuthField
            label="Пароль"
            icon="lock-keyhole"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Мінімум 8 символів"
            autoComplete="new-password"
          />
        </div>

        {formError && (
          <p className="m-0 rounded-xl border border-[#f4c7c3] bg-danger-soft p-3 px-3.5 text-sm leading-[1.4] text-danger" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" arrow disabled={submitting} className="w-full">
          Зареєструватися
        </Button>
      </form>

      <button
        type="button"
        className="w-full cursor-pointer border-0 bg-transparent py-2 text-center text-[15px] leading-[1.3] text-muted hover:[&>span]:underline"
        onClick={() => onNavigate('signin')}
      >
        Уже маєте акаунт? <span className="font-semibold text-brand-dark">Увійти</span>
      </button>
    </>
  );
}
