// ===== 认证服务（Mock 实现）=====
import type { LoginRequest, LoginResponse, CurrentUser, UserRole } from './types';
import { mockUsers, mockUserRoles, findRoleById, findOrgById } from './mockData';

const TOKEN_KEY = 'plcct_auth_token';
const USER_KEY = 'plcct_current_user';

/**
 * 获取存储对象
 * 使用 sessionStorage 确保关闭浏览器后需要重新登录
 */
const storage = window.sessionStorage;

// 模拟延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 生成随机验证码
export function generateCaptcha(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 登录（增加 port 参数校验账号端口与登录端口是否匹配）
export async function login(data: LoginRequest, port?: string): Promise<LoginResponse> {
  await delay(500);

  const user = mockUsers.find(u => u.phone === data.phone && u.password === data.password);
  if (!user) {
    throw new Error('手机号或密码错误');
  }
  if (user.status === 0) {
    throw new Error('账号已被禁用，请联系管理员');
  }

  // 校验账号端口与登录端口是否匹配
  // 超级管理员（portType === 'superadmin'）可以登录所有端口，跳过校验
  if (port && user.portType !== 'superadmin' && user.portType !== port) {
    throw new Error('该账号不属于当前端口，请切换登录端口');
  }

  const roles = mockUserRoles
    .filter(ur => ur.userId === user.id)
    .map(ur => ({
      ...ur,
      role: findRoleById(ur.roleId),
      org: findOrgById(ur.orgId),
    }))
    .filter(ur => ur.role !== undefined) as UserRole[];

  const token = `mock_token_${user.id}_${Date.now()}`;

  const result: LoginResponse = {
    token,
    user: { ...user, roles },
  };

  // 保存到 sessionStorage（浏览器关闭自动清除）
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(result));

  return result;
}

// 登出
export async function logout(): Promise<void> {
  await delay(200);
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

// 获取当前登录用户
export async function getCurrentUser(): Promise<CurrentUser | null> {
  await delay(100);

  const token = storage.getItem(TOKEN_KEY);
  const userStr = storage.getItem(USER_KEY);

  if (!token || !userStr) {
    return null;
  }

  try {
    const loginResponse: LoginResponse = JSON.parse(userStr);
    const roles = loginResponse.user.roles.map(ur => ({
      ...ur,
      role: findRoleById(ur.roleId),
      org: findOrgById(ur.orgId),
    })).filter(ur => ur.role !== undefined) as UserRole[];

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

// 切换当前角色
export async function switchRole(roleId: number): Promise<CurrentUser | null> {
  await delay(200);

  const current = await getCurrentUser();
  if (!current) return null;

  const newRole = current.roles.find(r => r.roleId === roleId);
  if (!newRole) return current;

  current.currentRole = newRole;

  // 更新 sessionStorage
  const userStr = storage.getItem(USER_KEY);
  if (userStr) {
    const loginResponse: LoginResponse = JSON.parse(userStr);
    storage.setItem(USER_KEY, JSON.stringify(loginResponse));
  }

  return current;
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
  // 例如：government 端用户不能使用 property:staff:add 权限
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
