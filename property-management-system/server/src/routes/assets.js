const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// ===== 工具函数 =====
function buildPagination(page, pageSize) {
  const p = Number(page) || 1;
  const ps = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const offset = (p - 1) * ps;
  return { p, ps, offset };
}

// =============================================================
//  楼栋管理
// =============================================================

// GET /api/assets/buildings - 获取楼栋列表
router.get('/buildings', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT * FROM buildings WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY sort_order ASC, id ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[assets] getBuildings error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/assets/buildings/:id - 获取楼栋详情
router.get('/buildings/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '楼栋不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[assets] getBuildingById error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/buildings - 创建楼栋
router.post('/buildings', authenticate, async (req, res) => {
  try {
    const { projectId, name, aliasName, totalLayers, undergroundLayers, totalUnits, totalElevators, buildYear, propertyType, dataSource, sortOrder, enabled } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO buildings (project_id, name, alias_name, total_layers, underground_layers, total_units, total_elevators, build_year, property_type, data_source, sort_order, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, name, aliasName || null, totalLayers || 1, undergroundLayers || 0, totalUnits || 1, totalElevators || null, buildYear || null, propertyType || 'residence', dataSource || 'manual', sortOrder || 0, enabled !== undefined ? enabled : 1]
    );
    const [rows] = await pool.query('SELECT * FROM buildings WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[assets] createBuilding error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/assets/buildings/:id - 更新楼栋
router.put('/buildings/:id', authenticate, async (req, res) => {
  try {
    const fields = ['name', 'alias_name', 'total_layers', 'underground_layers', 'total_units', 'total_elevators', 'build_year', 'property_type', 'data_source', 'sort_order', 'enabled'];
    const sets = []; const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined || req.body[camelCase(f)] !== undefined) {
        const val = req.body[f] !== undefined ? req.body[f] : req.body[camelCase(f)];
        sets.push(`\`${f}\` = ?`); params.push(val);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE buildings SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] || null });
  } catch (err) {
    console.error('[assets] updateBuilding error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/assets/buildings/:id - 删除楼栋
router.delete('/buildings/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM buildings WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[assets] deleteBuilding error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  单元管理
// =============================================================

// GET /api/assets/units - 获取单元列表
router.get('/units', authenticate, async (req, res) => {
  try {
    const { buildingId } = req.query;
    let sql = 'SELECT * FROM building_units WHERE 1=1';
    const params = [];
    if (buildingId) { sql += ' AND building_id = ?'; params.push(buildingId); }
    sql += ' ORDER BY sort_order ASC, id ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[assets] getUnits error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/units - 创建单元
router.post('/units', authenticate, async (req, res) => {
  try {
    const { buildingId, name, totalFloors, totalHouses, sortOrder } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO building_units (building_id, name, total_floors, total_houses, sort_order) VALUES (?, ?, ?, ?, ?)',
      [buildingId, name, totalFloors || 1, totalHouses || 0, sortOrder || 0]
    );
    const [rows] = await pool.query('SELECT * FROM building_units WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[assets] createUnit error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/assets/units/:id - 更新单元
router.put('/units/:id', authenticate, async (req, res) => {
  try {
    const fields = ['name', 'total_floors', 'total_houses', 'sort_order'];
    const sets = []; const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined || req.body[camelCase(f)] !== undefined) {
        const val = req.body[f] !== undefined ? req.body[f] : req.body[camelCase(f)];
        sets.push(`\`${f}\` = ?`); params.push(val);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE building_units SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM building_units WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] || null });
  } catch (err) {
    console.error('[assets] updateUnit error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/assets/units/:id - 删除单元
router.delete('/units/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM building_units WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[assets] deleteUnit error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  房屋管理
// =============================================================

// GET /api/assets/houses - 获取房屋列表（分页）
router.get('/houses', authenticate, async (req, res) => {
  try {
    const { projectId, buildingId, unitId, status, keyword, page, pageSize } = req.query;
    let sql = 'SELECT h.*, b.name AS building_name, bu.name AS unit_name FROM houses h LEFT JOIN buildings b ON h.building_id = b.id LEFT JOIN building_units bu ON h.unit_id = bu.id WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND h.project_id = ?'; params.push(projectId); }
    if (buildingId) { sql += ' AND h.building_id = ?'; params.push(buildingId); }
    if (unitId) { sql += ' AND h.unit_id = ?'; params.push(unitId); }
    if (status) { sql += ' AND h.ownership_status = ?'; params.push(status); }
    if (keyword) { sql += ' AND (h.full_name LIKE ? OR h.room_no LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

    // Count
    const countSql = sql.replace(/SELECT h\.\*.*FROM/, 'SELECT COUNT(*) AS total FROM');
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    // Pagination
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY h.sort_order ASC, h.id ASC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { list: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[assets] getHouses error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/houses/batch - 批量生成房屋（必须在 /:id 之前）
router.post('/houses/batch', authenticate, async (req, res) => {
  try {
    const { buildingId, unitId, startFloor, endFloor, roomsPerFloor, prefix } = req.body;
    if (!buildingId || !startFloor || !endFloor || !roomsPerFloor) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    const [bld] = await pool.query('SELECT * FROM buildings WHERE id = ?', [buildingId]);
    if (bld.length === 0) return res.status(404).json({ code: 404, message: '楼栋不存在' });
    const projectId = bld[0].project_id;
    const unitName = unitId ? (await pool.query('SELECT name FROM building_units WHERE id = ?', [unitId]))[0]?.[0]?.name || '' : '';

    const created = [];
    for (let floor = startFloor; floor <= endFloor; floor++) {
      for (let room = 1; room <= roomsPerFloor; room++) {
        const roomNo = prefix ? `${prefix}${floor}${String(room).padStart(2, '0')}` : `${floor}${String(room).padStart(2, '0')}`;
        const fullName = `${bld[0].name}${unitName ? unitName : ''}${roomNo}`;
        // Check duplicate
        const [exist] = await pool.query('SELECT id FROM houses WHERE building_id = ? AND unit_id = ? AND room_no = ?', [buildingId, unitId || null, roomNo]);
        if (exist.length > 0) continue;

        const [r] = await pool.execute(
          'INSERT INTO houses (project_id, building_id, unit_id, floor, room_no, full_name) VALUES (?, ?, ?, ?, ?, ?)',
          [projectId, buildingId, unitId || null, floor, roomNo, fullName]
        );
        created.push({ id: r.insertId, roomNo, fullName });
      }
    }
    res.json({ code: 200, message: `成功生成 ${created.length} 套房源`, data: created });
  } catch (err) {
    console.error('[assets] batchGenerateHouses error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/assets/houses/:id - 获取房屋详情
router.get('/houses/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT h.*, b.name AS building_name, bu.name AS unit_name FROM houses h LEFT JOIN buildings b ON h.building_id = b.id LEFT JOIN building_units bu ON h.unit_id = bu.id WHERE h.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '房屋不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[assets] getHouseById error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/houses - 创建房屋
router.post('/houses', authenticate, async (req, res) => {
  try {
    const { projectId, buildingId, unitId, floor, roomNo, fullName, layout, area, usableArea, orientation, decorationStatus, ownershipStatus, propertyType, dataSource, sortOrder, enabled } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO houses (project_id, building_id, unit_id, floor, room_no, full_name, layout, area, usable_area, orientation, decoration_status, ownership_status, property_type, data_source, sort_order, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, buildingId, unitId || null, floor, roomNo, fullName || '', layout || null, area || null, usableArea || null, orientation || null, decorationStatus || 'rough', ownershipStatus || 'vacant', propertyType || 'residence', dataSource || 'manual', sortOrder || 0, enabled !== undefined ? enabled : 1]
    );
    const [rows] = await pool.query('SELECT * FROM houses WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[assets] createHouse error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/assets/houses/:id - 更新房屋
router.put('/houses/:id', authenticate, async (req, res) => {
  try {
    const fields = ['building_id', 'unit_id', 'floor', 'room_no', 'full_name', 'layout', 'area', 'usable_area', 'orientation', 'decoration_status', 'ownership_status', 'property_type', 'data_source', 'sort_order', 'enabled'];
    const sets = []; const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined || req.body[camelCase(f)] !== undefined) {
        const val = req.body[f] !== undefined ? req.body[f] : req.body[camelCase(f)];
        sets.push(`\`${f}\` = ?`); params.push(val);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE houses SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM houses WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] || null });
  } catch (err) {
    console.error('[assets] updateHouse error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/assets/houses/:id - 删除房屋
router.delete('/houses/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM houses WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[assets] deleteHouse error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  业主管理
// =============================================================

// GET /api/assets/owners - 获取业主列表（分页）
router.get('/owners', authenticate, async (req, res) => {
  try {
    const { projectId, keyword, page, pageSize } = req.query;
    let sql = 'SELECT * FROM owners WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    if (keyword) { sql += ' AND (name LIKE ? OR phone LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

    const [countRows] = await pool.query(sql.replace('SELECT *', 'SELECT COUNT(*) AS total'), params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY id DESC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    // Parse JSON fields
    const data = rows.map(r => ({ ...r, tags: safeJsonParse(r.tags) }));

    res.json({ code: 200, data: { list: data, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[assets] getOwners error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/assets/owners/:id - 获取业主详情
router.get('/owners/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM owners WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '业主不存在' });
    res.json({ code: 200, data: { ...rows[0], tags: safeJsonParse(rows[0].tags) } });
  } catch (err) {
    console.error('[assets] getOwnerById error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/owners - 创建业主
router.post('/owners', authenticate, async (req, res) => {
  try {
    const { projectId, name, phone, idCard, gender, birthday, nationality, nativePlace, education, profession, tags, dataSource } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO owners (project_id, name, phone, id_card, gender, birthday, nationality, native_place, education, profession, tags, data_source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, name, phone, idCard || null, gender || null, birthday || null, nationality || null, nativePlace || null, education || null, profession || null, tags ? JSON.stringify(tags) : null, dataSource || 'manual']
    );
    const [rows] = await pool.query('SELECT * FROM owners WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: { ...rows[0], tags: safeJsonParse(rows[0].tags) } });
  } catch (err) {
    console.error('[assets] createOwner error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/assets/owners/:id - 更新业主
router.put('/owners/:id', authenticate, async (req, res) => {
  try {
    const fields = ['name', 'phone', 'id_card', 'gender', 'birthday', 'nationality', 'native_place', 'education', 'profession', 'data_source', 'status'];
    const sets = []; const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined || req.body[camelCase(f)] !== undefined) {
        const val = req.body[f] !== undefined ? req.body[f] : req.body[camelCase(f)];
        sets.push(`\`${f}\` = ?`); params.push(val);
      }
    }
    if (req.body.tags !== undefined) {
      sets.push('tags = ?'); params.push(JSON.stringify(req.body.tags));
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE owners SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM owners WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] ? { ...rows[0], tags: safeJsonParse(rows[0].tags) } : null });
  } catch (err) {
    console.error('[assets] updateOwner error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/assets/owners/:id - 删除业主
router.delete('/owners/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM owners WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[assets] deleteOwner error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  房屋-业主关联
// =============================================================

// GET /api/assets/house-owners - 获取房屋关联业主
router.get('/house-owners', authenticate, async (req, res) => {
  try {
    const { houseId } = req.query;
    let sql = 'SELECT ho.*, o.name AS owner_name, o.phone AS owner_phone FROM house_owners ho LEFT JOIN owners o ON ho.owner_id = o.id WHERE ho.is_active = 1';
    const params = [];
    if (houseId) { sql += ' AND ho.house_id = ?'; params.push(houseId); }
    sql += ' ORDER BY ho.bind_time ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[assets] getHouseOwners error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/house-owners - 绑定业主
router.post('/house-owners', authenticate, async (req, res) => {
  try {
    const { houseId, ownerId, ownerType, remark } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO house_owners (house_id, owner_id, owner_type, remark) VALUES (?, ?, ?, ?)',
      [houseId, ownerId, ownerType || 'owner', remark || null]
    );
    const [rows] = await pool.query(
      'SELECT ho.*, o.name AS owner_name, o.phone AS owner_phone FROM house_owners ho LEFT JOIN owners o ON ho.owner_id = o.id WHERE ho.id = ?',
      [result.insertId]
    );
    res.json({ code: 200, message: '绑定成功', data: rows[0] });
  } catch (err) {
    console.error('[assets] bindOwner error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/assets/house-owners/:id/unbind - 解绑业主
router.put('/house-owners/:id/unbind', authenticate, async (req, res) => {
  try {
    await pool.execute('UPDATE house_owners SET is_active = 0, unbind_time = NOW() WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '解绑成功' });
  } catch (err) {
    console.error('[assets] unbindOwner error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  业主变更记录
// =============================================================

// GET /api/assets/owner-changes - 业主变更历史
router.get('/owner-changes', authenticate, async (req, res) => {
  try {
    const { houseId } = req.query;
    let sql = 'SELECT oc.*, h.full_name AS house_name FROM owner_change_logs oc LEFT JOIN houses h ON oc.house_id = h.id WHERE 1=1';
    const params = [];
    if (houseId) { sql += ' AND oc.house_id = ?'; params.push(houseId); }
    sql += ' ORDER BY oc.change_time DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[assets] getOwnerChangeHistory error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  车位管理
// =============================================================

// GET /api/assets/parking - 获取车位列表（分页）
router.get('/parking', authenticate, async (req, res) => {
  try {
    const { projectId, keyword, status, type, page, pageSize } = req.query;
    let sql = 'SELECT ps.*, o.name AS owner_name, o.phone AS owner_phone FROM parking_spaces ps LEFT JOIN owners o ON ps.owner_id = o.id WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND ps.project_id = ?'; params.push(projectId); }
    if (status) { sql += ' AND ps.status = ?'; params.push(status); }
    if (type) { sql += ' AND ps.type = ?'; params.push(type); }
    if (keyword) { sql += ' AND (ps.code LIKE ? OR ps.area LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

    const [countRows] = await pool.query(sql.replace(/SELECT ps\.\*.*FROM/, 'SELECT COUNT(*) AS total FROM'), params);
    const total = countRows[0].total;
    const { p, ps, offset } = buildPagination(page, pageSize);
    sql += ' ORDER BY ps.sort_order ASC, ps.id ASC LIMIT ' + ps + ' OFFSET ' + offset;
    const [rows] = await pool.query(sql, params);

    res.json({ code: 200, data: { list: rows, total, page: p, pageSize: ps } });
  } catch (err) {
    console.error('[assets] getParkingSpaces error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/assets/parking/:id - 获取车位详情
router.get('/parking/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT ps.*, o.name AS owner_name, o.phone AS owner_phone FROM parking_spaces ps LEFT JOIN owners o ON ps.owner_id = o.id WHERE ps.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '车位不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[assets] getParkingSpaceById error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/parking - 创建车位
router.post('/parking', authenticate, async (req, res) => {
  try {
    const { projectId, houseId, code, type, area, floor, sizeArea, status, propertyType, ownerId, monthlyRent, dataSource, sortOrder, enabled } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO parking_spaces (project_id, house_id, code, type, area, floor, size_area, status, property_type, owner_id, monthly_rent, data_source, sort_order, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, houseId || null, code, type || 'fixed', area || null, floor || null, sizeArea || null, status || 'vacant', propertyType || 'rent', ownerId || null, monthlyRent || null, dataSource || 'manual', sortOrder || 0, enabled !== undefined ? enabled : 1]
    );
    const [rows] = await pool.query('SELECT * FROM parking_spaces WHERE id = ?', [result.insertId]);
    res.json({ code: 200, message: '创建成功', data: rows[0] });
  } catch (err) {
    console.error('[assets] createParkingSpace error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/assets/parking/:id - 更新车位
router.put('/parking/:id', authenticate, async (req, res) => {
  try {
    const fields = ['house_id', 'code', 'type', 'area', 'floor', 'size_area', 'status', 'property_type', 'owner_id', 'monthly_rent', 'data_source', 'sort_order', 'enabled'];
    const sets = []; const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined || req.body[camelCase(f)] !== undefined) {
        const val = req.body[f] !== undefined ? req.body[f] : req.body[camelCase(f)];
        sets.push(`\`${f}\` = ?`); params.push(val);
      }
    }
    if (sets.length === 0) return res.status(400).json({ code: 400, message: '无更新字段' });
    params.push(req.params.id);
    await pool.execute(`UPDATE parking_spaces SET ${sets.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM parking_spaces WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '更新成功', data: rows[0] || null });
  } catch (err) {
    console.error('[assets] updateParkingSpace error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// DELETE /api/assets/parking/:id - 删除车位
router.delete('/parking/:id', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM parking_spaces WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    console.error('[assets] deleteParkingSpace error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/assets/parking/:id/bind - 绑定车位业主
router.put('/parking/:id/bind', authenticate, async (req, res) => {
  try {
    const { ownerId } = req.body;
    if (!ownerId) return res.status(400).json({ code: 400, message: '缺少业主ID' });
    await pool.execute('UPDATE parking_spaces SET owner_id = ?, status = ? WHERE id = ?', [ownerId, 'occupied', req.params.id]);
    const [rows] = await pool.query('SELECT * FROM parking_spaces WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '绑定成功', data: rows[0] });
  } catch (err) {
    console.error('[assets] bindParkingOwner error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// PUT /api/assets/parking/:id/unbind - 解绑车位业主
router.put('/parking/:id/unbind', authenticate, async (req, res) => {
  try {
    await pool.execute('UPDATE parking_spaces SET owner_id = NULL, status = ? WHERE id = ?', ['vacant', req.params.id]);
    res.json({ code: 200, message: '解绑成功' });
  } catch (err) {
    console.error('[assets] unbindParkingOwner error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  统计
// =============================================================

// GET /api/assets/statistics - 资产统计
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ code: 400, message: '缺少项目ID' });

    const [houses] = await pool.query('SELECT COUNT(*) AS total FROM houses WHERE project_id = ?', [projectId]);
    const [vacant] = await pool.query("SELECT COUNT(*) AS total FROM houses WHERE project_id = ? AND ownership_status = 'vacant'", [projectId]);
    const [occupied] = await pool.query("SELECT COUNT(*) AS total FROM houses WHERE project_id = ? AND ownership_status = 'occupied'", [projectId]);
    const [parking] = await pool.query('SELECT COUNT(*) AS total FROM parking_spaces WHERE project_id = ?', [projectId]);
    const [parkingUsed] = await pool.query("SELECT COUNT(*) AS total FROM parking_spaces WHERE project_id = ? AND status != 'vacant'", [projectId]);
    const [owners] = await pool.query('SELECT COUNT(DISTINCT owner_id) AS total FROM house_owners ho JOIN houses h ON ho.house_id = h.id WHERE h.project_id = ? AND ho.is_active = 1', [projectId]);
    const [buildings] = await pool.query('SELECT COUNT(*) AS total FROM buildings WHERE project_id = ?', [projectId]);

    const totalHouses = houses[0].total;
    const totalParking = parking[0].total;

    res.json({
      code: 200,
      data: {
        totalBuildings: buildings[0].total,
        totalHouses,
        occupiedHouses: occupied[0].total,
        vacancyRate: totalHouses > 0 ? Number(((totalHouses - occupied[0].total) / totalHouses * 100).toFixed(1)) : 0,
        occupancyRate: totalHouses > 0 ? Number((occupied[0].total / totalHouses * 100).toFixed(1)) : 0,
        totalParking,
        parkingUsed: parkingUsed[0].total,
        parkingUsageRate: totalParking > 0 ? Number((parkingUsed[0].total / totalParking * 100).toFixed(1)) : 0,
        totalOwners: owners[0].total,
        totalVacant: vacant[0].total,
      }
    });
  } catch (err) {
    console.error('[assets] getAssetStatistics error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/assets/building-stats - 楼栋入住统计
router.get('/building-stats', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ code: 400, message: '缺少项目ID' });

    const [rows] = await pool.query(
      `SELECT b.id, b.name,
              COUNT(h.id) AS total_houses,
              SUM(CASE WHEN h.ownership_status = 'occupied' THEN 1 ELSE 0 END) AS occupied_houses,
              SUM(CASE WHEN h.ownership_status = 'vacant' THEN 1 ELSE 0 END) AS vacant_houses
       FROM buildings b
       LEFT JOIN houses h ON h.building_id = b.id
       WHERE b.project_id = ?
       GROUP BY b.id ORDER BY b.sort_order ASC`,
      [projectId]
    );

    const data = rows.map(r => ({
      ...r,
      occupancyRate: r.total_houses > 0 ? Number((r.occupied_houses / r.total_houses * 100).toFixed(1)) : 0,
    }));
    res.json({ code: 200, data });
  } catch (err) {
    console.error('[assets] getBuildingStatistics error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  数据同步
// =============================================================

// GET /api/assets/sync-logs - 同步日志
router.get('/sync-logs', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    // 简单返回空列表或模拟数据
    res.json({ code: 200, data: [] });
  } catch (err) {
    console.error('[assets] getSyncLogs error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/sync - 触发同步
router.post('/sync', authenticate, async (req, res) => {
  try {
    const { projectId, syncTypes } = req.body;
    res.json({ code: 200, message: '同步任务已触发', data: [] });
  } catch (err) {
    console.error('[assets] triggerSync error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  业主账户
// =============================================================

// GET /api/assets/owner-accounts - 业主账户列表
router.get('/owner-accounts', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT oa.*, o.name AS owner_name, o.phone AS owner_phone FROM owner_accounts oa LEFT JOIN owners o ON oa.owner_id = o.id WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND oa.project_id = ?'; params.push(projectId); }
    sql += ' ORDER BY oa.id DESC';
    const [rows] = await pool.query(sql, params);

    // 确保每个业主都有账户
    if (projectId) {
      const [owners] = await pool.query('SELECT id, project_id FROM owners WHERE project_id = ?', [projectId]);
      for (const o of owners) {
        const exists = rows.find(r => r.owner_id === o.id);
        if (!exists) {
          await pool.execute('INSERT IGNORE INTO owner_accounts (project_id, owner_id) VALUES (?, ?)', [o.id, o.id]);
        }
      }
      // Re-query
      const [rows2] = await pool.query(
        'SELECT oa.*, o.name AS owner_name, o.phone AS owner_phone FROM owner_accounts oa LEFT JOIN owners o ON oa.owner_id = o.id WHERE oa.project_id = ? ORDER BY oa.id DESC',
        [projectId]
      );
      return res.json({ code: 200, data: rows2 });
    }
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[assets] getOwnerAccounts error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// GET /api/assets/owner-accounts/by-owner/:ownerId - 按业主ID获取账户
router.get('/owner-accounts/by-owner/:ownerId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT oa.*, o.name AS owner_name, o.phone AS owner_phone FROM owner_accounts oa LEFT JOIN owners o ON oa.owner_id = o.id WHERE oa.owner_id = ?',
      [req.params.ownerId]
    );
    if (rows.length === 0) {
      // 自动创建
      const [owner] = await pool.query('SELECT * FROM owners WHERE id = ?', [req.params.ownerId]);
      if (owner.length === 0) return res.status(404).json({ code: 404, message: '业主不存在' });
      await pool.execute('INSERT IGNORE INTO owner_accounts (project_id, owner_id) VALUES (?, ?)', [owner[0].project_id, owner[0].id]);
      const [rows2] = await pool.query(
        'SELECT oa.*, o.name AS owner_name, o.phone AS owner_phone FROM owner_accounts oa LEFT JOIN owners o ON oa.owner_id = o.id WHERE oa.owner_id = ?',
        [req.params.ownerId]
      );
      return res.json({ code: 200, data: rows2[0] || null });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error('[assets] getOwnerAccountByOwnerId error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// POST /api/assets/owner-accounts/:id/recharge - 充值
router.post('/owner-accounts/:id/recharge', authenticate, async (req, res) => {
  try {
    const { amount, description, operatorName } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ code: 400, message: '金额必须大于0' });

    const [accts] = await pool.query('SELECT * FROM owner_accounts WHERE id = ?', [req.params.id]);
    if (accts.length === 0) return res.status(404).json({ code: 404, message: '账户不存在' });

    const acct = accts[0];
    const balanceBefore = Number(acct.balance);
    const balanceAfter = balanceBefore + Number(amount);

    await pool.execute('UPDATE owner_accounts SET balance = ?, total_recharge = total_recharge + ? WHERE id = ?', [balanceAfter, amount, req.params.id]);

    // 交易记录
    await pool.execute(
      `INSERT INTO account_transactions (account_id, owner_id, project_id, amount, balance_before, balance_after, transaction_type, status, remark, operator_name)
       VALUES (?, ?, ?, ?, ?, ?, 'recharge', 'success', ?, ?)`,
      [req.params.id, acct.owner_id, acct.project_id, amount, balanceBefore, balanceAfter, description || '充值', operatorName || req.user?.username || 'system']
    );

    const [rows] = await pool.query('SELECT * FROM owner_accounts WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '充值成功', data: rows[0] });
  } catch (err) {
    console.error('[assets] rechargeOwnerAccount error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  交易记录
// =============================================================

// GET /api/assets/account-transactions - 账户交易记录
router.get('/account-transactions', authenticate, async (req, res) => {
  try {
    const { accountId } = req.query;
    let sql = 'SELECT * FROM account_transactions WHERE 1=1';
    const params = [];
    if (accountId) { sql += ' AND account_id = ?'; params.push(accountId); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('[assets] getAccountTransactions error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// =============================================================
//  业主标签
// =============================================================

// GET /api/assets/owner-tags - 获取所有业主标签
router.get('/owner-tags', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    let sql = 'SELECT tags FROM owners WHERE tags IS NOT NULL';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    const [rows] = await pool.query(sql, params);
    const tagSet = new Set();
    rows.forEach(r => {
      const tags = safeJsonParse(r.tags, []);
      tags.forEach(t => tagSet.add(t));
    });
    res.json({ code: 200, data: Array.from(tagSet) });
  } catch (err) {
    console.error('[assets] getAllOwnerTags error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// ===== 工具函数 =====
function camelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function safeJsonParse(val, defaultVal = []) {
  if (!val) return defaultVal;
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : defaultVal;
  } catch { return defaultVal; }
}

module.exports = router;
