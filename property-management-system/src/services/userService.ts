import apiClient from './apiClient';
import type { User, UserRole, Role, Organization } from './types';

export interface UserWithRoles extends User {
  roles: (UserRole & { role?: Role; org?: Organization })[];
}

// 获取用户列表
export async function getUserList(params?: {
  keyword?: string;
  portType?: string;
  status?: number;
  orgId?: number;
}): Promise<UserWithRoles[]> {
  try {
    const res = await apiClient.get('/api/users', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取用户列表失败');
  } catch (error: any) {
    console.error('[userService] getUserList error:', error);
    throw error;
  }
}

// 获取单个用户
export async function getUserById(id: number): Promise<UserWithRoles | null> {
  try {
    const res = await apiClient.get(`/api/users/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    if (res.data.code === 404) return null;
    throw new Error(res.data.message || '获取用户失败');
  } catch (error: any) {
    console.error('[userService] getUserById error:', error);
    throw error;
  }
}

// 创建用户
export async function createUser(data: {
  phone: string;
  password: string;
  realName: string;
  portType: string;
  roles?: { roleId: number; orgId: number }[];
  status?: number;
}): Promise<{ id: number }> {
  try {
    const res = await apiClient.post('/api/users', data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '创建用户失败');
  } catch (error: any) {
    console.error('[userService] createUser error:', error);
    throw error;
  }
}

// 更新用户
export async function updateUser(id: number, data: {
  realName?: string;
  phone?: string;
  portType?: string;
  status?: number;
  roles?: { roleId: number; orgId: number }[];
}): Promise<void> {
  try {
    const res = await apiClient.put(`/api/users/${id}`, data);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '更新用户失败');
    }
  } catch (error: any) {
    console.error('[userService] updateUser error:', error);
    throw error;
  }
}

// 删除用户
export async function deleteUser(id: number): Promise<void> {
  try {
    const res = await apiClient.delete(`/api/users/${id}`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '删除用户失败');
    }
  } catch (error: any) {
    console.error('[userService] deleteUser error:', error);
    throw error;
  }
}

// 重置密码
export async function resetPassword(id: number): Promise<void> {
  try {
    const res = await apiClient.put(`/api/users/${id}/reset-password`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '重置密码失败');
    }
  } catch (error: any) {
    console.error('[userService] resetPassword error:', error);
    throw error;
  }
}

// 切换用户状态
export async function toggleUserStatus(id: number): Promise<'active' | 'disabled'> {
  try {
    const res = await apiClient.put(`/api/users/${id}/toggle-status`);
    if (res.data.code === 200) {
      return res.data.data.status;
    }
    throw new Error(res.data.message || '切换状态失败');
  } catch (error: any) {
    console.error('[userService] toggleUserStatus error:', error);
    throw error;
  }
}
