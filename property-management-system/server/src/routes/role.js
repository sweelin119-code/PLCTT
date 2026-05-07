const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取角色列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { portType } = req.query;
    let sql = 'SELECT * FROM roles WHERE 1=1';
    const params = [];

    if (portType) {
      sql += ' AND port_type = ?';
      params.push(portType);
    }

    sql += ' ORDER BY id ASC';
    const [roles] = await pool.execute(sql, params);

    // 查询每个角色的权限
    const result = [];
    for (const role of roles) {
      const [perms] = await pool.execute(
        'SELECT perm_code FROM role_permissions WHERE role_id = ?',
        [role.id]
      );
      result.push({
        ...role,
        permissions: perms.map(p => p.perm_code),
      });
    }

    res.json({ code: 200, data: result });
  } catch (error) {
    console.error('[获取角色列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取所有权限列表
router.get('/permissions', authenticate, async (req, res) => {
  try {
    const [permissions] = await pool.execute(
      'SELECT * FROM permissions ORDER BY sort_order ASC'
    );

    // 构建树形结构
    const buildTree = (parentId) => {
      return permissions
        .filter(p => p.parent_id === parentId)
        .map(p => ({
          id: p.id,
          permCode: p.perm_code,
          permName: p.perm_name,
          parentId: p.parent_id,
          path: p.path,
          type: p.type,
          sortOrder: p.sort_order,
          children: buildTree(p.id),
        }));
    };

    const tree = buildTree(null);
    res.json({ code: 200, data: tree });
  } catch (error) {
    console.error('[获取权限列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建角色
router.post('/', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { roleCode, roleName, portType, description, permissions } = req.body;

    const [result] = await conn.execute(
      'INSERT INTO roles (role_code, role_name, port_type, description) VALUES (?, ?, ?, ?)',
      [roleCode, roleName, portType, description || null]
    );

    const roleId = result.insertId;

    // 插入角色权限关联
    if (permissions && permissions.length > 0) {
      const values = permissions.map(p => [roleId, p]);
      await conn.query(
        'INSERT INTO role_permissions (role_id, perm_code) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.json({ code: 200, data: { id: roleId }, message: '创建成功' });
  } catch (error) {
    await conn.rollback();
    console.error('[创建角色错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  } finally {
    conn.release();
  }
});

// 更新角色
router.put('/:id', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { roleName, description, status, permissions } = req.body;

    await conn.execute(
      'UPDATE roles SET role_name = ?, description = ?, status = ? WHERE id = ?',
      [roleName, description || null, status ?? 1, req.params.id]
    );

    // 更新权限关联
    if (permissions) {
      await conn.execute('DELETE FROM role_permissions WHERE role_id = ?', [req.params.id]);
      if (permissions.length > 0) {
        const values = permissions.map(p => [req.params.id, p]);
        await conn.query(
          'INSERT INTO role_permissions (role_id, perm_code) VALUES ?',
          [values]
        );
      }
    }

    await conn.commit();
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    await conn.rollback();
    console.error('[更新角色错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  } finally {
    conn.release();
  }
});

// 删除角色
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM roles WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('[删除角色错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
