
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateName(value) {
  const name = value.trim();

  if (!name) {
    return 'Вкажіть ім’я';
  }

  if (name.length < 2) {
    return 'Ім’я має містити щонайменше 2 символи';
  }

  return '';
}

export function validateEmail(value) {
  const email = value.trim();

  if (!email) {
    return 'Вкажіть електронну пошту';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Вкажіть коректну електронну пошту';
  }

  return '';
}

export function validateNewPassword(value) {
  if (!value) {
    return 'Вкажіть пароль';
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Пароль має містити щонайменше ${MIN_PASSWORD_LENGTH} символів`;
  }

  return '';
}

export function validateCurrentPassword(value) {
  return value ? '' : 'Введіть пароль';
}
