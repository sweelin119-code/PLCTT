-- ============================================================
-- 物业全生命周期管理系统 - 种子数据
-- ============================================================

USE plcct;

-- ===== 组织数据 =====
INSERT INTO `organizations` (`id`, `parent_id`, `org_type`, `name`, `code`, `contact_person`, `contact_phone`, `address`, `sort_order`, `status`) VALUES
(1, NULL, 'city', '杭州市', 'HZ', NULL, NULL, NULL, 1, 1),
(2, 1, 'area', '西湖区', 'HZ-XH', NULL, NULL, NULL, 1, 1),
(3, 1, 'area', '上城区', 'HZ-SC', NULL, NULL, NULL, 2, 1),
(4, 2, 'street', '文新街道', 'HZ-XH-WX', NULL, NULL, NULL, 1, 1),
(5, 2, 'street', '古荡街道', 'HZ-XH-GD', NULL, NULL, NULL, 2, 1),
(10, NULL, 'company', '绿城物业服务集团', 'PROP-LC', '王总', '13800138001', NULL, 1, 1),
(11, NULL, 'company', '万科物业服务有限公司', 'PROP-WK', '李总', '13800138002', NULL, 2, 1),
(20, 10, 'project', '桂花城小区', 'LC-GHC', '张经理', '13800138101', '西湖区文新街道桂花路88号', 1, 1),
(21, 10, 'project', '春江花月小区', 'LC-CJHY', '赵经理', '13800138102', '西湖区之江路128号', 2, 1),
(22, 11, 'project', '万科魅力之城', 'WK-MLZC', '刘经理', '13800138201', '上城区九堡镇', 1, 1),
(30, 20, 'shop', '桂花城便民超市', 'SHOP-GHC-CS', '陈老板', '13800139101', NULL, 1, 1),
(31, 20, 'shop', '桂花城干洗店', 'SHOP-GHC-GX', '周老板', '13800139102', NULL, 2, 1);

-- ===== 权限数据 =====
INSERT INTO `permissions` (`id`, `perm_code`, `perm_name`, `parent_id`, `path`, `type`, `sort_order`) VALUES
-- 物业管理端
(100, 'property:dashboard', '工作台', NULL, '/property/dashboard', 'menu', 1),
(101, 'property:daily', '日常管理', NULL, NULL, 'menu', 2),
(102, 'property:daily:todo', '待办事项', 101, '/property/daily/todo', 'menu', 1),
(103, 'property:daily:schedule', '值班排班', 101, '/property/daily/schedule', 'menu', 2),
(104, 'property:daily:notice', '通知公告', 101, '/property/daily/notice', 'menu', 3),
(105, 'property:service', '服务管理', NULL, NULL, 'menu', 3),
(106, 'property:service:standard', '服务标准', 105, '/property/service/standard', 'menu', 1),
(107, 'property:service:satisfaction', '满意度评价', 105, '/property/service/satisfaction', 'menu', 2),
(108, 'property:security', '安全管理', NULL, NULL, 'menu', 4),
(109, 'property:security:check', '安全检查', 108, '/property/security/check', 'menu', 1),
(110, 'property:finance', '财务管理', NULL, NULL, 'menu', 5),
(111, 'property:finance:fee', '物业费管理', 110, '/property/finance/fee', 'menu', 1),
(112, 'property:device', '设备管理', NULL, NULL, 'menu', 6),
(113, 'property:device:asset', '设备台账', 112, '/property/device/asset', 'menu', 1),
(114, 'property:staff', '人员管理', NULL, NULL, 'menu', 7),
(115, 'property:staff:list', '人员列表', 114, '/property/staff/list', 'menu', 1),
(116, 'property:staff:add', '新增人员', 114, '/property/staff/add', 'button', 2),
(117, 'property:staff:edit', '编辑人员', 114, '/property/staff/edit', 'button', 3),
(118, 'property:staff:delete', '删除人员', 114, NULL, 'button', 4),
(119, 'property:roles', '角色管理', NULL, NULL, 'menu', 8),
(120, 'property:roles:list', '角色列表', 119, '/property/roles', 'menu', 1),
(121, 'property:roles:add', '新增角色', 119, NULL, 'button', 2),
(122, 'property:roles:edit', '编辑角色', 119, NULL, 'button', 3),
(123, 'property:complaint', '投诉处理', NULL, '/property/complaint', 'menu', 9),
(124, 'property:workorder', '工单管理', NULL, '/property/workorder', 'menu', 10),
(125, 'property:contract', '合同管理', NULL, '/property/contract', 'menu', 11),
(126, 'property:asset', '资产管理', NULL, NULL, 'menu', 12),
(127, 'property:asset:overview', '资产总览', 126, '/property/asset/overview', 'menu', 1),
(128, 'property:asset:building', '楼栋管理', 126, '/property/asset/building', 'menu', 2),
(129, 'property:asset:house', '房屋管理', 126, '/property/asset/house', 'menu', 3),
(130, 'property:asset:parking', '车位管理', 126, '/property/asset/parking', 'menu', 4),
(131, 'property:asset:sync', '数据同步', 126, '/property/asset/sync', 'menu', 5),
(132, 'property:owner', '业主管理', NULL, NULL, 'menu', 13),
(133, 'property:owner:archive', '业主档案', 132, '/property/owner/archive', 'menu', 1),
(134, 'property:merchant', '商家管理', NULL, NULL, 'menu', 14),
(135, 'property:merchant:list', '商家列表', 134, '/property/merchant/list', 'menu', 1),
(136, 'property:daily:document', '内部文件', 101, '/property/daily/document', 'menu', 4),
(137, 'property:service:value', '增值服务', 105, '/property/service/value', 'menu', 3),
(138, 'property:security:fire', '消防管理', 108, '/property/security/fire', 'menu', 2),
(139, 'property:security:emergency', '应急预案', 108, '/property/security/emergency', 'menu', 3),
(140, 'property:finance:fee-items', '费用项目管理', 110, '/property/finance/fee-items', 'menu', 2),
(141, 'property:finance:charge-rules', '收费标准设置', 110, '/property/finance/charge-rules', 'menu', 3),
(142, 'property:finance:bills', '账单管理', 110, '/property/finance/bills', 'menu', 4),
(143, 'property:finance:payments', '缴费管理', 110, '/property/finance/payments', 'menu', 5),
(144, 'property:finance:collection', '催缴管理', 110, '/property/finance/collection', 'menu', 6),
(145, 'property:finance:reports', '收费报表', 110, '/property/finance/reports', 'menu', 7),
(146, 'property:device:inspect', '设备巡检', 112, '/property/device/inspect', 'menu', 2),
(147, 'property:device:energy', '能耗管理', 112, '/property/device/energy', 'menu', 3),
(148, 'property:staff:archive', '员工档案', 114, '/property/staff/archive', 'menu', 5),
(149, 'property:staff:attendance', '考勤管理', 114, '/property/staff/attendance', 'menu', 6),
(150, 'property:staff:performance', '绩效考核', 114, '/property/staff/performance', 'menu', 7),
(151, 'property:complaint:list', '投诉受理', 123, '/property/complaint/list', 'menu', 1),
(152, 'property:complaint:stats', '投诉统计', 123, '/property/complaint/stats', 'menu', 2),
(153, 'property:workorder:list', '工单管理', 124, '/property/workorder/list', 'menu', 1),
(154, 'property:workorder:stats', '工单统计', 124, '/property/workorder/stats', 'menu', 2),
(155, 'property:quality', '品质管理', NULL, '/property/quality', 'menu', 15),
(156, 'property:owner-config', '业主端管理', NULL, NULL, 'menu', 16),
(157, 'property:owner-config:banner', 'Banner配置管理', 156, '/property/owner-config/banner', 'menu', 1),
(158, 'property:owner-config:quick-menu', '常用菜单配置', 156, '/property/owner-config/quick-menu', 'menu', 2),
(159, 'property:owner-config:service', '服务功能配置', 156, '/property/owner-config/service', 'menu', 3),
(160, 'property:organization', '组织架构管理', NULL, NULL, 'menu', 17),
(161, 'property:organization:list', '组织列表', 160, '/property/organization', 'menu', 1),
(162, 'property:organization:add', '新增组织', 160, NULL, 'button', 2),
(163, 'property:organization:edit', '编辑组织', 160, NULL, 'button', 3),
(164, 'property:organization:delete', '删除组织', 160, NULL, 'button', 4),
(165, 'property:owner:members', '业主成员管理', 132, '/property/owner/members', 'menu', 2),
(166, 'property:owner:accounts', '业主账户管理', 132, '/property/owner/accounts', 'menu', 3),
-- 政府监管端
(200, 'government:dashboard', '工作台', NULL, '/government/dashboard', 'menu', 1),
(201, 'government:staff', '系统管理', NULL, NULL, 'menu', 2),
(202, 'government:staff:list', '账号管理', 201, '/government/staff/list', 'menu', 1),
(203, 'government:staff:add', '新增账号', 201, '/government/staff/add', 'button', 2),
(204, 'government:staff:edit', '编辑账号', 201, '/government/staff/edit', 'button', 3),
(205, 'government:staff:delete', '删除账号', 201, NULL, 'button', 4),
(206, 'government:roles', '角色管理', NULL, NULL, 'menu', 3),
(207, 'government:roles:list', '角色列表', 206, '/government/roles', 'menu', 1),
(208, 'government:roles:add', '新增角色', 206, NULL, 'button', 2),
(209, 'government:roles:edit', '编辑角色', 206, NULL, 'button', 3),
(210, 'government:policy', '政策监管', NULL, NULL, 'menu', 4),
(211, 'government:policy:list', '政策法规管理', 210, '/government/policy', 'menu', 1),
(212, 'government:policy:enforce', '政策执行督查', 210, '/government/policy/enforce', 'menu', 2),
(213, 'government:qualification', '行业管理', NULL, NULL, 'menu', 5),
(214, 'government:qualification:review', '资质审核', 213, '/government/qualification/review', 'menu', 1),
(215, 'government:qualification:cert', '物业备案管理', 213, '/government/qualification/cert', 'menu', 2),
(216, 'government:merchant', '商家监管', NULL, NULL, 'menu', 6),
(217, 'government:merchant:list', '商家信息查看', 216, '/government/merchant/list', 'menu', 1),
(218, 'government:complaint', '投诉处理', NULL, NULL, 'menu', 7),
(219, 'government:complaint:list', '投诉受理', 218, '/government/complaint/list', 'menu', 1),
(220, 'government:complaint:track', '投诉督办', 218, '/government/complaint/track', 'menu', 2),
(221, 'government:complaint:stats', '投诉统计', 218, '/government/complaint/stats', 'menu', 3),
(222, 'government:asset', '资产查看', NULL, NULL, 'menu', 8),
(223, 'government:asset:view', '小区资产查看', 222, '/government/asset/view', 'menu', 1),
(224, 'government:street', '街道物业管理', NULL, NULL, 'menu', 9),
(225, 'government:street:supervise', '日常监督', 224, '/government/street/supervise', 'menu', 1),
(226, 'government:community', '社区管理', NULL, NULL, 'menu', 10),
(227, 'government:community:service', '基层服务', 226, '/government/community/service', 'menu', 1),
(228, 'government:portal', '门户内容管理', NULL, NULL, 'menu', 11),
(229, 'government:portal:info', '政策资讯管理', 228, '/government/policy/info', 'menu', 1),
(230, 'government:portal:rule', '规章制度管理', 228, '/government/rule', 'menu', 2),
(231, 'government:portal:category', '分类管理', 228, '/government/policy/category', 'menu', 3),
-- 商家管理端
(300, 'merchant:dashboard', '工作台', NULL, '/merchant/dashboard', 'menu', 1),
(301, 'merchant:staff', '系统管理', NULL, NULL, 'menu', 2),
(302, 'merchant:staff:list', '账号管理', 301, '/merchant/staff/list', 'menu', 1),
(303, 'merchant:staff:add', '新增账号', 301, '/merchant/staff/add', 'button', 2),
(304, 'merchant:staff:edit', '编辑账号', 301, '/merchant/staff/edit', 'button', 3),
(305, 'merchant:staff:delete', '删除账号', 301, NULL, 'button', 4),
(306, 'merchant:roles', '角色管理', NULL, NULL, 'menu', 3),
(307, 'merchant:roles:list', '角色列表', 306, '/merchant/roles', 'menu', 1),
(308, 'merchant:roles:add', '新增角色', 306, NULL, 'button', 2),
(309, 'merchant:roles:edit', '编辑角色', 306, NULL, 'button', 3),
(310, 'merchant:shop', '店铺管理', NULL, NULL, 'menu', 4),
(311, 'merchant:shop:info', '店铺信息', 310, '/merchant/shop/info', 'menu', 1),
(312, 'merchant:product', '商品/服务管理', NULL, NULL, 'menu', 5),
(313, 'merchant:product:list', '商品管理', 312, '/merchant/product/list', 'menu', 1),
(314, 'merchant:order', '订单管理', NULL, '/merchant/order', 'menu', 6),
(315, 'merchant:marketing', '营销活动', NULL, NULL, 'menu', 7),
(316, 'merchant:marketing:coupon', '优惠券管理', 315, '/merchant/marketing/coupon', 'menu', 1),
(317, 'merchant:finance', '财务管理', NULL, '/merchant/finance', 'menu', 8),
(318, 'merchant:customer', '客户管理', NULL, NULL, 'menu', 9),
(319, 'merchant:customer:list', '客户列表', 318, '/merchant/customer/list', 'menu', 1),
(320, 'merchant:data', '数据统计', NULL, '/merchant/data', 'menu', 10);

-- ===== 角色数据 =====
INSERT INTO `roles` (`id`, `role_code`, `role_name`, `port_type`, `description`, `status`) VALUES
(1, 'GOV_ADMIN', '市级管理员', 'government', '住建局系统管理员，可查看全市数据', 1),
(2, 'GOV_AREA', '区级管理员', 'government', '区住建局人员，可查看本区数据', 1),
(3, 'GOV_STREET', '街道办人员', 'government', '街道物业科人员', 1),
(10, 'PROP_ADMIN', '公司管理员', 'property', '物业公司超级管理员，拥有所有权限', 1),
(11, 'PROP_MANAGER', '项目经理', 'property', '单个小区负责人', 1),
(12, 'PROP_CUSTOMER_SVC', '客服人员', 'property', '接待业主投诉、报修', 1),
(13, 'PROP_ENGINEER', '工程人员', 'property', '维修工，处理工单', 1),
(14, 'PROP_SECURITY', '安保人员', 'property', '保安/保洁/巡检', 1),
(15, 'PROP_FINANCE', '财务人员', 'property', '收费管理、财务报表', 1),
(20, 'MER_ADMIN', '商家管理员', 'merchant', '店铺老板/负责人', 1),
(21, 'MER_STAFF', '店员', 'merchant', '接单/服务人员', 1),
(30, 'OWNER_OWNER', '业主', 'owner', '房产持有人', 1),
(31, 'OWNER_FAMILY', '家庭成员', 'owner', '同住人', 1),
(32, 'OWNER_TENANT', '租户', 'owner', '租赁人', 1),
(40, 'WECHAT_OPER', '公众号运营者', 'wechat', '管理消息模板、推送', 1),
(50, 'SUPER_ADMIN', '超级管理员', 'superadmin', '系统超级管理员，拥有所有端口全部权限', 1);

-- ===== 角色-权限关联 =====
-- 政府端角色权限
INSERT INTO `role_permissions` (`role_id`, `perm_code`) VALUES
-- GOV_ADMIN (市级管理员)
(1, 'government:dashboard'), (1, 'government:staff'), (1, 'government:staff:list'), (1, 'government:staff:add'), (1, 'government:staff:edit'), (1, 'government:staff:delete'),
(1, 'government:roles'), (1, 'government:roles:list'), (1, 'government:roles:add'), (1, 'government:roles:edit'),
(1, 'government:policy'), (1, 'government:policy:list'), (1, 'government:policy:enforce'),
(1, 'government:qualification'), (1, 'government:qualification:review'), (1, 'government:qualification:cert'),
(1, 'government:merchant'), (1, 'government:merchant:list'),
(1, 'government:complaint'), (1, 'government:complaint:list'), (1, 'government:complaint:track'), (1, 'government:complaint:stats'),
(1, 'government:asset'), (1, 'government:asset:view'),
(1, 'government:street'), (1, 'government:street:supervise'),
(1, 'government:community'), (1, 'government:community:service'),
(1, 'government:portal'), (1, 'government:portal:info'), (1, 'government:portal:rule'), (1, 'government:portal:category'),
-- GOV_AREA (区级管理员)
(2, 'government:dashboard'),
(2, 'government:staff'), (2, 'government:staff:list'), (2, 'government:staff:add'), (2, 'government:staff:edit'), (2, 'government:staff:delete'),
(2, 'government:roles'), (2, 'government:roles:list'), (2, 'government:roles:add'), (2, 'government:roles:edit'),
(2, 'government:complaint'), (2, 'government:complaint:list'), (2, 'government:complaint:track'), (2, 'government:complaint:stats'),
(2, 'government:asset'), (2, 'government:asset:view'),
(2, 'government:portal'), (2, 'government:portal:info'), (2, 'government:portal:rule'), (2, 'government:portal:category'),
-- GOV_STREET (街道办人员)
(3, 'government:dashboard'),
(3, 'government:complaint'), (3, 'government:complaint:list'), (3, 'government:complaint:track'),
(3, 'government:street'), (3, 'government:street:supervise'),
(3, 'government:community'), (3, 'government:community:service');

-- 物业端角色权限 (PROP_ADMIN 拥有所有物业端权限)
INSERT INTO `role_permissions` (`role_id`, `perm_code`)
SELECT 10, `perm_code` FROM `permissions` WHERE `perm_code` LIKE 'property:%';

-- PROP_MANAGER (项目经理)
INSERT INTO `role_permissions` (`role_id`, `perm_code`) VALUES
(11, 'property:dashboard'),
(11, 'property:daily'), (11, 'property:daily:todo'), (11, 'property:daily:schedule'), (11, 'property:daily:notice'), (11, 'property:daily:document'),
(11, 'property:service'), (11, 'property:service:standard'), (11, 'property:service:satisfaction'), (11, 'property:service:value'),
(11, 'property:security'), (11, 'property:security:check'), (11, 'property:security:fire'), (11, 'property:security:emergency'),
(11, 'property:finance'), (11, 'property:finance:fee'), (11, 'property:finance:fee-items'), (11, 'property:finance:charge-rules'),
(11, 'property:finance:bills'), (11, 'property:finance:payments'), (11, 'property:finance:collection'), (11, 'property:finance:reports'),
(11, 'property:device'), (11, 'property:device:asset'), (11, 'property:device:inspect'), (11, 'property:device:energy'),
(11, 'property:staff'), (11, 'property:staff:list'), (11, 'property:staff:add'), (11, 'property:staff:edit'), (11, 'property:staff:delete'),
(11, 'property:staff:archive'), (11, 'property:staff:attendance'), (11, 'property:staff:performance'),
(11, 'property:roles'), (11, 'property:roles:list'), (11, 'property:roles:add'), (11, 'property:roles:edit'),
(11, 'property:complaint'), (11, 'property:complaint:list'), (11, 'property:complaint:stats'),
(11, 'property:workorder'), (11, 'property:workorder:list'), (11, 'property:workorder:stats'),
(11, 'property:contract'),
(11, 'property:asset'), (11, 'property:asset:overview'), (11, 'property:asset:building'), (11, 'property:asset:house'), (11, 'property:asset:parking'), (11, 'property:asset:sync'),
(11, 'property:owner'), (11, 'property:owner:archive'), (11, 'property:owner:members'), (11, 'property:owner:accounts'),
(11, 'property:merchant'), (11, 'property:merchant:list'),
(11, 'property:quality'),
(11, 'property:owner-config'), (11, 'property:owner-config:banner'), (11, 'property:owner-config:quick-menu'), (11, 'property:owner-config:service'),
(11, 'property:organization'), (11, 'property:organization:list'), (11, 'property:organization:add'), (11, 'property:organization:edit'), (11, 'property:organization:delete');

-- PROP_CUSTOMER_SVC (客服人员)
INSERT INTO `role_permissions` (`role_id`, `perm_code`) VALUES
(12, 'property:dashboard'), (12, 'property:daily:todo'), (12, 'property:complaint'), (12, 'property:workorder');

-- PROP_ENGINEER (工程人员)
INSERT INTO `role_permissions` (`role_id`, `perm_code`) VALUES
(13, 'property:dashboard'), (13, 'property:daily:todo'), (13, 'property:workorder'), (13, 'property:device:asset');

-- PROP_SECURITY (安保人员)
INSERT INTO `role_permissions` (`role_id`, `perm_code`) VALUES
(14, 'property:dashboard'), (14, 'property:daily:todo'), (14, 'property:security:check');

-- PROP_FINANCE (财务人员)
INSERT INTO `role_permissions` (`role_id`, `perm_code`) VALUES
(15, 'property:dashboard'), (15, 'property:finance'), (15, 'property:finance:fee');

-- 商家端角色权限
INSERT INTO `role_permissions` (`role_id`, `perm_code`) VALUES
-- MER_ADMIN (商家管理员)
(20, 'merchant:dashboard'),
(20, 'merchant:staff'), (20, 'merchant:staff:list'), (20, 'merchant:staff:add'), (20, 'merchant:staff:edit'), (20, 'merchant:staff:delete'),
(20, 'merchant:roles'), (20, 'merchant:roles:list'), (20, 'merchant:roles:add'), (20, 'merchant:roles:edit'),
(20, 'merchant:shop'), (20, 'merchant:shop:info'),
(20, 'merchant:product'), (20, 'merchant:product:list'),
(20, 'merchant:order'),
(20, 'merchant:marketing'), (20, 'merchant:marketing:coupon'),
(20, 'merchant:finance'),
(20, 'merchant:customer'), (20, 'merchant:customer:list'),
(20, 'merchant:data'),
-- MER_STAFF (店员)
(21, 'merchant:dashboard'), (21, 'merchant:order'), (21, 'merchant:customer'), (21, 'merchant:customer:list');

-- 超级管理员拥有所有权限
INSERT INTO `role_permissions` (`role_id`, `perm_code`)
SELECT 50, `perm_code` FROM `permissions`;

-- ===== 用户数据（密码使用bcrypt加密，默认密码=手机号） =====
-- 注意：密码占位符，实际初始化时通过脚本加密写入
-- 这里先插入明文密码，后续通过 initDb.js 脚本加密更新
INSERT INTO `users` (`id`, `phone`, `password`, `real_name`, `port_type`, `manage_project_ids`, `status`, `create_time`) VALUES
(1, '13800000001', '$2a$10$placeholder', '系统管理员', 'property', '[]', 1, '2026-01-01 00:00:00'),
(2, '13800000002', '$2a$10$placeholder', '张建国', 'property', '[20]', 1, '2026-01-15 09:00:00'),
(3, '13800000003', '$2a$10$placeholder', '李明霞', 'property', NULL, 1, '2026-01-15 09:00:00'),
(4, '13800000004', '$2a$10$placeholder', '王师傅', 'property', NULL, 1, '2026-01-20 10:00:00'),
(5, '13800000005', '$2a$10$placeholder', '赵保安', 'property', NULL, 1, '2026-02-01 08:00:00'),
(6, '13800000006', '$2a$10$placeholder', '刘会计', 'property', NULL, 1, '2026-02-01 08:00:00'),
(7, '13900000001', '$2a$10$placeholder', '陈局长', 'government', NULL, 1, '2026-01-01 00:00:00'),
(8, '13900000002', '$2a$10$placeholder', '周科长', 'government', NULL, 1, '2026-01-01 00:00:00'),
(9, '13700000001', '$2a$10$placeholder', '陈老板', 'merchant', NULL, 1, '2026-03-01 09:00:00'),
(10, '13700000002', '$2a$10$placeholder', '小张店员', 'merchant', NULL, 1, '2026-03-05 10:00:00'),
(11, '13600000001', '$2a$10$placeholder', '孙业主', 'owner', NULL, 1, '2026-02-15 14:00:00'),
(12, '13600000002', '$2a$10$placeholder', '周太太', 'owner', NULL, 1, '2026-02-15 14:00:00'),
(13, '13000000001', '$2a$10$placeholder', '超级管理员', 'superadmin', NULL, 1, '2026-01-01 00:00:00');

-- ===== 用户角色关联 =====
INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `org_id`, `port_type`) VALUES
(1, 1, 10, 10, 'property'),
(2, 2, 11, 20, 'property'),
(3, 2, 30, 21, 'owner'),
(4, 3, 12, 20, 'property'),
(5, 4, 13, 20, 'property'),
(6, 5, 14, 20, 'property'),
(7, 6, 15, 10, 'property'),
(8, 7, 1, 1, 'government'),
(9, 8, 2, 2, 'government'),
(10, 9, 20, 30, 'merchant'),
(11, 10, 21, 30, 'merchant'),
(12, 11, 30, 20, 'owner'),
(13, 12, 31, 20, 'owner'),
(14, 13, 50, 10, 'superadmin'),
(15, 13, 50, 1, 'government'),
(16, 13, 50, 10, 'property'),
(17, 13, 50, 30, 'merchant');
