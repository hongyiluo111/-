import mysql from 'mysql2/promise';

async function main() {
  console.log('Creating database...');

  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
  });

  await connection.execute('CREATE DATABASE IF NOT EXISTS game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  console.log('Database "game" created successfully');

  await connection.end();
}

main().catch(console.error);
