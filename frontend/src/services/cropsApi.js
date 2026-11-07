import { apiRequest, getStoredToken } from '../components/AuthModal/authApi.js';

export const FALLBACK_CROPS = [
  { id: 1, slug: 'wheat', name: 'Пшениця', group: 'Зернові' },
  { id: 2, slug: 'corn', name: 'Кукурудза', group: 'Зернові' },
  { id: 3, slug: 'sunflower', name: 'Соняшник', group: 'Олійні' },
  { id: 4, slug: 'soy', name: 'Соя', group: 'Бобові' },
  { id: 5, slug: 'rapeseed', name: 'Ріпак', group: 'Олійні' },
  { id: 6, slug: 'barley', name: 'Ячмінь', group: 'Зернові' },
  { id: 7, slug: 'peas', name: 'Горох', group: 'Бобові' },
  { id: 8, slug: 'buckwheat', name: 'Гречка', group: "Круп'яні" },
];

const KNOWN_GROUPS = {
  пшениця: 'Зернові',
  кукурудза: 'Зернові',
  ячмінь: 'Зернові',
  жито: 'Зернові',
  овес: 'Зернові',
  соняшник: 'Олійні',
  ріпак: 'Олійні',
  соя: 'Бобові',
  горох: 'Бобові',
  нут: 'Бобові',
  квасоля: 'Бобові',
  гречка: "Круп'яні",
  просо: "Круп'яні",
  цукровий_буряк: 'Технічні',
  буряк: 'Технічні',
};

let cachedCrops = null;

function inferGroup(cropName) {
  if (!cropName) return 'Інші';
  const lower = cropName.trim().toLowerCase();
  for (const [key, group] of Object.entries(KNOWN_GROUPS)) {
    if (lower.includes(key)) {
      return group;
    }
  }
  return 'Інші';
}


export async function listCrops({ forceRefresh = false } = {}) {
  if (cachedCrops && !forceRefresh) {
    return cachedCrops;
  }

  const token = getStoredToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await apiRequest('/api/v1/crops/?limit=500', { headers });

    if (response.ok && Array.isArray(response.data) && response.data.length > 0) {
      cachedCrops = response.data.map((c) => ({
        id: c.id,
        name: c.name,
        group: inferGroup(c.name),
        slug: String(c.id),
      }));
      return cachedCrops;
    }
  } catch {
    
  }

  return FALLBACK_CROPS;
}


export function getCropName(id, cropsList = null) {
  if (id == null) return null;
  const list = cropsList || cachedCrops || FALLBACK_CROPS;

  const found = list.find((c) => {
    if (c.id === id || String(c.id) === String(id)) return true;
    if (c.slug && c.slug === id) return true;
    return false;
  });

  if (found) return found.name;

 
  const fallback = FALLBACK_CROPS.find((c) => c.id === id || c.slug === id || String(c.id) === String(id));
  return fallback ? fallback.name : null;
}


export function resolveCropId(idOrSlug, cropsList = null) {
  if (idOrSlug == null) return null;
  const num = Number(idOrSlug);
  if (Number.isInteger(num) && num > 0) {
    return num;
  }

  const list = cropsList || cachedCrops || FALLBACK_CROPS;
  const found = list.find((c) => c.slug === idOrSlug || c.name?.toLowerCase() === String(idOrSlug).toLowerCase());
  if (found && Number.isInteger(Number(found.id))) {
    return Number(found.id);
  }

  
  const fallback = FALLBACK_CROPS.find((c) => c.slug === idOrSlug || c.name?.toLowerCase() === String(idOrSlug).toLowerCase());
  return fallback ? fallback.id : 1;
}


export function clearCropsCache() {
  cachedCrops = null;
}
