import { useContext } from 'react';
import { AuthModalContext } from './AuthModalContext';

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export default useAuthModal;

