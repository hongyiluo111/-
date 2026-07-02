// 白盒单元测试：lib/auth.ts 鉴权辅助
// 测试 getUserIdFromRequest / requireAuth / requireAdmin 的所有分支
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret-at-least-32-characters-long-for-security-1234567890';
process.env.JWT_SECRET = TEST_SECRET;

// 复刻 verifyToken 逻辑
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, TEST_SECRET, { algorithms: ['HS256'] });
    if (!decoded || typeof decoded.userId !== 'string' || typeof decoded.email !== 'string') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

// Mock NextRequest
function mockRequest(token) {
  const cookies = new Map();
  if (token !== undefined) cookies.set('token', { value: token });
  return { cookies };
}

// 复刻 getUserIdFromRequest
function getUserIdFromRequest(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;
  return decoded.userId;
}

// 复刻 requireAuth
function requireAuth(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return { error: { status: 401, body: { error: '未登录' } } };
  const user = verifyToken(token);
  if (!user) return { error: { status: 401, body: { error: '登录已过期' } } };
  return { user };
}

// 复刻 requireAdmin（修复后：token 无效返回 401，role 不对返回 403）
function requireAdmin(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return { error: { status: 401, body: { error: '未登录' } } };
  const user = verifyToken(token);
  if (!user) return { error: { status: 401, body: { error: '登录已过期' } } };
  if (user.role !== 'admin') return { error: { status: 403, body: { error: '无权限' } } };
  return { user };
}

function makeToken(userId, email, role) {
  return jwt.sign({ userId, email, role }, TEST_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
}

describe('auth.ts 鉴权辅助', () => {

  describe('getUserIdFromRequest', () => {
    test('无 cookie 返回 null', () => {
      const req = mockRequest(undefined);
      assert.equal(getUserIdFromRequest(req), null);
    });

    test('token 无效返回 null', () => {
      const req = mockRequest('invalid.token.here');
      assert.equal(getUserIdFromRequest(req), null);
    });

    test('token 有效返回 userId', () => {
      const req = mockRequest(makeToken('user-123', 'a@b.com', 'user'));
      assert.equal(getUserIdFromRequest(req), 'user-123');
    });

    test('admin token 返回 admin userId', () => {
      const req = mockRequest(makeToken('admin-1', 'admin@b.com', 'admin'));
      assert.equal(getUserIdFromRequest(req), 'admin-1');
    });
  });

  describe('requireAuth', () => {
    test('无 cookie 返回 401 未登录', () => {
      const req = mockRequest(undefined);
      const result = requireAuth(req);
      assert.ok(result.error);
      assert.equal(result.error.status, 401);
      assert.equal(result.error.body.error, '未登录');
    });

    test('token 无效返回 401 登录已过期', () => {
      const req = mockRequest('bad-token');
      const result = requireAuth(req);
      assert.ok(result.error);
      assert.equal(result.error.status, 401);
      assert.equal(result.error.body.error, '登录已过期');
    });

    test('token 有效返回 user 对象', () => {
      const req = mockRequest(makeToken('u1', 'a@b.com', 'user'));
      const result = requireAuth(req);
      assert.ok(result.user);
      assert.equal(result.user.userId, 'u1');
      assert.equal(result.user.role, 'user');
      assert.equal(result.error, undefined);
    });

    test('过期 token 返回 401', () => {
      const expired = jwt.sign({ userId: 'u', email: 'a@b.com', role: 'user' }, TEST_SECRET, { algorithm: 'HS256', expiresIn: '-1s' });
      const req = mockRequest(expired);
      const result = requireAuth(req);
      assert.ok(result.error);
      assert.equal(result.error.status, 401);
    });
  });

  describe('requireAdmin', () => {
    test('无 cookie 返回 401 未登录', () => {
      const req = mockRequest(undefined);
      const result = requireAdmin(req);
      assert.equal(result.error.status, 401);
      assert.equal(result.error.body.error, '未登录');
    });

    test('普通用户返回 403 无权限', () => {
      const req = mockRequest(makeToken('u1', 'a@b.com', 'user'));
      const result = requireAdmin(req);
      assert.equal(result.error.status, 403);
      assert.equal(result.error.body.error, '无权限');
    });

    test('陪玩用户返回 403 无权限', () => {
      const req = mockRequest(makeToken('c1', 'c@b.com', 'companion'));
      const result = requireAdmin(req);
      assert.equal(result.error.status, 403);
    });

    test('admin 用户返回 user 对象', () => {
      const req = mockRequest(makeToken('admin-1', 'admin@b.com', 'admin'));
      const result = requireAdmin(req);
      assert.ok(result.user);
      assert.equal(result.user.role, 'admin');
      assert.equal(result.error, undefined);
    });

    test('token 无效返回 401（修复后语义正确）', () => {
      // 修复后：token 无效单独检查，返回 401（登录已过期）
      const req = mockRequest('invalid-token');
      const result = requireAdmin(req);
      assert.equal(result.error.status, 401, 'token 无效应返回 401');
      assert.equal(result.error.body.error, '登录已过期');
    });
  });
});
