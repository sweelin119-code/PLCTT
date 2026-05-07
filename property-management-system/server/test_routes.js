const http = require('http');

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 3001, path, method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': data ? Buffer.byteLength(data) : 0 }
    };
    const req = http.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function getWithAuth(path, token) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 3001, path, headers: { 'Authorization': `Bearer ${token}` } };
    http.get(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    }).on('error', reject);
  });
}

function postWithAuth(path, token, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost', port: 3001, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(data) }
    };
    const req = http.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function test() {
  // Login with phone (数据库用户: 13800000001~13800000006, 密码=手机号)
  const login = await api('POST', '/api/auth/login?port=property', { phone: '13800000001', password: '13800000001' });
  console.log('Login:', login.status, login.body.code, login.body.message || '');

  if (login.status !== 200 || login.body.code !== 200) {
    console.log('Trying admin user...');
    const login2 = await api('POST', '/api/auth/login?port=property', { phone: '13000000001', password: '13000000001' });
    console.log('Login2:', login2.status, login2.body.code, login2.body.message || '');
    if (login2.status !== 200 || login2.body.code !== 200) { console.error('All login attempts failed'); return; }
    login.body = login2.body;
  }

  const token = login.body.data && login.body.data.token;
  if (!token) { console.error('No token!', JSON.stringify(login.body).substring(0,200)); return; }
  console.log('Token obtained\n');

  let passed = 0, failed = 0;

  const checkGet = async (name, path) => {
    try {
      const r = await getWithAuth(path, token);
      if (r.status === 200 && r.body && r.body.code === 200) {
        passed++; console.log(`  \u2713 ${name}`);
      } else {
        failed++; console.log(`  \u2717 ${name} - [${r.status}] ${JSON.stringify(r.body).substring(0,100)}`);
      }
    } catch(e) { failed++; console.log(`  \u2717 ${name} - ${e.message}`); }
  };

  const checkPost = async (name, path, body) => {
    try {
      const r = await postWithAuth(path, token, body);
      if (r.status === 200 && r.body && r.body.code === 200) {
        passed++; console.log(`  \u2713 ${name}`);
      } else {
        failed++; console.log(`  \u2717 ${name} - [${r.status}] ${JSON.stringify(r.body).substring(0,100)}`);
      }
    } catch(e) { failed++; console.log(`  \u2717 ${name} - ${e.message}`); }
  };

  // ===== Asset Module =====
  console.log('===== Asset Module =====');
  await checkGet('GET /api/assets/buildings?projectId=1', '/api/assets/buildings?projectId=1');
  await checkGet('GET /api/assets/units', '/api/assets/units');
  await checkGet('GET /api/assets/houses?projectId=1', '/api/assets/houses?projectId=1');
  await checkGet('GET /api/assets/owners?projectId=1', '/api/assets/owners?projectId=1');
  await checkGet('GET /api/assets/parking?projectId=1', '/api/assets/parking?projectId=1');
  await checkGet('GET /api/assets/statistics?projectId=1', '/api/assets/statistics?projectId=1');
  await checkGet('GET /api/assets/building-stats?projectId=1', '/api/assets/building-stats?projectId=1');
  await checkGet('GET /api/assets/owner-accounts?projectId=1', '/api/assets/owner-accounts?projectId=1');
  await checkGet('GET /api/assets/owner-tags?projectId=1', '/api/assets/owner-tags?projectId=1');
  await checkGet('GET /api/assets/sync-logs?projectId=1', '/api/assets/sync-logs?projectId=1');
  await checkGet('GET /api/assets/account-transactions', '/api/assets/account-transactions');
  await checkPost('POST /api/assets/buildings', '/api/assets/buildings', { projectId: 1, name: 'A栋', totalLayers: 18, totalUnits: 2, propertyType: 'residence' });

  // ===== Fee Module =====
  console.log('\n===== Fee Module =====');
  await checkGet('GET /api/fee/items?projectId=1', '/api/fee/items?projectId=1');
  await checkGet('GET /api/fee/rules?projectId=1', '/api/fee/rules?projectId=1');
  await checkGet('GET /api/fee/bills?projectId=1', '/api/fee/bills?projectId=1');
  await checkGet('GET /api/fee/bills/overdue?projectId=1', '/api/fee/bills/overdue?projectId=1');
  await checkGet('GET /api/fee/payments?projectId=1', '/api/fee/payments?projectId=1');
  await checkGet('GET /api/fee/collections?projectId=1', '/api/fee/collections?projectId=1');
  await checkGet('GET /api/fee/collection-templates?projectId=1', '/api/fee/collection-templates?projectId=1');
  await checkGet('GET /api/fee/house-items?projectId=1', '/api/fee/house-items?projectId=1');
  await checkGet('GET /api/fee/statistics?projectId=1', '/api/fee/statistics?projectId=1');
  await checkGet('GET /api/fee/building-summary?projectId=1', '/api/fee/building-summary?projectId=1');
  await checkGet('GET /api/fee/trend?projectId=1&year=2025', '/api/fee/trend?projectId=1&year=2025');
  await checkPost('POST /api/fee/items', '/api/fee/items', { projectId: 1, name: '物业费', category: 'property', unitPrice: 2.5, unit: '元/月' });

  // ===== Access Module =====
  console.log('\n===== Access Module =====');
  await checkGet('GET /api/access/devices', '/api/access/devices');
  await checkGet('GET /api/access/visitor-types', '/api/access/visitor-types');
  await checkGet('GET /api/access/blacklist', '/api/access/blacklist');
  await checkGet('GET /api/access/visitor-ledger', '/api/access/visitor-ledger');
  await checkGet('GET /api/access/visitor-ledger/stats', '/api/access/visitor-ledger/stats');
  await checkGet('GET /api/access/manage/devices', '/api/access/manage/devices');
  await checkGet('GET /api/access/manage/visitor-auth', '/api/access/manage/visitor-auth');
  await checkGet('GET /api/access/manage/records', '/api/access/manage/records');
  await checkGet('GET /api/access/records', '/api/access/records');
  await checkPost('POST /api/access/visitor-types', '/api/access/visitor-types', { projectId: 1, typeName: '快递', description: '快递员' });

  // ===== Daily Module =====
  console.log('\n===== Daily Module =====');
  await checkGet('GET /api/daily/todos', '/api/daily/todos');
  await checkGet('GET /api/daily/todos/stats', '/api/daily/todos/stats');
  await checkGet('GET /api/daily/schedules/templates', '/api/daily/schedules/templates');
  await checkGet('GET /api/daily/schedules/staff', '/api/daily/schedules/staff');
  await checkGet('GET /api/daily/schedules', '/api/daily/schedules');
  await checkGet('GET /api/daily/handovers', '/api/daily/handovers');
  await checkGet('GET /api/daily/announcements', '/api/daily/announcements');
  await checkGet('GET /api/daily/stats?month=2025-01', '/api/daily/stats?month=2025-01');
  await checkGet('GET /api/daily/files', '/api/daily/files');
  await checkGet('GET /api/daily/files/directories', '/api/daily/files/directories');
  await checkPost('POST /api/daily/todos', '/api/daily/todos', { projectId: 1, title: 'test todo', priority: 'high' });
  await checkPost('POST /api/daily/announcements', '/api/daily/announcements', { projectId: 1, title: 'test notice', content: 'test', type: 'notice' });

  console.log(`\n========================================`);
  console.log(`Result: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);
}

test().catch(e => console.error('Error:', e));
