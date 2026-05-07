const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { portType, status, keyword } = req.query;
    let sql = 'SELECT id, phone, real_name, avatar, status, port_type, manage_project_ids, create_time FROM users WHERE 1=1';
    const params = [];

    if (portType) {
      sql += ' AND port_type = ?';
      params.push(portType);
    }
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (keyword) {
      sql += ' AND (real_name LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY create_time DESC';
    const [users] = await pool.execute(sql, params);

    // 查询每个用户的角色
    const result = [];
    for (const user of users) {
      const [roles] = await pool.execute(`
        SELECT ur.role_id, ur.org_id, r.role_name, r.role_code, o.name as org_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        LEFT JOIN organizations o ON ur.org_id = o.id
        WHERE ur.user_id = ?
      `, [user.id]);

      let parsedManageProjectIds = [];
      try {
        if (user.manage_project_ids && typeof user.manage_project_ids === 'string') {
          parsedManageProjectIds = JSON.parse(user.manage_project_ids);
        }
      } catch (e) {
        parsedManageProjectIds = [];
      }
      result.push({
        ...user,
        manage_project_ids: parsedManageProjectIds,
        roles,
      });
    }

    res.json({ code: 200, data: result });
  } catch (error) {
    console.error('[获取用户列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建用户
router.post('/', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { phone, password, realName, portType, roleId, orgId, manageProjectIds } = req.body;

    // 检查手机号是否已存在
    const [existing] = await conn.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.json({ code: 400, message: '该手机号已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password || phone, 10);

    const [result] = await conn.execute(
      `INSERT INTO users (phone, password, real_name, port_type, manage_project_ids)
       VALUES (?, ?, ?, ?, ?)`,
      [phone, hashedPassword, realName, portType, manageProjectIds ? JSON.stringify(manageProjectIds) : null]
    );

    const userId = result.insertId;

    // 关联角色
    if (roleId) {
      await conn.execute(
        'INSERT INTO user_roles (user_id, role_id, org_id, port_type) VALUES (?, ?, ?, ?)',
        [userId, roleId, orgId || null, portType]
      );
    }

    await conn.commit();
    res.json({ code: 200, data: { id: userId }, message: '创建成功' });
  } catch (error) {
    await conn.rollback();
    console.error('[创建用户错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  } finally {
    conn.release();
  }
});

// 更新用户
router.put('/:id', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { realName, status, password, roleId, orgId, manageProjectIds } = req.body;

    let sql = 'UPDATE users SET real_name = ?, status = ?';
    const params = [realName, status ?? 1];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += ', password = ?';
      params.push(hashedPassword);
    }

    if (manageProjectIds !== undefined) {
      sql += ', manage_project_ids = ?';
      params.push(JSON.stringify(manageProjectIds));
    }

    sql += ' WHERE id = ?';
    params.push(req.params.id);

    await conn.execute(sql, params);

    // 更新角色关联
    if (roleId !== undefined) {
      await conn.execute('DELETE FROM user_roles WHERE user_id = ?', [req.params.id]);
      if (roleId) {
        await conn.execute(
          'INSERT INTO user_roles (user_id, role_id, org_id, port_type) VALUES (?, ?, ?, (SELECT port_type FROM users WHERE id = ?))',
          [req.params.id, roleId, orgId || null, req.params.id]
        );
      }
    }

    await conn.commit();
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    await conn.rollback();
    console.error('[更新用户错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  } finally {
    conn.release();
  }
});

// 删除用户
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('[删除用户错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
