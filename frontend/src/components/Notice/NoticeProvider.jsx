import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './Notice.css';

const NoticeContext = createContext({ showNotice: () => {} });

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
      <div className="notice" role="status" aria-live="polite">
        {message && <p className="notice__message">{message}</p>}
      </div>
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  return useContext(NoticeContext);
}