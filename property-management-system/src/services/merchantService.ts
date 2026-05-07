import apiClient from './apiClient';
import type { Merchant, AuditStatus } from './types';

// 获取商家列表
export async function getMerchantList(params?: {
  keyword?: string;
  category?: string;
  auditStatus?: AuditStatus;
  status?: number;
  propertyCompanyId?: number;
}): Promise<Merchant[]> {
  try {
    const res = await apiClient.get('/api/merchants', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取商家列表失败');
  } catch (error: any) {
    console.error('[merchantService] getMerchantList error:', error);
    throw error;
  }
}

// 获取单个商家
export async function getMerchantById(id: number): Promise<Merchant | null> {
  try {
    const res = await apiClient.get(`/api/merchants/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    if (res.data.code === 404) return null;
    throw new Error(res.data.message || '获取商家失败');
  } catch (error: any) {
    console.error('[merchantService] getMerchantById error:', error);
    throw error;
  }
}

// 创建商家
export async function createMerchant(data: {
  shopName: string;
  companyName?: string;
  unifiedCode?: string;
  contactPerson: string;
  contactPhone: string;
  category?: string;
  address?: string;
  businessLicense?: string;
  propertyCompanyId: number;
}): Promise<{ id: number }> {
  try {
    const res = await apiClient.post('/api/merchants', data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '创建商家失败');
  } catch (error: any) {
    console.error('[merchantService] createMerchant error:', error);
    throw error;
  }
}

// 更新商家
export async function updateMerchant(id: number, data: Partial<Merchant>): Promise<void> {
  try {
    const res = await apiClient.put(`/api/merchants/${id}`, data);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '更新商家失败');
    }
  } catch (error: any) {
    console.error('[merchantService] updateMerchant error:', error);
    throw error;
  }
}

// 删除商家
export async function deleteMerchant(id: number): Promise<void> {
  try {
    const res = await apiClient.delete(`/api/merchants/${id}`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '删除商家失败');
    }
  } catch (error: any) {
    console.error('[merchantService] deleteMerchant error:', error);
    throw error;
  }
}

// 审核商家
export async function auditMerchant(id: number, status: AuditStatus, remark?: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/merchants/${id}/audit`, {
      auditStatus: status,
      auditRemark: remark,
    });
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '审核失败');
    }
  } catch (error: any) {
    console.error('[merchantService] auditMerchant error:', error);
    throw error;
  }
}

// 获取商家分类列表
export async function getMerchantCategories(): Promise<string[]> {
  try {
    const res = await apiClient.get('/api/merchants/categories/list');
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取商家分类失败');
  } catch (error: any) {
    console.error('[merchantService] getMerchantCategories error:', error);
    throw error;
  }
}
