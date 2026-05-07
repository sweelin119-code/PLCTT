import apiClient from './apiClient';
import type { Organization } from './types';

// 获取组织树
export async function getOrgTree(orgType?: string): Promise<Organization[]> {
  try {
    const params: any = {};
    if (orgType) params.orgType = orgType;
    const res = await apiClient.get('/api/organizations/tree', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取组织树失败');
  } catch (error: any) {
    console.error('[orgService] getOrgTree error:', error);
    throw error;
  }
}

// 获取组织列表
export async function getOrgList(params?: {
  orgType?: string;
  parentId?: number;
  keyword?: string;
  status?: number;
}): Promise<Organization[]> {
  try {
    const res = await apiClient.get('/api/organizations', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取组织列表失败');
  } catch (error: any) {
    console.error('[orgService] getOrgList error:', error);
    throw error;
  }
}

// 获取单个组织
export async function getOrgById(id: number): Promise<Organization | null> {
  try {
    const res = await apiClient.get(`/api/organizations/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    if (res.data.code === 404) return null;
    throw new Error(res.data.message || '获取组织失败');
  } catch (error: any) {
    console.error('[orgService] getOrgById error:', error);
    throw error;
  }
}

// 获取子组织列表
export async function getChildOrgs(parentId: number): Promise<Organization[]> {
  try {
    const res = await apiClient.get('/api/organizations', { params: { parentId } });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取子组织失败');
  } catch (error: any) {
    console.error('[orgService] getChildOrgs error:', error);
    throw error;
  }
}

// 获取后代组织ID列表（递归）
export async function getDescendantOrgIds(orgId: number): Promise<number[]> {
  try {
    const res = await apiClient.get(`/api/organizations/${orgId}/descendants`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取后代组织失败');
  } catch (error: any) {
    console.error('[orgService] getDescendantOrgIds error:', error);
    throw error;
  }
}

// 按类型获取组织
export async function getOrgsByType(orgType: string): Promise<Organization[]> {
  try {
    const res = await apiClient.get('/api/organizations', { params: { orgType } });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取组织失败');
  } catch (error: any) {
    console.error('[orgService] getOrgsByType error:', error);
    throw error;
  }
}

// 获取物业公司列表（组织类型为 company）
export async function getCompanyList(): Promise<Organization[]> {
  return getOrgsByType('company');
}

// 获取项目列表（组织类型为 project）
export async function getProjectList(companyId?: number): Promise<Organization[]> {
  try {
    const params: any = { orgType: 'project' };
    if (companyId) params.parentId = companyId;
    const res = await apiClient.get('/api/organizations', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取项目列表失败');
  } catch (error: any) {
    console.error('[orgService] getProjectList error:', error);
    throw error;
  }
}
