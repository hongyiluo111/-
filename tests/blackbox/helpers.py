"""黑盒测试通用辅助：结果收集 + HTTP 客户端（基于 Playwright request context，自动管理 cookie）"""
from playwright.sync_api import APIRequestContext
import json
from datetime import datetime

BASE = "http://localhost:3001"

results = []

def check(name: str, passed: bool, detail: str = ""):
    status = "PASS" if passed else "FAIL"
    results.append({"name": name, "passed": passed, "detail": detail})
    print(f"[{status}] {name}" + (f" — {detail}" if detail else ""))

def api(ctx: APIRequestContext, method: str, path: str, **kwargs):
    """统一 API 调用，返回 (status, body)"""
    url = BASE + path
    try:
        resp = ctx.fetch(url, method=method, **kwargs)
        try:
            body = resp.json()
        except Exception:
            body = {"_raw": resp.text()}
        return resp.status, body
    except Exception as e:
        return -1, {"_error": str(e)}

def report():
    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    failed = total - passed
    print("\n" + "=" * 60)
    print(f"总计 {total} 项 | 通过 {passed} | 失败 {failed}")
    print("=" * 60)
    if failed:
        print("\n失败项明细：")
        for r in results:
            if not r["passed"]:
                print(f"  - {r['name']}: {r['detail']}")
    # 写 JSON 报告
    with open("tests/blackbox/report.json", "w", encoding="utf-8") as f:
        json.dump({"total": total, "passed": passed, "failed": failed, "items": results, "time": datetime.now().isoformat()}, f, ensure_ascii=False, indent=2)
    return failed == 0
