/**
 * 完整白盒测试 - 电竞陪玩平台
 * 覆盖所有 API 路由的代码路径、边界条件和异常路径
 */

const BASE = 'http://localhost:3456';
let passed = 0;
let failed = 0;
const failures = [];
const testCookies = {};

async function api(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const role = options.as || 'user';
  if (testCookies[role]) {
    headers['Cookie'] = testCookies[role];
  }
  const method = options.method || 'GET';
  if (method !== 'GET') {
    headers['Origin'] = BASE;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    redirect: 'manual',
  });
  // Extract cookie via getSetCookie (Node 18+)
  if (options.as) {
    let cookieValue = null;
    const setCookies = res.headers.getSetCookie?.();
    if (setCookies && setCookies.length > 0) {
      for (const c of setCookies) {
        const m = c.match(/token=([^;]+)/);
        if (m) { cookieValue = m[1]; break; }
      }
    }
    if (!cookieValue) {
      const sc = res.headers.get('set-cookie');
      if (sc) {
        const m = sc.match(/token=([^;]+)/);
        if (m) cookieValue = m[1];
      }
    }
    if (cookieValue) {
      testCookies[role] = `token=${cookieValue}`;
    }
  }
  let body = null;
  const text = await res.text();
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body, headers: res.headers };
}

async function runGroup(groupName, tests) {
  console.log(`\n=== ${groupName} ===`);
  for (const t of tests) {
    try {
      await t.fn();
      passed++;
      console.log(`  ✅ ${t.name}`);
    } catch (err) {
      failed++;
      const msg = err.message || String(err);
      failures.push(`[${groupName}] ${t.name}: ${msg}`);
      console.log(`  ❌ ${t.name}: ${msg}`);
    }
  }
}

function t(name, fn) { return { name, fn }; }
function assertStatus(res, expected, msg) {
  if (res.status !== expected) throw new Error(`${msg || 'status'}: expected ${expected}, got ${res.status} | ${JSON.stringify(res.body).slice(0,200)}`);
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function assertEqual(a, b, msg) { if (a !== b) throw new Error(`${msg}: expected ${b}, got ${a}`); }

// ===================== 1. 认证模块 =====================

const AUTH_TESTS = [
  t('POST /api/auth/register - 缺少参数', async () => {
    const r = await api('/api/auth/register', { method: 'POST', body: {} });
    assertStatus(r, 400);
  }),
  t('POST /api/auth/register - 无效邮箱', async () => {
    const r = await api('/api/auth/register', { method: 'POST', body: { name: 'Test', email: 'bad', password: '123456' } });
    assertStatus(r, 400);
  }),
  t('POST /api/auth/register - 密码太短', async () => {
    const r = await api('/api/auth/register', { method: 'POST', body: { name: 'Test', email: 't@t.com', password: '123' } });
    assertStatus(r, 400);
  }),
  t('POST /api/auth/register - 正常注册', async () => {
    const email = `test_${Date.now()}@test.com`;
    const r = await api('/api/auth/register', { method: 'POST', body: { name: '白盒测试', email, password: 'Test123456' }, as: 'newuser' });
    assertStatus(r, 200);
    assert(r.body.success, 'should be success');
    assert(testCookies['newuser'], 'should set cookie');
  }),
  t('POST /api/auth/register - 重复邮箱', async () => {
    const email = `dup_${Date.now()}@test.com`;
    await api('/api/auth/register', { method: 'POST', body: { name: 'A', email, password: 'Test123456' } });
    const r = await api('/api/auth/register', { method: 'POST', body: { name: 'B', email, password: 'Test123456' } });
    assert(r.status >= 400, 'should fail for duplicate');
  }),
  t('POST /api/auth/login - 错误密码', async () => {
    const email = `login_${Date.now()}@test.com`;
    await api('/api/auth/register', { method: 'POST', body: { name: 'L', email, password: 'Test123456' } });
    const r = await api('/api/auth/login', { method: 'POST', body: { email, password: 'wrong123' } });
    assert(r.status >= 400, 'should fail wrong password');
  }),
  t('POST /api/auth/login - 不存在的用户', async () => {
    const r = await api('/api/auth/login', { method: 'POST', body: { email: 'noexist@test.com', password: 'Test123456' } });
    assert(r.status >= 400, 'should fail non-existent');
  }),
  t('POST /api/auth/login - 缺少参数', async () => {
    const r = await api('/api/auth/login', { method: 'POST', body: { email: '' } });
    assertStatus(r, 400);
  }),
  t('POST /api/auth/login - 正常登录', async () => {
    const email = `ok_${Date.now()}@test.com`;
    await api('/api/auth/register', { method: 'POST', body: { name: 'OK', email, password: 'Test123456' } });
    const r = await api('/api/auth/login', { method: 'POST', body: { email, password: 'Test123456' }, as: 'logintest' });
    assertStatus(r, 200);
    assert(testCookies['logintest'], 'should set cookie');
  }),
  t('GET /api/auth/current-user - 未登录', async () => {
    const r = await api('/api/auth/current-user', { as: 'nobody' });
    assert(r.status === 401 || r.body === null || !r.body?.id, 'should be unauthorized');
  }),
  t('GET /api/auth/current-user - 已登录', async () => {
    const r = await api('/api/auth/current-user', { as: 'logintest' });
    assertStatus(r, 200);
    assert(r.body.email, 'should have email');
    assert(r.body.name, 'should have name');
  }),
  t('POST /api/auth/logout', async () => {
    const email = `logout_${Date.now()}@test.com`;
    await api('/api/auth/register', { method: 'POST', body: { name: 'Out', email, password: 'Test123456' }, as: 'logout' });
    const r = await api('/api/auth/logout', { method: 'POST', as: 'logout' });
    assert(r.status === 200 || r.body?.success, 'logout ok');
  }),
  t('POST /api/auth/forgot-password - 缺少邮箱', async () => {
    const r = await api('/api/auth/forgot-password', { method: 'POST', body: {} });
    assertStatus(r, 400);
  }),
  t('POST /api/auth/forgot-password - 正常请求', async () => {
    const r = await api('/api/auth/forgot-password', { method: 'POST', body: { email: 'test@test.com' } });
    assertStatus(r, 200);
  }),
];

// ===================== 2. 用户模块 =====================

const USER_TESTS = [
  t('GET /api/user/diamonds - 未登录', async () => {
    const r = await api('/api/user/diamonds', { as: 'nobody2' });
    assertStatus(r, 200);
    assertEqual(r.body.diamonds, 0);
  }),
  t('GET /api/user/diamonds - 已登录', async () => {
    const r = await api('/api/user/diamonds', { as: 'logintest' });
    assertStatus(r, 200);
    assert(typeof r.body.diamonds === 'number', 'should be number');
  }),
  t('GET /api/user/online - 心跳', async () => {
    const r = await api('/api/user/online', { method: 'POST', as: 'logintest', body: {} });
    assert(r.status === 200 || r.body?.success, `unexpected: ${r.status}`);
  }),
  t('PATCH /api/profile/update - 未登录', async () => {
    const r = await api('/api/profile/update', { method: 'PATCH', body: { name: 'Hacker' }, as: 'anon_profile' });
    assertStatus(r, 401);
  }),
  t('PATCH /api/profile/update - 空昵称', async () => {
    const r = await api('/api/profile/update', { method: 'PATCH', body: { name: '' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('PATCH /api/profile/update - 正常更新', async () => {
    const r = await api('/api/profile/update', { method: 'PATCH', body: { name: '更新后' }, as: 'logintest' });
    assertStatus(r, 200);
  }),
  t('POST /api/profile/password - 缺少参数', async () => {
    const r = await api('/api/profile/password', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/profile/password - 旧密码错误', async () => {
    const r = await api('/api/profile/password', { method: 'POST', body: { currentPassword: 'wrong', newPassword: 'NewTest123456' }, as: 'logintest' });
    assert(r.status >= 400, 'wrong old password');
  }),
  t('POST /api/profile/password - 新密码太短', async () => {
    const r = await api('/api/profile/password', { method: 'POST', body: { currentPassword: 'Test123456', newPassword: '123' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/profile/password - 正常改密', async () => {
    const r = await api('/api/profile/password', { method: 'POST', body: { currentPassword: 'Test123456', newPassword: 'NewTest123456' }, as: 'logintest' });
    assertStatus(r, 200);
  }),
];

// ===================== 3. 陪玩模块 =====================

const COMPANION_TESTS = [
  t('GET /api/companions - 列表查询', async () => {
    const r = await api('/api/companions?game=王者荣耀&limit=5');
    assertStatus(r, 200);
    assert(Array.isArray(r.body.companions), 'should be array');
  }),
  t('GET /api/companions - 带搜索', async () => {
    const r = await api('/api/companions?search=test&page=1&limit=10');
    assertStatus(r, 200);
  }),
  t('GET /api/companions - 价格过滤', async () => {
    const r = await api('/api/companions?minPrice=10&maxPrice=100');
    assertStatus(r, 200);
  }),
  t('GET /api/companions/count', async () => {
    const r = await api('/api/companions/count');
    assertStatus(r, 200);
    assert(r.body.counts !== undefined || typeof r.body.count === 'number', 'should have count/counts');
  }),
  t('GET /api/companions/club', async () => {
    const r = await api('/api/companions/club');
    assertStatus(r, 200);
  }),
  t('POST /api/companions/apply - 未登录', async () => {
    const r = await api('/api/companions/apply', { method: 'POST', body: { name: 'X', game: 'LOL', rank: '钻石', price: 50, description: 'test' }, as: 'anon_apply' });
    assertStatus(r, 401);
  }),
  t('POST /api/companions/apply - 缺少参数', async () => {
    const r = await api('/api/companions/apply', { method: 'POST', body: { name: '' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/companions/apply - 价格无效', async () => {
    const r = await api('/api/companions/apply', { method: 'POST', body: { name: 'Test', game: 'LOL', rank: '钻石', price: -1, description: 'test' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
];

// ===================== 4. 订单模块 =====================

const ORDER_TESTS = [
  t('GET /api/orders - 未登录', async () => {
    const r = await api('/api/orders', { as: 'anon_orders' });
    assertStatus(r, 401);
  }),
  t('GET /api/orders - 已登录', async () => {
    const r = await api('/api/orders', { as: 'logintest' });
    assertStatus(r, 200);
    assert(Array.isArray(r.body.orders), 'should be array');
  }),
  t('POST /api/orders/create - 未登录', async () => {
    const r = await api('/api/orders/create', { method: 'POST', body: { companionId: '1', companionName: 'X', game: 'LOL', price: 50, duration: 1 } });
    assertStatus(r, 401);
  }),
  t('POST /api/orders/create - 缺少参数', async () => {
    const r = await api('/api/orders/create', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/orders/create - 价格无效', async () => {
    const r = await api('/api/orders/create', { method: 'POST', body: { companionId: '1', companionName: 'X', game: 'LOL', price: 0, duration: 1 }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/orders/create - 时长无效', async () => {
    const r = await api('/api/orders/create', { method: 'POST', body: { companionId: '1', companionName: 'X', game: 'LOL', price: 50, duration: 0 }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/orders/create - 时长超限', async () => {
    const r = await api('/api/orders/create', { method: 'POST', body: { companionId: '1', companionName: 'X', game: 'LOL', price: 50, duration: 11 }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/orders/create - 陪玩不存在', async () => {
    const r = await api('/api/orders/create', { method: 'POST', body: { companionId: 'nonexistent', companionName: 'X', game: 'LOL', price: 50, duration: 1 }, as: 'logintest' });
    assert(r.status >= 400, 'companion not found');
  }),
  t('POST /api/orders/cancel - 缺少订单ID', async () => {
    const r = await api('/api/orders/cancel', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/orders/cancel - 不存在的订单', async () => {
    const r = await api('/api/orders/cancel', { method: 'POST', body: { orderId: 'nonexistent' }, as: 'logintest' });
    assertStatus(r, 404);
  }),
  t('POST /api/orders/pay - 缺少订单ID', async () => {
    const r = await api('/api/orders/pay', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/orders/pay - 不存在的订单', async () => {
    const r = await api('/api/orders/pay', { method: 'POST', body: { orderId: 'nonexistent' }, as: 'logintest' });
    assertStatus(r, 404);
  }),
];

// ===================== 5. 支付模块 =====================

const PAYMENT_TESTS = [
  t('POST /api/payment/create - 未登录', async () => {
    const r = await api('/api/payment/create', { method: 'POST', body: { amount: 50, method: 'alipay' } });
    assertStatus(r, 401);
  }),
  t('POST /api/payment/create - 缺少参数', async () => {
    const r = await api('/api/payment/create', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/payment/create - 金额过小', async () => {
    const r = await api('/api/payment/create', { method: 'POST', body: { amount: 0, method: 'alipay' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/payment/create - 金额过大', async () => {
    const r = await api('/api/payment/create', { method: 'POST', body: { amount: 99999, method: 'alipay' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/payment/create - 无效支付方式', async () => {
    const r = await api('/api/payment/create', { method: 'POST', body: { amount: 50, method: 'bitcoin' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/payment/create - 金额非数字', async () => {
    const r = await api('/api/payment/create', { method: 'POST', body: { amount: 'abc', method: 'alipay' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/payment/create - 正常创建支付宝', async () => {
    const r = await api('/api/payment/create', { method: 'POST', body: { amount: 10, method: 'alipay' }, as: 'logintest' });
    assertStatus(r, 200);
    assert(r.body.paymentUrl, 'should have paymentUrl');
    assert(r.body.paymentId, 'should have paymentId');
  }),
  t('POST /api/payment/create - 正常创建微信', async () => {
    const r = await api('/api/payment/create', { method: 'POST', body: { amount: 50, method: 'wechat' }, as: 'logintest' });
    assertStatus(r, 200);
    assert(r.body.paymentUrl, 'should have paymentUrl');
  }),
];

// ===================== 6. 俱乐部模块 =====================

const CLUB_TESTS = [
  t('GET /api/clubs - 列表查询', async () => {
    const r = await api('/api/clubs');
    assertStatus(r, 200);
    assert(Array.isArray(r.body.clubs), 'should be array');
  }),
  t('GET /api/clubs - 带搜索', async () => {
    const r = await api('/api/clubs?search=test');
    assertStatus(r, 200);
  }),
  t('POST /api/clubs/[id]/join - 未登录', async () => {
    const r = await api('/api/clubs/test/join', { method: 'POST', body: {} });
    assertStatus(r, 401);
  }),
  t('POST /api/clubs/[id]/leave - 未登录', async () => {
    const r = await api('/api/clubs/test/leave', { method: 'POST', body: {} });
    assertStatus(r, 401);
  }),
];

// ===================== 7. 动态模块 =====================

const FEED_TESTS = [
  t('GET /api/feed - 列表查询', async () => {
    const r = await api('/api/feed?page=1&limit=10');
    assertStatus(r, 200);
    assert(Array.isArray(r.body.posts), 'should be array');
  }),
  t('POST /api/feed/create - 未登录', async () => {
    const r = await api('/api/feed/create', { method: 'POST', body: { content: 'test' } });
    assertStatus(r, 401);
  }),
  t('POST /api/feed/create - 空内容', async () => {
    const r = await api('/api/feed/create', { method: 'POST', body: { content: '' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/feed/create - 内容过长', async () => {
    const r = await api('/api/feed/create', { method: 'POST', body: { content: 'x'.repeat(2001) }, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/feed/create - 正常发布', async () => {
    const r = await api('/api/feed/create', { method: 'POST', body: { content: '白盒测试动态', game: '王者荣耀' }, as: 'logintest' });
    assertStatus(r, 201);
    assert(r.body.post?.content === '白盒测试动态', 'content match');
  }),
  t('POST /api/feed/[id]/like - 不存在的帖子', async () => {
    const r = await api('/api/feed/nonexistent/like', { method: 'POST', body: {}, as: 'logintest' });
    assert(r.status >= 400, 'should fail');
  }),
];

// ===================== 8. 好友模块 =====================

const FRIEND_TESTS = [
  t('GET /api/friends - 未登录', async () => {
    const r = await api('/api/friends', { as: 'anon_friends' });
    assertStatus(r, 401);
  }),
  t('GET /api/friends - 已登录', async () => {
    const r = await api('/api/friends', { as: 'logintest' });
    assertStatus(r, 200);
  }),
  t('GET /api/friends/search - 空查询', async () => {
    const r = await api('/api/friends/search?q=', { as: 'logintest' });
    assert(r.status === 200 || r.status === 400, `unexpected: ${r.status}`);
  }),
  t('POST /api/friends/accept - 未登录', async () => {
    const r = await api('/api/friends/accept', { method: 'POST', body: { requestId: '1' } });
    assertStatus(r, 401);
  }),
];

// ===================== 9. 排行榜与统计 =====================

const RANKING_TESTS = [
  t('GET /api/rankings/companions', async () => {
    const r = await api('/api/rankings/companions');
    assertStatus(r, 200);
  }),
  t('GET /api/rankings/clubs', async () => {
    const r = await api('/api/rankings/clubs');
    assertStatus(r, 200);
  }),
  t('GET /api/stats/public', async () => {
    const r = await api('/api/stats/public');
    assertStatus(r, 200);
  }),
];

// ===================== 10. 聊天模块 =====================

const CHAT_TESTS = [
  t('GET /api/chat/conversations - 未登录', async () => {
    const r = await api('/api/chat/conversations', { as: 'anon_chat' });
    assertStatus(r, 401);
  }),
  t('GET /api/chat/conversations - 已登录', async () => {
    const r = await api('/api/chat/conversations', { as: 'logintest' });
    assertStatus(r, 200);
  }),
  t('GET /api/chat/unread - 未登录', async () => {
    const r = await api('/api/chat/unread', { as: 'anon_unread' });
    assert(r.status === 200 || r.status === 401, `unexpected: ${r.status}`);
  }),
  t('GET /api/chat/unread - 已登录', async () => {
    const r = await api('/api/chat/unread', { as: 'logintest' });
    assertStatus(r, 200);
  }),
  t('GET /api/chat/messages - 未登录', async () => {
    const r = await api('/api/chat/messages?friendId=test');
    assertStatus(r, 401);
  }),
  t('POST /api/chat/revoke - 未登录', async () => {
    const r = await api('/api/chat/revoke', { method: 'POST', body: { messageId: 'x' } });
    assertStatus(r, 401);
  }),
];

// ===================== 11. AI 聊天模块 =====================

const AI_TESTS = [
  t('POST /api/ai/chat - 未登录', async () => {
    const r = await api('/api/ai/chat', { method: 'POST', body: { messages: [{ role: 'user', content: 'hi' }] } });
    assertStatus(r, 401);
  }),
  t('POST /api/ai/chat - 缺少 messages', async () => {
    const r = await api('/api/ai/chat', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/ai/chat - messages 非数组', async () => {
    const r = await api('/api/ai/chat', { method: 'POST', body: { messages: 'hi' }, as: 'logintest' });
    assertStatus(r, 400);
  }),
];

// ===================== 12. 举报/拉黑/评价 =====================

const MISC_TESTS = [
  t('POST /api/report - 未登录', async () => {
    const r = await api('/api/report', { method: 'POST', body: { targetId: '1', targetType: 'user', reason: 'spam' } });
    assertStatus(r, 401);
  }),
  t('POST /api/report - 缺少参数', async () => {
    const r = await api('/api/report', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/block - 未登录', async () => {
    const r = await api('/api/block', { method: 'POST', body: { targetId: '1' } });
    assertStatus(r, 401);
  }),
  t('POST /api/block - 缺少参数', async () => {
    const r = await api('/api/block', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/reviews/create - 未登录', async () => {
    const r = await api('/api/reviews/create', { method: 'POST', body: { orderId: '1', rating: 5, content: 'good' } });
    assertStatus(r, 401);
  }),
  t('POST /api/reviews/create - 缺少参数', async () => {
    const r = await api('/api/reviews/create', { method: 'POST', body: {}, as: 'logintest' });
    assertStatus(r, 400);
  }),
  t('POST /api/reviews/create - 评分超范围', async () => {
    const r = await api('/api/reviews/create', { method: 'POST', body: { orderId: '1', rating: 10, content: 'x' }, as: 'logintest' });
    assert(r.status >= 400, 'invalid rating');
  }),
  t('GET /api/users/[id] - 不存在的用户', async () => {
    const r = await api('/api/users/nonexistent');
    assertStatus(r, 404);
  }),
];

// ===================== 13. 管理员模块 =====================

const ADMIN_TESTS = [
  t('GET /api/admin/companions - 非管理员', async () => {
    const r = await api('/api/admin/companions', { as: 'logintest' });
    assert(r.status === 403 || r.status === 401, 'forbidden');
  }),
  t('GET /api/admin/orders - 非管理员', async () => {
    const r = await api('/api/admin/orders', { as: 'logintest' });
    assert(r.status === 403 || r.status === 401, 'forbidden');
  }),
  t('GET /api/admin/users - 非管理员', async () => {
    const r = await api('/api/admin/users', { as: 'logintest' });
    assert(r.status === 403 || r.status === 401, 'forbidden');
  }),
  t('GET /api/admin/stats - 非管理员', async () => {
    const r = await api('/api/admin/stats', { as: 'logintest' });
    assert(r.status === 403 || r.status === 401, 'forbidden');
  }),
];

// ===================== 14. 陪玩专属模块 =====================

const COMPANION_DASH_TESTS = [
  t('GET /api/companion/dashboard - 非陪玩', async () => {
    const r = await api('/api/companion/dashboard', { as: 'logintest' });
    assert(r.status >= 400, 'forbidden/not companion');
  }),
  t('GET /api/companion/earnings - 非陪玩', async () => {
    const r = await api('/api/companion/earnings', { as: 'logintest' });
    assert(r.status >= 400, 'forbidden');
  }),
  t('GET /api/companion/orders - 非陪玩', async () => {
    const r = await api('/api/companion/orders', { as: 'logintest' });
    assert(r.status >= 400, 'forbidden');
  }),
  t('GET /api/companion/profile - 非陪玩', async () => {
    const r = await api('/api/companion/profile', { as: 'logintest' });
    assert(r.status >= 400, 'forbidden');
  }),
  t('GET /api/companion/reviews - 非陪玩', async () => {
    const r = await api('/api/companion/reviews', { as: 'logintest' });
    assert(r.status >= 400, 'forbidden');
  }),
  t('POST /api/companion/orders/[id]/accept - 未登录', async () => {
    const r = await api('/api/companion/orders/test/accept', { method: 'POST', body: {} });
    assertStatus(r, 401);
  }),
  t('POST /api/companion/orders/[id]/reject - 未登录', async () => {
    const r = await api('/api/companion/orders/test/reject', { method: 'POST', body: {} });
    assertStatus(r, 401);
  }),
  t('POST /api/companion/orders/[id]/start - 未登录', async () => {
    const r = await api('/api/companion/orders/test/start', { method: 'POST', body: {} });
    assertStatus(r, 401);
  }),
  t('POST /api/companion/orders/[id]/complete - 未登录', async () => {
    const r = await api('/api/companion/orders/test/complete', { method: 'POST', body: {} });
    assertStatus(r, 401);
  }),
];

// ===================== 15. 安全与边界测试 =====================

const SECURITY_TESTS = [
  t('SQL 注入 - 登录', async () => {
    const r = await api('/api/auth/login', { method: 'POST', body: { email: "'; DROP TABLE users; --", password: 'x' } });
    assert(r.status >= 400, 'should reject injection');
  }),
  t('SQL 注入 - 搜索', async () => {
    const r = await api("/api/companions?search=%27%20OR%201%3D1%20--");
    assertStatus(r, 200);
  }),
  t('XSS - 注册', async () => {
    const r = await api('/api/auth/register', { method: 'POST', body: { name: '<script>alert(1)</script>', email: `xss_${Date.now()}@test.com`, password: 'Test123456' } });
    if (r.status === 200) {
      assert(!r.body.user?.name?.includes('<script>'), 'should sanitize XSS');
    }
  }),
  t('XSS - 发布动态', async () => {
    const r = await api('/api/feed/create', { method: 'POST', body: { content: '<img onerror="alert(1)" src=x>' }, as: 'logintest' });
    if (r.status === 201) {
    if (r.status === 201) { assert(r.body.post?.content?.includes("&lt;") || !r.body.post?.content?.includes("<img"), "should sanitize XSS"); }
    }
  }),
  t('超长输入 - 注册名称', async () => {
    const r = await api('/api/auth/register', { method: 'POST', body: { name: 'A'.repeat(1000), email: `long_${Date.now()}@test.com`, password: 'Test123456' } });
    assert(r.status >= 400 || (r.body.user?.name?.length <= 255), 'should handle long name');
  }),
  t('空 body - POST', async () => {
    const r = await api('/api/feed/create', { method: 'POST', body: null, as: 'logintest' });
    assert(r.status >= 400, 'should reject null body');
  }),
  t('并发注册同一邮箱', async () => {
    const email = `concurrent_${Date.now()}@test.com`;
    const results = await Promise.all([
      api('/api/auth/register', { method: 'POST', body: { name: 'C1', email, password: 'Test123456' } }),
      api('/api/auth/register', { method: 'POST', body: { name: 'C2', email, password: 'Test123456' } }),
    ]);
    const successes = results.filter(r => r.status === 200);
    assert(successes.length <= 1, 'only one concurrent registration should succeed');
  }),
  t('JWT 伪造 token', async () => {
    const r = await api('/api/orders', { headers: { 'Cookie': 'token=forged.jwt.token' } });
    assertStatus(r, 401);
  }),
  t('GET 不存在的 API 路由', async () => {
    const r = await api('/api/nonexistent/route');
    assert(r.status === 404 || r.status === 405, `unexpected: ${r.status}`);
  }),
  t('CSRF 验证 - 无 Origin 的 POST', async () => {
    const res = await fetch(`${BASE}/api/feed/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'csrf test' }),
    });
    const body = await res.json();
    assertEqual(res.status, 403, 'should reject without origin');
  }),
];

// ===================== 主流程 =====================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   电竞陪玩平台 - 完整白盒测试                ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`Target: ${BASE}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  console.log('[Setup] 注册主测试用户...');
  const setupEmail = `maintest_${Date.now()}@test.com`;
  const setupRes = await api('/api/auth/register', {
    method: 'POST',
    body: { name: '主测试用户', email: setupEmail, password: 'Test123456' },
    as: 'logintest',
  });
  if (setupRes.status !== 200) {
    console.error('FATAL: Cannot register test user:', JSON.stringify(setupRes.body));
    process.exit(1);
  }
  console.log(`  用户已注册: ${setupEmail}`);
  console.log(`  Cookie: ${testCookies['logintest'] ? 'YES' : 'NO'}`);

  await runGroup('1. 认证模块', AUTH_TESTS);
  await runGroup('2. 用户模块', USER_TESTS);
  await runGroup('3. 陪玩模块', COMPANION_TESTS);
  await runGroup('4. 订单模块', ORDER_TESTS);
  await runGroup('5. 支付模块', PAYMENT_TESTS);
  await runGroup('6. 俱乐部模块', CLUB_TESTS);
  await runGroup('7. 动态模块', FEED_TESTS);
  await runGroup('8. 好友模块', FRIEND_TESTS);
  await runGroup('9. 排行榜与统计', RANKING_TESTS);
  await runGroup('10. 聊天模块', CHAT_TESTS);
  await runGroup('11. AI 聊天模块', AI_TESTS);
  await runGroup('12. 举报/拉黑/评价', MISC_TESTS);
  await runGroup('13. 管理员模块', ADMIN_TESTS);
  await runGroup('14. 陪玩专属模块', COMPANION_DASH_TESTS);
  await runGroup('15. 安全与边界测试', SECURITY_TESTS);

  console.log('\n' + '='.repeat(50));
  console.log(`总计: ${passed + failed} | ✅ 通过: ${passed} | ❌ 失败: ${failed}`);
  console.log('='.repeat(50));
  if (failures.length > 0) {
    console.log('\n失败详情:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  }
  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
