const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:123456@localhost:3306/game?charset=utf8mb4');

  // Find all accounts with non-ASCII in email
  const [rows] = await conn.execute("SELECT id, name, email FROM user WHERE email REGEXP '[^[:ascii:]]'");
  console.log('Chinese-email accounts:', rows.length);
  for (const r of rows) {
    console.log(r.name, '|', r.email);
  }

  // Generate replacement emails
  let counter = 1;
  for (const r of rows) {
    // Replace Chinese chars + timestamp pattern with a clean form
    // e.g. "集成用户a_1780623809196@test.com" -> "user_1780623809196@test.com"
    let newEmail;
    const atIdx = r.email.indexOf('@');
    const localPart = r.email.substring(0, atIdx);
    const domain = r.email.substring(atIdx);

    // Extract trailing digits (timestamp)
    const tsMatch = localPart.match(/(\d+)$/);
    const ts = tsMatch ? tsMatch[1] : String(counter).padStart(4, '0');

    // Build a clean prefix from the name
    const cleanName = r.name.replace(/[^a-zA-Z0-9]/g, '');
    const prefix = cleanName || 'user';

    newEmail = prefix.toLowerCase() + '_' + ts + domain;

    // Ensure uniqueness by appending counter if needed
    const [existing] = await conn.execute('SELECT id FROM user WHERE email = ?', [newEmail]);
    if (existing.length > 0 && existing[0].id !== r.id) {
      newEmail = prefix.toLowerCase() + '_' + ts + '_' + counter + domain;
    }

    console.log('  ' + r.email + ' -> ' + newEmail);
    await conn.execute('UPDATE user SET email = ? WHERE id = ?', [newEmail, r.id]);
    counter++;
  }

  console.log('\nDone. Updated', rows.length, 'accounts.');
  await conn.end();
}

main().catch(console.error);
