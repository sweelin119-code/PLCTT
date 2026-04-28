import type { PropertyCompany, AuditStatus, QualLevel } from './types';

// ===== 模拟数据 =====
let mockCompanies: PropertyCompany[] = [
  {
    id: 1,
    companyName: '万科物业有限公司',
    unifiedCode: '91440101MA5XXXXXX1',
    legalPerson: '王石',
    registeredCapital: '5000万',
    qualLevel: '一级',
    qualCertNo: 'WY-2024-001',
    qualExpireDate: '2027-12-31',
    address: '深圳市福田区某某路1号',
    contactPerson: '张经理',
    contactPhone: '13800001001',
    businessScope: '物业管理、物业租赁、停车场经营、家政服务',
    auditStatus: 'approved',
    auditRemark: '审核通过',
    submitTime: '2024-01-15 09:00:00',
    auditTime: '2024-01-20 14:30:00',
    status: 1,
  },
  {
    id: 2,
    companyName: '碧桂园生活服务集团',
    unifiedCode: '91440101MA5XXXXXX2',
    legalPerson: '杨国强',
    registeredCapital: '1亿',
    qualLevel: '一级',
    qualCertNo: 'WY-2024-002',
    qualExpireDate: '2028-06-30',
    address: '佛山市顺德区某某路2号',
    contactPerson: '李经理',
    contactPhone: '13800001002',
    businessScope: '物业管理、社区服务、绿化养护、清洁服务',
    auditStatus: 'approved',
    auditRemark: '审核通过',
    submitTime: '2024-02-01 10:00:00',
    auditTime: '2024-02-05 16:00:00',
    status: 1,
  },
  {
    id: 3,
    companyName: '保利物业服务股份有限公司',
    unifiedCode: '91440101MA5XXXXXX3',
    legalPerson: '宋广菊',
    registeredCapital: '8000万',
    qualLevel: '一级',
    qualCertNo: 'WY-2024-003',
    qualExpireDate: '2027-09-30',
    address: '广州市海珠区某某路3号',
    contactPerson: '赵经理',
    contactPhone: '13800001003',
    businessScope: '物业管理、酒店管理、房地产中介',
    auditStatus: 'approved',
    auditRemark: '审核通过',
    submitTime: '2024-03-10 08:30:00',
    auditTime: '2024-03-15 11:00:00',
    status: 1,
  },
  {
    id: 4,
    companyName: '新希望物业服务集团',
    unifiedCode: '91440101MA5XXXXXX4',
    legalPerson: '刘永好',
    registeredCapital: '3000万',
    qualLevel: '二级',
    qualCertNo: 'WY-2024-004',
    qualExpireDate: '2026-12-31',
    address: '成都市锦江区某某路4号',
    contactPerson: '陈经理',
    contactPhone: '13800001004',
    businessScope: '物业管理、家政服务、绿化工程',
    auditStatus: 'pending',
    submitTime: '2024-05-20 14:00:00',
    status: 1,
  },
  {
    id: 5,
    companyName: '龙湖智慧服务有限公司',
    unifiedCode: '91440101MA5XXXXXX5',
    legalPerson: '吴亚军',
    registeredCapital: '6000万',
    qualLevel: '一级',
    qualCertNo: 'WY-2024-005',
    qualExpireDate: '2028-03-31',
    address: '重庆市渝北区某某路5号',
    contactPerson: '刘经理',
    contactPhone: '13800001005',
    businessScope: '物业管理、智慧社区、养老服务',
    auditStatus: 'rejected',
    auditRemark: '资质材料不完整，请补充法人身份证复印件及近三年财务报表',
    submitTime: '2024-06-01 09:30:00',
    auditTime: '2024-06-10 10:00:00',
    status: 1,
  },
];

// ===== 服务方法 =====

// 获取企业列表
export async function getCompanyList(params?: {
  keyword?: string;
  auditStatus?: AuditStatus;
  qualLevel?: QualLevel;
}): Promise<PropertyCompany[]> {
  let result = [...mockCompanies];
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    result = result.filter(c =>
      c.companyName.toLowerCase().includes(kw) ||
      c.unifiedCode.toLowerCase().includes(kw) ||
      c.contactPerson.includes(kw) ||
      c.contactPhone.includes(kw)
    );
  }
  if (params?.auditStatus) {
    result = result.filter(c => c.auditStatus === params.auditStatus);
  }
  if (params?.qualLevel) {
    result = result.filter(c => c.qualLevel === params.qualLevel);
  }
  return result;
}

// 获取企业详情
export async function getCompanyById(id: number): Promise<PropertyCompany | undefined> {
  return mockCompanies.find(c => c.id === id);
}

// 提交企业注册
export async function submitCompanyRegistration(data: {
  companyName: string;
  unifiedCode: string;
  legalPerson: string;
  registeredCapital: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  businessScope: string;
}): Promise<PropertyCompany> {
  const newCompany: PropertyCompany = {
    id: Math.max(...mockCompanies.map(c => c.id)) + 1,
    ...data,
    qualLevel: '暂定三级',
    qualCertNo: '',
    qualExpireDate: '',
    auditStatus: 'pending',
    submitTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    status: 1,
  };
  mockCompanies.push(newCompany);
  return newCompany;
}

// 审核企业
export async function auditCompany(id: number, status: AuditStatus, remark?: string): Promise<void> {
  const company = mockCompanies.find(c => c.id === id);
  if (company) {
    company.auditStatus = status;
    company.auditRemark = remark || '';
    company.auditTime = new Date().toLocaleString('zh-CN', { hour12: false });
  }
}

// 更新企业信息
export async function updateCompany(id: number, data: Partial<PropertyCompany>): Promise<void> {
  const company = mockCompanies.find(c => c.id === id);
  if (company) {
    Object.assign(company, data);
  }
}

// 删除企业
export async function deleteCompany(id: number): Promise<void> {
  mockCompanies = mockCompanies.filter(c => c.id !== id);
}
