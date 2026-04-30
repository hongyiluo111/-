const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const databaseUrl = "mysql://root:123456@localhost:3306/game";
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function createTestOrders() {
  try {
    // 先查询用户
    console.log('查询用户...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log(`找到 ${users.length} 个用户:`, users.map(u => u.email));

    if (users.length === 0) {
      console.log('没有用户，无法创建订单');
      return;
    }

    // 查询现有订单
    const existingOrders = await prisma.order.findMany();
    console.log(`\n现有订单数: ${existingOrders.length}`);

    if (existingOrders.length > 0) {
      console.log('已有订单数据，跳过创建');
      return;
    }

    // 创建测试订单
    const testOrders = [
      {
        userId: users[0].id,
        companionId: 'cmo8jw70900002suasnhkt3y5',
        companionName: '测试陪玩',
        companionRank: '钻石',
        companionAvatar: '',
        game: '英雄联盟',
        price: 50.00,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
      {
        userId: users[0].id,
        companionId: 'cmo8jw70900002suasnhkt3y5',
        companionName: '测试陪玩',
        companionRank: '钻石',
        companionAvatar: '',
        game: '王者荣耀',
        price: 30.00,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'alipay',
        completedAt: new Date(),
      },
    ];

    // 如果有多个用户，用第二个用户创建一个订单
    if (users.length > 1) {
      testOrders.push({
        userId: users[1].id,
        companionId: 'cmo8jw70900002suasnhkt3y5',
        companionName: '测试陪玩',
        companionRank: '钻石',
        companionAvatar: '',
        game: '绝地求生',
        price: 40.00,
        status: 'in_progress',
        paymentStatus: 'paid',
        paymentMethod: 'wechat',
      });
    }

    console.log('\n创建测试订单...');
    for (const orderData of testOrders) {
      const order = await prisma.order.create({
        data: orderData
      });
      console.log(`创建订单成功: ${order.id} - ${orderData.game} - ¥${orderData.price}`);
    }

    console.log(`\n成功创建 ${testOrders.length} 条测试订单`);
  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrders();
