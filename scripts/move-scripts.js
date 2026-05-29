const fs = require('fs');
const path = require('path');

const root = __dirname;
const scripts = [
  'test-db.js', 'write-orders-page.js', 'decode-base64.js',
  'create-test-user.js', 'check-orders.js', 'create-test-orders.js',
  'test-api.js', 'export-users.js'
];

let moved = 0;
scripts.forEach(f => {
  const src = path.join(root, '..', f);
  const dst = path.join(root, f);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dst);
    console.log('Moved: ' + f);
    moved++;
  }
});
console.log(`Done. Moved ${moved} files.`);
