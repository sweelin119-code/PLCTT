// ===== 物业端 - 停车收费管理 服务层 =====
// 提供收费标准管理、收费记录、车辆出入记录、收费统计等功能
// 支持三种停车收费类型：产权车位（管理费）、月租车位（月租费）、临时停车（按时计费）

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
  name: string;                 // 规则名称，如"临时停车收费标准"
  vehicleType: 'car' | 'motorcycle' | 'large';  // 车辆类型
  rateType: FeeRateType;        // 计费方式
  unitPrice: number;            // 单价（元）
  freeMinutes: number;          // 免费时长（分钟）
  dailyCap: number;             // 每日封顶（元）
  monthlyPrice?: number;        // 月租价格
  yearlyPrice?: number;         // 年租价格
  description?: string;         // 规则说明
  status: FeeRuleStatus;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}

/** 车辆出入记录（物业端） */
export interface ParkingEntryRecord {
  id: number;
  projectId: number;
  plateNo: string;              // 车牌号
  vehicleType: 'car' | 'motorcycle' | 'large';
  entryTime: string;            // 入场时间
  exitTime?: string;            // 出场时间
  entrance: string;             // 入口名称
  exitEntrance?: string;        // 出口名称
  duration?: string;            // 停留时长
  fee: number;                  // 应收费用
  actualFee: number;            // 实收费用
  status: 'parked' | 'exited' | 'free';  // 在场/已出场/免费
  payMethod?: 'wechat' | 'alipay' | 'cash' | 'monthly' | 'free';
  payTime?: string;
  operator?: string;            // 收费操作人
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

// ===== 新增：产权车位收费管理 =====

/** 产权车位收费记录 */
export interface PropertyParkingFeeRecord {
  id: number;
  projectId: number;
  parkingSpaceId: number;       // 关联车位ID
  parkingCode: string;          // 车位编号
  ownerName: string;            // 业主姓名
  houseFullName: string;        // 房屋全称
  plateNo?: string;             // 绑定车牌号
  managementFee: number;        // 月管理费（元）
  period: string;               // 账期，如"2026-05"
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  payMethod?: string;
  createTime: string;
  updateTime: string;
}

/** 产权车位收费查询参数 */
export interface PropertyParkingFeeQueryParams {
  projectId: number;
  keyword?: string;             // 业主姓名/车位编号搜索
  status?: string;
  period?: string;
  page?: number;
  pageSize?: number;
}

// ===== 新增：月租车位收费管理 =====

/** 月租车位订阅信息 */
export interface RentalParkingSubscription {
  id: number;
  projectId: number;
  parkingSpaceId?: number;      // 关联固定车位ID（可能为空，月租车可能不绑定固定车位）
  parkingCode?: string;         // 车位编号
  plateNo: string;              // 车牌号
  ownerName: string;            // 业主/租户姓名
  phone: string;                // 联系电话
  monthlyRent: number;          // 月租金（元）
  startDate: string;            // 订阅开始日期
  endDate: string;              // 订阅到期日期
  status: 'active' | 'expired' | 'cancelled';
  remark?: string;
  createTime: string;
  updateTime: string;
}

/** 月租车位收费记录 */
export interface RentalParkingFeeRecord {
  id: number;
  projectId: number;
  subscriptionId: number;       // 关联订阅ID
  plateNo: string;
  ownerName: string;
  monthlyRent: number;
  period: string;               // 账期，如"2026-05"
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

// ===== 原有：收费统计和趋势 =====

/** 收费统计 */
export interface ParkingFeeStats {
  todayIncome: number;          // 今日收入
  monthIncome: number;          // 本月收入
  yearIncome: number;           // 本年收入
  totalIncome: number;          // 累计收入
  todayCount: number;           // 今日收费笔数
  monthCount: number;           // 本月收费笔数
  currentParked: number;        // 当前在场车辆
  monthlySubscribers: number;   // 月租车数量
  // 新增统计
  propertyParkingCount: number; // 产权车位数量
  rentalSubscriberCount: number;// 月租订阅数量
  propertyFeePending: number;   // 产权车位待收管理费
  rentalFeePending: number;     // 月租车位待收租金
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
  keyword?: string;             // 车牌号搜索
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

// ===== Mock 数据 =====

const mockFeeRules: ParkingFeeRule[] = [
  {
    id: 1,
    projectId: 1,
    name: '临时停车收费标准（小型车）',
    vehicleType: 'car',
    rateType: 'hourly',
    unitPrice: 5,
    freeMinutes: 30,
    dailyCap: 30,
    monthlyPrice: 300,
    yearlyPrice: 3000,
    description: '30分钟内免费，超过后按5元/小时计费，每日封顶30元',
    status: 'active',
    sortOrder: 1,
    createTime: '2026-01-01 00:00:00',
    updateTime: '2026-01-01 00:00:00',
  },
  {
    id: 2,
    projectId: 1,
    name: '临时停车收费标准（摩托车）',
    vehicleType: 'motorcycle',
    rateType: 'hourly',
    unitPrice: 2,
    freeMinutes: 30,
    dailyCap: 10,
    monthlyPrice: 80,
    yearlyPrice: 800,
    description: '30分钟内免费，超过后按2元/小时计费，每日封顶10元',
    status: 'active',
    sortOrder: 2,
    createTime: '2026-01-01 00:00:00',
    updateTime: '2026-01-01 00:00:00',
  },
  {
    id: 3,
    projectId: 1,
    name: '大型车辆收费标准',
    vehicleType: 'large',
    rateType: 'hourly',
    unitPrice: 10,
    freeMinutes: 15,
    dailyCap: 60,
    monthlyPrice: 600,
    yearlyPrice: 6000,
    description: '15分钟内免费，超过后按10元/小时计费，每日封顶60元',
    status: 'active',
    sortOrder: 3,
    createTime: '2026-01-01 00:00:00',
    updateTime: '2026-01-01 00:00:00',
  },
  {
    id: 4,
    projectId: 1,
    name: '业主月租车收费标准',
    vehicleType: 'car',
    rateType: 'monthly',
    unitPrice: 0,
    freeMinutes: 0,
    dailyCap: 0,
    monthlyPrice: 200,
    yearlyPrice: 2000,
    description: '业主月租车辆，按月收费200元，不限进出次数',
    status: 'active',
    sortOrder: 4,
    createTime: '2026-01-01 00:00:00',
    updateTime: '2026-01-01 00:00:00',
  },
];

const mockEntryRecords: ParkingEntryRecord[] = [
  { id: 1, projectId: 1, plateNo: '浙A·88888', vehicleType: 'car', entryTime: '2026-05-05 08:30:00', entrance: '北门入口', fee: 0, actualFee: 0, status: 'parked', createTime: '2026-05-05 08:30:00' },
  { id: 2, projectId: 1, plateNo: '浙A·66666', vehicleType: 'car', entryTime: '2026-05-05 07:20:00', entrance: '南门入口', fee: 0, actualFee: 0, status: 'parked', createTime: '2026-05-05 07:20:00' },
  { id: 3, projectId: 1, plateNo: '浙B·12345', vehicleType: 'car', entryTime: '2026-05-05 09:00:00', exitTime: '2026-05-05 11:30:00', entrance: '北门入口', exitEntrance: '北门出口', duration: '2小时30分钟', fee: 15, actualFee: 15, status: 'exited', payMethod: 'wechat', payTime: '2026-05-05 11:30:00', operator: '张三', createTime: '2026-05-05 09:00:00' },
  { id: 4, projectId: 1, plateNo: '浙C·56789', vehicleType: 'car', entryTime: '2026-05-05 10:00:00', exitTime: '2026-05-05 10:20:00', entrance: '南门入口', exitEntrance: '南门出口', duration: '20分钟', fee: 0, actualFee: 0, status: 'free', payMethod: 'free', operator: '系统', createTime: '2026-05-05 10:00:00' },
  { id: 5, projectId: 1, plateNo: '浙D·33333', vehicleType: 'car', entryTime: '2026-05-04 18:00:00', exitTime: '2026-05-04 20:00:00', entrance: '北门入口', exitEntrance: '北门出口', duration: '2小时', fee: 10, actualFee: 10, status: 'exited', payMethod: 'alipay', payTime: '2026-05-04 20:00:00', operator: '李四', createTime: '2026-05-04 18:00:00' },
  { id: 6, projectId: 1, plateNo: '浙E·44444', vehicleType: 'motorcycle', entryTime: '2026-05-04 09:00:00', exitTime: '2026-05-04 17:30:00', entrance: '南门入口', exitEntrance: '南门出口', duration: '8小时30分钟', fee: 16, actualFee: 16, status: 'exited', payMethod: 'cash', payTime: '2026-05-04 17:30:00', operator: '张三', createTime: '2026-05-04 09:00:00' },
  { id: 7, projectId: 1, plateNo: '浙F·55555', vehicleType: 'large', entryTime: '2026-05-04 14:00:00', exitTime: '2026-05-04 16:00:00', entrance: '北门入口', exitEntrance: '北门出口', duration: '2小时', fee: 20, actualFee: 20, status: 'exited', payMethod: 'wechat', payTime: '2026-05-04 16:00:00', operator: '李四', createTime: '2026-05-04 14:00:00' },
  { id: 8, projectId: 1, plateNo: '浙G·66666', vehicleType: 'car', entryTime: '2026-05-03 10:00:00', exitTime: '2026-05-03 12:00:00', entrance: '北门入口', exitEntrance: '北门出口', duration: '2小时', fee: 10, actualFee: 10, status: 'exited', payMethod: 'wechat', payTime: '2026-05-03 12:00:00', operator: '张三', createTime: '2026-05-03 10:00:00' },
  { id: 9, projectId: 1, plateNo: '浙H·77777', vehicleType: 'car', entryTime: '2026-05-03 08:00:00', exitTime: '2026-05-03 18:00:00', entrance: '南门入口', exitEntrance: '南门出口', duration: '10小时', fee: 30, actualFee: 30, status: 'exited', payMethod: 'monthly', payTime: '2026-05-03 18:00:00', operator: '系统', createTime: '2026-05-03 08:00:00' },
  { id: 10, projectId: 1, plateNo: '浙J·88888', vehicleType: 'car', entryTime: '2026-05-02 15:00:00', exitTime: '2026-05-02 15:25:00', entrance: '北门入口', exitEntrance: '北门出口', duration: '25分钟', fee: 0, actualFee: 0, status: 'free', payMethod: 'free', operator: '系统', createTime: '2026-05-02 15:00:00' },
];

const mockChargeRecords: ParkingChargeRecord[] = [
  { id: 1, projectId: 1, plateNo: '浙B·12345', vehicleType: 'car', entryTime: '2026-05-05 09:00:00', exitTime: '2026-05-05 11:30:00', duration: '2小时30分钟', durationMinutes: 150, fee: 15, actualFee: 15, payMethod: 'wechat', payTime: '2026-05-05 11:30:00', operator: '张三', createTime: '2026-05-05 11:30:00' },
  { id: 2, projectId: 1, plateNo: '浙D·33333', vehicleType: 'car', entryTime: '2026-05-04 18:00:00', exitTime: '2026-05-04 20:00:00', duration: '2小时', durationMinutes: 120, fee: 10, actualFee: 10, payMethod: 'alipay', payTime: '2026-05-04 20:00:00', operator: '李四', createTime: '2026-05-04 20:00:00' },
  { id: 3, projectId: 1, plateNo: '浙E·44444', vehicleType: 'motorcycle', entryTime: '2026-05-04 09:00:00', exitTime: '2026-05-04 17:30:00', duration: '8小时30分钟', durationMinutes: 510, fee: 16, actualFee: 16, payMethod: 'cash', payTime: '2026-05-04 17:30:00', operator: '张三', createTime: '2026-05-04 17:30:00' },
  { id: 4, projectId: 1, plateNo: '浙F·55555', vehicleType: 'large', entryTime: '2026-05-04 14:00:00', exitTime: '2026-05-04 16:00:00', duration: '2小时', durationMinutes: 120, fee: 20, actualFee: 20, payMethod: 'wechat', payTime: '2026-05-04 16:00:00', operator: '李四', createTime: '2026-05-04 16:00:00' },
  { id: 5, projectId: 1, plateNo: '浙G·66666', vehicleType: 'car', entryTime: '2026-05-03 10:00:00', exitTime: '2026-05-03 12:00:00', duration: '2小时', durationMinutes: 120, fee: 10, actualFee: 10, payMethod: 'wechat', payTime: '2026-05-03 12:00:00', operator: '张三', createTime: '2026-05-03 12:00:00' },
  { id: 6, projectId: 1, plateNo: '浙H·77777', vehicleType: 'car', entryTime: '2026-05-03 08:00:00', exitTime: '2026-05-03 18:00:00', duration: '10小时', durationMinutes: 600, fee: 30, actualFee: 30, payMethod: 'monthly', payTime: '2026-05-03 18:00:00', operator: '系统', createTime: '2026-05-03 18:00:00' },
];

// ===== 新增 Mock 数据：产权车位收费 =====

const mockPropertyParkingFees: PropertyParkingFeeRecord[] = [
  { id: 1, projectId: 1, parkingSpaceId: 1, parkingCode: 'B1-001', ownerName: '张三', houseFullName: '1栋1单元101室', plateNo: '浙A·88888', managementFee: 80, period: '2026-05', status: 'pending', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-01 00:00:00' },
  { id: 2, projectId: 1, parkingSpaceId: 2, parkingCode: 'B1-002', ownerName: '张三', houseFullName: '1栋1单元101室', plateNo: '浙A·66666', managementFee: 80, period: '2026-05', status: 'pending', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-01 00:00:00' },
  { id: 3, projectId: 1, parkingSpaceId: 3, parkingCode: 'B1-003', ownerName: '李四', houseFullName: '1栋1单元201室', plateNo: '浙B·11111', managementFee: 80, period: '2026-05', status: 'paid', paidAt: '2026-05-03 09:30:00', payMethod: 'wechat', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-03 09:30:00' },
  { id: 4, projectId: 1, parkingSpaceId: 4, parkingCode: 'B1-004', ownerName: '王五', houseFullName: '1栋1单元301室', plateNo: '浙C·22222', managementFee: 80, period: '2026-05', status: 'overdue', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-01 00:00:00' },
  { id: 5, projectId: 1, parkingSpaceId: 5, parkingCode: 'B1-005', ownerName: '赵六', houseFullName: '1栋1单元401室', managementFee: 100, period: '2026-05', status: 'pending', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-01 00:00:00' },
  { id: 6, projectId: 1, parkingSpaceId: 1, parkingCode: 'B1-001', ownerName: '张三', houseFullName: '1栋1单元101室', plateNo: '浙A·88888', managementFee: 80, period: '2026-04', status: 'paid', paidAt: '2026-04-10 08:00:00', payMethod: 'alipay', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-10 08:00:00' },
  { id: 7, projectId: 1, parkingSpaceId: 2, parkingCode: 'B1-002', ownerName: '张三', houseFullName: '1栋1单元101室', plateNo: '浙A·66666', managementFee: 80, period: '2026-04', status: 'paid', paidAt: '2026-04-10 08:00:00', payMethod: 'wechat', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-10 08:00:00' },
  { id: 8, projectId: 1, parkingSpaceId: 3, parkingCode: 'B1-003', ownerName: '李四', houseFullName: '1栋1单元201室', plateNo: '浙B·11111', managementFee: 80, period: '2026-04', status: 'paid', paidAt: '2026-04-05 10:00:00', payMethod: 'wechat', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-05 10:00:00' },
  { id: 9, projectId: 1, parkingSpaceId: 4, parkingCode: 'B1-004', ownerName: '王五', houseFullName: '1栋1单元301室', plateNo: '浙C·22222', managementFee: 80, period: '2026-04', status: 'overdue', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-01 00:00:00' },
];

// ===== 新增 Mock 数据：月租车位收费 =====

const mockRentalSubscriptions: RentalParkingSubscription[] = [
  { id: 1, projectId: 1, parkingSpaceId: 6, parkingCode: 'B1-006', plateNo: '浙D·33333', ownerName: '孙七', phone: '13800138001', monthlyRent: 300, startDate: '2026-01-01', endDate: '2026-06-30', status: 'active', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 2, projectId: 1, parkingSpaceId: 7, parkingCode: 'B1-007', plateNo: '浙E·44444', ownerName: '周八', phone: '13800138002', monthlyRent: 250, startDate: '2026-03-01', endDate: '2026-08-31', status: 'active', createTime: '2026-03-01 00:00:00', updateTime: '2026-03-01 00:00:00' },
  { id: 3, projectId: 1, parkingSpaceId: undefined, parkingCode: undefined, plateNo: '浙F·55555', ownerName: '吴九', phone: '13800138003', monthlyRent: 200, startDate: '2026-04-01', endDate: '2026-09-30', status: 'active', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-01 00:00:00' },
  { id: 4, projectId: 1, parkingSpaceId: 8, parkingCode: 'B1-008', plateNo: '浙G·66666', ownerName: '郑十', phone: '13800138004', monthlyRent: 200, startDate: '2026-02-01', endDate: '2026-05-31', status: 'active', createTime: '2026-02-01 00:00:00', updateTime: '2026-02-01 00:00:00' },
  { id: 5, projectId: 1, parkingSpaceId: undefined, parkingCode: undefined, plateNo: '浙H·77777', ownerName: '钱十一', phone: '13800138005', monthlyRent: 350, startDate: '2025-12-01', endDate: '2026-04-30', status: 'expired', createTime: '2025-12-01 00:00:00', updateTime: '2026-04-30 23:59:59' },
];

const mockRentalParkingFees: RentalParkingFeeRecord[] = [
  { id: 1, projectId: 1, subscriptionId: 1, plateNo: '浙D·33333', ownerName: '孙七', monthlyRent: 300, period: '2026-05', status: 'pending', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-01 00:00:00' },
  { id: 2, projectId: 1, subscriptionId: 2, plateNo: '浙E·44444', ownerName: '周八', monthlyRent: 250, period: '2026-05', status: 'pending', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-01 00:00:00' },
  { id: 3, projectId: 1, subscriptionId: 3, plateNo: '浙F·55555', ownerName: '吴九', monthlyRent: 200, period: '2026-05', status: 'paid', paidAt: '2026-05-02 14:00:00', payMethod: 'wechat', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-02 14:00:00' },
  { id: 4, projectId: 1, subscriptionId: 4, plateNo: '浙G·66666', ownerName: '郑十', monthlyRent: 200, period: '2026-05', status: 'pending', createTime: '2026-05-01 00:00:00', updateTime: '2026-05-01 00:00:00' },
  { id: 5, projectId: 1, subscriptionId: 1, plateNo: '浙D·33333', ownerName: '孙七', monthlyRent: 300, period: '2026-04', status: 'paid', paidAt: '2026-04-05 10:00:00', payMethod: 'alipay', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-05 10:00:00' },
  { id: 6, projectId: 1, subscriptionId: 2, plateNo: '浙E·44444', ownerName: '周八', monthlyRent: 250, period: '2026-04', status: 'paid', paidAt: '2026-04-03 09:00:00', payMethod: 'wechat', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-03 09:00:00' },
  { id: 7, projectId: 1, subscriptionId: 3, plateNo: '浙F·55555', ownerName: '吴九', monthlyRent: 200, period: '2026-04', status: 'paid', paidAt: '2026-04-01 08:30:00', payMethod: 'wechat', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-01 08:30:00' },
  { id: 8, projectId: 1, subscriptionId: 4, plateNo: '浙G·66666', ownerName: '郑十', monthlyRent: 200, period: '2026-04', status: 'paid', paidAt: '2026-04-02 11:00:00', payMethod: 'cash', createTime: '2026-04-01 00:00:00', updateTime: '2026-04-02 11:00:00' },
];

// ===== 模拟延迟 =====
const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// ===== API 函数：收费标准管理（原有） =====

/** 获取收费标准列表 */
export async function getParkingFeeRules(projectId: number): Promise<ParkingFeeRule[]> {
  await delay();
  return mockFeeRules.filter(r => r.projectId === projectId);
}

/** 获取收费标准详情 */
export async function getParkingFeeRuleById(id: number): Promise<ParkingFeeRule | null> {
  await delay();
  return mockFeeRules.find(r => r.id === id) || null;
}

/** 创建收费标准 */
export async function createParkingFeeRule(data: Omit<ParkingFeeRule, 'id' | 'createTime' | 'updateTime'>): Promise<ParkingFeeRule> {
  await delay(300);
  const newRule: ParkingFeeRule = {
    ...data,
    id: mockFeeRules.length + 1,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  mockFeeRules.push(newRule);
  return newRule;
}

/** 更新收费标准 */
export async function updateParkingFeeRule(id: number, data: Partial<ParkingFeeRule>): Promise<ParkingFeeRule | null> {
  await delay(300);
  const rule = mockFeeRules.find(r => r.id === id);
  if (!rule) return null;
  Object.assign(rule, data, { updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19) });
  return rule;
}

/** 删除收费标准 */
export async function deleteParkingFeeRule(id: number): Promise<boolean> {
  await delay(200);
  const idx = mockFeeRules.findIndex(r => r.id === id);
  if (idx < 0) return false;
  mockFeeRules.splice(idx, 1);
  return true;
}

// ===== API 函数：车辆出入管理（原有） =====

/** 获取车辆出入记录 */
export async function getParkingEntryRecords(params: ParkingEntryQueryParams): Promise<{ list: ParkingEntryRecord[]; total: number }> {
  await delay();
  let filtered = mockEntryRecords.filter(r => r.projectId === params.projectId);
  if (params.keyword) {
    const kw = params.keyword;
    filtered = filtered.filter(r => r.plateNo.includes(kw));
  }
  if (params.status) {
    filtered = filtered.filter(r => r.status === params.status);
  }
  if (params.startDate) {
    const sd = params.startDate;
    filtered = filtered.filter(r => r.entryTime >= sd);
  }
  if (params.endDate) {
    const ed = params.endDate;
    filtered = filtered.filter(r => r.entryTime <= ed + ' 23:59:59');
  }
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
}

/** 车辆出场收费 */
export async function processParkingExit(recordId: number, payMethod: ParkingEntryRecord['payMethod'], actualFee: number, operator: string): Promise<ParkingEntryRecord> {
  await delay(300);
  const record = mockEntryRecords.find(r => r.id === recordId);
  if (!record) throw new Error('记录不存在');
  
  const now = new Date();
  const exitTime = now.toISOString().replace('T', ' ').substring(0, 19);
  record.exitTime = exitTime;
  record.exitEntrance = '北门出口';
  record.payMethod = payMethod;
  record.actualFee = actualFee;
  record.operator = operator;
  record.payTime = exitTime;
  
  // 计算停留时长
  const entryDate = new Date(record.entryTime);
  const diffMs = now.getTime() - entryDate.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
  record.duration = `${diffHours}小时${diffMinutes}分钟`;
  
  if (actualFee > 0) {
    record.status = 'exited';
  } else {
    record.status = 'free';
  }
  
  // 同步添加到收费记录
  const chargeRecord: ParkingChargeRecord = {
    id: mockChargeRecords.length + 1,
    projectId: record.projectId,
    plateNo: record.plateNo,
    vehicleType: record.vehicleType,
    entryTime: record.entryTime,
    exitTime: exitTime,
    duration: record.duration,
    durationMinutes: Math.floor(diffMs / 60000),
    fee: record.fee,
    actualFee: actualFee,
    payMethod: payMethod!,
    payTime: exitTime,
    operator: operator,
    createTime: exitTime,
  };
  mockChargeRecords.push(chargeRecord);
  
  return record;
}

/** 获取收费记录 */
export async function getParkingChargeRecords(params: ParkingChargeQueryParams): Promise<{ list: ParkingChargeRecord[]; total: number }> {
  await delay();
  let filtered = mockChargeRecords.filter(r => r.projectId === params.projectId);
  if (params.keyword) {
    const kw = params.keyword;
    filtered = filtered.filter(r => r.plateNo.includes(kw));
  }
  if (params.startDate) {
    const sd = params.startDate;
    filtered = filtered.filter(r => r.payTime >= sd);
  }
  if (params.endDate) {
    const ed = params.endDate;
    filtered = filtered.filter(r => r.payTime <= ed + ' 23:59:59');
  }
  if (params.payMethod) {
    filtered = filtered.filter(r => r.payMethod === params.payMethod);
  }
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
}

/** 获取收费统计 */
export async function getParkingFeeStats(projectId: number): Promise<ParkingFeeStats> {
  await delay();
  const today = new Date().toISOString().substring(0, 10);
  const thisMonth = today.substring(0, 7);
  const thisYear = today.substring(0, 4);
  
  const todayRecords = mockChargeRecords.filter(r => r.payTime.startsWith(today));
  const monthRecords = mockChargeRecords.filter(r => r.payTime.startsWith(thisMonth));
  const yearRecords = mockChargeRecords.filter(r => r.payTime.startsWith(thisYear));
  const currentParked = mockEntryRecords.filter(r => r.status === 'parked').length;
  
  // 新增统计
  const propertyParkingCount = mockPropertyParkingFees.filter(r => r.projectId === projectId && r.period === thisMonth).length;
  const rentalSubscriberCount = mockRentalSubscriptions.filter(r => r.projectId === projectId && r.status === 'active').length;
  const propertyFeePending = mockPropertyParkingFees.filter(r => r.projectId === projectId && r.period === thisMonth && r.status === 'pending').reduce((s, r) => s + r.managementFee, 0);
  const rentalFeePending = mockRentalParkingFees.filter(r => r.projectId === projectId && r.period === thisMonth && r.status === 'pending').reduce((s, r) => s + r.monthlyRent, 0);
  
  return {
    todayIncome: todayRecords.reduce((s, r) => s + r.actualFee, 0),
    monthIncome: monthRecords.reduce((s, r) => s + r.actualFee, 0),
    yearIncome: yearRecords.reduce((s, r) => s + r.actualFee, 0),
    totalIncome: mockChargeRecords.reduce((s, r) => s + r.actualFee, 0),
    todayCount: todayRecords.length,
    monthCount: monthRecords.length,
    currentParked,
    monthlySubscribers: rentalSubscriberCount,
    propertyParkingCount,
    rentalSubscriberCount,
    propertyFeePending,
    rentalFeePending,
  };
}

/** 获取收费趋势（近7天/近30天） */
export async function getParkingFeeTrend(projectId: number, days: number = 7): Promise<FeeTrendPoint[]> {
  await delay();
  const result: FeeTrendPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    const dayRecords = mockChargeRecords.filter(r => r.payTime.startsWith(dateStr));
    result.push({
      date: dateStr.substring(5), // MM-DD
      amount: dayRecords.reduce((s, r) => s + r.actualFee, 0),
      count: dayRecords.length,
    });
  }
  return result;
}

// ===== 新增 API 函数：产权车位收费管理 =====

/** 获取产权车位收费列表 */
export async function getPropertyParkingFees(params: PropertyParkingFeeQueryParams): Promise<{ list: PropertyParkingFeeRecord[]; total: number }> {
  await delay();
  let filtered = mockPropertyParkingFees.filter(r => r.projectId === params.projectId);
  if (params.keyword) {
    const kw = params.keyword;
    filtered = filtered.filter(r => r.ownerName.includes(kw) || r.parkingCode.includes(kw) || r.houseFullName.includes(kw));
  }
  if (params.status) {
    filtered = filtered.filter(r => r.status === params.status);
  }
  if (params.period) {
    filtered = filtered.filter(r => r.period === params.period);
  }
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
}

/** 生成产权车位管理费账单 */
export async function generatePropertyParkingFees(projectId: number, period: string): Promise<PropertyParkingFeeRecord[]> {
  await delay(500);
  // 模拟从车位资产数据生成管理费账单
  const newRecords: PropertyParkingFeeRecord[] = [];
  const existingPeriods = mockPropertyParkingFees.filter(r => r.projectId === projectId && r.period === period);
  if (existingPeriods.length > 0) {
    return []; // 已存在该账期账单
  }
  // 模拟生成
  const mockParkingSpaces = [
    { id: 1, code: 'B1-001', ownerName: '张三', houseFullName: '1栋1单元101室', plateNo: '浙A·88888', fee: 80 },
    { id: 2, code: 'B1-002', ownerName: '张三', houseFullName: '1栋1单元101室', plateNo: '浙A·66666', fee: 80 },
    { id: 3, code: 'B1-003', ownerName: '李四', houseFullName: '1栋1单元201室', plateNo: '浙B·11111', fee: 80 },
    { id: 4, code: 'B1-004', ownerName: '王五', houseFullName: '1栋1单元301室', plateNo: '浙C·22222', fee: 80 },
    { id: 5, code: 'B1-005', ownerName: '赵六', houseFullName: '1栋1单元401室', fee: 100 },
  ];
  mockParkingSpaces.forEach((space, idx) => {
    const record: PropertyParkingFeeRecord = {
      id: mockPropertyParkingFees.length + idx + 1,
      projectId,
      parkingSpaceId: space.id,
      parkingCode: space.code,
      ownerName: space.ownerName,
      houseFullName: space.houseFullName,
      plateNo: space.plateNo,
      managementFee: space.fee,
      period,
      status: 'pending',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    mockPropertyParkingFees.push(record);
    newRecords.push(record);
  });
  return newRecords;
}

/** 产权车位收费 - 标记为已缴费 */
export async function payPropertyParkingFee(id: number, payMethod: string): Promise<PropertyParkingFeeRecord | null> {
  await delay(300);
  const record = mockPropertyParkingFees.find(r => r.id === id);
  if (!record) return null;
  record.status = 'paid';
  record.paidAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  record.payMethod = payMethod;
  record.updateTime = record.paidAt;
  return record;
}

// ===== 车位-费用项关联管理 =====

// Mock 车位-费用项关联数据
const mockParkingFeeItems: ParkingFeeItem[] = [
  { id: 1, projectId: 1, parkingId: 1, feeItemId: 2, enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', parkingCode: 'A001', parkingType: 'fixed', feeItemName: '车位管理费', feeItemCategory: 'parking_fee' },
  { id: 2, projectId: 1, parkingId: 2, feeItemId: 2, enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', parkingCode: 'A002', parkingType: 'fixed', feeItemName: '车位管理费', feeItemCategory: 'parking_fee' },
  { id: 3, projectId: 1, parkingId: 3, feeItemId: 2, enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', parkingCode: 'A003', parkingType: 'fixed', feeItemName: '车位管理费', feeItemCategory: 'parking_fee' },
  { id: 4, projectId: 1, parkingId: 4, feeItemId: 2, enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', parkingCode: 'B001', parkingType: 'fixed', feeItemName: '车位管理费', feeItemCategory: 'parking_fee' },
  { id: 5, projectId: 1, parkingId: 5, feeItemId: 2, enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', parkingCode: 'B002', parkingType: 'fixed', feeItemName: '车位管理费', feeItemCategory: 'parking_fee' },
];

let nextParkingFeeItemId = 100;

// 获取车位-费用项关联列表
export async function getParkingFeeItems(params: ParkingFeeItemQueryParams): Promise<{ list: ParkingFeeItem[]; total: number }> {
  await delay();
  let filtered = mockParkingFeeItems.filter(p => p.projectId === params.projectId);
  if (params.parkingType) filtered = filtered.filter(p => p.parkingType === params.parkingType);
  if (params.feeItemId) filtered = filtered.filter(p => p.feeItemId === params.feeItemId);
  if (params.keyword) filtered = filtered.filter(p =>
    (p.parkingCode && p.parkingCode.includes(params.keyword!)) ||
    (p.feeItemName && p.feeItemName.includes(params.keyword!))
  );
  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  return { list: filtered.slice(start, start + params.pageSize), total };
}

// 获取车位已关联的费用项ID列表
export async function getParkingFeeItemIds(parkingId: number): Promise<number[]> {
  await delay(50);
  return mockParkingFeeItems.filter(p => p.parkingId === parkingId && p.enabled).map(p => p.feeItemId);
}

// 批量获取车位-费用项关联映射
export async function getParkingFeeItemMap(projectId: number): Promise<Map<number, number[]>> {
  await delay(50);
  const map = new Map<number, number[]>();
  const items = mockParkingFeeItems.filter(p => p.projectId === projectId && p.enabled);
  for (const item of items) {
    if (!map.has(item.parkingId)) map.set(item.parkingId, []);
    map.get(item.parkingId)!.push(item.feeItemId);
  }
  return map;
}

// 创建车位-费用项关联
export async function createParkingFeeItem(data: Omit<ParkingFeeItem, 'id' | 'createTime' | 'updateTime'>): Promise<ParkingFeeItem> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const item: ParkingFeeItem = {
    ...data, id: nextParkingFeeItemId++, createTime: now, updateTime: now,
  };
  mockParkingFeeItems.push(item);
  return item;
}

// 批量创建车位-费用项关联
export async function batchCreateParkingFeeItems(dataList: Omit<ParkingFeeItem, 'id' | 'createTime' | 'updateTime'>[]): Promise<ParkingFeeItem[]> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const items: ParkingFeeItem[] = [];
  for (const data of dataList) {
    const item: ParkingFeeItem = {
      ...data, id: nextParkingFeeItemId++, createTime: now, updateTime: now,
    };
    mockParkingFeeItems.push(item);
    items.push(item);
  }
  return items;
}

// 更新车位-费用项关联
export async function updateParkingFeeItem(id: number, data: Partial<ParkingFeeItem>): Promise<ParkingFeeItem | null> {
  await delay();
  const idx = mockParkingFeeItems.findIndex(p => p.id === id);
  if (idx === -1) return null;
  mockParkingFeeItems[idx] = { ...mockParkingFeeItems[idx], ...data, updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19) };
  return mockParkingFeeItems[idx];
}

// 删除车位-费用项关联
export async function deleteParkingFeeItem(id: number): Promise<boolean> {
  await delay();
  const idx = mockParkingFeeItems.findIndex(p => p.id === id);
  if (idx === -1) return false;
  mockParkingFeeItems.splice(idx, 1);
  return true;
}

// 导入车位-费用项关联
export async function importParkingFeeItems(projectId: number, rows: { parkingId: number; feeItemId: number; customPrice?: number }[]): Promise<ParkingFeeItemImportResult> {
  await delay();
  const result: ParkingFeeItemImportResult = { success: 0, failed: 0, errors: [] };
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // 获取 mock 车位数据（简化版）
  const mockParkingSpaces = [
    { id: 1, code: 'A001', type: 'fixed' },
    { id: 2, code: 'A002', type: 'fixed' },
    { id: 3, code: 'A003', type: 'fixed' },
    { id: 4, code: 'B001', type: 'fixed' },
    { id: 5, code: 'B002', type: 'fixed' },
    { id: 6, code: 'C001', type: 'temporary' },
    { id: 7, code: 'C002', type: 'temporary' },
  ];
  
  // 获取费用项列表
  const { getFeeItems } = await import('./feeService');
  const feeItems = await getFeeItems(projectId);
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    // 验证车位是否存在
    const parking = mockParkingSpaces.find(p => p.id === row.parkingId);
    if (!parking) {
      result.failed++;
      result.errors.push({ row: rowNum, message: `车位ID ${row.parkingId} 不存在` });
      continue;
    }
    
    // 验证费用项是否存在
    const feeItem = feeItems.find(f => f.id === row.feeItemId);
    if (!feeItem) {
      result.failed++;
      result.errors.push({ row: rowNum, message: `费用项ID ${row.feeItemId} 不存在` });
      continue;
    }
    
    // 检查是否已存在相同关联
    const exists = mockParkingFeeItems.some(p => p.parkingId === row.parkingId && p.feeItemId === row.feeItemId);
    if (exists) {
      result.failed++;
      result.errors.push({ row: rowNum, message: `车位"${parking.code}"已关联费用项"${feeItem.name}"` });
      continue;
    }
    
    // 创建关联
    const item: ParkingFeeItem = {
      id: nextParkingFeeItemId++,
      projectId,
      parkingId: row.parkingId,
      feeItemId: row.feeItemId,
      customPrice: row.customPrice,
      enabled: true,
      createTime: now,
      updateTime: now,
      parkingCode: parking.code,
      parkingType: parking.type,
      feeItemName: feeItem.name,
      feeItemCategory: feeItem.category,
    };
    mockParkingFeeItems.push(item);
    result.success++;
  }
  
  return result;
}

// ===== 新增 API 函数：月租车位收费管理 =====

/** 获取月租订阅列表 */
export async function getRentalSubscriptions(params: RentalParkingQueryParams): Promise<{ list: RentalParkingSubscription[]; total: number }> {
  await delay();
  let filtered = mockRentalSubscriptions.filter(r => r.projectId === params.projectId);
  if (params.keyword) {
    const kw = params.keyword;
    filtered = filtered.filter(r => r.plateNo.includes(kw) || r.ownerName.includes(kw) || r.phone.includes(kw));
  }
  if (params.status) {
    filtered = filtered.filter(r => r.status === params.status);
  }
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
}

/** 创建月租订阅 */
export async function createRentalSubscription(data: Omit<RentalParkingSubscription, 'id' | 'createTime' | 'updateTime'>): Promise<RentalParkingSubscription> {
  await delay(300);
  const newSub: RentalParkingSubscription = {
    ...data,
    id: mockRentalSubscriptions.length + 1,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  mockRentalSubscriptions.push(newSub);
  return newSub;
}

/** 更新月租订阅 */
export async function updateRentalSubscription(id: number, data: Partial<RentalParkingSubscription>): Promise<RentalParkingSubscription | null> {
  await delay(300);
  const sub = mockRentalSubscriptions.find(r => r.id === id);
  if (!sub) return null;
  Object.assign(sub, data, { updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19) });
  return sub;
}

/** 删除月租订阅 */
export async function deleteRentalSubscription(id: number): Promise<boolean> {
  await delay(200);
  const idx = mockRentalSubscriptions.findIndex(r => r.id === id);
  if (idx < 0) return false;
  mockRentalSubscriptions.splice(idx, 1);
  return true;
}

/** 获取月租收费记录 */
export async function getRentalParkingFees(params: RentalFeeQueryParams): Promise<{ list: RentalParkingFeeRecord[]; total: number }> {
  await delay();
  let filtered = mockRentalParkingFees.filter(r => r.projectId === params.projectId);
  if (params.keyword) {
    const kw = params.keyword;
    filtered = filtered.filter(r => r.ownerName.includes(kw) || r.plateNo.includes(kw));
  }
  if (params.status) {
    filtered = filtered.filter(r => r.status === params.status);
  }
  if (params.period) {
    filtered = filtered.filter(r => r.period === params.period);
  }
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
}

/** 生成月租车位账单 */
export async function generateRentalParkingFees(projectId: number, period: string): Promise<RentalParkingFeeRecord[]> {
  await delay(500);
  const newRecords: RentalParkingFeeRecord[] = [];
  const existingPeriods = mockRentalParkingFees.filter(r => r.projectId === projectId && r.period === period);
  if (existingPeriods.length > 0) {
    return []; // 已存在该账期账单
  }
  // 为所有活跃订阅生成账单
  const activeSubs = mockRentalSubscriptions.filter(r => r.projectId === projectId && r.status === 'active');
  activeSubs.forEach((sub, idx) => {
    const record: RentalParkingFeeRecord = {
      id: mockRentalParkingFees.length + idx + 1,
      projectId,
      subscriptionId: sub.id,
      plateNo: sub.plateNo,
      ownerName: sub.ownerName,
      monthlyRent: sub.monthlyRent,
      period,
      status: 'pending',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    mockRentalParkingFees.push(record);
    newRecords.push(record);
  });
  return newRecords;
}

/** 月租收费 - 标记为已缴费 */
export async function payRentalParkingFee(id: number, payMethod: string): Promise<RentalParkingFeeRecord | null> {
  await delay(300);
  const record = mockRentalParkingFees.find(r => r.id === id);
  if (!record) return null;
  record.status = 'paid';
  record.paidAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  record.payMethod = payMethod;
  record.updateTime = record.paidAt;
  return record;
}