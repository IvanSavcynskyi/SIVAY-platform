import { createContext, useContext } from 'react';

export const MapContext = createContext(null);

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used inside <GoogleMapView>');
  return ctx;
}
