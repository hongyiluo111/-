const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const databaseUrl = "mysql://root:123456@localhost:3306/game";
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function checkOrders() {
  try {
    console.log('查询所有订单...');
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`找到 ${orders.length} 条订单:`);
    orders.forEach((order, index) => {
      console.log(`\n订单 ${index + 1}:`);
      console.log(`  ID: ${order.id}`);
      console.log(`  用户ID: ${order.userId}`);
      console.log(`  用户邮箱: ${order.user.email}`);
      console.log(`  陪玩: ${order.companionName}`);
      console.log(`  游戏: ${order.game}`);
      console.log(`  价格: ${order.price}`);
      console.log(`  状态: ${order.status}`);
      console.log(`  支付状态: ${order.paymentStatus}`);
      console.log(`  创建时间: ${order.createdAt}`);
    });

    if (orders.length === 0) {
      console.log('\n数据库中没有订单数据');
      console.log('请先创建一些测试订单');
    }
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
