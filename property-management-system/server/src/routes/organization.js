const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取组织列表（树形结构）
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, parentId } = req.query;
    let sql = 'SELECT * FROM organizations WHERE 1=1';
    const params = [];

    if (type) {
      sql += ' AND org_type = ?';
      params.push(type);
    }
    if (parentId !== undefined) {
      sql += ' AND parent_id = ?';
      params.push(parentId);
    }

    sql += ' ORDER BY sort_order ASC';

    const [orgs] = await pool.execute(sql, params);
    res.json({ code: 200, data: orgs });
  } catch (error) {
    console.error('[获取组织列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取组织树
router.get('/tree', authenticate, async (req, res) => {
  try {
    const [orgs] = await pool.execute(
      'SELECT * FROM organizations ORDER BY sort_order ASC'
    );

    // 构建树形结构
    const buildTree = (parentId) => {
      return orgs
        .filter(o => o.parent_id === parentId)
        .map(o => ({
          ...o,
          children: buildTree(o.id),
        }));
    };

    const tree = buildTree(null);
    res.json({ code: 200, data: tree });
  } catch (error) {
    console.error('[获取组织树错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 根据ID获取组织
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [orgs] = await pool.execute(
      'SELECT * FROM organizations WHERE id = ?',
      [req.params.id]
    );
    if (orgs.length === 0) {
      return res.json({ code: 404, message: '组织不存在' });
    }
    res.json({ code: 200, data: orgs[0] });
  } catch (error) {
    console.error('[获取组织错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建组织
router.post('/', authenticate, async (req, res) => {
  try {
    const { parentId, orgType, name, code, contactPerson, contactPhone, address, sortOrder } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO organizations (parent_id, org_type, name, code, contact_person, contact_phone, address, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [parentId || null, orgType, name, code, contactPerson || null, contactPhone || null, address || null, sortOrder || 0]
    );
    res.json({ code: 200, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    console.error('[创建组织错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新组织
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, code, contactPerson, contactPhone, address, sortOrder, status } = req.body;
    await pool.execute(
      `UPDATE organizations SET name = ?, code = ?, contact_person = ?, contact_phone = ?, address = ?, sort_order = ?, status = ?
       WHERE id = ?`,
      [name, code, contactPerson || null, contactPhone || null, address || null, sortOrder || 0, status ?? 1, req.params.id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    console.error('[更新组织错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 删除组织
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM organizations WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('[删除组织错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
