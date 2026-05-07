-- =============================================================
-- 车位专项收费模块 数据库迁移脚本
-- 收费标准管理、车辆出入、产权车位收费、月租车位收费
-- =============================================================

USE plcct;

-- ===== 45. 停车收费标准表 =====
CREATE TABLE IF NOT EXISTS `parking_fee_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '规则名称',
  `vehicle_type` ENUM('car','motorcycle','large') NOT NULL DEFAULT 'car' COMMENT '车辆类型',
  `rate_type` ENUM('hourly','daily','monthly','yearly') NOT NULL DEFAULT 'hourly' COMMENT '计费方式',
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '单价（元）',
  `free_minutes` INT NOT NULL DEFAULT 30 COMMENT '免费时长（分钟）',
  `daily_cap` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '每日封顶（元）',
  `monthly_price` DECIMAL(10,2) DEFAULT NULL COMMENT '月租价格',
  `yearly_price` DECIMAL(10,2) DEFAULT NULL COMMENT '年租价格',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '规则说明',
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='停车收费标准表';

-- ===== 46. 车辆出入记录表 =====
CREATE TABLE IF NOT EXISTS `parking_entry_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `plate_no` VARCHAR(20) NOT NULL COMMENT '车牌号',
  `vehicle_type` ENUM('car','motorcycle','large') NOT NULL DEFAULT 'car' COMMENT '车辆类型',
  `entry_time` DATETIME NOT NULL COMMENT '入场时间',
  `exit_time` DATETIME DEFAULT NULL COMMENT '出场时间',
  `entrance` VARCHAR(100) NOT NULL COMMENT '入口名称',
  `exit_entrance` VARCHAR(100) DEFAULT NULL COMMENT '出口名称',
  `duration` VARCHAR(50) DEFAULT NULL COMMENT '停留时长',
  `fee` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '应收费用',
  `actual_fee` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '实收费用',
  `status` ENUM('parked','exited','free') NOT NULL DEFAULT 'parked' COMMENT '状态',
  `pay_method` ENUM('wechat','alipay','cash','monthly','free') DEFAULT NULL COMMENT '支付方式',
  `pay_time` DATETIME DEFAULT NULL COMMENT '缴费时间',
  `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_plate_no` (`plate_no`),
  INDEX `idx_status` (`status`),
  INDEX `idx_entry_time` (`entry_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆出入记录表';

-- ===== 47. 停车收费记录表 =====
CREATE TABLE IF NOT EXISTS `parking_charge_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `entry_record_id` INT DEFAULT NULL COMMENT '关联入场记录ID',
  `plate_no` VARCHAR(20) NOT NULL COMMENT '车牌号',
  `vehicle_type` ENUM('car','motorcycle','large') NOT NULL DEFAULT 'car' COMMENT '车辆类型',
  `entry_time` DATETIME NOT NULL COMMENT '入场时间',
  `exit_time` DATETIME NOT NULL COMMENT '出场时间',
  `duration` VARCHAR(50) DEFAULT NULL COMMENT '停留时长',
  `duration_minutes` INT DEFAULT 0 COMMENT '停留分钟数',
  `fee` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '应收费用',
  `actual_fee` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '实收费用',
  `pay_method` ENUM('wechat','alipay','cash','monthly','free') NOT NULL COMMENT '支付方式',
  `pay_time` DATETIME NOT NULL COMMENT '缴费时间',
  `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_plate_no` (`plate_no`),
  INDEX `idx_pay_time` (`pay_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='停车收费记录表';

-- ===== 48. 产权车位收费记录表 =====
CREATE TABLE IF NOT EXISTS `property_parking_fees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `parking_space_id` INT NOT NULL COMMENT '关联车位ID',
  `parking_code` VARCHAR(50) NOT NULL COMMENT '车位编号',
  `owner_name` VARCHAR(50) NOT NULL COMMENT '业主姓名',
  `house_full_name` VARCHAR(200) DEFAULT NULL COMMENT '房屋全称',
  `plate_no` VARCHAR(20) DEFAULT NULL COMMENT '绑定车牌号',
  `management_fee` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '月管理费（元）',
  `period` VARCHAR(7) NOT NULL COMMENT '账期（如 2026-05）',
  `status` ENUM('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `paid_at` DATETIME DEFAULT NULL COMMENT '缴费时间',
  `pay_method` VARCHAR(20) DEFAULT NULL COMMENT '支付方式',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_period` (`period`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产权车位收费记录表';

-- ===== 49. 月租车位订阅表 =====
CREATE TABLE IF NOT EXISTS `rental_parking_subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `parking_space_id` INT DEFAULT NULL COMMENT '关联固定车位ID',
  `parking_code` VARCHAR(50) DEFAULT NULL COMMENT '车位编号',
  `plate_no` VARCHAR(20) NOT NULL COMMENT '车牌号',
  `owner_name` VARCHAR(50) NOT NULL COMMENT '业主/租户姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `monthly_rent` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '月租金（元）',
  `start_date` DATE NOT NULL COMMENT '订阅开始日期',
  `end_date` DATE NOT NULL COMMENT '订阅到期日期',
  `status` ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active' COMMENT '状态',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_plate_no` (`plate_no`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月租车位订阅表';

-- ===== 50. 月租车位收费记录表 =====
CREATE TABLE IF NOT EXISTS `rental_parking_fees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL COMMENT '项目ID',
  `subscription_id` INT NOT NULL COMMENT '关联订阅ID',
  `plate_no` VARCHAR(20) NOT NULL COMMENT '车牌号',
  `owner_name` VARCHAR(50) NOT NULL COMMENT '业主/租户姓名',
  `monthly_rent` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '月租金（元）',
  `period` VARCHAR(7) NOT NULL COMMENT '账期（如 2026-05）',
  `status` ENUM('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `paid_at` DATETIME DEFAULT NULL COMMENT '缴费时间',
  `pay_method` VARCHAR(20) DEFAULT NULL COMMENT '支付方式',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_subscription_id` (`subscription_id`),
  INDEX `idx_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月租车位收费记录表';

-- ===== 51. 车位-费用项关联表 =====
CREATE TABLE IF NOT EXISTS `parking_fee_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parking_id` INT NOT NULL COMMENT '车位ID',
  `fee_item_id` INT NOT NULL COMMENT '收费项目ID',
  `project_id` INT NOT NULL COMMENT '项目ID',
  `custom_price` DECIMAL(10,2) DEFAULT NULL COMMENT '自定义单价',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_parking_id` (`parking_id`),
  INDEX `idx_fee_item_id` (`fee_item_id`),
  INDEX `idx_project_id` (`project_id`),
  FOREIGN KEY (`fee_item_id`) REFERENCES `fee_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车位-费用项关联表';
