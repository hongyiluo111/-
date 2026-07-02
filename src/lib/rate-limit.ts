interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const DEFAULT_WINDOW_MS = 60000;
const DEFAULT_MAX_REQUESTS = 30;
// 惰性清理：每 N 次调用做一次全量扫描
const LAZY_CLEANUP_THRESHOLD = 100;

// 用 globalThis 持久化，避免开发模式 HMR 重置；
// 注意：生产 serverless 环境下每个函数实例内存独立，此限流为"尽力而为"级别，
//       跨实例无法共享。强一致限流需接入 Redis（Upstash/Redis）等持久化存储。
const globalForRateLimit = globalThis as unknown as {
  __rateLimitStore?: Map<string, RateLimitEntry>;
  __rateLimitCallCount?: number;
};

if (!globalForRateLimit.__rateLimitStore) {
  globalForRateLimit.__rateLimitStore = new Map();
  globalForRateLimit.__rateLimitCallCount = 0;
}

function lazyCleanup(): void {
  const callCount = globalForRateLimit.__rateLimitCallCount! + 1;
  globalForRateLimit.__rateLimitCallCount = callCount;
  if (callCount < LAZY_CLEANUP_THRESHOLD) return;

  globalForRateLimit.__rateLimitCallCount = 0;
  const now = Date.now();
  const store = globalForRateLimit.__rateLimitStore!;
  for (const [key, entry] of store) {
    if (now >= entry.resetTime) {
      store.delete(key);
    }
  }
}

export function rateLimit(
  key: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): { allowed: boolean; retryAfter?: number } {
  lazyCleanup();

  const store = globalForRateLimit.__rateLimitStore!;
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(key, entry);
    return { allowed: true };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return { allowed: true };
}

export function clearRateLimit(key: string) {
  globalForRateLimit.__rateLimitStore!.delete(key);
}
