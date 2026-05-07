/**
 * 数据库初始化脚本
 * 1. 创建数据库和表结构
 * 2. 导入种子数据
 * 3. 使用bcrypt加密用户密码
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '123456';
const DB_NAME = process.env.DB_NAME || 'plcct';

async function initDatabase() {
  console.log('========================================');
  console.log('  物业全生命周期管理系统 - 数据库初始化');
  console.log('========================================\n');

  let connection;
  try {
    // 连接MySQL（不指定数据库）
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    console.log('[1/4] 连接MySQL成功');

    // 读取并执行建表SQL（使用query支持多语句）
    const initSqlPath = path.join(__dirname, '../sql/init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');
    
    // 使用query执行多语句（CREATE DATABASE + USE + CREATE TABLE）
    await connection.query(initSql);
    console.log('[2/4] 数据库表结构创建完成');

    // 读取种子数据SQL
    const seedSqlPath = path.join(__dirname, '../sql/seed.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf-8');
    
    // 清空现有数据（按外键顺序）
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE role_permissions');
    await connection.query('TRUNCATE TABLE user_roles');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('TRUNCATE TABLE roles');
    await connection.query('TRUNCATE TABLE permissions');
    await connection.query('TRUNCATE TABLE organizations');
    await connection.query('TRUNCATE TABLE employee_profiles');
    await connection.query('TRUNCATE TABLE property_companies');
    await connection.query('TRUNCATE TABLE merchants');
    await connection.query('TRUNCATE TABLE repair_orders');
    await connection.query('TRUNCATE TABLE complaints');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 执行种子数据SQL（使用query支持多语句）
    await connection.query(seedSql);
    console.log('[3/4] 种子数据导入完成');

    // 加密用户密码
    console.log('   - 正在加密用户密码...');
    const [users] = await connection.execute('SELECT id, phone FROM users');
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.phone, 10);
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
    }
    console.log(`   - 已加密 ${users.length} 个用户密码`);
    console.log('[4/4] 密码加密完成');

    console.log('\n========================================');
    console.log('  ✅ 数据库初始化完成！');
    console.log('========================================');
    console.log('  登录账号：手机号 = 密码');
    console.log('  物业端: 13800000001 ~ 13800000006');
    console.log('  政府端: 13900000001 ~ 13900000002');
    console.log('  商家端: 13700000001 ~ 13700000002');
    console.log('  业主端: 13600000001 ~ 13600000002');
    console.log('  超级管理员: 13000000001');
    console.log('  (默认密码 = 手机号)');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
