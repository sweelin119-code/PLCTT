// ===== 角色管理服务（Mock 实现）=====
import type { Role } from './types';
import { mockRoles, mockPermissions } from './mockData';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// 获取角色列表
export async function getRoleList(params?: {
  portType?: string;
  keyword?: string;
}): Promise<Role[]> {
  await delay();

  let filtered = [...mockRoles];

  if (params?.portType) {
    filtered = filtered.filter(r => r.portType === params.portType);
  }

  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(r =>
      r.roleName.toLowerCase().includes(kw) ||
      r.roleCode.toLowerCase().includes(kw)
    );
  }

  return filtered;
}

// 根据ID获取角色
export async function getRoleById(id: number): Promise<Role | null> {
  await delay();
  return mockRoles.find(r => r.id === id) || null;
}

// 根据端口类型获取角色
export async function getRolesByPortType(portType: string): Promise<Role[]> {
  await delay();
  return mockRoles.filter(r => r.portType === portType);
}

// 更新角色权限
export async function updateRolePermissions(roleId: number, permissions: string[]): Promise<Role> {
  await delay();

  const role = mockRoles.find(r => r.id === roleId);
  if (!role) throw new Error('角色不存在');

  role.permissions = permissions;
  return role;
}

// 获取所有权限列表
export async function getAllPermissions() {
  await delay();
  return mockPermissions;
}

// 新增角色
export async function createRole(data: {
  roleCode: string;
  roleName: string;
  portType: string;
  description: string;
  permissions?: string[];
}): Promise<Role> {
  await delay();

  if (mockRoles.some(r => r.roleCode === data.roleCode)) {
    throw new Error('角色编码已存在');
  }

  const newId = Math.max(...mockRoles.map(r => r.id)) + 1;
  const newRole: Role = {
    id: newId,
    roleCode: data.roleCode,
    roleName: data.roleName,
    portType: data.portType as any,
    description: data.description,
    status: 1,
    permissions: data.permissions || [],
  };

  mockRoles.push(newRole);
  return newRole;
}

// 更新角色
export async function updateRole(id: number, data: {
  roleName?: string;
  description?: string;
  permissions?: string[];
}): Promise<Role> {
  await delay();

  const role = mockRoles.find(r => r.id === id);
  if (!role) throw new Error('角色不存在');

  if (data.roleName) role.roleName = data.roleName;
  if (data.description !== undefined) role.description = data.description;
  if (data.permissions) role.permissions = data.permissions;

  return role;
}

// 删除角色
export async function deleteRole(id: number): Promise<void> {
  await delay();

  const index = mockRoles.findIndex(r => r.id === id);
  if (index === -1) throw new Error('角色不存在');

  mockRoles.splice(index, 1);
}
