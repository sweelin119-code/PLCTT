import apiClient from './apiClient';
import type { Role, Permission } from './types';

// 获取角色列表
export async function getRoleList(params?: {
  portType?: string;
  keyword?: string;
  status?: number;
}): Promise<Role[]> {
  try {
    const res = await apiClient.get('/api/roles', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取角色列表失败');
  } catch (error: any) {
    console.error('[roleService] getRoleList error:', error);
    throw error;
  }
}

// 获取单个角色
export async function getRoleById(id: number): Promise<Role | null> {
  try {
    const res = await apiClient.get(`/api/roles/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    if (res.data.code === 404) return null;
    throw new Error(res.data.message || '获取角色失败');
  } catch (error: any) {
    console.error('[roleService] getRoleById error:', error);
    throw error;
  }
}

// 按端口类型获取角色
export async function getRolesByPortType(portType: string): Promise<Role[]> {
  try {
    const res = await apiClient.get('/api/roles', { params: { portType } });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取角色失败');
  } catch (error: any) {
    console.error('[roleService] getRolesByPortType error:', error);
    throw error;
  }
}

// 更新角色权限
export async function updateRolePermissions(roleId: number, permissions: string[]): Promise<Role> {
  try {
    const res = await apiClient.put(`/api/roles/${roleId}/permissions`, { permissions });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '更新权限失败');
  } catch (error: any) {
    console.error('[roleService] updateRolePermissions error:', error);
    throw error;
  }
}

// 获取所有权限
export async function getAllPermissions(): Promise<Permission[]> {
  try {
    const res = await apiClient.get('/api/roles/permissions/all');
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取权限列表失败');
  } catch (error: any) {
    console.error('[roleService] getAllPermissions error:', error);
    throw error;
  }
}

// 创建角色
export async function createRole(data: {
  roleCode: string;
  roleName: string;
  portType: string;
  description?: string;
  permissions?: string[];
}): Promise<Role> {
  try {
    const res = await apiClient.post('/api/roles', data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '创建角色失败');
  } catch (error: any) {
    console.error('[roleService] createRole error:', error);
    throw error;
  }
}

// 更新角色
export async function updateRole(id: number, data: {
  roleName?: string;
  description?: string;
  status?: number;
  permissions?: string[];
}): Promise<Role> {
  try {
    const res = await apiClient.put(`/api/roles/${id}`, data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '更新角色失败');
  } catch (error: any) {
    console.error('[roleService] updateRole error:', error);
    throw error;
  }
}

// 删除角色
export async function deleteRole(id: number): Promise<void> {
  try {
    const res = await apiClient.delete(`/api/roles/${id}`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '删除角色失败');
    }
  } catch (error: any) {
    console.error('[roleService] deleteRole error:', error);
    throw error;
  }
}
