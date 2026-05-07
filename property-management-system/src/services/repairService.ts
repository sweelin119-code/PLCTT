import apiClient from './apiClient';
import type { RepairOrder } from './types';

// 报修类型映射
export const repairTypeMap: Record<string, string> = {
  water: '水管维修',
  electric: '电路维修',
  hvac: '暖通维修',
  plumbing: '管道疏通',
  appliance: '家电维修',
  structure: '土建维修',
  other: '其他',
};

// 紧急程度映射
export const urgencyMap: Record<string, string> = {
  normal: '普通',
  urgent: '紧急',
  emergency: '特急',
};

// 工单状态映射
export const repairStatusMap: Record<string, string> = {
  pending_assign: '待派单',
  assigned: '已派单',
  on_the_way: '前往中',
  in_progress: '维修中',
  completed: '已完成',
  confirmed: '已确认',
  evaluated: '已评价',
  closed: '已关闭',
};

// 获取报修工单列表
export async function getRepairOrderList(params?: {
  keyword?: string;
  repairType?: string;
  status?: string;
  urgency?: string;
  propertyCompanyId?: number;
  page?: number;
  pageSize?: number;
}): Promise<{ list: RepairOrder[]; total: number; page: number; pageSize: number }> {
  try {
    const res = await apiClient.get('/api/repairs', { params });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取报修工单列表失败');
  } catch (error: any) {
    console.error('[repairService] getRepairOrderList error:', error);
    throw error;
  }
}

// 获取单个报修工单
export async function getRepairOrderById(id: number): Promise<RepairOrder | null> {
  try {
    const res = await apiClient.get(`/api/repairs/${id}`);
    if (res.data.code === 200) {
      return res.data.data;
    }
    if (res.data.code === 404) return null;
    throw new Error(res.data.message || '获取报修工单失败');
  } catch (error: any) {
    console.error('[repairService] getRepairOrderById error:', error);
    throw error;
  }
}

// 创建报修工单
export async function createRepairOrder(data: {
  orderNo?: string;
  ownerName: string;
  ownerPhone: string;
  ownerAddress?: string;
  repairType: string;
  repairDesc: string;
  urgency?: string;
  images?: string[];
  propertyCompanyId: number;
}): Promise<{ id: number; orderNo: string }> {
  try {
    const res = await apiClient.post('/api/repairs', data);
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '创建报修工单失败');
  } catch (error: any) {
    console.error('[repairService] createRepairOrder error:', error);
    throw error;
  }
}

// 派单
export async function assignRepairOrder(id: number, assignedTo: string, assignedPhone: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/repairs/${id}/assign`, { assignedTo, assignedPhone });
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '派单失败');
    }
  } catch (error: any) {
    console.error('[repairService] assignRepairOrder error:', error);
    throw error;
  }
}

// 接单
export async function acceptRepairOrder(id: number): Promise<void> {
  try {
    const res = await apiClient.put(`/api/repairs/${id}/accept`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '接单失败');
    }
  } catch (error: any) {
    console.error('[repairService] acceptRepairOrder error:', error);
    throw error;
  }
}

// 开始维修
export async function startRepair(id: number): Promise<void> {
  try {
    const res = await apiClient.put(`/api/repairs/${id}/start`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '开始维修失败');
    }
  } catch (error: any) {
    console.error('[repairService] startRepair error:', error);
    throw error;
  }
}

// 完成维修
export async function completeRepair(id: number, data: { repairResult?: string; cost?: number; chargeType?: string }): Promise<void> {
  try {
    const res = await apiClient.put(`/api/repairs/${id}/complete`, data);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '完成维修失败');
    }
  } catch (error: any) {
    console.error('[repairService] completeRepair error:', error);
    throw error;
  }
}

// 业主确认
export async function confirmRepair(id: number): Promise<void> {
  try {
    const res = await apiClient.put(`/api/repairs/${id}/confirm`);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '确认失败');
    }
  } catch (error: any) {
    console.error('[repairService] confirmRepair error:', error);
    throw error;
  }
}

// 业主评价
export async function evaluateRepair(id: number, data: { rating: number; evaluation?: string }): Promise<void> {
  try {
    const res = await apiClient.put(`/api/repairs/${id}/evaluate`, data);
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '评价失败');
    }
  } catch (error: any) {
    console.error('[repairService] evaluateRepair error:', error);
    throw error;
  }
}

// 回访
export async function revisitRepair(id: number, remark: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/repairs/${id}/revisit`, { revisitRemark: remark });
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '回访失败');
    }
  } catch (error: any) {
    console.error('[repairService] revisitRepair error:', error);
    throw error;
  }
}

// 获取报修统计
export async function getRepairStats(propertyCompanyId?: number): Promise<{
  total: number;
  pendingAssign: number;
  assigned: number;
  onTheWay: number;
  inProgress: number;
  completed: number;
  confirmed: number;
  evaluated: number;
  typeStats: { type: string; count: number }[];
}> {
  try {
    const res = await apiClient.get('/api/repairs/stats/summary', { params: { propertyCompanyId } });
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取报修统计失败');
  } catch (error: any) {
    console.error('[repairService] getRepairStats error:', error);
    throw error;
  }
}

// 获取维保人员列表
export async function getMaintenanceStaff(): Promise<{ name: string; phone: string }[]> {
  try {
    const res = await apiClient.get('/api/repairs/staff/list');
    if (res.data.code === 200) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取维保人员失败');
  } catch (error: any) {
    console.error('[repairService] getMaintenanceStaff error:', error);
    throw error;
  }
}
