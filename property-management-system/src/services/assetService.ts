import apiClient from './apiClient';
import type {
  Building, BuildingUnit, House, Owner, HouseOwner, OwnerChangeLog,
  ParkingSpace, AssetStatistics, BuildingStatistics, OwnerAccount,
  AccountTransaction, DataSource
} from './assetTypes';

export type {
  Building, BuildingUnit, House, Owner, HouseOwner, OwnerChangeLog,
  ParkingSpace, AssetStatistics, BuildingStatistics, OwnerAccount,
  AccountTransaction, DataSource
};

// ===== 本地查询参数类型（assetTypes.ts 中未定义） =====
export interface HouseQueryParams {
  projectId: number;
  buildingId?: number;
  unitId?: number;
  status?: string;
  decorationStatus?: string;
  ownershipStatus?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface OwnerQueryParams {
  projectId: number;
  keyword?: string;
  status?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}

export interface ParkingQueryParams {
  projectId: number;
  type?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface SyncLog {
  id: number;
  syncType: string;
  syncTime: string;
  status: 'success' | 'failed' | 'running';
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  errorMessage?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BatchGenerateParams {
  buildingId: number;
  unitId?: number;
  startFloor: number;
  endFloor: number;
  roomsPerFloor: number;
  roomPrefix?: string;
  layout?: string;
  area?: number;
}

// ===== 楼栋管理 =====
export async function getBuildings(projectId: number): Promise<Building[]> {
  try {
    const res = await apiClient.get('/api/assets/buildings', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function getBuildingById(id: number): Promise<Building | null> {
  try {
    const res = await apiClient.get(`/api/assets/buildings/${id}`);
    if (res.data.code === 200) return res.data.data;
    if (res.data.code === 404) return null;
    throw new Error(res.data.message);
  } catch {
    return null;
  }
}

export async function createBuilding(data: Omit<Building, 'id' | 'createTime' | 'updateTime'>): Promise<Building> {
  try {
    const res = await apiClient.post('/api/assets/buildings', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] createBuilding error:', error);
    throw error;
  }
}

export async function updateBuilding(id: number, data: Partial<Building>): Promise<Building | null> {
  try {
    const res = await apiClient.put(`/api/assets/buildings/${id}`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] updateBuilding error:', error);
    throw error;
  }
}

export async function deleteBuilding(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/assets/buildings/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

// ===== 单元管理 =====
export async function getUnits(buildingId?: number): Promise<BuildingUnit[]> {
  try {
    const params = buildingId ? { buildingId } : {};
    const res = await apiClient.get('/api/assets/units', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function createUnit(data: Omit<BuildingUnit, 'id' | 'createTime' | 'updateTime'>): Promise<BuildingUnit> {
  try {
    const res = await apiClient.post('/api/assets/units', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] createUnit error:', error);
    throw error;
  }
}

export async function updateUnit(id: number, data: Partial<BuildingUnit>): Promise<BuildingUnit | null> {
  try {
    const res = await apiClient.put(`/api/assets/units/${id}`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] updateUnit error:', error);
    throw error;
  }
}

export async function deleteUnit(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/assets/units/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

// ===== 房屋管理 =====
export async function getHouses(params: HouseQueryParams): Promise<PaginatedResult<House>> {
  try {
    const res = await apiClient.get('/api/assets/houses', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { list: [], total: 0, page: 1, pageSize: 20 };
  }
}

export async function getHouseById(id: number): Promise<House | null> {
  try {
    const res = await apiClient.get(`/api/assets/houses/${id}`);
    if (res.data.code === 200) return res.data.data;
    if (res.data.code === 404) return null;
    throw new Error(res.data.message);
  } catch {
    return null;
  }
}

export async function createHouse(data: Omit<House, 'id' | 'createTime' | 'updateTime'>): Promise<House> {
  try {
    const res = await apiClient.post('/api/assets/houses', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] createHouse error:', error);
    throw error;
  }
}

export async function updateHouse(id: number, data: Partial<House>): Promise<House | null> {
  try {
    const res = await apiClient.put(`/api/assets/houses/${id}`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] updateHouse error:', error);
    throw error;
  }
}

export async function deleteHouse(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/assets/houses/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

export async function batchGenerateHouses(params: BatchGenerateParams): Promise<House[]> {
  try {
    const res = await apiClient.post('/api/assets/houses/batch', params);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] batchGenerateHouses error:', error);
    throw error;
  }
}

// ===== 业主管理 =====
export async function getOwners(params: OwnerQueryParams): Promise<PaginatedResult<Owner>> {
  try {
    const res = await apiClient.get('/api/assets/owners', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { list: [], total: 0, page: 1, pageSize: 20 };
  }
}

export async function getOwnerById(id: number): Promise<Owner | null> {
  try {
    const res = await apiClient.get(`/api/assets/owners/${id}`);
    if (res.data.code === 200) return res.data.data;
    if (res.data.code === 404) return null;
    throw new Error(res.data.message);
  } catch {
    return null;
  }
}

export async function createOwner(data: Omit<Owner, 'id' | 'createTime' | 'updateTime'>): Promise<Owner> {
  try {
    const res = await apiClient.post('/api/assets/owners', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] createOwner error:', error);
    throw error;
  }
}

export async function updateOwner(id: number, data: Partial<Owner>): Promise<Owner | null> {
  try {
    const res = await apiClient.put(`/api/assets/owners/${id}`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] updateOwner error:', error);
    throw error;
  }
}

export async function deleteOwner(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/assets/owners/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

// ===== 房屋-业主关联 =====
export async function getHouseOwners(houseId: number): Promise<HouseOwner[]> {
  try {
    const res = await apiClient.get(`/api/assets/houses/${houseId}/owners`);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function bindOwner(data: {
  houseId: number;
  ownerId: number;
  ownerType: string;
  relation?: string;
  isPrimary?: boolean;
  remark?: string;
  startDate?: string;
  endDate?: string;
}): Promise<HouseOwner> {
  try {
    const res = await apiClient.post('/api/assets/house-owners', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] bindOwner error:', error);
    throw error;
  }
}

export async function unbindOwner(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/assets/house-owners/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

export async function getOwnerChangeHistory(houseId?: number): Promise<OwnerChangeLog[]> {
  try {
    const params = houseId ? { houseId } : {};
    const res = await apiClient.get('/api/assets/owner-changes', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

// ===== 车位管理 =====
export async function getParkingSpaces(params: ParkingQueryParams): Promise<PaginatedResult<ParkingSpace>> {
  try {
    const res = await apiClient.get('/api/assets/parking', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { list: [], total: 0, page: 1, pageSize: 20 };
  }
}

export async function getParkingSpaceById(id: number): Promise<ParkingSpace | null> {
  try {
    const res = await apiClient.get(`/api/assets/parking/${id}`);
    if (res.data.code === 200) return res.data.data;
    if (res.data.code === 404) return null;
    throw new Error(res.data.message);
  } catch {
    return null;
  }
}

export async function createParkingSpace(data: Omit<ParkingSpace, 'id' | 'createTime' | 'updateTime'>): Promise<ParkingSpace> {
  try {
    const res = await apiClient.post('/api/assets/parking', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] createParkingSpace error:', error);
    throw error;
  }
}

export async function updateParkingSpace(id: number, data: Partial<ParkingSpace>): Promise<ParkingSpace | null> {
  try {
    const res = await apiClient.put(`/api/assets/parking/${id}`, data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] updateParkingSpace error:', error);
    throw error;
  }
}

export async function deleteParkingSpace(id: number): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/api/assets/parking/${id}`);
    return res.data.code === 200;
  } catch {
    return false;
  }
}

export async function bindParkingOwner(parkingId: number, ownerId: number): Promise<ParkingSpace | null> {
  try {
    const res = await apiClient.post(`/api/assets/parking/${parkingId}/bind`, { ownerId });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] bindParkingOwner error:', error);
    throw error;
  }
}

export async function unbindParkingOwner(parkingId: number): Promise<ParkingSpace | null> {
  try {
    const res = await apiClient.post(`/api/assets/parking/${parkingId}/unbind`);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] unbindParkingOwner error:', error);
    throw error;
  }
}

// ===== 统计 =====
export async function getAssetStatistics(projectId: number): Promise<AssetStatistics> {
  try {
    const res = await apiClient.get('/api/assets/statistics', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return {
      projectId, projectName: '', buildingCount: 0, houseCount: 0,
      occupiedCount: 0, vacantCount: 0, occupancyRate: 0,
      parkingCount: 0, fixedParkingCount: 0, temporaryParkingCount: 0,
      soldRentedParkingCount: 0, parkingUtilizationRate: 0,
      ownerCount: 0, boundHouseCount: 0, unboundHouseCount: 0,
      monthlyNewOwnerCount: 0, dataSource: 'manual',
    };
  }
}

export async function getBuildingStatistics(projectId: number): Promise<BuildingStatistics[]> {
  try {
    const res = await apiClient.get('/api/assets/building-stats', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

// ===== 数据同步 =====
export async function getSyncLogs(projectId: number): Promise<SyncLog[]> {
  try {
    const res = await apiClient.get('/api/assets/sync-logs', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function triggerSync(projectId: number, syncTypes: string[]): Promise<SyncLog[]> {
  try {
    const res = await apiClient.post('/api/assets/sync', { projectId, syncTypes });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] triggerSync error:', error);
    throw error;
  }
}

// ===== 业主账户 =====
export async function getOwnerAccounts(projectId: number): Promise<OwnerAccount[]> {
  try {
    const res = await apiClient.get('/api/assets/owner-accounts', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function getOwnerAccountByOwnerId(ownerId: number): Promise<OwnerAccount | null> {
  try {
    const res = await apiClient.get(`/api/assets/owner-accounts/by-owner/${ownerId}`);
    if (res.data.code === 200) return res.data.data;
    if (res.data.code === 404) return null;
    throw new Error(res.data.message);
  } catch {
    return null;
  }
}

export async function rechargeOwnerAccount(accountId: number, amount: number, description?: string): Promise<OwnerAccount> {
  try {
    const res = await apiClient.post(`/api/assets/owner-accounts/${accountId}/recharge`, { amount, description });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[assetService] rechargeOwnerAccount error:', error);
    throw error;
  }
}

export async function getAccountTransactions(accountId: number): Promise<AccountTransaction[]> {
  try {
    const res = await apiClient.get(`/api/assets/owner-accounts/${accountId}/transactions`);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function getAllOwnerTags(projectId: number): Promise<string[]> {
  try {
    const res = await apiClient.get('/api/assets/owner-tags', { params: { projectId } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}
