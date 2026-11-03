import uk from '../locales/uk.js';
import en from '../locales/en.js';

export const LANGUAGE_STORAGE_KEY = 'sivay.language.v1';

export const SUPPORTED_LANGUAGES = [
  { code: 'uk', label: 'Українська' },
  { code: 'en', label: 'English' },
];

export const TRANSLATIONS = { uk, en };

export const getNestedValue = (obj, path) => {
  if (!obj || typeof obj !== 'object' || typeof path !== 'string') return undefined;
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
};

export const translate = (language, path, fallback, params) => {
  let resolvedParams = params;
  let defaultFallback = fallback;
  if (typeof fallback === 'object' && fallback !== null && params === undefined) {
    resolvedParams = fallback;
    defaultFallback = undefined;
  }

  const activeDict = TRANSLATIONS[language];
  let val = getNestedValue(activeDict, path);
  if (val === undefined) {
    val = getNestedValue(TRANSLATIONS.uk, path);
  }
  if (val === undefined) {
    val = defaultFallback ?? path;
  }

  if (typeof val === 'string' && resolvedParams && typeof resolvedParams === 'object') {
    return val.replace(/\{(\w+)\}/g, (_, key) => (resolvedParams[key] !== undefined ? resolvedParams[key] : `{${key}}`));
  }

  return val;
};
