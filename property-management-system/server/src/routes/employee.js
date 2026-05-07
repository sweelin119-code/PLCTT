const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取员工列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, department, keyword } = req.query;
    let sql = 'SELECT * FROM employee_profiles WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    if (keyword) {
      sql += ' AND (real_name LIKE ? OR phone LIKE ? OR employee_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const [employees] = await pool.execute(sql, params);

    const result = employees.map(emp => ({
      ...emp,
      skillTags: emp.skill_tags ? JSON.parse(emp.skill_tags) : [],
      canSchedule: emp.can_schedule === 1,
    }));

    res.json({ code: 200, data: result });
  } catch (error) {
    console.error('[获取员工列表错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 获取单个员工
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [employees] = await pool.execute(
      'SELECT * FROM employee_profiles WHERE id = ?',
      [req.params.id]
    );
    if (employees.length === 0) {
      return res.json({ code: 404, message: '员工不存在' });
    }
    const emp = employees[0];
    res.json({
      code: 200,
      data: {
        ...emp,
        skillTags: emp.skill_tags ? JSON.parse(emp.skill_tags) : [],
        canSchedule: emp.can_schedule === 1,
      },
    });
  } catch (error) {
    console.error('[获取员工错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 创建员工
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, employeeNo, realName, phone, department, position, entryDate, skillTags, canSchedule, status } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO employee_profiles (user_id, employee_no, real_name, phone, department, position, entry_date, skill_tags, can_schedule, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        employeeNo,
        realName,
        phone,
        department,
        position,
        entryDate,
        skillTags ? JSON.stringify(skillTags) : null,
        canSchedule ? 1 : 0,
        status || 'active',
      ]
    );

    res.json({ code: 200, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    console.error('[创建员工错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 更新员工
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { userId, employeeNo, realName, phone, department, position, entryDate, skillTags, canSchedule, status } = req.body;

    await pool.execute(
      `UPDATE employee_profiles SET user_id = ?, employee_no = ?, real_name = ?, phone = ?, department = ?, position = ?,
       entry_date = ?, skill_tags = ?, can_schedule = ?, status = ? WHERE id = ?`,
      [
        userId || null,
        employeeNo,
        realName,
        phone,
        department,
        position,
        entryDate,
        skillTags ? JSON.stringify(skillTags) : null,
        canSchedule ? 1 : 0,
        status || 'active',
        req.params.id,
      ]
    );

    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    console.error('[更新员工错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

// 删除员工
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM employee_profiles WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('[删除员工错误]', error);
    res.json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
