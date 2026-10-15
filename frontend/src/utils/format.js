export function formatHa(value) {
  return `${(Math.round(value * 10) / 10).toFixed(1).replace('.', ',')} га`;
}

export function plotsWord(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'ділянка';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'ділянки';
  return 'ділянок';
}
