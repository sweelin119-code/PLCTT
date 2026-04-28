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
  // 物业管理端 - 菜单权限
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
];

// ===== 角色数据 =====
export const mockRoles: Role[] = [
  // 政府端角色
  { id: 1, roleCode: 'GOV_ADMIN', roleName: '市级管理员', portType: 'government', description: '住建局系统管理员，可查看全市数据', status: 1, permissions: [] },
  { id: 2, roleCode: 'GOV_AREA', roleName: '区级管理员', portType: 'government', description: '区住建局人员，可查看本区数据', status: 1, permissions: [] },
  { id: 3, roleCode: 'GOV_STREET', roleName: '街道办人员', portType: 'government', description: '街道物业科人员', status: 1, permissions: [] },
  // 物业管理端角色
  { id: 10, roleCode: 'PROP_ADMIN', roleName: '公司管理员', portType: 'property', description: '物业公司超级管理员，拥有所有权限', status: 1, permissions: mockPermissions.map(p => p.permCode) },
  { id: 11, roleCode: 'PROP_MANAGER', roleName: '项目经理', portType: 'property', description: '单个小区负责人', status: 1, permissions: ['property:dashboard', 'property:daily', 'property:daily:todo', 'property:daily:schedule', 'property:daily:notice', 'property:service', 'property:service:standard', 'property:service:satisfaction', 'property:security', 'property:security:check', 'property:finance', 'property:finance:fee', 'property:device', 'property:device:asset', 'property:staff', 'property:staff:list', 'property:complaint', 'property:workorder', 'property:contract'] },
  { id: 12, roleCode: 'PROP_CUSTOMER_SVC', roleName: '客服人员', portType: 'property', description: '接待业主投诉、报修', status: 1, permissions: ['property:dashboard', 'property:daily:todo', 'property:complaint', 'property:workorder'] },
  { id: 13, roleCode: 'PROP_ENGINEER', roleName: '工程人员', portType: 'property', description: '维修工，处理工单', status: 1, permissions: ['property:dashboard', 'property:daily:todo', 'property:workorder', 'property:device:asset'] },
  { id: 14, roleCode: 'PROP_SECURITY', roleName: '安保人员', portType: 'property', description: '保安/保洁/巡检', status: 1, permissions: ['property:dashboard', 'property:daily:todo', 'property:security:check'] },
  { id: 15, roleCode: 'PROP_FINANCE', roleName: '财务人员', portType: 'property', description: '收费管理、财务报表', status: 1, permissions: ['property:dashboard', 'property:finance', 'property:finance:fee'] },
  // 商家端角色
  { id: 20, roleCode: 'MER_ADMIN', roleName: '商家管理员', portType: 'merchant', description: '店铺老板/负责人', status: 1, permissions: [] },
  { id: 21, roleCode: 'MER_STAFF', roleName: '店员', portType: 'merchant', description: '接单/服务人员', status: 1, permissions: [] },
  // 业主端角色
  { id: 30, roleCode: 'OWNER_OWNER', roleName: '业主', portType: 'owner', description: '房产持有人', status: 1, permissions: [] },
  { id: 31, roleCode: 'OWNER_FAMILY', roleName: '家庭成员', portType: 'owner', description: '同住人', status: 1, permissions: [] },
  { id: 32, roleCode: 'OWNER_TENANT', roleName: '租户', portType: 'owner', description: '租赁人', status: 1, permissions: [] },
  // 公众号角色
  { id: 40, roleCode: 'WECHAT_OPER', roleName: '公众号运营者', portType: 'wechat', description: '管理消息模板、推送', status: 1, permissions: [] },
];

// ===== 用户数据 =====
export const mockUsers: User[] = [
  // 物业公司管理员（默认超级管理员）
  { id: 1, phone: '13800000001', password: '13800000001', realName: '系统管理员', status: 1, createTime: '2026-01-01 00:00:00' },
  // 物业端用户
  { id: 2, phone: '13800000002', password: '13800000002', realName: '张建国', status: 1, createTime: '2026-01-15 09:00:00' },
  { id: 3, phone: '13800000003', password: '13800000003', realName: '李明霞', status: 1, createTime: '2026-01-15 09:00:00' },
  { id: 4, phone: '13800000004', password: '13800000004', realName: '王师傅', status: 1, createTime: '2026-01-20 10:00:00' },
  { id: 5, phone: '13800000005', password: '13800000005', realName: '赵保安', status: 1, createTime: '2026-02-01 08:00:00' },
  { id: 6, phone: '13800000006', password: '13800000006', realName: '刘会计', status: 1, createTime: '2026-02-01 08:00:00' },
  // 政府端用户
  { id: 7, phone: '13900000001', password: '13900000001', realName: '陈局长', status: 1, createTime: '2026-01-01 00:00:00' },
  { id: 8, phone: '13900000002', password: '13900000002', realName: '周科长', status: 1, createTime: '2026-01-01 00:00:00' },
  // 商家端用户
  { id: 9, phone: '13700000001', password: '13700000001', realName: '陈老板', status: 1, createTime: '2026-03-01 09:00:00' },
  { id: 10, phone: '13700000002', password: '13700000002', realName: '小张店员', status: 1, createTime: '2026-03-05 10:00:00' },
  // 业主
  { id: 11, phone: '13600000001', password: '13600000001', realName: '孙业主', status: 1, createTime: '2026-02-15 14:00:00' },
  { id: 12, phone: '13600000002', password: '13600000002', realName: '周太太', status: 1, createTime: '2026-02-15 14:00:00' },
];

// ===== 用户角色关联 =====
export const mockUserRoles: UserRole[] = [
  // 系统管理员 - 物业公司管理员
  { id: 1, userId: 1, roleId: 10, orgId: 10 }, // 绿城物业 - 公司管理员
  // 张建国 - 项目经理（桂花城小区）
  { id: 2, userId: 2, roleId: 11, orgId: 20 },
  // 张建国 - 同时也是业主（春江花月小区）
  { id: 3, userId: 2, roleId: 30, orgId: 21 },
  // 李明霞 - 客服人员（桂花城小区）
  { id: 4, userId: 3, roleId: 12, orgId: 20 },
  // 王师傅 - 工程人员（桂花城小区）
  { id: 5, userId: 4, roleId: 13, orgId: 20 },
  // 赵保安 - 安保人员（桂花城小区）
  { id: 6, userId: 5, roleId: 14, orgId: 20 },
  // 刘会计 - 财务人员（绿城物业）
  { id: 7, userId: 6, roleId: 15, orgId: 10 },
  // 陈局长 - 市级管理员
  { id: 8, userId: 7, roleId: 1, orgId: 1 },
  // 周科长 - 区级管理员（西湖区）
  { id: 9, userId: 8, roleId: 2, orgId: 2 },
  // 陈老板 - 商家管理员（桂花城便民超市）
  { id: 10, userId: 9, roleId: 20, orgId: 30 },
  // 小张店员 - 店员（桂花城便民超市）
  { id: 11, userId: 10, roleId: 21, orgId: 30 },
  // 孙业主 - 业主（桂花城小区）
  { id: 12, userId: 11, roleId: 30, orgId: 20 },
  // 周太太 - 家庭成员（桂花城小区，孙业主的房屋）
  { id: 13, userId: 12, roleId: 31, orgId: 20 },
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
