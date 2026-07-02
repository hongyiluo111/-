const http = require('http');

const data = JSON.stringify({ email: 'test@example.com', password: '123456' });

const options = {
  hostname: 'localhost',
  port: 3456,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
  timeout: 30000,
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Timeout');
  req.destroy();
  process.exit(1);
});

req.write(data);
req.end();
