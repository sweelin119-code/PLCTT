import apiClient from './apiClient';
import type { Complaint } from './types';

// 投诉分类映射
export const complaintCategoryMap: Record<string, string> = {
  property_service: '物业服务',
  noise: '噪音扰民',
  parking: '停车管理',
  security: '安全管理',
  clean: '环境卫生',
  maintenance: '维修养护',
  neighbor: '邻里纠纷',
  other: '其他',
};

// 投诉来源映射
export const complaintSourceMap: Record<string, string> = {
  owner_app: '业主APP',
  phone: '电话投诉',
  visit: '来访投诉',
  government_transfer: '政府转办',
  other: '其他',
};

// 投诉状态映射
export const complaintStatusMap: Record<string, string> = {
  pending_accept: '待受理',
  accepted: '已受理',
  assigned: '已分派',
  processing: '处理中',
  feedback: '已反馈',
  revisit_pending: '待回访',
  closed: '已归档',
};

// 获取投诉列表
export async function getComplaintList(params?: {
  keyword?: string;
  category?: string;
  status?: string;
  source?: string;
  urgency?: string;
  propertyCompanyId?: number;
  page?: number;
  pageSize?: number;
}): Promise<{ list: Complaint[]; total: number; page: number; pageSize: number }> {
  try {
    const res = await apiClient.get('/api/complaints', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取投诉列表失败');
  } catch (error: any) {
    console.error('[complaintService] getComplaintList error:', error);
    throw error;
  }
}

// 获取单个投诉
export async function getComplaintById(id: number): Promise<Complaint | null> {
  try {
    const res = await apiClient.get(`/api/complaints/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    if (res.data.code === 404) return null;
    throw new Error(res.data.message || '获取投诉失败');
  } catch (error: any) {
    console.error('[complaintService] getComplaintById error:', error);
    throw error;
  }
}

// 创建投诉
export async function createComplaint(data: {
  complaintNo?: string;
  complainant: string;
  complainantPhone: string;
  complainantAddress?: string;
  category: string;
  title: string;
  content: string;
  source?: string;
  urgency?: string;
  images?: string[];
  propertyCompanyId: number;
}): Promise<{ id: number; complaintNo: string }> {
  try {
    const res = await apiClient.post('/api/complaints', data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '创建投诉失败');
  } catch (error: any) {
    console.error('[complaintService] createComplaint error:', error);
    throw error;
  }
}

// 受理投诉
export async function acceptComplaint(id: number, acceptedBy: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/complaints/${id}/accept`, { acceptedBy });
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '受理失败');
    }
  } catch (error: any) {
    console.error('[complaintService] acceptComplaint error:', error);
    throw error;
  }
}

// 分派投诉
export async function assignComplaint(id: number, assignedTo: string, assignedToPhone: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/complaints/${id}/assign`, { assignedTo, assignedToPhone });
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '分派失败');
    }
  } catch (error: any) {
    console.error('[complaintService] assignComplaint error:', error);
    throw error;
  }
}

// 处理投诉
export async function processComplaint(id: number, handleResult: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/complaints/${id}/process`, { handleResult });
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '处理失败');
    }
  } catch (error: any) {
    console.error('[complaintService] processComplaint error:', error);
    throw error;
  }
}

// 反馈投诉
export async function feedbackComplaint(id: number, feedbackContent: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/complaints/${id}/feedback`, { feedbackContent });
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '反馈失败');
    }
  } catch (error: any) {
    console.error('[complaintService] feedbackComplaint error:', error);
    throw error;
  }
}

// 回访投诉
export async function revisitComplaint(id: number, data: { revisitRemark?: string; satisfaction?: number }): Promise<void> {
  try {
    const res = await apiClient.put(`/api/complaints/${id}/revisit`, data);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '回访失败');
    }
  } catch (error: any) {
    console.error('[complaintService] revisitComplaint error:', error);
    throw error;
  }
}

// 督办投诉（政府端）
export async function superviseComplaint(id: number, data: { governmentSupervisor?: string; governmentRemark?: string; governmentDeadline?: string }): Promise<void> {
  try {
    const res = await apiClient.put(`/api/complaints/${id}/supervise`, data);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '督办失败');
    }
  } catch (error: any) {
    console.error('[complaintService] superviseComplaint error:', error);
    throw error;
  }
}

// 获取投诉统计
export async function getComplaintStats(propertyCompanyId?: number): Promise<{
  total: number;
  pendingAccept: number;
  accepted: number;
  assigned: number;
  processing: number;
  feedback: number;
  closed: number;
  categoryStats: { category: string; count: number }[];
}> {
  try {
    const res = await apiClient.get('/api/complaints/stats/summary', { params: { propertyCompanyId } });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取投诉统计失败');
  } catch (error: any) {
    console.error('[complaintService] getComplaintStats error:', error);
    throw error;
  }
}
