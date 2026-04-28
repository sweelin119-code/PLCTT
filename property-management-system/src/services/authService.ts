// ===== 认证服务（Mock 实现）=====
import type { LoginRequest, LoginResponse, CurrentUser, UserRole } from './types';
import { mockUsers, mockUserRoles, findRoleById, findOrgById } from './mockData';

const TOKEN_KEY = 'plcct_auth_token';
const USER_KEY = 'plcct_current_user';

// 模拟延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 生成随机验证码
export function generateCaptcha(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 登录
export async function login(data: LoginRequest): Promise<LoginResponse> {
  await delay(500);

  const user = mockUsers.find(u => u.phone === data.phone && u.password === data.password);
  if (!user) {
    throw new Error('手机号或密码错误');
  }
  if (user.status === 0) {
    throw new Error('账号已被禁用，请联系管理员');
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

  // 保存到 localStorage
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(result));

  return result;
}

// 登出
export async function logout(): Promise<void> {
  await delay(200);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// 获取当前登录用户
export async function getCurrentUser(): Promise<CurrentUser | null> {
  await delay(100);

  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);

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

  // 更新 localStorage
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    const loginResponse: LoginResponse = JSON.parse(userStr);
    localStorage.setItem(USER_KEY, JSON.stringify(loginResponse));
  }

  return current;
}

// 检查是否有权限
export function hasPermission(currentUser: CurrentUser | null, permCode: string): boolean {
  if (!currentUser || !currentUser.currentRole?.role) return false;
  const role = currentUser.currentRole.role;
  return role.permissions.includes(permCode) || role.permissions.includes('*');
}

// 获取当前角色可见的菜单权限
export function getCurrentRolePermissions(currentUser: CurrentUser | null): string[] {
  if (!currentUser || !currentUser.currentRole?.role) return [];
  return currentUser.currentRole.role.permissions;
}
