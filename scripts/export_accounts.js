const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const conn = await mysql.createConnection('mysql://root:123456@localhost:3306/game?charset=utf8mb4');
  const [rows] = await conn.execute('SELECT id, name, email, role, status, diamonds, createdAt FROM user ORDER BY createdAt ASC');
  const [companions] = await conn.execute('SELECT userId, name, status FROM companion');
  await conn.end();

  const companionMap = {};
  for (const c of companions) {
    companionMap[c.userId] = c;
  }

  const lines = [];
  lines.push('========================================');
  lines.push('  电竞陪玩平台 - 全部账号列表');
  lines.push('  导出时间: ' + new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  lines.push('  总账号数: ' + rows.length);
  lines.push('========================================');
  lines.push('');
  lines.push('所有测试账号密码统一为: Test123456');
  lines.push('');

  const highlight = [
    { label: '普通用户', email: 'test@example.com' },
    { label: '陪玩（接单陪玩）', email: 'user_1780623816688@test.com' },
    { label: '管理员', email: 'user_1780623815895@test.com' },
    { label: '俱乐部用户', email: 'user_1780623825550@test.com' },
  ];

  lines.push('*** 四端测试账号（优先使用） ***');
  lines.push('');
  for (const h of highlight) {
    const u = h.email
      ? rows.find(r => r.email === h.email)
      : rows.find(r => r.name === h.name);
    if (!u) continue;
    const roleStr = u.role === 'admin' ? '管理员' : (companionMap[u.id] ? '陪玩' : '普通用户');
    lines.push('【' + h.label + '】');
    lines.push('  用户名: ' + u.name);
    lines.push('  邮箱: ' + u.email);
    lines.push('  密码: Test123456');
    lines.push('  角色: ' + roleStr);
    lines.push('');
  }
  lines.push('----------------------------------------');
  lines.push('');

  let idx = 0;
  for (const u of rows) {
    idx++;
    const created = new Date(u.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    const roleStr = u.role === 'admin' ? '管理员' : (companionMap[u.id] ? '陪玩' : '普通用户');
    lines.push('--- #' + idx + ' ---');
    lines.push('用户名: ' + u.name);
    lines.push('邮箱: ' + u.email);
    lines.push('密码: Test123456');
    lines.push('角色: ' + roleStr);
    lines.push('状态: ' + u.status);
    lines.push('钻石: ' + u.diamonds);
    lines.push('注册时间: ' + created);
    lines.push('');
  }

  lines.push('========================================');
  lines.push('  说明');
  lines.push('========================================');
  lines.push('1. 总计 ' + rows.length + ' 个账号');
  lines.push('2. 统一密码为 Test123456');
  lines.push('3. 管理员仅 1 个（管理员测试），其余均为普通用户或陪玩');
  lines.push('');

  const outDir = path.join(__dirname, '..', 'accounts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'textlist.txt'), lines.join('\r\n'), 'utf8');
  console.log('Done. Wrote ' + rows.length + ' accounts to accounts/textlist.txt');
}

main().catch(console.error);
