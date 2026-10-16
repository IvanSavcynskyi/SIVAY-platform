function Svg({ size = 20, className = '', children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconCheck = (p) => <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>;
export const IconChevronDown = (p) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>;
export const IconChevronUp = (p) => <Svg {...p}><path d="m18 15-6-6-6 6" /></Svg>;
export const IconSearch = (p) => <Svg {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Svg>;
export const IconPin = (p) => <Svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Svg>;
export const IconPlus = (p) => <Svg {...p}><path d="M5 12h14M12 5v14" /></Svg>;
export const IconMinus = (p) => <Svg {...p}><path d="M5 12h14" /></Svg>;
export const IconTarget = (p) => <Svg {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Svg>;
export const IconInfo = (p) => <Svg {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></Svg>;
export const IconPolygon = (p) => <Svg {...p}><path d="M12 2 22 9.5 18 21H6L2 9.5Z" /></Svg>;
export const IconShield = (p) => (
  <Svg {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
