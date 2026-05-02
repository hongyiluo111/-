const BASE_URL = 'http://localhost:3000';

const games = [
  { name: '王者荣耀', ranks: ['王者', '星耀', '钻石'] },
  { name: '英雄联盟', ranks: ['钻石', '大师', '铂金'] },
  { name: '和平精英', ranks: ['王牌', '战神', '超级王牌'] },
  { name: '三角洲行动', ranks: ['专家', '大师', '精英'] },
  { name: 'CS2', ranks: ['S', 'A', 'B'] },
  { name: '无畏契约', ranks: ['超凡', '钻石', '铂金'] },
  { name: '穿越火线', ranks: ['枪王', '枪王之王', '精英'] },
  { name: '金铲铲之战', ranks: ['大师', '钻石', '铂金'] },
  { name: '第五人格', ranks: ['六阶', '五阶', '巅峰七阶'] },
  { name: '蛋仔派对', ranks: ['凤凰蛋', '恐龙蛋', '鹅蛋'] },
];

const names = [
  '小明', '小红', '小华', '小丽', '小强',
  '小芳', '小伟', '小娟', '小军', '小燕'
];

const descriptions = [
  '技术过硬，配合默契，带你上分',
  '声音好听，性格温柔，娱乐首选',
  '职业退役选手，实力强劲',
  '全能型选手，什么位置都能打',
  '节奏大师，带你飞',
  '细节控，操作细腻',
  '指挥型选手，团队核心',
  '娱乐陪玩，开心最重要',
  '高端局常客，经验丰富',
  '新手友好，耐心教学'
];

async function fetchWithCookie(url, options = {}, cookie = '') {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (cookie) {
    headers['Cookie'] = `token=${cookie}`;
  }
  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  return response.json();
}

async function main() {
  console.log('=== 开始设置用户和陪玩 ===\n');

  // 1. 登录管理员
  console.log('1. 登录管理员账号...');
  const adminLogin = await fetchWithCookie(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: '123456' }),
  });

  if (!adminLogin.success) {
    console.error('管理员登录失败:', adminLogin.error);
    process.exit(1);
  }
  console.log('   管理员登录成功\n');

  // 2. 获取管理员 cookie
  const cookieResponse = await fetch(`${BASE_URL}/api/auth/current-user`, {
    credentials: 'include',
  });
  const cookies = cookieResponse.headers.get('set-cookie');
  const tokenMatch = cookies?.match(/token=([^;]+)/);
  const adminToken = tokenMatch ? tokenMatch[1] : '';

  // 3. 删除所有现有陪玩
  console.log('2. 删除所有现有陪玩...');
  const companionsResult = await fetchWithCookie(
    `${BASE_URL}/api/admin/companions`,
    {},
    adminToken
  );

  if (companionsResult.companions) {
    for (const companion of companionsResult.companions) {
      await fetchWithCookie(
        `${BASE_URL}/api/admin/companions/${companion.id}`,
        { method: 'DELETE' },
        adminToken
      );
      console.log(`   删除陪玩: ${companion.name}`);
    }
  }
  console.log('   所有陪玩已删除\n');

  // 4. 注册10个新用户
  console.log('3. 注册10个新用户...');
  const users = [];

  for (let i = 0; i < 10; i++) {
    const email = `user${i + 1}@example.com`;
    const password = `Pass${i + 1}23456`;
    const name = names[i];

    const registerResult = await fetchWithCookie(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (registerResult.success) {
      users.push({ email, password, name, id: registerResult.user?.id });
      console.log(`   注册成功: ${name} (${email})`);
    } else {
      console.log(`   注册失败: ${email} - ${registerResult.error}`);
      // 尝试获取已有用户
      const existingUser = await fetchWithCookie(
        `${BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
      if (existingUser.success) {
        users.push({ email, password, name, id: existingUser.user?.id });
        console.log(`   用户已存在，获取成功`);
      }
    }
  }
  console.log(`   共注册/获取 ${users.length} 个用户\n`);

  // 5. 让每个用户成为陪玩
  console.log('4. 让用户成为陪玩...');
  const companions = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const game = games[i];
    const rank = game.ranks[0];
    const price = 30 + Math.floor(Math.random() * 70); // 30-100 元
    const description = descriptions[i];

    // 登录用户获取 token
    const userLogin = await fetchWithCookie(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: user.password }),
    });

    if (!userLogin.success) {
      console.log(`   登录失败: ${user.email}`);
      continue;
    }

    // 获取用户 cookie
    const userCookieResponse = await fetch(`${BASE_URL}/api/auth/current-user`, {
      credentials: 'include',
    });
    const userCookies = userCookieResponse.headers.get('set-cookie');
    const userTokenMatch = userCookies?.match(/token=([^;]+)/);
    const userToken = userTokenMatch ? userTokenMatch[1] : '';

    // 申请成为陪玩
    const applyResult = await fetchWithCookie(
      `${BASE_URL}/api/companions/apply`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: user.name,
          game: game.name,
          rank,
          price,
          description,
        }),
      },
      userToken
    );

    if (applyResult.success) {
      companions.push({
        ...user,
        game: game.name,
        rank,
        price,
        companionId: applyResult.companion?.id,
      });
      console.log(`   ${user.name} 成为 ${game.name} 陪玩 (¥${price}/小时)`);
    } else {
      console.log(`   ${user.name} 申请失败: ${applyResult.error}`);
    }
  }
  console.log(`   共 ${companions.length} 个陪玩\n`);

  // 6. 管理员审核通过所有陪玩
  console.log('5. 审核通过所有陪玩...');
  for (const companion of companions) {
    if (companion.companionId) {
      const approveResult = await fetchWithCookie(
        `${BASE_URL}/api/admin/companions/${companion.companionId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'active' }),
        },
        adminToken
      );

      if (approveResult.companion) {
        console.log(`   审核通过: ${companion.name}`);
      } else {
        console.log(`   审核失败: ${companion.name} - ${approveResult.error}`);
      }
    }
  }
  console.log('');

  // 7. 保存用户信息到文件
  console.log('6. 保存用户信息到 users-list.txt...');
  const fs = require('fs');
  let content = '=== 电竞陪玩平台用户账号 ===\n\n';
  content += '管理员账号:\n';
  content += '  邮箱: admin@example.com\n';
  content += '  密码: 123456\n\n';
  content += '普通用户/陪玩账号:\n\n';

  for (const user of users) {
    const companion = companions.find(c => c.email === user.email);
    content += `${user.name}:\n`;
    content += `  邮箱: ${user.email}\n`;
    content += `  密码: ${user.password}\n`;
    if (companion) {
      content += `  陪玩: ${companion.game} - ${companion.rank} - ¥${companion.price}/小时\n`;
    }
    content += '\n';
  }

  fs.writeFileSync('users-list.txt', content, 'utf8');
  console.log('   用户信息已保存到 users-list.txt\n');

  console.log('=== 设置完成 ===');
}

main().catch(console.error);
