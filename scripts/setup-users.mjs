import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcrypt';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not configured');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databaseUrl),
});

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

async function main() {
  console.log('=== 开始设置用户和陪玩 ===\n');

  // 1. 删除所有现有陪玩
  console.log('1. 删除所有现有陪玩...');
  const deletedCompanions = await prisma.companion.deleteMany({});
  console.log(`   已删除 ${deletedCompanions.count} 个陪玩\n`);

  // 2. 删除测试用户（保留管理员）
  console.log('2. 清理测试用户...');
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: { not: 'admin@example.com' },
      role: 'user'
    }
  });
  console.log(`   已删除 ${deletedUsers.count} 个测试用户\n`);

  // 3. 注册10个新用户并创建陪玩
  console.log('3. 注册10个新用户并创建陪玩...');
  const users = [];
  const companions = [];

  for (let i = 0; i < 10; i++) {
    const email = `user${i + 1}@example.com`;
    const password = `Pass${i + 1}23456`;
    const name = names[i];
    const game = games[i];
    const rank = game.ranks[0];
    const price = 30 + Math.floor(Math.random() * 70); // 30-100 元
    const description = descriptions[i];

    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'user',
          status: 'active'
        }
      });

      users.push({ id: user.id, email, password, name });
      console.log(`   注册成功: ${name} (${email})`);

      // 创建陪玩
      const companion = await prisma.companion.create({
        data: {
          userId: user.id,
          name,
          game: game.name,
          rank,
          price,
          description,
          status: 'active'
        }
      });

      companions.push({
        userId: user.id,
        email,
        password,
        name,
        game: game.name,
        rank,
        price,
        companionId: companion.id
      });

      console.log(`   成为陪玩: ${game.name} - ${rank} - ¥${price}/小时`);
    } catch (error) {
      console.log(`   处理 ${email} 失败: ${error.message}`);
    }
  }

  console.log(`\n   共注册 ${users.length} 个用户，${companions.length} 个陪玩\n`);

  // 4. 保存用户信息到文件
  console.log('4. 保存用户信息到 users-list.txt...');
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
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('错误:', error);
  await prisma.$disconnect();
  process.exit(1);
});
