// High-Performance In-Memory Cache for Ignitron 2K26
// Drastically accelerates GET endpoints and prevents MongoDB Atlas free-tier saturation.
// Invalidator functions ensure instant cross-device updates upon Admin writes.

const cacheStore = new Map();

export function getCached(key) {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return item.data;
}

export function setCached(key, data, ttlMs = 20000) {
  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCache(keyPrefix) {
  if (!keyPrefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(keyPrefix)) {
      cacheStore.delete(key);
    }
  }
}
