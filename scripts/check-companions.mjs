import mariadb from 'mariadb';

async function main() {
  const conn = await mariadb.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'game',
    charset: 'utf8mb4',
    allowPublicKeyRetrieval: true,
  });

  const rows = await conn.query('SELECT COUNT(*) as total FROM Companion');
  console.log('Total companions:', rows[0].total);

  const activeRows = await conn.query("SELECT COUNT(*) as total FROM Companion WHERE status = 'active'");
  console.log('Active companions:', activeRows[0].total);

  const sample = await conn.query('SELECT id, name, status FROM Companion LIMIT 3');
  console.log('Sample:', JSON.stringify(sample, null, 2));

  await conn.end();
}

main().catch(e => { console.error(e); process.exit(1); });
