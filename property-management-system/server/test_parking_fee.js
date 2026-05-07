// ===== 车位专项收费模块 API 测试脚本 =====
const http = require('http');

function api(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 3001, path, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('========================================');
  console.log('  车位专项收费模块 API 测试');
  console.log('========================================\n');

  // Step 1: Login
  console.log('--- 1. 登录 ---');
  const login = await api('POST', '/api/auth/login', { phone: '13800000001', password: '13800000001', port: '3000' });
  if (!login.data || !login.data.token) {
    console.log('❌ 登录失败:', login.message || '未知错误');
    process.exit(1);
  }
  const token = login.data.token;
  console.log('✅ 登录成功\n');

  // Step 2: 收费标准规则 CRUD
  console.log('--- 2. 收费标准管理 ---');
  
  // GET rules (empty)
  const r1 = await api('GET', '/api/parking-fee/rules?projectId=1', null, token);
  console.log('  GET /rules:', r1.code, Array.isArray(r1.data) ? `${r1.data.length}条` : '错误');
  
  // POST create rule
  const r2 = await api('POST', '/api/parking-fee/rules', {
    projectId: 1, name: '临时停车（小型车）', vehicleType: 'car', rateType: 'hourly',
    unitPrice: 5, freeMinutes: 30, dailyCap: 30, monthlyPrice: 300, yearlyPrice: 3000,
    description: '30分钟内免费，超过后按5元/小时计费，每日封顶30元',
    status: 'active', sortOrder: 1
  }, token);
  console.log('  POST /rules:', r2.code, r2.data ? `"${r2.data.name}" created id=${r2.data.id}` : '失败');
  
  // POST create another rule
  await api('POST', '/api/parking-fee/rules', {
    projectId: 1, name: '业主月租车收费标准', vehicleType: 'car', rateType: 'monthly',
    unitPrice: 0, freeMinutes: 0, dailyCap: 0, monthlyPrice: 200, yearlyPrice: 2000,
    description: '业主月租车辆，按月收费200元',
    status: 'active', sortOrder: 2
  }, token);
  
  // GET rules (2 items)
  const r3 = await api('GET', '/api/parking-fee/rules?projectId=1', null, token);
  console.log('  GET /rules (after create):', r3.code, Array.isArray(r3.data) ? `${r3.data.length}条` : '错误');
  
  // GET rule by id
  const ruleId = r2.data.id;
  const r4 = await api('GET', `/api/parking-fee/rules/${ruleId}`, null, token);
  console.log(`  GET /rules/${ruleId}:`, r4.code, r4.data ? `"${r4.data.name}"` : '失败');
  
  // PUT update rule
  const r5 = await api('PUT', `/api/parking-fee/rules/${ruleId}`, { unitPrice: 6, dailyCap: 40 }, token);
  console.log(`  PUT /rules/${ruleId}:`, r5.code, r5.data ? `unitPrice=${r5.data.unit_price||r5.data.unitPrice}` : '失败');
  
  // DELETE rule
  const r6 = await api('DELETE', `/api/parking-fee/rules/${ruleId}`, null, token);
  console.log(`  DELETE /rules/${ruleId}:`, r6.code, r6.message || '失败');

  // Step 3: 车辆出入管理
  console.log('\n--- 3. 车辆出入管理 ---');
  
  // Create an entry record directly in DB (since we don't have a create endpoint)
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '123456', database: 'plcct', waitForConnections: true, connectionLimit: 1 });
  
  await pool.execute(
    `INSERT INTO parking_entry_records (project_id, plate_no, vehicle_type, entry_time, entrance, fee, actual_fee, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, '浙A·88888', 'car', '2026-05-07 08:30:00', '北门入口', 0, 0, 'parked']
  );
  await pool.execute(
    `INSERT INTO parking_entry_records (project_id, plate_no, vehicle_type, entry_time, entrance, fee, actual_fee, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, '浙B·12345', 'car', '2026-05-07 09:00:00', '南门入口', 0, 0, 'parked']
  );
  
  // GET entries
  const r7 = await api('GET', '/api/parking-fee/entries?projectId=1', null, token);
  console.log('  GET /entries:', r7.code, r7.data ? `${r7.data.total}条记录` : '失败');
  
  // Process exit for first entry
  const entryId = r7.data.list[0].id;
  const r8 = await api('PUT', `/api/parking-fee/entries/${entryId}/exit`, { payMethod: 'wechat', actualFee: 15, operator: '张三' }, token);
  console.log(`  PUT /entries/${entryId}/exit:`, r8.code, r8.data ? `status=${r8.data.status}, fee=${r8.data.actual_fee||r8.data.actualFee}` : '失败');
  
  // GET entries after exit
  const r9 = await api('GET', '/api/parking-fee/entries?projectId=1', null, token);
  console.log('  GET /entries (after exit):', r9.code, r9.data ? `${r9.data.total}条` : '失败');

  // Step 4: 收费记录 & 统计
  console.log('\n--- 4. 收费记录 & 统计 ---');
  
  const r10 = await api('GET', '/api/parking-fee/charges?projectId=1', null, token);
  console.log('  GET /charges:', r10.code, r10.data ? `${r10.data.total}条` : '失败');
  
  const r11 = await api('GET', '/api/parking-fee/stats?projectId=1', null, token);
  console.log('  GET /stats:', r11.code, r11.data ? `todayIncome=${r11.data.todayIncome}, currentParked=${r11.data.currentParked}` : '失败');
  
  const r12 = await api('GET', '/api/parking-fee/trend?projectId=1&days=7', null, token);
  console.log('  GET /trend:', r12.code, Array.isArray(r12.data) ? `${r12.data.length}天` : '失败');

  // Step 5: 产权车位收费
  console.log('\n--- 5. 产权车位收费 ---');
  
  const r13 = await api('GET', '/api/parking-fee/property?projectId=1', null, token);
  console.log('  GET /property:', r13.code, r13.data ? `${r13.data.total}条` : '失败');
  
  // Try to generate
  const r14 = await api('POST', '/api/parking-fee/property/generate', { projectId: 1, period: '2026-05' }, token);
  console.log('  POST /property/generate:', r14.code, Array.isArray(r14.data) ? `生成了${r14.data.length}条账单` : (r14.message || '失败'));
  
  // GET after generate
  const r15 = await api('GET', '/api/parking-fee/property?projectId=1', null, token);
  console.log('  GET /property (after generate):', r15.code, r15.data ? `${r15.data.total}条` : '失败');
  
  // Pay one if any
  if (r15.data && r15.data.list.length > 0) {
    const payId = r15.data.list[0].id;
    const r16 = await api('PUT', `/api/parking-fee/property/${payId}/pay`, { payMethod: 'wechat' }, token);
    console.log(`  PUT /property/${payId}/pay:`, r16.code, r16.data ? `status=${r16.data.status}` : '失败');
  }

  // Step 6: 月租订阅管理
  console.log('\n--- 6. 月租订阅管理 ---');
  
  // Create subscription
  const r17 = await api('POST', '/api/parking-fee/rental/subscriptions', {
    projectId: 1, plateNo: '浙D·33333', ownerName: '孙七', phone: '13800138001',
    monthlyRent: 300, startDate: '2026-01-01', endDate: '2026-06-30', status: 'active'
  }, token);
  console.log('  POST /rental/subscriptions:', r17.code, r17.data ? `"${r17.data.owner_name||r17.data.ownerName}" created id=${r17.data.id}` : '失败');
  
  // GET subscriptions
  const r18 = await api('GET', '/api/parking-fee/rental/subscriptions?projectId=1', null, token);
  console.log('  GET /rental/subscriptions:', r18.code, r18.data ? `${r18.data.total}条` : '失败');
  
  // Create another
  await api('POST', '/api/parking-fee/rental/subscriptions', {
    projectId: 1, plateNo: '浙E·44444', ownerName: '周八', phone: '13800138002',
    monthlyRent: 250, startDate: '2026-03-01', endDate: '2026-08-31', status: 'active'
  }, token);
  
  const r19 = await api('GET', '/api/parking-fee/rental/subscriptions?projectId=1', null, token);
  console.log('  GET /rental/subscriptions (2):', r19.code, r19.data ? `${r19.data.total}条` : '失败');

  // Step 7: 月租收费管理
  console.log('\n--- 7. 月租收费管理 ---');
  
  // Generate fees
  const r20 = await api('POST', '/api/parking-fee/rental/fees/generate', { projectId: 1, period: '2026-05' }, token);
  console.log('  POST /rental/fees/generate:', r20.code, Array.isArray(r20.data) ? `生成了${r20.data.length}条账单` : (r20.message || '失败'));
  
  // GET fees
  const r21 = await api('GET', '/api/parking-fee/rental/fees?projectId=1', null, token);
  console.log('  GET /rental/fees:', r21.code, r21.data ? `${r21.data.total}条` : '失败');
  
  // Pay one
  if (r21.data && r21.data.list.length > 0) {
    const payId2 = r21.data.list[0].id;
    const r22 = await api('PUT', `/api/parking-fee/rental/fees/${payId2}/pay`, { payMethod: 'alipay' }, token);
    console.log(`  PUT /rental/fees/${payId2}/pay:`, r22.code, r22.data ? `status=${r22.data.status}` : '失败');
  }

  // Step 8: 车位-费用项关联
  console.log('\n--- 8. 车位-费用项关联 ---');
  
  // GET items
  const r23 = await api('GET', '/api/parking-fee/items?projectId=1&page=1&pageSize=10', null, token);
  console.log('  GET /items:', r23.code, r23.data ? `${r23.data.total}条` : '失败');
  
  // Get item map
  const r24 = await api('GET', '/api/parking-fee/items/map?projectId=1', null, token);
  console.log('  GET /items/map:', r24.code, r24.data ? `${Object.keys(r24.data).length}个车位有映射` : '失败');
  
  // Get item ids for parking 1
  const r25 = await api('GET', '/api/parking-fee/items/ids/1', null, token);
  console.log('  GET /items/ids/1:', r25.code, Array.isArray(r25.data) ? `${r25.data.length}个费用项` : '失败');

  await pool.end();
  
  console.log('\n========================================');
  console.log('  ✅ 车位专项收费模块测试完成！');
  console.log('========================================');
}

test().catch(e => {
  console.error('\n❌ 测试异常:', e.message);
  process.exit(1);
});
