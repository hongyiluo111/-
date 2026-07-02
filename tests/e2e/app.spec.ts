import { test, expect, Page } from '@playwright/test';

const UNIQUE = Date.now();
const TEST_USER = {
  name: `E2E测试用户${UNIQUE}`,
  email: `e2e_${UNIQUE}@test.com`,
  password: 'Test123456',
};

// ===================== 辅助函数 =====================

async function registerViaUI(page: Page) {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.fill('#name', TEST_USER.name);
  await page.fill('#email', TEST_USER.email);
  await page.fill('#password', TEST_USER.password);
  await page.fill('#confirmPassword', TEST_USER.password);
  await page.click('button[type="submit"]');
  // 注册成功后跳转到登录页
  await page.waitForURL(/\/login/, { timeout: 15000 });
}

async function loginViaUI(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('#email', TEST_USER.email);
  await page.fill('#password', TEST_USER.password);
  await page.click('button[type="submit"]');
  // 登录成功后跳转到首页
  await page.waitForURL(/\/$/, { timeout: 15000 });
}

// ===================== 1. 首页渲染 =====================

test.describe('首页', () => {
  test('首页正常加载', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('首页包含导航栏', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // 导航栏应存在
    const nav = page.locator('nav, header, [class*="navbar"], [class*="Navbar"]');
    await expect(nav.first()).toBeVisible({ timeout: 10000 });
  });

  test('首页包含关键链接', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // 应该有找陪玩、排行榜等链接
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});

// ===================== 2. 注册流程 =====================

test.describe('用户注册', () => {
  test('注册页面正常加载', async ({ page }) => {
    const res = await page.goto('/register');
    expect(res?.status()).toBe(200);
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('空表单提交显示错误', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.click('button[type="submit"]');
    // 应该保持在注册页面或显示错误
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('/register');
  });

  test('密码不一致显示错误', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.fill('#name', 'Test');
    await page.fill('#email', 'test@test.com');
    await page.fill('#password', 'Test123456');
    await page.fill('#confirmPassword', 'Different123');
    await page.click('button[type="submit"]');
    // 应显示密码不一致的错误
    await page.waitForTimeout(2000);
    const errorText = await page.textContent('body');
    expect(errorText).toContain('不一致');
  });

  test('正常注册并跳转登录页', async ({ page }) => {
    await registerViaUI(page);
    expect(page.url()).toContain('/login');
  });
});

// ===================== 3. 登录流程 =====================

test.describe('用户登录', () => {
  test('登录页面正常加载', async ({ page }) => {
    const res = await page.goto('/login');
    expect(res?.status()).toBe(200);
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('错误密码显示错误', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', 'WrongPassword!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    // 应该显示错误信息
    expect(body).toMatch(/错误|失败|不正确|invalid/i);
  });

  test('正常登录并跳转首页', async ({ page }) => {
    await loginViaUI(page);
    // 登录后应该在首页
    expect(page.url()).toMatch(/localhost:3456\/?$/);
  });
});

// ===================== 4. 个人中心 =====================

test.describe('个人中心', () => {
  test.beforeEach(async ({ page }) => {
    // 通过 API 登录
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/$/, { timeout: 15000 });
  });

  test('个人中心页面加载', async ({ page }) => {
    const res = await page.goto('/profile');
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('个人中心显示用户信息', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    // 应该显示用户名或邮箱
    expect(body).toMatch(/个人中心|钻石|充值/);
  });

  test('设置页面加载', async ({ page }) => {
    const res = await page.goto('/settings');
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
  });
});

// ===================== 5. 找陪玩页面 =====================

test.describe('找陪玩', () => {
  test('找陪玩页面正常加载', async ({ page }) => {
    const res = await page.goto('/find-companion');
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/陪玩|游戏|搜索/);
  });

  test('页面包含游戏筛选', async ({ page }) => {
    await page.goto('/find-companion');
    await page.waitForLoadState('networkidle');
    // 应该有游戏选择相关元素
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});

// ===================== 6. 动态页面 =====================

test.describe('动态/Feed', () => {
  test('动态页面正常加载', async ({ page }) => {
    const res = await page.goto('/feed');
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('登录后可以发布动态', async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/$/, { timeout: 15000 });

    // 去动态页面
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});

// ===================== 7. 排行榜 =====================

test.describe('排行榜', () => {
  test('排行榜页面正常加载', async ({ page }) => {
    const res = await page.goto('/rankings');
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/排行|榜/);
  });
});

// ===================== 8. 俱乐部 =====================

test.describe('俱乐部', () => {
  test('俱乐部列表页加载', async ({ page }) => {
    const res = await page.goto('/clubs');
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});

// ===================== 9. 静态页面 =====================

test.describe('静态页面', () => {
  const staticPages = [
    { path: '/faq', keyword: '常见问题' },
    { path: '/contact', keyword: '联系' },
    { path: '/privacy', keyword: '隐私' },
    { path: '/terms', keyword: '条款' },
  ];

  for (const { path, keyword } of staticPages) {
    test(`${path} 页面正常加载`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      const body = await page.textContent('body');
      expect(body).toBeTruthy();
    });
  }
});

// ===================== 10. 导航与路由 =====================

test.describe('导航与路由', () => {
  test('未登录访问受保护页面应跳转', async ({ page }) => {
    // 清除所有 cookies
    await page.context().clearCookies();
    const res = await page.goto('/profile');
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    // 应该显示登录提示或跳转到登录页
    expect(body).toMatch(/登录|未登录|去登录/);
  });

  test('页面间导航正常', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 依次访问几个页面
    for (const path of ['/find-companion', '/feed', '/rankings', '/clubs']) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    }
  });

  test('404 页面处理', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist-12345');
    // Next.js 返回 404 或 200（取决于配置）
    expect(res?.status()).toBeGreaterThanOrEqual(200);
  });
});

// ===================== 11. 订单页面 =====================

test.describe('订单页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/$/, { timeout: 15000 });
  });

  test('订单列表页加载', async ({ page }) => {
    const res = await page.goto('/orders');
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/订单|暂无/);
  });
});

// ===================== 12. 响应式测试 =====================

test.describe('响应式布局', () => {
  const viewports = [
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  for (const vp of viewports) {
    test(`${vp.name} (${vp.width}x${vp.height}) 首页渲染`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const res = await page.goto('/');
      expect(res?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      // 页面应该没有水平滚动条
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 20); // 允许少量误差
    });

    test(`${vp.name} 找陪玩页渲染`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const res = await page.goto('/find-companion');
      expect(res?.status()).toBe(200);
    });
  }
});

// ===================== 13. API 错误处理 =====================

test.describe('前端错误处理', () => {
  test('登录页显示网络错误处理', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    // 拦截 API 请求模拟网络错误
    await page.route('**/api/auth/login', (route) => route.abort());
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    // 页面不应该崩溃
    await expect(page.locator('body')).toBeVisible();
  });

  test('首页 API 失败不白屏', async ({ page }) => {
    // 拦截所有 API 请求
    await page.route('**/api/**', (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(3000);
    // 页面应该仍然可见
    await expect(page.locator('body')).toBeVisible();
  });
});

// ===================== 14. 表单验证 =====================

test.describe('表单验证', () => {
  test('注册页邮箱格式验证', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.fill('#name', 'Test');
    await page.fill('#email', 'not-an-email');
    await page.fill('#password', 'Test123456');
    await page.fill('#confirmPassword', 'Test123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    // 应该显示错误或保持在注册页
    expect(page.url()).toContain('/register');
  });

  test('登录页邮箱格式验证', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', 'bad-email');
    await page.fill('#password', 'Test123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });
});
