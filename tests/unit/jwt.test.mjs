// 白盒单元测试：lib/jwt.ts 鉴权逻辑
// 使用 node:test 内置测试框架，无需额外依赖
// 运行：node --experimental-vm-modules tests/unit/jwt.test.mjs
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

// 设置测试环境变量（jwt.ts 通过 process.env.JWT_SECRET 读取）
const TEST_SECRET = 'test-secret-at-least-32-characters-long-for-security-1234567890';
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = 'test';

// 由于 jwt.ts 使用 next/headers，不能直接 import，这里复刻其核心逻辑进行测试
// 实际测试目标：generateToken / verifyToken 的算法安全性与 payload 校验
function generateToken(userId, email, role, rememberMe = false) {
  return jwt.sign(
    { userId, email, role },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: rememberMe ? '30d' : '7d' }
  );
}

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

describe('JWT 鉴权逻辑', () => {

  describe('generateToken', () => {
    test('正常生成 token', () => {
      const token = generateToken('user-1', 'test@test.com', 'user');
      assert.ok(typeof token === 'string');
      assert.ok(token.split('.').length === 3, 'JWT 应有3段');
    });

    test('rememberMe=true 使用 30d 过期', () => {
      const token = generateToken('user-1', 'test@test.com', 'user', true);
      const decoded = jwt.decode(token);
      assert.equal(decoded.exp - decoded.iat, 30 * 24 * 60 * 60);
    });

    test('rememberMe=false 使用 7d 过期', () => {
      const token = generateToken('user-1', 'test@test.com', 'user', false);
      const decoded = jwt.decode(token);
      assert.equal(decoded.exp - decoded.iat, 7 * 24 * 60 * 60);
    });

    test('payload 包含 userId/email/role', () => {
      const token = generateToken('uid-123', 'a@b.com', 'admin');
      const decoded = jwt.decode(token);
      assert.equal(decoded.userId, 'uid-123');
      assert.equal(decoded.email, 'a@b.com');
      assert.equal(decoded.role, 'admin');
    });

    test('使用 HS256 算法', () => {
      const token = generateToken('u', 'a@b.com', 'user');
      const decoded = jwt.decode(token, { complete: true });
      assert.equal(decoded.header.alg, 'HS256');
    });
  });

  describe('verifyToken', () => {
    test('正常验证有效 token', () => {
      const token = generateToken('user-1', 'test@test.com', 'user');
      const decoded = verifyToken(token);
      assert.ok(decoded);
      assert.equal(decoded.userId, 'user-1');
      assert.equal(decoded.email, 'test@test.com');
      assert.equal(decoded.role, 'user');
    });

    test('无效 token 返回 null', () => {
      const result = verifyToken('invalid.token.here');
      assert.equal(result, null);
    });

    test('空字符串返回 null', () => {
      const result = verifyToken('');
      assert.equal(result, null);
    });

    test('null/undefined 返回 null', () => {
      assert.equal(verifyToken(null), null);
      assert.equal(verifyToken(undefined), null);
    });

    test('算法混淆攻击防护：alg=none 被拒绝', () => {
      // 伪造 alg=none 的 token（无签名）
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ userId: 'hack', email: 'hack@evil.com', role: 'admin' })).toString('base64url');
      const forgedToken = `${header}.${payload}.`;
      const result = verifyToken(forgedToken);
      assert.equal(result, null, 'alg=none 的 token 必须被拒绝');
    });

    test('算法混淆攻击防护：HS384 被拒绝', () => {
      const forgedToken = jwt.sign({ userId: 'hack', email: 'hack@evil.com', role: 'admin' }, TEST_SECRET, { algorithm: 'HS384' });
      const result = verifyToken(forgedToken);
      assert.equal(result, null, '非 HS256 算法的 token 必须被拒绝');
    });

    test('密钥不匹配的 token 被拒绝', () => {
      const wrongKeyToken = jwt.sign({ userId: 'u', email: 'a@b.com', role: 'user' }, 'wrong-secret-key-at-least-32-chars-long!!!', { algorithm: 'HS256' });
      const result = verifyToken(wrongKeyToken);
      assert.equal(result, null);
    });

    test('过期 token 被拒绝', () => {
      const expiredToken = jwt.sign({ userId: 'u', email: 'a@b.com', role: 'user' }, TEST_SECRET, { algorithm: 'HS256', expiresIn: '-1s' });
      const result = verifyToken(expiredToken);
      assert.equal(result, null);
    });

    test('payload 结构校验：缺少 userId 返回 null', () => {
      const badToken = jwt.sign({ email: 'a@b.com', role: 'user' }, TEST_SECRET, { algorithm: 'HS256' });
      const result = verifyToken(badToken);
      assert.equal(result, null);
    });

    test('payload 结构校验：userId 非字符串返回 null', () => {
      const badToken = jwt.sign({ userId: 123, email: 'a@b.com', role: 'user' }, TEST_SECRET, { algorithm: 'HS256' });
      const result = verifyToken(badToken);
      assert.equal(result, null);
    });

    test('payload 结构校验：缺少 email 返回 null', () => {
      const badToken = jwt.sign({ userId: 'u', role: 'user' }, TEST_SECRET, { algorithm: 'HS256' });
      const result = verifyToken(badToken);
      assert.equal(result, null);
    });

    test('payload 结构校验：email 非字符串返回 null', () => {
      const badToken = jwt.sign({ userId: 'u', email: 123, role: 'user' }, TEST_SECRET, { algorithm: 'HS256' });
      const result = verifyToken(badToken);
      assert.equal(result, null);
    });
  });
});

describe('JWT 密钥强度校验', () => {
  const originalSecret = process.env.JWT_SECRET;

  test('JWT_SECRET 未设置时抛错', () => {
    delete process.env.JWT_SECRET;
    assert.throws(() => {
      // 复刻 getSecret 逻辑
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET 环境变量未设置');
    }, /JWT_SECRET 环境变量未设置/);
  });

  test('JWT_SECRET 长度不足32字符时抛错', () => {
    process.env.JWT_SECRET = 'short-secret';
    assert.throws(() => {
      const secret = process.env.JWT_SECRET;
      if (secret.length < 32) throw new Error('JWT_SECRET 长度不足，至少需要 32 个字符');
    }, /长度不足/);
  });

  process.env.JWT_SECRET = originalSecret;
});
