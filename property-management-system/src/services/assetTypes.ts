// ===== 资产管理类型定义 =====
export {};

// 数据来源
export type DataSource = 'manual' | 'gov_sync' | 'import' | 'owner_register';

// 楼栋
export interface Building {
  id: number;
  projectId: number;
  name: string;
  aliasName?: string;
  totalLayers: number;
  undergroundLayers?: number;
  totalUnits: number;
  totalElevators?: number;
  buildYear?: number;
  propertyType: 'residence' | 'shop' | 'office';
  dataSource: DataSource;
  sortOrder: number;
  enabled: boolean;
  createTime: string;
  updateTime: string;
}

// 单元
export interface BuildingUnit {
  id: number;
  buildingId: number;
  name: string;
  totalFloors: number;
  totalHouses: number;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}

// 房屋状态
export type OwnershipStatus = 'vacant' | 'occupied' | 'rented' | 'for_sale' | 'renovating';

// 装修状态
export type DecorationStatus = 'rough' | 'simple' | 'standard' | 'luxury';

// 房屋
export interface House {
  id: number;
  projectId: number;
  buildingId: number;
  unitId?: number;
  floor: number;
  roomNo: string;
  fullName: string;
  layout?: string;
  area?: number;
  usableArea?: number;
  orientation?: string;
  decorationStatus: DecorationStatus;
  ownershipStatus: OwnershipStatus;
  propertyType: string;
  dataSource: DataSource;
  sortOrder: number;
  enabled: boolean;
  createTime: string;
  updateTime: string;
  // 关联信息（展示用）
  buildingName?: string;
  unitName?: string;
  ownerName?: string;
}

// 业主档案
export interface Owner {
  id: number;
  projectId: number;
  name: string;
  phone: string;
  idCard?: string;
  gender?: 'male' | 'female';
  birthday?: string;
  nationality?: string;
  nativePlace?: string;
  education?: string;
  profession?: string;
  wechatOpenid?: string;
  tags: string[];
  dataSource: DataSource;
  status: boolean;
  createTime: string;
  updateTime: string;
  // 统计信息（展示用）
  houseCount?: number;
  parkingCount?: number;
}

// 业主绑定关系
export type OwnerType = 'owner' | 'co_owner' | 'family' | 'tenant';

// 业主绑定
export interface HouseOwner {
  id: number;
  houseId: number;
  ownerId: number;
  ownerType: OwnerType;
  bindTime: string;
  unbindTime?: string;
  isActive: boolean;
  remark?: string;
  createTime: string;
  // 关联信息（展示用）
  houseFullName?: string;
  ownerName?: string;
  ownerPhone?: string;
}

// 业主变更记录
export interface OwnerChangeLog {
  id: number;
  houseId: number;
  oldOwnerId?: number;
  newOwnerId?: number;
  changeType: 'sale' | 'transfer' | 'rent' | 'other';
  changeReason?: string;
  operatorId: number;
  changeTime: string;
  // 关联信息（展示用）
  houseFullName?: string;
  oldOwnerName?: string;
  newOwnerName?: string;
  operatorName?: string;
}

// 车位类型
export type ParkingType = 'fixed' | 'temporary' | 'mechanical' | 'mother_child';

// 车位状态
export type ParkingStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';

// 车位产权类型
export type ParkingPropertyType = 'sale' | 'rent' | 'public';

// 车位
export interface ParkingSpace {
  id: number;
  projectId: number;
  houseId?: number;
  code: string;
  type: ParkingType;
  area?: string;
  floor?: number;
  sizeArea?: number;
  status: ParkingStatus;
  propertyType: ParkingPropertyType;
  ownerId?: number;
  monthlyRent?: number;
  dataSource: DataSource;
  sortOrder: number;
  enabled: boolean;
  createTime: string;
  updateTime: string;
  // 关联信息（展示用）
  ownerName?: string;
  houseFullName?: string;
}

// 资产统计概览
export interface AssetStatistics {
  projectId: number;
  projectName: string;
  buildingCount: number;
  houseCount: number;
  occupiedCount: number;
  vacantCount: number;
  occupancyRate: number;
  parkingCount: number;
  fixedParkingCount: number;
  temporaryParkingCount: number;
  soldRentedParkingCount: number;
  parkingUtilizationRate: number;
  ownerCount: number;
  boundHouseCount: number;
  unboundHouseCount: number;
  monthlyNewOwnerCount: number;
  dataSource: string;
}

// 楼栋统计（用于资产总览分布图）
export interface BuildingStatistics {
  buildingId: number;
  buildingName: string;
  totalHouses: number;
  occupiedCount: number;
  occupancyRate: number;
}

// ===== 业主成员类型 =====

// 业主成员关系类型
export type MemberRelation = 'spouse' | 'child' | 'parent' | 'relative' | 'other';

// 业主成员
export interface OwnerMember {
  id: number;
  projectId: number;
  ownerId: number;           // 关联的主业主ID
  ownerName?: string;        // 主业主姓名（展示用）
  name: string;              // 成员姓名
  phone: string;             // 成员手机号
  relation: MemberRelation;  // 与业主的关系
  idCard?: string;           // 身份证号
  gender?: 'male' | 'female';
  birthday?: string;
  remark?: string;
  status: boolean;           // 启用状态
  createTime: string;
  updateTime: string;
}

// ===== 业主账户类型 =====

// 账户交易类型
export type AccountTransactionType = 'recharge' | 'payment' | 'refund' | 'withdraw';

// 账户交易状态
export type AccountTransactionStatus = 'pending' | 'success' | 'failed';

// 业主账户
export interface OwnerAccount {
  id: number;
  projectId: number;
  ownerId: number;           // 关联的业主ID
  ownerName?: string;        // 业主姓名（展示用）
  ownerPhone?: string;       // 业主手机号（展示用）
  balance: number;           // 当前余额（单位：分）
  totalRecharge: number;     // 累计充值
  totalPayment: number;      // 累计消费
  freezeAmount: number;      // 冻结金额
  status: boolean;           // 启用状态
  createTime: string;
  updateTime: string;
}

// 账户交易记录
export interface AccountTransaction {
  id: number;
  accountId: number;
  ownerId: number;
  projectId: number;
  transactionType: AccountTransactionType;
  amount: number;            // 交易金额（正数=收入，负数=支出）
  balanceBefore: number;     // 交易前余额
  balanceAfter: number;      // 交易后余额
  status: AccountTransactionStatus;
  remark?: string;           // 备注
  relatedBillId?: number;    // 关联账单ID（支付时）
  operatorId?: number;       // 操作人ID
  operatorName?: string;     // 操作人姓名
  createTime: string;
}
