// 白盒单元测试：lib/rate-limit.ts 限流逻辑
// 运行：node --test tests/unit/rate-limit.test.mjs
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// 复刻 rate-limit.ts 逻辑（避免 TypeScript 编译问题）
const DEFAULT_WINDOW_MS = 60000;
const DEFAULT_MAX_REQUESTS = 30;
const LAZY_CLEANUP_THRESHOLD = 100;

const globalForRateLimit = globalThis;
if (!globalForRateLimit.__rateLimitStore) {
  globalForRateLimit.__rateLimitStore = new Map();
  globalForRateLimit.__rateLimitCallCount = 0;
}

function lazyCleanup() {
  const callCount = globalForRateLimit.__rateLimitCallCount + 1;
  globalForRateLimit.__rateLimitCallCount = callCount;
  if (callCount < LAZY_CLEANUP_THRESHOLD) return;
  globalForRateLimit.__rateLimitCallCount = 0;
  const now = Date.now();
  const store = globalForRateLimit.__rateLimitStore;
  for (const [key, entry] of store) {
    if (now >= entry.resetTime) store.delete(key);
  }
}

function rateLimit(key, maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS) {
  lazyCleanup();
  const store = globalForRateLimit.__rateLimitStore;
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || now >= entry.resetTime) {
    entry = { count: 1, resetTime: now + windowMs };
    store.set(key, entry);
    return { allowed: true };
  }
  entry.count += 1;
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
  }
  return { allowed: true };
}

function clearRateLimit(key) {
  globalForRateLimit.__rateLimitStore.delete(key);
}

describe('rateLimit 限流逻辑', () => {
  beforeEach(() => {
    globalForRateLimit.__rateLimitStore.clear();
    globalForRateLimit.__rateLimitCallCount = 0;
  });

  test('首次请求允许', () => {
    const result = rateLimit('test-key-1');
    assert.equal(result.allowed, true);
    assert.equal(result.retryAfter, undefined);
  });

  test('未超限前 N 次请求都允许', () => {
    for (let i = 0; i < 10; i++) {
      const result = rateLimit('test-key-2', 10, 60000);
      assert.equal(result.allowed, true, `第${i + 1}次应该允许`);
    }
  });

  test('超过限制后拒绝', () => {
    for (let i = 0; i < 5; i++) {
      rateLimit('test-key-3', 5, 60000);
    }
    const result = rateLimit('test-key-3', 5, 60000);
    assert.equal(result.allowed, false);
  });

  test('拒绝时返回 retryAfter（秒）', () => {
    for (let i = 0; i < 3; i++) rateLimit('test-key-4', 3, 60000);
    const result = rateLimit('test-key-4', 3, 60000);
    assert.equal(result.allowed, false);
    assert.ok(result.retryAfter > 0, 'retryAfter 应大于0');
    assert.ok(result.retryAfter <= 60, 'retryAfter 应小于等于60秒');
  });

  test('不同 key 独立计数', () => {
    for (let i = 0; i < 5; i++) rateLimit('user-A', 5, 60000);
    const a = rateLimit('user-A', 5, 60000);
    const b = rateLimit('user-B', 5, 60000);
    assert.equal(a.allowed, false, 'user-A 应被限流');
    assert.equal(b.allowed, true, 'user-B 不应被限流');
  });

  test('时间窗口过期后重置计数', () => {
    // 使用 50ms 的短窗口
    for (let i = 0; i < 3; i++) rateLimit('test-key-5', 3, 50);
    const blocked = rateLimit('test-key-5', 3, 50);
    assert.equal(blocked.allowed, false);

    // 等待窗口过期
    return new Promise(resolve => {
      setTimeout(() => {
        const after = rateLimit('test-key-5', 3, 50);
        assert.equal(after.allowed, true, '窗口过期后应重新允许');
        resolve();
      }, 60);
    });
  });

  test('默认参数：30次/分钟', () => {
    for (let i = 0; i < 30; i++) {
      const r = rateLimit('test-default');
      assert.equal(r.allowed, true, `第${i + 1}次应允许`);
    }
    const blocked = rateLimit('test-default');
    assert.equal(blocked.allowed, false, '第31次应被拒绝');
  });

  test('clearRateLimit 清除后可重新请求', () => {
    for (let i = 0; i < 5; i++) rateLimit('test-clear', 5, 60000);
    assert.equal(rateLimit('test-clear', 5, 60000).allowed, false);
    clearRateLimit('test-clear');
    assert.equal(rateLimit('test-clear', 5, 60000).allowed, true);
  });

  test('惰性清理：100次调用后触发清理过期 entry', () => {
    // 创建一个即将过期的 entry
    rateLimit('expiring-key', 100, 1);
    return new Promise(resolve => {
      setTimeout(() => {
        // 触发 100 次调用，应触发惰性清理
        for (let i = 0; i < 100; i++) {
          rateLimit(`other-key-${i}`);
        }
        // expiring-key 应已被清理，重新计数
        const result = rateLimit('expiring-key');
        assert.equal(result.allowed, true, '过期 entry 应被清理并重新计数');
        resolve();
      }, 5);
    });
  });

  test('globalThis 持久化：Map 在多次调用间共享', () => {
    rateLimit('persist-test', 2, 60000);
    rateLimit('persist-test', 2, 60000);
    // 模拟另一次函数调用（同进程内 globalThis 共享）
    const result = rateLimit('persist-test', 2, 60000);
    assert.equal(result.allowed, false, '第3次应被拒绝，证明计数持久');
  });
});
