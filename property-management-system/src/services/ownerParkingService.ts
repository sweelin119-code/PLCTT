// ===== 业主端 - 停车缴费 服务层 =====
// 提供业主端车位管理、停车费账单、车辆出入记录、车位租赁、车位共享等功能

// ===== 类型定义 =====

/** 车位绑定类型 */
export type ParkingBindType = 'owned' | 'rented';

/** 车位状态 */
export type ParkingInfoStatus = 'idle' | 'occupied' | 'expired';

/** 停车费账单类型 */
export type ParkingBillType = 'management' | 'rent';

/** 停车费账单状态 */
export type ParkingBillStatus = 'pending' | 'paid' | 'overdue';

/** 车辆出入类型 */
export type VehicleRecordType = 'owner' | 'visitor' | 'temp';

/** 共享状态 */
export type ShareStatus = 'active' | 'paused' | 'expired';

/** 业主绑定车位信息 */
export interface ParkingInfo {
  id: string;
  houseId: string;
  parkingNo: string;        // 车位号
  location: string;         // 位置描述
  type: ParkingBindType;    // 自有/租赁
  status: ParkingInfoStatus;
  rentExpireDate?: string;  // 租赁到期日
  monthlyFee: number;       // 月管理费
  plateNo?: string;         // 绑定车牌号
}

/** 停车费账单 */
export interface ParkingBill {
  id: string;
  parkingId: string;
  billType: ParkingBillType;  // 管理费/租赁费
  billTypeName: string;
  period: string;
  amount: number;
  status: ParkingBillStatus;
  dueDate: string;
  paidAt?: string;
  payMethod?: string;
}

/** 车辆出入记录 */
export interface VehicleRecord {
  id: string;
  plateNo: string;
  entryTime: string;
  exitTime?: string;
  entrance: string;         // 入口名称
  type: VehicleRecordType;
  fee?: number;             // 临时停车费
  duration?: string;        // 停留时长
}

/** 可租车位 */
export interface RentableParking {
  id: string;
  parkingNo: string;
  location: string;
  floor: number;
  sizeArea: number;
  monthlyRent: number;
  status: 'available' | 'rented';
}

/** 共享设置 */
export interface ShareSetting {
  id: string;
  parkingId: string;
  parkingNo: string;
  timeSlots: ShareTimeSlot[];
  dailyPrice: number;       // 日间价格（元/小时）
  nightPrice: number;       // 夜间价格（元/小时）
  status: ShareStatus;
  totalIncome: number;      // 累计收益
  monthIncome: number;      // 本月收益
}

/** 共享时段 */
export interface ShareTimeSlot {
  start: string;  // "08:00"
  end: string;    // "18:00"
  type: 'day' | 'night';
}

/** 共享收益记录 */
export interface ShareIncomeRecord {
  id: string;
  parkingNo: string;
  date: string;
  amount: number;
  duration: number;  // 小时数
  plateNo: string;
  status: 'settled' | 'pending';
}

/** 租赁订单 */
export interface RentOrder {
  id: string;
  parkingId: string;
  parkingNo: string;
  location: string;
  monthlyRent: number;
  months: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createTime: string;
  payTime?: string;
  startDate?: string;
  endDate?: string;
}

// ===== Mock 数据 =====

const mockParkingInfos: ParkingInfo[] = [
  {
    id: 'PI001',
    houseId: 'H1001',
    parkingNo: 'B1-001',
    location: '地下车库B1层-001号',
    type: 'owned',
    status: 'occupied',
    monthlyFee: 80,
    plateNo: '浙A·88888',
  },
  {
    id: 'PI002',
    houseId: 'H1001',
    parkingNo: 'B1-002',
    location: '地下车库B1层-002号',
    type: 'rented',
    status: 'occupied',
    rentExpireDate: '2026-08-15',
    monthlyFee: 80,
    plateNo: '浙A·66666',
  },
];

const mockParkingBills: ParkingBill[] = [
  {
    id: 'PB202605001',
    parkingId: 'PI001',
    billType: 'management',
    billTypeName: '车位管理费',
    period: '2026-05',
    amount: 80,
    status: 'pending',
    dueDate: '2026-05-31',
  },
  {
    id: 'PB202605002',
    parkingId: 'PI002',
    billType: 'rent',
    billTypeName: '车位租赁费',
    period: '2026-05',
    amount: 300,
    status: 'pending',
    dueDate: '2026-05-31',
  },
  {
    id: 'PB202604001',
    parkingId: 'PI001',
    billType: 'management',
    billTypeName: '车位管理费',
    period: '2026-04',
    amount: 80,
    status: 'paid',
    dueDate: '2026-04-30',
    paidAt: '2026-04-15 10:30:00',
    payMethod: 'wechat',
  },
  {
    id: 'PB202604002',
    parkingId: 'PI002',
    billType: 'rent',
    billTypeName: '车位租赁费',
    period: '2026-04',
    amount: 300,
    status: 'paid',
    dueDate: '2026-04-30',
    paidAt: '2026-04-10 14:20:00',
    payMethod: 'alipay',
  },
  {
    id: 'PB202603001',
    parkingId: 'PI001',
    billType: 'management',
    billTypeName: '车位管理费',
    period: '2026-03',
    amount: 80,
    status: 'overdue',
    dueDate: '2026-03-31',
  },
];

const mockVehicleRecords: VehicleRecord[] = [
  {
    id: 'VR001',
    plateNo: '浙A·88888',
    entryTime: '2026-05-04 18:30:00',
    exitTime: '2026-05-04 20:15:00',
    entrance: '北门入口',
    type: 'owner',
    duration: '1小时45分钟',
  },
  {
    id: 'VR002',
    plateNo: '浙A·66666',
    entryTime: '2026-05-04 07:20:00',
    exitTime: '2026-05-04 18:00:00',
    entrance: '南门入口',
    type: 'owner',
    duration: '10小时40分钟',
  },
  {
    id: 'VR003',
    plateNo: '浙A·88888',
    entryTime: '2026-05-03 19:00:00',
    exitTime: '2026-05-04 07:00:00',
    entrance: '北门入口',
    type: 'owner',
    duration: '12小时',
  },
  {
    id: 'VR004',
    plateNo: '浙B·12345',
    entryTime: '2026-05-03 14:00:00',
    exitTime: '2026-05-03 16:30:00',
    entrance: '北门入口',
    type: 'visitor',
    fee: 10,
    duration: '2小时30分钟',
  },
  {
    id: 'VR005',
    plateNo: '浙C·56789',
    entryTime: '2026-05-02 09:00:00',
    exitTime: '2026-05-02 09:45:00',
    entrance: '南门入口',
    type: 'temp',
    fee: 5,
    duration: '45分钟',
  },
];

const mockRentableParkings: RentableParking[] = [
  {
    id: 'RP001',
    parkingNo: 'B1-005',
    location: '地下车库B1层-005号',
    floor: -1,
    sizeArea: 12.5,
    monthlyRent: 300,
    status: 'available',
  },
  {
    id: 'RP002',
    parkingNo: 'B1-007',
    location: '地下车库B1层-007号',
    floor: -1,
    sizeArea: 10.0,
    monthlyRent: 250,
    status: 'available',
  },
  {
    id: 'RP003',
    parkingNo: 'B1-008',
    location: '地下车库B1层-008号（机械车位）',
    floor: -1,
    sizeArea: 8.0,
    monthlyRent: 200,
    status: 'available',
  },
  {
    id: 'RP004',
    parkingNo: 'B1-009',
    location: '地下车库B1层-009号（机械车位）',
    floor: -1,
    sizeArea: 8.0,
    monthlyRent: 200,
    status: 'rented',
  },
];

const mockShareSettings: ShareSetting[] = [
  {
    id: 'SS001',
    parkingId: 'PI001',
    parkingNo: 'B1-001',
    timeSlots: [
      { start: '08:00', end: '18:00', type: 'day' },
    ],
    dailyPrice: 5,
    nightPrice: 3,
    status: 'active',
    totalIncome: 680,
    monthIncome: 185,
  },
];

const mockShareIncomes: ShareIncomeRecord[] = [
  { id: 'SI001', parkingNo: 'B1-001', date: '2026-05-04', amount: 25, duration: 5, plateNo: '浙D·33333', status: 'settled' },
  { id: 'SI002', parkingNo: 'B1-001', date: '2026-05-03', amount: 35, duration: 7, plateNo: '浙E·44444', status: 'settled' },
  { id: 'SI003', parkingNo: 'B1-001', date: '2026-05-02', amount: 40, duration: 8, plateNo: '浙F·55555', status: 'settled' },
  { id: 'SI004', parkingNo: 'B1-001', date: '2026-05-01', amount: 20, duration: 4, plateNo: '浙G·66666', status: 'settled' },
  { id: 'SI005', parkingNo: 'B1-001', date: '2026-04-30', amount: 30, duration: 6, plateNo: '浙H·77777', status: 'settled' },
];

const mockRentOrders: RentOrder[] = [
  {
    id: 'RO001',
    parkingId: 'PI002',
    parkingNo: 'B1-002',
    location: '地下车库B1层-002号',
    monthlyRent: 300,
    months: 6,
    totalAmount: 1800,
    status: 'paid',
    createTime: '2026-02-15 10:00:00',
    payTime: '2026-02-15 10:05:00',
    startDate: '2026-02-15',
    endDate: '2026-08-15',
  },
];

// ===== 模拟延迟 =====
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ===== API 函数 =====

/** 获取业主绑定的车位列表 */
export async function getParkingInfos(houseId: string): Promise<ParkingInfo[]> {
  await delay();
  return mockParkingInfos.filter(p => p.houseId === houseId);
}

/** 获取停车费账单 */
export async function getParkingBills(parkingId: string): Promise<ParkingBill[]> {
  await delay();
  return mockParkingBills.filter(b => b.parkingId === parkingId);
}

/** 获取所有停车费账单（按车位） */
export async function getAllParkingBills(houseId: string): Promise<ParkingBill[]> {
  await delay();
  const parkings = mockParkingInfos.filter(p => p.houseId === houseId);
  const billIds = parkings.map(p => p.id);
  return mockParkingBills.filter(b => billIds.includes(b.parkingId));
}

/** 获取停车费概览 */
export async function getParkingBillOverview(houseId: string): Promise<{
  totalPending: number;
  totalOverdue: number;
  overdueCount: number;
  monthAmount: number;
}> {
  await delay();
  const bills = await getAllParkingBills(houseId);
  const pending = bills.filter(b => b.status === 'pending');
  const overdue = bills.filter(b => b.status === 'overdue');
  const monthBills = bills.filter(b => b.period === '2026-05');
  return {
    totalPending: pending.reduce((s, b) => s + b.amount, 0),
    totalOverdue: overdue.reduce((s, b) => s + b.amount, 0),
    overdueCount: overdue.length,
    monthAmount: monthBills.reduce((s, b) => s + b.amount, 0),
  };
}

/** 获取车辆出入记录 */
export async function getVehicleRecords(houseId: string, date?: string): Promise<VehicleRecord[]> {
  await delay();
  let records = [...mockVehicleRecords];
  if (date) {
    records = records.filter(r => r.entryTime.startsWith(date));
  }
  return records;
}

/** 获取可租车位列表 */
export async function getRentableParkings(projectId: number): Promise<RentableParking[]> {
  await delay();
  return mockRentableParkings;
}

/** 创建租赁订单 */
export async function createRentOrder(params: {
  parkingId: string;
  months: number;
  monthlyRent: number;
}): Promise<RentOrder> {
  await delay(500);
  const parking = mockRentableParkings.find(p => p.id === params.parkingId);
  if (!parking) throw new Error('车位不存在');
  
  const order: RentOrder = {
    id: `RO${Date.now()}`,
    parkingId: params.parkingId,
    parkingNo: parking.parkingNo,
    location: parking.location,
    monthlyRent: params.monthlyRent,
    months: params.months,
    totalAmount: params.monthlyRent * params.months,
    status: 'pending',
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  mockRentOrders.push(order);
  return order;
}

/** 支付租赁订单 */
export async function payRentOrder(orderId: string): Promise<RentOrder> {
  await delay(500);
  const order = mockRentOrders.find(o => o.id === orderId);
  if (!order) throw new Error('订单不存在');
  
  order.status = 'paid';
  order.payTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // 计算租赁起止日期
  const now = new Date();
  order.startDate = now.toISOString().substring(0, 10);
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + order.months);
  order.endDate = endDate.toISOString().substring(0, 10);
  
  // 添加到绑定车位
  const parking = mockParkingInfos.find(p => p.id === order.parkingId);
  if (parking) {
    parking.status = 'occupied';
    parking.rentExpireDate = order.endDate;
  }
  
  return order;
}

/** 获取租赁订单列表 */
export async function getRentOrders(houseId: string): Promise<RentOrder[]> {
  await delay();
  return mockRentOrders;
}

/** 获取共享设置 */
export async function getShareSettings(parkingId: string): Promise<ShareSetting | null> {
  await delay();
  return mockShareSettings.find(s => s.parkingId === parkingId) || null;
}

/** 更新共享设置 */
export async function updateShareSetting(setting: Partial<ShareSetting> & { parkingId: string }): Promise<ShareSetting> {
  await delay(300);
  let existing = mockShareSettings.find(s => s.parkingId === setting.parkingId);
  if (existing) {
    Object.assign(existing, setting);
    return existing;
  }
  // 新建
  const newSetting: ShareSetting = {
    id: `SS${Date.now()}`,
    parkingId: setting.parkingId,
    parkingNo: '',
    timeSlots: setting.timeSlots || [{ start: '08:00', end: '18:00', type: 'day' }],
    dailyPrice: setting.dailyPrice || 5,
    nightPrice: setting.nightPrice || 3,
    status: 'active',
    totalIncome: 0,
    monthIncome: 0,
  };
  mockShareSettings.push(newSetting);
  return newSetting;
}

/** 切换共享状态 */
export async function toggleShareStatus(parkingId: string): Promise<ShareSetting> {
  await delay(200);
  const setting = mockShareSettings.find(s => s.parkingId === parkingId);
  if (!setting) throw new Error('共享设置不存在');
  setting.status = setting.status === 'active' ? 'paused' : 'active';
  return setting;
}

/** 获取共享收益记录 */
export async function getShareIncomes(parkingId: string): Promise<ShareIncomeRecord[]> {
  await delay();
  const setting = mockShareSettings.find(s => s.parkingId === parkingId);
  if (!setting) return [];
  return mockShareIncomes.filter(i => i.parkingNo === setting.parkingNo);
}

/** 获取共享收益概览 */
export async function getShareIncomeOverview(parkingId: string): Promise<{
  totalIncome: number;
  monthIncome: number;
  todayIncome: number;
  shareCount: number;
}> {
  await delay();
  const setting = mockShareSettings.find(s => s.parkingId === parkingId);
  if (!setting) {
    return { totalIncome: 0, monthIncome: 0, todayIncome: 0, shareCount: 0 };
  }
  const incomes = mockShareIncomes.filter(i => i.parkingNo === setting.parkingNo);
  const today = new Date().toISOString().substring(0, 10);
  return {
    totalIncome: setting.totalIncome,
    monthIncome: setting.monthIncome,
    todayIncome: incomes.filter(i => i.date === today).reduce((s, i) => s + i.amount, 0),
    shareCount: incomes.length,
  };
}
