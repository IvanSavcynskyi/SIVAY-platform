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
import { formatHa, plotsWord } from '../src/utils/format.js';
import { getCropName, getLocalizedCrops, CROPS } from '../src/constants/crops.js';

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

test('6. Localization: interpolation formats parameterized strings correctly', () => {
  assert.equal(
    translate('uk', 'auth.welcomeUser', { name: 'Олександр' }),
    'Вітаємо, Олександр! Ви успішно увійшли.',
  );
  assert.equal(
    translate('en', 'auth.welcomeUser', { name: 'Alex' }),
    'Welcome, Alex! You have signed in successfully.',
  );
  assert.equal(
    translate('uk', 'analysisPage.step3SummarySelected', { count: 3 }),
    'Обрано культур: 3',
  );
  assert.equal(
    translate('en', 'analysisPage.step3SummarySelected', { count: 3 }),
    'Selected crops: 3',
  );
});

test('7. Localization: formatHa and plotsWord support multilingual output', () => {
  assert.equal(formatHa(12.34, 'uk'), '12,3 га');
  assert.equal(formatHa(12.34, 'en'), '12.3 ha');
  assert.equal(formatHa(12.34), '12,3 га'); // backward compatibility

  assert.equal(plotsWord(1, 'uk'), 'ділянка');
  assert.equal(plotsWord(3, 'uk'), 'ділянки');
  assert.equal(plotsWord(5, 'uk'), 'ділянок');
  assert.equal(plotsWord(1, 'en'), 'plot');
  assert.equal(plotsWord(3, 'en'), 'plots');
  assert.equal(plotsWord(5, 'en'), 'plots');
});

test('8. Localization: crops and groups support localization with fallbacks', () => {
  const tUk = (k, f, p) => translate('uk', k, f, p);
  const tEn = (k, f, p) => translate('en', k, f, p);

  assert.equal(getCropName('wheat', tUk), 'Пшениця');
  assert.equal(getCropName('wheat', tEn), 'Winter Wheat');
  assert.equal(getCropName('wheat'), 'Пшениця'); // backward compatibility

  const localizedUk = getLocalizedCrops(tUk);
  const localizedEn = getLocalizedCrops(tEn);
  assert.equal(localizedUk.length, CROPS.length);
  assert.equal(localizedEn.length, CROPS.length);

  assert.equal(localizedUk[0].name, 'Пшениця');
  assert.equal(localizedUk[0].group, 'Зернові');
  assert.equal(localizedEn[0].name, 'Winter Wheat');
  assert.equal(localizedEn[0].group, 'Grains');
});

test('9. Localization: analysisPage and googleMap sections have complete translation keys', () => {
  assert.ok(uk.analysisPage.fieldStep.markBoundariesBtn);
  assert.ok(en.analysisPage.fieldStep.markBoundariesBtn);
  assert.ok(uk.analysisPage.seasonsStep.addPrevSeasonBtn);
  assert.ok(en.analysisPage.seasonsStep.addPrevSeasonBtn);
  assert.ok(uk.analysisPage.cropsStep.submitBtnActive);
  assert.ok(en.analysisPage.cropsStep.submitBtnActive);
  assert.ok(uk.googleMap.roadmap);
  assert.ok(en.googleMap.roadmap);
});
