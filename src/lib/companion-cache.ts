const CACHE_TTL = 30000; // 30 seconds
let cache: { data: unknown; timestamp: number } | null = null;

export function getCachedCompanions() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }
  return null;
}

export function setCachedCompanions(data: unknown) {
  cache = { data, timestamp: Date.now() };
}

export function invalidateCompanionCache() {
  cache = null;
}
