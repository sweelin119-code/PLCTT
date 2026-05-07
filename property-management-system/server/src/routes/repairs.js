const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取报修工单列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { keyword, repairType, status, urgency, propertyCompanyId, page = 1, pageSize = 20 } = req.query;
    let sql = 'SELECT * FROM repair_orders WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM repair_orders WHERE 1=1';
    const params = [];
    const countParams = [];

    if (keyword) {
      const kw = `%${keyword}%`;
      sql += ' AND (order_no LIKE ? OR owner_name LIKE ? OR owner_phone LIKE ? OR owner_address LIKE ?)';
      params.push(kw, kw, kw, kw);
      countSql += ' AND (order_no LIKE ? OR owner_name LIKE ? OR owner_phone LIKE ? OR owner_address LIKE ?)';
      countParams.push(kw, kw, kw, kw);
    }
    if (repairType) {
      sql += ' AND repair_type = ?';
      params.push(repairType);
      countSql += ' AND repair_type = ?';
      countParams.push(repairType);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    if (urgency) {
      sql += ' AND urgency = ?';
      params.push(urgency);
      countSql += ' AND urgency = ?';
      countParams.push(urgency);
    }
    if (propertyCompanyId) {
      sql += ' AND property_company_id = ?';
      params.push(parseInt(propertyCompanyId));
      countSql += ' AND property_company_id = ?';
      countParams.push(parseInt(propertyCompanyId));
    }

    const [countResult] = await pool.execute(countSql, countParams);
    const total = countResult[0].total;

    // 分页查询 - 使用模板字符串嵌入 LIMIT/OFFSET，避免 execute 预处理参数问题
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 20;
    const offset = (p - 1) * ps;
    sql += ` ORDER BY create_time DESC LIMIT ${ps} OFFSET ${offset}`;

    const [orders] = await pool.query(sql, params);

    const result = orders.map(o => ({
      ...o,
      images: o.images ? JSON.parse(o.images) : [],
    }));

    res.json({ code: 200, data: { list: result, total, page: parseInt(page), pageSize: parseInt(pageSize) } });
  } catch (error) {
    console.error('[获取报修工单列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取报修统计
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const { propertyCompanyId } = req.query;
    let sql = 'SELECT status, COUNT(*) as count FROM repair_orders WHERE 1=1';
    const params = [];

    if (propertyCompanyId) {
      sql += ' AND property_company_id = ?';
      params.push(parseInt(propertyCompanyId));
    }
    sql += ' GROUP BY status';

    const [statusStats] = await pool.execute(sql, params);

    // 类型统计
    let typeSql = 'SELECT repair_type, COUNT(*) as count FROM repair_orders WHERE 1=1';
    const typeParams = [];
    if (propertyCompanyId) {
      typeSql += ' AND property_company_id = ?';
      typeParams.push(parseInt(propertyCompanyId));
    }
    typeSql += ' GROUP BY repair_type';
    const [typeStats] = await pool.execute(typeSql, typeParams);

    // 总数
    let totalSql = 'SELECT COUNT(*) as total FROM repair_orders WHERE 1=1';
    const totalParams = [];
    if (propertyCompanyId) {
      totalSql += ' AND property_company_id = ?';
      totalParams.push(parseInt(propertyCompanyId));
    }
    const [totalResult] = await pool.execute(totalSql, totalParams);

    const statusMap = {};
    statusStats.forEach(s => { statusMap[s.status] = s.count; });

    res.json({
      code: 200,
      data: {
        total: totalResult[0].total,
        pendingAssign: statusMap['pending_assign'] || 0,
        assigned: statusMap['assigned'] || 0,
        onTheWay: statusMap['on_the_way'] || 0,
        inProgress: statusMap['in_progress'] || 0,
        completed: statusMap['completed'] || 0,
        confirmed: statusMap['confirmed'] || 0,
        evaluated: statusMap['evaluated'] || 0,
        typeStats: typeStats.map(t => ({ type: t.repair_type, count: t.count })),
      },
    });
  } catch (error) {
    console.error('[获取报修统计错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取维保人员列表（从员工表中获取可派单人员）
router.get('/staff/list', authenticate, async (req, res) => {
  try {
    const [staff] = await pool.execute(
      "SELECT id, real_name as name, phone FROM employee_profiles WHERE status = 'active' AND position LIKE '%维修%' OR position LIKE '%工程%' OR position LIKE '%维保%'"
    );
    res.json({ code: 200, data: staff });
  } catch (error) {
    console.error('[获取维保人员错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个报修工单
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM repair_orders WHERE id = ?',
      [req.params.id]
    );
    if (orders.length === 0) {
      return res.json({ code: 404, message: '工单不存在' });
    }
    const o = orders[0];
    res.json({
      code: 200,
      data: {
        ...o,
        images: o.images ? JSON.parse(o.images) : [],
      },
    });
  } catch (error) {
    console.error('[获取报修工单错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建报修工单
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      orderNo, ownerName, ownerPhone, ownerAddress,
      repairType, repairDesc, urgency, images, propertyCompanyId,
    } = req.body;

    const finalNo = orderNo || `BX${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(
      `INSERT INTO repair_orders 
       (order_no, owner_name, owner_phone, owner_address, repair_type,
        repair_desc, urgency, images, property_company_id, status, create_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_assign', NOW())`,
      [
        finalNo, ownerName, ownerPhone, ownerAddress || '',
        repairType, repairDesc, urgency || 'normal',
        images ? JSON.stringify(images) : null, propertyCompanyId,
      ]
    );

    res.json({ code: 200, data: { id: result.insertId, orderNo: finalNo }, message: '报修提交成功' });
  } catch (error) {
    console.error('[创建报修工单错误]', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.json({ code: 400, message: '工单编号已存在' });
    }
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 派单
router.put('/:id/assign', authenticate, async (req, res) => {
  try {
    const { assignedTo, assignedPhone } = req.body;
    await pool.execute(
      'UPDATE repair_orders SET status = \'assigned\', assigned_to = ?, assigned_phone = ?, assign_time = NOW() WHERE id = ?',
      [assignedTo, assignedPhone || null, req.params.id]
    );
    res.json({ code: 200, message: '派单成功' });
  } catch (error) {
    console.error('[派单错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 接单
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE repair_orders SET status = \'on_the_way\' WHERE id = ? AND status = \'assigned\'',
      [req.params.id]
    );
    res.json({ code: 200, message: '接单成功' });
  } catch (error) {
    console.error('[接单错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 开始维修
router.put('/:id/start', authenticate, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE repair_orders SET status = \'in_progress\', arrival_time = NOW() WHERE id = ?',
      [req.params.id]
    );
    res.json({ code: 200, message: '已开始维修' });
  } catch (error) {
    console.error('[开始维修错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 完成维修
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const { repairResult, cost, chargeType } = req.body;
    await pool.execute(
      'UPDATE repair_orders SET status = \'completed\', repair_result = ?, cost = ?, charge_type = ?, complete_time = NOW() WHERE id = ?',
      [repairResult || null, cost || 0, chargeType || 'free', req.params.id]
    );
    res.json({ code: 200, message: '维修完成' });
  } catch (error) {
    console.error('[完成维修错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 业主确认
router.put('/:id/confirm', authenticate, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE repair_orders SET status = \'confirmed\', confirm_time = NOW() WHERE id = ?',
      [req.params.id]
    );
    res.json({ code: 200, message: '确认成功' });
  } catch (error) {
    console.error('[确认维修错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 业主评价
router.put('/:id/evaluate', authenticate, async (req, res) => {
  try {
    const { rating, evaluation } = req.body;
    await pool.execute(
      'UPDATE repair_orders SET status = \'evaluated\', rating = ?, evaluation = ?, evaluate_time = NOW() WHERE id = ?',
      [rating || null, evaluation || null, req.params.id]
    );
    res.json({ code: 200, message: '评价成功' });
  } catch (error) {
    console.error('[评价维修错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 回访
router.put('/:id/revisit', authenticate, async (req, res) => {
  try {
    const { revisitRemark } = req.body;
    await pool.execute(
      'UPDATE repair_orders SET revisit_status = \'completed\', revisit_remark = ? WHERE id = ?',
      [revisitRemark || null, req.params.id]
    );
    res.json({ code: 200, message: '回访完成' });
  } catch (error) {
    console.error('[回访错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取报修统计
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const { propertyCompanyId } = req.query;
    let sql = 'SELECT status, COUNT(*) as count FROM repair_orders WHERE 1=1';
    const params = [];

    if (propertyCompanyId) {
      sql += ' AND property_company_id = ?';
      params.push(parseInt(propertyCompanyId));
    }
    sql += ' GROUP BY status';

    const [statusStats] = await pool.execute(sql, params);

    // 类型统计
    let typeSql = 'SELECT repair_type, COUNT(*) as count FROM repair_orders WHERE 1=1';
    const typeParams = [];
    if (propertyCompanyId) {
      typeSql += ' AND property_company_id = ?';
      typeParams.push(parseInt(propertyCompanyId));
    }
    typeSql += ' GROUP BY repair_type';
    const [typeStats] = await pool.execute(typeSql, typeParams);

    // 总数
    let totalSql = 'SELECT COUNT(*) as total FROM repair_orders WHERE 1=1';
    const totalParams = [];
    if (propertyCompanyId) {
      totalSql += ' AND property_company_id = ?';
      totalParams.push(parseInt(propertyCompanyId));
    }
    const [totalResult] = await pool.execute(totalSql, totalParams);

    const statusMap = {};
    statusStats.forEach(s => { statusMap[s.status] = s.count; });

    res.json({
      code: 200,
      data: {
        total: totalResult[0].total,
        pendingAssign: statusMap['pending_assign'] || 0,
        assigned: statusMap['assigned'] || 0,
        onTheWay: statusMap['on_the_way'] || 0,
        inProgress: statusMap['in_progress'] || 0,
        completed: statusMap['completed'] || 0,
        confirmed: statusMap['confirmed'] || 0,
        evaluated: statusMap['evaluated'] || 0,
        typeStats: typeStats.map(t => ({ type: t.repair_type, count: t.count })),
      },
    });
  } catch (error) {
    console.error('[获取报修统计错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
