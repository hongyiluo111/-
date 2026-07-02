const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('=== 1. Loading login page ===');
    await page.goto('http://localhost:3456/login', { timeout: 120000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    console.log('Title:', await page.title());
    console.log('URL:', page.url());

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    console.log('Email input visible:', await emailInput.isVisible());
    console.log('Password input visible:', await passwordInput.isVisible());
    console.log('Submit button visible:', await submitButton.isVisible());
    console.log('Button text:', await submitButton.innerText());

    // === Test 1: Normal user login ===
    console.log('\n=== 2. Testing normal user login (luohongyi@test.com) ===');
    await emailInput.fill('luohongyi@test.com');
    await passwordInput.fill('Test123456');
    
    // Click and wait for navigation with long timeout
    await Promise.all([
      page.waitForNavigation({ timeout: 120000 }).catch(() => null),
      submitButton.click({ timeout: 10000 }),
    ]);
    await page.waitForTimeout(3000);
    console.log('After login URL:', page.url());

    const hasError = await page.locator('.border-red-300').first().isVisible().catch(() => false);
    if (hasError) {
      console.log('LOGIN FAILED:', await page.locator('.border-red-300').first().innerText());
    } else {
      console.log('LOGIN SUCCEEDED - redirected to:', page.url());
    }

    // Check user name in navbar
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log('User name "罗鸿一" in page:', bodyText.includes('罗鸿一'));

    // === Test 2: Wrong password ===
    console.log('\n=== 3. Testing wrong password ===');
    await page.goto('http://localhost:3456/login', { timeout: 120000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.locator('input[type="email"]').first().fill('luohongyi@test.com');
    await page.locator('input[type="password"]').first().fill('wrongpassword');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);

    const hasError2 = await page.locator('.border-red-300').first().isVisible().catch(() => false);
    if (hasError2) {
      console.log('Error shown (expected):', await page.locator('.border-red-300').first().innerText());
    } else {
      console.log('WARNING: No error shown for wrong password!');
    }

    // === Test 3: Companion login ===
    console.log('\n=== 4. Testing companion login (xiaoming@test.com) ===');
    await page.goto('http://localhost:3456/login', { timeout: 120000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.locator('input[type="email"]').first().fill('xiaoming@test.com');
    await page.locator('input[type="password"]').first().fill('Test123456');
    await Promise.all([
      page.waitForNavigation({ timeout: 120000 }).catch(() => null),
      page.locator('button[type="submit"]').first().click(),
    ]);
    await page.waitForTimeout(3000);
    console.log('After companion login URL:', page.url());
    const compError = await page.locator('.border-red-300').first().isVisible().catch(() => false);
    console.log(compError ? 'FAILED: ' + await page.locator('.border-red-300').first().innerText() : 'Companion login SUCCEEDED');

    // === Test 4: Admin login ===
    console.log('\n=== 5. Testing admin login (admin@hongyi.com) ===');
    await page.goto('http://localhost:3456/login', { timeout: 120000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.locator('input[type="email"]').first().fill('admin@hongyi.com');
    await page.locator('input[type="password"]').first().fill('Test123456');
    await Promise.all([
      page.waitForNavigation({ timeout: 120000 }).catch(() => null),
      page.locator('button[type="submit"]').first().click(),
    ]);
    await page.waitForTimeout(3000);
    console.log('After admin login URL:', page.url());
    const adminError = await page.locator('.border-red-300').first().isVisible().catch(() => false);
    console.log(adminError ? 'FAILED: ' + await page.locator('.border-red-300').first().innerText() : 'Admin login SUCCEEDED');

    // === Test 5: Empty fields ===
    console.log('\n=== 6. Testing empty fields submission ===');
    await page.goto('http://localhost:3456/login', { timeout: 120000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('After empty submit, still on login page:', currentUrl.includes('/login'));

    // === Summary ===
    console.log('\n========================================');
    console.log('  LOGIN TEST COMPLETE');
    console.log('========================================');

  } catch (e) {
    console.error('Fatal Error:', e.message);
  } finally {
    await browser.close();
  }
})();
