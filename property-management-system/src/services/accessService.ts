// ===== 智能门禁 & 访客管理 服务层 =====
// 提供门禁设备管理、开门记录、临时密码、访客台账等 API 调用
// 当前使用 Mock 数据，后续对接真实后端

// ===== 类型定义 =====

// 门禁设备
export interface DoorDevice {
  id: string;
  name: string;
  type: 'main' | 'unit' | 'underground' | 'side';
  buildingId?: string;
  buildingName?: string;
  bluetoothMac?: string;
  location?: string;
  isOnline: boolean;
  isDefault: boolean;
}

// 开门记录
export interface AccessRecord {
  id: string;
  doorId: string;
  doorName: string;
  method: 'bluetooth' | 'qrcode' | 'remote' | 'password' | 'face';
  status: 'success' | 'failed';
  time: string;
  ownerName?: string;
  ownerPhone?: string;
  houseAddress?: string;
  visitorName?: string;
  visitorPhone?: string;
  failReason?: string;
}

// 临时密码
export interface TempPassword {
  id: string;
  password: string;
  doorId: string;
  doorName: string;
  validFrom: string;
  validTo: string;
  status: 'active' | 'used' | 'expired';
  visitorName: string;
  visitorPhone: string;
  visitReason?: string;
  createdAt: string;
}

// 访客授权记录（业主端）
export interface VisitorAuthRecord {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitReason?: string;
  authType: 'password' | 'remote';
  doorName: string;
  createdAt: string;
  status: 'active' | 'used' | 'expired';
  validTo?: string;
}

// 访客台账
export interface VisitorLedger {
  id: number;
  projectId: number;
  visitorName: string;
  visitorPhone: string;
  visitorType: string;
  visitorTypeName: string;
  ownerId: number;
  ownerName: string;
  ownerHouse: string;
  houseId: number;
  authType: 'owner_grant' | 'property_register' | 'manual_entry';
  doorIds: number[];
  doorNames: string[];
  plateNo?: string;
  visitReason?: string;
  visitTime: string;
  leaveTime?: string;
  status: 'pending' | 'entered' | 'left' | 'expired';
  tempPasswordId?: string;
  tempPassword?: string;
  isBlacklisted: boolean;
  createTime: string;
  updateTime: string;
}

// 访客类型
export interface VisitorType {
  id: number;
  projectId: number;
  typeCode: string;
  typeName: string;
  needReview: boolean;
  defaultValidity: number;
  isActive: boolean;
  sortOrder: number;
  isPreset: boolean;
  createTime: string;
}

// 访客台账统计
export interface VisitorLedgerStats {
  todayCount: number;
  monthCount: number;
  activeCount: number;
  blacklistCount: number;
}

// 访客黑名单
export interface VisitorBlacklist {
  id: number;
  projectId: number;
  visitorName: string;
  visitorPhone: string;
  reason: string;
  expireTime?: string;
  createdBy: string;
  createTime: string;
}

// 门禁设备管理
export interface DoorDeviceManage {
  id: number;
  projectId: number;
  name: string;
  type: 'main' | 'unit' | 'underground' | 'side';
  location: string;
  buildingId?: number;
  buildingName?: string;
  bluetoothMac?: string;
  isOnline: boolean;
  isEnabled: boolean;
  lastHeartbeat?: string;
  createTime: string;
  updateTime: string;
}

// 访客授权审核
export interface VisitorAuthReview {
  id: number;
  visitorName: string;
  visitorPhone: string;
  visitReason?: string;
  ownerId: number;
  ownerName: string;
  ownerHouse: string;
  doorId: number;
  doorName: string;
  validFrom: string;
  validTo: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewRemark?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// 门禁权限配置
export interface DoorPermission {
  id: number;
  houseId: number;
  houseAddress: string;
  doorIds: number[];
  doorNames: string[];
  timeRestriction?: { startTime: string; endTime: string };
  createdBy: string;
  createTime: string;
}

// ===== Mock 数据 =====

const mockDoorDevices: DoorDevice[] = [
  { id: '1', name: '小区东门', type: 'main', location: '小区东侧入口', isOnline: true, isDefault: true },
  { id: '2', name: '小区南门', type: 'main', location: '小区南侧入口', isOnline: true, isDefault: false },
  { id: '3', name: '3栋1单元门', type: 'unit', buildingId: '3', buildingName: '3栋', location: '3栋1单元大厅', bluetoothMac: 'AA:BB:CC:DD:EE:01', isOnline: true, isDefault: false },
  { id: '4', name: '3栋2单元门', type: 'unit', buildingId: '3', buildingName: '3栋', location: '3栋2单元大厅', bluetoothMac: 'AA:BB:CC:DD:EE:02', isOnline: false, isDefault: false },
  { id: '5', name: '地库入口', type: 'underground', location: '地下车库入口', isOnline: true, isDefault: false },
  { id: '6', name: '小区北门', type: 'side', location: '小区北侧入口', isOnline: true, isDefault: false },
];

const mockAccessRecords: AccessRecord[] = [
  { id: '1', doorId: '1', doorName: '小区东门', method: 'bluetooth', status: 'success', time: '2026-05-05 08:30:00', ownerName: '张三', houseAddress: '3栋1单元101室' },
  { id: '2', doorId: '3', doorName: '3栋1单元门', method: 'qrcode', status: 'success', time: '2026-05-05 08:28:00', ownerName: '张三', houseAddress: '3栋1单元101室' },
  { id: '3', doorId: '1', doorName: '小区东门', method: 'remote', status: 'success', time: '2026-05-05 07:15:00', visitorName: '李四', visitorPhone: '13800138001' },
  { id: '4', doorId: '5', doorName: '地库入口', method: 'bluetooth', status: 'failed', time: '2026-05-04 22:00:00', ownerName: '张三', houseAddress: '3栋1单元101室', failReason: '蓝牙连接超时' },
  { id: '5', doorId: '1', doorName: '小区东门', method: 'password', status: 'success', time: '2026-05-04 18:30:00', visitorName: '王五', visitorPhone: '13900139001' },
  { id: '6', doorId: '3', doorName: '3栋1单元门', method: 'bluetooth', status: 'success', time: '2026-05-04 08:00:00', ownerName: '张三', houseAddress: '3栋1单元101室' },
  { id: '7', doorId: '1', doorName: '小区东门', method: 'remote', status: 'success', time: '2026-05-03 20:00:00', ownerName: '张三', houseAddress: '3栋1单元101室' },
  { id: '8', doorId: '1', doorName: '小区东门', method: 'qrcode', status: 'success', time: '2026-05-03 12:00:00', visitorName: '赵六', visitorPhone: '13700137001' },
];

const mockTempPasswords: TempPassword[] = [
  { id: '1', password: '385926', doorId: '1', doorName: '小区东门', validFrom: '2026-05-05 08:00', validTo: '2026-05-05 20:00', status: 'active', visitorName: '李四', visitorPhone: '13800138001', visitReason: '朋友来访', createdAt: '2026-05-05 08:00' },
  { id: '2', password: '472615', doorId: '3', doorName: '3栋1单元门', validFrom: '2026-05-04 08:00', validTo: '2026-05-04 18:00', status: 'used', visitorName: '王五', visitorPhone: '13900139001', visitReason: '维修空调', createdAt: '2026-05-04 08:00' },
  { id: '3', password: '591347', doorId: '1', doorName: '小区东门', validFrom: '2026-05-03 10:00', validTo: '2026-05-03 22:00', status: 'expired', visitorName: '赵六', visitorPhone: '13700137001', visitReason: '送货', createdAt: '2026-05-03 10:00' },
];

const mockVisitorAuthRecords: VisitorAuthRecord[] = [
  { id: '1', visitorName: '李四', visitorPhone: '138****8001', authType: 'password', doorName: '小区东门', createdAt: '2026-05-05 08:00', status: 'active', validTo: '2026-05-05 20:00' },
  { id: '2', visitorName: '王五', visitorPhone: '139****9001', authType: 'password', doorName: '3栋1单元门', createdAt: '2026-05-04 08:00', status: 'used', validTo: '2026-05-04 18:00' },
  { id: '3', visitorName: '快递员', visitorPhone: '136****6001', authType: 'remote', doorName: '小区东门', createdAt: '2026-05-04 14:30', status: 'used' },
  { id: '4', visitorName: '赵六', visitorPhone: '137****7001', authType: 'password', doorName: '小区东门', createdAt: '2026-05-03 10:00', status: 'expired', validTo: '2026-05-03 22:00' },
];

// 访客台账 Mock 数据
const mockVisitorLedger: VisitorLedger[] = [
  { id: 1, projectId: 1, visitorName: '李四', visitorPhone: '138****8001', visitorType: 'VISITOR_FRIEND', visitorTypeName: '亲友来访', ownerId: 1, ownerName: '张三', ownerHouse: '3栋1单元101室', houseId: 1, authType: 'owner_grant', doorIds: [1], doorNames: ['小区东门'], visitReason: '朋友来访', visitTime: '2026-05-05 08:00', status: 'pending', isBlacklisted: false, createTime: '2026-05-05 08:00', updateTime: '2026-05-05 08:00' },
  { id: 2, projectId: 1, visitorName: '王五', visitorPhone: '139****9001', visitorType: 'VISITOR_MAINTENANCE', visitorTypeName: '维修人员', ownerId: 1, ownerName: '张三', ownerHouse: '3栋1单元101室', houseId: 1, authType: 'owner_grant', doorIds: [1, 3], doorNames: ['小区东门', '3栋1单元门'], visitReason: '维修空调', visitTime: '2026-05-04 08:00', leaveTime: '2026-05-04 16:30', status: 'left', isBlacklisted: false, createTime: '2026-05-04 08:00', updateTime: '2026-05-04 16:30' },
  { id: 3, projectId: 1, visitorName: '快递员', visitorPhone: '136****6001', visitorType: 'VISITOR_DELIVERY', visitorTypeName: '快递/外卖', ownerId: 1, ownerName: '张三', ownerHouse: '3栋1单元101室', houseId: 1, authType: 'owner_grant', doorIds: [1], doorNames: ['小区东门'], visitTime: '2026-05-04 14:30', leaveTime: '2026-05-04 14:35', status: 'left', isBlacklisted: false, createTime: '2026-05-04 14:30', updateTime: '2026-05-04 14:35' },
  { id: 4, projectId: 1, visitorName: '赵六', visitorPhone: '137****7001', visitorType: 'VISITOR_DELIVERY', visitorTypeName: '快递/外卖', ownerId: 2, ownerName: '李丽', ownerHouse: '3栋1单元102室', houseId: 2, authType: 'owner_grant', doorIds: [1], doorNames: ['小区东门'], visitTime: '2026-05-03 10:00', status: 'expired', isBlacklisted: false, createTime: '2026-05-03 10:00', updateTime: '2026-05-03 10:00' },
  { id: 5, projectId: 1, visitorName: '刘师傅', visitorPhone: '135****5001', visitorType: 'VISITOR_MOVE', visitorTypeName: '搬家人员', ownerId: 3, ownerName: '王强', ownerHouse: '5栋2单元301室', houseId: 3, authType: 'property_register', doorIds: [1, 4], doorNames: ['小区东门', '5栋2单元门'], plateNo: '京A12345', visitReason: '搬家入住', visitTime: '2026-05-05 09:00', status: 'entered', isBlacklisted: false, createTime: '2026-05-05 09:00', updateTime: '2026-05-05 09:00' },
  { id: 6, projectId: 1, visitorName: '陈工', visitorPhone: '134****4001', visitorType: 'VISITOR_CONTRACTOR', visitorTypeName: '施工人员', ownerId: 4, ownerName: '赵明', ownerHouse: '3栋2单元201室', houseId: 4, authType: 'property_register', doorIds: [1, 4], doorNames: ['小区东门', '3栋2单元门'], visitReason: '装修施工', visitTime: '2026-05-05 08:30', status: 'entered', isBlacklisted: false, createTime: '2026-05-05 08:30', updateTime: '2026-05-05 08:30' },
];

// 访客类型 Mock 数据
const mockVisitorTypes: VisitorType[] = [
  { id: 1, projectId: 1, typeCode: 'VISITOR_FRIEND', typeName: '亲友来访', needReview: false, defaultValidity: 24, isActive: true, sortOrder: 1, isPreset: true, createTime: '2026-01-01' },
  { id: 2, projectId: 1, typeCode: 'VISITOR_DELIVERY', typeName: '快递/外卖', needReview: false, defaultValidity: 2, isActive: true, sortOrder: 2, isPreset: true, createTime: '2026-01-01' },
  { id: 3, projectId: 1, typeCode: 'VISITOR_MAINTENANCE', typeName: '维修人员', needReview: true, defaultValidity: 24, isActive: true, sortOrder: 3, isPreset: true, createTime: '2026-01-01' },
  { id: 4, projectId: 1, typeCode: 'VISITOR_MOVE', typeName: '搬家人员', needReview: true, defaultValidity: 24, isActive: true, sortOrder: 4, isPreset: true, createTime: '2026-01-01' },
  { id: 5, projectId: 1, typeCode: 'VISITOR_CONTRACTOR', typeName: '施工人员', needReview: true, defaultValidity: 168, isActive: true, sortOrder: 5, isPreset: true, createTime: '2026-01-01' },
  { id: 6, projectId: 1, typeCode: 'VISITOR_CLEANING', typeName: '家政保洁', needReview: true, defaultValidity: 24, isActive: true, sortOrder: 6, isPreset: true, createTime: '2026-01-01' },
  { id: 7, projectId: 1, typeCode: 'VISITOR_BUSINESS', typeName: '商务拜访', needReview: true, defaultValidity: 24, isActive: true, sortOrder: 7, isPreset: true, createTime: '2026-01-01' },
  { id: 8, projectId: 1, typeCode: 'VISITOR_OTHER', typeName: '其他', needReview: false, defaultValidity: 24, isActive: true, sortOrder: 8, isPreset: true, createTime: '2026-01-01' },
];

// 访客黑名单 Mock
const mockBlacklist: VisitorBlacklist[] = [
  { id: 1, projectId: 1, visitorName: '恶意人员', visitorPhone: '130****0001', reason: '多次在小区内发传单', expireTime: '2026-08-01', createdBy: '物业管理员', createTime: '2026-05-01' },
];

// 门禁设备管理 Mock
const mockDoorDevicesManage: DoorDeviceManage[] = [
  { id: 1, projectId: 1, name: '小区东门', type: 'main', location: '小区东侧入口', isOnline: true, isEnabled: true, lastHeartbeat: '2026-05-05 08:25:00', createTime: '2026-01-01', updateTime: '2026-05-01' },
  { id: 2, projectId: 1, name: '小区南门', type: 'main', location: '小区南侧入口', isOnline: true, isEnabled: true, lastHeartbeat: '2026-05-05 08:24:00', createTime: '2026-01-01', updateTime: '2026-05-01' },
  { id: 3, projectId: 1, name: '3栋1单元门', type: 'unit', location: '3栋1单元大厅', buildingId: 3, buildingName: '3栋', bluetoothMac: 'AA:BB:CC:DD:EE:01', isOnline: true, isEnabled: true, lastHeartbeat: '2026-05-05 08:25:00', createTime: '2026-01-01', updateTime: '2026-05-01' },
  { id: 4, projectId: 1, name: '3栋2单元门', type: 'unit', location: '3栋2单元大厅', buildingId: 3, buildingName: '3栋', bluetoothMac: 'AA:BB:CC:DD:EE:02', isOnline: false, isEnabled: true, lastHeartbeat: '2026-05-04 22:00:00', createTime: '2026-01-01', updateTime: '2026-05-01' },
  { id: 5, projectId: 1, name: '地库入口', type: 'underground', location: '地下车库入口', isOnline: true, isEnabled: true, lastHeartbeat: '2026-05-05 08:23:00', createTime: '2026-01-01', updateTime: '2026-05-01' },
  { id: 6, projectId: 1, name: '小区北门', type: 'side', location: '小区北侧入口', isOnline: true, isEnabled: false, lastHeartbeat: '2026-05-05 08:20:00', createTime: '2026-01-01', updateTime: '2026-05-01' },
];

// 访客授权审核 Mock
const mockVisitorAuthReviews: VisitorAuthReview[] = [
  { id: 1, visitorName: '周工', visitorPhone: '133****3001', visitReason: '维修热水器', ownerId: 1, ownerName: '张三', ownerHouse: '3栋1单元101室', doorId: 3, doorName: '3栋1单元门', validFrom: '2026-05-05 14:00', validTo: '2026-05-05 17:00', status: 'pending', createdAt: '2026-05-05 10:00' },
  { id: 2, visitorName: '吴师傅', visitorPhone: '132****2001', visitReason: '搬家', ownerId: 5, ownerName: '刘芳', ownerHouse: '7栋1单元502室', doorId: 1, doorName: '小区东门', validFrom: '2026-05-06 08:00', validTo: '2026-05-06 18:00', status: 'pending', createdAt: '2026-05-05 09:30' },
];

// ===== 模拟延迟工具 =====
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ===== 业主端 - 门禁 API =====

/** 获取门禁设备列表 */
export async function getDoorDevices(): Promise<DoorDevice[]> {
  await delay();
  return [...mockDoorDevices];
}

/** 生成动态二维码（返回 base64 或二维码内容） */
export async function generateQRCode(doorId: string): Promise<{ qrContent: string; expiresIn: number }> {
  await delay(200);
  return {
    qrContent: `PLCCT_ACCESS_${doorId}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    expiresIn: 30,
  };
}

/** 远程开门 */
export async function remoteOpen(doorId: string): Promise<{ success: boolean; message: string }> {
  await delay(500);
  // 模拟 90% 成功率
  if (Math.random() > 0.1) {
    return { success: true, message: '开门成功' };
  }
  return { success: false, message: '开门失败，请重试' };
}

/** 创建临时密码 */
export async function createTempPassword(params: {
  doorId: string;
  visitorName: string;
  visitorPhone: string;
  visitReason?: string;
  validHours: number;
}): Promise<TempPassword> {
  await delay(400);
  const password = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date();
  const validTo = new Date(now.getTime() + params.validHours * 60 * 60 * 1000);
  const tp: TempPassword = {
    id: Date.now().toString(),
    password,
    doorId: params.doorId,
    doorName: mockDoorDevices.find(d => d.id === params.doorId)?.name || '',
    validFrom: now.toLocaleString('zh-CN', { hour12: false }),
    validTo: validTo.toLocaleString('zh-CN', { hour12: false }),
    status: 'active',
    visitorName: params.visitorName,
    visitorPhone: params.visitorPhone,
    visitReason: params.visitReason,
    createdAt: now.toLocaleString('zh-CN', { hour12: false }),
  };
  mockTempPasswords.push(tp);
  return tp;
}

/** 远程为访客开门 */
export async function remoteOpenForVisitor(params: { doorId: string; plateNo?: string }): Promise<{ success: boolean; message: string }> {
  await delay(500);
  return { success: true, message: '已为访客开门' };
}

/** 获取访客授权记录（业主端） */
export async function getVisitorAuthRecords(): Promise<VisitorAuthRecord[]> {
  await delay();
  return [...mockVisitorAuthRecords];
}

/** 获取开门记录 */
export async function getAccessRecords(params?: { doorId?: string; dateRange?: [string, string]; page?: number; pageSize?: number }): Promise<{ records: AccessRecord[]; total: number }> {
  await delay();
  let filtered = [...mockAccessRecords];
  if (params?.doorId) {
    filtered = filtered.filter(r => r.doorId === params.doorId);
  }
  if (params?.dateRange) {
    filtered = filtered.filter(r => r.time >= params.dateRange![0] && r.time <= params.dateRange![1]);
  }
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const start = (page - 1) * pageSize;
  return { records: filtered.slice(start, start + pageSize), total: filtered.length };
}

// ===== 物业管理端 - 门禁管理 API =====

/** 获取门禁设备管理列表 */
export async function getDoorDevicesManage(params?: { keyword?: string; type?: string }): Promise<DoorDeviceManage[]> {
  await delay();
  let list = [...mockDoorDevicesManage];
  if (params?.keyword) {
    list = list.filter(d => d.name.includes(params.keyword!) || d.location.includes(params.keyword!));
  }
  if (params?.type) {
    list = list.filter(d => d.type === params.type);
  }
  return list;
}

/** 新增门禁设备 */
export async function createDoorDevice(data: Partial<DoorDeviceManage>): Promise<DoorDeviceManage> {
  await delay(400);
  const newDevice: DoorDeviceManage = {
    id: Date.now(),
    projectId: 1,
    name: data.name || '',
    type: data.type || 'main',
    location: data.location || '',
    buildingId: data.buildingId,
    buildingName: data.buildingName,
    bluetoothMac: data.bluetoothMac,
    isOnline: false,
    isEnabled: data.isEnabled !== false,
    lastHeartbeat: undefined,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  };
  mockDoorDevicesManage.push(newDevice);
  return newDevice;
}

/** 更新门禁设备 */
export async function updateDoorDevice(id: number, data: Partial<DoorDeviceManage>): Promise<void> {
  await delay(300);
  const idx = mockDoorDevicesManage.findIndex(d => d.id === id);
  if (idx !== -1) {
    mockDoorDevicesManage[idx] = { ...mockDoorDevicesManage[idx], ...data, updateTime: new Date().toISOString() };
  }
}

/** 删除门禁设备 */
export async function deleteDoorDevice(id: number): Promise<void> {
  await delay(300);
  const idx = mockDoorDevicesManage.findIndex(d => d.id === id);
  if (idx !== -1) mockDoorDevicesManage.splice(idx, 1);
}

/** 获取开门记录（管理端） */
export async function getAccessRecordsManage(params?: {
  doorId?: number; method?: string; status?: string;
  startDate?: string; endDate?: string; page?: number; pageSize?: number;
}): Promise<{ records: AccessRecord[]; total: number }> {
  await delay();
  let filtered = [...mockAccessRecords];
  if (params?.doorId) filtered = filtered.filter(r => r.doorId === params.doorId!.toString());
  if (params?.method) filtered = filtered.filter(r => r.method === params.method);
  if (params?.status) filtered = filtered.filter(r => r.status === params.status);
  if (params?.startDate) filtered = filtered.filter(r => r.time >= params.startDate!);
  if (params?.endDate) filtered = filtered.filter(r => r.time <= params.endDate!);
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const start = (page - 1) * pageSize;
  return { records: filtered.slice(start, start + pageSize), total: filtered.length };
}

/** 获取访客授权审核列表 */
export async function getVisitorAuthReviews(status?: string): Promise<VisitorAuthReview[]> {
  await delay();
  if (status) return mockVisitorAuthReviews.filter(r => r.status === status);
  return [...mockVisitorAuthReviews];
}

/** 审核访客授权 */
export async function reviewVisitorAuth(id: number, status: 'approved' | 'rejected', remark?: string): Promise<void> {
  await delay(300);
  const idx = mockVisitorAuthReviews.findIndex(r => r.id === id);
  if (idx !== -1) {
    mockVisitorAuthReviews[idx].status = status;
    mockVisitorAuthReviews[idx].reviewRemark = remark;
    mockVisitorAuthReviews[idx].reviewedBy = '物业管理员';
    mockVisitorAuthReviews[idx].reviewedAt = new Date().toISOString();
  }
}

// ===== 物业管理端 - 访客管理 API =====

/** 获取访客类型列表 */
export async function getVisitorTypes(): Promise<VisitorType[]> {
  await delay();
  return [...mockVisitorTypes];
}

/** 新增访客类型 */
export async function createVisitorType(data: Partial<VisitorType>): Promise<VisitorType> {
  await delay(300);
  const vt: VisitorType = {
    id: Date.now(),
    projectId: 1,
    typeCode: data.typeCode || `CUSTOM_${Date.now()}`,
    typeName: data.typeName || '',
    needReview: data.needReview || false,
    defaultValidity: data.defaultValidity || 24,
    isActive: data.isActive !== false,
    sortOrder: mockVisitorTypes.length + 1,
    isPreset: false,
    createTime: new Date().toISOString(),
  };
  mockVisitorTypes.push(vt);
  return vt;
}

/** 更新访客类型 */
export async function updateVisitorType(id: number, data: Partial<VisitorType>): Promise<void> {
  await delay(300);
  const idx = mockVisitorTypes.findIndex(t => t.id === id);
  if (idx !== -1) {
    mockVisitorTypes[idx] = { ...mockVisitorTypes[idx], ...data };
  }
}

/** 删除访客类型 */
export async function deleteVisitorType(id: number): Promise<void> {
  await delay(300);
  const idx = mockVisitorTypes.findIndex(t => t.id === id);
  if (idx !== -1) mockVisitorTypes.splice(idx, 1);
}

/** 获取访客台账列表 */
export async function getVisitorLedgerList(params: {
  projectId?: number;
  visitorType?: string;
  status?: string;
  authType?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}): Promise<{ list: VisitorLedger[]; total: number }> {
  await delay();
  let filtered = [...mockVisitorLedger];
  if (params.visitorType) filtered = filtered.filter(v => v.visitorType === params.visitorType);
  if (params.status) filtered = filtered.filter(v => v.status === params.status);
  if (params.authType) filtered = filtered.filter(v => v.authType === params.authType);
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(v => v.visitorName.includes(kw) || v.visitorPhone.includes(kw) || v.ownerName.includes(kw));
  }
  if (params.startDate) filtered = filtered.filter(v => v.visitTime >= params.startDate!);
  if (params.endDate) filtered = filtered.filter(v => v.visitTime <= params.endDate!);
  const start = (params.page - 1) * params.pageSize;
  return { list: filtered.slice(start, start + params.pageSize), total: filtered.length };
}

/** 获取访客台账统计 */
export async function getVisitorLedgerStats(): Promise<VisitorLedgerStats> {
  await delay();
  return {
    todayCount: mockVisitorLedger.filter(v => v.visitTime.startsWith('2026-05-05')).length,
    monthCount: mockVisitorLedger.length,
    activeCount: mockVisitorLedger.filter(v => v.status === 'entered' || v.status === 'pending').length,
    blacklistCount: mockBlacklist.length,
  };
}

/** 手动登记访客 */
export async function registerVisitor(data: {
  visitorName: string;
  visitorPhone: string;
  visitorType: string;
  ownerId: number;
  ownerName: string;
  ownerHouse: string;
  houseId: number;
  doorIds: number[];
  plateNo?: string;
  visitReason?: string;
}): Promise<VisitorLedger> {
  await delay(400);
  const now = new Date().toISOString();
  const vl: VisitorLedger = {
    id: Date.now(),
    projectId: 1,
    visitorName: data.visitorName,
    visitorPhone: data.visitorPhone,
    visitorType: data.visitorType,
    visitorTypeName: mockVisitorTypes.find(t => t.typeCode === data.visitorType)?.typeName || '',
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    ownerHouse: data.ownerHouse,
    houseId: data.houseId,
    authType: 'property_register',
    doorIds: data.doorIds,
    doorNames: data.doorIds.map(id => mockDoorDevicesManage.find(d => d.id === id)?.name || '').filter(Boolean),
    plateNo: data.plateNo,
    visitReason: data.visitReason,
    visitTime: now,
    status: 'pending',
    isBlacklisted: false,
    createTime: now,
    updateTime: now,
  };
  mockVisitorLedger.push(vl);
  return vl;
}

/** 标记访客离开 */
export async function markVisitorLeft(id: number): Promise<void> {
  await delay(200);
  const idx = mockVisitorLedger.findIndex(v => v.id === id);
  if (idx !== -1) {
    mockVisitorLedger[idx].status = 'left';
    mockVisitorLedger[idx].leaveTime = new Date().toISOString();
  }
}

/** 获取黑名单列表 */
export async function getBlacklist(): Promise<VisitorBlacklist[]> {
  await delay();
  return [...mockBlacklist];
}

/** 加入黑名单 */
export async function addToBlacklist(data: { visitorName: string; visitorPhone: string; reason: string; expireTime?: string }): Promise<void> {
  await delay(300);
  const now = new Date().toISOString();
  mockBlacklist.push({
    id: Date.now(),
    projectId: 1,
    visitorName: data.visitorName,
    visitorPhone: data.visitorPhone,
    reason: data.reason,
    expireTime: data.expireTime,
    createdBy: '物业管理员',
    createTime: now,
  });
}

/** 移出黑名单 */
export async function removeFromBlacklist(id: number): Promise<void> {
  await delay(300);
  const idx = mockBlacklist.findIndex(b => b.id === id);
  if (idx !== -1) mockBlacklist.splice(idx, 1);
}
