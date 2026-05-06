// ===== 业主端 - 我的账单 服务层 =====
// 提供业主端账单查询、支付、发票等功能

// ===== 类型定义 =====

/** 账单分类：house=房屋费用, parking=停车费用 */
export type BillCategory = 'house' | 'parking';

/** 费用类型（对应后台费用项配置） */
export type BillType = 'property' | 'water' | 'electric' | 'parking' | 'parking_management';

export type BillStatus = 'pending' | 'paid' | 'overdue';
export type InvoiceStatus = 'none' | 'applied' | 'issued';
export type PayMethod = 'wechat' | 'alipay';

export interface BillDetail {
  itemName: string;    // 费用项名称，如"物业管理费"
  unitPrice: number;   // 单价
  quantity: number;    // 数量（如面积）
  amount: number;      // 金额
}

export interface BillItem {
  id: string;
  houseId: string;
  category: BillCategory;       // 账单分类：房屋费用/停车费用
  billType: BillType;
  billTypeName: string;
  period: string;               // 费用周期，如 "2026-05"
  amount: number;               // 应缴金额
  paidAmount: number;           // 已缴金额
  status: BillStatus;
  dueDate: string;              // 缴费截止日期
  paidAt?: string;              // 缴费时间
  paymentMethod?: string;       // 支付方式
  invoiceStatus: InvoiceStatus;
  details: BillDetail[];        // 费用明细
  createdAt: string;
}

export interface BillOverview {
  totalPending: number;         // 总待缴金额
  monthAmount: number;          // 本月应缴金额
  overdueCount: number;         // 欠费笔数
  overdueAmount: number;        // 欠费总金额
  housePending: number;         // 房屋费用待缴
  parkingPending: number;       // 停车费用待缴
}

export interface PaymentRecord {
  id: string;
  billId: string;
  category: BillCategory;
  billTypeName: string;
  period: string;
  amount: number;
  payMethod: PayMethod;
  payTime: string;
  tradeNo: string;
  invoiceStatus: InvoiceStatus;
}

export interface InvoiceRecord {
  id: string;
  billId: string;
  category: BillCategory;
  billTypeName: string;
  period: string;
  amount: number;
  invoiceNo: string;
  status: InvoiceStatus;
  applyTime: string;
  issueTime?: string;
}

// ===== 工具函数 =====

/** 根据费用类型获取所属分类 */
export function getCategoryByBillType(billType: BillType): BillCategory {
  switch (billType) {
    case 'parking':
    case 'parking_management':
      return 'parking';
    default:
      return 'house';
  }
}

/** 获取分类名称 */
export function getCategoryName(category: BillCategory): string {
  return category === 'house' ? '房屋费用' : '停车费用';
}

// ===== Mock 数据 =====

const mockBills: BillItem[] = [
  // ---- 房屋费用 ----
  {
    id: 'B202605001',
    houseId: 'H1001',
    category: 'house',
    billType: 'property',
    billTypeName: '物业费',
    period: '2026-05',
    amount: 358.50,
    paidAmount: 0,
    status: 'pending',
    dueDate: '2026-05-31',
    invoiceStatus: 'none',
    details: [
      { itemName: '物业管理费', unitPrice: 2.50, quantity: 120, amount: 300.00 },
      { itemName: '公共能耗费', unitPrice: 0.50, quantity: 120, amount: 60.00 },
      { itemName: '垃圾清运费', unitPrice: -1.50, quantity: 1, amount: -1.50 },
    ],
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'B202605002',
    houseId: 'H1001',
    category: 'house',
    billType: 'water',
    billTypeName: '公摊水费',
    period: '2026-04',
    amount: 12.80,
    paidAmount: 0,
    status: 'overdue',
    dueDate: '2026-04-30',
    invoiceStatus: 'none',
    details: [
      { itemName: '公共区域水费（公摊）', unitPrice: 3.50, quantity: 3.2, amount: 11.20 },
      { itemName: '绿化用水（公摊）', unitPrice: 0.50, quantity: 3.2, amount: 1.60 },
    ],
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'B202605003',
    houseId: 'H1001',
    category: 'house',
    billType: 'electric',
    billTypeName: '公摊电费',
    period: '2026-04',
    amount: 36.20,
    paidAmount: 36.20,
    status: 'paid',
    dueDate: '2026-04-30',
    paidAt: '2026-04-15T10:30:00Z',
    paymentMethod: '微信支付',
    invoiceStatus: 'issued',
    details: [
      { itemName: '公共照明电费（公摊）', unitPrice: 0.60, quantity: 52, amount: 31.20 },
      { itemName: '电梯电费（公摊）', unitPrice: 0.60, quantity: 8, amount: 4.80 },
      { itemName: '代征附加费', unitPrice: 0.0004, quantity: 52, amount: 0.20 },
    ],
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'B202605004',
    houseId: 'H1001',
    category: 'house',
    billType: 'property',
    billTypeName: '物业费',
    period: '2026-04',
    amount: 358.50,
    paidAmount: 358.50,
    status: 'paid',
    dueDate: '2026-04-30',
    paidAt: '2026-04-08T14:20:00Z',
    paymentMethod: '支付宝',
    invoiceStatus: 'applied',
    details: [
      { itemName: '物业管理费', unitPrice: 2.50, quantity: 120, amount: 300.00 },
      { itemName: '公共能耗费', unitPrice: 0.50, quantity: 120, amount: 60.00 },
      { itemName: '垃圾清运费', unitPrice: -1.50, quantity: 1, amount: -1.50 },
    ],
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'B202605005',
    houseId: 'H1001',
    category: 'house',
    billType: 'water',
    billTypeName: '公摊水费',
    period: '2026-03',
    amount: 10.60,
    paidAmount: 10.60,
    status: 'paid',
    dueDate: '2026-03-31',
    paidAt: '2026-03-12T09:15:00Z',
    paymentMethod: '微信支付',
    invoiceStatus: 'none',
    details: [
      { itemName: '公共区域水费（公摊）', unitPrice: 3.50, quantity: 2.5, amount: 8.75 },
      { itemName: '绿化用水（公摊）', unitPrice: 0.50, quantity: 3.7, amount: 1.85 },
    ],
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'B202605006',
    houseId: 'H1001',
    category: 'house',
    billType: 'electric',
    billTypeName: '公摊电费',
    period: '2026-05',
    amount: 42.30,
    paidAmount: 0,
    status: 'pending',
    dueDate: '2026-05-31',
    invoiceStatus: 'none',
    details: [
      { itemName: '公共照明电费（公摊）', unitPrice: 0.60, quantity: 60, amount: 36.00 },
      { itemName: '电梯电费（公摊）', unitPrice: 0.60, quantity: 10, amount: 6.00 },
      { itemName: '代征附加费', unitPrice: 0.0005, quantity: 60, amount: 0.30 },
    ],
    createdAt: '2026-05-01T00:00:00Z',
  },
  // ---- 停车费用 ----
  {
    id: 'B202605007',
    houseId: 'H1001',
    category: 'parking',
    billType: 'parking',
    billTypeName: '停车费',
    period: '2026-05',
    amount: 150.00,
    paidAmount: 0,
    status: 'pending',
    dueDate: '2026-05-31',
    invoiceStatus: 'none',
    details: [
      { itemName: '车位租赁费', unitPrice: 100.00, quantity: 1, amount: 100.00 },
      { itemName: '车位管理费', unitPrice: 50.00, quantity: 1, amount: 50.00 },
    ],
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'B202605008',
    houseId: 'H1001',
    category: 'parking',
    billType: 'parking_management',
    billTypeName: '车位管理费',
    period: '2026-04',
    amount: 50.00,
    paidAmount: 50.00,
    status: 'paid',
    dueDate: '2026-04-30',
    paidAt: '2026-04-08T14:20:00Z',
    paymentMethod: '微信支付',
    invoiceStatus: 'none',
    details: [
      { itemName: '车位管理费', unitPrice: 50.00, quantity: 1, amount: 50.00 },
    ],
    createdAt: '2026-04-01T00:00:00Z',
  },
];

const mockPayments: PaymentRecord[] = [
  { id: 'P202604001', billId: 'B202605003', category: 'house', billTypeName: '公摊电费', period: '2026-04', amount: 36.20, payMethod: 'wechat', payTime: '2026-04-15 10:30', tradeNo: 'WX202604151030001', invoiceStatus: 'issued' },
  { id: 'P202604002', billId: 'B202605004', category: 'house', billTypeName: '物业费', period: '2026-04', amount: 358.50, payMethod: 'alipay', payTime: '2026-04-08 14:20', tradeNo: 'AL202604081420002', invoiceStatus: 'applied' },
  { id: 'P202603001', billId: 'B202605005', category: 'house', billTypeName: '公摊水费', period: '2026-03', amount: 10.60, payMethod: 'wechat', payTime: '2026-03-12 09:15', tradeNo: 'WX202603120915003', invoiceStatus: 'none' },
  { id: 'P202604003', billId: 'B202605008', category: 'parking', billTypeName: '车位管理费', period: '2026-04', amount: 50.00, payMethod: 'wechat', payTime: '2026-04-08 14:20', tradeNo: 'WX202604081420004', invoiceStatus: 'none' },
];

const mockInvoices: InvoiceRecord[] = [
  { id: 'INV202604001', billId: 'B202605003', category: 'house', billTypeName: '公摊电费', period: '2026-04', amount: 36.20, invoiceNo: 'INV20260415001', status: 'issued', applyTime: '2026-04-15 10:35', issueTime: '2026-04-15 14:00' },
  { id: 'INV202604002', billId: 'B202605004', category: 'house', billTypeName: '物业费', period: '2026-04', amount: 358.50, invoiceNo: '', status: 'applied', applyTime: '2026-04-08 14:25' },
];

// ===== 模拟延迟 =====
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ===== API 函数 =====

/**
 * 获取账单总览数据
 */
export async function getBillOverview(houseId: string): Promise<BillOverview> {
  await delay(500);
  const houseBills = mockBills.filter(b => b.houseId === houseId);
  const pending = houseBills.filter(b => b.status === 'pending');
  const overdue = houseBills.filter(b => b.status === 'overdue');
  const currentMonth = '2026-05';
  const monthBills = houseBills.filter(b => b.period === currentMonth);

  return {
    totalPending: pending.reduce((sum, b) => sum + b.amount, 0) + overdue.reduce((sum, b) => sum + b.amount, 0),
    monthAmount: monthBills.reduce((sum, b) => sum + b.amount, 0),
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((sum, b) => sum + b.amount, 0),
    housePending: houseBills
      .filter(b => b.category === 'house' && (b.status === 'pending' || b.status === 'overdue'))
      .reduce((sum, b) => sum + b.amount, 0),
    parkingPending: houseBills
      .filter(b => b.category === 'parking' && (b.status === 'pending' || b.status === 'overdue'))
      .reduce((sum, b) => sum + b.amount, 0),
  };
}

/**
 * 获取账单列表
 */
export async function getBills(
  houseId: string,
  filter?: { category?: BillCategory; status?: BillStatus; page?: number; pageSize?: number }
): Promise<{ list: BillItem[]; total: number }> {
  await delay(600);
  let filtered = mockBills.filter(b => b.houseId === houseId);

  if (filter?.category) {
    filtered = filtered.filter(b => b.category === filter.category);
  }
  if (filter?.status) {
    filtered = filtered.filter(b => b.status === filter.status);
  }

  // 按时间倒序
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = filter?.page || 1;
  const pageSize = filter?.pageSize || 20;
  const start = (page - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return { list, total: filtered.length };
}

/**
 * 获取账单详情
 */
export async function getBillById(billId: string): Promise<BillItem | null> {
  await delay(300);
  return mockBills.find(b => b.id === billId) || null;
}

/**
 * 获取缴费记录
 */
export async function getPaymentRecords(houseId: string): Promise<PaymentRecord[]> {
  await delay(400);
  const billIds = mockBills.filter(b => b.houseId === houseId).map(b => b.id);
  return mockPayments.filter(p => billIds.includes(p.billId)).sort((a, b) => new Date(b.payTime).getTime() - new Date(a.payTime).getTime());
}

/**
 * 获取电子发票列表
 */
export async function getInvoices(houseId: string): Promise<InvoiceRecord[]> {
  await delay(400);
  const billIds = mockBills.filter(b => b.houseId === houseId).map(b => b.id);
  return mockInvoices.filter(inv => billIds.includes(inv.billId));
}

/**
 * 申请开票
 */
export async function applyInvoice(billId: string): Promise<boolean> {
  await delay(800);
  const bill = mockBills.find(b => b.id === billId);
  if (bill) {
    bill.invoiceStatus = 'applied';

    // 同步向 mockInvoices 中添加发票记录，避免数据丢失
    const existingInvoice = mockInvoices.find(inv => inv.billId === billId);
    if (!existingInvoice) {
      const now = new Date();
      mockInvoices.push({
        id: `INV${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(mockInvoices.length + 1).padStart(3, '0')}`,
        billId: bill.id,
        category: bill.category,
        billTypeName: bill.billTypeName,
        period: bill.period,
        amount: bill.amount,
        invoiceNo: '',
        status: 'applied',
        applyTime: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      });
    }
  }
  return true;
}

/**
 * 确认支付（模拟支付流程）
 */
export async function confirmPayment(params: {
  billIds: string[];
  payMethod: PayMethod;
}): Promise<{ success: boolean; tradeNo: string; message: string }> {
  await delay(1500);
  // 模拟支付成功
  const tradeNo = `${params.payMethod === 'wechat' ? 'WX' : 'AL'}${Date.now()}`;

  // 更新账单状态
  params.billIds.forEach(id => {
    const bill = mockBills.find(b => b.id === id);
    if (bill) {
      bill.status = 'paid';
      bill.paidAmount = bill.amount;
      bill.paidAt = new Date().toISOString();
      bill.paymentMethod = params.payMethod === 'wechat' ? '微信支付' : '支付宝';
    }
  });

  // 同步向 mockPayments 中添加支付记录
  params.billIds.forEach(id => {
    const bill = mockBills.find(b => b.id === id);
    if (bill) {
      const existingPayment = mockPayments.find(p => p.billId === id);
      if (!existingPayment) {
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        mockPayments.push({
          id: `P${timeStr.replace(/[-: ]/g, '')}${String(mockPayments.length + 1).padStart(3, '0')}`,
          billId: bill.id,
          category: bill.category,
          billTypeName: bill.billTypeName,
          period: bill.period,
          amount: bill.amount,
          payMethod: params.payMethod,
          payTime: timeStr,
          tradeNo: `${params.payMethod === 'wechat' ? 'WX' : 'AL'}${Date.now()}${String(mockPayments.length + 1).padStart(3, '0')}`,
          invoiceStatus: 'none',
        });
      }
    }
  });

  return { success: true, tradeNo, message: '支付成功' };
}
