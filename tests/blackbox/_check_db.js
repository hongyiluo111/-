const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection('mysql://root:123456@localhost:3306/game');
  const [d] = await c.execute("DESCRIBE `user`");
  console.log('USER COLS:', d.map(r => r.Field + ':' + r.Type).join(' | '));
  const [r] = await c.execute("SELECT COUNT(*) as cnt FROM `user`");
  console.log('USER COUNT:', r[0].cnt);
  const [rc] = await c.execute("DESCRIBE `rechargeorder`");
  console.log('RECHARGE COLS:', rc.map(r => r.Field + ':' + r.Type).join(' | '));
  await c.end();
})().catch(e => { console.log('ERR', e.message); });
