const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organization');
const roleRoutes = require('./routes/role');
const userRoutes = require('./routes/user');
const employeeRoutes = require('./routes/employee');
const companyRoutes = require('./routes/companies');
const merchantRoutes = require('./routes/merchants');
const complaintRoutes = require('./routes/complaints');
const repairRoutes = require('./routes/repairs');
const assetRoutes = require('./routes/assets');
const feeRoutes = require('./routes/fees');
const accessRoutes = require('./routes/access');
const dailyRoutes = require('./routes/daily');
const parkingFeeRoutes = require('./routes/parking-fees');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传目录）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// 路由注册
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/fee', feeRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/parking-fee', parkingFeeRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'ok', timestamp: new Date().toISOString() });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[服务器错误]', err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// 启动服务
async function start() {
  console.log('========================================');
  console.log('  物业全生命周期管理系统 - 后端服务');
  console.log('========================================\n');

  // 测试数据库连接
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('\n❌ 数据库连接失败，请检查MySQL服务是否启动');
    console.error('   配置信息:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'plcct',
    });
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n✅ 服务启动成功`);
    console.log(`   地址: http://localhost:${PORT}`);
    console.log(`   健康检查: http://localhost:${PORT}/api/health`);
    console.log(`   前端开发模式请配置代理到 http://localhost:${PORT}\n`);
  });
}

start();
