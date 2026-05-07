const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'plcct_jwt_secret_key_2026';

/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer token
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录或token已过期' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: 'token无效或已过期' });
  }
}

/**
 * 可选认证中间件（不强制要求登录）
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // token无效，忽略
    }
  }
  next();
}

/**
 * 端口权限校验中间件
 * @param {string} portType - 允许访问的端口类型
 */
function requirePort(portType) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }
    if (req.user.portType === 'superadmin') {
      // 超级管理员可以访问所有端口
      return next();
    }
    if (req.user.portType !== portType) {
      return res.status(403).json({ code: 403, message: '无权限访问该端口' });
    }
    next();
  };
}

module.exports = { authenticate, optionalAuth, requirePort };
