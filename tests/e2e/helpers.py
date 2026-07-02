"""E2E 测试通用辅助模块"""
import time
import os
import sys

BASE = "http://localhost:3001"

results = []

def check(name: str, passed: bool, detail: str = ""):
    status = "✓ PASS" if passed else "✗ FAIL"
    line = f"  {status}  {name}"
    if detail and not passed:
        line += f"  [{detail}]"
    print(line)
    results.append((name, passed, detail))


def screenshot(page, name: str):
    """保存截图用于失败诊断"""
    os.makedirs("tests/e2e/screenshots", exist_ok=True)
    path = f"tests/e2e/screenshots/{name}.png"
    page.screenshot(path=path, full_page=True)


def report():
    total = len(results)
    passed = sum(1 for _, p, _ in results if p)
    failed = total - passed
    print(f"\n{'='*60}")
    print(f"E2E 测试结果: {passed}/{total} 通过, {failed} 失败")
    print(f"{'='*60}")
    if failed:
        print("\n失败项:")
        for name, p, detail in results:
            if not p:
                print(f"  - {name}: {detail}")
    return failed == 0


def goto(page, path: str, wait_network: bool = True):
    """统一导航函数"""
    url = f"{BASE}{path}"
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    if wait_network:
        try:
            page.wait_for_load_state("networkidle", timeout=10000)
        except Exception:
            pass
    page.wait_for_timeout(500)
