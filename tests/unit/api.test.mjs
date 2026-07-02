// 白盒单元测试：lib/api.ts 客户端请求辅助
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// 复刻 api.ts 的 ApiError 和 api 函数逻辑
class ApiError extends Error {
  constructor(status, data) {
    super(data.error || `请求失败 (${status})`);
    this.status = status;
    this.data = data;
  }
}

// 复刻核心解析逻辑（不实际发 fetch，只测响应解析）
async function parseResponse(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
  if (res.status === 204) return undefined;
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return undefined;
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

// Mock Response 构造器
function mockResponse({ status = 200, ok, body = {}, contentType = 'application/json', bodyText = null }) {
  const isOk = ok !== undefined ? ok : (status >= 200 && status < 300);
  const text = bodyText !== null ? bodyText : JSON.stringify(body);
  return {
    ok: isOk,
    status,
    headers: new Map([['content-type', contentType]]),
    json: async () => body,
    text: async () => text,
  };
}

describe('api.ts 客户端请求辅助', () => {

  describe('ApiError', () => {
    test('正确继承 Error', () => {
      const err = new ApiError(400, { error: '参数错误' });
      assert.ok(err instanceof Error);
      assert.equal(err.message, '参数错误');
      assert.equal(err.status, 400);
      assert.deepEqual(err.data, { error: '参数错误' });
    });

    test('无 error 字段时使用默认消息', () => {
      const err = new ApiError(500, {});
      assert.equal(err.message, '请求失败 (500)');
    });

    test('status 为 0 时也能正常构造', () => {
      const err = new ApiError(0, { error: '网络错误' });
      assert.equal(err.status, 0);
      assert.equal(err.message, '网络错误');
    });
  });

  describe('parseResponse 响应解析', () => {
    test('200 + JSON 正常解析', async () => {
      const res = mockResponse({ status: 200, body: { success: true, data: [1, 2, 3] } });
      const result = await parseResponse(res);
      assert.deepEqual(result, { success: true, data: [1, 2, 3] });
    });

    test('204 No Content 返回 undefined', async () => {
      const res = mockResponse({ status: 204, body: {}, bodyText: '' });
      const result = await parseResponse(res);
      assert.equal(result, undefined);
    });

    test('非 JSON content-type 返回 undefined', async () => {
      const res = mockResponse({ status: 200, contentType: 'text/html', bodyText: '<html></html>' });
      const result = await parseResponse(res);
      assert.equal(result, undefined);
    });

    test('空 content-type 返回 undefined', async () => {
      const res = mockResponse({ status: 200, contentType: '', bodyText: '' });
      const result = await parseResponse(res);
      assert.equal(result, undefined);
    });

    test('JSON 但空文本返回 undefined', async () => {
      const res = mockResponse({ status: 200, body: {}, bodyText: '' });
      const result = await parseResponse(res);
      assert.equal(result, undefined);
    });

    test('400 抛出 ApiError', async () => {
      const res = mockResponse({ status: 400, ok: false, body: { error: '参数缺失' } });
      await assert.rejects(
        async () => await parseResponse(res),
        (err) => err instanceof ApiError && err.status === 400 && err.message === '参数缺失'
      );
    });

    test('401 抛出 ApiError', async () => {
      const res = mockResponse({ status: 401, ok: false, body: { error: '未登录' } });
      await assert.rejects(
        async () => await parseResponse(res),
        (err) => err instanceof ApiError && err.status === 401
      );
    });

    test('500 + 非 JSON body 不崩溃', async () => {
      // 模拟服务器返回 HTML 错误页
      const res = mockResponse({ status: 500, ok: false, contentType: 'text/html', bodyText: '<h1>Server Error</h1>' });
      // json() 解析失败时 catch 返回 {}，所以 error 字段为 undefined
      // 但这里 body 是 HTML，mock 的 json() 返回的是构造时的 body 对象 {}
      await assert.rejects(
        async () => await parseResponse(res),
        (err) => err instanceof ApiError && err.status === 500
      );
    });

    test('500 + 无效 JSON body 容错', async () => {
      // 模拟 res.json() 抛错的情况
      const res = {
        ok: false,
        status: 500,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => { throw new SyntaxError('Unexpected token'); },
        text: async () => 'Internal Error',
      };
      await assert.rejects(
        async () => await parseResponse(res),
        (err) => {
          return err instanceof ApiError &&
                 err.status === 500 &&
                 err.message === '请求失败 (500)'; // data 为 {}，error 为 undefined
        }
      );
    });
  });
});
