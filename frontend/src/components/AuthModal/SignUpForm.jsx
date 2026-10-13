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

    if (result.notConnected) {
      showNotice('Реєстрація ще не реалізована.');
      return;
    }

    if (result.ok) {
      onClose();
      return;
    }

    setFormError(result.message || 'Не вдалося створити акаунт. Спробуйте ще раз.');
  });

  return (
    <>
      <div className="auth-modal__heading">
        <h2 id="auth-modal-title" className="auth-modal__title">
          Створіть акаунт
        </h2>
        <p className="auth-modal__text">
          Зареєструйтеся, щоб аналізувати свої поля та отримувати рекомендації.
        </p>
      </div>

      <Button
        variant="secondary"
        className="auth-google"
        onClick={() => showNotice('Реєстрація через Google ще не реалізована.')}
      >
        <GoogleIcon />
        Продовжити з Google
      </Button>

      <div className="auth-divider">
        <span className="auth-divider__label">або</span>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="auth-fields">
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
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" arrow disabled={submitting}>
          Зареєструватися
        </Button>
      </form>

      <button type="button" className="auth-switch" onClick={() => onNavigate('signin')}>
        Уже маєте акаунт? <span>Увійти</span>
      </button>
    </>
  );
}
