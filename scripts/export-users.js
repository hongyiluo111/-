const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const fs = require('fs');

const databaseUrl = "mysql://root:123456@localhost:3306/game";
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function exportUsers() {
  try {
    console.log('查询所有用户...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`找到 ${users.length} 个用户`);

    // 创建txt内容
    let content = '电竞陪玩平台 - 用户账号列表\n';
    content += '=' .repeat(60) + '\n';
    content += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`;
    content += `总用户数: ${users.length}\n`;
    content += '=' .repeat(60) + '\n\n';

    users.forEach((user, index) => {
      content += `用户 ${index + 1}:\n`;
      content += `  邮箱: ${user.email}\n`;
      content += `  姓名: ${user.name}\n`;
      content += `  角色: ${user.role === 'admin' ? '管理员' : '普通用户'}\n`;
      content += `  状态: ${user.status === 'active' ? '正常' : '已禁用'}\n`;
      content += `  注册时间: ${user.createdAt.toLocaleString('zh-CN')}\n`;
      content += '-'.repeat(40) + '\n';
    });

    content += '\n\n';
    content += '=' .repeat(60) + '\n';
    content += '说明: 此文件记录所有注册账号信息\n';
    content += '每注册一个新账号，都会自动添加到此文件中\n';
    content += '=' .repeat(60) + '\n';

    // 写入文件
    const filePath = './users-list.txt';
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n用户列表已保存到: ${filePath}`);

    // 显示用户信息
    console.log('\n当前账号列表:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportUsers();
