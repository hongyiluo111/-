import json
import os
import sys
import traceback
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright, Page, Browser

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
SCREENSHOTS_DIR = Path(__file__).resolve().parent / "screenshots"
REPORTS_DIR = Path(__file__).resolve().parent / "reports"

SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

PAGES_TO_TEST = [
    {
        "path": "/",
        "name": "home",
        "title": "鸿一电竞",
        "checks": [
            {
                "description": "Navbar links visible",
                "locator": 'nav a[href="/"]',
                "type": "visible",
            },
            {
                "description": "Hero section present",
                "locator": "section, [class*=hero], [class*=Hero]",
                "type": "visible",
            },
            {
                "description": "Platform stats area",
                "locator": "[class*=PlatformStats], [class*=Stats], [class*=stats]",
                "type": "visible_any",
            },
        ],
    },
    {
        "path": "/find-companion",
        "name": "find_companion",
        "title": "找陪玩",
        "checks": [
            {
                "description": "Page heading '找陪玩'",
                "locator": 'h1, [class*=heading], [class*=title]',
                "type": "contains_text",
                "expected_text": "找陪玩",
            },
            {
                "description": "FilterBar or search area",
                "locator": "[class*=FilterBar], [class*=filter], [class*=search], input",
                "type": "visible_any",
            },
            {
                "description": "Companion cards/list",
                "locator": "[class*=CompanionList], [class*=companion], [class*=card]",
                "type": "visible_any",
            },
        ],
    },
    {
        "path": "/clubs",
        "name": "clubs",
        "title": "俱乐部",
        "checks": [
            {
                "description": "Club cards or list",
                "locator": "[class*=card], [class*=Club], [class*=club]",
                "type": "visible_any",
            },
            {
                "description": "Page has content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
    {
        "path": "/rankings",
        "name": "rankings",
        "title": "排行榜",
        "checks": [
            {
                "description": "Tab navigation present",
                "locator": "[class*=tab], [class*=Tab], button, [role=tab]",
                "type": "visible_any",
            },
            {
                "description": "Ranking list area",
                "locator": "[class*=ranking], [class*=Ranking], [class*=list], table, [class*=table]",
                "type": "visible_any",
            },
        ],
    },
    {
        "path": "/feed",
        "name": "feed",
        "title": "动态",
        "checks": [
            {
                "description": "Feed posts list area",
                "locator": "[class*=post], [class*=Post], [class*=feed], [class*=Feed]",
                "type": "visible_any",
            },
            {
                "description": "Page has content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
    {
        "path": "/become-companion",
        "name": "become_companion",
        "title": "成为陪玩",
        "checks": [
            {
                "description": "Application form or CTA",
                "locator": "form, [class*=form], [class*=Form], [class*=steps], [class*=Steps]",
                "type": "visible_any",
            },
            {
                "description": "Page has content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
    {
        "path": "/faq",
        "name": "faq",
        "title": "FAQ",
        "checks": [
            {
                "description": "FAQ accordion or items",
                "locator": "[class*=faq], [class*=Faq], [class*=FAQ], [class*=accordion], [class*=Accordion]",
                "type": "visible_any",
            },
            {
                "description": "Page has content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
]


class ConsoleCapture:
    def __init__(self, page: Page):
        self.page = page
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.logs: list[str] = []

    def start(self):
        def on_console(msg):
            entry = f"[{msg.type}] {msg.text}"
            self.logs.append(entry)
            if msg.type == "error":
                self.errors.append(msg.text)
            elif msg.type == "warning":
                self.warnings.append(msg.text)

        self.page.on("console", on_console)

    def clear(self):
        self.errors.clear()
        self.warnings.clear()
        self.logs.clear()


def take_screenshot(page: Page, name: str) -> str:
    filepath = str(SCREENSHOTS_DIR / f"public_{name}.png")
    page.screenshot(path=filepath, full_page=True, type="png")
    return filepath


def run_check(page: Page, check: dict) -> bool:
    check_type = check["type"]
    locator = check["locator"]

    try:
        if check_type == "visible":
            el = page.locator(locator).first
            return el.is_visible()

        elif check_type == "visible_any":
            el = page.locator(locator).first
            el.wait_for(state="visible", timeout=5000)
            return True

        elif check_type == "contains_text":
            expected = check.get("expected_text", "")
            el = page.locator(locator).first
            if el.count() > 0:
                text_content = el.text_content() or ""
                return expected in text_content
            return expected in (page.content() or "")

        elif check_type == "has_content":
            body_text = page.locator("body").text_content() or ""
            return len(body_text.strip()) > 50

        else:
            return False

    except Exception:
        return False


def test_single_page(
    page: Page, page_info: dict, capture: ConsoleCapture
) -> dict:
    path = page_info["path"]
    name = page_info["name"]
    checks = page_info.get("checks", [])
    expected_title = page_info.get("title", "")

    result = {
        "page": path,
        "name": name,
        "status": "PASS",
        "errors": [],
        "warnings": [],
        "checks_passed": 0,
        "checks_failed": 0,
        "screenshot": "",
    }

    capture.clear()

    try:
        url = f"{BASE_URL}{path}"
        print(f"\n  [{name}] Navigating to {url} ...")

        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_load_state("networkidle", timeout=15000)
        page.wait_for_timeout(1000)

        result["errors"] = list(capture.errors)
        result["warnings"] = list(capture.warnings)

        screenshot_path = take_screenshot(page, name)
        result["screenshot"] = screenshot_path
        print(f"  [{name}] Screenshot saved: {screenshot_path}")

        title = page.title()
        print(f"  [{name}] Page title: {title}")

        if expected_title and expected_title not in title:
            print(f"  [{name}] WARNING: Expected title to contain '{expected_title}' but got '{title}'")

        for check in checks:
            desc = check["description"]
            passed = run_check(page, check)
            if passed:
                result["checks_passed"] += 1
                print(f"  [{name}]   [CHECK] {desc}: PASS")
            else:
                result["checks_failed"] += 1
                print(f"  [{name}]   [CHECK] {desc}: FAIL")

        if result["checks_failed"] > 0 or len(result["errors"]) > 0:
            result["status"] = "FAIL"

        print(f"  [{name}] Result: {result['status']} "
              f"(checks: {result['checks_passed']}/{result['checks_passed'] + result['checks_failed']}, "
              f"errors: {len(result['errors'])}, warnings: {len(result['warnings'])})")

    except Exception as e:
        result["status"] = "FAIL"
        error_msg = f"{type(e).__name__}: {e}"
        result["errors"].append(error_msg)
        traceback.print_exc()
        print(f"  [{name}] EXCEPTION: {error_msg}")

        try:
            screenshot_path = take_screenshot(page, f"{name}_error")
            result["screenshot"] = screenshot_path
        except Exception:
            pass

    return result


def run_tests():
    print("=" * 60)
    print("  电竞陪玩平台 - Public Page Tests")
    print(f"  Base URL: {BASE_URL}")
    print(f"  Time: {datetime.now().isoformat()}")
    print("=" * 60)

    all_results: list[dict] = []

    with sync_playwright() as pw:
        browser: Browser = pw.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="zh-CN",
        )
        page: Page = context.new_page()
        capture = ConsoleCapture(page)
        capture.start()

        try:
            for page_info in PAGES_TO_TEST:
                print(f"\n--- Testing: {page_info['path']} ---")
                result = test_single_page(page, page_info, capture)
                all_results.append(result)
        finally:
            page.close()
            context.close()
            browser.close()

    total = len(all_results)
    passed = sum(1 for r in all_results if r["status"] == "PASS")
    failed = total - passed

    print("\n" + "=" * 60)
    print("  ===== PUBLIC PAGE TEST RESULTS =====")
    print("=" * 60)
    for r in all_results:
        icon = "[OK]" if r["status"] == "PASS" else "[FAIL]"
        err_count = len(r["errors"])
        warn_count = len(r["warnings"])
        print(f"  {icon} {r['page']:<30s} "
              f"checks: {r['checks_passed']}/{r['checks_passed'] + r['checks_failed']}  "
              f"errors: {err_count}  warnings: {warn_count}")
    print("-" * 60)
    print(f"  Total: {total}  Passed: {passed}  Failed: {failed}")
    print("=" * 60)

    report = {
        "results": [
            {
                "page": r["page"],
                "name": r["name"],
                "status": r["status"],
                "checks_passed": r["checks_passed"],
                "checks_failed": r["checks_failed"],
                "errors": r["errors"],
                "warnings": r["warnings"],
                "screenshot": r["screenshot"],
            }
            for r in all_results
        ],
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "base_url": BASE_URL,
            "timestamp": datetime.now().isoformat(),
        },
    }

    report_path = str(REPORTS_DIR / "public_page_results.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n  Report saved: {report_path}")

    return all_results, report


if __name__ == "__main__":
    run_tests()
