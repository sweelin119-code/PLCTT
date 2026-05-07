const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'plcct_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 安全解析JSON字段
function safeJsonParse(val, defaultVal = []) {
  if (!val) return defaultVal;
  try {
    return JSON.parse(val);
  } catch {
    return defaultVal;
  }
}

// 生成验证码
router.get('/captcha', (req, res) => {
  const captcha = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({ code: 200, data: { captcha } });
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const port = req.query.port;

    if (!phone || !password) {
      return res.json({ code: 400, message: '手机号和密码不能为空' });
    }

    // 查询用户
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      return res.json({ code: 400, message: '手机号或密码错误' });
    }

    const user = users[0];

    // 校验密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ code: 400, message: '手机号或密码错误' });
    }

    // 检查状态
    if (user.status === 0) {
      return res.json({ code: 400, message: '账号已被禁用，请联系管理员' });
    }

    // 校验端口匹配
    if (port && user.port_type !== 'superadmin' && user.port_type !== port) {
      return res.json({ code: 400, message: '该账号不属于当前端口，请切换登录端口' });
    }

    // 查询用户角色
    const [userRoles] = await pool.execute(`
      SELECT ur.*, r.role_code, r.role_name, r.port_type as role_port_type, 
             r.description, r.status as role_status,
             o.name as org_name, o.org_type
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      LEFT JOIN organizations o ON ur.org_id = o.id
      WHERE ur.user_id = ?
    `, [user.id]);

    // 查询每个角色的权限
    const rolesWithPermissions = [];
    for (const ur of userRoles) {
      const [perms] = await pool.execute(
        'SELECT perm_code FROM role_permissions WHERE role_id = ?',
        [ur.role_id]
      );
      rolesWithPermissions.push({
        id: ur.id,
        userId: ur.user_id,
        roleId: ur.role_id,
        orgId: ur.org_id,
        portType: ur.port_type,
        role: {
          id: ur.role_id,
          roleCode: ur.role_code,
          roleName: ur.role_name,
          portType: ur.role_port_type,
          description: ur.description,
          status: ur.role_status,
          permissions: perms.map(p => p.perm_code),
        },
        org: {
          id: ur.org_id,
          name: ur.org_name,
          orgType: ur.org_type,
        },
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        realName: user.real_name,
        portType: user.port_type,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      code: 200,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          realName: user.real_name,
          avatar: user.avatar,
          portType: user.port_type,
          manageProjectIds: safeJsonParse(user.manage_project_ids),
          createTime: user.create_time,
          roles: rolesWithPermissions,
        },
      },
    });
  } catch (error) {
    console.error('[登录错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, phone, real_name, avatar, wechat_openid, status, port_type, manage_project_ids, create_time FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.json({ code: 404, message: '用户不存在' });
    }

    const user = users[0];

    // 查询用户角色
    const [userRoles] = await pool.execute(`
      SELECT ur.*, r.role_code, r.role_name, r.port_type as role_port_type,
             r.description, r.status as role_status,
             o.name as org_name, o.org_type
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      LEFT JOIN organizations o ON ur.org_id = o.id
      WHERE ur.user_id = ?
    `, [user.id]);

    const rolesWithPermissions = [];
    for (const ur of userRoles) {
      const [perms] = await pool.execute(
        'SELECT perm_code FROM role_permissions WHERE role_id = ?',
        [ur.role_id]
      );
      rolesWithPermissions.push({
        id: ur.id,
        userId: ur.user_id,
        roleId: ur.role_id,
        orgId: ur.org_id,
        portType: ur.port_type,
        role: {
          id: ur.role_id,
          roleCode: ur.role_code,
          roleName: ur.role_name,
          portType: ur.role_port_type,
          description: ur.description,
          status: ur.role_status,
          permissions: perms.map(p => p.perm_code),
        },
        org: {
          id: ur.org_id,
          name: ur.org_name,
          orgType: ur.org_type,
        },
      });
    }

    const currentRole = rolesWithPermissions.length > 0 ? rolesWithPermissions[0] : null;

    res.json({
      code: 200,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          realName: user.real_name,
          avatar: user.avatar,
          portType: user.port_type,
          manageProjectIds: safeJsonParse(user.manage_project_ids),
          createTime: user.create_time,
        },
        roles: rolesWithPermissions,
        currentRole,
        token: req.headers.authorization?.split(' ')[1],
      },
    });
  } catch (error) {
    console.error('[获取用户信息错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 切换角色
router.post('/switch-role', authenticate, async (req, res) => {
  try {
    const { roleId } = req.body;
    // 切换角色在前端处理即可，后端返回当前用户的所有角色信息
    const [users] = await pool.execute(
      'SELECT id, phone, real_name, avatar, status, port_type, manage_project_ids, create_time FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.json({ code: 404, message: '用户不存在' });
    }

    const user = users[0];
    const [userRoles] = await pool.execute(`
      SELECT ur.*, r.role_code, r.role_name, r.port_type as role_port_type,
             r.description, r.status as role_status,
             o.name as org_name, o.org_type
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      LEFT JOIN organizations o ON ur.org_id = o.id
      WHERE ur.user_id = ?
    `, [user.id]);

    const rolesWithPermissions = [];
    for (const ur of userRoles) {
      const [perms] = await pool.execute(
        'SELECT perm_code FROM role_permissions WHERE role_id = ?',
        [ur.role_id]
      );
      rolesWithPermissions.push({
        id: ur.id,
        userId: ur.user_id,
        roleId: ur.role_id,
        orgId: ur.org_id,
        portType: ur.port_type,
        role: {
          id: ur.role_id,
          roleCode: ur.role_code,
          roleName: ur.role_name,
          portType: ur.role_port_type,
          description: ur.description,
          status: ur.role_status,
          permissions: perms.map(p => p.perm_code),
        },
        org: {
          id: ur.org_id,
          name: ur.org_name,
          orgType: ur.org_type,
        },
      });
    }

    const newRole = rolesWithPermissions.find(r => r.roleId === roleId) || rolesWithPermissions[0];

    res.json({
      code: 200,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          realName: user.real_name,
          avatar: user.avatar,
          portType: user.port_type,
          manageProjectIds: safeJsonParse(user.manage_project_ids),
          createTime: user.create_time,
        },
        roles: rolesWithPermissions,
        currentRole: newRole,
      },
    });
  } catch (error) {
    console.error('[切换角色错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 登出
router.post('/logout', (req, res) => {
  res.json({ code: 200, message: '登出成功' });
});

module.exports = router;
