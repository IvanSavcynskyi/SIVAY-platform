import test from 'node:test';
import assert from 'node:assert/strict';

import uk from '../src/locales/uk.js';
import en from '../src/locales/en.js';
import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  getNestedValue,
  translate,
} from '../src/context/languageUtils.js';

test('1. Localization: supported languages include Ukrainian and English', () => {
  assert.equal(SUPPORTED_LANGUAGES.length, 2);
  const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
  assert.ok(codes.includes('uk'));
  assert.ok(codes.includes('en'));
});

test('2. Localization: dictionaries contain key navigation and header translations', () => {
  assert.equal(uk.nav.home, 'Головна');
  assert.equal(en.nav.home, 'Home');

  assert.equal(uk.header.signIn, 'Увійти');
  assert.equal(en.header.signIn, 'Sign in');

  assert.equal(uk.lang.title, 'MOBA / LANGUAGE');
  assert.equal(en.lang.title, 'MOBA / LANGUAGE');
});

test('3. Localization: translate helper resolves keys and falls back gracefully', () => {
  assert.equal(translate('uk', 'nav.home'), 'Головна');
  assert.equal(translate('en', 'nav.home'), 'Home');
  assert.equal(translate('en', 'nonexistent.key', 'Fallback Text'), 'Fallback Text');
  assert.equal(translate('en', 'nonexistent.key'), 'nonexistent.key');
});

test('4. Localization: getNestedValue handles edge cases', () => {
  assert.equal(getNestedValue(uk, 'nav.home'), 'Головна');
  assert.equal(getNestedValue(null, 'nav.home'), undefined);
  assert.equal(getNestedValue(uk, 'invalid.path'), undefined);
});

test('5. Localization: local storage key is standard and predictable', () => {
  assert.equal(LANGUAGE_STORAGE_KEY, 'sivay.language.v1');
});
