import apiClient from './apiClient';
import type { EmployeeProfile } from './types';

export interface EmployeeQueryParams {
  status?: string;
  department?: string;
  keyword?: string;
}

// 获取员工列表
export async function getEmployeeList(params?: EmployeeQueryParams): Promise<EmployeeProfile[]> {
  try {
    const res = await apiClient.get('/api/employees', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取员工列表失败');
  } catch (error: any) {
    console.error('[employeeService] getEmployeeList error:', error);
    throw error;
  }
}

// 获取单个员工
export async function getEmployeeById(id: number): Promise<EmployeeProfile | null> {
  try {
    const res = await apiClient.get(`/api/employees/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    if (res.data.code === 404) return null;
    throw new Error(res.data.message || '获取员工失败');
  } catch (error: any) {
    console.error('[employeeService] getEmployeeById error:', error);
    throw error;
  }
}

// 创建员工
export async function createEmployee(data: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
  try {
    const res = await apiClient.post('/api/employees', data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '创建员工失败');
  } catch (error: any) {
    console.error('[employeeService] createEmployee error:', error);
    throw error;
  }
}

// 更新员工
export async function updateEmployee(id: number, data: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
  try {
    const res = await apiClient.put(`/api/employees/${id}`, data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '更新员工失败');
  } catch (error: any) {
    console.error('[employeeService] updateEmployee error:', error);
    throw error;
  }
}

// 删除员工
export async function deleteEmployee(id: number): Promise<void> {
  try {
    const res = await apiClient.delete(`/api/employees/${id}`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '删除员工失败');
    }
  } catch (error: any) {
    console.error('[employeeService] deleteEmployee error:', error);
    throw error;
  }
}

// 获取可选用户列表（用于关联账号）
export async function getAvailableUsers(): Promise<{ id: number; realName: string; phone: string }[]> {
  try {
    const res = await apiClient.get('/api/employees/available-users');
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取可选用户失败');
  } catch (error: any) {
    console.error('[employeeService] getAvailableUsers error:', error);
    throw error;
  }
}

// 获取部门列表
export async function getDepartments(): Promise<string[]> {
  try {
    const res = await apiClient.get('/api/employees/departments');
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取部门列表失败');
  } catch (error: any) {
    console.error('[employeeService] getDepartments error:', error);
    throw error;
  }
}

// 获取岗位列表
export async function getPositions(): Promise<string[]> {
  try {
    const res = await apiClient.get('/api/employees/positions');
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取岗位列表失败');
  } catch (error: any) {
    console.error('[employeeService] getPositions error:', error);
    throw error;
  }
}
