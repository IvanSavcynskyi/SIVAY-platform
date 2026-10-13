import Button from '../Button/Button';
import { useNotice } from '../Notice/NoticeProvider';
import AuthField from './AuthField';
import GoogleIcon from './GoogleIcon';
import useAuthForm from './useAuthForm';
import { signIn } from './authApi';
import { validateCurrentPassword, validateEmail } from './validators';

const VALIDATORS = { email: validateEmail, password: validateCurrentPassword };

export default function SignInForm({ onNavigate, onClose }) {
  const { showNotice } = useNotice();
  const { values, errors, formError, setFormError, submitting, handleChange, handleSubmit } =
    useAuthForm({ email: '', password: '' }, VALIDATORS);

  const submit = handleSubmit(async (formValues) => {
    const result = await signIn(formValues);

    if (result.notConnected) {
      showNotice('Вхід ще не реалізовано.');
      return;
    }

    if (result.ok) {
      onClose();
      return;
    }

    setFormError(result.message || 'Не вдалося увійти. Перевірте дані та спробуйте ще раз.');
  });

  return (
    <>
      <div className="auth-modal__heading">
        <h2 id="auth-modal-title" className="auth-modal__title">
          Вітаємо знову!
        </h2>
        <p className="auth-modal__text">
          Увійдіть до свого акаунта SIVAY, щоб продовжити роботу зі своїми полями.
        </p>
      </div>

      <Button
        variant="secondary"
        className="auth-google"
        onClick={() => showNotice('Вхід через Google ще не реалізовано.')}
      >
        <GoogleIcon />
        Увійти через Google
      </Button>

      <div className="auth-divider">
        <span className="auth-divider__label">або</span>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate>
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
          <div className="auth-field-group">
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
            <div className="auth-field-group__row">
              <button type="button" className="auth-link" onClick={() => onNavigate('forgot')}>
                Забули пароль?
              </button>
            </div>
          </div>
        </div>

        {formError && (
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" arrow disabled={submitting}>
          Увійти
        </Button>
      </form>

      <button type="button" className="auth-switch" onClick={() => onNavigate('signup')}>
        Ще не маєте акаунта? <span>Зареєструватися</span>
      </button>
    </>
  );
}
