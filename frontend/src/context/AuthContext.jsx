import { useCallback, useEffect, useMemo, useState } from 'react';
import { clearStoredToken, getCurrentUser, getStoredToken, signIn, signOut, signUp } from '../components/AuthModal/authApi';
import { AuthContext } from './authContextInstance';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()));

  const refreshUser = useCallback(async (explicitToken) => {
    const t = explicitToken || getStoredToken();
    if (!t) {
      setUser(null);
      setToken(null);
      return { ok: false, message: 'Користувач не авторизований.' };
    }

    const result = await getCurrentUser(t);
    if (result.ok && result.user) {
      setUser(result.user);
      setToken(t);
      return result;
    }

    setUser(null);
    setToken(null);
    clearStoredToken();
    return result;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialToken = getStoredToken();

    if (initialToken) {
      getCurrentUser(initialToken)
        .then((res) => {
          if (cancelled) return;
          if (res.ok && res.user) {
            setUser(res.user);
            setToken(initialToken);
          } else {
            setUser(null);
            setToken(null);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setUser(null);
            setToken(null);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await signIn(credentials);
    if (result.ok) {
      setToken(result.token);
      if (result.user) {
        setUser(result.user);
      } else {
        await refreshUser(result.token);
      }
    }
    return result;
  }, [refreshUser]);

  const register = useCallback(async (data) => {
    return await signUp(data);
  }, []);

  const logout = useCallback(() => {
    signOut();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

