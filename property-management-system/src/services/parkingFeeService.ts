// ===== 物业端 - 停车收费管理 服务层 =====
// 提供收费标准管理、收费记录、车辆出入记录、收费统计等功能
// 支持三种停车收费类型：产权车位（管理费）、月租车位（月租费）、临时停车（按时计费）

import apiClient from './apiClient';
import type { ParkingFeeItem, ParkingFeeItemQueryParams, ParkingFeeItemImportResult } from './feeTypes';

// ===== 类型定义 =====

/** 收费标准类型 */
export type FeeRateType = 'hourly' | 'daily' | 'monthly' | 'yearly';

/** 收费规则状态 */
export type FeeRuleStatus = 'active' | 'inactive';

/** 停车收费类型 */
export type ParkingFeeType = 'property' | 'rental' | 'temporary';

/** 收费规则 */
export interface ParkingFeeRule {
  id: number;
  projectId: number;
  name: string;
  vehicleType: 'car' | 'motorcycle' | 'large';
  rateType: FeeRateType;
  unitPrice: number;
  freeMinutes: number;
  dailyCap: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  description?: string;
  status: FeeRuleStatus;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}

/** 车辆出入记录（物业端） */
export interface ParkingEntryRecord {
  id: number;
  projectId: number;
  plateNo: string;
  vehicleType: 'car' | 'motorcycle' | 'large';
  entryTime: string;
  exitTime?: string;
  entrance: string;
  exitEntrance?: string;
  duration?: string;
  fee: number;
  actualFee: number;
  status: 'parked' | 'exited' | 'free';
  payMethod?: 'wechat' | 'alipay' | 'cash' | 'monthly' | 'free';
  payTime?: string;
  operator?: string;
  remark?: string;
  createTime: string;
}

/** 收费记录 */
export interface ParkingChargeRecord {
  id: number;
  projectId: number;
  plateNo: string;
  vehicleType: 'car' | 'motorcycle' | 'large';
  entryTime: string;
  exitTime: string;
  duration: string;
  durationMinutes: number;
  fee: number;
  actualFee: number;
  payMethod: 'wechat' | 'alipay' | 'cash' | 'monthly' | 'free';
  payTime: string;
  operator: string;
  remark?: string;
  createTime: string;
}

/** 产权车位收费记录 */
export interface PropertyParkingFeeRecord {
  id: number;
  projectId: number;
  parkingSpaceId: number;
  parkingCode: string;
  ownerName: string;
  houseFullName: string;
  plateNo?: string;
  managementFee: number;
  period: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  payMethod?: string;
  createTime: string;
  updateTime: string;
}

/** 产权车位收费查询参数 */
export interface PropertyParkingFeeQueryParams {
  projectId: number;
  keyword?: string;
  status?: string;
  period?: string;
  page?: number;
  pageSize?: number;
}

/** 月租车位订阅信息 */
export interface RentalParkingSubscription {
  id: number;
  projectId: number;
  parkingSpaceId?: number;
  parkingCode?: string;
  plateNo: string;
  ownerName: string;
  phone: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  remark?: string;
  createTime: string;
  updateTime: string;
}

/** 月租车位收费记录 */
export interface RentalParkingFeeRecord {
  id: number;
  projectId: number;
  subscriptionId: number;
  plateNo: string;
  ownerName: string;
  monthlyRent: number;
  period: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  payMethod?: string;
  createTime: string;
  updateTime: string;
}

/** 月租车位查询参数 */
export interface RentalParkingQueryParams {
  projectId: number;
  keyword?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

/** 月租收费查询参数 */
export interface RentalFeeQueryParams {
  projectId: number;
  keyword?: string;
  status?: string;
  period?: string;
  page?: number;
  pageSize?: number;
}

/** 收费统计 */
export interface ParkingFeeStats {
  todayIncome: number;
  monthIncome: number;
  yearIncome: number;
  totalIncome: number;
  todayCount: number;
  monthCount: number;
  currentParked: number;
  monthlySubscribers: number;
  propertyParkingCount: number;
  rentalSubscriberCount: number;
  propertyFeePending: number;
  rentalFeePending: number;
}

/** 收费趋势点 */
export interface FeeTrendPoint {
  date: string;
  amount: number;
  count: number;
}

/** 收费查询参数 */
export interface ParkingChargeQueryParams {
  projectId: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  payMethod?: string;
  page?: number;
  pageSize?: number;
}

/** 车辆出入查询参数 */
export interface ParkingEntryQueryParams {
  projectId: number;
  keyword?: string;
  status?: 'parked' | 'exited' | 'free';
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ===== 工具函数：下划线转驼峰 =====
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = obj[key];
    }
    return result;
  }
  return obj;
}

// ===== API 函数：收费标准管理 =====

/** 获取收费标准列表 */
export async function getParkingFeeRules(projectId: number): Promise<ParkingFeeRule[]> {
  const res = await apiClient.get('/parking-fee/rules', { params: { projectId } });
  return toCamelCase(res.data.data);
}

/** 获取收费标准详情 */
export async function getParkingFeeRuleById(id: number): Promise<ParkingFeeRule | null> {
  const res = await apiClient.get(`/parking-fee/rules/${id}`);
  return toCamelCase(res.data.data);
}

/** 创建收费标准 */
export async function createParkingFeeRule(data: Omit<ParkingFeeRule, 'id' | 'createTime' | 'updateTime'>): Promise<ParkingFeeRule> {
  const res = await apiClient.post('/parking-fee/rules', data);
  return toCamelCase(res.data.data);
}

/** 更新收费标准 */
export async function updateParkingFeeRule(id: number, data: Partial<ParkingFeeRule>): Promise<ParkingFeeRule | null> {
  const res = await apiClient.put(`/parking-fee/rules/${id}`, data);
  return toCamelCase(res.data.data);
}

/** 删除收费标准 */
export async function deleteParkingFeeRule(id: number): Promise<boolean> {
  await apiClient.delete(`/parking-fee/rules/${id}`);
  return true;
}

// ===== API 函数：车辆出入管理 =====

/** 车辆入场登记 */
export async function createParkingEntry(data: {
  projectId: number;
  plateNo: string;
  vehicleType?: string;
  entrance?: string;
  remark?: string;
}): Promise<ParkingEntryRecord> {
  const res = await apiClient.post('/parking-fee/entries', data);
  return toCamelCase(res.data.data);
}

/** 获取车辆出入记录 */
export async function getParkingEntryRecords(params: ParkingEntryQueryParams): Promise<{ list: ParkingEntryRecord[]; total: number }> {
  const res = await apiClient.get('/parking-fee/entries', { params });
  return toCamelCase(res.data.data);
}

/** 车辆出场收费 */
export async function processParkingExit(recordId: number, payMethod: ParkingEntryRecord['payMethod'], actualFee: number, operator: string): Promise<ParkingEntryRecord> {
  const res = await apiClient.put(`/parking-fee/entries/${recordId}/exit`, { payMethod, actualFee, operator });
  return toCamelCase(res.data.data);
}

/** 获取收费记录 */
export async function getParkingChargeRecords(params: ParkingChargeQueryParams): Promise<{ list: ParkingChargeRecord[]; total: number }> {
  const res = await apiClient.get('/parking-fee/charges', { params });
  return toCamelCase(res.data.data);
}

/** 获取收费统计 */
export async function getParkingFeeStats(projectId: number): Promise<ParkingFeeStats> {
  const res = await apiClient.get('/parking-fee/stats', { params: { projectId } });
  return toCamelCase(res.data.data);
}

/** 获取收费趋势（近7天/近30天） */
export async function getParkingFeeTrend(projectId: number, days: number = 7): Promise<FeeTrendPoint[]> {
  const res = await apiClient.get('/parking-fee/trend', { params: { projectId, days } });
  return toCamelCase(res.data.data);
}

// ===== API 函数：产权车位收费管理 =====

/** 获取产权车位收费列表 */
export async function getPropertyParkingFees(params: PropertyParkingFeeQueryParams): Promise<{ list: PropertyParkingFeeRecord[]; total: number }> {
  const res = await apiClient.get('/parking-fee/property', { params });
  return toCamelCase(res.data.data);
}

/** 生成产权车位管理费账单 */
export async function generatePropertyParkingFees(projectId: number, period: string): Promise<PropertyParkingFeeRecord[]> {
  const res = await apiClient.post('/parking-fee/property/generate', { projectId, period });
  return toCamelCase(res.data.data);
}

/** 产权车位收费 - 标记为已缴费 */
export async function payPropertyParkingFee(id: number, payMethod: string): Promise<PropertyParkingFeeRecord | null> {
  const res = await apiClient.put(`/parking-fee/property/${id}/pay`, { payMethod });
  return toCamelCase(res.data.data);
}

// ===== API 函数：车位-费用项关联管理 =====

/** 获取车位-费用项关联列表 */
export async function getParkingFeeItems(params: ParkingFeeItemQueryParams): Promise<{ list: ParkingFeeItem[]; total: number }> {
  const res = await apiClient.get('/parking-fee/items', { params });
  return toCamelCase(res.data.data);
}

/** 获取车位已关联的费用项ID列表 */
export async function getParkingFeeItemIds(parkingId: number): Promise<number[]> {
  const res = await apiClient.get(`/parking-fee/items/ids/${parkingId}`);
  return res.data.data;
}

/** 批量获取车位-费用项关联映射 */
export async function getParkingFeeItemMap(projectId: number): Promise<Map<number, number[]>> {
  const res = await apiClient.get('/parking-fee/items/map', { params: { projectId } });
  const map = new Map<number, number[]>();
  const raw = res.data.data || {};
  for (const [key, val] of Object.entries(raw)) {
    map.set(Number(key), val as number[]);
  }
  return map;
}

/** 创建车位-费用项关联 */
export async function createParkingFeeItem(data: Omit<ParkingFeeItem, 'id' | 'createTime' | 'updateTime'>): Promise<ParkingFeeItem> {
  const res = await apiClient.post('/parking-fee/items', data);
  return toCamelCase(res.data.data);
}

/** 批量创建车位-费用项关联 */
export async function batchCreateParkingFeeItems(dataList: Omit<ParkingFeeItem, 'id' | 'createTime' | 'updateTime'>[]): Promise<ParkingFeeItem[]> {
  const res = await apiClient.post('/parking-fee/items/batch', { dataList });
  return toCamelCase(res.data.data);
}

/** 更新车位-费用项关联 */
export async function updateParkingFeeItem(id: number, data: Partial<ParkingFeeItem>): Promise<ParkingFeeItem | null> {
  const res = await apiClient.put(`/parking-fee/items/${id}`, data);
  return toCamelCase(res.data.data);
}

/** 删除车位-费用项关联 */
export async function deleteParkingFeeItem(id: number): Promise<boolean> {
  await apiClient.delete(`/parking-fee/items/${id}`);
  return true;
}

/** 导入车位-费用项关联 */
export async function importParkingFeeItems(projectId: number, rows: { parkingId: number; feeItemId: number; customPrice?: number }[]): Promise<ParkingFeeItemImportResult> {
  const res = await apiClient.post('/parking-fee/items/import', { projectId, rows });
  return toCamelCase(res.data.data);
}

// ===== API 函数：月租车位收费管理 =====

/** 获取月租订阅列表 */
export async function getRentalSubscriptions(params: RentalParkingQueryParams): Promise<{ list: RentalParkingSubscription[]; total: number }> {
  const res = await apiClient.get('/parking-fee/rental/subscriptions', { params });
  return toCamelCase(res.data.data);
}

/** 创建月租订阅 */
export async function createRentalSubscription(data: Omit<RentalParkingSubscription, 'id' | 'createTime' | 'updateTime'>): Promise<RentalParkingSubscription> {
  const res = await apiClient.post('/parking-fee/rental/subscriptions', data);
  return toCamelCase(res.data.data);
}

/** 更新月租订阅 */
export async function updateRentalSubscription(id: number, data: Partial<RentalParkingSubscription>): Promise<RentalParkingSubscription | null> {
  const res = await apiClient.put(`/parking-fee/rental/subscriptions/${id}`, data);
  return toCamelCase(res.data.data);
}

/** 删除月租订阅 */
export async function deleteRentalSubscription(id: number): Promise<boolean> {
  await apiClient.delete(`/parking-fee/rental/subscriptions/${id}`);
  return true;
}

/** 获取月租收费记录 */
export async function getRentalParkingFees(params: RentalFeeQueryParams): Promise<{ list: RentalParkingFeeRecord[]; total: number }> {
  const res = await apiClient.get('/parking-fee/rental/fees', { params });
  return toCamelCase(res.data.data);
}

/** 生成月租车位账单 */
export async function generateRentalParkingFees(projectId: number, period: string): Promise<RentalParkingFeeRecord[]> {
  const res = await apiClient.post('/parking-fee/rental/fees/generate', { projectId, period });
  return toCamelCase(res.data.data);
}

/** 月租收费 - 标记为已缴费 */
export async function payRentalParkingFee(id: number, payMethod: string): Promise<RentalParkingFeeRecord | null> {
  const res = await apiClient.put(`/parking-fee/rental/fees/${id}/pay`, { payMethod });
  return toCamelCase(res.data.data);
}
