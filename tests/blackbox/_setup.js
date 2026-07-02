// 黑盒测试数据准备：清理残留订单，重置钻石，将陪玩状态改为 active
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

(async () => {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });
  try {
    const USER_ID = 'cmq59o7h8000734ua45n5llcs'; // 罗鸿一

    // 1. 清理残留的测试订单（之前运行可能留下订单消耗了钻石）
    const deletedOrders = await prisma.order.deleteMany({
      where: { userId: USER_ID },
    });
    console.log(`✓ 已清理 ${deletedOrders.count} 条残留订单`);

    // 2. 清理残留的测试评价
    await prisma.review.deleteMany({
      where: { userId: USER_ID },
    });

    // 3. 清理残留的收益记录
    await prisma.earning.deleteMany({
      where: { companionId: 'cmq59o7op000934ua57924in4' },
    });

    // 4. 将小明的陪玩状态改为 active（DB seed 用的 'approved'，但 API 要求 'active'）
    await prisma.companion.update({
      where: { id: 'cmq59o7op000934ua57924in4' }, // 小明
      data: { status: 'active', totalOrders: 0, totalEarnings: 0 },
    });
    console.log('✓ 陪玩小明状态已重置为 active');

    // 5. 给罗鸿一充值 200 钻石（足够支付多个订单）
    const user = await prisma.user.update({
      where: { id: USER_ID },
      data: { diamonds: 200 },
    });
    console.log(`✓ 用户罗鸿一钻石余额: ${user.diamonds}`);

    // 6. 清理测试聊天消息
    await prisma.chatMessage.deleteMany({
      where: { senderId: USER_ID },
    });
    console.log('✓ 已清理罗鸿一的测试聊天消息');

    // 7. 清理罗鸿一在俱乐部的成员记录（用于 join 测试）
    await prisma.clubMember.deleteMany({
      where: { userId: USER_ID },
    });
    console.log('✓ 已清理罗鸿一的俱乐部成员记录');

    console.log('\n测试数据准备完成');
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
