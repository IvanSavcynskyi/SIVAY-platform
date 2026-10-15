import { createContext, useContext } from 'react';

export const MapContext = createContext(null);

// Returns { map, maps } — only usable inside <GoogleMapView> children (rendered once the map exists).
export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used inside <GoogleMapView>');
  return ctx;
}
