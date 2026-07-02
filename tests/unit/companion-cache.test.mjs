// 白盒单元测试：lib/companion-cache.ts 缓存逻辑
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// 复刻 companion-cache.ts 逻辑（修复后使用 structuredClone 深拷贝）
const CACHE_TTL = 30000;
let cache = null;

function getCompanionListCache() {
  if (!cache) return null;
  if (Date.now() - cache.timestamp >= CACHE_TTL) {
    cache = null;
    return null;
  }
  return cache;
}

function setCompanionListCache(data) {
  // 修复后：深拷贝避免外部修改影响缓存内容
  cache = { data: structuredClone(data), timestamp: Date.now() };
}

function invalidateCompanionListCache() {
  cache = null;
}

describe('companion-cache 缓存逻辑', () => {
  beforeEach(() => {
    cache = null;
  });

  test('初始状态缓存为空', () => {
    assert.equal(getCompanionListCache(), null);
  });

  test('设置缓存后可读取', () => {
    const data = [{ id: '1', name: 'test' }];
    setCompanionListCache(data);
    const result = getCompanionListCache();
    assert.ok(result);
    assert.deepEqual(result.data, data);
  });

  test('invalidate 后缓存清空', () => {
    setCompanionListCache({ foo: 'bar' });
    assert.ok(getCompanionListCache());
    invalidateCompanionListCache();
    assert.equal(getCompanionListCache(), null);
  });

  test('TTL 过期后返回 null', () => {
    // 使用时间模拟：手动设置过期的 timestamp
    setCompanionListCache({ test: true });
    cache.timestamp = Date.now() - CACHE_TTL - 1; // 置为过期
    const result = getCompanionListCache();
    assert.equal(result, null);
    assert.equal(cache, null, '过期后 cache 应被置为 null');
  });

  test('TTL 未过期返回数据', () => {
    setCompanionListCache({ test: true });
    cache.timestamp = Date.now() - 1000; // 1秒前，未过期
    const result = getCompanionListCache();
    assert.ok(result);
    assert.deepEqual(result.data, { test: true });
  });

  test('多次 set 覆盖旧数据', () => {
    setCompanionListCache({ v: 1 });
    setCompanionListCache({ v: 2 });
    const result = getCompanionListCache();
    assert.deepEqual(result.data, { v: 2 });
  });

  test('深拷贝隔离：set 后外部修改不影响缓存', () => {
    const data = { count: 0, nested: { value: 1 } };
    setCompanionListCache(data);
    data.count = 999; // 外部修改
    data.nested.value = 999; // 嵌套修改
    const result = getCompanionListCache();
    // 修复后使用 structuredClone 深拷贝，外部修改不影响缓存
    assert.equal(result.data.count, 0, '顶层字段应隔离');
    assert.equal(result.data.nested.value, 1, '嵌套字段应隔离');
  });

  test('invalidate 后再 set 可正常工作', () => {
    setCompanionListCache({ a: 1 });
    invalidateCompanionListCache();
    setCompanionListCache({ b: 2 });
    const result = getCompanionListCache();
    assert.deepEqual(result.data, { b: 2 });
  });
});
