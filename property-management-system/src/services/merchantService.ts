import type { Merchant, AuditStatus } from './types';

// ===== 模拟数据 =====
let mockMerchants: Merchant[] = [
  {
    id: 1,
    shopName: '好邻居超市（万科店）',
    companyName: '好邻居连锁超市有限公司',
    unifiedCode: '91440101MA5XXXXXA1',
    contactPerson: '陈店长',
    contactPhone: '13800002001',
    category: '超市',
    address: '深圳市福田区万科城市花园1栋101',
    businessLicense: '91440101MA5XXXXXA1-1',
    propertyCompanyId: 1,
    propertyCompanyName: '万科物业有限公司',
    auditStatus: 'approved',
    submitTime: '2024-03-01 09:00:00',
    auditTime: '2024-03-05 14:00:00',
    status: 1,
  },
  {
    id: 2,
    shopName: '美味轩餐厅（碧桂园店）',
    companyName: '美味轩餐饮管理有限公司',
    unifiedCode: '91440101MA5XXXXXA2',
    contactPerson: '李老板',
    contactPhone: '13800002002',
    category: '餐饮',
    address: '佛山市顺德区碧桂园花园路8号',
    businessLicense: '91440101MA5XXXXXA2-1',
    propertyCompanyId: 2,
    propertyCompanyName: '碧桂园生活服务集团',
    auditStatus: 'approved',
    submitTime: '2024-03-10 10:00:00',
    auditTime: '2024-03-12 16:00:00',
    status: 1,
  },
  {
    id: 3,
    shopName: '顺丰快递（保利服务点）',
    companyName: '顺丰速运有限公司',
    unifiedCode: '91440101MA5XXXXXA3',
    contactPerson: '王站长',
    contactPhone: '13800002003',
    category: '快递',
    address: '广州市海珠区保利花园3栋102',
    businessLicense: '91440101MA5XXXXXA3-1',
    propertyCompanyId: 3,
    propertyCompanyName: '保利物业服务股份有限公司',
    auditStatus: 'approved',
    submitTime: '2024-04-01 08:30:00',
    auditTime: '2024-04-03 11:00:00',
    status: 1,
  },
  {
    id: 4,
    shopName: '家佳乐家政服务中心',
    companyName: '家佳乐家政服务有限公司',
    unifiedCode: '91440101MA5XXXXXA4',
    contactPerson: '张经理',
    contactPhone: '13800002004',
    category: '家政',
    address: '成都市锦江区龙湖花园5栋201',
    businessLicense: '91440101MA5XXXXXA4-1',
    propertyCompanyId: 5,
    propertyCompanyName: '龙湖智慧服务有限公司',
    auditStatus: 'pending',
    submitTime: '2024-06-15 14:00:00',
    status: 1,
  },
  {
    id: 5,
    shopName: '便民维修服务中心',
    companyName: '便民维修服务有限公司',
    unifiedCode: '91440101MA5XXXXXA5',
    contactPerson: '刘师傅',
    contactPhone: '13800002005',
    category: '维修',
    address: '深圳市福田区万科城市花园2栋103',
    businessLicense: '91440101MA5XXXXXA5-1',
    propertyCompanyId: 1,
    propertyCompanyName: '万科物业有限公司',
    auditStatus: 'rejected',
    auditRemark: '营业执照信息不清晰，请重新上传',
    submitTime: '2024-06-10 09:30:00',
    auditTime: '2024-06-12 10:00:00',
    status: 1,
  },
];

// ===== 服务方法 =====

// 获取商家列表
export async function getMerchantList(params?: {
  keyword?: string;
  auditStatus?: AuditStatus;
  propertyCompanyId?: number;
  category?: string;
}): Promise<Merchant[]> {
  let result = [...mockMerchants];
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    result = result.filter(m =>
      m.shopName.toLowerCase().includes(kw) ||
      m.companyName.toLowerCase().includes(kw) ||
      m.contactPerson.includes(kw) ||
      m.contactPhone.includes(kw)
    );
  }
  if (params?.auditStatus) {
    result = result.filter(m => m.auditStatus === params.auditStatus);
  }
  if (params?.propertyCompanyId) {
    result = result.filter(m => m.propertyCompanyId === params.propertyCompanyId);
  }
  if (params?.category) {
    result = result.filter(m => m.category === params.category);
  }
  return result;
}

// 获取商家详情
export async function getMerchantById(id: number): Promise<Merchant | undefined> {
  return mockMerchants.find(m => m.id === id);
}

// 创建商家
export async function createMerchant(data: {
  shopName: string;
  companyName: string;
  unifiedCode: string;
  contactPerson: string;
  contactPhone: string;
  category: string;
  address: string;
  businessLicense: string;
  propertyCompanyId: number;
  propertyCompanyName?: string;
}): Promise<Merchant> {
  const newMerchant: Merchant = {
    id: Math.max(...mockMerchants.map(m => m.id), 0) + 1,
    ...data,
    auditStatus: 'pending',
    submitTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    status: 1,
  };
  mockMerchants.push(newMerchant);
  return newMerchant;
}

// 更新商家
export async function updateMerchant(id: number, data: Partial<Merchant>): Promise<void> {
  const merchant = mockMerchants.find(m => m.id === id);
  if (merchant) {
    Object.assign(merchant, data);
  }
}

// 删除商家
export async function deleteMerchant(id: number): Promise<void> {
  mockMerchants = mockMerchants.filter(m => m.id !== id);
}

// 审核商家
export async function auditMerchant(id: number, status: AuditStatus, remark?: string): Promise<void> {
  const merchant = mockMerchants.find(m => m.id === id);
  if (merchant) {
    merchant.auditStatus = status;
    merchant.auditRemark = remark || '';
    merchant.auditTime = new Date().toLocaleString('zh-CN', { hour12: false });
  }
}

// 获取商家类别列表
export async function getMerchantCategories(): Promise<string[]> {
  return ['超市', '餐饮', '家政', '维修', '快递', '美容', '教育', '医疗', '其他'];
}
