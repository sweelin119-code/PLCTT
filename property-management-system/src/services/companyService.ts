import apiClient from './apiClient';
import type { PropertyCompany, AuditStatus } from './types';

// 获取物业企业列表
export async function getCompanyList(params?: {
  keyword?: string;
  auditStatus?: AuditStatus;
  status?: number;
}): Promise<PropertyCompany[]> {
  try {
    const res = await apiClient.get('/api/companies', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取物业企业列表失败');
  } catch (error: any) {
    console.error('[companyService] getCompanyList error:', error);
    throw error;
  }
}

// 获取单个物业企业
export async function getCompanyById(id: number): Promise<PropertyCompany | null> {
  try {
    const res = await apiClient.get(`/api/companies/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    if (res.data.code === 404) return null;
    throw new Error(res.data.message || '获取物业企业失败');
  } catch (error: any) {
    console.error('[companyService] getCompanyById error:', error);
    throw error;
  }
}

// 提交物业企业注册
export async function submitCompanyRegistration(data: {
  companyName: string;
  unifiedCode: string;
  legalPerson: string;
  registeredCapital?: string;
  qualLevel?: string;
  qualCertNo?: string;
  qualExpireDate?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  businessScope?: string;
}): Promise<{ id: number }> {
  try {
    const res = await apiClient.post('/api/companies', data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '提交注册失败');
  } catch (error: any) {
    console.error('[companyService] submitCompanyRegistration error:', error);
    throw error;
  }
}

// 审核物业企业
export async function auditCompany(id: number, status: AuditStatus, remark?: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/companies/${id}/audit`, {
      auditStatus: status,
      auditRemark: remark,
    });
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '审核失败');
    }
  } catch (error: any) {
    console.error('[companyService] auditCompany error:', error);
    throw error;
  }
}

// 更新物业企业
export async function updateCompany(id: number, data: Partial<PropertyCompany>): Promise<void> {
  try {
    const res = await apiClient.put(`/api/companies/${id}`, data);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '更新失败');
    }
  } catch (error: any) {
    console.error('[companyService] updateCompany error:', error);
    throw error;
  }
}

// 删除物业企业
export async function deleteCompany(id: number): Promise<void> {
  try {
    const res = await apiClient.delete(`/api/companies/${id}`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '删除失败');
    }
  } catch (error: any) {
    console.error('[companyService] deleteCompany error:', error);
    throw error;
  }
}
