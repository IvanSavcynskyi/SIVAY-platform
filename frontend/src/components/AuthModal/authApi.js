
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TOKEN_KEY = "sivay_access_token";

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    return {
      ok: false,
      message:
        "Не вдалося підключитися до сервера. Перевір, чи запущений бекенд.",
    };
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : typeof detail === "string"
        ? detail
        : "Не вдалося виконати запит.";

    return { ok: false, message };
  }

  return { ok: true, data };
}

export async function signIn({ email, password }) {
  const body = new URLSearchParams({
    username: email,
    password,
  });

  const result = await apiRequest("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!result.ok) {
    return result;
  }

  if (!result.data?.access_token) {
    return {
      ok: false,
      message: "Сервер не повернув токен авторизації.",
    };
  }

  sessionStorage.setItem(TOKEN_KEY, result.data.access_token);

  return {
    ok: true,
    token: result.data.access_token,
  };
}

export async function signUp({ name, email, password }) {
  const result = await apiRequest("/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: name.trim(),
      email: email.trim(),
      password,
    }),
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    user: result.data,
  };
}

export async function getCurrentUser() {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (!token) {
    return { ok: false, message: "Користувач не авторизований." };
  }

  const result = await apiRequest("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!result.ok) {
    if (result.message !== "Не вдалося підключитися до сервера. Перевір, чи запущений бекенд.") {
      sessionStorage.removeItem(TOKEN_KEY);
    }

    return result;
  }

  return {
    ok: true,
    user: result.data,
  };
}

export function signOut() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function requestPasswordReset() {
  return {
    ok: false,
    message: "Відновлення пароля поки не підтримується сервером.",
  };
}
