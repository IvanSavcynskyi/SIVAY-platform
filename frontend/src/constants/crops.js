import { getCropName as getCropNameFromApi, FALLBACK_CROPS } from '../services/cropsApi.js';

export const CROPS = FALLBACK_CROPS;

export const getCropName = (id) => getCropNameFromApi(id);
