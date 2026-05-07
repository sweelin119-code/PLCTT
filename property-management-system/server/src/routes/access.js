const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

function buildPagination(page, pageSize) {
  const p = Number(page) || 1;
  const ps = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const offset = (p - 1) * ps;
  return { p, ps, offset };
}

function safeJsonParse(val, defaultVal = []) {
  if (!val) return defaultVal;
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : defaultVal; } catch { return defaultVal; }
}

// =============================================================
//  门禁设备（业主端）
// =============================================================

// GET /api/access/devices - 业主端门禁设备列表
router.get('/devices', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, device_name, device_code, device_type, location, status FROM door_devices WHERE status = 'online' ORDER BY id ASC");
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[access] getDoorDevices error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/access/devices/:id/qrcode - 生成二维码
router.post('/devices/:id/qrcode', authenticate, async (req, res) => {
  try {
    const [device] = await pool.query('SELECT * FROM door_devices WHERE id = ?', [req.params.id]);
    if (device.length === 0) return res.status(404).json({ code: 404, message: '设备不存在' });
    const qrContent = `plcct:access:device=${device[0].device_code}&ts=${Date.now()}`;
    res.json({ code: 200, data: { qrContent, expiresIn: 60 } });
  } catch (err) {
    console.error('[access] generateQRCode error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/access/devices/:id/remote-open - 远程开门
router.post('/devices/:id/remote-open', authenticate, async (req, res) => {
  try {
    const [device] = await pool.query('SELECT * FROM door_devices WHERE id = ?', [req.params.id]);
    if (device.length === 0) return res.status(404).json({ code: 404, message: '设备不存在' });

    // 记录开门记录
    await pool.execute(
      'INSERT INTO access_records (device_id, project_id, access_type, status) VALUES (?, ?, ?, ?)',
      [req.params.id, device[0].project_id, 'remote', 'success']
    );
    res.json({ code: 200, data: { success: true, message: '开门成功' } });
  } catch (err) {
    console.error('[access] remoteOpen error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/access/devices/:id/remote-open-visitor - 访客远程开门
router.post('/devices/:id/remote-open-visitor', authenticate, async (req, res) => {
  try {
    const [device] = await pool.query('SELECT * FROM door_devices WHERE id = ?', [req.params.id]);
    if (device.length === 0) return res.status(404).json({ code: 404, message: '设备不存在' });

    await pool.execute(
      'INSERT INTO access_records (device_id, project_id, access_type, plate_no, status) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, device[0].project_id, 'remote', req.body.plateNo || null, 'success']
    );
    res.json({ code: 200, data: { success: true, message: '开门成功' } });
  } catch (err) {
    console.error('[access] remoteOpenForVisitor error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  临时密码
// =============================================================

// POST /api/access/temp-passwords - 创建临时密码
router.post('/temp-passwords', authenticate, async (req, res) => {
  try {
    const { deviceId, visitorName, visitorPhone, validPeriod, expireTime } = req.body;
    const password = String(Math.floor(100000 + Math.random() * 900000));

    let expire = null;
    if (validPeriod === 'once') {
      expire = new Date(Date.now() + 5 * 60 * 1000); // 5分钟
    } else if (validPeriod === 'day') {
      expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (validPeriod === 'week') {
      expire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (expireTime) {
      expire = new Date(expireTime);
    }

    const [result] = await pool.execute(
      'INSERT INTO temp_passwords (device_id, password, visitor_name, visitor_phone, valid_period, expire_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [deviceId, password, visitorName || null, visitorPhone || null, validPeriod || 'once', expire, 'active']
    );
    res.json({ code: 200, message: '临时密码生成成功', data: { password, expireTime: expire ? expire.toISOString() : null } });
  } catch (err) {
    console.error('[access] createTempPassword error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  访客授权
// =============================================================

// GET /api/access/visitor-auth - 访客授权记录
router.get('/visitor-auth', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM visitor_auth_records ORDER BY created_at DESC');
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[access] getVisitorAuthRecords error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  开门记录
// =============================================================

// GET /api/access/records - 开门记录
router.get('/records', authenticate, async (req, res) => {
  try {
    const { doorId, page, pageSize } = req.query;
    let sql = 'SELECT ar.*, dd.device_name, dd.device_code FROM access_records ar LEFT JOIN door_devices dd ON ar.device_id = dd.id WHERE 1=1';
    const params = [];
    if (doorId) { sql += ' AND ar.device_id = ?'; params.push(doorId); }

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM access_records ar WHERE ' + sql.split('WHERE')[1], params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY ar.access_time DESC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { records: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[access] getAccessRecords error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  设备管理（物业端）
// =============================================================

// GET /api/access/manage/devices - 设备管理列表
router.get('/manage/devices', authenticate, async (req, res) => {
  try {
    const { keyword, type } = req.query;
    let sql = 'SELECT dd.*, b.name AS building_name FROM door_devices dd LEFT JOIN buildings b ON dd.building_id = b.id WHERE 1=1';
    const params = [];
    if (keyword) { sql += ' AND (dd.device_name LIKE ? OR dd.device_code LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
    if (type) { sql += ' AND dd.device_type = ?'; params.push(type); }
    sql += ' ORDER BY dd.id DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[access] getDoorDevicesManage error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/access/manage/devices - 创建设备
router.post('/manage/devices', authenticate, async (req, res) => {
  try {
    const { projectId, deviceName, deviceCode, deviceType, buildingId, unitId, location, ipAddress, port, status } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO door_devices (project_id, device_name, device_code, device_type, building_id, unit_id, location, ip_address, port, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, deviceName, deviceCode, deviceType || 'unit', buildingId || null, unitId || null, location || null, ipAddress || null, port || null, status || 'offline']
    );
    const [rows] = await pool.query('SELECT * FROM door_devices WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[access] createDoorDevice error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/access/manage/devices/:id - 更新设备
router.put('/manage/devices/:id', authenticate, async (req, res) => {
  try {
    const fields = ['device_name', 'device_code', 'device_type', 'building_id', 'unit_id', 'location', 'ip_address', 'port', 'status'];
    const sets = []; const params = [];
    for (const f of fields) {
      const camel = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (req.body[f] !== undefined || req.body[camel] !== undefined) {
        const val = req.body[f] !== undefined ? req.body[f] : req.body[camel];
        sets.push(`\`${f}\` = ?`); params.push(val);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE door_devices SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM door_devices WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] || null });
  } catch (err) {
    console.error('[access] updateDoorDevice error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/access/manage/devices/:id - 删除设备
router.delete('/manage/devices/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM door_devices WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[access] deleteDoorDevice error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  记录管理（物业端）
// =============================================================

// GET /api/access/manage/records - 开门记录管理
router.get('/manage/records', authenticate, async (req, res) => {
  try {
    const { doorId, deviceId, accessType, status, startDate, endDate, page, pageSize } = req.query;
    let sql = 'SELECT ar.*, dd.device_name, dd.device_code FROM access_records ar LEFT JOIN door_devices dd ON ar.device_id = dd.id WHERE 1=1';
    const params = [];
    const did = doorId || deviceId;
    if (did) { sql += ' AND ar.device_id = ?'; params.push(did); }
    if (accessType) { sql += ' AND ar.access_type = ?'; params.push(accessType); }
    if (status) { sql += ' AND ar.status = ?'; params.push(status); }
    if (startDate) { sql += ' AND ar.access_time >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND ar.access_time <= ?'; params.push(endDate + ' 23:59:59'); }

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM access_records ar WHERE ' + sql.split('WHERE')[1], params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY ar.access_time DESC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { records: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[access] getAccessRecordsManage error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/access/manage/visitor-auth - 访客授权审核列表
router.get('/manage/visitor-auth', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM visitor_auth_records WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[access] getVisitorAuthReviews error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/access/manage/visitor-auth/:id - 审核访客授权
router.put('/manage/visitor-auth/:id', authenticate, async (req, res) => {
  try {
    const { status, remark } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ code: 400, message: '审核状态不正确' });
    await pool.execute(
      'UPDATE visitor_auth_records SET status = ?, reviewer = ?, review_remark = ?, review_time = NOW() WHERE id = ?',
      [status, req.user?.username || 'system', remark || null, req.params.id]
    );
    res.json({ code: 200, message: '审核完成' });
  } catch (err) {
    console.error('[access] reviewVisitorAuth error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  访客类型
// =============================================================

// GET /api/access/visitor-types - 访客类型列表
router.get('/visitor-types', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM visitor_types WHERE status = 'active' ORDER BY id ASC");
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[access] getVisitorTypes error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/access/visitor-types - 创建访客类型
router.post('/visitor-types', authenticate, async (req, res) => {
  try {
    const { projectId, typeName, description, status } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO visitor_types (project_id, type_name, description, status) VALUES (?, ?, ?, ?)',
      [projectId, typeName, description || null, status || 'active']
    );
    const [rows] = await pool.query('SELECT * FROM visitor_types WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[access] createVisitorType error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/access/visitor-types/:id - 更新访客类型
router.put('/visitor-types/:id', authenticate, async (req, res) => {
  try {
    const { typeName, description, status } = req.body;
    const sets = []; const params = [];
    if (typeName !== undefined) { sets.push('type_name = ?'); params.push(typeName); }
    if (description !== undefined) { sets.push('description = ?'); params.push(description); }
    if (status !== undefined) { sets.push('status = ?'); params.push(status); }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE visitor_types SET ${sets.join(', ')} WHERE id = ?`, params);
    res.json({ code: 200, message: '更新成功' });
  } catch (err) {
    console.error('[access] updateVisitorType error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/access/visitor-types/:id - 删除访客类型
router.delete('/visitor-types/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM visitor_types WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[access] deleteVisitorType error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  访客台账
// =============================================================

// GET /api/access/visitor-ledger/stats - 访客台账统计（必须在 /:id 之前）
router.get('/visitor-ledger/stats', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    const pId = projectId || 1;
    const today = new Date().toISOString().split('T')[0];

    const [todayVisitors] = await pool.query("SELECT COUNT(*) AS total FROM visitor_ledgers WHERE project_id = ? AND DATE(visit_time) = ?", [pId, today]);
    const [currentVisiting] = await pool.query("SELECT COUNT(*) AS total FROM visitor_ledgers WHERE project_id = ? AND status = 'visiting'", [pId]);
    const [todayLeft] = await pool.query("SELECT COUNT(*) AS total FROM visitor_ledgers WHERE project_id = ? AND DATE(visit_time) = ? AND status = 'left'", [pId, today]);
    const [totalThisMonth] = await pool.query(
      "SELECT COUNT(*) AS total FROM visitor_ledgers WHERE project_id = ? AND YEAR(visit_time) = ? AND MONTH(visit_time) = ?",
      [pId, new Date().getFullYear(), new Date().getMonth() + 1]
    );

    res.json({
      code: 200,
      data: {
        todayVisitors: todayVisitors[0].total,
        currentVisiting: currentVisiting[0].total,
        todayLeft: todayLeft[0].total,
        totalThisMonth: totalThisMonth[0].total,
      }
    });
  } catch (err) {
    console.error('[access] getVisitorLedgerStats error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/access/visitor-ledger - 访客台账列表
router.get('/visitor-ledger', authenticate, async (req, res) => {
  try {
    const { projectId, keyword, status, startDate, endDate, page, pageSize } = req.query;
    let sql = 'SELECT * FROM visitor_ledgers WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    if (keyword) { sql += ' AND (visitor_name LIKE ? OR visitor_phone LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (startDate) { sql += ' AND visit_time >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND visit_time <= ?'; params.push(endDate + ' 23:59:59'); }

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM visitor_ledgers WHERE ' + sql.split('WHERE')[1], params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY visit_time DESC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { list: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[access] getVisitorLedgerList error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/access/visitor-ledger - 登记访客
router.post('/visitor-ledger', authenticate, async (req, res) => {
  try {
    const { projectId, visitorName, visitorPhone, idCard, plateNo, targetHouse, visitReason, visitTime } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO visitor_ledgers (project_id, visitor_name, visitor_phone, id_card, plate_no, target_house, visit_reason, visit_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, visitorName, visitorPhone, idCard || null, plateNo || null, targetHouse, visitReason || null, visitTime || new Date(), 'visiting']
    );
    const [rows] = await pool.query('SELECT * FROM visitor_ledgers WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '登记成功', data: rows[0] });
  } catch (err) {
    console.error('[access] registerVisitor error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/access/visitor-ledger/:id/leave - 标记离开
router.put('/visitor-ledger/:id/leave', authenticate, async (req, res) => {
  try {
    await pool.execute("UPDATE visitor_ledgers SET status = 'left', leave_time = NOW() WHERE id = ?", [req.params.id]);
    res.json({ code: 200, message: '已标记离开' });
  } catch (err) {
    console.error('[access] markVisitorLeft error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  黑名单
// =============================================================

// GET /api/access/blacklist - 黑名单列表
router.get('/blacklist', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM visitor_blacklists ORDER BY created_at DESC');
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[access] getBlacklist error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/access/blacklist - 添加黑名单
router.post('/blacklist', authenticate, async (req, res) => {
  try {
    const { projectId, visitorName, visitorPhone, reason, expireTime } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO visitor_blacklists (project_id, visitor_name, visitor_phone, reason, expire_time) VALUES (?, ?, ?, ?, ?)',
      [projectId || 1, visitorName, visitorPhone, reason, expireTime || null]
    );
    const [rows] = await pool.query('SELECT * FROM visitor_blacklists WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '添加成功', data: rows[0] });
  } catch (err) {
    console.error('[access] addToBlacklist error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/access/blacklist/:id - 移除黑名单
router.delete('/blacklist/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM visitor_blacklists WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '移除成功' });
  } catch (err) {
    console.error('[access] removeFromBlacklist error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
