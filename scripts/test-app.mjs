import { chromium } from '@playwright/test';

async function test() {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[ERROR] ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`[PAGE ERROR] ${err.message}`));

  const pages = [
    { name: 'Homepage', url: 'http://localhost:3000' },
    { name: 'Login', url: 'http://localhost:3000/login' },
    { name: 'Register', url: 'http://localhost:3000/register' },
    { name: 'Find Companion', url: 'http://localhost:3000/find-companion' },
  ];

  for (const p of pages) {
    console.log(`\n=== Testing ${p.name} ===`);
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      console.log(`${p.name} loaded successfully, errors so far: ${errors.length}`);
    } catch (e) {
      console.log(`${p.name} FAILED: ${e.message}`);
      errors.push(`[NAVIGATION ERROR] ${p.name}: ${e.message}`);
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log(`TOTAL ERRORS: ${errors.length}`);
  console.log('='.repeat(50));
  if (errors.length > 0) {
    errors.forEach(e => console.log(e));
  } else {
    console.log('No errors found!');
  }
}

test().catch(e => { console.error('Test failed:', e); process.exit(1); });
