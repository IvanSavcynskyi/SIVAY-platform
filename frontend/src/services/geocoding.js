import { loadGoogleMaps } from '../components/GoogleMap/loadGoogleMaps';

export async function geocodePlace(query) {
  const maps = await loadGoogleMaps();
  const { Geocoder } = await maps.importLibrary('geocoding');
  let response;
  try {
    response = await new Geocoder().geocode({ address: query, componentRestrictions: { country: 'UA' }, language: 'uk' });
  } catch (error) {
    if (String(error?.code ?? error?.message).includes('ZERO_RESULTS')) return [];
    throw error;
  }
  return response.results.slice(0, 5).map((r) => {
    const parts = r.formatted_address.split(',').map((s) => s.trim()).filter((s) => s && s !== 'Україна');
    const region = r.address_components.find((c) => c.types.includes('administrative_area_level_1'))?.long_name ?? '';
    return {
      id: r.place_id,
      title: parts[0] ?? r.formatted_address,
      subtitle: parts.slice(1).join(', '),
      region,
      center: r.geometry.location.toJSON(),
      viewport: r.geometry.viewport ? r.geometry.viewport.toJSON() : null,
    };
  });
}
