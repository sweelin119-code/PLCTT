-- ============================================================
-- 物业全生命周期管理系统 - 数据库初始化脚本
-- ============================================================

CREATE DATABASE IF NOT EXISTS plcct DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plcct;

-- ===== 1. 组织表 =====
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT DEFAULT NULL COMMENT '父级组织ID',
  `org_type` ENUM('city','area','street','company','project','shop') NOT NULL COMMENT '组织类型',
  `name` VARCHAR(100) NOT NULL COMMENT '组织名称',
  `code` VARCHAR(50) NOT NULL COMMENT '组织编码',
  `contact_person` VARCHAR(50) DEFAULT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `address` VARCHAR(200) DEFAULT NULL COMMENT '地址',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_org_type` (`org_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织架构表';

-- ===== 2. 权限表 =====
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `perm_code` VARCHAR(100) NOT NULL COMMENT '权限编码',
  `perm_name` VARCHAR(100) NOT NULL COMMENT '权限名称',
  `parent_id` INT DEFAULT NULL COMMENT '父级权限ID',
  `path` VARCHAR(200) DEFAULT NULL COMMENT '前端路由路径',
  `type` ENUM('menu','button','api') NOT NULL DEFAULT 'menu' COMMENT '权限类型',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_perm_code` (`perm_code`),
  INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- ===== 3. 角色表 =====
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
  `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `port_type` ENUM('government','property','merchant','owner','wechat','superadmin') NOT NULL COMMENT '所属端口',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '角色描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- ===== 4. 角色-权限关联表 =====
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL COMMENT '角色ID',
  `perm_code` VARCHAR(100) NOT NULL COMMENT '权限编码',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_perm_code` (`perm_code`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- ===== 5. 用户表 =====
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号（登录账号）',
  `password` VARCHAR(200) NOT NULL COMMENT '密码（bcrypt加密）',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `wechat_openid` VARCHAR(100) DEFAULT NULL COMMENT '微信OpenID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=启用',
  `port_type` ENUM('government','property','merchant','owner','wechat','superadmin') NOT NULL COMMENT '所属端口类型',
  `manage_project_ids` JSON DEFAULT NULL COMMENT '可管理的小区项目ID列表',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_phone` (`phone`),
  INDEX `idx_port_type` (`port_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ===== 6. 用户-角色关联表 =====
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `role_id` INT NOT NULL COMMENT '角色ID',
  `org_id` INT NOT NULL COMMENT '所属组织ID（数据范围）',
  `port_type` ENUM('government','property','merchant','owner','wechat','superadmin') NOT NULL COMMENT '所属端口类型',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_org_id` (`org_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- ===== 7. 员工档案表 =====
CREATE TABLE IF NOT EXISTS `employee_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL COMMENT '关联的用户ID',
  `employee_no` VARCHAR(50) NOT NULL COMMENT '员工编号',
  `real_name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `department` VARCHAR(100) NOT NULL COMMENT '所属部门',
  `position` VARCHAR(100) NOT NULL COMMENT '岗位',
  `entry_date` DATE NOT NULL COMMENT '入职日期',
  `skill_tags` JSON DEFAULT NULL COMMENT '技能标签',
  `can_schedule` TINYINT NOT NULL DEFAULT 0 COMMENT '是否参与值班排班',
  `status` ENUM('active','resigned','leave') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_employee_no` (`employee_no`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工档案表';

-- ===== 8. 物业企业表 =====
CREATE TABLE IF NOT EXISTS `property_companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(200) NOT NULL COMMENT '企业名称',
  `unified_code` VARCHAR(50) NOT NULL COMMENT '统一社会信用代码',
  `legal_person` VARCHAR(50) NOT NULL COMMENT '法定代表人',
  `registered_capital` VARCHAR(50) DEFAULT NULL COMMENT '注册资本',
  `qual_level` ENUM('一级','二级','三级','暂定三级') DEFAULT NULL COMMENT '资质等级',
  `qual_cert_no` VARCHAR(100) DEFAULT NULL COMMENT '资质证书编号',
  `qual_expire_date` DATE DEFAULT NULL COMMENT '资质有效期',
  `address` VARCHAR(200) DEFAULT NULL COMMENT '地址',
  `contact_person` VARCHAR(50) DEFAULT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `business_scope` TEXT DEFAULT NULL COMMENT '经营范围',
  `audit_status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `audit_remark` VARCHAR(500) DEFAULT NULL COMMENT '审核意见',
  `submit_time` DATETIME DEFAULT NULL COMMENT '提交时间',
  `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_unified_code` (`unified_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物业企业表';

-- ===== 9. 商家表 =====
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shop_name` VARCHAR(200) NOT NULL COMMENT '店铺名称',
  `company_name` VARCHAR(200) DEFAULT NULL COMMENT '公司名称',
  `unified_code` VARCHAR(50) DEFAULT NULL COMMENT '统一社会信用代码',
  `contact_person` VARCHAR(50) NOT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `category` VARCHAR(50) DEFAULT NULL COMMENT '商家类别',
  `address` VARCHAR(200) DEFAULT NULL COMMENT '地址',
  `business_license` VARCHAR(100) DEFAULT NULL COMMENT '营业执照号',
  `property_company_id` INT NOT NULL COMMENT '所属物业公司ID',
  `audit_status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `audit_remark` VARCHAR(500) DEFAULT NULL COMMENT '审核意见',
  `submit_time` DATETIME DEFAULT NULL COMMENT '提交时间',
  `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_property_company_id` (`property_company_id`),
  INDEX `idx_audit_status` (`audit_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家表';

-- ===== 10. 报修工单表 =====
CREATE TABLE IF NOT EXISTS `repair_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(50) NOT NULL COMMENT '工单编号',
  `owner_name` VARCHAR(50) NOT NULL COMMENT '业主姓名',
  `owner_phone` VARCHAR(20) NOT NULL COMMENT '业主电话',
  `owner_address` VARCHAR(200) NOT NULL COMMENT '业主地址',
  `repair_type` ENUM('water','electric','hvac','plumbing','appliance','structure','other') NOT NULL COMMENT '报修类型',
  `repair_desc` TEXT NOT NULL COMMENT '问题描述',
  `urgency` ENUM('normal','urgent','emergency') NOT NULL DEFAULT 'normal' COMMENT '紧急程度',
  `status` ENUM('pending_assign','assigned','on_the_way','in_progress','completed','confirmed','evaluated','closed') NOT NULL DEFAULT 'pending_assign' COMMENT '工单状态',
  `images` JSON DEFAULT NULL COMMENT '现场图片',
  `property_company_id` INT NOT NULL COMMENT '所属物业公司ID',
  `assigned_to` VARCHAR(50) DEFAULT NULL COMMENT '指派给',
  `assigned_phone` VARCHAR(20) DEFAULT NULL COMMENT '维保人员电话',
  `assign_time` DATETIME DEFAULT NULL COMMENT '派单时间',
  `arrival_time` DATETIME DEFAULT NULL COMMENT '到场时间',
  `complete_time` DATETIME DEFAULT NULL COMMENT '维修完成时间',
  `confirm_time` DATETIME DEFAULT NULL COMMENT '业主确认时间',
  `repair_result` TEXT DEFAULT NULL COMMENT '维修结果描述',
  `cost` DECIMAL(10,2) DEFAULT NULL COMMENT '维修费用',
  `charge_type` ENUM('free','paid') DEFAULT NULL COMMENT '收费类型',
  `rating` TINYINT DEFAULT NULL COMMENT '业主评分 1-5',
  `evaluation` TEXT DEFAULT NULL COMMENT '业主评价',
  `evaluate_time` DATETIME DEFAULT NULL COMMENT '评价时间',
  `revisit_status` ENUM('pending','completed') DEFAULT NULL COMMENT '回访状态',
  `revisit_remark` TEXT DEFAULT NULL COMMENT '回访记录',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_order_no` (`order_no`),
  INDEX `idx_property_company_id` (`property_company_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_repair_type` (`repair_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报修工单表';

-- ===== 11. 投诉表 =====
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_no` VARCHAR(50) NOT NULL COMMENT '投诉编号',
  `complainant` VARCHAR(50) NOT NULL COMMENT '投诉人',
  `complainant_phone` VARCHAR(20) NOT NULL COMMENT '投诉人电话',
  `complainant_address` VARCHAR(200) DEFAULT NULL COMMENT '投诉人地址',
  `category` ENUM('property_service','noise','parking','security','clean','maintenance','neighbor','other') NOT NULL COMMENT '投诉分类',
  `title` VARCHAR(200) NOT NULL COMMENT '投诉标题',
  `content` TEXT NOT NULL COMMENT '投诉内容',
  `status` ENUM('pending_accept','accepted','assigned','processing','feedback','revisit_pending','closed') NOT NULL DEFAULT 'pending_accept' COMMENT '投诉状态',
  `source` ENUM('owner_app','phone','visit','government_transfer','other') NOT NULL DEFAULT 'owner_app' COMMENT '投诉来源',
  `urgency` ENUM('normal','urgent','emergency') NOT NULL DEFAULT 'normal' COMMENT '紧急程度',
  `images` JSON DEFAULT NULL COMMENT '附件图片',
  `property_company_id` INT NOT NULL COMMENT '所属物业公司ID',
  `accepted_by` VARCHAR(50) DEFAULT NULL COMMENT '受理人',
  `accept_time` DATETIME DEFAULT NULL COMMENT '受理时间',
  `assigned_to` VARCHAR(50) DEFAULT NULL COMMENT '处理人',
  `assigned_to_phone` VARCHAR(20) DEFAULT NULL COMMENT '处理人电话',
  `assign_time` DATETIME DEFAULT NULL COMMENT '分派时间',
  `handle_result` TEXT DEFAULT NULL COMMENT '处理结果',
  `handle_time` DATETIME DEFAULT NULL COMMENT '处理完成时间',
  `feedback_content` TEXT DEFAULT NULL COMMENT '反馈内容',
  `feedback_time` DATETIME DEFAULT NULL COMMENT '反馈时间',
  `revisit_status` ENUM('pending','completed') DEFAULT NULL COMMENT '回访状态',
  `revisit_remark` TEXT DEFAULT NULL COMMENT '回访记录',
  `revisit_time` DATETIME DEFAULT NULL COMMENT '回访时间',
  `satisfaction` TINYINT DEFAULT NULL COMMENT '满意度评分 1-5',
  `government_supervisor` VARCHAR(50) DEFAULT NULL COMMENT '督办人',
  `government_remark` TEXT DEFAULT NULL COMMENT '督办意见',
  `government_deadline` DATE DEFAULT NULL COMMENT '督办截止日期',
  `close_time` DATETIME DEFAULT NULL COMMENT '归档时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_complaint_no` (`complaint_no`),
  INDEX `idx_property_company_id` (`property_company_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投诉表';
