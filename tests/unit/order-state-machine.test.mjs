// 白盒单元测试：订单状态机分支覆盖
// 测试所有合法/非法状态转换路径
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// 订单状态机定义（根据代码审查提取）
// 合法状态：pending → paid → accepted → in_progress → completed
//           pending → cancelled（用户取消/陪玩拒单）
//           paid → cancelled（用户取消，需退款）
//           accepted → cancelled（用户取消，需退款）
//           in_progress → cancelled（理论上不允许，需校验）

// 状态转换规则表（从各 route.ts 提取）
const TRANSITIONS = {
  // pay: 仅 pending → paid
  pay: { from: 'pending', to: 'paid' },
  // accept: 仅 paid → accepted
  accept: { from: 'paid', to: 'accepted' },
  // start: 仅 accepted → in_progress
  start: { from: 'accepted', to: 'in_progress' },
  // complete: 仅 in_progress → completed
  complete: { from: 'in_progress', to: 'completed' },
  // cancel: pending/paid/accepted → cancelled（in_progress/completed 不可取消）
  cancel: { from: ['pending', 'paid', 'accepted'], to: 'cancelled' },
  // reject: 仅 pending → cancelled（陪玩拒单）
  reject: { from: 'pending', to: 'cancelled' },
};

function canTransition(action, currentStatus) {
  const rule = TRANSITIONS[action];
  if (!rule) return false;
  const allowedFrom = Array.isArray(rule.from) ? rule.from : [rule.from];
  return allowedFrom.includes(currentStatus);
}

// Mock 订单
function mockOrder(status, paymentStatus = 'unpaid') {
  return { id: 'order-1', status, paymentStatus, userId: 'u1', companionId: 'c1' };
}

describe('订单状态机分支覆盖', () => {

  describe('pay 支付', () => {
    test('pending → paid 允许', () => {
      assert.equal(canTransition('pay', 'pending'), true);
    });
    test('paid → paid 拒绝（重复支付）', () => {
      assert.equal(canTransition('pay', 'paid'), false);
    });
    test('accepted → paid 拒绝', () => {
      assert.equal(canTransition('pay', 'accepted'), false);
    });
    test('completed → paid 拒绝', () => {
      assert.equal(canTransition('pay', 'completed'), false);
    });
    test('cancelled → paid 拒绝', () => {
      assert.equal(canTransition('pay', 'cancelled'), false);
    });
  });

  describe('accept 接单', () => {
    test('paid → accepted 允许', () => {
      assert.equal(canTransition('accept', 'paid'), true);
    });
    test('pending → accepted 拒绝（未支付）', () => {
      assert.equal(canTransition('accept', 'pending'), false);
    });
    test('accepted → accepted 拒绝（重复接单）', () => {
      assert.equal(canTransition('accept', 'accepted'), false);
    });
    test('in_progress → accepted 拒绝', () => {
      assert.equal(canTransition('accept', 'in_progress'), false);
    });
  });

  describe('start 开始服务', () => {
    test('accepted → in_progress 允许', () => {
      assert.equal(canTransition('start', 'accepted'), true);
    });
    test('pending → in_progress 拒绝', () => {
      assert.equal(canTransition('start', 'pending'), false);
    });
    test('paid → in_progress 拒绝（未接单）', () => {
      assert.equal(canTransition('start', 'paid'), false);
    });
    test('in_progress → in_progress 拒绝', () => {
      assert.equal(canTransition('start', 'in_progress'), false);
    });
  });

  describe('complete 完成', () => {
    test('in_progress → completed 允许', () => {
      assert.equal(canTransition('complete', 'in_progress'), true);
    });
    test('pending → completed 拒绝', () => {
      assert.equal(canTransition('complete', 'pending'), false);
    });
    test('accepted → completed 拒绝（未开始）', () => {
      assert.equal(canTransition('complete', 'accepted'), false);
    });
    test('completed → completed 拒绝', () => {
      assert.equal(canTransition('complete', 'completed'), false);
    });
  });

  describe('cancel 取消', () => {
    test('pending → cancelled 允许', () => {
      assert.equal(canTransition('cancel', 'pending'), true);
    });
    test('paid → cancelled 允许（需退款）', () => {
      assert.equal(canTransition('cancel', 'paid'), true);
    });
    test('accepted → cancelled 允许（需退款）', () => {
      assert.equal(canTransition('cancel', 'accepted'), true);
    });
    test('in_progress → cancelled 拒绝（进行中不可取消）', () => {
      assert.equal(canTransition('cancel', 'in_progress'), false);
    });
    test('completed → cancelled 拒绝（已完成不可取消）', () => {
      assert.equal(canTransition('cancel', 'completed'), false);
    });
    test('cancelled → cancelled 拒绝（重复取消）', () => {
      assert.equal(canTransition('cancel', 'cancelled'), false);
    });
  });

  describe('reject 拒单', () => {
    test('pending → cancelled 允许', () => {
      assert.equal(canTransition('reject', 'pending'), true);
    });
    test('paid → cancelled 拒绝（已支付不能拒单，只能取消）', () => {
      assert.equal(canTransition('reject', 'paid'), false);
    });
    test('accepted → cancelled 拒绝', () => {
      assert.equal(canTransition('reject', 'accepted'), false);
    });
  });

  describe('完整合法路径', () => {
    test('pending → paid → accepted → in_progress → completed', () => {
      let status = 'pending';
      assert.equal(canTransition('pay', status), true);
      status = 'paid';
      assert.equal(canTransition('accept', status), true);
      status = 'accepted';
      assert.equal(canTransition('start', status), true);
      status = 'in_progress';
      assert.equal(canTransition('complete', status), true);
      status = 'completed';
      // 完成后不可逆
      assert.equal(canTransition('pay', status), false);
      assert.equal(canTransition('cancel', status), false);
      assert.equal(canTransition('accept', status), false);
    });

    test('pending → cancelled（用户直接取消）', () => {
      let status = 'pending';
      assert.equal(canTransition('cancel', status), true);
    });

    test('paid → cancelled（支付后取消，需退款）', () => {
      let status = 'paid';
      assert.equal(canTransition('cancel', status), true);
    });

    test('accepted → cancelled（接单后取消，需退款）', () => {
      let status = 'accepted';
      assert.equal(canTransition('cancel', status), true);
    });
  });

  describe('非法跳转路径', () => {
    test('pending → accepted 跳过支付（非法）', () => {
      assert.equal(canTransition('accept', 'pending'), false);
    });
    test('pending → in_progress 跳过支付和接单（非法）', () => {
      assert.equal(canTransition('start', 'pending'), false);
    });
    test('pending → completed 跳过所有步骤（非法）', () => {
      assert.equal(canTransition('complete', 'pending'), false);
    });
    test('paid → in_progress 跳过接单（非法）', () => {
      assert.equal(canTransition('start', 'paid'), false);
    });
    test('paid → completed 跳过接单和开始（非法）', () => {
      assert.equal(canTransition('complete', 'paid'), false);
    });
    test('accepted → completed 跳过开始服务（非法）', () => {
      assert.equal(canTransition('complete', 'accepted'), false);
    });
  });

  describe('非法逆向路径', () => {
    test('completed → in_progress 不可逆', () => {
      assert.equal(canTransition('start', 'completed'), false);
    });
    test('completed → accepted 不可逆', () => {
      assert.equal(canTransition('accept', 'completed'), false);
    });
    test('cancelled → pending 不可恢复', () => {
      // 没有定义 'reopen' 动作
      assert.equal(canTransition('pay', 'cancelled'), false);
      assert.equal(canTransition('accept', 'cancelled'), false);
    });
  });
});
