import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NoticeContext } from './NoticeContext';

export function NoticeProvider({ children }) {
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  const showNotice = useCallback((text) => {
    setMessage(text);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setMessage(''), 3500);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const value = useMemo(() => ({ showNotice }), [showNotice]);

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] right-4 left-4 z-[1000] flex justify-center"
        role="status"
        aria-live="polite"
      >
        {message && (
          <p className="m-0 rounded-xl bg-brand-text px-[18px] py-3 text-[15px] font-medium text-white shadow-[0_12px_28px_-6px_rgba(13,45,32,0.3)] animate-notice-in">
            {message}
          </p>
        )}
      </div>
    </NoticeContext.Provider>
  );
}

export default NoticeProvider;
