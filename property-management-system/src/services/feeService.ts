import {
  FeeItem, ChargeRule, Bill, PaymentRecord, CollectionRecord,
  CollectionTemplate, FeeStatistics, BuildingFeeSummary, FeeTrendPoint,
  BillQueryParams, PaymentQueryParams, CollectionQueryParams,
  BillGenerateParams, OfflinePaymentData, BillAdjustData,
  FeeCategory, BillingCycle, PricingMode, BillStatus, PayMethod,
} from './feeTypes';
import { getProjectList } from './orgService';

// ===== Mock 数据 =====

// 费用项目
const mockFeeItems: FeeItem[] = [
  { id: 1, projectId: 1, name: '物业管理服务费', code: 'PROP_001', category: 'property_fee', unit: '元/㎡/月', billingCycle: 'month', taxRate: 0, sortOrder: 1, enabled: true, remark: '住宅物业费', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 2, projectId: 1, name: '车位管理费', code: 'PARK_001', category: 'parking_fee', unit: '元/月', billingCycle: 'month', taxRate: 0, sortOrder: 2, enabled: true, remark: '固定车位管理费', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 3, projectId: 1, name: '公摊水费', code: 'PUB_WATER', category: 'public_share', unit: '元/吨', billingCycle: 'month', taxRate: 0, sortOrder: 3, enabled: true, remark: '', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 4, projectId: 1, name: '公摊电费', code: 'PUB_ELEC', category: 'public_share', unit: '元/度', billingCycle: 'month', taxRate: 0, sortOrder: 4, enabled: true, remark: '', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 5, projectId: 1, name: '代收水费', code: 'AGT_WATER', category: 'agency', unit: '元/吨', billingCycle: 'month', taxRate: 0, sortOrder: 5, enabled: true, remark: '', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 6, projectId: 1, name: '装修保证金', code: 'DEC_DEPOSIT', category: 'deposit', unit: '元/户', billingCycle: 'one_time', taxRate: 0, sortOrder: 6, enabled: true, remark: '装修完成后验收合格退还', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 7, projectId: 1, name: '装修垃圾清运费', code: 'DEC_TRASH', category: 'deposit', unit: '元/户', billingCycle: 'one_time', taxRate: 0, sortOrder: 7, enabled: true, remark: '', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 8, projectId: 1, name: '临时停车费', code: 'PARK_TEMP', category: 'parking_fee', unit: '元/次', billingCycle: 'one_time', taxRate: 0, sortOrder: 8, enabled: true, remark: '', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 9, projectId: 1, name: '家政服务费', code: 'VAL_HOUSE', category: 'value_added', unit: '元/次', billingCycle: 'one_time', taxRate: 6, sortOrder: 9, enabled: true, remark: '', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 10, projectId: 1, name: '门禁卡工本费', code: 'OTH_CARD', category: 'other', unit: '元/张', billingCycle: 'one_time', taxRate: 0, sortOrder: 10, enabled: true, remark: '', createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
];

// 收费标准
const mockChargeRules: ChargeRule[] = [
  { id: 1, projectId: 1, feeItemId: 1, houseType: 'residence', pricingMode: 'area', price: 2.5, effectiveDate: '2026-01-01', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', feeItemName: '物业管理服务费', feeItemCategory: 'property_fee' },
  { id: 2, projectId: 1, feeItemId: 1, houseType: 'shop', pricingMode: 'area', price: 5.0, effectiveDate: '2026-01-01', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', feeItemName: '物业管理服务费', feeItemCategory: 'property_fee' },
  { id: 3, projectId: 1, feeItemId: 2, houseType: 'residence', pricingMode: 'fixed', price: 150, effectiveDate: '2026-01-01', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', feeItemName: '车位管理费', feeItemCategory: 'parking_fee' },
  { id: 4, projectId: 1, feeItemId: 3, houseType: 'residence', pricingMode: 'household', price: 25, effectiveDate: '2026-01-01', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', feeItemName: '公摊水费', feeItemCategory: 'public_share' },
  { id: 5, projectId: 1, feeItemId: 4, houseType: 'residence', pricingMode: 'household', price: 35, effectiveDate: '2026-01-01', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', feeItemName: '公摊电费', feeItemCategory: 'public_share' },
  { id: 6, projectId: 1, feeItemId: 6, houseType: 'residence', pricingMode: 'fixed', price: 2000, effectiveDate: '2026-01-01', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', feeItemName: '装修保证金', feeItemCategory: 'deposit' },
  { id: 7, projectId: 1, feeItemId: 7, houseType: 'residence', pricingMode: 'fixed', price: 500, effectiveDate: '2026-01-01', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00', feeItemName: '装修垃圾清运费', feeItemCategory: 'deposit' },
];

// 模拟房屋数据（简化版，用于账单生成）
interface SimpleHouse {
  id: number; projectId: number; buildingId: number; fullName: string; area: number; houseType: string; ownerName?: string; ownerId?: number; ownerPhone?: string; buildingName?: string;
}
const mockSimpleHouses: SimpleHouse[] = [
  { id: 1, projectId: 1, buildingId: 1, fullName: '1栋1单元101', area: 100, houseType: 'residence', ownerName: '张三', ownerId: 1, ownerPhone: '13800000001', buildingName: '1栋' },
  { id: 2, projectId: 1, buildingId: 1, fullName: '1栋1单元102', area: 100, houseType: 'residence', ownerName: '李四', ownerId: 2, ownerPhone: '13800000002', buildingName: '1栋' },
  { id: 3, projectId: 1, buildingId: 1, fullName: '1栋1单元201', area: 120, houseType: 'residence', ownerName: '王五', ownerId: 3, ownerPhone: '13800000003', buildingName: '1栋' },
  { id: 4, projectId: 1, buildingId: 2, fullName: '2栋1单元101', area: 90, houseType: 'residence', ownerName: '赵六', ownerId: 4, ownerPhone: '13800000004', buildingName: '2栋' },
  { id: 5, projectId: 1, buildingId: 2, fullName: '2栋1单元102', area: 90, houseType: 'residence', ownerName: '孙七', ownerId: 5, ownerPhone: '13800000005', buildingName: '2栋' },
  { id: 6, projectId: 1, buildingId: 2, fullName: '2栋1单元201', area: 110, houseType: 'residence', ownerName: '周八', ownerId: 6, ownerPhone: '13800000006', buildingName: '2栋' },
  { id: 7, projectId: 1, buildingId: 3, fullName: '3栋1单元101', area: 130, houseType: 'shop', ownerName: '吴九', ownerId: 7, ownerPhone: '13800000007', buildingName: '3栋' },
  { id: 8, projectId: 1, buildingId: 3, fullName: '3栋1单元102', area: 130, houseType: 'shop', ownerName: '郑十', ownerId: 8, ownerPhone: '13800000008', buildingName: '3栋' },
];

// 生成账单 Mock 数据
const generateMockBills = (): Bill[] => {
  const bills: Bill[] = [];
  let billId = 1;
  const statuses: BillStatus[] = ['pending', 'paid', 'overdue', 'paid', 'paid', 'pending', 'overdue', 'paid'];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  for (const house of mockSimpleHouses) {
    for (const rule of mockChargeRules) {
      if (rule.houseType !== house.houseType) continue;
      // 通过 feeItem 判断是否一次性费用
      const feeItem = mockFeeItems.find(f => f.id === rule.feeItemId);
      if (feeItem && feeItem.billingCycle === 'one_time') continue;

      let amount = 0;
      if (rule.pricingMode === 'area') amount = parseFloat((house.area * rule.price).toFixed(2));
      else if (rule.pricingMode === 'fixed') amount = rule.price;
      else if (rule.pricingMode === 'household') amount = rule.price;

      const statusIdx = (billId - 1) % statuses.length;
      const status = statuses[statusIdx];
      const isPaid = status === 'paid';

      bills.push({
        id: billId,
        projectId: 1,
        billNo: `BILL${year}${String(month).padStart(2, '0')}${String(billId).padStart(6, '0')}`,
        houseId: house.id,
        ownerId: house.ownerId,
        feeItemId: rule.feeItemId,
        periodYear: year,
        periodMonth: month,
        amount,
        paidAmount: isPaid ? amount : (status === 'partially_paid' ? amount * 0.5 : 0),
        discountAmount: 0,
        lateFee: status === 'overdue' ? parseFloat((amount * 0.005).toFixed(2)) : 0,
        status,
        dueDate: `${year}-${String(month).padStart(2, '0')}-30`,
        paidTime: isPaid ? `${year}-${String(month).padStart(2, '0')}-${String(10 + (billId % 15)).padStart(2, '0')} 10:30:00` : undefined,
        createTime: `${year}-${String(month).padStart(2, '0')}-01 00:00:00`,
        updateTime: `${year}-${String(month).padStart(2, '0')}-01 00:00:00`,
        houseFullName: house.fullName,
        ownerName: house.ownerName,
        ownerPhone: house.ownerPhone,
        feeItemName: rule.feeItemName,
        feeItemCategory: rule.feeItemCategory,
        buildingName: house.buildingName,
      });
      billId++;
    }
  }
  return bills;
};

let mockBills = generateMockBills();

// 缴费记录
const generateMockPayments = (): PaymentRecord[] => {
  const paidBills = mockBills.filter(b => b.status === 'paid' || b.status === 'partially_paid');
  return paidBills.map((bill, idx) => ({
    id: idx + 1,
    projectId: 1,
    billId: bill.id,
    paymentNo: `PAY${bill.periodYear}${String(bill.periodMonth).padStart(2, '0')}${String(idx + 1).padStart(6, '0')}`,
    payMethod: (['wechat', 'alipay', 'cash', 'transfer'] as PayMethod[])[idx % 4],
    payAmount: bill.paidAmount,
    payTime: bill.paidTime || `${bill.periodYear}-${String(bill.periodMonth).padStart(2, '0')}-15 10:30:00`,
    operatorId: idx % 2 === 0 ? undefined : 1,
    tradeNo: idx % 2 === 0 ? `T${Date.now()}${idx}` : undefined,
    createTime: bill.paidTime || `${bill.periodYear}-${String(bill.periodMonth).padStart(2, '0')}-15 10:30:00`,
    billNo: bill.billNo,
    houseFullName: bill.houseFullName,
    ownerName: bill.ownerName,
    feeItemName: bill.feeItemName,
    operatorName: idx % 2 === 0 ? undefined : '管理员',
  }));
};

let mockPayments = generateMockPayments();

// 催缴记录
const mockCollections: CollectionRecord[] = [
  { id: 1, projectId: 1, billId: 3, houseId: 3, ownerId: 3, collectionType: 'sms', content: '尊敬的王五业主，您2026年4月的物业费账单已逾期，请尽快缴纳。', result: 'sent', operatorId: 1, createTime: '2026-04-20 09:00:00', billNo: 'BILL202604000003', houseFullName: '1栋1单元201', ownerName: '王五', ownerPhone: '13800000003', operatorName: '系统' },
  { id: 2, projectId: 1, billId: 3, houseId: 3, ownerId: 3, collectionType: 'phone', content: '电话催缴，业主表示下周缴纳。', result: 'promised', operatorId: 1, createTime: '2026-04-25 14:30:00', billNo: 'BILL202604000003', houseFullName: '1栋1单元201', ownerName: '王五', ownerPhone: '13800000003', operatorName: '管理员' },
  { id: 3, projectId: 1, billId: 7, houseId: 7, ownerId: 7, collectionType: 'sms', content: '尊敬的吴九业主，您2026年4月的物业费账单已逾期，请尽快缴纳。', result: 'sent', operatorId: 1, createTime: '2026-04-20 09:00:00', billNo: 'BILL202604000007', houseFullName: '3栋1单元101', ownerName: '吴九', ownerPhone: '13800000007', operatorName: '系统' },
];

// 催缴模板
const mockTemplates: CollectionTemplate[] = [
  { id: 1, projectId: 1, name: '短信催缴模板', type: 'sms', title: '物业费催缴通知', content: '尊敬的{业主姓名}，您位于{房屋名称}的{费用项目}账单（账期：{账期}）已逾期，应缴金额{金额}元，请尽快缴纳。如有疑问请联系物业服务中心。', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
  { id: 2, projectId: 1, name: '微信催缴模板', type: 'wechat', title: '物业费催缴提醒', content: '尊敬的业主，您有一笔物业费账单已逾期，请点击链接查看详情并缴费。', enabled: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
];

// ===== 工具函数 =====
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

let nextFeeItemId = 100;
let nextRuleId = 100;
let nextBillId = 100;
let nextPaymentId = 100;
let nextCollectionId = 100;
let nextTemplateId = 100;

// ===== 费用项目管理 =====
export async function getFeeItems(projectId: number): Promise<FeeItem[]> {
  await delay();
  return mockFeeItems.filter(f => f.projectId === projectId);
}

export async function getFeeItemById(id: number): Promise<FeeItem | null> {
  await delay();
  return mockFeeItems.find(f => f.id === id) || null;
}

export async function createFeeItem(data: Omit<FeeItem, 'id' | 'createTime' | 'updateTime'>): Promise<FeeItem> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const item: FeeItem = { ...data, id: nextFeeItemId++, createTime: now, updateTime: now };
  mockFeeItems.push(item);
  return item;
}

export async function updateFeeItem(id: number, data: Partial<FeeItem>): Promise<FeeItem | null> {
  await delay();
  const idx = mockFeeItems.findIndex(f => f.id === id);
  if (idx === -1) return null;
  mockFeeItems[idx] = { ...mockFeeItems[idx], ...data, updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19) };
  return mockFeeItems[idx];
}

export async function deleteFeeItem(id: number): Promise<boolean> {
  await delay();
  const idx = mockFeeItems.findIndex(f => f.id === id);
  if (idx === -1) return false;
  mockFeeItems.splice(idx, 1);
  return true;
}

// ===== 收费标准管理 =====
export async function getChargeRules(projectId: number): Promise<ChargeRule[]> {
  await delay();
  return mockChargeRules.filter(r => r.projectId === projectId);
}

export async function createChargeRule(data: Omit<ChargeRule, 'id' | 'createTime' | 'updateTime'>): Promise<ChargeRule> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const feeItem = mockFeeItems.find(f => f.id === data.feeItemId);
  const rule: ChargeRule = {
    ...data, id: nextRuleId++, createTime: now, updateTime: now,
    feeItemName: feeItem?.name, feeItemCategory: feeItem?.category,
  };
  mockChargeRules.push(rule);
  return rule;
}

export async function updateChargeRule(id: number, data: Partial<ChargeRule>): Promise<ChargeRule | null> {
  await delay();
  const idx = mockChargeRules.findIndex(r => r.id === id);
  if (idx === -1) return null;
  mockChargeRules[idx] = { ...mockChargeRules[idx], ...data, updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19) };
  return mockChargeRules[idx];
}

export async function deleteChargeRule(id: number): Promise<boolean> {
  await delay();
  const idx = mockChargeRules.findIndex(r => r.id === id);
  if (idx === -1) return false;
  mockChargeRules.splice(idx, 1);
  return true;
}

// ===== 账单管理 =====
export async function getBills(params: BillQueryParams): Promise<{ list: Bill[]; total: number }> {
  await delay();
  let filtered = mockBills.filter(b => b.projectId === params.projectId);
  if (params.periodYear) filtered = filtered.filter(b => b.periodYear === params.periodYear);
  if (params.periodMonth) filtered = filtered.filter(b => b.periodMonth === params.periodMonth);
  if (params.buildingId) filtered = filtered.filter(b => b.buildingName?.includes(String(params.buildingId)));
  if (params.status) filtered = filtered.filter(b => b.status === params.status);
  if (params.feeItemId) filtered = filtered.filter(b => b.feeItemId === params.feeItemId);
  if (params.keyword) filtered = filtered.filter(b =>
    (b.ownerName && b.ownerName.includes(params.keyword!)) ||
    (b.houseFullName && b.houseFullName.includes(params.keyword!)) ||
    b.billNo.includes(params.keyword!)
  );
  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  const list = filtered.slice(start, start + params.pageSize);
  return { list, total };
}

export async function getBillById(id: number): Promise<Bill | null> {
  await delay();
  return mockBills.find(b => b.id === id) || null;
}

export async function generateBills(params: BillGenerateParams): Promise<Bill[]> {
  await delay();
  const newBills: Bill[] = [];
  const houses = params.houseIds?.length
    ? mockSimpleHouses.filter(h => params.houseIds!.includes(h.id))
    : params.buildingIds?.length
      ? mockSimpleHouses.filter(h => params.buildingIds!.includes(h.buildingId))
      : mockSimpleHouses;

  for (const house of houses) {
    for (const feeItemId of params.feeItemIds) {
      const rule = mockChargeRules.find(r => r.feeItemId === feeItemId && r.houseType === house.houseType);
      if (!rule) continue;
      const exists = mockBills.some(b =>
        b.houseId === house.id && b.feeItemId === feeItemId &&
        b.periodYear === params.periodYear && b.periodMonth === params.periodMonth
      );
      if (exists) continue;

      let amount = 0;
      if (rule.pricingMode === 'area') amount = parseFloat((house.area * rule.price).toFixed(2));
      else if (rule.pricingMode === 'fixed') amount = rule.price;
      else if (rule.pricingMode === 'household') amount = rule.price;

      const bill: Bill = {
        id: nextBillId++,
        projectId: params.projectId,
        billNo: `BILL${params.periodYear}${String(params.periodMonth).padStart(2, '0')}${String(nextBillId).padStart(6, '0')}`,
        houseId: house.id,
        ownerId: house.ownerId,
        feeItemId,
        periodYear: params.periodYear,
        periodMonth: params.periodMonth,
        amount,
        paidAmount: 0,
        discountAmount: 0,
        lateFee: 0,
        status: 'pending',
        dueDate: `${params.periodYear}-${String(params.periodMonth).padStart(2, '0')}-30`,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        houseFullName: house.fullName,
        ownerName: house.ownerName,
        ownerPhone: house.ownerPhone,
        feeItemName: rule.feeItemName,
        feeItemCategory: rule.feeItemCategory,
        buildingName: house.buildingName,
      };
      mockBills.push(bill);
      newBills.push(bill);
    }
  }
  return newBills;
}

export async function adjustBill(data: BillAdjustData): Promise<Bill | null> {
  await delay();
  const bill = mockBills.find(b => b.id === data.id);
  if (!bill) return null;
  if (data.adjustType === 'discount') {
    bill.discountAmount += data.amount;
    bill.amount = Math.max(0, bill.amount - data.amount);
  } else if (data.adjustType === 'late_fee') {
    bill.lateFee += data.amount;
  } else if (data.adjustType === 'write_off') {
    bill.status = 'cancelled';
  }
  bill.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return bill;
}

export async function cancelBill(id: number): Promise<boolean> {
  await delay();
  const bill = mockBills.find(b => b.id === id);
  if (!bill) return false;
  bill.status = 'cancelled';
  bill.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return true;
}

// ===== 缴费管理 =====
export async function getPayments(params: PaymentQueryParams): Promise<{ list: PaymentRecord[]; total: number }> {
  await delay();
  let filtered = mockPayments.filter(p => p.projectId === params.projectId);
  if (params.payMethod) filtered = filtered.filter(p => p.payMethod === params.payMethod);
  if (params.startDate) filtered = filtered.filter(p => p.payTime >= params.startDate!);
  if (params.endDate) filtered = filtered.filter(p => p.payTime <= params.endDate! + ' 23:59:59');
  if (params.keyword) filtered = filtered.filter(p =>
    (p.ownerName && p.ownerName.includes(params.keyword!)) ||
    (p.houseFullName && p.houseFullName.includes(params.keyword!)) ||
    p.paymentNo.includes(params.keyword!)
  );
  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  return { list: filtered.slice(start, start + params.pageSize), total };
}

export async function createOfflinePayment(data: OfflinePaymentData): Promise<PaymentRecord[]> {
  await delay();
  const records: PaymentRecord[] = [];
  for (const billId of data.billIds) {
    const bill = mockBills.find(b => b.id === billId);
    if (!bill) continue;
    bill.paidAmount += data.payAmount / data.billIds.length;
    bill.status = bill.paidAmount >= bill.amount ? 'paid' : 'partially_paid';
    bill.paidTime = data.payTime;
    const record: PaymentRecord = {
      id: nextPaymentId++,
      projectId: 1,
      billId,
      paymentNo: `PAY${Date.now()}${nextPaymentId}`,
      payMethod: data.payMethod,
      payAmount: data.payAmount / data.billIds.length,
      payTime: data.payTime,
      operatorId: 1,
      remark: data.remark,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      billNo: bill.billNo,
      houseFullName: bill.houseFullName,
      ownerName: bill.ownerName,
      feeItemName: bill.feeItemName,
      operatorName: '管理员',
    };
    mockPayments.push(record);
    records.push(record);
  }
  return records;
}

// ===== 催缴管理 =====
export async function getCollections(params: CollectionQueryParams): Promise<{ list: CollectionRecord[]; total: number }> {
  await delay();
  let filtered = mockCollections.filter(c => c.projectId === params.projectId);
  if (params.buildingId) filtered = filtered.filter(c => c.houseId === params.buildingId);
  if (params.keyword) filtered = filtered.filter(c =>
    (c.ownerName && c.ownerName.includes(params.keyword!)) ||
    (c.houseFullName && c.houseFullName.includes(params.keyword!))
  );
  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  return { list: filtered.slice(start, start + params.pageSize), total };
}

export async function getOverdueBills(projectId: number): Promise<Bill[]> {
  await delay();
  return mockBills.filter(b => b.projectId === projectId && b.status === 'overdue');
}

export async function sendCollection(billId: number, type: CollectionRecord['collectionType']): Promise<CollectionRecord> {
  await delay();
  const bill = mockBills.find(b => b.id === billId);
  const record: CollectionRecord = {
    id: nextCollectionId++,
    projectId: 1,
    billId,
    houseId: bill?.houseId || 0,
    ownerId: bill?.ownerId,
    collectionType: type,
    content: `催缴通知：${bill?.feeItemName}账单${bill?.billNo}已逾期，请尽快缴纳。`,
    result: 'sent',
    operatorId: 1,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    billNo: bill?.billNo,
    houseFullName: bill?.houseFullName,
    ownerName: bill?.ownerName,
    ownerPhone: bill?.ownerPhone,
    operatorName: '管理员',
  };
  mockCollections.push(record);
  return record;
}

// ===== 催缴模板 =====
export async function getCollectionTemplates(projectId: number): Promise<CollectionTemplate[]> {
  await delay();
  return mockTemplates.filter(t => t.projectId === projectId);
}

export async function saveCollectionTemplate(data: Omit<CollectionTemplate, 'id' | 'createTime' | 'updateTime'>): Promise<CollectionTemplate> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const template: CollectionTemplate = { ...data, id: nextTemplateId++, createTime: now, updateTime: now };
  mockTemplates.push(template);
  return template;
}

// ===== 收费报表 =====
export async function getFeeStatistics(projectId: number): Promise<FeeStatistics> {
  await delay();
  const bills = mockBills.filter(b => b.projectId === projectId);
  const totalReceivable = bills.reduce((s, b) => s + b.amount, 0);
  const totalReceived = bills.reduce((s, b) => s + b.paidAmount, 0);
  const totalArrears = totalReceivable - totalReceived;
  const collectionRate = totalReceivable > 0 ? parseFloat((totalReceived / totalReceivable * 100).toFixed(1)) : 0;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthBills = bills.filter(b => b.periodYear === currentYear && b.periodMonth === currentMonth);
  const monthReceivable = monthBills.reduce((s, b) => s + b.amount, 0);
  const monthReceived = monthBills.reduce((s, b) => s + b.paidAmount, 0);
  const monthCollectionRate = monthReceivable > 0 ? parseFloat((monthReceived / monthReceivable * 100).toFixed(1)) : 0;

  return {
    totalReceivable, totalReceived, totalArrears, collectionRate,
    monthReceivable, monthReceived, monthCollectionRate,
    overdueCount: bills.filter(b => b.status === 'overdue').length,
    totalBills: bills.length,
    paidBills: bills.filter(b => b.status === 'paid').length,
  };
}

export async function getBuildingFeeSummary(projectId: number): Promise<BuildingFeeSummary[]> {
  await delay();
  const bills = mockBills.filter(b => b.projectId === projectId);
  const buildingMap = new Map<string, BuildingFeeSummary>();
  for (const bill of bills) {
    const key = bill.buildingName || '未知';
    if (!buildingMap.has(key)) {
      buildingMap.set(key, { buildingId: 0, buildingName: key, totalHouses: 0, receivable: 0, received: 0, arrears: 0, collectionRate: 0 });
    }
    const summary = buildingMap.get(key)!;
    summary.receivable += bill.amount;
    summary.received += bill.paidAmount;
  }
  const result = Array.from(buildingMap.values());
  result.forEach(s => {
    s.arrears = parseFloat((s.receivable - s.received).toFixed(2));
    s.collectionRate = s.receivable > 0 ? parseFloat((s.received / s.receivable * 100).toFixed(1)) : 0;
  });
  return result;
}

export async function getFeeTrend(projectId: number, year: number): Promise<FeeTrendPoint[]> {
  await delay();
  const bills = mockBills.filter(b => b.projectId === projectId && b.periodYear === year);
  const points: FeeTrendPoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const monthBills = bills.filter(b => b.periodMonth === m);
    const receivable = monthBills.reduce((s, b) => s + b.amount, 0);
    const received = monthBills.reduce((s, b) => s + b.paidAmount, 0);
    const collectionRate = receivable > 0 ? parseFloat((received / receivable * 100).toFixed(1)) : 0;
    points.push({
      month: `${m}月`,
      receivable: parseFloat(receivable.toFixed(2)),
      received: parseFloat(received.toFixed(2)),
      collectionRate,
    });
  }
  return points;
}