import json
import os
import traceback
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
SCREENSHOTS_DIR = Path(__file__).resolve().parent / "screenshots"
REPORTS_DIR = Path(__file__).resolve().parent / "reports"

SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

LOGIN_EMAIL = "admin@example.com"
LOGIN_PASSWORD = "123456"

ADMIN_PAGES = [
    {
        "path": "/admin",
        "name": "dashboard",
        "title": "管理后台首页",
        "checks": [
            {
                "description": "Dashboard stat cards / data cards present",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "总",
            },
            {
                "description": "Page heading for admin dashboard visible",
                "locator": "h1",
                "type": "contains_text",
                "expected_text": "管理",
            },
            {
                "description": "Page has meaningful content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
    {
        "path": "/admin/users",
        "name": "users",
        "title": "用户管理",
        "checks": [
            {
                "description": "User table or list present",
                "locator": "table, [class*=table], [class*=Table]",
                "type": "visible_any",
            },
            {
                "description": "Page contains table headers or user-related content",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "用户",
            },
            {
                "description": "Page has meaningful content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
    {
        "path": "/admin/companions",
        "name": "companions",
        "title": "陪玩管理",
        "checks": [
            {
                "description": "Companion list or table present",
                "locator": "table, [class*=table], [class*=Table]",
                "type": "visible_any",
            },
            {
                "description": "Page contains companion-related content",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "陪玩",
            },
            {
                "description": "Page has meaningful content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
    {
        "path": "/admin/orders",
        "name": "orders",
        "title": "订单管理",
        "checks": [
            {
                "description": "Order list or table present",
                "locator": "table, [class*=table], [class*=Table]",
                "type": "visible_any",
            },
            {
                "description": "Page contains order-related content",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "订单",
            },
            {
                "description": "Page has meaningful content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
    {
        "path": "/admin/companions/review",
        "name": "review",
        "title": "审核队列",
        "checks": [
            {
                "description": "Review queue list or table present",
                "locator": "table, [class*=table], [class*=Table]",
                "type": "visible_any",
            },
            {
                "description": "Page contains review-related content",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "审核",
            },
            {
                "description": "Page has meaningful content",
                "locator": "body",
                "type": "has_content",
            },
        ],
    },
    {
        "path": "/admin/settings",
        "name": "settings",
        "title": "系统设置",
        "checks": [
            {
                "description": "Settings form or config options present",
                "locator": "form, [class*=form], [class*=Form]",
                "type": "visible_any",
            },
            {
                "description": "Page contains settings-related content",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "设置",
            },
            {
                "description": "Page has meaningful content",
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
    filepath = str(SCREENSHOTS_DIR / f"admin_{name}.png")
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


def do_login(page: Page, capture: ConsoleCapture) -> bool:
    print("\n  [LOGIN] Navigating to login page ...")
    capture.clear()

    try:
        page.goto(f"{BASE_URL}/login", wait_until="domcontentloaded", timeout=15000)
        page.wait_for_load_state("networkidle", timeout=15000)
        page.wait_for_timeout(1500)

        email_input = page.locator("input#email")
        if email_input.count() == 0:
            email_input = page.locator('input[type="email"]')

        password_input = page.locator("input#password")
        if password_input.count() == 0:
            password_input = page.locator('input[type="password"]')

        submit_button = page.locator('button[type="submit"]')

        if email_input.count() == 0:
            print("  [LOGIN] ERROR: Email input not found")
            return False
        if password_input.count() == 0:
            print("  [LOGIN] ERROR: Password input not found")
            return False
        if submit_button.count() == 0:
            print("  [LOGIN] ERROR: Submit button not found")
            return False

        email_input.fill(LOGIN_EMAIL)
        password_input.fill(LOGIN_PASSWORD)

        print(f"  [LOGIN] Submitting credentials for {LOGIN_EMAIL} ...")
        submit_button.click()

        page.wait_for_load_state("networkidle", timeout=15000)
        page.wait_for_timeout(2000)

        error_div = page.locator("div[class*=bg-red-50]")
        if error_div.count() > 0 and error_div.is_visible():
            error_text = error_div.text_content() or ""
            print(f"  [LOGIN] ERROR: Login form error: {error_text}")
            return False

        current_url = page.url
        if "/login" in current_url:
            print(f"  [LOGIN] WARNING: Still on login page after submit, URL: {current_url}")
            body_text = page.locator("body").text_content() or ""
            if "bg-red-50" in body_text:
                print("  [LOGIN] ERROR: Error message present on page")
            return False

        print(f"  [LOGIN] Navigated to: {current_url}")

        page.wait_for_timeout(1500)

        nav_links = page.locator(
            'nav a[href="/admin"]'
        )
        visible_nav = sum(
            1 for i in range(nav_links.count()) if nav_links.nth(i).is_visible()
        )
        print(f"  [LOGIN] Admin nav links visible: {visible_nav}/{nav_links.count()}")

        return True

    except Exception as e:
        print(f"  [LOGIN] EXCEPTION: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False


def check_access_denied(page: Page) -> bool:
    current_url = page.url
    if "/login" in current_url:
        print(f"  [ACCESS] Redirected to login page, URL: {current_url}")
        return True
    if current_url == f"{BASE_URL}/" or current_url == BASE_URL + "/":
        body_text = page.locator("body").text_content() or ""
        if "管理" not in body_text and "admin" not in current_url.lower():
            print(f"  [ACCESS] Redirected to home page without admin content, URL: {current_url}")
            return True
    body_text = page.locator("body").text_content() or ""
    denied_keywords = ["Access Denied", "无权访问", "Access denied", "403", "Forbidden"]
    for kw in denied_keywords:
        if kw in body_text:
            print(f"  [ACCESS] Access denied keyword found: '{kw}'")
            return True
    return False


def test_single_page(
    page: Page, page_info: dict, capture: ConsoleCapture
) -> dict:
    path = page_info["path"]
    name = page_info["name"]
    checks = page_info.get("checks", [])

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

        if check_access_denied(page):
            result["status"] = "FAIL"
            reason = "Access denied or redirected away from admin page"
            result["errors"].append(reason)
            print(f"  [{name}] FAIL: {reason}")
            result["checks_failed"] = len(checks)
            return result

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

        print(
            f"  [{name}] Result: {result['status']} "
            f"(checks: {result['checks_passed']}/{result['checks_passed'] + result['checks_failed']}, "
            f"errors: {len(result['errors'])}, warnings: {len(result['warnings'])})"
        )

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
    print("  电竞陪玩平台 - System Admin Tests")
    print(f"  Base URL: {BASE_URL}")
    print(f"  Login: {LOGIN_EMAIL}")
    print(f"  Time: {datetime.now().isoformat()}")
    print("=" * 60)

    all_results: list[dict] = []

    with sync_playwright() as pw:
        browser: Browser = pw.chromium.launch(headless=True)
        context: BrowserContext = browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="zh-CN",
        )
        page: Page = context.new_page()
        capture = ConsoleCapture(page)
        capture.start()

        try:
            login_ok = do_login(page, capture)
            if not login_ok:
                print("\n  [FATAL] Login failed - cannot continue with admin tests")
                all_results.append(
                    {
                        "page": "/login",
                        "name": "login",
                        "status": "FAIL",
                        "errors": ["Login failed"],
                        "warnings": [],
                        "checks_passed": 0,
                        "checks_failed": 1,
                        "screenshot": "",
                    }
                )
            else:
                for page_info in ADMIN_PAGES:
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
    print("  ===== ADMIN TEST RESULTS =====")
    print("=" * 60)
    for r in all_results:
        icon = "[OK]" if r["status"] == "PASS" else "[FAIL]"
        err_count = len(r["errors"])
        warn_count = len(r["warnings"])
        print(
            f"  {icon} {r['page']:<30s} "
            f"checks: {r['checks_passed']}/{r['checks_passed'] + r['checks_failed']}  "
            f"errors: {err_count}  warnings: {warn_count}"
        )
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
            "login_email": LOGIN_EMAIL,
            "timestamp": datetime.now().isoformat(),
        },
    }

    report_path = str(REPORTS_DIR / "admin_results.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n  Report saved: {report_path}")

    return all_results, report


if __name__ == "__main__":
    run_tests()
