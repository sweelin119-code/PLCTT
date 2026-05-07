-- =============================================================
-- P1/P2 模块数据库迁移脚本
-- 资产模块、收费模块、门禁模块、日常管理模块
-- =============================================================

USE plcct;

-- ===== 12. 楼栋表（资产模块）=====
CREATE TABLE IF NOT EXISTS `buildings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '楼栋名称',
  `alias_name` VARCHAR(100) DEFAULT NULL COMMENT '别名',
  `total_layers` INT NOT NULL DEFAULT 1 COMMENT '总层数',
  `underground_layers` INT DEFAULT 0 COMMENT '地下层数',
  `total_units` INT NOT NULL DEFAULT 1 COMMENT '单元数',
  `total_elevators` INT DEFAULT NULL COMMENT '电梯数',
  `build_year` INT DEFAULT NULL COMMENT '建成年份',
  `property_type` ENUM('residence','shop','office') NOT NULL DEFAULT 'residence' COMMENT '房产类型',
  `data_source` ENUM('manual','gov_sync','import','owner_register') NOT NULL DEFAULT 'manual' COMMENT '数据来源',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_property_type` (`property_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='楼栋表';

-- ===== 13. 单元表（资产模块）=====
CREATE TABLE IF NOT EXISTS `building_units` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `building_id` INT NOT NULL COMMENT '楼栋ID',
  `name` VARCHAR(100) NOT NULL COMMENT '单元名称',
  `total_floors` INT NOT NULL DEFAULT 1 COMMENT '总楼层数',
  `total_houses` INT NOT NULL DEFAULT 0 COMMENT '总户数',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_building_id` (`building_id`),
  FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单元表';

-- ===== 14. 房屋表（资产模块）=====
CREATE TABLE IF NOT EXISTS `houses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `building_id` INT NOT NULL COMMENT '楼栋ID',
  `unit_id` INT DEFAULT NULL COMMENT '单元ID',
  `floor` INT NOT NULL COMMENT '楼层',
  `room_no` VARCHAR(50) NOT NULL COMMENT '房号',
  `full_name` VARCHAR(200) NOT NULL COMMENT '完整名称(如 1栋1单元101)',
  `layout` VARCHAR(50) DEFAULT NULL COMMENT '户型',
  `area` DECIMAL(10,2) DEFAULT NULL COMMENT '建筑面积',
  `usable_area` DECIMAL(10,2) DEFAULT NULL COMMENT '使用面积',
  `orientation` VARCHAR(50) DEFAULT NULL COMMENT '朝向',
  `decoration_status` ENUM('rough','simple','standard','luxury') NOT NULL DEFAULT 'rough' COMMENT '装修状态',
  `ownership_status` ENUM('vacant','occupied','rented','for_sale','renovating') NOT NULL DEFAULT 'vacant' COMMENT '产权状态',
  `property_type` VARCHAR(50) DEFAULT 'residence' COMMENT '房产类型',
  `data_source` ENUM('manual','gov_sync','import','owner_register') NOT NULL DEFAULT 'manual' COMMENT '数据来源',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_building_id` (`building_id`),
  INDEX `idx_status` (`ownership_status`),
  FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房屋表';

-- ===== 15. 业主表（资产模块）=====
CREATE TABLE IF NOT EXISTS `owners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `id_card` VARCHAR(20) DEFAULT NULL COMMENT '身份证号',
  `gender` ENUM('male','female') DEFAULT NULL COMMENT '性别',
  `birthday` DATE DEFAULT NULL COMMENT '出生日期',
  `nationality` VARCHAR(50) DEFAULT NULL COMMENT '国籍',
  `native_place` VARCHAR(100) DEFAULT NULL COMMENT '籍贯',
  `education` VARCHAR(50) DEFAULT NULL COMMENT '学历',
  `profession` VARCHAR(100) DEFAULT NULL COMMENT '职业',
  `wechat_openid` VARCHAR(100) DEFAULT NULL COMMENT '微信OpenID',
  `tags` JSON DEFAULT NULL COMMENT '标签',
  `data_source` ENUM('manual','gov_sync','import','owner_register') NOT NULL DEFAULT 'manual' COMMENT '数据来源',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业主档案表';

-- ===== 16. 房屋业主关联表（资产模块）=====
CREATE TABLE IF NOT EXISTS `house_owners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `house_id` INT NOT NULL COMMENT '房屋ID',
  `owner_id` INT NOT NULL COMMENT '业主ID',
  `owner_type` ENUM('owner','co_owner','family','tenant') NOT NULL DEFAULT 'owner' COMMENT '业主类型',
  `bind_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
  `unbind_time` DATETIME DEFAULT NULL COMMENT '解绑时间',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否有效',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_house_id` (`house_id`),
  INDEX `idx_owner_id` (`owner_id`),
  FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房屋业主关联表';

-- ===== 17. 业主变更记录表（资产模块）=====
CREATE TABLE IF NOT EXISTS `owner_change_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `house_id` INT NOT NULL COMMENT '房屋ID',
  `old_owner_id` INT DEFAULT NULL COMMENT '原业主ID',
  `new_owner_id` INT DEFAULT NULL COMMENT '新业主ID',
  `change_type` ENUM('sale','transfer','rent','other') NOT NULL COMMENT '变更类型',
  `change_reason` VARCHAR(500) DEFAULT NULL COMMENT '变更原因',
  `operator_id` INT NOT NULL COMMENT '操作人ID',
  `change_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  INDEX `idx_house_id` (`house_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业主变更记录表';

-- ===== 18. 车位表（资产模块）=====
CREATE TABLE IF NOT EXISTS `parking_spaces` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `house_id` INT DEFAULT NULL COMMENT '关联房屋ID',
  `code` VARCHAR(50) NOT NULL COMMENT '车位编号',
  `type` ENUM('fixed','temporary','mechanical','mother_child') NOT NULL DEFAULT 'fixed' COMMENT '车位类型',
  `area` VARCHAR(50) DEFAULT NULL COMMENT '车位区域',
  `floor` INT DEFAULT NULL COMMENT '所在楼层',
  `size_area` DECIMAL(10,2) DEFAULT NULL COMMENT '车位面积',
  `status` ENUM('vacant','occupied','reserved','maintenance') NOT NULL DEFAULT 'vacant' COMMENT '使用状态',
  `property_type` ENUM('sale','rent','public') NOT NULL DEFAULT 'rent' COMMENT '产权类型',
  `owner_id` INT DEFAULT NULL COMMENT '业主ID',
  `monthly_rent` DECIMAL(10,2) DEFAULT NULL COMMENT '月租金',
  `data_source` ENUM('manual','gov_sync','import','owner_register') NOT NULL DEFAULT 'manual' COMMENT '数据来源',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车位表';

-- ===== 19. 收费项目表（收费模块）=====
CREATE TABLE IF NOT EXISTS `fee_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '费用名称',
  `category` ENUM('property','water','electric','gas','parking','maintenance','other') NOT NULL DEFAULT 'property' COMMENT '费用类别',
  `unit` VARCHAR(20) NOT NULL DEFAULT '元/月' COMMENT '计量单位',
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '单价',
  `charge_type` ENUM('fixed','metered','once','custom') NOT NULL DEFAULT 'fixed' COMMENT '计费方式',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收费项目表';

-- ===== 20. 计费规则表（收费模块）=====
CREATE TABLE IF NOT EXISTS `charge_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `fee_item_id` INT NOT NULL COMMENT '费用项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '规则名称',
  `charge_cycle` ENUM('monthly','quarterly','half_yearly','yearly','custom') NOT NULL DEFAULT 'monthly' COMMENT '计费周期',
  `due_days` INT NOT NULL DEFAULT 0 COMMENT '截止天数(月结后N天)',
  `overdue_rate` DECIMAL(5,2) DEFAULT NULL COMMENT '滞纳金费率(%)',
  `overdue_days` INT DEFAULT NULL COMMENT '滞纳金起算天数',
  `start_date` DATE DEFAULT NULL COMMENT '生效日期',
  `end_date` DATE DEFAULT NULL COMMENT '失效日期',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  FOREIGN KEY (`fee_item_id`) REFERENCES `fee_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='计费规则表';

-- ===== 21. 账单表（收费模块）=====
CREATE TABLE IF NOT EXISTS `bills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `house_id` INT NOT NULL COMMENT '房屋ID',
  `fee_item_id` INT NOT NULL COMMENT '费用项目ID',
  `bill_no` VARCHAR(50) NOT NULL COMMENT '账单编号',
  `period_year` INT NOT NULL COMMENT '账期年份',
  `period_month` INT NOT NULL COMMENT '账期月份',
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '应收金额',
  `adjusted_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '调整后金额',
  `paid_amount` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '已缴金额',
  `status` ENUM('pending','partial','paid','overdue','cancelled','waived') NOT NULL DEFAULT 'pending' COMMENT '账单状态',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `generate_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  `due_date` DATE DEFAULT NULL COMMENT '缴费截止日',
  `paid_time` DATETIME DEFAULT NULL COMMENT '缴费时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_bill_no` (`bill_no`),
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_house_id` (`house_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账单表';

-- ===== 22. 缴费记录表（收费模块）=====
CREATE TABLE IF NOT EXISTS `payment_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bill_id` INT NOT NULL COMMENT '账单ID',
  `project_id` INT NOT NULL COMMENT '项目ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '缴费金额',
  `pay_method` ENUM('wechat','alipay','cash','card','transfer','other') NOT NULL DEFAULT 'cash' COMMENT '支付方式',
  `pay_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '缴费时间',
  `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bill_id` (`bill_id`),
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='缴费记录表';

-- ===== 23. 催缴记录表（收费模块）=====
CREATE TABLE IF NOT EXISTS `collection_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bill_id` INT NOT NULL COMMENT '账单ID',
  `project_id` INT NOT NULL COMMENT '项目ID',
  `collection_type` ENUM('sms','phone','visit','notice','wechat') NOT NULL COMMENT '催缴方式',
  `collection_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '催缴时间',
  `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
  `result` VARCHAR(500) DEFAULT NULL COMMENT '催缴结果',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bill_id` (`bill_id`),
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='催缴记录表';

-- ===== 24. 催缴模板表（收费模块）=====
CREATE TABLE IF NOT EXISTS `collection_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `type` ENUM('sms','notice','wechat') NOT NULL COMMENT '模板类型',
  `content` TEXT NOT NULL COMMENT '模板内容',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='催缴模板表';

-- ===== 25. 房屋-收费项目关联表（收费模块）=====
CREATE TABLE IF NOT EXISTS `house_fee_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `house_id` INT NOT NULL COMMENT '房屋ID',
  `fee_item_id` INT NOT NULL COMMENT '收费项目ID',
  `custom_price` DECIMAL(10,2) DEFAULT NULL COMMENT '自定义单价',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_house_id` (`house_id`),
  FOREIGN KEY (`fee_item_id`) REFERENCES `fee_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房屋收费项目关联表';

-- ===== 26. 门禁设备表（门禁模块）=====
CREATE TABLE IF NOT EXISTS `door_devices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `device_name` VARCHAR(100) NOT NULL COMMENT '设备名称',
  `device_code` VARCHAR(100) NOT NULL COMMENT '设备编号',
  `device_type` ENUM('entrance','unit','garage','elevator','other') NOT NULL DEFAULT 'unit' COMMENT '设备类型',
  `building_id` INT DEFAULT NULL COMMENT '所在楼栋ID',
  `unit_id` INT DEFAULT NULL COMMENT '所在单元ID',
  `location` VARCHAR(200) DEFAULT NULL COMMENT '安装位置',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `port` INT DEFAULT NULL COMMENT '端口',
  `status` ENUM('online','offline','fault') NOT NULL DEFAULT 'offline' COMMENT '设备状态',
  `last_online_time` DATETIME DEFAULT NULL COMMENT '最后在线时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_device_code` (`device_code`),
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_building_id` (`building_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门禁设备表';

-- ===== 27. 门禁开门记录表（门禁模块）=====
CREATE TABLE IF NOT EXISTS `access_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT NOT NULL COMMENT '设备ID',
  `project_id` INT NOT NULL COMMENT '项目ID',
  `access_type` ENUM('qr_code','password','remote','card','face','intercom') NOT NULL COMMENT '开门方式',
  `visitor_name` VARCHAR(50) DEFAULT NULL COMMENT '访客姓名',
  `visitor_phone` VARCHAR(20) DEFAULT NULL COMMENT '访客电话',
  `target_house` VARCHAR(200) DEFAULT NULL COMMENT '目标房屋',
  `plate_no` VARCHAR(20) DEFAULT NULL COMMENT '车牌号',
  `access_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开门时间',
  `status` ENUM('success','failed','expired') NOT NULL DEFAULT 'success' COMMENT '开门状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_device_id` (`device_id`),
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_access_time` (`access_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门禁开门记录表';

-- ===== 28. 临时密码表（门禁模块）=====
CREATE TABLE IF NOT EXISTS `temp_passwords` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT NOT NULL COMMENT '设备ID',
  `password` VARCHAR(50) NOT NULL COMMENT '临时密码',
  `visitor_name` VARCHAR(50) DEFAULT NULL COMMENT '访客姓名',
  `visitor_phone` VARCHAR(20) DEFAULT NULL COMMENT '访客电话',
  `valid_period` ENUM('once','day','week','custom') NOT NULL DEFAULT 'once' COMMENT '有效期类型',
  `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
  `status` ENUM('active','used','expired') NOT NULL DEFAULT 'active' COMMENT '密码状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_device_id` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='临时密码表';

-- ===== 29. 访客授权表（门禁模块）=====
CREATE TABLE IF NOT EXISTS `visitor_auth_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `visitor_name` VARCHAR(50) NOT NULL COMMENT '访客姓名',
  `visitor_phone` VARCHAR(20) NOT NULL COMMENT '访客电话',
  `target_house` VARCHAR(200) NOT NULL COMMENT '目标房屋',
  `visit_reason` VARCHAR(500) DEFAULT NULL COMMENT '来访事由',
  `visit_time` DATETIME NOT NULL COMMENT '来访时间',
  `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `reviewer` VARCHAR(50) DEFAULT NULL COMMENT '审核人',
  `review_remark` VARCHAR(500) DEFAULT NULL COMMENT '审核意见',
  `review_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_visitor_phone` (`visitor_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客授权记录表';

-- ===== 30. 访客登记台账表（门禁模块）=====
CREATE TABLE IF NOT EXISTS `visitor_ledgers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `visitor_name` VARCHAR(50) NOT NULL COMMENT '访客姓名',
  `visitor_phone` VARCHAR(20) NOT NULL COMMENT '访客电话',
  `id_card` VARCHAR(20) DEFAULT NULL COMMENT '身份证号',
  `plate_no` VARCHAR(20) DEFAULT NULL COMMENT '车牌号',
  `target_house` VARCHAR(200) NOT NULL COMMENT '目标房屋',
  `visit_reason` VARCHAR(500) DEFAULT NULL COMMENT '来访事由',
  `visit_time` DATETIME NOT NULL COMMENT '进入时间',
  `leave_time` DATETIME DEFAULT NULL COMMENT '离开时间',
  `status` ENUM('visiting','left') NOT NULL DEFAULT 'visiting' COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_visitor_phone` (`visitor_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客登记台账表';

-- ===== 31. 访客类型表（门禁模块）=====
CREATE TABLE IF NOT EXISTS `visitor_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `type_name` VARCHAR(50) NOT NULL COMMENT '类型名称',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客类型表';

-- ===== 32. 访客黑名单表（门禁模块）=====
CREATE TABLE IF NOT EXISTS `visitor_blacklists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `visitor_name` VARCHAR(50) NOT NULL COMMENT '访客姓名',
  `visitor_phone` VARCHAR(20) NOT NULL COMMENT '访客电话',
  `reason` VARCHAR(500) NOT NULL COMMENT '拉黑原因',
  `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_visitor_phone` (`visitor_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客黑名单表';

-- ===== 33. 门禁权限表（门禁模块）=====
CREATE TABLE IF NOT EXISTS `door_permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT NOT NULL COMMENT '设备ID',
  `project_id` INT NOT NULL COMMENT '项目ID',
  `owner_id` INT DEFAULT NULL COMMENT '业主ID',
  `house_id` INT DEFAULT NULL COMMENT '房屋ID',
  `permission_type` ENUM('owner','tenant','temp') NOT NULL DEFAULT 'owner' COMMENT '权限类型',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
  `status` ENUM('active','expired','revoked') NOT NULL DEFAULT 'active' COMMENT '权限状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_device_id` (`device_id`),
  INDEX `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门禁权限表';

-- ===== 34. 待办事项表（日常管理模块）=====
CREATE TABLE IF NOT EXISTS `todos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `title` VARCHAR(200) NOT NULL COMMENT '待办标题',
  `priority` ENUM('high','medium','low') NOT NULL DEFAULT 'medium' COMMENT '优先级',
  `deadline` DATETIME DEFAULT NULL COMMENT '截止时间',
  `assignee` VARCHAR(50) DEFAULT NULL COMMENT '负责人',
  `status` ENUM('pending','completed') NOT NULL DEFAULT 'pending' COMMENT '完成状态',
  `category` VARCHAR(50) DEFAULT NULL COMMENT '分类',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='待办事项表';

-- ===== 35. 排班模板表（日常管理模块）=====
CREATE TABLE IF NOT EXISTS `schedule_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `shift_type` ENUM('morning','afternoon','night','full') NOT NULL COMMENT '班次类型',
  `start_time` VARCHAR(10) NOT NULL DEFAULT '09:00' COMMENT '开始时间',
  `end_time` VARCHAR(10) NOT NULL DEFAULT '18:00' COMMENT '结束时间',
  `color` VARCHAR(20) DEFAULT '#1890ff' COMMENT '显示颜色',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班模板表';

-- ===== 36. 值班排班表（日常管理模块）=====
CREATE TABLE IF NOT EXISTS `duty_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `staff_id` INT NOT NULL COMMENT '员工ID',
  `staff_name` VARCHAR(50) NOT NULL COMMENT '员工姓名',
  `date` DATE NOT NULL COMMENT '排班日期',
  `shift_type` VARCHAR(50) NOT NULL COMMENT '班次类型',
  `template_id` INT DEFAULT NULL COMMENT '排班模板ID',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_by` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_staff_id` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='值班排班表';

-- ===== 37. 交接班记录表（日常管理模块）=====
CREATE TABLE IF NOT EXISTS `handover_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `date` DATE NOT NULL COMMENT '交接日期',
  `shift_type` VARCHAR(50) NOT NULL COMMENT '班次类型',
  `handover_staff` VARCHAR(50) NOT NULL COMMENT '交班人',
  `receiver_staff` VARCHAR(50) NOT NULL COMMENT '接班人',
  `content` TEXT NOT NULL COMMENT '交接内容',
  `status` ENUM('pending','confirmed') NOT NULL DEFAULT 'pending' COMMENT '交接状态',
  `handover_sign` TEXT DEFAULT NULL COMMENT '交班签名',
  `receiver_sign` TEXT DEFAULT NULL COMMENT '接班签名',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交接班记录表';

-- ===== 38. 公告表（日常管理模块）=====
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `title` VARCHAR(200) NOT NULL COMMENT '公告标题',
  `content` TEXT NOT NULL COMMENT '公告内容',
  `type` ENUM('notice','activity','emergency','other') NOT NULL DEFAULT 'notice' COMMENT '公告类型',
  `priority` ENUM('high','medium','low') NOT NULL DEFAULT 'medium' COMMENT '优先级',
  `status` ENUM('draft','published','withdrawn','scheduled') NOT NULL DEFAULT 'draft' COMMENT '发布状态',
  `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `scope` VARCHAR(50) DEFAULT NULL COMMENT '发布范围',
  `scope_value` VARCHAR(500) DEFAULT NULL COMMENT '范围值',
  `attachments` JSON DEFAULT NULL COMMENT '附件',
  `total_target` INT DEFAULT NULL COMMENT '目标人数',
  `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
  `created_by` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- ===== 39. 公告阅读记录表（日常管理模块）=====
CREATE TABLE IF NOT EXISTS `announcement_reads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `announcement_id` INT NOT NULL COMMENT '公告ID',
  `reader_name` VARCHAR(50) NOT NULL COMMENT '阅读人',
  `read_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  INDEX `idx_announcement_id` (`announcement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告阅读记录表';

-- ===== 40. 文件目录表（日常管理模块）=====
CREATE TABLE IF NOT EXISTS `file_directories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '目录名称',
  `parent_id` INT DEFAULT NULL COMMENT '父目录ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件目录表';

-- ===== 41. 内部文件表（日常管理模块）=====
CREATE TABLE IF NOT EXISTS `internal_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `name` VARCHAR(200) NOT NULL COMMENT '文件名称',
  `directory_id` INT DEFAULT NULL COMMENT '所属目录ID',
  `file_size` INT DEFAULT NULL COMMENT '文件大小(字节)',
  `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
  `file_url` VARCHAR(500) DEFAULT NULL COMMENT '文件URL',
  `uploader` VARCHAR(50) NOT NULL COMMENT '上传人',
  `download_count` INT NOT NULL DEFAULT 0 COMMENT '下载次数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_directory_id` (`directory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内部文件表';

-- ===== 42. 业主成员表（资产模块）=====
CREATE TABLE IF NOT EXISTS `owner_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `owner_id` INT NOT NULL COMMENT '主业主ID',
  `name` VARCHAR(50) NOT NULL COMMENT '成员姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '成员手机号',
  `relation` ENUM('spouse','child','parent','relative','other') NOT NULL COMMENT '与业主关系',
  `id_card` VARCHAR(20) DEFAULT NULL COMMENT '身份证号',
  `gender` ENUM('male','female') DEFAULT NULL COMMENT '性别',
  `birthday` DATE DEFAULT NULL COMMENT '出生日期',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业主成员表';

-- ===== 43. 业主账户表（资产模块）=====
CREATE TABLE IF NOT EXISTS `owner_accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `owner_id` INT NOT NULL COMMENT '业主ID',
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '当前余额(元)',
  `total_recharge` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '累计充值',
  `total_payment` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '累计消费',
  `freeze_amount` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '冻结金额',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_owner_id` (`owner_id`),
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业主账户表';

-- ===== 44. 账户交易记录表（资产模块）=====
CREATE TABLE IF NOT EXISTS `account_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `account_id` INT NOT NULL COMMENT '账户ID',
  `owner_id` INT NOT NULL COMMENT '业主ID',
  `project_id` INT NOT NULL COMMENT '项目ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '交易金额(正=收入，负=支出)',
  `balance_before` DECIMAL(10,2) NOT NULL COMMENT '交易前余额',
  `balance_after` DECIMAL(10,2) NOT NULL COMMENT '交易后余额',
  `transaction_type` ENUM('recharge','payment','refund','withdraw') NOT NULL COMMENT '交易类型',
  `status` ENUM('pending','success','failed') NOT NULL DEFAULT 'success' COMMENT '交易状态',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `related_bill_id` INT DEFAULT NULL COMMENT '关联账单ID',
  `operator_id` INT DEFAULT NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(50) DEFAULT NULL COMMENT '操作人姓名',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_account_id` (`account_id`),
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户交易记录表';
