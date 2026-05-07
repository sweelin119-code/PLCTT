const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取投诉列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { keyword, category, status, source, urgency, propertyCompanyId, page = 1, pageSize = 20 } = req.query;
    let sql = 'SELECT * FROM complaints WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM complaints WHERE 1=1';
    const params = [];
    const countParams = [];

    if (keyword) {
      const kw = `%${keyword}%`;
      sql += ' AND (complaint_no LIKE ? OR complainant LIKE ? OR complainant_phone LIKE ? OR title LIKE ?)';
      params.push(kw, kw, kw, kw);
      countSql += ' AND (complaint_no LIKE ? OR complainant LIKE ? OR complainant_phone LIKE ? OR title LIKE ?)';
      countParams.push(kw, kw, kw, kw);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    if (source) {
      sql += ' AND source = ?';
      params.push(source);
      countSql += ' AND source = ?';
      countParams.push(source);
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

    // 查询总数
    const [countResult] = await pool.execute(countSql, countParams);
    const total = countResult[0].total;

    // 分页查询 - 使用 query 而非 execute 避免 LIMIT 预处理参数问题
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 20;
    const offset = (p - 1) * ps;
    sql += ` ORDER BY create_time DESC LIMIT ${ps} OFFSET ${offset}`;

    const [complaints] = await pool.query(sql, params);

    // 处理 JSON 字段
    const result = complaints.map(c => ({
      ...c,
      images: c.images ? JSON.parse(c.images) : [],
    }));

    res.json({ code: 200, data: { list: result, total, page: parseInt(page), pageSize: parseInt(pageSize) } });
  } catch (error) {
    console.error('[获取投诉列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取投诉统计
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const { propertyCompanyId } = req.query;
    let sql = 'SELECT status, COUNT(*) as count FROM complaints WHERE 1=1';
    const params = [];

    if (propertyCompanyId) {
      sql += ' AND property_company_id = ?';
      params.push(parseInt(propertyCompanyId));
    }
    sql += ' GROUP BY status';

    const [statusStats] = await pool.execute(sql, params);

    // 分类统计
    let catSql = 'SELECT category, COUNT(*) as count FROM complaints WHERE 1=1';
    const catParams = [];
    if (propertyCompanyId) {
      catSql += ' AND property_company_id = ?';
      catParams.push(parseInt(propertyCompanyId));
    }
    catSql += ' GROUP BY category';
    const [categoryStats] = await pool.execute(catSql, catParams);

    // 总数
    let totalSql = 'SELECT COUNT(*) as total FROM complaints WHERE 1=1';
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
        pendingAccept: statusMap['pending_accept'] || 0,
        accepted: statusMap['accepted'] || 0,
        assigned: statusMap['assigned'] || 0,
        processing: statusMap['processing'] || 0,
        feedback: statusMap['feedback'] || 0,
        closed: statusMap['closed'] || 0,
        categoryStats: categoryStats.map(c => ({ category: c.category, count: c.count })),
      },
    });
  } catch (error) {
    console.error('[获取投诉统计错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个投诉
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [complaints] = await pool.execute(
      'SELECT * FROM complaints WHERE id = ?',
      [req.params.id]
    );
    if (complaints.length === 0) {
      return res.json({ code: 404, message: '投诉不存在' });
    }
    const c = complaints[0];
    res.json({
      code: 200,
      data: {
        ...c,
        images: c.images ? JSON.parse(c.images) : [],
      },
    });
  } catch (error) {
    console.error('[获取投诉错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建投诉
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      complaintNo, complainant, complainantPhone, complainantAddress,
      category, title, content, source, urgency, images, propertyCompanyId,
    } = req.body;

    // 自动生成投诉编号
    const finalNo = complaintNo || `TS${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(
      `INSERT INTO complaints 
       (complaint_no, complainant, complainant_phone, complainant_address,
        category, title, content, source, urgency, images, property_company_id,
        status, create_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_accept', NOW())`,
      [
        finalNo, complainant, complainantPhone, complainantAddress || null,
        category, title, content, source || 'owner_app', urgency || 'normal',
        images ? JSON.stringify(images) : null, propertyCompanyId,
      ]
    );

    res.json({ code: 200, data: { id: result.insertId, complaintNo: finalNo }, message: '投诉提交成功' });
  } catch (error) {
    console.error('[创建投诉错误]', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.json({ code: 400, message: '投诉编号已存在' });
    }
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 受理投诉
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    const { acceptedBy } = req.body;
    await pool.execute(
      'UPDATE complaints SET status = \'accepted\', accepted_by = ?, accept_time = NOW() WHERE id = ? AND status = \'pending_accept\'',
      [acceptedBy || req.user.realName || '系统', req.params.id]
    );
    res.json({ code: 200, message: '受理成功' });
  } catch (error) {
    console.error('[受理投诉错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 分派投诉
router.put('/:id/assign', authenticate, async (req, res) => {
  try {
    const { assignedTo, assignedToPhone } = req.body;
    await pool.execute(
      'UPDATE complaints SET status = \'assigned\', assigned_to = ?, assigned_to_phone = ?, assign_time = NOW() WHERE id = ?',
      [assignedTo, assignedToPhone || null, req.params.id]
    );
    res.json({ code: 200, message: '分派成功' });
  } catch (error) {
    console.error('[分派投诉错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 处理投诉
router.put('/:id/process', authenticate, async (req, res) => {
  try {
    const { handleResult } = req.body;
    await pool.execute(
      'UPDATE complaints SET status = \'processing\', handle_result = ?, handle_time = NOW() WHERE id = ?',
      [handleResult, req.params.id]
    );
    res.json({ code: 200, message: '处理完成' });
  } catch (error) {
    console.error('[处理投诉错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 反馈投诉
router.put('/:id/feedback', authenticate, async (req, res) => {
  try {
    const { feedbackContent } = req.body;
    await pool.execute(
      'UPDATE complaints SET status = \'feedback\', feedback_content = ?, feedback_time = NOW() WHERE id = ?',
      [feedbackContent, req.params.id]
    );
    res.json({ code: 200, message: '反馈成功' });
  } catch (error) {
    console.error('[反馈投诉错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 回访投诉
router.put('/:id/revisit', authenticate, async (req, res) => {
  try {
    const { revisitRemark, satisfaction } = req.body;
    await pool.execute(
      'UPDATE complaints SET revisit_status = \'completed\', revisit_remark = ?, revisit_time = NOW(), satisfaction = ? WHERE id = ?',
      [revisitRemark || null, satisfaction || null, req.params.id]
    );
    res.json({ code: 200, message: '回访完成' });
  } catch (error) {
    console.error('[回访投诉错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 督办投诉（政府端）
router.put('/:id/supervise', authenticate, async (req, res) => {
  try {
    const { governmentSupervisor, governmentRemark, governmentDeadline } = req.body;
    await pool.execute(
      'UPDATE complaints SET government_supervisor = ?, government_remark = ?, government_deadline = ? WHERE id = ?',
      [governmentSupervisor || req.user.realName, governmentRemark || null, governmentDeadline || null, req.params.id]
    );
    res.json({ code: 200, message: '督办成功' });
  } catch (error) {
    console.error('[督办投诉错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 关闭投诉
router.put('/:id/close', authenticate, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE complaints SET status = \'closed\', close_time = NOW() WHERE id = ?',
      [req.params.id]
    );
    res.json({ code: 200, message: '投诉已归档' });
  } catch (error) {
    console.error('[关闭投诉错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
