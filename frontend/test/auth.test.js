import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOKEN_KEY,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  signIn,
  signUp,
  getCurrentUser,
  signOut,
} from '../src/components/AuthModal/authApi.js';

// Setup mock localStorage and sessionStorage in Node.js environment
const localStore = new Map();
const sessionStore = new Map();

globalThis.localStorage = {
  getItem: (key) => (localStore.has(key) ? localStore.get(key) : null),
  setItem: (key, value) => localStore.set(key, String(value)),
  removeItem: (key) => localStore.delete(key),
  clear: () => localStore.clear(),
};

globalThis.sessionStorage = {
  getItem: (key) => (sessionStore.has(key) ? sessionStore.get(key) : null),
  setItem: (key, value) => sessionStore.set(key, String(value)),
  removeItem: (key) => sessionStore.delete(key),
  clear: () => sessionStore.clear(),
};

test.beforeEach(() => {
  localStore.clear();
  sessionStore.clear();
});

test('1. Token storage: saves, retrieves, and clears token in storage', () => {

  assert.equal(getStoredToken(), null);

  setStoredToken('test_jwt_token_123');
  assert.equal(getStoredToken(), 'test_jwt_token_123');
  assert.equal(localStorage.getItem(TOKEN_KEY), 'test_jwt_token_123');
  assert.equal(sessionStorage.getItem(TOKEN_KEY), 'test_jwt_token_123');

  clearStoredToken();
  assert.equal(getStoredToken(), null);
  assert.equal(localStorage.getItem(TOKEN_KEY), null);
  assert.equal(sessionStorage.getItem(TOKEN_KEY), null);
});

test('2. signUp: formats payload to match OpenAPI UserCreate contract', async () => {
  let capturedUrl = null;
  let capturedOptions = null;

  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return {
      ok: true,
      status: 201,
      json: async () => ({
        id: 42,
        email: 'ivan@example.com',
        role: 'user',
        first_name: 'Іван',
        last_name: 'Франко',
        phone_number: null,
        date_of_birth: null,
      }),
    };
  };

  const result = await signUp({
    name: 'Іван Франко',
    email: '  ivan@example.com  ',
    password: 'password123',
  });

  assert.equal(result.ok, true);
  assert.equal(capturedUrl, '/api/v1/auth/register');
  assert.equal(capturedOptions.method, 'POST');
  assert.equal(capturedOptions.headers['Content-Type'], 'application/json');

  const parsedBody = JSON.parse(capturedOptions.body);
  assert.equal(parsedBody.email, 'ivan@example.com');
  assert.equal(parsedBody.password, 'password123');
  assert.equal(parsedBody.first_name, 'Іван');
  assert.equal(parsedBody.last_name, 'Франко');
  assert.equal(parsedBody.phone_number, null);
  assert.equal(parsedBody.date_of_birth, null);

  assert.equal(result.user.id, 42);
  assert.equal(result.user.role, 'user');
});

test('3. signUp: handles validation errors (422) and server errors (400) cleanly', async () => {
  // Test 422 Validation error
  globalThis.fetch = async () => ({
    ok: false,
    status: 422,
    json: async () => ({
      detail: [
        { loc: ['body', 'password'], msg: 'String should have at least 8 characters', type: 'string_too_short' },
      ],
    }),
  });

  const res422 = await signUp({
    name: 'Test',
    email: 'test@example.com',
    password: 'short',
  });

  assert.equal(res422.ok, false);
  assert.equal(res422.status, 422);
  assert.ok(res422.message.includes('password'));
  assert.ok(res422.message.includes('8 characters'));

  // Test 400 Already registered
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({
      detail: 'User with this email already registered',
    }),
  });

  const res400 = await signUp({
    name: 'Test',
    email: 'existing@example.com',
    password: 'password123',
  });

  assert.equal(res400.ok, false);
  assert.equal(res400.status, 400);
  assert.equal(res400.message, 'Користувач із такою електронною поштою вже зареєстрований.');
});

test('4. signIn: formats form-urlencoded body (username & password) and stores token', async () => {
  localStorage.clear();
  sessionStorage.clear();

  let loginUrl = null;
  let loginOptions = null;
  let meCalled = false;

  globalThis.fetch = async (url, options) => {
    if (url === '/api/v1/auth/login') {
      loginUrl = url;
      loginOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'valid_jwt_token_abc',
          token_type: 'bearer',
        }),
      };
    }
    if (url === '/api/v1/auth/me') {
      meCalled = true;
      assert.equal(options.headers.Authorization, 'Bearer valid_jwt_token_abc');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: 10,
          email: 'taras@example.com',
          role: 'user',
          first_name: 'Тарас',
          last_name: 'Шевченко',
        }),
      };
    }
    throw new Error(`Unexpected URL ${url}`);
  };

  const result = await signIn({
    email: 'taras@example.com',
    password: 'mySecurePassword',
  });

  assert.equal(result.ok, true);
  assert.equal(loginUrl, '/api/v1/auth/login');
  assert.equal(loginOptions.method, 'POST');
  assert.equal(loginOptions.headers['Content-Type'], 'application/x-www-form-urlencoded');

  // Verify URLSearchParams
  assert.ok(loginOptions.body instanceof URLSearchParams);
  assert.equal(loginOptions.body.get('username'), 'taras@example.com');
  assert.equal(loginOptions.body.get('password'), 'mySecurePassword');

  assert.equal(result.token, 'valid_jwt_token_abc');
  assert.equal(getStoredToken(), 'valid_jwt_token_abc');
  assert.equal(meCalled, true);
  assert.equal(result.user.id, 10);
  assert.equal(result.user.first_name, 'Тарас');
});

test('5. signIn: handles 401 Incorrect credentials with localized error message', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({
      detail: 'Incorrect username or password',
    }),
  });

  const result = await signIn({
    email: 'wrong@example.com',
    password: 'wrongpassword',
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  assert.equal(result.message, 'Невірний логін або пароль.');
  assert.equal(getStoredToken(), null);
});

test('6. getCurrentUser: sends Bearer token and clears token on 401 Unauthorized', async () => {
  setStoredToken('expired_or_invalid_token');

  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({
      detail: 'Could not validate credentials',
    }),
  });

  const result = await getCurrentUser();
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  // Token should be automatically purged upon 401
  assert.equal(getStoredToken(), null);
});

test('7. signOut: clears tokens from storage', () => {
  setStoredToken('dummy_active_token');
  assert.equal(getStoredToken(), 'dummy_active_token');

  const res = signOut();
  assert.equal(res.ok, true);
  assert.equal(getStoredToken(), null);
});

test('8. apiRequest: provides actionable messages on 502 Bad Gateway and 500 server error', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 502,
    json: async () => {
      throw new Error('Not JSON');
    },
  });

  const res502 = await signUp({
    name: 'Test',
    email: 'test502@example.com',
    password: 'password123',
  });

  assert.equal(res502.ok, false);
  assert.equal(res502.status, 502);
  assert.ok(res502.message.includes('502 (Bad Gateway)'));
  assert.ok(res502.message.includes('8000'));

  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({
      detail: '',
    }),
  });

  const res500 = await signUp({
    name: 'Test',
    email: 'test500@example.com',
    password: 'password123',
  });

  assert.equal(res500.ok, false);
  assert.equal(res500.status, 500);
  assert.ok(res500.message.includes('500'));
});
