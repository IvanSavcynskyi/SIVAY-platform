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

export const translate = (language, path, fallback) => {
  const activeDict = TRANSLATIONS[language];
  const val = getNestedValue(activeDict, path);
  if (val !== undefined) return val;

  const fallbackVal = getNestedValue(TRANSLATIONS.uk, path);
  if (fallbackVal !== undefined) return fallbackVal;

  return fallback ?? path;
};

