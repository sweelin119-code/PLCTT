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

function camelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// =============================================================
//  收费项目
// =============================================================

// GET /api/fee/items - 收费项目列表
router.get('/items', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT * FROM fee_items WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY sort_order ASC, id ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[fee] getFeeItems error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/fee/items/:id - 收费项目详情
router.get('/items/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fee_items WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '收费项目不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[fee] getFeeItemById error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/items - 创建收费项目
router.post('/items', authenticate, async (req, res) => {
  try {
    const { projectId, name, category, unit, unitPrice, chargeType, remark, sortOrder, enabled } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO fee_items (project_id, name, category, unit, unit_price, charge_type, remark, sort_order, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, name, category || 'property', unit || '元/月', unitPrice || 0, chargeType || 'fixed', remark || null, sortOrder || 0, enabled !== undefined ? enabled : 1]
    );
    const [rows] = await pool.query('SELECT * FROM fee_items WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[fee] createFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/fee/items/:id - 更新收费项目
router.put('/items/:id', authenticate, async (req, res) => {
  try {
    const fields = ['name', 'category', 'unit', 'unit_price', 'charge_type', 'remark', 'sort_order', 'enabled'];
    const sets = []; const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined || req.body[camelCase(f)] !== undefined) {
        const val = req.body[f] !== undefined ? req.body[f] : req.body[camelCase(f)];
        sets.push(`\`${f}\` = ?`); params.push(val);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE fee_items SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM fee_items WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] || null });
  } catch (err) {
    console.error('[fee] updateFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/fee/items/:id - 删除收费项目
router.delete('/items/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM fee_items WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[fee] deleteFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  计费规则
// =============================================================

// GET /api/fee/rules - 计费规则列表
router.get('/rules', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT cr.*, fi.name AS fee_item_name FROM charge_rules cr LEFT JOIN fee_items fi ON cr.fee_item_id = fi.id WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND cr.project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY cr.id DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[fee] getChargeRules error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/rules - 创建计费规则
router.post('/rules', authenticate, async (req, res) => {
  try {
    const { projectId, feeItemId, name, chargeCycle, dueDays, overdueRate, overdueDays, startDate, endDate, enabled, remark } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO charge_rules (project_id, fee_item_id, name, charge_cycle, due_days, overdue_rate, overdue_days, start_date, end_date, enabled, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, feeItemId, name, chargeCycle || 'monthly', dueDays || 0, overdueRate || null, overdueDays || null, startDate || null, endDate || null, enabled !== undefined ? enabled : 1, remark || null]
    );
    const [rows] = await pool.query('SELECT cr.*, fi.name AS fee_item_name FROM charge_rules cr LEFT JOIN fee_items fi ON cr.fee_item_id = fi.id WHERE cr.id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[fee] createChargeRule error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/fee/rules/:id - 更新计费规则
router.put('/rules/:id', authenticate, async (req, res) => {
  try {
    const fields = ['fee_item_id', 'name', 'charge_cycle', 'due_days', 'overdue_rate', 'overdue_days', 'start_date', 'end_date', 'enabled', 'remark'];
    const sets = []; const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined || req.body[camelCase(f)] !== undefined) {
        const val = req.body[f] !== undefined ? req.body[f] : req.body[camelCase(f)];
        sets.push(`\`${f}\` = ?`); params.push(val);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE charge_rules SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT cr.*, fi.name AS fee_item_name FROM charge_rules cr LEFT JOIN fee_items fi ON cr.fee_item_id = fi.id WHERE cr.id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] || null });
  } catch (err) {
    console.error('[fee] updateChargeRule error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/fee/rules/:id - 删除计费规则
router.delete('/rules/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM charge_rules WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[fee] deleteChargeRule error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  账单管理
// =============================================================

// GET /api/fee/bills - 账单列表（分页）
router.get('/bills', authenticate, async (req, res) => {
  try {
    const { projectId, houseId, status, periodYear, periodMonth, keyword, page, pageSize } = req.query;
    let sql = 'SELECT b.*, fi.name AS fee_item_name, h.full_name AS house_name FROM bills b LEFT JOIN fee_items fi ON b.fee_item_id = fi.id LEFT JOIN houses h ON b.house_id = h.id WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND b.project_id = ?'; params.push(projectId); }
    if (houseId) { sql += ' AND b.house_id = ?'; params.push(houseId); }
    if (status) { sql += ' AND b.status = ?'; params.push(status); }
    if (periodYear) { sql += ' AND b.period_year = ?'; params.push(periodYear); }
    if (periodMonth) { sql += ' AND b.period_month = ?'; params.push(periodMonth); }
    if (keyword) { sql += ' AND (b.bill_no LIKE ? OR h.full_name LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

    const countSql = 'SELECT COUNT(*) AS total FROM bills b LEFT JOIN houses h ON b.house_id = h.id WHERE ' + sql.split('WHERE')[1];
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY b.id DESC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { list: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[fee] getBills error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/fee/bills/overdue - 逾期账单（必须在 /:id 之前）
router.get('/bills/overdue', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = "SELECT b.*, fi.name AS fee_item_name, h.full_name AS house_name FROM bills b LEFT JOIN fee_items fi ON b.fee_item_id = fi.id LEFT JOIN houses h ON b.house_id = h.id WHERE b.status IN ('pending','partial') AND b.due_date < CURDATE()";
    const params = [];
    if (projectId) { sql += ' AND b.project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY b.due_date ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[fee] getOverdueBills error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/fee/bills/generate - 生成账单窗口（必须在 /:id 之前）
router.post('/bills/generate', authenticate, async (req, res) => {
  try {
    const { houseIds, feeItemId, periodYear, periodMonth, amount } = req.body;
    if (!houseIds || !feeItemId || !periodYear || !periodMonth) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    const [feeItem] = await pool.query('SELECT * FROM fee_items WHERE id = ?', [feeItemId]);
    if (feeItem.length === 0) return res.status(404).json({ code: 404, message: '收费项目不存在' });

    const created = [];
    for (const houseId of houseIds) {
      const billNo = `BILL${periodYear}${String(periodMonth).padStart(2, '0')}${Date.now()}${Math.floor(Math.random() * 100)}`;
      const finalAmount = amount || feeItem[0].unit_price;
      const [exist] = await pool.query(
        'SELECT id FROM bills WHERE house_id = ? AND fee_item_id = ? AND period_year = ? AND period_month = ?',
        [houseId, feeItemId, periodYear, periodMonth]
      );
      if (exist.length > 0) continue;

      const [house] = await pool.query('SELECT project_id FROM houses WHERE id = ?', [houseId]);
      if (house.length === 0) continue;

      const [r] = await pool.execute(
        'INSERT INTO bills (project_id, house_id, fee_item_id, bill_no, period_year, period_month, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [house[0].project_id, houseId, feeItemId, billNo, periodYear, periodMonth, finalAmount, 'pending']
      );
      created.push({ id: r.insertId, billNo });
    }
    res.json({ code: 200, message: `生成 ${created.length} 条账单`, data: created });
  } catch (err) {
    console.error('[fee] generateBills error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/bills/auto-generate - 自动生成账单
router.post('/bills/auto-generate', authenticate, async (req, res) => {
  try {
    const { projectId, periodYear, periodMonth } = req.body;
    if (!projectId || !periodYear || !periodMonth) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }

    // 获取所有启用的收费项目
    const [items] = await pool.query('SELECT * FROM fee_items WHERE project_id = ? AND enabled = 1', [projectId]);
    // 获取所有房屋及其关联的收费项目
    const [houses] = await pool.query(
      'SELECT h.id, h.house_id AS hf_house_id, hf.fee_item_id, hf.custom_price FROM houses h LEFT JOIN house_fee_items hf ON h.id = hf.house_id WHERE h.project_id = ? AND h.enabled = 1',
      [projectId]
    );

    const created = [];
    for (const item of items) {
      for (const house of houses) {
        // 如果房屋有关联项目，使用它；否则使用全部项目
        if (house.fee_item_id && house.fee_item_id !== item.id) continue;

        const [exist] = await pool.query(
          'SELECT id FROM bills WHERE house_id = ? AND fee_item_id = ? AND period_year = ? AND period_month = ?',
          [house.id, item.id, periodYear, periodMonth]
        );
        if (exist.length > 0) continue;

        const price = house.custom_price || item.unit_price;
        const billNo = `BILL${periodYear}${String(periodMonth).padStart(2, '0')}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await pool.execute(
          'INSERT INTO bills (project_id, house_id, fee_item_id, bill_no, period_year, period_month, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [projectId, house.id, item.id, billNo, periodYear, periodMonth, price, 'pending']
        );
        created.push({ houseId: house.id, feeItem: item.name, amount: price });
      }
    }

    res.json({ code: 200, message: `自动生成 ${created.length} 条账单`, data: { total: created.length, bills: created } });
  } catch (err) {
    console.error('[fee] autoGenerateBills error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/fee/bills/:id - 账单详情
router.get('/bills/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT b.*, fi.name AS fee_item_name, h.full_name AS house_name FROM bills b LEFT JOIN fee_items fi ON b.fee_item_id = fi.id LEFT JOIN houses h ON b.house_id = h.id WHERE b.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '账单不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[fee] getBillById error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/fee/bills/:id/adjust - 调整账单金额
router.put('/bills/:id/adjust', authenticate, async (req, res) => {
  try {
    const { adjustedAmount, remark } = req.body;
    await pool.execute('UPDATE bills SET adjusted_amount = ?, remark = ? WHERE id = ?', [adjustedAmount || 0, remark || null, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM bills WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '调整成功', data: rows[0] || null });
  } catch (err) {
    console.error('[fee] adjustBill error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/fee/bills/:id/cancel - 取消账单
router.put('/bills/:id/cancel', authenticate, async (req, res) => {
  try {
    await pool.execute("UPDATE bills SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    res.json({ code: 200, message: '取消成功' });
  } catch (err) {
    console.error('[fee] cancelBill error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  缴费记录
// =============================================================

// GET /api/fee/payments - 缴费记录列表
router.get('/payments', authenticate, async (req, res) => {
  try {
    const { projectId, billId, page, pageSize } = req.query;
    let sql = 'SELECT pr.*, b.bill_no, b.amount AS bill_amount, h.full_name AS house_name FROM payment_records pr LEFT JOIN bills b ON pr.bill_id = b.id LEFT JOIN houses h ON b.house_id = h.id WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND pr.project_id = ?'; params.push(projectId); }
    if (billId) { sql += ' AND pr.bill_id = ?'; params.push(billId); }

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM payment_records pr WHERE ' + sql.split('WHERE')[1], params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY pr.id DESC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { list: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[fee] getPayments error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/payments/offline - 线下缴费
router.post('/payments/offline', authenticate, async (req, res) => {
  try {
    const { billIds, amount, payMethod, operator, remark } = req.body;
    if (!billIds || billIds.length === 0) return res.status(400).json({ code: 400, message: '请选择账单' });

    const created = [];
    for (const billId of billIds) {
      const [bill] = await pool.query('SELECT * FROM bills WHERE id = ?', [billId]);
      if (bill.length === 0) continue;

      const b = bill[0];
      const paidSoFar = Number(b.paid_amount) + Number(amount);
      const billAmount = Number(b.adjusted_amount || b.amount);
      const newStatus = paidSoFar >= billAmount ? 'paid' : 'partial';

      await pool.execute('UPDATE bills SET paid_amount = ?, status = ?, paid_time = NOW() WHERE id = ?', [paidSoFar, newStatus, billId]);

      const [r] = await pool.execute(
        'INSERT INTO payment_records (bill_id, project_id, amount, pay_method, operator, remark) VALUES (?, ?, ?, ?, ?, ?)',
        [billId, b.project_id, amount, payMethod || 'cash', operator || req.user?.username || 'system', remark || null]
      );
      created.push({ id: r.insertId, billId, amount });
    }

    res.json({ code: 200, message: `缴费成功，处理 ${created.length} 条记录`, data: created });
  } catch (err) {
    console.error('[fee] createOfflinePayment error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  催缴记录
// =============================================================

// GET /api/fee/collections - 催缴记录列表
router.get('/collections', authenticate, async (req, res) => {
  try {
    const { projectId, page, pageSize } = req.query;
    let sql = 'SELECT cr.*, b.bill_no FROM collection_records cr LEFT JOIN bills b ON cr.bill_id = b.id WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND cr.project_id = ?'; params.push(projectId); }

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM collection_records cr WHERE ' + sql.split('WHERE')[1], params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY cr.id DESC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { list: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[fee] getCollections error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/collections - 发起催缴
router.post('/collections', authenticate, async (req, res) => {
  try {
    const { billId, projectId, collectionType, operator, result } = req.body;
    const [r] = await pool.execute(
      'INSERT INTO collection_records (bill_id, project_id, collection_type, operator, result) VALUES (?, ?, ?, ?, ?)',
      [billId, projectId, collectionType || 'sms', operator || req.user?.username || 'system', result || null]
    );
    const [rows] = await pool.query('SELECT * FROM collection_records WHERE id = ?', [r.insertId]);
    res.json({ code: 200, message: '催缴已发送', data: rows[0] });
  } catch (err) {
    console.error('[fee] sendCollection error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  催缴模板
// =============================================================

// GET /api/fee/collection-templates - 催缴模板列表
router.get('/collection-templates', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT * FROM collection_templates WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY id DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[fee] getCollectionTemplates error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/collection-templates - 创建催缴模板
router.post('/collection-templates', authenticate, async (req, res) => {
  try {
    const { projectId, name, type, content, enabled } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO collection_templates (project_id, name, type, content, enabled) VALUES (?, ?, ?, ?, ?)',
      [projectId, name, type || 'sms', content || '', enabled !== undefined ? enabled : 1]
    );
    const [rows] = await pool.query('SELECT * FROM collection_templates WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[fee] saveCollectionTemplate error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  房屋收费项目关联
// =============================================================

// GET /api/fee/house-items - 房屋收费项目关联列表
router.get('/house-items', authenticate, async (req, res) => {
  try {
    const { houseId, projectId, page, pageSize } = req.query;
    let sql = 'SELECT hfi.*, fi.name AS fee_item_name, fi.category, fi.unit_price, h.full_name AS house_name FROM house_fee_items hfi LEFT JOIN fee_items fi ON hfi.fee_item_id = fi.id LEFT JOIN houses h ON hfi.house_id = h.id WHERE 1=1';
    const params = [];
    if (houseId) { sql += ' AND hfi.house_id = ?'; params.push(houseId); }
    if (projectId) { sql += ' AND h.project_id = ?'; params.push(projectId); }

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM house_fee_items hfi LEFT JOIN houses h ON hfi.house_id = h.id WHERE ' + sql.split('WHERE')[1], params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY hfi.id DESC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { list: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[fee] getHouseFeeItems error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/fee/house-items/ids/:houseId - 获取房屋关联的项目ID列表
router.get('/house-items/ids/:houseId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT fee_item_id FROM house_fee_items WHERE house_id = ? AND enabled = 1', [req.params.houseId]);
    const ids = rows.map(r => r.fee_item_id);
    res.json({ code: 200, data: ids });
  } catch (err) {
    console.error('[fee] getHouseFeeItemIds error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/fee/house-items/map - 获取项目ID到房屋ID的映射
router.get('/house-items/map', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT hfi.house_id, hfi.fee_item_id FROM house_fee_items hfi LEFT JOIN houses h ON hfi.house_id = h.id WHERE hfi.enabled = 1';
    const params = [];
    if (projectId) { sql += ' AND h.project_id = ?'; params.push(projectId); }
    const [rows] = await pool.query(sql, params);

    const map = {};
    rows.forEach(r => {
      if (!map[r.house_id]) map[r.house_id] = [];
      map[r.house_id].push(r.fee_item_id);
    });
    res.json({ code: 200, data: map });
  } catch (err) {
    console.error('[fee] getHouseFeeItemMap error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/house-items - 创建关联
router.post('/house-items', authenticate, async (req, res) => {
  try {
    const { houseId, feeItemId, customPrice, enabled } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO house_fee_items (house_id, fee_item_id, custom_price, enabled) VALUES (?, ?, ?, ?)',
      [houseId, feeItemId, customPrice || null, enabled !== undefined ? enabled : 1]
    );
    const [rows] = await pool.query(
      'SELECT hfi.*, fi.name AS fee_item_name FROM house_fee_items hfi LEFT JOIN fee_items fi ON hfi.fee_item_id = fi.id WHERE hfi.id = ?',
      [result.insertId]
    );
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[fee] createHouseFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/house-items/batch - 批量创建关联
router.post('/house-items/batch', authenticate, async (req, res) => {
  try {
    const { dataList } = req.body;
    if (!dataList || !Array.isArray(dataList)) return res.status(400).json({ code: 400, message: '数据格式错误' });
    const created = [];
    for (const item of dataList) {
      const [r] = await pool.execute(
        'INSERT INTO house_fee_items (house_id, fee_item_id, custom_price, enabled) VALUES (?, ?, ?, ?)',
        [item.houseId, item.feeItemId, item.customPrice || null, item.enabled !== undefined ? item.enabled : 1]
      );
      created.push({ id: r.insertId, houseId: item.houseId, feeItemId: item.feeItemId });
    }
    res.json({ code: 200, message: `批量创建 ${created.length} 条`, data: created });
  } catch (err) {
    console.error('[fee] batchCreateHouseFeeItems error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/fee/house-items/import - 导入关联
router.post('/house-items/import', authenticate, async (req, res) => {
  try {
    const { projectId, rows } = req.body;
    if (!rows || !Array.isArray(rows)) return res.status(400).json({ code: 400, message: '数据格式错误' });
    let success = 0; let fail = 0;
    for (const row of rows) {
      try {
        await pool.execute(
          'INSERT INTO house_fee_items (house_id, fee_item_id, custom_price) VALUES (?, ?, ?)',
          [row.houseId, row.feeItemId, row.customPrice || null]
        );
        success++;
      } catch { fail++; }
    }
    res.json({ code: 200, message: `导入完成：成功 ${success}，失败 ${fail}`, data: { success, fail } });
  } catch (err) {
    console.error('[fee] importHouseFeeItems error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/fee/house-items/:id - 更新关联
router.put('/house-items/:id', authenticate, async (req, res) => {
  try {
    const { customPrice, enabled } = req.body;
    const sets = []; const params = [];
    if (customPrice !== undefined) { sets.push('custom_price = ?'); params.push(customPrice); }
    if (enabled !== undefined) { sets.push('enabled = ?'); params.push(enabled); }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE house_fee_items SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM house_fee_items WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] || null });
  } catch (err) {
    console.error('[fee] updateHouseFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/fee/house-items/:id - 删除关联
router.delete('/house-items/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM house_fee_items WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[fee] deleteHouseFeeItem error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  统计
// =============================================================

// GET /api/fee/statistics - 收费统计总览
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ code: 400, message: '缺少项目ID' });

    const [totalBills] = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS amount FROM bills WHERE project_id = ?', [projectId]);
    const [paidBills] = await pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(paid_amount),0) AS amount FROM bills WHERE project_id = ? AND status = 'paid'", [projectId]);
    const [pendingBills] = await pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS amount FROM bills WHERE project_id = ? AND status IN ('pending','partial')", [projectId]);
    const [overdueBills] = await pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS amount FROM bills WHERE project_id = ? AND status IN ('pending','partial') AND due_date < CURDATE()", [projectId]);

    const total = Number(totalBills[0].amount);
    const paid = Number(paidBills[0].amount);

    res.json({
      code: 200,
      data: {
        totalBills: totalBills[0].total,
        totalAmount: total,
        paidBills: paidBills[0].total,
        paidAmount: paid,
        pendingBills: pendingBills[0].total,
        pendingAmount: Number(pendingBills[0].amount),
        overdueBills: overdueBills[0].total,
        overdueAmount: Number(overdueBills[0].amount),
        collectionRate: total > 0 ? Number((paid / total * 100).toFixed(1)) : 0,
      }
    });
  } catch (err) {
    console.error('[fee] getFeeStatistics error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/fee/building-summary - 按楼栋汇总
router.get('/building-summary', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ code: 400, message: '缺少项目ID' });

    const [rows] = await pool.query(
      `SELECT b.id, b.name,
              COUNT(DISTINCT h.id) AS total_houses,
              COUNT(DISTINCT bl.id) AS total_bills,
              COALESCE(SUM(bl.amount),0) AS total_amount,
              COALESCE(SUM(bl.paid_amount),0) AS paid_amount
       FROM buildings b
       LEFT JOIN houses h ON h.building_id = b.id AND h.project_id = ?
       LEFT JOIN bills bl ON bl.house_id = h.id
       WHERE b.project_id = ?
       GROUP BY b.id ORDER BY b.sort_order ASC`,
      [projectId, projectId]
    );

    const data = rows.map(r => ({
      ...r,
      collectionRate: Number(r.total_amount) > 0 ? Number((Number(r.paid_amount) / Number(r.total_amount) * 100).toFixed(1)) : 0,
    }));
    res.json({ code: 200, data });
  } catch (err) {
    console.error('[fee] getBuildingFeeSummary error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/fee/trend - 收费趋势
router.get('/trend', authenticate, async (req, res) => {
  try {
    const { projectId, year } = req.query;
    const y = year || new Date().getFullYear();
    const [rows] = await pool.query(
      `SELECT period_month AS month, COUNT(*) AS count, COALESCE(SUM(paid_amount),0) AS amount
       FROM bills WHERE project_id = ? AND period_year = ? AND status = 'paid'
       GROUP BY period_month ORDER BY period_month ASC`,
      [projectId, y]
    );
    const data = [];
    for (let m = 1; m <= 12; m++) {
      const found = rows.find(r => r.month === m);
      data.push({ month: m, count: found ? found.count : 0, amount: found ? Number(found.amount) : 0 });
    }
    res.json({ code: 200, data });
  } catch (err) {
    console.error('[fee] getFeeTrend error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
