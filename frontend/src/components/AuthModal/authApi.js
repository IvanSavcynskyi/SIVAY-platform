const NOT_CONNECTED = { ok: false, notConnected: true };

export async function signIn({ email, password }) {
  return NOT_CONNECTED;
}

export async function signUp({ name, email, password }) {
  return NOT_CONNECTED;
}

export async function requestPasswordReset({ email }) {
  return NOT_CONNECTED;
}
