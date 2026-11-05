export function formatHa(value, language = 'uk') {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const formatted = (Math.round(n * 10) / 10).toFixed(1);
  if (language === 'en') {
    return `${formatted} ha`;
  }
  return `${formatted.replace('.', ',')} га`;
}

export function plotsWord(n, language = 'uk') {
  const num = typeof n === 'number' && Number.isFinite(n) ? Math.floor(Math.abs(n)) : 0;
  if (language === 'en') {
    return num === 1 ? 'plot' : 'plots';
  }
  const m10 = num % 10;
  const m100 = num % 100;
  if (m10 === 1 && m100 !== 11) return 'ділянка';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'ділянки';
  return 'ділянок';
}
