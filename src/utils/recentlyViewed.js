import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDestination } from '../db/database';

const normalizeId = (id) => String(id);

const STORAGE_KEY = 'gala-tour-recently-viewed-v1';
const MAX_RECENT_DESTINATIONS = 50;

async function readRecentlyViewed() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  const entries = JSON.parse(saved);
  if (!Array.isArray(entries)) {
    throw new Error('Stored recently viewed destinations are invalid.');
  }

  return entries.filter((entry) =>
    entry
    && entry.id !== undefined
    && entry.id !== null
    && String(entry.id) !== ''
    && typeof entry.viewedAt === 'string'
    && Number.isFinite(Date.parse(entry.viewedAt))
  ).map((entry) => ({ ...entry, id: normalizeId(entry.id) }));
}

export async function recordRecentlyViewed(id) {
  const destinationId = normalizeId(id);
  if (!destinationId) {
    throw new Error('A valid destination ID is required to record a recent view.');
  }

  const entries = await readRecentlyViewed();
  const updated = [
    { id: destinationId, viewedAt: new Date().toISOString() },
    ...entries.filter((entry) => normalizeId(entry.id) !== destinationId),
  ].slice(0, MAX_RECENT_DESTINATIONS);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getRecentlyViewedDestinations() {
  const entries = await readRecentlyViewed();
  const destinations = await Promise.all(entries.map(async (entry) => {
    const destination = await getDestination(normalizeId(entry.id));
    return destination ? { ...destination, viewedAt: entry.viewedAt } : null;
  }));
  const validDestinations = destinations.filter(Boolean);

  if (validDestinations.length !== entries.length) {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(validDestinations.map(({ id, viewedAt }) => ({ id, viewedAt })))
    );
  }

  return validDestinations;
}
