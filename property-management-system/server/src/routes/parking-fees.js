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

// =============================================================
//  停车收费标准管理
// =============================================================

// GET /api/parking-fee/rules - 收费标准列表
router.get('/rules', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT * FROM parking_fee_rules WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY sort_order ASC, id ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[parking-fee] getParkingFeeRules error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/parking-fee/rules/:id - 收费标准详情
router.get('/rules/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM parking_fee_rules WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '收费标准不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] getParkingFeeRuleById error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/parking-fee/rules - 创建收费标准
router.post('/rules', authenticate, async (req, res) => {
  try {
    const { projectId, name, vehicleType, rateType, unitPrice, freeMinutes, dailyCap, monthlyPrice, yearlyPrice, description, status, sortOrder } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO parking_fee_rules (project_id, name, vehicle_type, rate_type, unit_price, free_minutes, daily_cap, monthly_price, yearly_price, description, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, name, vehicleType || 'car', rateType || 'hourly', unitPrice || 0, freeMinutes || 30, dailyCap || 0, monthlyPrice || null, yearlyPrice || null, description || null, status || 'active', sortOrder || 0]
    );
    const [rows] = await pool.query('SELECT * FROM parking_fee_rules WHERE id = ?', [result.insertId]);
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] createParkingFeeRule error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/parking-fee/rules/:id - 更新收费标准
router.put('/rules/:id', authenticate, async (req, res) => {
  try {
    const fields = ['name', 'vehicle_type', 'rate_type', 'unit_price', 'free_minutes', 'daily_cap', 'monthly_price', 'yearly_price', 'description', 'status', 'sort_order'];
    const sets = []; const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) { sets.push(`${f} = ?`); params.push(req.body[f]); }
    }
    // Handle camelCase versions
    const camelMap = { vehicleType: 'vehicle_type', rateType: 'rate_type', unitPrice: 'unit_price', freeMinutes: 'free_minutes', dailyCap: 'daily_cap', monthlyPrice: 'monthly_price', yearlyPrice: 'yearly_price', sortOrder: 'sort_order' };
    for (const [cam, db] of Object.entries(camelMap)) {
      if (req.body[cam] !== undefined && !fields.some(f => req.body[f] !== undefined)) {
        sets.push(`${db} = ?`); params.push(req.body[cam]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '没有需要更新的字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE parking_fee_rules SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM parking_fee_rules WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '收费标准不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] updateParkingFeeRule error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/parking-fee/rules/:id - 删除收费标准
router.delete('/rules/:id', authenticate, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM parking_fee_rules WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '收费标准不存在' });
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[parking-fee] deleteParkingFeeRule error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  车辆出入管理
// =============================================================

// GET /api/parking-fee/entries - 车辆出入记录
router.get('/entries', authenticate, async (req, res) => {
  try {
    const { projectId, keyword, status, startDate, endDate } = req.query;
    const { p, ps, offset } = buildPagination(req.query.page, req.query.pageSize);
    let sql = 'SELECT * FROM parking_entry_records WHERE project_id = ?';
    const params = [projectId];
    if (keyword) { sql += ' AND plate_no LIKE ?'; params.push(`%${keyword}%`); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (startDate) { sql += ' AND entry_time >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND entry_time <= ?'; params.push(endDate + ' 23:59:59'); }
    
    const [countResult] = await pool.query(sql.replace('SELECT *', 'SELECT COUNT(*) AS total'), params);
    const total = countResult[0].total;
    
    sql += ' ORDER BY entry_time DESC LIMIT ? OFFSET ?';
    params.push(ps, offset);
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: { list: rows, total } });
  } catch (err) {
    console.error('[parking-fee] getParkingEntryRecords error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/parking-fee/entries/:id/exit - 车辆出场收费
router.put('/entries/:id/exit', authenticate, async (req, res) => {
  try {
    const { payMethod, actualFee, operator } = req.body;
    const [rows] = await pool.query('SELECT * FROM parking_entry_records WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '入场记录不存在' });
    
    const record = rows[0];
    if (record.status !== 'parked') return res.status(400).json({ code: 400, message: '该车辆已出场' });
    
    const now = new Date();
    const exitTime = now.toISOString().replace('T', ' ').substring(0, 19);
    
    // 计算停留时长
    const entryDate = new Date(record.entry_time);
    const diffMs = now.getTime() - entryDate.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
    const duration = `${diffHours}小时${diffMinutes}分钟`;
    const durationMinutes = Math.floor(diffMs / 60000);
    
    const newStatus = Number(actualFee) > 0 ? 'exited' : 'free';
    
    await pool.execute(
      'UPDATE parking_entry_records SET exit_time = ?, exit_entrance = ?, duration = ?, actual_fee = ?, status = ?, pay_method = ?, pay_time = ?, operator = ? WHERE id = ?',
      [exitTime, '北门出口', duration, actualFee || 0, newStatus, payMethod || 'free', exitTime, operator || '', req.params.id]
    );
    
    // 同步添加收费记录
    await pool.execute(
      'INSERT INTO parking_charge_records (project_id, entry_record_id, plate_no, vehicle_type, entry_time, exit_time, duration, duration_minutes, fee, actual_fee, pay_method, pay_time, operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [record.project_id, record.id, record.plate_no, record.vehicle_type, record.entry_time, exitTime, duration, durationMinutes, record.fee || 0, actualFee || 0, payMethod || 'free', exitTime, operator || '']
    );
    
    const [updated] = await pool.query('SELECT * FROM parking_entry_records WHERE id = ?', [req.params.id]);
    res.json({ code: 200, data: updated[0] });
  } catch (err) {
    console.error('[parking-fee] processParkingExit error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  收费记录
// =============================================================

// GET /api/parking-fee/charges - 收费记录
router.get('/charges', authenticate, async (req, res) => {
  try {
    const { projectId, keyword, startDate, endDate, payMethod } = req.query;
    const { p, ps, offset } = buildPagination(req.query.page, req.query.pageSize);
    let sql = 'SELECT * FROM parking_charge_records WHERE project_id = ?';
    const params = [projectId];
    if (keyword) { sql += ' AND plate_no LIKE ?'; params.push(`%${keyword}%`); }
    if (startDate) { sql += ' AND pay_time >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND pay_time <= ?'; params.push(endDate + ' 23:59:59'); }
    if (payMethod) { sql += ' AND pay_method = ?'; params.push(payMethod); }
    
    const [countResult] = await pool.query(sql.replace('SELECT *', 'SELECT COUNT(*) AS total'), params);
    const total = countResult[0].total;
    
    sql += ' ORDER BY pay_time DESC LIMIT ? OFFSET ?';
    params.push(ps, offset);
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: { list: rows, total } });
  } catch (err) {
    console.error('[parking-fee] getParkingChargeRecords error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  收费统计 & 趋势
// =============================================================

// GET /api/parking-fee/stats - 收费统计
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    const today = new Date().toISOString().substring(0, 10);
    const thisMonth = today.substring(0, 7);
    const thisYear = today.substring(0, 4);
    
    // 今日收费
    const [todayResult] = await pool.query(
      'SELECT COALESCE(SUM(actual_fee),0) AS income, COUNT(*) AS cnt FROM parking_charge_records WHERE project_id = ? AND DATE(pay_time) = ?',
      [projectId, today]
    );
    // 本月收费
    const [monthResult] = await pool.query(
      'SELECT COALESCE(SUM(actual_fee),0) AS income, COUNT(*) AS cnt FROM parking_charge_records WHERE project_id = ? AND DATE_FORMAT(pay_time,?) = ?',
      [projectId, '%Y-%m', thisMonth]
    );
    // 本年收费
    const [yearResult] = await pool.query(
      'SELECT COALESCE(SUM(actual_fee),0) AS income, COUNT(*) AS cnt FROM parking_charge_records WHERE project_id = ? AND YEAR(pay_time) = ?',
      [projectId, thisYear]
    );
    // 累计
    const [totalResult] = await pool.query(
      'SELECT COALESCE(SUM(actual_fee),0) AS income FROM parking_charge_records WHERE project_id = ?',
      [projectId]
    );
    // 当前在场车辆
    const [parkedResult] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM parking_entry_records WHERE project_id = ? AND status = ?',
      [projectId, 'parked']
    );
    // 月租订阅数量
    const [subResult] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM rental_parking_subscriptions WHERE project_id = ? AND status = ?',
      [projectId, 'active']
    );
    // 产权车位本月数量
    const [propertyCountResult] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM property_parking_fees WHERE project_id = ? AND period = ?',
      [projectId, thisMonth]
    );
    // 产权车位待收
    const [propertyPendingResult] = await pool.query(
      "SELECT COALESCE(SUM(management_fee),0) AS total FROM property_parking_fees WHERE project_id = ? AND period = ? AND status = 'pending'",
      [projectId, thisMonth]
    );
    // 月租待收
    const [rentalPendingResult] = await pool.query(
      "SELECT COALESCE(SUM(monthly_rent),0) AS total FROM rental_parking_fees WHERE project_id = ? AND period = ? AND status = 'pending'",
      [projectId, thisMonth]
    );
    
    res.json({
      code: 200,
      data: {
        todayIncome: Number(todayResult[0].income),
        monthIncome: Number(monthResult[0].income),
        yearIncome: Number(yearResult[0].income),
        totalIncome: Number(totalResult[0].income),
        todayCount: Number(todayResult[0].cnt),
        monthCount: Number(monthResult[0].cnt),
        currentParked: Number(parkedResult[0].cnt),
        monthlySubscribers: Number(subResult[0].cnt),
        propertyParkingCount: Number(propertyCountResult[0].cnt),
        rentalSubscriberCount: Number(subResult[0].cnt),
        propertyFeePending: Number(propertyPendingResult[0].total),
        rentalFeePending: Number(rentalPendingResult[0].total),
      }
    });
  } catch (err) {
    console.error('[parking-fee] getParkingFeeStats error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/parking-fee/trend - 收费趋势
router.get('/trend', authenticate, async (req, res) => {
  try {
    const { projectId, days } = req.query;
    const numDays = Math.min(Math.max(Number(days) || 7, 1), 365);
    const result = [];
    const today = new Date();
    
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      
      const [rows] = await pool.query(
        'SELECT COALESCE(SUM(actual_fee),0) AS amount, COUNT(*) AS cnt FROM parking_charge_records WHERE project_id = ? AND DATE(pay_time) = ?',
        [projectId, dateStr]
      );
      result.push({
        date: dateStr.substring(5),
        amount: Number(rows[0].amount),
        count: Number(rows[0].cnt),
      });
    }
    res.json({ code: 200, data: result });
  } catch (err) {
    console.error('[parking-fee] getParkingFeeTrend error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  产权车位收费管理
// =============================================================

// GET /api/parking-fee/property - 产权车位收费列表
router.get('/property', authenticate, async (req, res) => {
  try {
    const { projectId, keyword, status, period } = req.query;
    const { p, ps, offset } = buildPagination(req.query.page, req.query.pageSize);
    let sql = 'SELECT * FROM property_parking_fees WHERE project_id = ?';
    const params = [projectId];
    if (keyword) {
      sql += ' AND (owner_name LIKE ? OR parking_code LIKE ? OR house_full_name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (period) { sql += ' AND period = ?'; params.push(period); }
    
    const [countResult] = await pool.query(sql.replace('SELECT *', 'SELECT COUNT(*) AS total'), params);
    const total = countResult[0].total;
    
    sql += ' ORDER BY period DESC, parking_code ASC LIMIT ? OFFSET ?';
    params.push(ps, offset);
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: { list: rows, total } });
  } catch (err) {
    console.error('[parking-fee] getPropertyParkingFees error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/parking-fee/property/generate - 生成产权车位管理费账单
router.post('/property/generate', authenticate, async (req, res) => {
  try {
    const { projectId, period } = req.body;
    if (!projectId || !period) return res.status(400).json({ code: 400, message: '缺少参数' });
    
    // 检查是否已存在该账期账单
    const [existing] = await pool.query('SELECT COUNT(*) AS cnt FROM property_parking_fees WHERE project_id = ? AND period = ?', [projectId, period]);
    if (existing[0].cnt > 0) {
      return res.json({ code: 200, data: [], message: '该账期账单已存在' });
    }
    
    // 查询产权车位列表（固定车位且产权类型为 sale）
    const [parkingSpaces] = await pool.query(
      `SELECT ps.id, ps.code, ps.owner_id, ps.project_id, o.name AS owner_name,
              CONCAT(b.name, h.full_name) AS house_full_name,
              NULL AS plate_no
       FROM parking_spaces ps
       LEFT JOIN owners o ON o.id = ps.owner_id
       LEFT JOIN houses h ON h.id = ps.house_id
       LEFT JOIN buildings b ON b.id = h.building_id
       WHERE ps.project_id = ? AND ps.property_type = 'sale' AND ps.enabled = 1`,
      [projectId]
    );
    
    // 获取车位管理费标准（fee_items 中 category = 'parking_fee'）
    const [feeItems] = await pool.query(
      "SELECT id, unit_price FROM fee_items WHERE project_id = ? AND category = 'parking_fee' AND enabled = 1 LIMIT 1",
      [projectId]
    );
    const defaultFee = feeItems.length > 0 ? Number(feeItems[0].unit_price) : 80;
    
    const newRecords = [];
    for (const space of parkingSpaces) {
      await pool.execute(
        'INSERT INTO property_parking_fees (project_id, parking_space_id, parking_code, owner_name, house_full_name, plate_no, management_fee, period, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [projectId, space.id, space.code, space.owner_name || '未知', space.house_full_name || '', space.plate_no || null, defaultFee, period, 'pending']
      );
      newRecords.push({
        projectId, parkingSpaceId: space.id, parkingCode: space.code,
        ownerName: space.owner_name || '未知', houseFullName: space.house_full_name || '',
        plateNo: space.plate_no, managementFee: defaultFee, period, status: 'pending'
      });
    }
    
    res.json({ code: 200, data: newRecords });
  } catch (err) {
    console.error('[parking-fee] generatePropertyParkingFees error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/parking-fee/property/:id/pay - 产权车位缴费
router.put('/property/:id/pay', authenticate, async (req, res) => {
  try {
    const { payMethod } = req.body;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const [result] = await pool.execute(
      'UPDATE property_parking_fees SET status = ?, paid_at = ?, pay_method = ? WHERE id = ? AND status = ?',
      ['paid', now, payMethod || 'cash', req.params.id, 'pending']
    );
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '记录不存在或已缴费' });
    const [rows] = await pool.query('SELECT * FROM property_parking_fees WHERE id = ?', [req.params.id]);
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] payPropertyParkingFee error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  月租订阅管理
// =============================================================

// GET /api/parking-fee/rental/subscriptions - 月租订阅列表
router.get('/rental/subscriptions', authenticate, async (req, res) => {
  try {
    const { projectId, keyword, status } = req.query;
    const { p, ps, offset } = buildPagination(req.query.page, req.query.pageSize);
    let sql = 'SELECT * FROM rental_parking_subscriptions WHERE project_id = ?';
    const params = [projectId];
    if (keyword) {
      sql += ' AND (plate_no LIKE ? OR owner_name LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    
    const [countResult] = await pool.query(sql.replace('SELECT *', 'SELECT COUNT(*) AS total'), params);
    const total = countResult[0].total;
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(ps, offset);
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: { list: rows, total } });
  } catch (err) {
    console.error('[parking-fee] getRentalSubscriptions error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/parking-fee/rental/subscriptions - 创建月租订阅
router.post('/rental/subscriptions', authenticate, async (req, res) => {
  try {
    const { projectId, parkingSpaceId, parkingCode, plateNo, ownerName, phone, monthlyRent, startDate, endDate, status, remark } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO rental_parking_subscriptions (project_id, parking_space_id, parking_code, plate_no, owner_name, phone, monthly_rent, start_date, end_date, status, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, parkingSpaceId || null, parkingCode || null, plateNo, ownerName, phone, monthlyRent || 0, startDate, endDate, status || 'active', remark || null]
    );
    const [rows] = await pool.query('SELECT * FROM rental_parking_subscriptions WHERE id = ?', [result.insertId]);
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] createRentalSubscription error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/parking-fee/rental/subscriptions/:id - 更新月租订阅
router.put('/rental/subscriptions/:id', authenticate, async (req, res) => {
  try {
    const fields = ['parking_space_id', 'parking_code', 'plate_no', 'owner_name', 'phone', 'monthly_rent', 'start_date', 'end_date', 'status', 'remark'];
    const sets = []; const params = [];
    const camelMap = { parkingSpaceId: 'parking_space_id', parkingCode: 'parking_code', plateNo: 'plate_no', ownerName: 'owner_name', monthlyRent: 'monthly_rent', startDate: 'start_date', endDate: 'end_date' };
    for (const f of fields) {
      if (req.body[f] !== undefined) { sets.push(`${f} = ?`); params.push(req.body[f]); }
    }
    for (const [cam, db] of Object.entries(camelMap)) {
      if (req.body[cam] !== undefined && !fields.some(f => req.body[f] !== undefined)) {
        sets.push(`${db} = ?`); params.push(req.body[cam]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '没有需要更新的字段' });
    params.push(req.params.id);
    const [result] = await pool.execute(`UPDATE rental_parking_subscriptions SET ${sets.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '订阅不存在' });
    const [rows] = await pool.query('SELECT * FROM rental_parking_subscriptions WHERE id = ?', [req.params.id]);
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] updateRentalSubscription error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/parking-fee/rental/subscriptions/:id - 删除月租订阅
router.delete('/rental/subscriptions/:id', authenticate, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM rental_parking_subscriptions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '订阅不存在' });
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[parking-fee] deleteRentalSubscription error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  月租收费管理
// =============================================================

// GET /api/parking-fee/rental/fees - 月租收费记录
router.get('/rental/fees', authenticate, async (req, res) => {
  try {
    const { projectId, keyword, status, period } = req.query;
    const { p, ps, offset } = buildPagination(req.query.page, req.query.pageSize);
    let sql = 'SELECT * FROM rental_parking_fees WHERE project_id = ?';
    const params = [projectId];
    if (keyword) {
      sql += ' AND (owner_name LIKE ? OR plate_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (period) { sql += ' AND period = ?'; params.push(period); }
    
    const [countResult] = await pool.query(sql.replace('SELECT *', 'SELECT COUNT(*) AS total'), params);
    const total = countResult[0].total;
    
    sql += ' ORDER BY period DESC, id ASC LIMIT ? OFFSET ?';
    params.push(ps, offset);
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: { list: rows, total } });
  } catch (err) {
    console.error('[parking-fee] getRentalParkingFees error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/parking-fee/rental/fees/generate - 生成月租车位账单
router.post('/rental/fees/generate', authenticate, async (req, res) => {
  try {
    const { projectId, period } = req.body;
    if (!projectId || !period) return res.status(400).json({ code: 400, message: '缺少参数' });
    
    // 检查是否已存在该账期账单
    const [existing] = await pool.query('SELECT COUNT(*) AS cnt FROM rental_parking_fees WHERE project_id = ? AND period = ?', [projectId, period]);
    if (existing[0].cnt > 0) {
      return res.json({ code: 200, data: [], message: '该账期账单已存在' });
    }
    
    // 查询活跃订阅
    const [activeSubs] = await pool.query(
      "SELECT * FROM rental_parking_subscriptions WHERE project_id = ? AND status = 'active'",
      [projectId]
    );
    
    const newRecords = [];
    for (const sub of activeSubs) {
      await pool.execute(
        'INSERT INTO rental_parking_fees (project_id, subscription_id, plate_no, owner_name, monthly_rent, period, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [projectId, sub.id, sub.plate_no, sub.owner_name, sub.monthly_rent, period, 'pending']
      );
      newRecords.push({
        projectId, subscriptionId: sub.id, plateNo: sub.plate_no,
        ownerName: sub.owner_name, monthlyRent: Number(sub.monthly_rent), period, status: 'pending'
      });
    }
    
    res.json({ code: 200, data: newRecords });
  } catch (err) {
    console.error('[parking-fee] generateRentalParkingFees error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/parking-fee/rental/fees/:id/pay - 月租缴费
router.put('/rental/fees/:id/pay', authenticate, async (req, res) => {
  try {
    const { payMethod } = req.body;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const [result] = await pool.execute(
      'UPDATE rental_parking_fees SET status = ?, paid_at = ?, pay_method = ? WHERE id = ? AND status = ?',
      ['paid', now, payMethod || 'cash', req.params.id, 'pending']
    );
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '记录不存在或已缴费' });
    const [rows] = await pool.query('SELECT * FROM rental_parking_fees WHERE id = ?', [req.params.id]);
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] payRentalParkingFee error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  车位-费用项关联管理
// =============================================================

// GET /api/parking-fee/items - 车位-费用项关联列表
router.get('/items', authenticate, async (req, res) => {
  try {
    const { projectId, parkingType, feeItemId, keyword } = req.query;
    const { p, ps, offset } = buildPagination(req.query.page, req.query.pageSize);
    let sql = `SELECT pfi.*, ps.code AS parking_code, ps.type AS parking_type, fi.name AS fee_item_name, fi.category AS fee_item_category
               FROM parking_fee_items pfi
               LEFT JOIN parking_spaces ps ON ps.id = pfi.parking_id
               LEFT JOIN fee_items fi ON fi.id = pfi.fee_item_id
               WHERE pfi.project_id = ?`;
    const params = [projectId];
    if (parkingType) { sql += ' AND ps.type = ?'; params.push(parkingType); }
    if (feeItemId) { sql += ' AND pfi.fee_item_id = ?'; params.push(feeItemId); }
    if (keyword) {
      sql += ' AND (ps.code LIKE ? OR fi.name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    let countSql = 'SELECT COUNT(*) AS total FROM parking_fee_items pfi LEFT JOIN parking_spaces ps ON ps.id = pfi.parking_id';
    countSql += ' LEFT JOIN fee_items fi ON fi.id = pfi.fee_item_id WHERE pfi.project_id = ?';
    const countParams = [projectId];
    if (parkingType) { countSql += ' AND ps.type = ?'; countParams.push(parkingType); }
    if (feeItemId) { countSql += ' AND pfi.fee_item_id = ?'; countParams.push(feeItemId); }
    if (keyword) { countSql += ' AND (ps.code LIKE ? OR fi.name LIKE ?)'; countParams.push(`%${keyword}%`, `%${keyword}%`); }
    const [countResult] = await pool.query(countSql, countParams);
    const total = countResult[0].total;
    
    sql += ' ORDER BY pfi.id ASC LIMIT ? OFFSET ?';
    params.push(ps, offset);
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: { list: rows, total } });
  } catch (err) {
    console.error('[parking-fee] getParkingFeeItems error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/parking-fee/items/ids/:parkingId - 获取车位已关联费用项ID列表
router.get('/items/ids/:parkingId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT fee_item_id FROM parking_fee_items WHERE parking_id = ? AND enabled = 1',
      [req.params.parkingId]
    );
    res.json({ code: 200, data: rows.map(r => r.fee_item_id) });
  } catch (err) {
    console.error('[parking-fee] getParkingFeeItemIds error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/parking-fee/items/map - 批量获取车位-费用项关联映射
router.get('/items/map', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    const [rows] = await pool.query(
      'SELECT parking_id, fee_item_id FROM parking_fee_items WHERE project_id = ? AND enabled = 1',
      [projectId]
    );
    const map = {};
    for (const r of rows) {
      if (!map[r.parking_id]) map[r.parking_id] = [];
      map[r.parking_id].push(r.fee_item_id);
    }
    res.json({ code: 200, data: map });
  } catch (err) {
    console.error('[parking-fee] getParkingFeeItemMap error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/parking-fee/items - 创建车位-费用项关联
router.post('/items', authenticate, async (req, res) => {
  try {
    const { projectId, parkingId, feeItemId, customPrice, enabled } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO parking_fee_items (project_id, parking_id, fee_item_id, custom_price, enabled) VALUES (?, ?, ?, ?, ?)',
      [projectId, parkingId, feeItemId, customPrice || null, enabled !== undefined ? enabled : 1]
    );
    const [rows] = await pool.query(
      `SELECT pfi.*, ps.code AS parking_code, ps.type AS parking_type, fi.name AS fee_item_name, fi.category AS fee_item_category
       FROM parking_fee_items pfi
       LEFT JOIN parking_spaces ps ON ps.id = pfi.parking_id
       LEFT JOIN fee_items fi ON fi.id = pfi.fee_item_id
       WHERE pfi.id = ?`,
      [result.insertId]
    );
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] createParkingFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/parking-fee/items/batch - 批量创建车位-费用项关联
router.post('/items/batch', authenticate, async (req, res) => {
  try {
    const { dataList } = req.body;
    if (!dataList || !Array.isArray(dataList) || dataList.length === 0) {
      return res.status(400).json({ code: 400, message: '请提供关联数据' });
    }
    const createdIds = [];
    for (const data of dataList) {
      const [result] = await pool.execute(
        'INSERT INTO parking_fee_items (project_id, parking_id, fee_item_id, custom_price, enabled) VALUES (?, ?, ?, ?, ?)',
        [data.projectId, data.parkingId, data.feeItemId, data.customPrice || null, data.enabled !== undefined ? data.enabled : 1]
      );
      createdIds.push(result.insertId);
    }
    if (createdIds.length === 0) return res.json({ code: 200, data: [] });
    
    const placeholders = createdIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT pfi.*, ps.code AS parking_code, ps.type AS parking_type, fi.name AS fee_item_name, fi.category AS fee_item_category
       FROM parking_fee_items pfi
       LEFT JOIN parking_spaces ps ON ps.id = pfi.parking_id
       LEFT JOIN fee_items fi ON fi.id = pfi.fee_item_id
       WHERE pfi.id IN (${placeholders})`,
      createdIds
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[parking-fee] batchCreateParkingFeeItems error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/parking-fee/items/:id - 更新车位-费用项关联
router.put('/items/:id', authenticate, async (req, res) => {
  try {
    const fields = ['custom_price', 'enabled'];
    const sets = []; const params = [];
    const camelMap = { customPrice: 'custom_price' };
    for (const f of fields) {
      if (req.body[f] !== undefined) { sets.push(`${f} = ?`); params.push(req.body[f]); }
    }
    for (const [cam, db] of Object.entries(camelMap)) {
      if (req.body[cam] !== undefined && !fields.some(f => req.body[f] !== undefined)) {
        sets.push(`${db} = ?`); params.push(req.body[cam]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '没有需要更新的字段' });
    params.push(req.params.id);
    const [result] = await pool.execute(`UPDATE parking_fee_items SET ${sets.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '关联不存在' });
    
    const [rows] = await pool.query(
      `SELECT pfi.*, ps.code AS parking_code, ps.type AS parking_type, fi.name AS fee_item_name, fi.category AS fee_item_category
       FROM parking_fee_items pfi
       LEFT JOIN parking_spaces ps ON ps.id = pfi.parking_id
       LEFT JOIN fee_items fi ON fi.id = pfi.fee_item_id
       WHERE pfi.id = ?`,
      [req.params.id]
    );
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[parking-fee] updateParkingFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/parking-fee/items/:id - 删除车位-费用项关联
router.delete('/items/:id', authenticate, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM parking_fee_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '关联不存在' });
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[parking-fee] deleteParkingFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/parking-fee/items/import - 导入车位-费用项关联
router.post('/items/import', authenticate, async (req, res) => {
  try {
    const { projectId, rows: importRows } = req.body;
    if (!projectId || !importRows || !Array.isArray(importRows)) {
      return res.status(400).json({ code: 400, message: '参数错误' });
    }
    
    const result = { success: 0, failed: 0, errors: [] };
    
    // 获取车位列表
    const [parkingSpaces] = await pool.query('SELECT id, code, type FROM parking_spaces WHERE project_id = ?', [projectId]);
    const parkingMap = {};
    for (const ps of parkingSpaces) parkingMap[ps.id] = ps;
    
    // 获取费用项列表
    const [feeItems] = await pool.query('SELECT id, name, category FROM fee_items WHERE project_id = ?', [projectId]);
    const feeItemMap = {};
    for (const fi of feeItems) feeItemMap[fi.id] = fi;
    
    for (let i = 0; i < importRows.length; i++) {
      const row = importRows[i];
      const rowNum = i + 1;
      
      const parking = parkingMap[row.parkingId];
      if (!parking) {
        result.failed++;
        result.errors.push({ row: rowNum, message: `车位ID ${row.parkingId} 不存在` });
        continue;
      }
      
      const feeItem = feeItemMap[row.feeItemId];
      if (!feeItem) {
        result.failed++;
        result.errors.push({ row: rowNum, message: `费用项ID ${row.feeItemId} 不存在` });
        continue;
      }
      
      // 检查是否已存在相同关联
      const [exists] = await pool.query(
        'SELECT COUNT(*) AS cnt FROM parking_fee_items WHERE parking_id = ? AND fee_item_id = ?',
        [row.parkingId, row.feeItemId]
      );
      if (exists[0].cnt > 0) {
        result.failed++;
        result.errors.push({ row: rowNum, message: `车位"${parking.code}"已关联费用项"${feeItem.name}"` });
        continue;
      }
      
      await pool.execute(
        'INSERT INTO parking_fee_items (project_id, parking_id, fee_item_id, custom_price, enabled) VALUES (?, ?, ?, ?, ?)',
        [projectId, row.parkingId, row.feeItemId, row.customPrice || null, 1]
      );
      result.success++;
    }
    
    res.json({ code: 200, data: result });
  } catch (err) {
    console.error('[parking-fee] importParkingFeeItems error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
