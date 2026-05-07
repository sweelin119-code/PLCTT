const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取物业企业列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { keyword, auditStatus, status } = req.query;
    let sql = 'SELECT * FROM property_companies WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND (company_name LIKE ? OR unified_code LIKE ? OR contact_person LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (auditStatus) {
      sql += ' AND audit_status = ?';
      params.push(auditStatus);
    }
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }

    sql += ' ORDER BY created_at DESC';
    const [companies] = await pool.execute(sql, params);
    res.json({ code: 200, data: companies });
  } catch (error) {
    console.error('[获取物业企业列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个物业企业
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [companies] = await pool.execute(
      'SELECT * FROM property_companies WHERE id = ?',
      [req.params.id]
    );
    if (companies.length === 0) {
      return res.json({ code: 404, message: '物业企业不存在' });
    }
    res.json({ code: 200, data: companies[0] });
  } catch (error) {
    console.error('[获取物业企业错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建/提交物业企业注册
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      companyName, unifiedCode, legalPerson, registeredCapital,
      qualLevel, qualCertNo, qualExpireDate, address,
      contactPerson, contactPhone, businessScope,
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO property_companies 
       (company_name, unified_code, legal_person, registered_capital, qual_level, 
        qual_cert_no, qual_expire_date, address, contact_person, contact_phone, 
        business_scope, audit_status, submit_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        companyName, unifiedCode, legalPerson, registeredCapital || null,
        qualLevel || null, qualCertNo || null, qualExpireDate || null,
        address || null, contactPerson || null, contactPhone || null,
        businessScope || null,
      ]
    );

    res.json({ code: 200, data: { id: result.insertId }, message: '提交成功，等待审核' });
  } catch (error) {
    console.error('[创建物业企业错误]', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.json({ code: 400, message: '该统一社会信用代码已存在' });
    }
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 审核物业企业
router.put('/:id/audit', authenticate, async (req, res) => {
  try {
    const { auditStatus, auditRemark } = req.body;
    if (!['approved', 'rejected'].includes(auditStatus)) {
      return res.json({ code: 400, message: '审核状态无效' });
    }

    await pool.execute(
      'UPDATE property_companies SET audit_status = ?, audit_remark = ?, audit_time = NOW() WHERE id = ?',
      [auditStatus, auditRemark || null, req.params.id]
    );

    res.json({ code: 200, message: auditStatus === 'approved' ? '审核通过' : '审核驳回' });
  } catch (error) {
    console.error('[审核物业企业错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新物业企业
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      companyName, unifiedCode, legalPerson, registeredCapital,
      qualLevel, qualCertNo, qualExpireDate, address,
      contactPerson, contactPhone, businessScope, status,
    } = req.body;

    await pool.execute(
      `UPDATE property_companies SET 
       company_name = ?, unified_code = ?, legal_person = ?, registered_capital = ?,
       qual_level = ?, qual_cert_no = ?, qual_expire_date = ?, address = ?,
       contact_person = ?, contact_phone = ?, business_scope = ?, status = ?
       WHERE id = ?`,
      [
        companyName, unifiedCode, legalPerson, registeredCapital || null,
        qualLevel || null, qualCertNo || null, qualExpireDate || null,
        address || null, contactPerson || null, contactPhone || null,
        businessScope || null, status !== undefined ? parseInt(status) : 1,
        req.params.id,
      ]
    );

    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    console.error('[更新物业企业错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 删除物业企业
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM property_companies WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('[删除物业企业错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
