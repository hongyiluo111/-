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

LOGIN_EMAIL = "xxesports@example.com"
LOGIN_PASSWORD = "Club123456"


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
    filepath = str(SCREENSHOTS_DIR / f"club_admin_{name}.png")
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

        elif check_type == "has_link":
            href_pattern = check.get("href_pattern", "")
            links = page.locator(locator)
            for i in range(links.count()):
                link = links.nth(i)
                href = (link.get_attribute("href") or "")
                if href_pattern in href:
                    return True
            return False

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

        nav_links = page.locator(
            'nav a[href="/profile"], nav a[href="/messages"], nav a[href="/orders"]'
        )
        visible_nav = sum(
            1 for i in range(nav_links.count()) if nav_links.nth(i).is_visible()
        )
        print(f"  [LOGIN] User-specific nav links visible: {visible_nav}/{nav_links.count()}")

        if visible_nav == 0:
            print("  [LOGIN] WARNING: No user-specific nav links found after login")

        return True

    except Exception as e:
        print(f"  [LOGIN] EXCEPTION: {type(e).__name__}: {e}")
        traceback.print_exc()
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

        current_url = page.url
        if "/login" in current_url:
            print(f"  [{name}] WARNING: Redirected to login page (not authenticated)")

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


def find_own_club_on_list(page: Page) -> str:
    club_names = page.locator("a.card h3, a.interactive-card h3, .card a h3, .interactive-card a h3")
    body_text = page.locator("body").text_content() or ""

    if "XX电竞" in body_text:
        print("  [clubs] Found 'XX电竞' in page content, locating club card link ...")

        all_links = page.locator('a[href]')
        for i in range(all_links.count()):
            link = all_links.nth(i)
            href = (link.get_attribute("href") or "")
            text = (link.text_content() or "").strip()
            if "/clubs/" in href and href.count("/") >= 2 and "XX电竞" in text:
                club_id = href.rstrip("/").split("/")[-1]
                if club_id and club_id != "clubs" and club_id != "create":
                    print(f"  [clubs] Found own club: {text} -> {club_id}")
                    return club_id

        print("  [clubs] Trying to find any club card link ...")
        for i in range(all_links.count()):
            link = all_links.nth(i)
            href = (link.get_attribute("href") or "")
            if "/clubs/" in href and href != "/clubs" and href != "/clubs/create" and href != "/clubs/":
                club_id = href.rstrip("/").split("/")[-1]
                if club_id:
                    print(f"  [clubs] Found club card link: {href} -> {club_id}")
                    return club_id

    return ""


def test_club_detail(page: Page, capture: ConsoleCapture, all_results: list) -> None:
    """Navigate to /clubs, extract the owned club ID, then test the detail page."""
    path = "/clubs/[id]"
    name = "club_detail"

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
        print(f"\n  [{name}] Navigating to {BASE_URL}/clubs to find own club ...")
        page.goto(f"{BASE_URL}/clubs", wait_until="domcontentloaded", timeout=15000)
        page.wait_for_load_state("networkidle", timeout=15000)
        page.wait_for_timeout(1500)

        club_id = find_own_club_on_list(page)
        if not club_id:
            print(f"  [{name}] WARNING: Could not find any club card link on /clubs page")
            result["status"] = "FAIL"
            result["errors"].append("Could not find any club card link on /clubs page")
            try:
                screenshot_path = take_screenshot(page, f"{name}_not_found")
                result["screenshot"] = screenshot_path
            except Exception:
                pass
            all_results.append(result)
            return

        detail_url = f"{BASE_URL}/clubs/{club_id}"
        print(f"  [{name}] Navigating to club detail: {detail_url} ...")

        page.goto(detail_url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_load_state("networkidle", timeout=15000)
        page.wait_for_timeout(1000)

        result["errors"] = list(capture.errors)
        result["warnings"] = list(capture.warnings)

        screenshot_path = take_screenshot(page, name)
        result["screenshot"] = screenshot_path
        print(f"  [{name}] Screenshot saved: {screenshot_path}")

        title = page.title()
        print(f"  [{name}] Page title: {title}")

        current_url = page.url
        if "/login" in current_url:
            print(f"  [{name}] WARNING: Redirected to login page (not authenticated)")
            result["status"] = "FAIL"
            result["errors"].append("Redirected to login page")

        if "不存在" in (page.locator("body").text_content() or ""):
            print(f"  [{name}] WARNING: Club not found page displayed")
            result["status"] = "FAIL"
            result["errors"].append("Club not found page displayed")
            all_results.append(result)
            return

        checks = [
            {
                "description": "Club name heading visible",
                "locator": "h1",
                "type": "contains_text",
                "expected_text": "XX",
            },
            {
                "description": "Game tag present",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "王者荣耀",
            },
            {
                "description": "部长 (owner) info present",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "部长",
            },
            {
                "description": "俱乐部简介 section present",
                "locator": "h2",
                "type": "contains_text",
                "expected_text": "俱乐部简介",
            },
            {
                "description": "成员列表 section present",
                "locator": "h2",
                "type": "contains_text",
                "expected_text": "成员列表",
            },
            {
                "description": "Member cards rendered",
                "locator": "a[href*=\"/profile/\"]",
                "type": "has_link",
                "href_pattern": "/profile/",
            },
            {
                "description": "Edit button visible (club owner)",
                "locator": "a[href*=\"/edit\"]",
                "type": "visible",
            },
            {
                "description": "Dissolve button visible (club owner)",
                "locator": "button",
                "type": "contains_text",
                "expected_text": "解散",
            },
            {
                "description": "Member count matches",
                "locator": "body",
                "type": "contains_text",
                "expected_text": "名成员",
            },
        ]

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

    all_results.append(result)


def run_tests():
    print("=" * 60)
    print("  电竞陪玩平台 - Club Admin Tests")
    print(f"  Base URL: {BASE_URL}")
    print(f"  Login: {LOGIN_EMAIL}")
    print(f"  Time: {datetime.now().isoformat()}")
    print("=" * 60)

    CLUB_PAGES = [
        {
            "path": "/clubs",
            "name": "clubs",
            "title": "俱乐部列表",
            "checks": [
                {
                    "description": "Page heading '俱乐部' visible",
                    "locator": "h1",
                    "type": "contains_text",
                    "expected_text": "俱乐部",
                },
                {
                    "description": "创建俱乐部 button visible",
                    "locator": "a[href*=\"/clubs/create\"]",
                    "type": "visible",
                },
                {
                    "description": "Game filter dropdown present",
                    "locator": "select",
                    "type": "visible",
                },
                {
                    "description": "Search input present",
                    "locator": "input[placeholder*=\"搜索\"]",
                    "type": "visible",
                },
                {
                    "description": "Sort dropdown present (成员数/最新)",
                    "locator": "select",
                    "type": "visible",
                },
                {
                    "description": "Club cards listed with member count",
                    "locator": "body",
                    "type": "contains_text",
                    "expected_text": "成员",
                },
                {
                    "description": "XX电竞俱乐部 visible (own club)",
                    "locator": "body",
                    "type": "contains_text",
                    "expected_text": "XX电竞",
                },
                {
                    "description": "Page has meaningful content",
                    "locator": "body",
                    "type": "has_content",
                },
            ],
        },
        {
            "path": "/clubs/create",
            "name": "create_club",
            "title": "创建俱乐部",
            "checks": [
                {
                    "description": "Page heading '创建俱乐部' visible",
                    "locator": "h1",
                    "type": "contains_text",
                    "expected_text": "创建俱乐部",
                },
                {
                    "description": "俱乐部名称 input present",
                    "locator": "input",
                    "type": "visible",
                },
                {
                    "description": "Game select dropdown present",
                    "locator": "select",
                    "type": "visible",
                },
                {
                    "description": "俱乐部简介 textarea present",
                    "locator": "textarea",
                    "type": "visible",
                },
                {
                    "description": "Avatar URL input present",
                    "locator": 'input[placeholder*="avatar"]',
                    "type": "visible",
                },
                {
                    "description": "Banner URL input present",
                    "locator": 'input[placeholder*="banner"]',
                    "type": "visible",
                },
                {
                    "description": "Submit button '创建俱乐部' present",
                    "locator": 'button[type="submit"]',
                    "type": "contains_text",
                    "expected_text": "创建俱乐部",
                },
                {
                    "description": "Cancel link back to /clubs present",
                    "locator": 'a[href="/clubs"]',
                    "type": "visible",
                },
            ],
        },
    ]

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
                print("\n  [FATAL] Login failed - cannot continue with club admin tests")
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
                return all_results

            for page_info in CLUB_PAGES:
                print(f"\n--- Testing: {page_info['path']} ---")
                result = test_single_page(page, page_info, capture)
                all_results.append(result)

            test_club_detail(page, capture, all_results)

        finally:
            page.close()
            context.close()
            browser.close()

    total = len(all_results)
    passed = sum(1 for r in all_results if r["status"] == "PASS")
    failed = total - passed

    print("\n" + "=" * 60)
    print("  ===== CLUB ADMIN TEST RESULTS =====")
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

    report_path = str(REPORTS_DIR / "club_admin_results.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n  Report saved: {report_path}")

    return all_results, report


if __name__ == "__main__":
    run_tests()
