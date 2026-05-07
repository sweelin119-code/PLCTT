const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取商家列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { keyword, category, auditStatus, status, propertyCompanyId } = req.query;
    let sql = 'SELECT * FROM merchants WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND (shop_name LIKE ? OR company_name LIKE ? OR contact_person LIKE ? OR contact_phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (auditStatus) {
      sql += ' AND audit_status = ?';
      params.push(auditStatus);
    }
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }
    if (propertyCompanyId) {
      sql += ' AND property_company_id = ?';
      params.push(parseInt(propertyCompanyId));
    }

    sql += ' ORDER BY created_at DESC';
    const [merchants] = await pool.execute(sql, params);
    res.json({ code: 200, data: merchants });
  } catch (error) {
    console.error('[获取商家列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个商家
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [merchants] = await pool.execute(
      'SELECT * FROM merchants WHERE id = ?',
      [req.params.id]
    );
    if (merchants.length === 0) {
      return res.json({ code: 404, message: '商家不存在' });
    }
    res.json({ code: 200, data: merchants[0] });
  } catch (error) {
    console.error('[获取商家错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建商家
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      shopName, companyName, unifiedCode, contactPerson, contactPhone,
      category, address, businessLicense, propertyCompanyId,
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO merchants 
       (shop_name, company_name, unified_code, contact_person, contact_phone,
        category, address, business_license, property_company_id,
        audit_status, submit_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        shopName, companyName || null, unifiedCode || null,
        contactPerson, contactPhone, category || null,
        address || null, businessLicense || null, propertyCompanyId,
      ]
    );

    res.json({ code: 200, data: { id: result.insertId }, message: '创建成功，等待审核' });
  } catch (error) {
    console.error('[创建商家错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 审核商家
router.put('/:id/audit', authenticate, async (req, res) => {
  try {
    const { auditStatus, auditRemark } = req.body;
    if (!['approved', 'rejected'].includes(auditStatus)) {
      return res.json({ code: 400, message: '审核状态无效' });
    }

    await pool.execute(
      'UPDATE merchants SET audit_status = ?, audit_remark = ?, audit_time = NOW() WHERE id = ?',
      [auditStatus, auditRemark || null, req.params.id]
    );

    res.json({ code: 200, message: auditStatus === 'approved' ? '审核通过' : '审核驳回' });
  } catch (error) {
    console.error('[审核商家错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新商家
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      shopName, companyName, unifiedCode, contactPerson, contactPhone,
      category, address, businessLicense, status,
    } = req.body;

    await pool.execute(
      `UPDATE merchants SET 
       shop_name = ?, company_name = ?, unified_code = ?, contact_person = ?,
       contact_phone = ?, category = ?, address = ?, business_license = ?,
       status = ? WHERE id = ?`,
      [
        shopName, companyName || null, unifiedCode || null,
        contactPerson, contactPhone, category || null,
        address || null, businessLicense || null,
        status !== undefined ? parseInt(status) : 1,
        req.params.id,
      ]
    );

    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    console.error('[更新商家错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 删除商家
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM merchants WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('[删除商家错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取商家分类列表（去重）
router.get('/categories/list', authenticate, async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category FROM merchants WHERE category IS NOT NULL AND category != \'\' ORDER BY category'
    );
    res.json({ code: 200, data: categories.map(c => c.category) });
  } catch (error) {
    console.error('[获取商家分类错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
