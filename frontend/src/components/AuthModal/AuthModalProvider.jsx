import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import AuthModal from './AuthModal';

const AuthModalContext = createContext({ openAuth: () => {}, closeAuth: () => {} });

export function AuthModalProvider({ children }) {
  const [view, setView] = useState(null);
  const viewRef = useRef(null);
  const returnFocusRef = useRef(null);

  const openAuth = useCallback((nextView, returnFocusTo) => {
    if (viewRef.current === null) {
      returnFocusRef.current = returnFocusTo ?? document.activeElement;
    }

    viewRef.current = nextView;
    setView(nextView);
  }, []);

  const closeAuth = useCallback(() => {
    const returnTo = returnFocusRef.current;

    viewRef.current = null;
    returnFocusRef.current = null;
    setView(null);

    if (returnTo && returnTo.isConnected) {
      returnTo.focus();
    }
  }, []);

  const value = useMemo(() => ({ openAuth, closeAuth }), [openAuth, closeAuth]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {view && <AuthModal view={view} onNavigate={openAuth} onClose={closeAuth} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
