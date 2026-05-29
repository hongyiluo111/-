import mysql from 'mysql2/promise';

async function migrate() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'game',
  });

  console.log('Connected to MySQL');

  const [rows] = await conn.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='game' AND TABLE_NAME='ChatMessage' AND COLUMN_NAME='read'"
  );

  if (rows.length === 0) {
    await conn.execute('ALTER TABLE ChatMessage ADD COLUMN `read` BOOLEAN NOT NULL DEFAULT false');
    console.log('ChatMessage.read column added');
  } else {
    console.log('ChatMessage.read column already exists');
  }

  const [idxRows] = await conn.execute(
    "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='game' AND TABLE_NAME='ChatMessage' AND INDEX_NAME='ChatMessage_receiverId_read_idx'"
  );

  if (idxRows.length === 0) {
    await conn.execute(
      'CREATE INDEX ChatMessage_receiverId_read_idx ON ChatMessage(receiverId, `read`)'
    );
    console.log('Index on ChatMessage(receiverId, read) created');
  } else {
    console.log('Index already exists');
  }

  await conn.end();
  console.log('Migration complete!');
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
