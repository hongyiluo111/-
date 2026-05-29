fetch('http://localhost:3001/api/admin/orders', {
  headers: {
    'Cookie': 'token=' + getCookie('token')
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(e => console.error(e));

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
