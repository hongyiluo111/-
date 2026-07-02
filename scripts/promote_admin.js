const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:123456@localhost:3306/game?charset=utf8mb4');

  // Promote one user to admin
  await conn.execute("UPDATE user SET role = 'admin' WHERE email = '管理员测试_1780623815895@test.com'");
  console.log('Promoted 管理员测试 to admin');

  // Verify
  const [admins] = await conn.execute("SELECT name, email, role FROM user WHERE role = 'admin'");
  console.log('Admins:', JSON.stringify(admins));

  // Check companion users
  const [companions] = await conn.execute(
    "SELECT u.name, u.email, c.name as companionName FROM user u JOIN companion c ON u.id = c.userId LIMIT 2"
  );
  console.log('Companions:', JSON.stringify(companions));

  await conn.end();
}

main().catch(console.error);
