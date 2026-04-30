// ===== Mock 数据 =====
import type { Organization, Role, User, UserRole, Permission } from './types';
export {};

// ===== 组织数据 =====
export const mockOrganizations: Organization[] = [
  // 政府端组织
  { id: 1, parentId: null, orgType: 'city', name: '杭州市', code: 'HZ', sortOrder: 1, status: 1 },
  { id: 2, parentId: 1, orgType: 'area', name: '西湖区', code: 'HZ-XH', sortOrder: 1, status: 1 },
  { id: 3, parentId: 1, orgType: 'area', name: '上城区', code: 'HZ-SC', sortOrder: 2, status: 1 },
  { id: 4, parentId: 2, orgType: 'street', name: '文新街道', code: 'HZ-XH-WX', sortOrder: 1, status: 1 },
  { id: 5, parentId: 2, orgType: 'street', name: '古荡街道', code: 'HZ-XH-GD', sortOrder: 2, status: 1 },
  // 物业公司
  { id: 10, parentId: null, orgType: 'company', name: '绿城物业服务集团', code: 'PROP-LC', contactPerson: '王总', contactPhone: '13800138001', sortOrder: 1, status: 1 },
  { id: 11, parentId: null, orgType: 'company', name: '万科物业服务有限公司', code: 'PROP-WK', contactPerson: '李总', contactPhone: '13800138002', sortOrder: 2, status: 1 },
  // 小区项目
  { id: 20, parentId: 10, orgType: 'project', name: '桂花城小区', code: 'LC-GHC', contactPerson: '张经理', contactPhone: '13800138101', address: '西湖区文新街道桂花路88号', sortOrder: 1, status: 1 },
  { id: 21, parentId: 10, orgType: 'project', name: '春江花月小区', code: 'LC-CJHY', contactPerson: '赵经理', contactPhone: '13800138102', address: '西湖区之江路128号', sortOrder: 2, status: 1 },
  { id: 22, parentId: 11, orgType: 'project', name: '万科魅力之城', code: 'WK-MLZC', contactPerson: '刘经理', contactPhone: '13800138201', address: '上城区九堡镇', sortOrder: 1, status: 1 },
  // 商家店铺
  { id: 30, parentId: 20, orgType: 'shop', name: '桂花城便民超市', code: 'SHOP-GHC-CS', contactPerson: '陈老板', contactPhone: '13800139101', sortOrder: 1, status: 1 },
  { id: 31, parentId: 20, orgType: 'shop', name: '桂花城干洗店', code: 'SHOP-GHC-GX', contactPerson: '周老板', contactPhone: '13800139102', sortOrder: 2, status: 1 },
];

// ===== 权限数据 =====
export const mockPermissions: Permission[] = [
  // ===== 物业管理端权限 =====
  { id: 100, permCode: 'property:dashboard', permName: '工作台', parentId: null, path: '/property/dashboard', type: 'menu', sortOrder: 1 },
  { id: 101, permCode: 'property:daily', permName: '日常管理', parentId: null, type: 'menu', sortOrder: 2 },
  { id: 102, permCode: 'property:daily:todo', permName: '待办事项', parentId: 101, path: '/property/daily/todo', type: 'menu', sortOrder: 1 },
  { id: 103, permCode: 'property:daily:schedule', permName: '值班排班', parentId: 101, path: '/property/daily/schedule', type: 'menu', sortOrder: 2 },
  { id: 104, permCode: 'property:daily:notice', permName: '通知公告', parentId: 101, path: '/property/daily/notice', type: 'menu', sortOrder: 3 },
  { id: 105, permCode: 'property:service', permName: '服务管理', parentId: null, type: 'menu', sortOrder: 3 },
  { id: 106, permCode: 'property:service:standard', permName: '服务标准', parentId: 105, path: '/property/service/standard', type: 'menu', sortOrder: 1 },
  { id: 107, permCode: 'property:service:satisfaction', permName: '满意度评价', parentId: 105, path: '/property/service/satisfaction', type: 'menu', sortOrder: 2 },
  { id: 108, permCode: 'property:security', permName: '安全管理', parentId: null, type: 'menu', sortOrder: 4 },
  { id: 109, permCode: 'property:security:check', permName: '安全检查', parentId: 108, path: '/property/security/check', type: 'menu', sortOrder: 1 },
  { id: 110, permCode: 'property:finance', permName: '财务管理', parentId: null, type: 'menu', sortOrder: 5 },
  { id: 111, permCode: 'property:finance:fee', permName: '物业费管理', parentId: 110, path: '/property/finance/fee', type: 'menu', sortOrder: 1 },
  { id: 112, permCode: 'property:device', permName: '设备管理', parentId: null, type: 'menu', sortOrder: 6 },
  { id: 113, permCode: 'property:device:asset', permName: '设备台账', parentId: 112, path: '/property/device/asset', type: 'menu', sortOrder: 1 },
  { id: 114, permCode: 'property:staff', permName: '人员管理', parentId: null, type: 'menu', sortOrder: 7 },
  { id: 115, permCode: 'property:staff:list', permName: '人员列表', parentId: 114, path: '/property/staff/list', type: 'menu', sortOrder: 1 },
  { id: 116, permCode: 'property:staff:add', permName: '新增人员', parentId: 114, path: '/property/staff/add', type: 'button', sortOrder: 2 },
  { id: 117, permCode: 'property:staff:edit', permName: '编辑人员', parentId: 114, path: '/property/staff/edit', type: 'button', sortOrder: 3 },
  { id: 118, permCode: 'property:staff:delete', permName: '删除人员', parentId: 114, type: 'button', sortOrder: 4 },
  { id: 119, permCode: 'property:roles', permName: '角色管理', parentId: null, type: 'menu', sortOrder: 8 },
  { id: 120, permCode: 'property:roles:list', permName: '角色列表', parentId: 119, path: '/property/roles', type: 'menu', sortOrder: 1 },
  { id: 121, permCode: 'property:roles:add', permName: '新增角色', parentId: 119, type: 'button', sortOrder: 2 },
  { id: 122, permCode: 'property:roles:edit', permName: '编辑角色', parentId: 119, type: 'button', sortOrder: 3 },
  { id: 123, permCode: 'property:complaint', permName: '投诉处理', parentId: null, path: '/property/complaint', type: 'menu', sortOrder: 9 },
  { id: 124, permCode: 'property:workorder', permName: '工单管理', parentId: null, path: '/property/workorder', type: 'menu', sortOrder: 10 },
  { id: 125, permCode: 'property:contract', permName: '合同管理', parentId: null, path: '/property/contract', type: 'menu', sortOrder: 11 },
  // 资产管理
  { id: 126, permCode: 'property:asset', permName: '资产管理', parentId: null, type: 'menu', sortOrder: 12 },
  { id: 127, permCode: 'property:asset:overview', permName: '资产总览', parentId: 126, path: '/property/asset/overview', type: 'menu', sortOrder: 1 },
  { id: 128, permCode: 'property:asset:building', permName: '楼栋管理', parentId: 126, path: '/property/asset/building', type: 'menu', sortOrder: 2 },
  { id: 129, permCode: 'property:asset:house', permName: '房屋管理', parentId: 126, path: '/property/asset/house', type: 'menu', sortOrder: 3 },
  { id: 130, permCode: 'property:asset:parking', permName: '车位管理', parentId: 126, path: '/property/asset/parking', type: 'menu', sortOrder: 4 },
  { id: 131, permCode: 'property:asset:sync', permName: '数据同步', parentId: 126, path: '/property/asset/sync', type: 'menu', sortOrder: 5 },
  // 业主管理
  { id: 132, permCode: 'property:owner', permName: '业主管理', parentId: null, type: 'menu', sortOrder: 13 },
  { id: 133, permCode: 'property:owner:archive', permName: '业主档案', parentId: 132, path: '/property/owner/archive', type: 'menu', sortOrder: 1 },
  // 商家管理
  { id: 134, permCode: 'property:merchant', permName: '商家管理', parentId: null, type: 'menu', sortOrder: 14 },
  { id: 135, permCode: 'property:merchant:list', permName: '商家列表', parentId: 134, path: '/property/merchant/list', type: 'menu', sortOrder: 1 },
  // 日常管理 - 补充
  { id: 136, permCode: 'property:daily:document', permName: '内部文件', parentId: 101, path: '/property/daily/document', type: 'menu', sortOrder: 4 },
  // 服务管理 - 补充
  { id: 137, permCode: 'property:service:value', permName: '增值服务', parentId: 105, path: '/property/service/value', type: 'menu', sortOrder: 3 },
  // 安全管理 - 补充
  { id: 138, permCode: 'property:security:fire', permName: '消防管理', parentId: 108, path: '/property/security/fire', type: 'menu', sortOrder: 2 },
  { id: 139, permCode: 'property:security:emergency', permName: '应急预案', parentId: 108, path: '/property/security/emergency', type: 'menu', sortOrder: 3 },
  // 财务管理 - 子菜单
  { id: 140, permCode: 'property:finance:fee-items', permName: '费用项目管理', parentId: 110, path: '/property/finance/fee-items', type: 'menu', sortOrder: 2 },
  { id: 141, permCode: 'property:finance:charge-rules', permName: '收费标准设置', parentId: 110, path: '/property/finance/charge-rules', type: 'menu', sortOrder: 3 },
  { id: 142, permCode: 'property:finance:bills', permName: '账单管理', parentId: 110, path: '/property/finance/bills', type: 'menu', sortOrder: 4 },
  { id: 143, permCode: 'property:finance:payments', permName: '缴费管理', parentId: 110, path: '/property/finance/payments', type: 'menu', sortOrder: 5 },
  { id: 144, permCode: 'property:finance:collection', permName: '催缴管理', parentId: 110, path: '/property/finance/collection', type: 'menu', sortOrder: 6 },
  { id: 145, permCode: 'property:finance:reports', permName: '收费报表', parentId: 110, path: '/property/finance/reports', type: 'menu', sortOrder: 7 },
  // 设备管理 - 补充
  { id: 146, permCode: 'property:device:inspect', permName: '设备巡检', parentId: 112, path: '/property/device/inspect', type: 'menu', sortOrder: 2 },
  { id: 147, permCode: 'property:device:energy', permName: '能耗管理', parentId: 112, path: '/property/device/energy', type: 'menu', sortOrder: 3 },
  // 人员管理 - 补充
  { id: 148, permCode: 'property:staff:archive', permName: '员工档案', parentId: 114, path: '/property/staff/archive', type: 'menu', sortOrder: 5 },
  { id: 149, permCode: 'property:staff:attendance', permName: '考勤管理', parentId: 114, path: '/property/staff/attendance', type: 'menu', sortOrder: 6 },
  { id: 150, permCode: 'property:staff:performance', permName: '绩效考核', parentId: 114, path: '/property/staff/performance', type: 'menu', sortOrder: 7 },
  // 投诉处理 - 补充
  { id: 151, permCode: 'property:complaint:list', permName: '投诉受理', parentId: 123, path: '/property/complaint/list', type: 'menu', sortOrder: 1 },
  { id: 152, permCode: 'property:complaint:stats', permName: '投诉统计', parentId: 123, path: '/property/complaint/stats', type: 'menu', sortOrder: 2 },
  // 工单管理 - 补充
  { id: 153, permCode: 'property:workorder:list', permName: '工单管理', parentId: 124, path: '/property/workorder/list', type: 'menu', sortOrder: 1 },
  { id: 154, permCode: 'property:workorder:stats', permName: '工单统计', parentId: 124, path: '/property/workorder/stats', type: 'menu', sortOrder: 2 },
  // 品质管理
  { id: 155, permCode: 'property:quality', permName: '品质管理', parentId: null, path: '/property/quality', type: 'menu', sortOrder: 15 },
  // 业主端管理
  { id: 156, permCode: 'property:owner-config', permName: '业主端管理', parentId: null, type: 'menu', sortOrder: 16 },
  { id: 157, permCode: 'property:owner-config:banner', permName: 'Banner配置管理', parentId: 156, path: '/property/owner-config/banner', type: 'menu', sortOrder: 1 },
  { id: 158, permCode: 'property:owner-config:quick-menu', permName: '常用菜单配置', parentId: 156, path: '/property/owner-config/quick-menu', type: 'menu', sortOrder: 2 },
  { id: 159, permCode: 'property:owner-config:service', permName: '服务功能配置', parentId: 156, path: '/property/owner-config/service', type: 'menu', sortOrder: 3 },
  // 组织架构管理
  { id: 160, permCode: 'property:organization', permName: '组织架构管理', parentId: null, type: 'menu', sortOrder: 17 },
  { id: 161, permCode: 'property:organization:list', permName: '组织列表', parentId: 160, path: '/property/organization', type: 'menu', sortOrder: 1 },
  { id: 162, permCode: 'property:organization:add', permName: '新增组织', parentId: 160, type: 'button', sortOrder: 2 },
  { id: 163, permCode: 'property:organization:edit', permName: '编辑组织', parentId: 160, type: 'button', sortOrder: 3 },
  { id: 164, permCode: 'property:organization:delete', permName: '删除组织', parentId: 160, type: 'button', sortOrder: 4 },

  // ===== 政府监管端权限 =====
  { id: 200, permCode: 'government:dashboard', permName: '工作台', parentId: null, path: '/government/dashboard', type: 'menu', sortOrder: 1 },
  { id: 201, permCode: 'government:staff', permName: '系统管理', parentId: null, type: 'menu', sortOrder: 2 },
  { id: 202, permCode: 'government:staff:list', permName: '账号管理', parentId: 201, path: '/government/staff/list', type: 'menu', sortOrder: 1 },
  { id: 203, permCode: 'government:staff:add', permName: '新增账号', parentId: 201, path: '/government/staff/add', type: 'button', sortOrder: 2 },
  { id: 204, permCode: 'government:staff:edit', permName: '编辑账号', parentId: 201, path: '/government/staff/edit', type: 'button', sortOrder: 3 },
  { id: 205, permCode: 'government:staff:delete', permName: '删除账号', parentId: 201, type: 'button', sortOrder: 4 },
  { id: 206, permCode: 'government:roles', permName: '角色管理', parentId: null, type: 'menu', sortOrder: 3 },
  { id: 207, permCode: 'government:roles:list', permName: '角色列表', parentId: 206, path: '/government/roles', type: 'menu', sortOrder: 1 },
  { id: 208, permCode: 'government:roles:add', permName: '新增角色', parentId: 206, type: 'button', sortOrder: 2 },
  { id: 209, permCode: 'government:roles:edit', permName: '编辑角色', parentId: 206, type: 'button', sortOrder: 3 },
  { id: 210, permCode: 'government:policy', permName: '政策监管', parentId: null, type: 'menu', sortOrder: 4 },
  { id: 211, permCode: 'government:policy:list', permName: '政策法规管理', parentId: 210, path: '/government/policy', type: 'menu', sortOrder: 1 },
  { id: 212, permCode: 'government:policy:enforce', permName: '政策执行督查', parentId: 210, path: '/government/policy/enforce', type: 'menu', sortOrder: 2 },
  { id: 213, permCode: 'government:qualification', permName: '行业管理', parentId: null, type: 'menu', sortOrder: 5 },
  { id: 214, permCode: 'government:qualification:review', permName: '资质审核', parentId: 213, path: '/government/qualification/review', type: 'menu', sortOrder: 1 },
  { id: 215, permCode: 'government:qualification:cert', permName: '物业备案管理', parentId: 213, path: '/government/qualification/cert', type: 'menu', sortOrder: 2 },
  { id: 216, permCode: 'government:merchant', permName: '商家监管', parentId: null, type: 'menu', sortOrder: 6 },
  { id: 217, permCode: 'government:merchant:list', permName: '商家信息查看', parentId: 216, path: '/government/merchant/list', type: 'menu', sortOrder: 1 },
  { id: 218, permCode: 'government:complaint', permName: '投诉处理', parentId: null, type: 'menu', sortOrder: 7 },
  { id: 219, permCode: 'government:complaint:list', permName: '投诉受理', parentId: 218, path: '/government/complaint/list', type: 'menu', sortOrder: 1 },
  { id: 220, permCode: 'government:complaint:track', permName: '投诉督办', parentId: 218, path: '/government/complaint/track', type: 'menu', sortOrder: 2 },
  { id: 221, permCode: 'government:complaint:stats', permName: '投诉统计', parentId: 218, path: '/government/complaint/stats', type: 'menu', sortOrder: 3 },
  { id: 222, permCode: 'government:asset', permName: '资产查看', parentId: null, type: 'menu', sortOrder: 8 },
  { id: 223, permCode: 'government:asset:view', permName: '小区资产查看', parentId: 222, path: '/government/asset/view', type: 'menu', sortOrder: 1 },
  { id: 224, permCode: 'government:street', permName: '街道物业管理', parentId: null, type: 'menu', sortOrder: 9 },
  { id: 225, permCode: 'government:street:supervise', permName: '日常监督', parentId: 224, path: '/government/street/supervise', type: 'menu', sortOrder: 1 },
  { id: 226, permCode: 'government:community', permName: '社区管理', parentId: null, type: 'menu', sortOrder: 10 },
  { id: 227, permCode: 'government:community:service', permName: '基层服务', parentId: 226, path: '/government/community/service', type: 'menu', sortOrder: 1 },
  { id: 228, permCode: 'government:portal', permName: '门户内容管理', parentId: null, type: 'menu', sortOrder: 11 },
  { id: 229, permCode: 'government:portal:info', permName: '政策资讯管理', parentId: 228, path: '/government/policy/info', type: 'menu', sortOrder: 1 },
  { id: 230, permCode: 'government:portal:rule', permName: '规章制度管理', parentId: 228, path: '/government/rule', type: 'menu', sortOrder: 2 },
  { id: 231, permCode: 'government:portal:category', permName: '分类管理', parentId: 228, path: '/government/policy/category', type: 'menu', sortOrder: 3 },

  // ===== 商家管理端权限 =====
  { id: 300, permCode: 'merchant:dashboard', permName: '工作台', parentId: null, path: '/merchant/dashboard', type: 'menu', sortOrder: 1 },
  { id: 301, permCode: 'merchant:staff', permName: '系统管理', parentId: null, type: 'menu', sortOrder: 2 },
  { id: 302, permCode: 'merchant:staff:list', permName: '账号管理', parentId: 301, path: '/merchant/staff/list', type: 'menu', sortOrder: 1 },
  { id: 303, permCode: 'merchant:staff:add', permName: '新增账号', parentId: 301, path: '/merchant/staff/add', type: 'button', sortOrder: 2 },
  { id: 304, permCode: 'merchant:staff:edit', permName: '编辑账号', parentId: 301, path: '/merchant/staff/edit', type: 'button', sortOrder: 3 },
  { id: 305, permCode: 'merchant:staff:delete', permName: '删除账号', parentId: 301, type: 'button', sortOrder: 4 },
  { id: 306, permCode: 'merchant:roles', permName: '角色管理', parentId: null, type: 'menu', sortOrder: 3 },
  { id: 307, permCode: 'merchant:roles:list', permName: '角色列表', parentId: 306, path: '/merchant/roles', type: 'menu', sortOrder: 1 },
  { id: 308, permCode: 'merchant:roles:add', permName: '新增角色', parentId: 306, type: 'button', sortOrder: 2 },
  { id: 309, permCode: 'merchant:roles:edit', permName: '编辑角色', parentId: 306, type: 'button', sortOrder: 3 },
  { id: 310, permCode: 'merchant:shop', permName: '店铺管理', parentId: null, type: 'menu', sortOrder: 4 },
  { id: 311, permCode: 'merchant:shop:info', permName: '店铺信息', parentId: 310, path: '/merchant/shop/info', type: 'menu', sortOrder: 1 },
  { id: 312, permCode: 'merchant:product', permName: '商品/服务管理', parentId: null, type: 'menu', sortOrder: 5 },
  { id: 313, permCode: 'merchant:product:list', permName: '商品管理', parentId: 312, path: '/merchant/product/list', type: 'menu', sortOrder: 1 },
  { id: 314, permCode: 'merchant:order', permName: '订单管理', parentId: null, path: '/merchant/order', type: 'menu', sortOrder: 6 },
  { id: 315, permCode: 'merchant:marketing', permName: '营销活动', parentId: null, type: 'menu', sortOrder: 7 },
  { id: 316, permCode: 'merchant:marketing:coupon', permName: '优惠券管理', parentId: 315, path: '/merchant/marketing/coupon', type: 'menu', sortOrder: 1 },
  { id: 317, permCode: 'merchant:finance', permName: '财务管理', parentId: null, path: '/merchant/finance', type: 'menu', sortOrder: 8 },
  { id: 318, permCode: 'merchant:customer', permName: '客户管理', parentId: null, type: 'menu', sortOrder: 9 },
  { id: 319, permCode: 'merchant:customer:list', permName: '客户列表', parentId: 318, path: '/merchant/customer/list', type: 'menu', sortOrder: 1 },
  { id: 320, permCode: 'merchant:data', permName: '数据统计', parentId: null, path: '/merchant/data', type: 'menu', sortOrder: 10 },
];

// ===== 角色数据 =====
export const mockRoles: Role[] = [
  // 政府端角色
  { id: 1, roleCode: 'GOV_ADMIN', roleName: '市级管理员', portType: 'government', description: '住建局系统管理员，可查看全市数据', status: 1, permissions: [
    'government:dashboard',
    'government:staff', 'government:staff:list', 'government:staff:add', 'government:staff:edit', 'government:staff:delete',
    'government:roles', 'government:roles:list', 'government:roles:add', 'government:roles:edit',
    'government:policy', 'government:policy:list', 'government:policy:enforce',
    'government:qualification', 'government:qualification:review', 'government:qualification:cert',
    'government:merchant', 'government:merchant:list',
    'government:complaint', 'government:complaint:list', 'government:complaint:track', 'government:complaint:stats',
    'government:asset', 'government:asset:view',
    'government:street', 'government:street:supervise',
    'government:community', 'government:community:service',
    'government:portal', 'government:portal:info', 'government:portal:rule', 'government:portal:category',
  ] },
  { id: 2, roleCode: 'GOV_AREA', roleName: '区级管理员', portType: 'government', description: '区住建局人员，可查看本区数据', status: 1, permissions: [
    'government:dashboard',
    'government:staff', 'government:staff:list', 'government:staff:add', 'government:staff:edit', 'government:staff:delete',
    'government:roles', 'government:roles:list', 'government:roles:add', 'government:roles:edit',
    'government:complaint', 'government:complaint:list', 'government:complaint:track', 'government:complaint:stats',
    'government:asset', 'government:asset:view',
    'government:portal', 'government:portal:info', 'government:portal:rule', 'government:portal:category',
  ] },
  { id: 3, roleCode: 'GOV_STREET', roleName: '街道办人员', portType: 'government', description: '街道物业科人员', status: 1, permissions: [
    'government:dashboard',
    'government:complaint', 'government:complaint:list', 'government:complaint:track',
    'government:street', 'government:street:supervise',
    'government:community', 'government:community:service',
  ] },
  // 物业管理端角色
  { id: 10, roleCode: 'PROP_ADMIN', roleName: '公司管理员', portType: 'property', description: '物业公司超级管理员，拥有所有权限', status: 1, permissions: mockPermissions.map(p => p.permCode) },
  { id: 11, roleCode: 'PROP_MANAGER', roleName: '项目经理', portType: 'property', description: '单个小区负责人', status: 1, permissions: ['property:dashboard', 'property:daily', 'property:daily:todo', 'property:daily:schedule', 'property:daily:notice', 'property:daily:document', 'property:service', 'property:service:standard', 'property:service:satisfaction', 'property:service:value', 'property:security', 'property:security:check', 'property:security:fire', 'property:security:emergency', 'property:finance', 'property:finance:fee', 'property:finance:fee-items', 'property:finance:charge-rules', 'property:finance:bills', 'property:finance:payments', 'property:finance:collection', 'property:finance:reports', 'property:device', 'property:device:asset', 'property:device:inspect', 'property:device:energy', 'property:staff', 'property:staff:list', 'property:staff:add', 'property:staff:edit', 'property:staff:delete', 'property:staff:archive', 'property:staff:attendance', 'property:staff:performance', 'property:roles', 'property:roles:list', 'property:roles:add', 'property:roles:edit', 'property:complaint', 'property:complaint:list', 'property:complaint:stats', 'property:workorder', 'property:workorder:list', 'property:workorder:stats', 'property:contract', 'property:asset', 'property:asset:overview', 'property:asset:building', 'property:asset:house', 'property:asset:parking', 'property:asset:sync', 'property:owner', 'property:owner:archive', 'property:merchant', 'property:merchant:list', 'property:quality', 'property:owner-config', 'property:owner-config:banner', 'property:owner-config:quick-menu', 'property:owner-config:service', 'property:organization', 'property:organization:list', 'property:organization:add', 'property:organization:edit', 'property:organization:delete'] },
  { id: 12, roleCode: 'PROP_CUSTOMER_SVC', roleName: '客服人员', portType: 'property', description: '接待业主投诉、报修', status: 1, permissions: ['property:dashboard', 'property:daily:todo', 'property:complaint', 'property:workorder'] },
  { id: 13, roleCode: 'PROP_ENGINEER', roleName: '工程人员', portType: 'property', description: '维修工，处理工单', status: 1, permissions: ['property:dashboard', 'property:daily:todo', 'property:workorder', 'property:device:asset'] },
  { id: 14, roleCode: 'PROP_SECURITY', roleName: '安保人员', portType: 'property', description: '保安/保洁/巡检', status: 1, permissions: ['property:dashboard', 'property:daily:todo', 'property:security:check'] },
  { id: 15, roleCode: 'PROP_FINANCE', roleName: '财务人员', portType: 'property', description: '收费管理、财务报表', status: 1, permissions: ['property:dashboard', 'property:finance', 'property:finance:fee'] },
  // 商家端角色
  { id: 20, roleCode: 'MER_ADMIN', roleName: '商家管理员', portType: 'merchant', description: '店铺老板/负责人', status: 1, permissions: [
    'merchant:dashboard',
    'merchant:staff', 'merchant:staff:list', 'merchant:staff:add', 'merchant:staff:edit', 'merchant:staff:delete',
    'merchant:roles', 'merchant:roles:list', 'merchant:roles:add', 'merchant:roles:edit',
    'merchant:shop', 'merchant:shop:info',
    'merchant:product', 'merchant:product:list',
    'merchant:order',
    'merchant:marketing', 'merchant:marketing:coupon',
    'merchant:finance',
    'merchant:customer', 'merchant:customer:list',
    'merchant:data',
  ] },
  { id: 21, roleCode: 'MER_STAFF', roleName: '店员', portType: 'merchant', description: '接单/服务人员', status: 1, permissions: [
    'merchant:dashboard',
    'merchant:order',
    'merchant:customer', 'merchant:customer:list',
  ] },
  // 业主端角色
  { id: 30, roleCode: 'OWNER_OWNER', roleName: '业主', portType: 'owner', description: '房产持有人', status: 1, permissions: [] },
  { id: 31, roleCode: 'OWNER_FAMILY', roleName: '家庭成员', portType: 'owner', description: '同住人', status: 1, permissions: [] },
  { id: 32, roleCode: 'OWNER_TENANT', roleName: '租户', portType: 'owner', description: '租赁人', status: 1, permissions: [] },
  // 公众号角色
  { id: 40, roleCode: 'WECHAT_OPER', roleName: '公众号运营者', portType: 'wechat', description: '管理消息模板、推送', status: 1, permissions: [] },
  // 超级管理端角色
  { id: 50, roleCode: 'SUPER_ADMIN', roleName: '超级管理员', portType: 'superadmin', description: '系统超级管理员，拥有所有端口全部权限', status: 1, permissions: mockPermissions.map(p => p.permCode) },
];

// ===== 用户数据 =====
export const mockUsers: User[] = [
  // 物业公司管理员（默认超级管理员）- 可管理所有小区
  { id: 1, phone: '13800000001', password: '13800000001', realName: '系统管理员', portType: 'property', status: 1, manageProjectIds: [], createTime: '2026-01-01 00:00:00' },
  // 物业端用户
  { id: 2, phone: '13800000002', password: '13800000002', realName: '张建国', portType: 'property', status: 1, manageProjectIds: [20], createTime: '2026-01-15 09:00:00' },
  { id: 3, phone: '13800000003', password: '13800000003', realName: '李明霞', portType: 'property', status: 1, createTime: '2026-01-15 09:00:00' },
  { id: 4, phone: '13800000004', password: '13800000004', realName: '王师傅', portType: 'property', status: 1, createTime: '2026-01-20 10:00:00' },
  { id: 5, phone: '13800000005', password: '13800000005', realName: '赵保安', portType: 'property', status: 1, createTime: '2026-02-01 08:00:00' },
  { id: 6, phone: '13800000006', password: '13800000006', realName: '刘会计', portType: 'property', status: 1, createTime: '2026-02-01 08:00:00' },
  // 政府端用户
  { id: 7, phone: '13900000001', password: '13900000001', realName: '陈局长', portType: 'government', status: 1, createTime: '2026-01-01 00:00:00' },
  { id: 8, phone: '13900000002', password: '13900000002', realName: '周科长', portType: 'government', status: 1, createTime: '2026-01-01 00:00:00' },
  // 商家端用户
  { id: 9, phone: '13700000001', password: '13700000001', realName: '陈老板', portType: 'merchant', status: 1, createTime: '2026-03-01 09:00:00' },
  { id: 10, phone: '13700000002', password: '13700000002', realName: '小张店员', portType: 'merchant', status: 1, createTime: '2026-03-05 10:00:00' },
  // 业主
  { id: 11, phone: '13600000001', password: '13600000001', realName: '孙业主', portType: 'owner', status: 1, createTime: '2026-02-15 14:00:00' },
  { id: 12, phone: '13600000002', password: '13600000002', realName: '周太太', portType: 'owner', status: 1, createTime: '2026-02-15 14:00:00' },
  // 超级管理端用户
  { id: 13, phone: '13000000001', password: '13000000001', realName: '超级管理员', portType: 'superadmin', status: 1, createTime: '2026-01-01 00:00:00' },
];

// ===== 用户角色关联 =====
export const mockUserRoles: UserRole[] = [
  // 系统管理员 - 物业公司管理员
  { id: 1, userId: 1, roleId: 10, orgId: 10, portType: 'property' }, // 绿城物业 - 公司管理员
  // 张建国 - 项目经理（桂花城小区）
  { id: 2, userId: 2, roleId: 11, orgId: 20, portType: 'property' },
  // 张建国 - 同时也是业主（春江花月小区）
  { id: 3, userId: 2, roleId: 30, orgId: 21, portType: 'owner' },
  // 李明霞 - 客服人员（桂花城小区）
  { id: 4, userId: 3, roleId: 12, orgId: 20, portType: 'property' },
  // 王师傅 - 工程人员（桂花城小区）
  { id: 5, userId: 4, roleId: 13, orgId: 20, portType: 'property' },
  // 赵保安 - 安保人员（桂花城小区）
  { id: 6, userId: 5, roleId: 14, orgId: 20, portType: 'property' },
  // 刘会计 - 财务人员（绿城物业）
  { id: 7, userId: 6, roleId: 15, orgId: 10, portType: 'property' },
  // 陈局长 - 市级管理员
  { id: 8, userId: 7, roleId: 1, orgId: 1, portType: 'government' },
  // 周科长 - 区级管理员（西湖区）
  { id: 9, userId: 8, roleId: 2, orgId: 2, portType: 'government' },
  // 陈老板 - 商家管理员（桂花城便民超市）
  { id: 10, userId: 9, roleId: 20, orgId: 30, portType: 'merchant' },
  // 小张店员 - 店员（桂花城便民超市）
  { id: 11, userId: 10, roleId: 21, orgId: 30, portType: 'merchant' },
  // 孙业主 - 业主（桂花城小区）
  { id: 12, userId: 11, roleId: 30, orgId: 20, portType: 'owner' },
  // 周太太 - 家庭成员（桂花城小区，孙业主的房屋）
  { id: 13, userId: 12, roleId: 31, orgId: 20, portType: 'owner' },
  // 超级管理员 - 超级管理端（可登录所有端口）
  { id: 14, userId: 13, roleId: 50, orgId: 10, portType: 'superadmin' },
  { id: 15, userId: 13, roleId: 50, orgId: 1, portType: 'government' },
  { id: 16, userId: 13, roleId: 50, orgId: 10, portType: 'property' },
  { id: 17, userId: 13, roleId: 50, orgId: 30, portType: 'merchant' },
];

// ===== 辅助函数 =====

// 根据组织ID查找组织
export function findOrgById(id: number): Organization | undefined {
  return mockOrganizations.find(o => o.id === id);
}

// 根据组织ID查找所有子组织
export function findChildOrgs(parentId: number): Organization[] {
  return mockOrganizations.filter(o => o.parentId === parentId);
}

// 根据组织ID查找所有下级组织（递归）
export function findDescendantOrgIds(orgId: number): number[] {
  const result: number[] = [orgId];
  const children = findChildOrgs(orgId);
  for (const child of children) {
    result.push(...findDescendantOrgIds(child.id));
  }
  return result;
}

// 根据角色编码查找角色
export function findRoleByCode(code: string): Role | undefined {
  return mockRoles.find(r => r.roleCode === code);
}

// 根据角色ID查找角色
export function findRoleById(id: number): Role | undefined {
  return mockRoles.find(r => r.id === id);
}

// 根据用户ID查找用户角色
export function findUserRolesByUserId(userId: number): UserRole[] {
  return mockUserRoles.filter(ur => ur.userId === userId);
}

// 根据组织类型查找组织
export function findOrgsByType(type: string): Organization[] {
  return mockOrganizations.filter(o => o.orgType === type);
}
