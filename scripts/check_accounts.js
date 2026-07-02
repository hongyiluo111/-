const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:123456@localhost:3306/game?charset=utf8mb4');

  const [check] = await conn.execute("SELECT id, name, email FROM user WHERE email REGEXP '[^[:ascii:]]'");
  console.log('Remaining Chinese emails:', check.length);

  const [admin] = await conn.execute("SELECT name, email, role FROM user WHERE role='admin'");
  console.log('Admin:', JSON.stringify(admin));

  const [comp] = await conn.execute('SELECT u.name, u.email FROM user u JOIN companion c ON u.id=c.userId LIMIT 2');
  console.log('Companions:', JSON.stringify(comp));

  // Get a good normal user
  const [normal] = await conn.execute("SELECT name, email FROM user WHERE name='testuser'");
  console.log('Normal user:', JSON.stringify(normal[0]));

  // Get club user
  const [club] = await conn.execute("SELECT name, email FROM user WHERE name='俱乐部用户' LIMIT 1");
  console.log('Club user:', JSON.stringify(club[0]));

  await conn.end();
}

main().catch(console.error);
