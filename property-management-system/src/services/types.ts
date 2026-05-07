// ===== 类型定义 =====
export {};

// 组织类型
export type OrgType = 'city' | 'area' | 'street' | 'company' | 'project' | 'shop';

// 端口类型
export type PortType = 'government' | 'property' | 'merchant' | 'owner' | 'wechat' | 'superadmin';

// 用户状态
export type UserStatus = 0 | 1; // 0=禁用 1=启用

// 员工状态
export type EmployeeStatus = 'active' | 'resigned' | 'leave';

// 员工档案
export interface EmployeeProfile {
  id: number;
  userId: number | null;       // 关联的账号ID（可选，支持无账号员工）
  employeeNo: string;          // 员工编号
  realName: string;            // 姓名
  phone: string;               // 手机号
  department: string;          // 所属部门
  position: string;            // 岗位
  entryDate: string;           // 入职日期
  skillTags: string[];         // 技能标签
  canSchedule: boolean;        // 是否参与值班排班
  status: EmployeeStatus;      // 状态
  createdAt: string;
  updatedAt: string;
}

// 组织
export interface Organization {
  id: number;
  parentId: number | null;
  orgType: OrgType;
  name: string;
  code: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  sortOrder: number;
  status: UserStatus;
  children?: Organization[];
}

// 角色
export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  portType: PortType;
  description: string;
  status: UserStatus;
  permissions: string[]; // 权限编码列表
}

// 用户
export interface User {
  id: number;
  phone: string;
  password: string;
  realName: string;
  avatar?: string;
  wechatOpenid?: string;
  status: UserStatus;
  portType: PortType; // 所属端类型：government/property/merchant/owner/wechat
  manageProjectIds?: number[]; // 可管理的小区项目ID列表（空数组表示无限制）
  createTime: string;
}

// 用户角色关联
export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  orgId: number; // 所属组织ID（数据范围）
  portType: PortType; // 所属端类型
  role?: Role;
  org?: Organization;
}

// 用户完整信息（含角色）
export interface UserWithRoles extends User {
  roles: UserRole[];
}

// 登录请求
export interface LoginRequest {
  phone: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: UserWithRoles;
}

// 当前登录用户信息（含当前选中的角色）
export interface CurrentUser {
  user: User;
  roles: UserRole[];
  currentRole: UserRole | null; // 当前选中的角色
  token: string;
}

// 权限
export interface Permission {
  id: number;
  permCode: string;
  permName: string;
  parentId: number | null;
  path?: string;
  type: 'menu' | 'button' | 'api';
  sortOrder: number;
  children?: Permission[];
}

// 企业资质等级
export type QualLevel = '一级' | '二级' | '三级' | '暂定三级';

// 企业审核状态
export type AuditStatus = 'pending' | 'approved' | 'rejected';

// 物业企业
export interface PropertyCompany {
  id: number;
  companyName: string;
  unifiedCode: string;       // 统一社会信用代码
  legalPerson: string;        // 法定代表人
  registeredCapital: string;  // 注册资本
  qualLevel: QualLevel;       // 资质等级
  qualCertNo: string;         // 资质证书编号
  qualExpireDate: string;     // 资质有效期
  address: string;
  contactPerson: string;
  contactPhone: string;
  businessScope: string;      // 经营范围
  auditStatus: AuditStatus;   // 审核状态
  auditRemark?: string;       // 审核意见
  submitTime: string;         // 提交时间
  auditTime?: string;         // 审核时间
  status: UserStatus;         // 启用状态
}

// 商家
export interface Merchant {
  id: number;
  shopName: string;
  companyName: string;
  unifiedCode: string;
  contactPerson: string;
  contactPhone: string;
  category: string;           // 商家类别：超市/餐饮/家政/维修等
  address: string;
  businessLicense: string;    // 营业执照号
  propertyCompanyId: number;  // 所属物业公司
  propertyCompanyName?: string;
  auditStatus: AuditStatus;
  auditRemark?: string;
  submitTime: string;
  auditTime?: string;
  status: UserStatus;
}

// ===== 报修投诉模块类型 =====

// 报修工单状态
export type RepairStatus = 'pending_assign' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'confirmed' | 'evaluated' | 'closed';

// 报修类型
export type RepairType = 'water' | 'electric' | 'hvac' | 'plumbing' | 'appliance' | 'structure' | 'other';

// 报修紧急程度
export type UrgencyLevel = 'normal' | 'urgent' | 'emergency';

// 报修工单
export interface RepairOrder {
  id: number;
  orderNo: string;            // 工单编号
  ownerName: string;          // 业主姓名
  ownerPhone: string;         // 业主电话
  ownerAddress: string;       // 业主地址（小区+楼栋+房号）
  repairType: RepairType;     // 报修类型
  repairDesc: string;         // 问题描述
  urgency: UrgencyLevel;      // 紧急程度
  status: RepairStatus;       // 工单状态
  images?: string[];          // 现场图片
  propertyCompanyId: number;  // 所属物业公司
  propertyCompanyName?: string;
  assignedTo?: string;        // 指派给（维保人员姓名）
  assignedPhone?: string;     // 维保人员电话
  assignTime?: string;        // 派单时间
  arrivalTime?: string;       // 到场时间
  completeTime?: string;      // 维修完成时间
  confirmTime?: string;       // 业主确认时间
  repairResult?: string;      // 维修结果描述
  cost?: number;              // 维修费用
  chargeType?: 'free' | 'paid'; // 收费类型
  rating?: number;            // 业主评分 1-5
  evaluation?: string;        // 业主评价
  evaluateTime?: string;      // 评价时间
  revisitStatus?: 'pending' | 'completed'; // 回访状态
  revisitRemark?: string;     // 回访记录
  createTime: string;         // 提交时间
  updateTime: string;         // 更新时间
}

// 投诉状态
export type ComplaintStatus = 'pending_accept' | 'accepted' | 'assigned' | 'processing' | 'feedback' | 'revisit_pending' | 'closed';

// 投诉分类
export type ComplaintCategory = 'property_service' | 'noise' | 'parking' | 'security' | 'clean' | 'maintenance' | 'neighbor' | 'other';

// 投诉来源
export type ComplaintSource = 'owner_app' | 'phone' | 'visit' | 'government_transfer' | 'other';

// 投诉
export interface Complaint {
  id: number;
  complaintNo: string;        // 投诉编号
  complainant: string;        // 投诉人
  complainantPhone: string;   // 投诉人电话
  complainantAddress: string; // 投诉人地址
  category: ComplaintCategory; // 投诉分类
  title: string;              // 投诉标题
  content: string;            // 投诉内容
  status: ComplaintStatus;    // 投诉状态
  source: ComplaintSource;    // 投诉来源
  urgency: UrgencyLevel;      // 紧急程度
  images?: string[];          // 附件图片
  propertyCompanyId: number;  // 所属物业公司
  propertyCompanyName?: string;
  // 受理信息
  acceptedBy?: string;        // 受理人
  acceptTime?: string;        // 受理时间
  // 分派信息
  assignedTo?: string;        // 处理人
  assignedToPhone?: string;   // 处理人电话
  assignTime?: string;        // 分派时间
  // 处理信息
  handleResult?: string;      // 处理结果
  handleTime?: string;        // 处理完成时间
  // 反馈信息
  feedbackContent?: string;   // 反馈内容
  feedbackTime?: string;      // 反馈时间
  // 回访信息
  revisitStatus?: 'pending' | 'completed'; // 回访状态
  revisitRemark?: string;     // 回访记录
  revisitTime?: string;       // 回访时间
  satisfaction?: number;      // 满意度评分 1-5
  // 政府督办
  governmentSupervisor?: string;  // 督办人
  governmentRemark?: string;      // 督办意见
  governmentDeadline?: string;    // 督办截止日期
  // 归档
  closeTime?: string;         // 归档时间
  createTime: string;         // 提交时间
  updateTime: string;         // 更新时间
}
