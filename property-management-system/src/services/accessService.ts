import apiClient from './apiClient';

// ===== 类型定义 =====
export interface DoorDevice {
  id: number;
  deviceName: string;
  deviceCode: string;
  deviceType: 'entrance' | 'unit' | 'garage' | 'elevator' | 'other';
  buildingId?: number;
  unitId?: number;
  location?: string;
  status: 'online' | 'offline' | 'fault';
  lastOnlineTime?: string;
  createTime: string;
  // 兼容旧字段名（页面使用）
  /** @deprecated 使用 deviceName */
  name?: string;
  /** @deprecated 使用 deviceType */
  type?: string;
  /** @deprecated 使用 status === 'online' */
  isOnline?: boolean;
}

export interface AccessRecord {
  id: number;
  deviceId: number;
  deviceName?: string;
  accessType: 'qr_code' | 'password' | 'remote' | 'card' | 'face' | 'intercom';
  visitorName?: string;
  visitorPhone?: string;
  targetHouse?: string;
  plateNo?: string;
  accessTime: string;
  status: 'success' | 'failed' | 'expired';
  createTime: string;
  // 兼容旧字段名
  /** @deprecated 使用 accessTime */
  time?: string;
  /** @deprecated 使用 deviceName */
  doorName?: string;
  /** @deprecated 使用 accessType */
  method?: string;
  ownerName?: string;
  ownerPhone?: string;
  houseAddress?: string;
  failReason?: string;
}

export interface TempPassword {
  id: number;
  deviceId: number;
  deviceName?: string;
  password: string;
  visitorName?: string;
  visitorPhone?: string;
  validPeriod: 'once' | 'day' | 'week' | 'custom';
  expireTime?: string;
  status: 'active' | 'used' | 'expired';
  createTime: string;
  // 兼容旧字段名
  doorName?: string;
  validTo?: string;
}

export interface VisitorAuthRecord {
  id: number;
  visitorName: string;
  visitorPhone: string;
  targetHouse: string;
  visitReason: string;
  visitTime: string;
  status: 'pending' | 'approved' | 'rejected';
  createTime: string;
  // 兼容旧字段名
  doorName?: string;
  authType?: string;
  createdAt?: string;
}

export interface VisitorLedger {
  id: number;
  visitorName: string;
  visitorPhone: string;
  idCard?: string;
  plateNo?: string;
  targetHouse: string;
  visitReason: string;
  visitTime: string;
  leaveTime?: string;
  status: 'visiting' | 'left';
  createTime: string;
  // 兼容旧字段名
  visitorTypeName?: string;
  ownerName?: string;
  ownerHouse?: string;
  authType?: string;
}

export interface VisitorType {
  id: number;
  typeName: string;
  description?: string;
  status: 'active' | 'inactive';
  createTime: string;
  // 兼容旧字段名
  typeCode?: string;
  isPreset?: boolean;
  isActive?: boolean;
  needReview?: boolean;
  defaultValidity?: number;
  sortOrder?: number;
}

export interface VisitorLedgerStats {
  todayVisitors: number;
  currentVisiting: number;
  todayLeft: number;
  totalThisMonth: number;
  // 兼容旧字段名
  todayCount?: number;
  weekCount?: number;
  monthCount?: number;
  totalCount?: number;
}

export interface VisitorBlacklist {
  id: number;
  visitorName: string;
  visitorPhone: string;
  reason: string;
  expireTime?: string;
  createTime: string;
}

export interface DoorDeviceManage {
  id: number;
  deviceName: string;
  deviceCode: string;
  deviceType: string;
  buildingId?: number;
  unitId?: number;
  location?: string;
  ipAddress?: string;
  port?: number;
  status: 'online' | 'offline' | 'fault';
  lastOnlineTime?: string;
  createTime: string;
  updateTime: string;
  // 兼容旧字段名
  /** @deprecated 使用 deviceName */
  name?: string;
  /** @deprecated 使用 deviceType */
  type?: string;
  /** @deprecated 使用 status === 'online' */
  isOnline?: boolean;
  isEnabled?: boolean;
  bluetoothMac?: string;
  lastHeartbeat?: string;
  buildingName?: string;
}

export interface VisitorAuthReview {
  id: number;
  visitorName: string;
  visitorPhone: string;
  targetHouse: string;
  visitReason: string;
  visitTime: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: string;
  reviewRemark?: string;
  reviewTime?: string;
  createTime: string;
  // 兼容旧字段名
  /** @deprecated 使用 reviewer */
  reviewedBy?: string;
  ownerName?: string;
  ownerHouse?: string;
  doorName?: string;
  validFrom?: string;
  validTo?: string;
}

export interface DoorPermission {
  id: number;
  deviceId: number;
  deviceName?: string;
  ownerId?: number;
  houseId?: number;
  permissionType: 'owner' | 'tenant' | 'temp';
  startTime: string;
  endTime?: string;
  status: 'active' | 'expired' | 'revoked';
  createTime: string;
}

// ===== 门禁设备（业主端）=====
export async function getDoorDevices(): Promise<DoorDevice[]> {
  try {
    const res = await apiClient.get('/api/access/devices');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function generateQRCode(doorId: number | string): Promise<{ qrContent: string; expiresIn: number }> {
  try {
    const res = await apiClient.post(`/api/access/devices/${doorId}/qrcode`);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] generateQRCode error:', error);
    throw error;
  }
}

export async function remoteOpen(doorId: number | string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post(`/api/access/devices/${doorId}/remote-open`);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] remoteOpen error:', error);
    throw error;
  }
}

export async function createTempPassword(params: {
  doorId?: number;
  deviceId?: number;
  visitorName?: string;
  visitorPhone?: string;
  visitReason?: string;
  validHours?: number;
  validPeriod?: string;
  expireTime?: string;
}): Promise<{ password: string; expireTime?: string }> {
  try {
    const apiParams: any = { ...params };
    // Map doorId to deviceId if provided
    if (apiParams.doorId !== undefined && apiParams.deviceId === undefined) {
      apiParams.deviceId = apiParams.doorId;
    }
    delete apiParams.doorId;
    // Map visitReason/validHours to validPeriod
    if (!apiParams.validPeriod && apiParams.validHours) {
      apiParams.validPeriod = `${apiParams.validHours}h`;
    }
    delete apiParams.validHours;
    const res = await apiClient.post('/api/access/temp-passwords', apiParams);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] createTempPassword error:', error);
    throw error;
  }
}

export async function remoteOpenForVisitor(params: { doorId: string; plateNo?: string }): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post(`/api/access/devices/${params.doorId}/remote-open-visitor`, { plateNo: params.plateNo });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] remoteOpenForVisitor error:', error);
    throw error;
  }
}

export async function getVisitorAuthRecords(): Promise<VisitorAuthRecord[]> {
  try {
    const res = await apiClient.get('/api/access/visitor-auth');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function getAccessRecords(params?: { doorId?: string; dateRange?: [string, string]; page?: number; pageSize?: number }): Promise<{ records: AccessRecord[]; total: number }> {
  try {
    const res = await apiClient.get('/api/access/records', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { records: [], total: 0 };
  }
}

// ===== 门禁设备管理（物业端）=====
export async function getDoorDevicesManage(params?: { keyword?: string; type?: string }): Promise<DoorDeviceManage[]> {
  try {
    const res = await apiClient.get('/api/access/manage/devices', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function createDoorDevice(data: Partial<DoorDeviceManage>): Promise<DoorDeviceManage> {
  try {
    const res = await apiClient.post('/api/access/manage/devices', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] createDoorDevice error:', error);
    throw error;
  }
}

export async function updateDoorDevice(id: number, data: Partial<DoorDeviceManage>): Promise<void> {
  try {
    const res = await apiClient.put(`/api/access/manage/devices/${id}`, data);
    if (res.data.code !== 200) throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] updateDoorDevice error:', error);
    throw error;
  }
}

export async function deleteDoorDevice(id: number): Promise<void> {
  try {
    const res = await apiClient.delete(`/api/access/manage/devices/${id}`);
    if (res.data.code !== 200) throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] deleteDoorDevice error:', error);
    throw error;
  }
}

export async function getAccessRecordsManage(params?: {
  doorId?: number;
  deviceId?: number;
  method?: string;
  accessType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ records: AccessRecord[]; total: number }> {
  try {
    const res = await apiClient.get('/api/access/manage/records', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { records: [], total: 0 };
  }
}

export async function getVisitorAuthReviews(status?: string): Promise<VisitorAuthReview[]> {
  try {
    const params = status ? { status } : {};
    const res = await apiClient.get('/api/access/manage/visitor-auth', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function reviewVisitorAuth(id: number, status: 'approved' | 'rejected', remark?: string): Promise<void> {
  try {
    const res = await apiClient.put(`/api/access/manage/visitor-auth/${id}`, { status, remark });
    if (res.data.code !== 200) throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] reviewVisitorAuth error:', error);
    throw error;
  }
}

// ===== 访客类型 =====
export async function getVisitorTypes(): Promise<VisitorType[]> {
  try {
    const res = await apiClient.get('/api/access/visitor-types');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function createVisitorType(data: Partial<VisitorType>): Promise<VisitorType> {
  try {
    const res = await apiClient.post('/api/access/visitor-types', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] createVisitorType error:', error);
    throw error;
  }
}

export async function updateVisitorType(id: number, data: Partial<VisitorType>): Promise<void> {
  try {
    const res = await apiClient.put(`/api/access/visitor-types/${id}`, data);
    if (res.data.code !== 200) throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] updateVisitorType error:', error);
    throw error;
  }
}

export async function deleteVisitorType(id: number): Promise<void> {
  try {
    const res = await apiClient.delete(`/api/access/visitor-types/${id}`);
    if (res.data.code !== 200) throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] deleteVisitorType error:', error);
    throw error;
  }
}

// ===== 访客台账 =====
export async function getVisitorLedgerList(params: {
  projectId?: number;
  keyword?: string;
  visitorType?: string;
  status?: string;
  authType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ list: VisitorLedger[]; total: number }> {
  try {
    const res = await apiClient.get('/api/access/visitor-ledger', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { list: [], total: 0 };
  }
}

export async function getVisitorLedgerStats(): Promise<VisitorLedgerStats> {
  try {
    const res = await apiClient.get('/api/access/visitor-ledger/stats');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { todayVisitors: 0, currentVisiting: 0, todayLeft: 0, totalThisMonth: 0 };
  }
}

export async function registerVisitor(data: {
  visitorName: string;
  visitorPhone: string;
  idCard?: string;
  plateNo?: string;
  targetHouse: string;
  visitReason: string;
  visitTime: string;
}): Promise<VisitorLedger> {
  try {
    const res = await apiClient.post('/api/access/visitor-ledger', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] registerVisitor error:', error);
    throw error;
  }
}

export async function markVisitorLeft(id: number): Promise<void> {
  try {
    const res = await apiClient.put(`/api/access/visitor-ledger/${id}/leave`);
    if (res.data.code !== 200) throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] markVisitorLeft error:', error);
    throw error;
  }
}

// ===== 黑名单 =====
export async function getBlacklist(): Promise<VisitorBlacklist[]> {
  try {
    const res = await apiClient.get('/api/access/blacklist');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function addToBlacklist(data: { visitorName: string; visitorPhone: string; reason: string; expireTime?: string }): Promise<void> {
  try {
    const res = await apiClient.post('/api/access/blacklist', data);
    if (res.data.code !== 200) throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] addToBlacklist error:', error);
    throw error;
  }
}

export async function removeFromBlacklist(id: number): Promise<void> {
  try {
    const res = await apiClient.delete(`/api/access/blacklist/${id}`);
    if (res.data.code !== 200) throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[accessService] removeFromBlacklist error:', error);
    throw error;
  }
}
