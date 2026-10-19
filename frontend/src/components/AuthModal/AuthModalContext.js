import { createContext } from 'react';

export const AuthModalContext = createContext({ openAuth: () => {}, closeAuth: () => {} });

