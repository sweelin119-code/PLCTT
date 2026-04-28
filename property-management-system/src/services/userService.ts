// ===== 用户管理服务（Mock 实现）=====
import type { User, UserRole, UserWithRoles, UserStatus } from './types';
import { mockUsers, mockUserRoles, findRoleById, findOrgById } from './mockData';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// 获取用户列表（含角色信息）
export async function getUserList(params?: {
  keyword?: string;
  roleId?: number;
  orgId?: number;
  status?: UserStatus;
}): Promise<UserWithRoles[]> {
  await delay();

  let filtered = [...mockUsers];

  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(u =>
      u.realName.toLowerCase().includes(kw) || u.phone.includes(kw)
    );
  }

  if (params?.status !== undefined) {
    filtered = filtered.filter(u => u.status === params.status);
  }

  // 关联角色信息
  const result: UserWithRoles[] = filtered.map(user => {
    const roles = mockUserRoles
      .filter(ur => ur.userId === user.id)
      .map(ur => ({
        ...ur,
        role: findRoleById(ur.roleId),
        org: findOrgById(ur.orgId),
      }))
      .filter(ur => ur.role !== undefined) as UserRole[];

    return { ...user, roles };
  });

  // 按角色筛选
  if (params?.roleId) {
    return result.filter(u => u.roles.some(r => r.roleId === params.roleId));
  }

  // 按组织筛选
  if (params?.orgId) {
    return result.filter(u => u.roles.some(r => r.orgId === params.orgId));
  }

  return result;
}

// 根据ID获取用户
export async function getUserById(id: number): Promise<UserWithRoles | null> {
  await delay();
  const user = mockUsers.find(u => u.id === id);
  if (!user) return null;

  const roles = mockUserRoles
    .filter(ur => ur.userId === user.id)
    .map(ur => ({
      ...ur,
      role: findRoleById(ur.roleId),
      org: findOrgById(ur.orgId),
    }))
    .filter(ur => ur.role !== undefined) as UserRole[];

  return { ...user, roles };
}

// 新增用户
export async function createUser(data: {
  phone: string;
  realName: string;
  roleId: number;
  orgId: number;
  status?: UserStatus;
}): Promise<UserWithRoles> {
  await delay();

  // 检查手机号唯一性
  if (mockUsers.some(u => u.phone === data.phone)) {
    throw new Error('该手机号已存在');
  }

  const newId = Math.max(...mockUsers.map(u => u.id)) + 1;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const newUser: User = {
    id: newId,
    phone: data.phone,
    password: data.phone, // 默认密码=手机号
    realName: data.realName,
    status: data.status ?? 1,
    createTime: now,
  };

  mockUsers.push(newUser);

  const newUserRole: UserRole = {
    id: Math.max(...mockUserRoles.map(ur => ur.id)) + 1,
    userId: newId,
    roleId: data.roleId,
    orgId: data.orgId,
    role: findRoleById(data.roleId),
    org: findOrgById(data.orgId),
  };

  mockUserRoles.push(newUserRole);

  return {
    ...newUser,
    roles: [newUserRole],
  };
}

// 更新用户
export async function updateUser(id: number, data: {
  realName?: string;
  phone?: string;
  status?: UserStatus;
  roleId?: number;
  orgId?: number;
}): Promise<UserWithRoles> {
  await delay();

  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) throw new Error('用户不存在');

  // 检查手机号唯一性
  if (data.phone && mockUsers.some(u => u.phone === data.phone && u.id !== id)) {
    throw new Error('该手机号已被其他用户使用');
  }

  // 更新用户基本信息
  if (data.realName) mockUsers[userIndex].realName = data.realName;
  if (data.phone) mockUsers[userIndex].phone = data.phone;
  if (data.status !== undefined) mockUsers[userIndex].status = data.status;

  // 更新角色关联
  if (data.roleId || data.orgId) {
    const existingRoleIndex = mockUserRoles.findIndex(ur => ur.userId === id);
    if (existingRoleIndex !== -1) {
      if (data.roleId) mockUserRoles[existingRoleIndex].roleId = data.roleId;
      if (data.orgId) mockUserRoles[existingRoleIndex].orgId = data.orgId;
    }
  }

  return getUserById(id) as Promise<UserWithRoles>;
}

// 删除用户
export async function deleteUser(id: number): Promise<void> {
  await delay();

  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) throw new Error('用户不存在');

  mockUsers.splice(index, 1);

  // 同时删除角色关联
  const roleIndices = mockUserRoles
    .map((ur, i) => ur.userId === id ? i : -1)
    .filter(i => i !== -1)
    .reverse();
  for (const i of roleIndices) {
    mockUserRoles.splice(i, 1);
  }
}

// 重置密码
export async function resetPassword(id: number): Promise<void> {
  await delay();

  const user = mockUsers.find(u => u.id === id);
  if (!user) throw new Error('用户不存在');

  user.password = user.phone; // 重置为手机号
}

// 切换用户状态
export async function toggleUserStatus(id: number): Promise<UserStatus> {
  await delay();

  const user = mockUsers.find(u => u.id === id);
  if (!user) throw new Error('用户不存在');

  user.status = user.status === 1 ? 0 : 1;
  return user.status;
}
