const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.companion.findMany({ take: 3 }).then(r => {
  console.log('Companions count:', r.length);
  console.log(JSON.stringify(r, null, 2));
  p.$disconnect();
}).catch(e => {
  console.error(e);
  p.$disconnect();
});
