import { useId, useState } from 'react';
import Icon from '../Icon/Icon';

export default function AuthField({
  label,
  icon,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  autoFocus = false,
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`auth-field${error ? ' auth-field--invalid' : ''}`}>
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-field__control">
        <Icon name={icon} size={19} className="auth-field__icon" />
        <input
          id={id}
          name={name}
          type={isPassword && isVisible ? 'text' : type}
          className="auth-field__input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          data-autofocus={autoFocus ? '' : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-field__toggle"
            aria-label={isVisible ? 'Сховати пароль' : 'Показати пароль'}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((current) => !current)}
          >
            <Icon name={isVisible ? 'eye' : 'eye-off'} size={19} />
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="auth-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
