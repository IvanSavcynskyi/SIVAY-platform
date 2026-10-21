const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
const rawBase = (isDev && import.meta.env?.VITE_DIRECT_API !== 'true')
  ? ''
  : ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '');
const API_BASE_URL = rawBase.replace(/\/+$/, '');

export const TOKEN_KEY = 'sivay_access_token';

function getStorage(type) {
  if (typeof window !== 'undefined' && window[type]) return window[type];
  if (typeof globalThis !== 'undefined' && globalThis[type]) return globalThis[type];
  return null;
}

export function getStoredToken() {
  const local = getStorage('localStorage');
  const session = getStorage('sessionStorage');
  return local?.getItem?.(TOKEN_KEY) || session?.getItem?.(TOKEN_KEY) || null;
}

export function setStoredToken(token) {
  const local = getStorage('localStorage');
  const session = getStorage('sessionStorage');
  if (token) {
    local?.setItem?.(TOKEN_KEY, token);
    session?.setItem?.(TOKEN_KEY, token);
  } else {
    local?.removeItem?.(TOKEN_KEY);
    session?.removeItem?.(TOKEN_KEY);
  }
}

export function clearStoredToken() {
  setStoredToken(null);
}

function formatDetailMessage(detail) {
  if (typeof detail === 'string' && detail.trim()) {
    if (detail.includes('Incorrect username or password') || detail.includes('Incorrect email or password')) {
      return 'Невірний логін або пароль.';
    }
    if (detail.includes('already registered') || detail.includes('already exists') || detail.includes('вже існує')) {
      return 'Користувач із такою електронною поштою вже зареєстрований.';
    }
    if (detail.includes('Not authenticated') || detail.includes('Could not validate credentials')) {
      return 'Сесія закінчилася. Будь ласка, увійдіть знову.';
    }
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        const field = item?.loc?.[item.loc.length - 1];
        const msg = item?.msg || 'Помилка валідації';
        if (field && field !== 'body') {
          return `${field}: ${msg}`;
        }
        return msg;
      })
      .join('; ');
  }

  if (detail && typeof detail === 'object') {
    return detail.message || detail.msg || detail.error || '';
  }

  return '';
}

export async function apiRequest(path, options = {}) {
  let response;

  try {
    const url = `${API_BASE_URL}${path}`;
    response = await fetch(url, options);
  } catch {
    return {
      ok: false,
      message: 'Не вдалося підключитися до сервера. Перевірте, чи запущений бекенд.',
    };
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const rawDetail = data?.detail || data?.message || data?.error;
    let message = formatDetailMessage(rawDetail);

    if (!message) {
      if (response.status === 502 || response.status === 504) {
        message = 'Помилка 502 (Bad Gateway): не вдалося з\'єднатися з бекендом. Перевірте, чи запущений сервер FastAPI (uvicorn) та чи співпадає порт (очікується http://127.0.0.1:8000).';
      } else if (response.status === 500) {
        message = 'Помилка 500: внутрішня помилка сервера бекенду. Перевірте, чи створені таблиці в PostgreSQL та логи у терміналі бекенду.';
      } else if (response.status === 404) {
        message = 'Помилка 404: ендпоінт не знайдено на сервері.';
      } else if (response.status === 401 || response.status === 403) {
        message = 'Невірний логін або пароль.';
      } else {
        message = `Помилка сервера (${response.status}).`;
      }
    }

    return {
      ok: false,
      status: response.status,
      message,
      data,
    };
  }

  return { ok: true, status: response.status, data };
}

export async function signIn({ email, password }) {
  const body = new URLSearchParams({
    username: (email || '').trim(),
    password: password || '',
  });

  const result = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!result.ok) {
    return result;
  }

  const token = result.data?.access_token;
  if (!token) {
    return {
      ok: false,
      message: 'Сервер не повернув токен авторизації.',
    };
  }

  setStoredToken(token);

  const meResult = await getCurrentUser(token);
  return {
    ok: true,
    token,
    user: meResult.ok ? meResult.user : null,
  };
}

export async function signUp({ name = '', email = '', password = '', firstName, lastName, phoneNumber, dateOfBirth }) {
  const cleanName = (name || '').trim();
  const nameParts = cleanName.split(/\s+/).filter(Boolean);
  const derivedFirst = firstName || nameParts[0] || null;
  const derivedLast = lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null);

  const payload = {
    email: (email || '').trim(),
    password: password || '',
    first_name: derivedFirst,
    last_name: derivedLast,
    phone_number: phoneNumber || null,
    date_of_birth: dateOfBirth || null,
  };

  const result = await apiRequest('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    user: result.data,
  };
}

export async function getCurrentUser(explicitToken) {
  const token = explicitToken || getStoredToken();

  if (!token) {
    return { ok: false, message: 'Користувач не авторизований.' };
  }

  const result = await apiRequest('/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      clearStoredToken();
    }
    return result;
  }

  return {
    ok: true,
    user: result.data,
  };
}

export function signOut() {
  clearStoredToken();
  return { ok: true };
}

export async function requestPasswordReset() {
  return {
    ok: false,
    notConnected: true,
    message: 'Відновлення пароля наразі налаштовується на сервері.',
  };
}
