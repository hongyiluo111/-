const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcrypt');

const databaseUrl = "mysql://root:123456@localhost:3306/game";
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function testDatabaseConnection() {
  console.log('开始测试数据库连接...');
  
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 测试查询用户
    const userCount = await prisma.user.count();
    console.log(`✅ 当前用户数量: ${userCount}`);
    
    // 测试创建测试用户
    const testEmail = `test${Date.now()}@example.com`;
    const hashedPassword = await bcrypt.hash('test123456', 10);
    
    const newUser = await prisma.user.create({
      data: {
        name: '测试用户',
        email: testEmail,
        password: hashedPassword,
        role: 'user',
        status: 'active'
      }
    });
    
    console.log(`✅ 成功创建测试用户: ${newUser.name} (${newUser.email})`);
    
    // 测试查询用户
    const foundUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (foundUser) {
      console.log(`✅ 成功查询到用户: ${foundUser.name}`);
      
      // 测试密码验证
      const isValid = await bcrypt.compare('test123456', foundUser.password);
      console.log(`✅ 密码验证${isValid ? '成功' : '失败'}`);
    }
    
    // 清理测试用户
    await prisma.user.delete({
      where: { email: testEmail }
    });
    console.log('✅ 成功删除测试用户');
    
    console.log('\n🎉 所有数据库测试通过！');
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();