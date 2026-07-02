"""E2E 测试主入口：依次运行所有测试模块并汇总报告"""
import sys
import os

# 将当前目录加入 path 以便 import helpers
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 重置结果收集器
import helpers
helpers.results = []

from test_01_pages_auth import run as run_01
from test_02_companion_order import run as run_02

print("=" * 60)
print("E2E 端到端测试套件")
print("=" * 60)

modules = [
    ("模块1：页面渲染+认证", run_01),
    ("模块2：陪玩浏览+下单", run_02),
]

module_results = []
for name, run_fn in modules:
    print(f"\n{'='*60}")
    print(f"运行 {name}")
    print(f"{'='*60}")
    before_count = len(helpers.results)
    try:
        run_fn()
        after_count = len(helpers.results)
        passed = sum(1 for _, p, _ in helpers.results[before_count:after_count] if p)
        total = after_count - before_count
        module_results.append((name, passed, total))
    except Exception as e:
        print(f"模块执行异常: {e}")
        module_results.append((name, 0, 1))

# 汇总报告
print(f"\n{'='*60}")
print("E2E 测试汇总")
print(f"{'='*60}")
for name, passed, total in module_results:
    status = "✓" if passed == total else "✗"
    print(f"  {status} {name}: {passed}/{total}")

success = helpers.report()
sys.exit(0 if success else 1)
