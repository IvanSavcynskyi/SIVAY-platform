export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

export const isMapsConfigured = () => Boolean(GOOGLE_MAPS_KEY);

let loading = null;
let authFailed = false;
const authListeners = new Set();

if (typeof window !== 'undefined') {
  window.gm_authFailure = () => {
    authFailed = true;
    authListeners.forEach((fn) => fn());
  };
}

export const hasAuthFailed = () => authFailed;

export function subscribeAuthFailure(fn) {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}

export function loadGoogleMaps() {
  if (!isMapsConfigured()) return Promise.reject(new Error('MISSING_KEY'));
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const callbackName = '__sivayMapsReady';
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };
    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}` +
      `&v=weekly&loading=async&language=uk&region=UA&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error('LOAD_FAILED'));
    };
    document.head.appendChild(script);
  }).then(async (maps) => {
    await Promise.all([maps.importLibrary('maps'), maps.importLibrary('marker'), maps.importLibrary('geocoding')]);
    return maps;
  });

  return loading;
}
