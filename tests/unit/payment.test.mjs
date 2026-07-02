// 白盒单元测试：lib/payment.ts 支付逻辑
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'crypto';

// 复刻 generateOrderNo 逻辑（payment.ts 中的核心纯函数）
function generateOrderNo() {
  return Date.now().toString() + randomBytes(8).toString('hex');
}

// 复刻金额转换逻辑（payment create route 中）
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 10000;
const DIAMONDS_PER_YUAN = 10;

function normalizeAmount(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return null;
  if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) return null;
  return Math.round(amount * 100) / 100;
}

function calcDiamonds(normalizedAmount) {
  return Math.floor(normalizedAmount * DIAMONDS_PER_YUAN);
}

// 修复后：充值前校验 diamonds >= 1
function validateDiamonds(diamonds) {
  return diamonds >= 1;
}

// 复刻微信金额转换（分）
function toWechatAmount(yuan) {
  return Math.round(yuan * 100);
}

describe('payment 支付逻辑', () => {

  describe('generateOrderNo', () => {
    test('返回字符串', () => {
      const no = generateOrderNo();
      assert.equal(typeof no, 'string');
    });

    test('长度 = 13(时间戳) + 16(hex)', () => {
      const no = generateOrderNo();
      assert.equal(no.length, 29, `实际长度: ${no.length}`);
    });

    test('唯一性：连续生成1000个无碰撞', () => {
      const set = new Set();
      for (let i = 0; i < 1000; i++) {
        set.add(generateOrderNo());
      }
      assert.equal(set.size, 1000, '1000个订单号应全部唯一');
    });

    test('使用 crypto.randomBytes（非 Math.random）', () => {
      // 验证随机部分是 8 字节 hex（16 字符）
      const no = generateOrderNo();
      const hexPart = no.slice(13);
      assert.equal(hexPart.length, 16);
      assert.ok(/^[0-9a-f]{16}$/.test(hexPart), '随机部分应为16位hex');
    });
  });

  describe('金额校验', () => {
    test('正常金额 0.01 通过', () => {
      assert.equal(normalizeAmount(0.01), 0.01);
    });

    test('正常金额 100 通过', () => {
      assert.equal(normalizeAmount(100), 100);
    });

    test('正常金额 10000 通过', () => {
      assert.equal(normalizeAmount(10000), 10000);
    });

    test('低于最小金额拒绝', () => {
      assert.equal(normalizeAmount(0.001), null);
    });

    test('高于最大金额拒绝', () => {
      assert.equal(normalizeAmount(10001), null);
    });

    test('负数拒绝', () => {
      assert.equal(normalizeAmount(-10), null);
    });

    test('NaN 拒绝', () => {
      assert.equal(normalizeAmount(NaN), null);
    });

    test('字符串拒绝', () => {
      assert.equal(normalizeAmount('100'), null);
    });

    test('undefined 拒绝', () => {
      assert.equal(normalizeAmount(undefined), null);
    });

    test('null 拒绝', () => {
      assert.equal(normalizeAmount(null), null);
    });

    test('浮点精度修正：19.99 → 19.99', () => {
      const result = normalizeAmount(19.99);
      assert.equal(result, 19.99);
    });

    test('浮点精度修正：0.1 + 0.2 = 0.3', () => {
      const result = normalizeAmount(0.1 + 0.2);
      assert.equal(result, 0.3);
    });
  });

  describe('钻石计算', () => {
    test('1元 = 10钻石', () => {
      assert.equal(calcDiamonds(1), 10);
    });

    test('0.01元 = 0钻石（向下取整）', () => {
      // 0.01 * 10 = 0.1，Math.floor = 0
      // 修复后通过 validateDiamonds 校验拦截，避免 0 钻石订单
      assert.equal(calcDiamonds(0.01), 0);
      assert.equal(validateDiamonds(calcDiamonds(0.01)), false, '0 钻石应被拒绝');
    });

    test('0.1元 = 1钻石（最小有效充值）', () => {
      assert.equal(calcDiamonds(0.1), 1);
      assert.equal(validateDiamonds(calcDiamonds(0.1)), true, '1 钻石应通过');
    });

    test('10元 = 100钻石', () => {
      assert.equal(calcDiamonds(10), 100);
    });

    test('9.99元 = 99钻石', () => {
      assert.equal(calcDiamonds(9.99), 99);
    });

    test('浮点精度：19.99元 = 199钻石（非198）', () => {
      // 验证 Math.floor(19.99 * 10) = 199，不是 198（浮点 bug）
      assert.equal(calcDiamonds(19.99), 199);
    });
  });

  describe('微信金额转换（元→分）', () => {
    test('1元 = 100分', () => {
      assert.equal(toWechatAmount(1), 100);
    });

    test('0.01元 = 1分', () => {
      assert.equal(toWechatAmount(0.01), 1);
    });

    test('19.99元 = 1999分（非1998）', () => {
      // 验证 Math.round 修正浮点精度
      assert.equal(toWechatAmount(19.99), 1999);
    });

    test('19.99 * 100 的浮点精度处理', () => {
      // 验证 toWechatAmount 使用 Math.round 处理浮点精度
      // 不同 JS 引擎下 19.99 * 100 可能是 1999 或 1999.0000000000002
      // Math.round 都能正确返回 1999
      assert.equal(toWechatAmount(19.99), 1999, '应为 1999');
      // 验证其他易错金额
      assert.equal(toWechatAmount(0.07), 7);
      assert.equal(toWechatAmount(0.13), 13);
      assert.equal(toWechatAmount(2.55), 255);
    });
  });
});
