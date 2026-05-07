// ===== 认证服务（后端 API 实现）=====
import type { LoginRequest, LoginResponse, CurrentUser, UserRole, Role, Organization } from './types';
import apiClient from './apiClient';

const TOKEN_KEY = 'plcct_auth_token';
const USER_KEY = 'plcct_current_user';

/**
 * 获取存储对象
 * 使用 sessionStorage 确保关闭浏览器后需要重新登录
 */
const storage = window.sessionStorage;

// 后端返回的角色数据类型
interface ApiRole {
  id: number;
  roleCode: string;
  roleName: string;
  portType: string;
  description: string;
  status: number;
  permissions: string[];
}

// 后端返回的组织数据类型
interface ApiOrg {
  id: number;
  parentId: number | null;
  orgType: string;
  name: string;
  code: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  sortOrder: number;
  status: number;
}

// 后端返回的用户角色关联类型
interface ApiUserRole {
  id: number;
  userId: number;
  roleId: number;
  orgId: number;
  portType: string;
  role: ApiRole | null;
  org: ApiOrg | null;
}

// 后端返回的用户类型
interface ApiUser {
  id: number;
  phone: string;
  realName: string;
  avatar?: string;
  status: number;
  portType: string;
  manageProjectIds?: number[];
  createTime: string;
  roles: ApiUserRole[];
}

// 后端返回的登录响应
interface ApiLoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user: ApiUser;
  };
}

// 转换后端角色为前端 Role
function toRole(apiRole: ApiRole | null): Role | undefined {
  if (!apiRole) return undefined;
  return {
    id: apiRole.id,
    roleCode: apiRole.roleCode,
    roleName: apiRole.roleName,
    portType: apiRole.portType as Role['portType'],
    description: apiRole.description,
    status: apiRole.status as 0 | 1,
    permissions: apiRole.permissions,
  };
}

// 转换后端组织为前端 Organization
function toOrg(apiOrg: ApiOrg | null): Organization | undefined {
  if (!apiOrg) return undefined;
  return {
    id: apiOrg.id,
    parentId: apiOrg.parentId,
    orgType: apiOrg.orgType as Organization['orgType'],
    name: apiOrg.name,
    code: apiOrg.code,
    contactPerson: apiOrg.contactPerson,
    contactPhone: apiOrg.contactPhone,
    address: apiOrg.address,
    sortOrder: apiOrg.sortOrder,
    status: apiOrg.status as 0 | 1,
  };
}

// 转换后端用户角色为前端 UserRole
function toUserRole(apiUr: ApiUserRole): UserRole {
  return {
    id: apiUr.id,
    userId: apiUr.userId,
    roleId: apiUr.roleId,
    orgId: apiUr.orgId,
    portType: apiUr.portType as UserRole['portType'],
    role: toRole(apiUr.role),
    org: toOrg(apiUr.org),
  };
}

// 转换后端用户为前端 LoginResponse
function toLoginResponse(apiUser: ApiUser, token: string): LoginResponse {
  return {
    token,
    user: {
      id: apiUser.id,
      phone: apiUser.phone,
      password: '',
      realName: apiUser.realName,
      avatar: apiUser.avatar,
      status: apiUser.status as 0 | 1,
      portType: apiUser.portType as LoginResponse['user']['portType'],
      manageProjectIds: apiUser.manageProjectIds,
      createTime: apiUser.createTime,
      roles: apiUser.roles.map(toUserRole),
    },
  };
}

// 生成随机验证码
export function generateCaptcha(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 登录（增加 port 参数校验账号端口与登录端口是否匹配）
export async function login(data: LoginRequest, port?: string): Promise<LoginResponse> {
  const response = await apiClient.post<ApiLoginResponse>('/auth/login', {
    phone: data.phone,
    password: data.password,
    port,
  });

  const result = response.data.data;
  const loginResponse = toLoginResponse(result.user, result.token);

  // 保存到 sessionStorage（浏览器关闭自动清除）
  storage.setItem(TOKEN_KEY, result.token);
  storage.setItem(USER_KEY, JSON.stringify(loginResponse));

  return loginResponse;
}

// 登出
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // 即使后端请求失败，也清除本地状态
  }
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

// 获取当前登录用户
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = storage.getItem(TOKEN_KEY);
  const userStr = storage.getItem(USER_KEY);

  if (!token || !userStr) {
    return null;
  }

  try {
    // 尝试从后端获取最新用户信息
    const response = await apiClient.get<ApiLoginResponse>('/auth/me');
    const result = response.data.data;
    const loginResponse = toLoginResponse(result.user, result.token);

    // 更新缓存
    storage.setItem(USER_KEY, JSON.stringify(loginResponse));

    return {
      user: loginResponse.user,
      roles: loginResponse.user.roles,
      currentRole: loginResponse.user.roles.length > 0 ? loginResponse.user.roles[0] : null,
      token,
    };
  } catch {
    // 后端请求失败时，尝试从本地缓存恢复
    try {
      const loginResponse: LoginResponse = JSON.parse(userStr);
      const roles = loginResponse.user.roles;
      return {
        user: loginResponse.user,
        roles,
        currentRole: roles.length > 0 ? roles[0] : null,
        token,
      };
    } catch {
      return null;
    }
  }
}

// 切换当前角色
export async function switchRole(roleId: number): Promise<CurrentUser | null> {
  try {
    const response = await apiClient.post<ApiLoginResponse>('/auth/switch-role', { roleId });
    const result = response.data.data;
    const loginResponse = toLoginResponse(result.user, result.token);

    storage.setItem(USER_KEY, JSON.stringify(loginResponse));

    const newRole = loginResponse.user.roles.find(r => r.roleId === roleId);
    return {
      user: loginResponse.user,
      roles: loginResponse.user.roles,
      currentRole: newRole || (loginResponse.user.roles.length > 0 ? loginResponse.user.roles[0] : null),
      token: loginResponse.token,
    };
  } catch {
    // 后端失败时尝试本地切换
    const current = await getCurrentUser();
    if (!current) return null;

    const newRole = current.roles.find(r => r.roleId === roleId);
    if (!newRole) return current;

    current.currentRole = newRole;
    return current;
  }
}

// 检查是否有权限（同时校验端口匹配）
export function hasPermission(currentUser: CurrentUser | null, permCode: string): boolean {
  if (!currentUser || !currentUser.currentRole?.role) return false;
  const role = currentUser.currentRole.role;
  const userPortType = currentUser.user.portType;

  // 1. 检查角色是否拥有该权限编码
  if (!role.permissions.includes(permCode) && !role.permissions.includes('*')) {
    return false;
  }

  // 2. 超级管理员（superadmin 端口类型）拥有所有端口的权限，跳过端口匹配校验
  if (userPortType === 'superadmin') {
    return true;
  }

  // 3. 检查权限编码前缀是否与用户端口类型匹配（防止跨端越权）
  const permPrefix = permCode.split(':')[0];
  if (permPrefix && ['government', 'property', 'merchant', 'owner', 'wechat'].includes(permPrefix)) {
    if (permPrefix !== userPortType) {
      return false;
    }
  }

  return true;
}

// 获取当前角色可见的菜单权限
export function getCurrentRolePermissions(currentUser: CurrentUser | null): string[] {
  if (!currentUser || !currentUser.currentRole?.role) return [];
  return currentUser.currentRole.role.permissions;
}
