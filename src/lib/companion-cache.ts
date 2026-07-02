// 陪玩列表内存缓存（短 TTL），供 list 接口与写入路径（审核/更新/下架）共享失效信号
// 注意：与 rate-limit 一样，serverless 多实例下不共享，仅作"尽力而为"缓存

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const CACHE_TTL = 30000; // 30 秒

let cache: CacheEntry | null = null;

export function getCompanionListCache(): CacheEntry | null {
  if (!cache) return null;
  if (Date.now() - cache.timestamp >= CACHE_TTL) {
    cache = null;
    return null;
  }
  return cache;
}

export function setCompanionListCache(data: unknown): void {
  // 深拷贝避免外部修改影响缓存内容
  cache = { data: structuredClone(data), timestamp: Date.now() };
}

export function invalidateCompanionListCache(): void {
  cache = null;
}
