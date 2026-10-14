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

  const controlBorder = error
    ? 'border-danger focus-within:border-danger focus-within:ring-3 focus-within:ring-danger/20'
    : 'border-border-main focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/20';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium leading-[1.3] text-brand-text" htmlFor={id}>
        {label}
      </label>
      <div
        className={`flex h-[58px] items-center gap-3 rounded-xl border bg-white px-4 text-muted transition-[border-color,box-shadow] duration-150 ${controlBorder}`}
      >
        <Icon name={icon} size={19} className="shrink-0" />
        <input
          id={id}
          name={name}
          type={isPassword && isVisible ? 'text' : type}
          className="h-full flex-1 min-w-0 border-0 bg-transparent p-0 text-base text-brand-text outline-none focus:outline-none focus-visible:outline-none placeholder:text-muted placeholder:opacity-100 md:text-[15px]"
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
            className="-mr-2 grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-[10px] border-0 bg-transparent p-0 text-muted transition-colors hover:text-brand-text"
            aria-label={isVisible ? 'Сховати пароль' : 'Показати пароль'}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((current) => !current)}
          >
            <Icon name={isVisible ? 'eye' : 'eye-off'} size={19} />
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="m-0 text-[13px] leading-[1.4] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
