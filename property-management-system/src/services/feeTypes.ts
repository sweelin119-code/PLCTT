export {};
// ===== 收费管理类型定义 =====

// 费用类别
export type FeeCategory =
  | 'property_fee'      // 物业费
  | 'parking_fee'       // 停车费
  | 'public_share'      // 公摊费
  | 'agency'            // 代收代缴
  | 'deposit'           // 押金/保证金
  | 'value_added'       // 增值服务费
  | 'other';            // 其他

// 计费周期
export type BillingCycle = 'month' | 'quarter' | 'year' | 'one_time';

// 计费模式
export type PricingMode = 'fixed' | 'area' | 'household' | 'step' | 'per_time' | 'per_hour' | 'formula';

// 账单状态
export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';

// 支付方式
export type PayMethod = 'wechat' | 'alipay' | 'cash' | 'transfer' | 'bank';

// 催缴方式
export type CollectionType = 'sms' | 'app' | 'wechat' | 'phone' | 'visit' | 'legal';

// 催缴结果
export type CollectionResult = 'sent' | 'contacted' | 'promised' | 'paid' | 'ignored';

// ===== 费用项目 =====
export interface FeeItem {
  id: number;
  projectId: number;
  name: string;
  code: string;
  category: FeeCategory;
  unit: string;
  billingCycle: BillingCycle;
  taxRate: number;
  sortOrder: number;
  enabled: boolean;
  remark?: string;
  createTime: string;
  updateTime: string;
}

// ===== 收费标准规则 =====
export interface ChargeRule {
  id: number;
  projectId: number;
  feeItemId: number;
  houseType: string;
  pricingMode: PricingMode;
  price: number;
  formula?: string;
  effectiveDate: string;
  expireDate?: string;
  enabled: boolean;
  createTime: string;
  updateTime: string;
  // 关联信息
  feeItemName?: string;
  feeItemCategory?: FeeCategory;
}

// ===== 账单 =====
export interface Bill {
  id: number;
  projectId: number;
  billNo: string;
  houseId: number;
  ownerId?: number;
  feeItemId: number;
  periodYear: number;
  periodMonth?: number;
  amount: number;
  paidAmount: number;
  discountAmount: number;
  lateFee: number;
  status: BillStatus;
  dueDate: string;
  paidTime?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
  // 关联信息
  houseFullName?: string;
  ownerName?: string;
  ownerPhone?: string;
  feeItemName?: string;
  feeItemCategory?: FeeCategory;
  buildingName?: string;
}

// ===== 缴费记录 =====
export interface PaymentRecord {
  id: number;
  projectId: number;
  billId: number;
  paymentNo: string;
  payMethod: PayMethod;
  payAmount: number;
  payTime: string;
  operatorId?: number;
  tradeNo?: string;
  receiptNo?: string;
  remark?: string;
  createTime: string;
  // 关联信息
  billNo?: string;
  houseFullName?: string;
  ownerName?: string;
  feeItemName?: string;
  operatorName?: string;
}

// ===== 催缴记录 =====
export interface CollectionRecord {
  id: number;
  projectId: number;
  billId: number;
  houseId: number;
  ownerId?: number;
  collectionType: CollectionType;
  content: string;
  result: CollectionResult;
  operatorId?: number;
  createTime: string;
  // 关联信息
  billNo?: string;
  houseFullName?: string;
  ownerName?: string;
  ownerPhone?: string;
  operatorName?: string;
}

// ===== 催缴模板 =====
export interface CollectionTemplate {
  id: number;
  projectId: number;
  name: string;
  type: CollectionType;
  title: string;
  content: string;
  enabled: boolean;
  createTime: string;
  updateTime: string;
}

// ===== 收费统计 =====
export interface FeeStatistics {
  totalReceivable: number;      // 总应收
  totalReceived: number;        // 总已收
  totalArrears: number;         // 总欠费
  collectionRate: number;       // 收费率
  monthReceivable: number;      // 本月应收
  monthReceived: number;        // 本月已收
  monthCollectionRate: number;  // 本月收费率
  overdueCount: number;         // 逾期户数
  totalBills: number;           // 总账单数
  paidBills: number;            // 已缴账单数
}

// 按楼栋汇总
export interface BuildingFeeSummary {
  buildingId: number;
  buildingName: string;
  totalHouses: number;
  receivable: number;
  received: number;
  arrears: number;
  collectionRate: number;
}

// 收费趋势点
export interface FeeTrendPoint {
  month: string;
  receivable: number;
  received: number;
  collectionRate: number;
}

// ===== 查询参数 =====
export interface BillQueryParams {
  projectId: number;
  periodYear?: number;
  periodMonth?: number;
  buildingId?: number;
  status?: BillStatus;
  feeItemId?: number;
  keyword?: string;
  page: number;
  pageSize: number;
}

export interface PaymentQueryParams {
  projectId: number;
  payMethod?: PayMethod;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page: number;
  pageSize: number;
}

export interface CollectionQueryParams {
  projectId: number;
  buildingId?: number;
  overdueDays?: number;
  keyword?: string;
  page: number;
  pageSize: number;
}

// ===== 账单生成参数 =====
export interface BillGenerateParams {
  projectId: number;
  feeItemIds: number[];
  periodYear: number;
  periodMonth: number;
  buildingIds?: number[];
  houseIds?: number[];
}

// ===== 线下缴费登记 =====
export interface OfflinePaymentData {
  billIds: number[];
  payMethod: PayMethod;
  payAmount: number;
  payTime: string;
  remark?: string;
}

// ===== 账单调整 =====
export interface BillAdjustData {
  id: number;
  adjustType: 'discount' | 'write_off' | 'late_fee';
  amount: number;
  reason: string;
}
