import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: () => {},
  refreshUser: async () => ({ ok: false }),
});

