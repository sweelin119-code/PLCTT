import apiClient from './apiClient';
import type {
  FeeItem, ChargeRule, Bill, PaymentRecord, CollectionRecord,
  CollectionTemplate, FeeStatistics, BuildingFeeSummary, FeeTrendPoint,
  BillQueryParams, PaymentQueryParams, CollectionQueryParams,
  BillGenerateParams, OfflinePaymentData, BillAdjustData,
  HouseFeeItem, HouseFeeItemQueryParams, HouseFeeItemImportResult,
  ParkingFeeItem, ParkingFeeItemQueryParams, ParkingFeeItemImportResult,
  PayMethod, CollectionType, BillStatus
} from './feeTypes';

export type {
  FeeItem, ChargeRule, Bill, PaymentRecord, CollectionRecord,
  CollectionTemplate, FeeStatistics, BuildingFeeSummary, FeeTrendPoint,
  BillQueryParams, PaymentQueryParams, CollectionQueryParams,
  BillGenerateParams, OfflinePaymentData, BillAdjustData,
  HouseFeeItem, HouseFeeItemQueryParams, HouseFeeItemImportResult,
  ParkingFeeItem, ParkingFeeItemQueryParams, ParkingFeeItemImportResult,
  PayMethod, CollectionType, BillStatus
};

// ===== 费用项目 =====
export async function getFeeItems(projectId: number): Promise<FeeItem[]> {
  try {
    const res = await apiClient.get('/api/fee/items', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function getFeeItemById(id: number): Promise<FeeItem | null> {
  try {
    const res = await apiClient.get(`/api/fee/items/${id}`);
    if (res.data.code === 200) return res.data.data;
    if (res.data.code === 404) return null;
    throw new Error(res.data.message);
  } catch {
    return null;
  }
}

export async function createFeeItem(data: Omit<FeeItem, 'id' | 'createTime' | 'updateTime'>): Promise<FeeItem> {
  try {
    const res = await apiClient.post('/api/fee/items', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] createFeeItem error:', error);
    throw error;
  }
}

export async function updateFeeItem(id: number, data: Partial<FeeItem>): Promise<FeeItem | null> {
  try {
    const res = await apiClient.put(`/api/fee/items/${id}`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] updateFeeItem error:', error);
    throw error;
  }
}

export async function deleteFeeItem(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/fee/items/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

// ===== 计费规则 =====
export async function getChargeRules(projectId: number): Promise<ChargeRule[]> {
  try {
    const res = await apiClient.get('/api/fee/rules', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function createChargeRule(data: Omit<ChargeRule, 'id' | 'createTime' | 'updateTime'>): Promise<ChargeRule> {
  try {
    const res = await apiClient.post('/api/fee/rules', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] createChargeRule error:', error);
    throw error;
  }
}

export async function updateChargeRule(id: number, data: Partial<ChargeRule>): Promise<ChargeRule | null> {
  try {
    const res = await apiClient.put(`/api/fee/rules/${id}`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] updateChargeRule error:', error);
    throw error;
  }
}

export async function deleteChargeRule(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/fee/rules/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

// ===== 账单管理 =====
export async function getBills(params: BillQueryParams): Promise<{ list: Bill[]; total: number }> {
  try {
    const res = await apiClient.get('/api/fee/bills', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { list: [], total: 0 };
  }
}

export async function getBillById(id: number): Promise<Bill | null> {
  try {
    const res = await apiClient.get(`/api/fee/bills/${id}`);
    if (res.data.code === 200) return res.data.data;
    if (res.data.code === 404) return null;
    throw new Error(res.data.message);
  } catch {
    return null;
  }
}

export async function generateBills(params: BillGenerateParams): Promise<Bill[]> {
  try {
    const res = await apiClient.post('/api/fee/bills/generate', params);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] generateBills error:', error);
    throw error;
  }
}

export async function autoGenerateBills(projectId: number, periodYear: number, periodMonth: number): Promise<{ total: number; bills: Bill[] }> {
  try {
    const res = await apiClient.post('/api/fee/bills/auto-generate', { projectId, periodYear, periodMonth });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] autoGenerateBills error:', error);
    throw error;
  }
}

export async function adjustBill(data: BillAdjustData): Promise<Bill | null> {
  try {
    const res = await apiClient.put(`/api/fee/bills/${data.id}/adjust`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] adjustBill error:', error);
    throw error;
  }
}

export async function cancelBill(id: number): Promise<boolean> {
  try {
    const res = await apiClient.put(`/api/fee/bills/${id}/cancel`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

// ===== 缴费管理 =====
export async function getPayments(params: PaymentQueryParams): Promise<{ list: PaymentRecord[]; total: number }> {
  try {
    const res = await apiClient.get('/api/fee/payments', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { list: [], total: 0 };
  }
}

export async function createOfflinePayment(data: OfflinePaymentData): Promise<PaymentRecord[]> {
  try {
    const res = await apiClient.post('/api/fee/payments/offline', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] createOfflinePayment error:', error);
    throw error;
  }
}

// ===== 催缴管理 =====
export async function getCollections(params: CollectionQueryParams): Promise<{ list: CollectionRecord[]; total: number }> {
  try {
    const res = await apiClient.get('/api/fee/collections', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { list: [], total: 0 };
  }
}

export async function getOverdueBills(projectId: number): Promise<Bill[]> {
  try {
    const res = await apiClient.get('/api/fee/bills/overdue', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function sendCollection(billId: number, type: CollectionType): Promise<CollectionRecord> {
  try {
    const res = await apiClient.post('/api/fee/collections', { billId, collectionType: type });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] sendCollection error:', error);
    throw error;
  }
}

export async function getCollectionTemplates(projectId: number): Promise<CollectionTemplate[]> {
  try {
    const res = await apiClient.get('/api/fee/collection-templates', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function saveCollectionTemplate(data: Omit<CollectionTemplate, 'id' | 'createTime' | 'updateTime'>): Promise<CollectionTemplate> {
  try {
    const res = await apiClient.post('/api/fee/collection-templates', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] saveCollectionTemplate error:', error);
    throw error;
  }
}

// ===== 房屋费用项关联 =====
export async function getHouseFeeItems(params: HouseFeeItemQueryParams): Promise<{ list: HouseFeeItem[]; total: number }> {
  try {
    const res = await apiClient.get('/api/fee/house-items', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { list: [], total: 0 };
  }
}

export async function getHouseFeeItemIds(houseId: number): Promise<number[]> {
  try {
    const res = await apiClient.get(`/api/fee/house-items/ids/${houseId}`);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function getHouseFeeItemMap(projectId: number): Promise<Map<number, number[]>> {
  try {
    const res = await apiClient.get('/api/fee/house-items/map', { params: { projectId } });
    if (res.data.code === 200) {
      const map = new Map<number, number[]>();
      Object.entries(res.data.data).forEach(([key, val]) => {
        map.set(Number(key), val as number[]);
      });
      return map;
    }
    throw new Error(res.data.message);
  } catch {
    return new Map();
  }
}

export async function createHouseFeeItem(data: Omit<HouseFeeItem, 'id' | 'createTime' | 'updateTime'>): Promise<HouseFeeItem> {
  try {
    const res = await apiClient.post('/api/fee/house-items', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] createHouseFeeItem error:', error);
    throw error;
  }
}

export async function batchCreateHouseFeeItems(dataList: Omit<HouseFeeItem, 'id' | 'createTime' | 'updateTime'>[]): Promise<HouseFeeItem[]> {
  try {
    const res = await apiClient.post('/api/fee/house-items/batch', { items: dataList });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] batchCreateHouseFeeItems error:', error);
    throw error;
  }
}

export async function updateHouseFeeItem(id: number, data: Partial<HouseFeeItem>): Promise<HouseFeeItem | null> {
  try {
    const res = await apiClient.put(`/api/fee/house-items/${id}`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] updateHouseFeeItem error:', error);
    throw error;
  }
}

export async function deleteHouseFeeItem(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/fee/house-items/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

export async function importHouseFeeItems(projectId: number, rows: { houseId: number; feeItemId: number; customPrice?: number }[]): Promise<HouseFeeItemImportResult> {
  try {
    const res = await apiClient.post('/api/fee/house-items/import', { projectId, rows });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[feeService] importHouseFeeItems error:', error);
    throw error;
  }
}

// ===== 统计报表 =====
export async function getFeeStatistics(projectId: number): Promise<FeeStatistics> {
  try {
    const res = await apiClient.get('/api/fee/statistics', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return {
      totalReceivable: 0, totalReceived: 0, totalArrears: 0,
      collectionRate: 0, monthReceivable: 0, monthReceived: 0,
      monthCollectionRate: 0, overdueCount: 0, totalBills: 0, paidBills: 0
    };
  }
}

export async function getBuildingFeeSummary(projectId: number): Promise<BuildingFeeSummary[]> {
  try {
    const res = await apiClient.get('/api/fee/building-summary', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function getFeeTrend(projectId: number, year: number): Promise<FeeTrendPoint[]> {
  try {
    const res = await apiClient.get('/api/fee/trend', { params: { projectId, year } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}
