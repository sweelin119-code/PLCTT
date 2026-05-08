-- =============================================================
-- 通知/消息系统 - 数据库迁移脚本
-- 1. announcements 表加 source 字段（支持多端发起公告）
-- 2. announcement_reads 表扩展（支持内部人员阅读记录）
-- =============================================================

USE plcct;

-- 1. announcements 表增加 source 字段，标识消息来源端
ALTER TABLE `announcements`
  ADD COLUMN `source` ENUM('property','government','merchant','committee') NOT NULL DEFAULT 'property' COMMENT '消息来源端' AFTER `project_id`,
  ADD INDEX `idx_source` (`source`);

-- 2. announcement_reads 表增加 reader_phone 字段，支持按用户查询已读状态
ALTER TABLE `announcement_reads`
  ADD COLUMN `reader_phone` VARCHAR(20) DEFAULT NULL COMMENT '阅读人手机号' AFTER `reader_name`,
  ADD COLUMN `reader_type` ENUM('staff','owner') NOT NULL DEFAULT 'staff' COMMENT '阅读人类型' AFTER `reader_phone`,
  ADD INDEX `idx_reader_phone` (`reader_phone`);

-- 3. 建通知已读记录表（用于标记内部公告的已读状态）
CREATE TABLE IF NOT EXISTS `notification_reads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `announcement_id` INT NOT NULL COMMENT '公告ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `read_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  INDEX `idx_announcement_id` (`announcement_id`),
  INDEX `idx_user_id` (`user_id`),
  UNIQUE KEY `uk_user_announcement` (`user_id`, `announcement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知已读记录表（内部员工）';
