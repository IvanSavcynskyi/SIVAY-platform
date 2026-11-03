const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateName(value) {
  const name = value.trim();

  if (!name) {
    return 'auth.errors.nameRequired';
  }

  if (name.length < 2) {
    return 'auth.errors.nameMin';
  }

  return '';
}

export function validateEmail(value) {
  const email = value.trim();

  if (!email) {
    return 'auth.errors.emailRequired';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'auth.errors.emailInvalid';
  }

  return '';
}

export function validateNewPassword(value) {
  if (!value) {
    return 'auth.errors.passwordRequired';
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return 'auth.errors.passwordMin';
  }

  return '';
}

export function validateCurrentPassword(value) {
  return value ? '' : 'auth.errors.passwordEnter';
}
