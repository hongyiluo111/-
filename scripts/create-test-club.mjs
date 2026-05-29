import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcrypt';
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

async function main() {
  console.log('=== 创建俱乐部测试数据 ===\n');

  // 0. 清理可能存在的旧数据
  console.log('0. 清理旧数据...');
  const existingClub = await prisma.club.findUnique({ where: { name: 'XX电竞俱乐部' } });
  if (existingClub) {
    await prisma.clubMember.deleteMany({ where: { clubId: existingClub.id } });
    await prisma.club.delete({ where: { id: existingClub.id } });
  }
  const existingEmails = ['xxesports@example.com', 'xxclub_wang@example.com', 'xxclub_li@example.com', 'xxclub_zhang@example.com', 'xxclub_chen@example.com'];
  await prisma.companion.deleteMany({ where: { user: { email: { in: existingEmails } } } });
  await prisma.user.deleteMany({ where: { email: { in: existingEmails } } });
  console.log('   ✅ 旧数据清理完成');

  // 1. 创建俱乐部账号
  console.log('1. 创建俱乐部账号...');
  const clubUser = await prisma.user.create({
    data: {
      name: 'XX电竞',
      email: 'xxesports@example.com',
      password: await bcrypt.hash('Club123456', 10),
      role: 'user',
      status: 'active',
      avatar: null,
      bio: '专业电竞俱乐部，提供高质量陪玩服务'
    }
  });
  console.log(`   ✅ 俱乐部账号创建成功: ${clubUser.name} (${clubUser.email})`);

  // 2. 创建俱乐部
  console.log('\n2. 创建俱乐部...');
  const club = await prisma.club.create({
    data: {
      name: 'XX电竞俱乐部',
      description: 'XX电竞是一家专业电竞俱乐部，专注于王者荣耀、英雄联盟等游戏的陪玩服务。我们的陪玩师都经过严格筛选，技术过硬，服务态度好。',
      gameId: '王者荣耀',
      ownerId: clubUser.id,
      memberCount: 1,
      status: 'active'
    }
  });
  console.log(`   ✅ 俱乐部创建成功: ${club.name}`);

  // 3. 创建俱乐部成员（陪玩）
  console.log('\n3. 创建俱乐部成员...');
  const members = [
    { name: 'XX小王', email: 'xxclub_wang@example.com', game: '王者荣耀', rank: '王者', price: 88, description: '王者荣耀国服最强王者，擅长中单和打野' },
    { name: 'XX小李', email: 'xxclub_li@example.com', game: '英雄联盟', rank: '钻石', price: 75, description: '英雄联盟钻石段位，擅长ADC和辅助' },
    { name: 'XX小张', email: 'xxclub_zhang@example.com', game: '和平精英', rank: '王牌', price: 82, description: '和平精英王牌段位，刚枪王，带妹神器' },
    { name: 'XX小陈', email: 'xxclub_chen@example.com', game: '无畏契约', rank: '超凡', price: 79, description: '无畏契约超凡段位，战术指挥型选手' }
  ];

  for (const member of members) {
    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: member.name,
        email: member.email,
        password: await bcrypt.hash('Pass123456', 10),
        role: 'user',
        status: 'active'
      }
    });

    // 创建陪玩资料
    const companion = await prisma.companion.create({
      data: {
        userId: user.id,
        name: member.name,
        game: member.game,
        rank: member.rank,
        price: member.price,
        description: member.description,
        status: 'active',
        rating: 4.5 + Math.random() * 0.5,
        ratingCount: Math.floor(Math.random() * 50) + 10,
        totalOrders: Math.floor(Math.random() * 100) + 20
      }
    });

    // 添加为俱乐部成员
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        userId: user.id,
        role: 'member'
      }
    });

    console.log(`   ✅ 成员创建成功: ${member.name} (${member.game} - ${member.rank} - ¥${member.price}/小时)`);
  }

  // 更新俱乐部成员数
  await prisma.club.update({
    where: { id: club.id },
    data: { memberCount: members.length + 1 }
  });

  console.log('\n=== 创建完成 ===');
  console.log(`俱乐部: ${club.name}`);
  console.log(`成员数: ${members.length + 1} (含部长)`);
  console.log('\n俱乐部账号:');
  console.log(`  邮箱: ${clubUser.email}`);
  console.log(`  密码: Club123456`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('错误:', error);
  await prisma.$disconnect();
  process.exit(1);
});