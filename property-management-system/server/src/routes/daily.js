const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

function buildPagination(page, pageSize) {
  const p = Number(page) || 1;
  const ps = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const offset = (p - 1) * ps;
  return { p, ps, offset };
}

function safeJsonParse(val, defaultVal = []) {
  if (!val) return defaultVal;
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : defaultVal; } catch { return defaultVal; }
}

// =============================================================
//  待办事项
// =============================================================

// GET /api/daily/todos/stats - 待办统计（必须在 /:id 之前）
router.get('/todos/stats', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    const params = [];
    let where = '1=1';
    if (projectId) { where += ' AND project_id = ?'; params.push(projectId); }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM todos WHERE ${where}`, params);
    const [[{ total: pending }]] = await pool.query(`SELECT COUNT(*) AS total FROM todos WHERE ${where} AND status = 'pending'`, params);
    const [[{ total: completed }]] = await pool.query(`SELECT COUNT(*) AS total FROM todos WHERE ${where} AND status = 'completed'`, params);
    const [[{ total: overdue }]] = await pool.query(`SELECT COUNT(*) AS total FROM todos WHERE ${where} AND status = 'pending' AND deadline < NOW()`, params);
    const [[{ total: highPriority }]] = await pool.query(`SELECT COUNT(*) AS total FROM todos WHERE ${where} AND priority = 'high' AND status = 'pending'`, params);

    res.json({
      code: 200,
      data: { total, pending, completed, overdue, highPriority }
    });
  } catch (err) {
    console.error('[daily] getTodoStats error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/daily/todos - 待办事项列表
router.get('/todos', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT * FROM todos WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getTodos error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/todos - 创建待办
router.post('/todos', authenticate, async (req, res) => {
  try {
    const { projectId, title, priority, deadline, assignee, category } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO todos (project_id, title, priority, deadline, assignee, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, title, priority || 'medium', deadline || null, assignee || null, category || null, 'pending']
    );
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[daily] createTodo error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/daily/todos/:id/complete - 完成待办
router.put('/todos/:id/complete', authenticate, async (req, res) => {
  try {
    await pool.execute("UPDATE todos SET status = 'completed' WHERE id = ?", [req.params.id]);
    res.json({ code: 200, message: '已完成' });
  } catch (err) {
    console.error('[daily] markTodoCompleted error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  员工列表（用于排班）
// =============================================================

// GET /api/daily/schedules/staff - 员工列表（必须在 /:id 之前）
router.get('/schedules/staff', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, real_name AS name FROM employee_profiles WHERE status = 1 ORDER BY id ASC');
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getStaffList error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  排班模板
// =============================================================

// GET /api/daily/schedules/templates - 排班模板列表
router.get('/schedules/templates', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT * FROM schedule_templates WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY id ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getScheduleTemplates error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/schedules/templates - 创建排班模板
router.post('/schedules/templates', authenticate, async (req, res) => {
  try {
    const { projectId, name, shiftType, startTime, endTime, color } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO schedule_templates (project_id, name, shift_type, start_time, end_time, color) VALUES (?, ?, ?, ?, ?, ?)',
      [projectId, name, shiftType || 'morning', startTime || '09:00', endTime || '18:00', color || '#1890ff']
    );
    const [rows] = await pool.query('SELECT * FROM schedule_templates WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[daily] createScheduleTemplate error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  值班排班
// =============================================================

// GET /api/daily/schedules - 排班列表
router.get('/schedules', authenticate, async (req, res) => {
  try {
    const { year, month, projectId } = req.query;
    let sql = 'SELECT ds.*, st.name AS template_name, st.start_time, st.end_time, st.color FROM duty_schedules ds LEFT JOIN schedule_templates st ON ds.template_id = st.id WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND ds.project_id = ?'; params.push(projectId); }
    if (year && month) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}`;
      sql += " AND DATE_FORMAT(ds.date, '%Y-%m') = ?"; params.push(dateStr);
    }
    sql += ' ORDER BY ds.date ASC, ds.id ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getSchedules error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/schedules - 创建排班
router.post('/schedules', authenticate, async (req, res) => {
  try {
    const { projectId, staffId, staffName, date, shiftType, templateId, remark, createdBy } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO duty_schedules (project_id, staff_id, staff_name, date, shift_type, template_id, remark, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, staffId, staffName, date, shiftType, templateId || null, remark || null, createdBy || req.user?.username || 'system']
    );
    const [rows] = await pool.query('SELECT * FROM duty_schedules WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '排班成功', data: rows[0] });
  } catch (err) {
    console.error('[daily] createSchedule error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  交接班记录
// =============================================================

// GET /api/daily/handovers - 交接班记录列表
router.get('/handovers', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT * FROM handover_records WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY date DESC, id DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getHandoverRecords error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/handovers - 创建交接记录
router.post('/handovers', authenticate, async (req, res) => {
  try {
    const { projectId, date, shiftType, handoverStaff, receiverStaff, content } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO handover_records (project_id, date, shift_type, handover_staff, receiver_staff, content, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, date, shiftType, handoverStaff, receiverStaff, content, 'pending']
    );
    const [rows] = await pool.query('SELECT * FROM handover_records WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[daily] createHandover error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/daily/handovers/:id/confirm - 确认交接
router.put('/handovers/:id/confirm', authenticate, async (req, res) => {
  try {
    const { sign } = req.body;
    await pool.execute("UPDATE handover_records SET status = 'confirmed', receiver_sign = ? WHERE id = ?", [sign || null, req.params.id]);
    res.json({ code: 200, message: '交接确认成功' });
  } catch (err) {
    console.error('[daily] confirmHandover error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  考勤统计
// =============================================================

// GET /api/daily/stats - 考勤统计
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { month, projectId } = req.query;
    let sql = "SELECT staff_id, staff_name, COUNT(*) AS total_shifts FROM duty_schedules WHERE DATE_FORMAT(date, '%Y-%m') = ?";
    const params = [month || new Date().toISOString().slice(0, 7)];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' GROUP BY staff_id, staff_name ORDER BY total_shifts DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getDutyStats error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  公告管理
// =============================================================

// GET /api/daily/announcements - 公告列表
router.get('/announcements', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY is_top DESC, created_at DESC');
    const data = rows.map(r => ({ ...r, attachments: safeJsonParse(r.attachments) }));
    res.json({ code: 200, data });
  } catch (err) {
    console.error('[daily] getAnnouncements error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/announcements - 创建公告
router.post('/announcements', authenticate, async (req, res) => {
  try {
    const { projectId, title, content, type, priority, status, isTop, scope, scopeValue, attachments, createdBy } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO announcements (project_id, title, content, type, priority, status, is_top, scope, scope_value, attachments, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, title, content, type || 'notice', priority || 'medium', status || 'draft', isTop ? 1 : 0, scope || null, scopeValue || null, attachments ? JSON.stringify(attachments) : null, createdBy || req.user?.username || 'system']
    );
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: { ...rows[0], attachments: safeJsonParse(rows[0].attachments) } });
  } catch (err) {
    console.error('[daily] createAnnouncement error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/daily/announcements/:id/publish - 发布公告
router.put('/announcements/:id/publish', authenticate, async (req, res) => {
  try {
    await pool.execute("UPDATE announcements SET status = 'published', publish_time = NOW() WHERE id = ?", [req.params.id]);
    res.json({ code: 200, message: '发布成功' });
  } catch (err) {
    console.error('[daily] publishAnnouncement error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/daily/announcements/:id/withdraw - 撤回公告
router.put('/announcements/:id/withdraw', authenticate, async (req, res) => {
  try {
    await pool.execute("UPDATE announcements SET status = 'withdrawn' WHERE id = ?", [req.params.id]);
    res.json({ code: 200, message: '撤回成功' });
  } catch (err) {
    console.error('[daily] withdrawAnnouncement error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/daily/announcements/:id - 删除公告
router.delete('/announcements/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[daily] deleteAnnouncement error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/daily/announcements/:id/reads - 公告阅读记录
router.get('/announcements/:id/reads', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcement_reads WHERE announcement_id = ? ORDER BY read_time DESC', [req.params.id]);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getReadRecords error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  文件目录
// =============================================================

// GET /api/daily/files/directories - 目录列表
router.get('/files/directories', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT * FROM file_directories WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY id ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getDirectories error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/files/directories - 创建目录
router.post('/files/directories', authenticate, async (req, res) => {
  try {
    const { projectId, name, parentId } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO file_directories (project_id, name, parent_id) VALUES (?, ?, ?)',
      [projectId, name, parentId || null]
    );
    const [rows] = await pool.query('SELECT * FROM file_directories WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[daily] createDirectory error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/daily/files/directories/:id - 删除目录
router.delete('/files/directories/:id', authenticate, async (req, res) => {
  try {
    // 检查是否有文件
    const [files] = await pool.query('SELECT COUNT(*) AS total FROM internal_files WHERE directory_id = ?', [req.params.id]);
    if (files[0].total > 0) return res.status(400).json({ code: 400, message: '目录下还有文件，无法删除' });
    // 检查是否有子目录
    const [subs] = await pool.query('SELECT COUNT(*) AS total FROM file_directories WHERE parent_id = ?', [req.params.id]);
    if (subs[0].total > 0) return res.status(400).json({ code: 400, message: '目录下还有子目录，无法删除' });
    await pool.execute('DELETE FROM file_directories WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[daily] deleteDirectory error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  内部文件
// =============================================================

// GET /api/daily/files - 文件列表（支持全文搜索）
router.get('/files', authenticate, async (req, res) => {
  try {
    const { directoryId, search } = req.query;
    let sql = 'SELECT * FROM internal_files WHERE 1=1';
    const params = [];
    if (directoryId) { sql += ' AND directory_id = ?'; params.push(directoryId); }
    if (search && search.trim()) {
      const kw = `%${search.trim()}%`;
      sql += ' AND (name LIKE ? OR uploader LIKE ? OR file_type LIKE ?)';
      params.push(kw, kw, kw);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[daily] getFiles error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/files - 上传文件
router.post('/files', authenticate, async (req, res) => {
  try {
    const { projectId, name, directoryId, fileSize, fileType, fileUrl, uploader } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO internal_files (project_id, name, directory_id, file_size, file_type, file_url, uploader) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, name, directoryId || null, fileSize || 0, fileType || null, fileUrl || '', uploader || req.user?.username || 'system']
    );
    const [rows] = await pool.query('SELECT * FROM internal_files WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '上传成功', data: rows[0] });
  } catch (err) {
    console.error('[daily] uploadFile error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/daily/files/:id - 删除文件
router.delete('/files/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM internal_files WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[daily] deleteFile error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  通知/消息系统
// =============================================================

// GET /api/daily/announcements/recent - 获取最近通知列表（用于顶部铃铛下拉）
router.get('/announcements/recent', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const [rows] = await pool.query(
      `SELECT a.*, (SELECT COUNT(*) FROM notification_reads nr WHERE nr.announcement_id = a.id AND nr.user_id = ?) AS is_read
       FROM announcements a
       WHERE a.status = 'published' AND a.scope = 'internal'
       ORDER BY a.publish_time DESC LIMIT ?`,
      [req.user?.id || 0, limit]
    );
    const data = rows.map(r => ({ ...r, attachments: safeJsonParse(r.attachments) }));
    res.json({ code: 200, data });
  } catch (err) {
    console.error('[daily] getRecentAnnouncements error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/daily/announcements/unread-count - 未读通知数量
router.get('/announcements/unread-count', authenticate, async (req, res) => {
  try {
    const [[{ cnt }]] = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM announcements a
       WHERE a.status = 'published' AND a.scope = 'internal'
       AND a.id NOT IN (
         SELECT announcement_id FROM notification_reads WHERE user_id = ?
       )`,
      [req.user?.id || 0]
    );
    res.json({ code: 200, data: { count: cnt } });
  } catch (err) {
    console.error('[daily] getUnreadCount error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/announcements/:id/read - 标记公告为已读
router.post('/announcements/:id/read', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || 0;
    const username = req.user?.username || 'unknown';
    // 使用 INSERT IGNORE 避免重复
    await pool.execute(
      'INSERT IGNORE INTO notification_reads (announcement_id, user_id, username) VALUES (?, ?, ?)',
      [req.params.id, userId, username]
    );
    res.json({ code: 200, message: '已标记为已读' });
  } catch (err) {
    console.error('[daily] markAnnouncementRead error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/daily/announcements/owner - 业主端通知列表
router.get('/announcements/owner', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM announcements
       WHERE status = 'published' AND (scope IS NULL OR scope != 'internal')
       ORDER BY is_top DESC, publish_time DESC`
    );
    const data = rows.map(r => ({ ...r, attachments: safeJsonParse(r.attachments) }));
    res.json({ code: 200, data });
  } catch (err) {
    console.error('[daily] getOwnerAnnouncements error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/daily/announcements/:id/owner-read - 业主标记阅读公告
router.post('/announcements/:id/owner-read', authenticate, async (req, res) => {
  try {
    const { readerName, readerPhone } = req.body;
    await pool.execute(
      'INSERT IGNORE INTO announcement_reads (announcement_id, reader_name, reader_phone, reader_type) VALUES (?, ?, ?, ?)',
      [req.params.id, readerName || req.user?.username || '业主', readerPhone || '', 'owner']
    );
    // 更新阅读计数
    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM announcement_reads WHERE announcement_id = ?', [req.params.id]);
    await pool.execute('UPDATE announcements SET read_count = ? WHERE id = ?', [cnt, req.params.id]);
    res.json({ code: 200, message: '已阅读', data: { readCount: cnt } });
  } catch (err) {
    console.error('[daily] ownerReadAnnouncement error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
