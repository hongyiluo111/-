"""黑盒测试主入口：依次运行三个测试模块，汇总报告"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import test_01_auth_companion
import test_02_order_club_chat
import test_03_payment_security
from helpers import report, results

if __name__ == "__main__":
    print("=" * 60)
    print("测试模块 1/3：鉴权 + 陪玩 + 用户资料")
    print("=" * 60)
    try:
        test_01_auth_companion.run()
    except Exception as e:
        print(f"[ERROR] 模块1异常: {e}")
        results.append({"name": "模块1异常", "passed": False, "detail": str(e)})

    print("\n" + "=" * 60)
    print("测试模块 2/3：订单状态机 + 俱乐部 + 聊天")
    print("=" * 60)
    try:
        test_02_order_club_chat.run()
    except Exception as e:
        print(f"[ERROR] 模块2异常: {e}")
        results.append({"name": "模块2异常", "passed": False, "detail": str(e)})

    print("\n" + "=" * 60)
    print("测试模块 3/3：支付回调安全")
    print("=" * 60)
    try:
        test_03_payment_security.run()
    except Exception as e:
        print(f"[ERROR] 模块3异常: {e}")
        results.append({"name": "模块3异常", "passed": False, "detail": str(e)})

    ok = report()
    sys.exit(0 if ok else 1)
