// ===== 业委会端 服务层 =====
// 提供业委会工作台、成员管理、会议管理、业主大会、维修资金审核、
// 物业协同监督、公告发布、业主沟通、档案管理、系统管理等功能 API
// 当前使用 Mock 数据，后续对接真实后端

// ===== 类型定义 =====

// 业委会成员
export interface CommitteeMember {
  id: string;
  name: string;
  position: 'director' | 'vice_director' | 'member' | 'alternate';
  houseId: string;
  building: string;
  unit: string;
  phone: string;
  termStart: string;
  termEnd: string;
  status: 'active' | 'resigned';
  attendance: number;
}

// 会议
export interface Meeting {
  id: string;
  title: string;
  type: 'regular' | 'extraordinary' | 'urgent';
  startTime: string;
  endTime?: string;
  location: string;
  agenda: string[];
  materials: string[];
  attendees: string[];
  signInRecords: SignInRecord[];
  minutes?: MeetingMinutes;
  status: 'pending' | 'in_progress' | 'ended';
}

export interface SignInRecord {
  memberId: string;
  signInTime: string;
  method: 'qr_code' | 'manual';
}

export interface MeetingMinutes {
  content: string;
  resolutions: string[];
  actionItems: ActionItem[];
  confirmedBy: string[];
  createdAt: string;
}

export interface ActionItem {
  content: string;
  assignee: string;
  deadline: string;
  status: 'pending' | 'completed';
}

// 维修资金审核
export interface MaintenanceFundApplication {
  id: string;
  communityId: string;
  title: string;
  description: string;
  budgetAmount: number;
  quotations: Quotation[];
  constructionPlan: string;
  ownerOpinionResult: string;
  urgency: 'normal' | 'urgent';
  status: 'pending_review' | 'approved' | 'rejected' | 'supplement';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface Quotation {
  companyName: string;
  amount: number;
  contact: string;
  phone: string;
}

// 物业报告
export interface PropertyReport {
  id: string;
  type: 'monthly' | 'quarterly' | 'annual';
  title: string;
  period: string;
  content: string;
  status: 'submitted' | 'reviewed';
  submittedAt: string;
  reviewedBy?: string;
  reviewComment?: string;
}

// 业主大会
export interface GeneralAssembly {
  id: string;
  title: string;
  type: 'annual' | 'extraordinary' | 'special_vote';
  topics: AssemblyTopic[];
  voteStartTime: string;
  voteEndTime: string;
  status: 'pending' | 'active' | 'ended';
  result?: AssemblyResult;
}

export interface AssemblyTopic {
  id: string;
  title: string;
  description: string;
  options: string[];
  voteType: 'single' | 'multiple';
  passThreshold: number;
  result?: {
    optionVotes: number[];
    totalVotes: number;
    passed: boolean;
  };
}

export interface AssemblyResult {
  totalVoters: number;
  votedCount: number;
  voterRate: number;
  topics: AssemblyTopic[];
  published: boolean;
}

// 公告
export interface CommitteeNotice {
  id: string;
  title: string;
  type: 'committee' | 'assembly' | 'publicity' | 'notice';
  content: string;
  attachments: string[];
  scope: 'all' | 'building';
  scopeValue?: string;
  isTop: boolean;
  status: 'draft' | 'published' | 'scheduled';
  publishTime: string;
  readCount: number;
  totalTarget: number;
  createdBy: string;
  createdAt: string;
}

// 业主沟通 - 意见征集
export interface OpinionPoll {
  id: string;
  title: string;
  description: string;
  deadline: string;
  options: string[];
  results: { option: string; count: number }[];
  status: 'active' | 'ended';
  createdAt: string;
}

// 业主沟通 - 提问
export interface OwnerQuestion {
  id: string;
  ownerName: string;
  houseAddress: string;
  content: string;
  reply?: string;
  repliedBy?: string;
  repliedAt?: string;
  status: 'pending' | 'replied';
  createdAt: string;
}

// 满意度调查
export interface SatisfactionSurvey {
  id: string;
  title: string;
  questions: SurveyQuestion[];
  status: 'draft' | 'active' | 'ended';
  responses: number;
  createdAt: string;
}

export interface SurveyQuestion {
  id: string;
  content: string;
  type: 'rating' | 'choice' | 'text';
  options?: string[];
}

// 档案管理
export interface ArchiveFile {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  uploader: string;
  uploadedAt: string;
  permission: 'public' | 'internal' | 'confidential';
}

// 档案分类
export interface ArchiveCategory {
  key: string;
  label: string;
  children?: ArchiveCategory[];
}

// 操作日志
export interface OperationLog {
  id: string;
  operator: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
  createdAt: string;
}

// 工作台统计数据
export interface DashboardStats {
  pendingFundReviews: number;
  pendingComplaints: number;
  pendingReports: number;
  pendingMinutes: number;
  monthlyComplaints: number;
  serviceScore: number;
  fundBalance: number;
  satisfaction: number;
}

// 物业服务质量评分
export interface ServiceScoreItem {
  dimension: string;
  score: number;
  fullScore: number;
}

// 公共收益公示
export interface PublicRevenue {
  item: string;
  amount: number;
  period: string;
  remark: string;
}

// 协同工作 - 发函
export interface CoordinationLetter {
  id: string;
  title: string;
  content: string;
  to: string;
  reply?: string;
  repliedAt?: string;
  status: 'sent' | 'replied';
  createdAt: string;
  createdBy: string;
}

// 换届记录
export interface TermChangeRecord {
  id: string;
  changeDate: string;
  previousDirector: string;
  newDirector: string;
  members: string[];
  description: string;
}

// ===== Mock 数据 =====

const mockMembers: CommitteeMember[] = [
  { id: '1', name: '张建国', position: 'director', houseId: '1', building: '3栋', unit: '1单元', phone: '13800138001', termStart: '2024-01-01', termEnd: '2029-01-01', status: 'active', attendance: 95 },
  { id: '2', name: '李明华', position: 'vice_director', houseId: '2', building: '5栋', unit: '2单元', phone: '13800138002', termStart: '2024-01-01', termEnd: '2029-01-01', status: 'active', attendance: 88 },
  { id: '3', name: '王淑芳', position: 'member', houseId: '3', building: '1栋', unit: '3单元', phone: '13800138003', termStart: '2024-01-01', termEnd: '2029-01-01', status: 'active', attendance: 92 },
  { id: '4', name: '赵德明', position: 'member', houseId: '4', building: '2栋', unit: '1单元', phone: '13800138004', termStart: '2024-01-01', termEnd: '2029-01-01', status: 'active', attendance: 78 },
  { id: '5', name: '刘美琴', position: 'alternate', houseId: '5', building: '6栋', unit: '2单元', phone: '13800138005', termStart: '2024-01-01', termEnd: '2029-01-01', status: 'active', attendance: 85 },
  { id: '6', name: '陈伟', position: 'member', houseId: '6', building: '4栋', unit: '1单元', phone: '13800138006', termStart: '2024-01-01', termEnd: '2029-01-01', status: 'resigned', attendance: 60 },
];

const mockMeetings: Meeting[] = [
  {
    id: '1', title: '2026年5月业委会例会', type: 'regular',
    startTime: '2026-05-10 14:00', endTime: '2026-05-10 16:30',
    location: '业委会会议室',
    agenda: ['审议物业月度工作报告', '讨论小区绿化改造方案', '业主投诉处理情况通报'],
    materials: ['物业月度报告.pdf', '绿化改造方案.pdf'],
    attendees: ['1', '2', '3', '4', '5'],
    signInRecords: [
      { memberId: '1', signInTime: '2026-05-10 13:55', method: 'manual' },
      { memberId: '2', signInTime: '2026-05-10 14:00', method: 'manual' },
      { memberId: '3', signInTime: '2026-05-10 14:02', method: 'manual' },
    ],
    minutes: {
      content: '<p>本次会议主要讨论了以下事项：</p><p>1. 物业月度工作报告审议通过</p><p>2. 绿化改造方案需进一步优化</p><p>3. 投诉处理情况总体良好</p>',
      resolutions: ['通过物业月度工作报告', '绿化改造方案修改后下次会议再审'],
      actionItems: [
        { content: '修改绿化改造方案', assignee: '李明华', deadline: '2026-05-20', status: 'pending' },
        { content: '整理业主投诉数据', assignee: '王淑芳', deadline: '2026-05-15', status: 'completed' },
      ],
      confirmedBy: ['1', '2', '3'],
      createdAt: '2026-05-10 16:30',
    },
    status: 'ended',
  },
  {
    id: '2', title: '维修资金使用专题会议', type: 'extraordinary',
    startTime: '2026-05-15 09:30',
    location: '业委会会议室',
    agenda: ['讨论电梯维修资金使用方案', '审议报价对比'],
    materials: ['电梯维修报价单.pdf', '维修方案.pdf'],
    attendees: ['1', '2', '3'],
    signInRecords: [],
    status: 'pending',
  },
  {
    id: '3', title: '紧急会议：小区供水故障', type: 'urgent',
    startTime: '2026-05-03 10:00', endTime: '2026-05-03 11:00',
    location: '线上会议',
    agenda: ['供水故障情况通报', '应急处理方案', '业主通知方案'],
    materials: [],
    attendees: ['1', '2', '3', '4'],
    signInRecords: [
      { memberId: '1', signInTime: '2026-05-03 10:00', method: 'manual' },
      { memberId: '2', signInTime: '2026-05-03 10:05', method: 'manual' },
      { memberId: '3', signInTime: '2026-05-03 10:02', method: 'manual' },
      { memberId: '4', signInTime: '2026-05-03 10:10', method: 'manual' },
    ],
    minutes: {
      content: '<p>紧急会议决定：</p><p>1. 立即启动应急供水方案</p><p>2. 物业24小时内完成维修</p><p>3. 通过公告和微信群通知业主</p>',
      resolutions: ['启动应急供水', '物业24小时完成维修'],
      actionItems: [
        { content: '联系供水维修单位', assignee: '物业工程部', deadline: '2026-05-03 12:00', status: 'completed' },
        { content: '发布停水通知', assignee: '张建国', deadline: '2026-05-03 11:00', status: 'completed' },
      ],
      confirmedBy: ['1', '2', '3', '4'],
      createdAt: '2026-05-03 11:00',
    },
    status: 'ended',
  },
];

const mockFundApplications: MaintenanceFundApplication[] = [
  {
    id: '1', communityId: '1', title: '3栋电梯维修资金申请', description: '3栋1单元电梯钢丝绳磨损严重，需更换钢丝绳及维修',
    budgetAmount: 85000, urgency: 'urgent',
    quotations: [
      { companyName: '迅达电梯维修公司', amount: 85000, contact: '王工', phone: '13900139001' },
      { companyName: '通力电梯服务公司', amount: 92000, contact: '李工', phone: '13900139002' },
      { companyName: '日立电梯维修公司', amount: 78000, contact: '张工', phone: '13900139003' },
    ],
    constructionPlan: '电梯维修方案.pdf',
    ownerOpinionResult: '相关业主 32 户，同意 28 户（87.5%）',
    status: 'pending_review',
    submittedBy: '物业工程部 - 王工',
    submittedAt: '2026-05-01 10:00',
  },
  {
    id: '2', communityId: '1', title: '小区监控系统升级', description: '小区监控系统使用已超5年，需升级为高清数字监控系统',
    budgetAmount: 120000, urgency: 'normal',
    quotations: [
      { companyName: '海康威视代理商', amount: 120000, contact: '陈经理', phone: '13700137001' },
      { companyName: '大华科技', amount: 135000, contact: '刘经理', phone: '13700137002' },
    ],
    constructionPlan: '监控升级方案.pdf',
    ownerOpinionResult: '全体业主意见征集中',
    status: 'supplement',
    submittedBy: '物业经理 - 赵经理',
    submittedAt: '2026-04-25 14:00',
    reviewComment: '请补充至少3家报价对比',
  },
  {
    id: '3', communityId: '1', title: '小区大门道闸维修', description: '东门道闸故障，需更换电机和控制主板',
    budgetAmount: 15000, urgency: 'normal',
    quotations: [
      { companyName: '道闸维修公司', amount: 15000, contact: '周工', phone: '13600136001' },
      { companyName: '智能安防科技', amount: 18000, contact: '吴工', phone: '13600136002' },
      { companyName: '门禁系统公司', amount: 16000, contact: '郑工', phone: '13600136003' },
    ],
    constructionPlan: '道闸维修方案.pdf',
    ownerOpinionResult: '无需征集（单笔≤5万元）',
    status: 'approved',
    submittedBy: '物业工程部 - 王工',
    submittedAt: '2026-04-20 09:00',
    reviewedBy: '张建国',
    reviewedAt: '2026-04-22 15:00',
    reviewComment: '审核通过，请提交政府备案',
  },
];

const mockReports: PropertyReport[] = [
  { id: '1', type: 'monthly', title: '2026年4月物业工作报告', period: '2026-04', content: '物业月度报告_202604.pdf', status: 'submitted', submittedAt: '2026-05-01 09:00' },
  { id: '2', type: 'monthly', title: '2026年3月物业工作报告', period: '2026-03', content: '物业月度报告_202603.pdf', status: 'reviewed', submittedAt: '2026-04-01 09:00', reviewedBy: '张建国', reviewComment: '报告内容详实，建议加强绿化养护' },
  { id: '3', type: 'quarterly', title: '2026年第一季度服务报告', period: '2026-Q1', content: '物业季度报告_2026Q1.pdf', status: 'reviewed', submittedAt: '2026-04-05 09:00', reviewedBy: '李明华', reviewComment: '服务质量总体良好' },
];

const mockAssemblies: GeneralAssembly[] = [
  {
    id: '1', title: '2026年第一次业主大会', type: 'annual',
    topics: [
      { id: 't1', title: '审议2025年物业工作报告', description: '由物业公司汇报2025年度工作情况', options: ['同意', '不同意', '弃权'], voteType: 'single', passThreshold: 0.5 },
      { id: 't2', title: '选举新一届业委会成员', description: '从候选人中选举产生新一届业委会', options: ['张建国', '李明华', '王淑芳', '赵德明', '刘美琴'], voteType: 'multiple', passThreshold: 0.5 },
    ],
    voteStartTime: '2026-03-01 00:00', voteEndTime: '2026-03-15 23:59',
    status: 'ended',
    result: {
      totalVoters: 500, votedCount: 423, voterRate: 84.6,
      topics: [
        { id: 't1', title: '审议2025年物业工作报告', description: '', options: ['同意', '不同意', '弃权'], voteType: 'single', passThreshold: 0.5, result: { optionVotes: [380, 25, 18], totalVotes: 423, passed: true } },
        { id: 't2', title: '选举新一届业委会成员', description: '', options: ['张建国', '李明华', '王淑芳', '赵德明', '刘美琴'], voteType: 'multiple', passThreshold: 0.5, result: { optionVotes: [398, 356, 312, 278, 245], totalVotes: 423, passed: true } },
      ],
      published: true,
    },
  },
  {
    id: '2', title: '关于小区绿化改造方案表决', type: 'special_vote',
    topics: [
      { id: 't3', title: '是否同意绿化改造方案', description: '方案预算 35 万元，由公共收益支出', options: ['同意', '不同意', '弃权'], voteType: 'single', passThreshold: 0.667 },
    ],
    voteStartTime: '2026-05-20 00:00', voteEndTime: '2026-06-05 23:59',
    status: 'active',
  },
];

const mockNotices: CommitteeNotice[] = [
  { id: '1', title: '关于召开2026年第一次业主大会的公告', type: 'assembly', content: '<p>全体业主：</p><p>经业委会研究决定，定于2026年3月1日至15日召开2026年第一次业主大会...</p>', attachments: [], scope: 'all', isTop: true, status: 'published', publishTime: '2026-02-20 10:00', readCount: 356, totalTarget: 500, createdBy: '张建国', createdAt: '2026-02-20 09:00' },
  { id: '2', title: '2026年4月公共收益公示', type: 'publicity', content: '<p>现将2026年4月小区公共收益情况公示如下：</p><p>电梯广告收入：25,000元</p><p>临时停车收入：8,500元</p><p>场地租赁收入：12,000元</p>', attachments: ['公共收益明细_202604.pdf'], scope: 'all', isTop: false, status: 'published', publishTime: '2026-05-05 09:00', readCount: 128, totalTarget: 500, createdBy: '李明华', createdAt: '2026-05-04 16:00' },
  { id: '3', title: '关于小区绿化改造征求意见的通知', type: 'notice', content: '<p>各位业主：</p><p>业委会拟对小区绿化进行升级改造，现面向全体业主征求意见...</p>', attachments: [], scope: 'all', isTop: false, status: 'published', publishTime: '2026-04-28 14:00', readCount: 203, totalTarget: 500, createdBy: '王淑芳', createdAt: '2026-04-27 11:00' },
  { id: '4', title: '业委会2026年5月工作计划', type: 'committee', content: '<p>业委会2026年5月工作计划安排如下：</p><p>1. 完成绿化改造方案修订</p><p>2. 组织业主满意度调查</p><p>3. 审核维修资金申请</p>', attachments: [], scope: 'all', isTop: false, status: 'draft', publishTime: '', readCount: 0, totalTarget: 500, createdBy: '张建国', createdAt: '2026-05-05 08:00' },
];

const mockOpinionPolls: OpinionPoll[] = [
  { id: '1', title: '小区绿化改造方案意见征集', description: '请对绿化改造方案提出您的宝贵意见', deadline: '2026-05-15', options: ['赞成现有方案', '需要修改', '不赞成'], results: [{ option: '赞成现有方案', count: 156 }, { option: '需要修改', count: 89 }, { option: '不赞成', count: 23 }], status: 'active', createdAt: '2026-04-28' },
  { id: '2', title: '小区停车管理规则修订意见', description: '拟对停车管理规则进行修订，欢迎提出意见', deadline: '2026-05-01', options: ['同意修订', '不同意', '无意见'], results: [{ option: '同意修订', count: 203 }, { option: '不同意', count: 45 }, { option: '无意见', count: 67 }], status: 'ended', createdAt: '2026-04-15' },
];

const mockQuestions: OwnerQuestion[] = [
  { id: '1', ownerName: '王磊', houseAddress: '3栋1单元201室', content: '小区东门车辆识别系统经常识别不到车牌，能否安排维修？', reply: '已联系设备厂家安排检修，预计本周内完成。', repliedBy: '张建国', repliedAt: '2026-05-04 10:00', status: 'replied', createdAt: '2026-05-03 08:00' },
  { id: '2', ownerName: '李芳', houseAddress: '5栋2单元302室', content: '楼下广场舞噪音太大，影响孩子学习，能否协调？', status: 'pending', createdAt: '2026-05-05 07:30' },
  { id: '3', ownerName: '周强', houseAddress: '2栋1单元501室', content: '建议在小区增设电动车充电桩', reply: '已纳入下半年改造计划，感谢您的建议。', repliedBy: '李明华', repliedAt: '2026-04-28 14:00', status: 'replied', createdAt: '2026-04-25 09:00' },
];

const mockSurveys: SatisfactionSurvey[] = [
  {
    id: '1', title: '2026年第一季度业主满意度调查',
    questions: [
      { id: 'q1', content: '您对物业保洁服务是否满意？', type: 'rating' },
      { id: 'q2', content: '您对物业安保服务是否满意？', type: 'rating' },
      { id: 'q3', content: '您对物业维修服务是否满意？', type: 'rating' },
      { id: 'q4', content: '您对小区绿化养护是否满意？', type: 'rating' },
      { id: 'q5', content: '您对业委会工作是否满意？', type: 'rating' },
    ],
    status: 'ended', responses: 312, createdAt: '2026-03-20',
  },
  {
    id: '2', title: '2026年第二季度业主满意度调查',
    questions: [
      { id: 'q6', content: '您对物业保洁服务是否满意？', type: 'rating' },
      { id: 'q7', content: '您对物业安保服务是否满意？', type: 'rating' },
    ],
    status: 'draft', responses: 0, createdAt: '2026-05-01',
  },
];

const mockArchiveCategories: ArchiveCategory[] = [
  {
    key: 'committee', label: '业委会文件',
    children: [
      { key: 'committee_charter', label: '业委会章程' },
      { key: 'committee_election', label: '选举文件' },
      { key: 'committee_minutes', label: '会议纪要' },
      { key: 'committee_report', label: '年度报告' },
    ],
  },
  {
    key: 'property', label: '物业文件',
    children: [
      { key: 'property_contract', label: '物业服务合同' },
      { key: 'property_qualification', label: '物业资质文件' },
      { key: 'property_report', label: '物业报告' },
    ],
  },
  {
    key: 'owner', label: '业主资料',
    children: [
      { key: 'owner_roster', label: '业主名册' },
      { key: 'owner_assembly', label: '业主大会记录' },
    ],
  },
  {
    key: 'finance', label: '财务文件',
    children: [
      { key: 'finance_audit', label: '审计报告' },
      { key: 'finance_revenue', label: '公共收益账目' },
      { key: 'finance_fund', label: '维修资金账目' },
    ],
  },
];

const mockArchiveFiles: ArchiveFile[] = [
  { id: '1', name: '业委会章程_v2.pdf', category: 'committee', subCategory: 'committee_charter', description: '现行业委会章程', fileUrl: '#', fileSize: '256KB', uploader: '张建国', uploadedAt: '2024-01-15', permission: 'public' },
  { id: '2', name: '2025年业委会工作报告.pdf', category: 'committee', subCategory: 'committee_report', description: '2025年度工作总结', fileUrl: '#', fileSize: '1.2MB', uploader: '张建国', uploadedAt: '2026-01-10', permission: 'public' },
  { id: '3', name: '物业服务合同_2024.pdf', category: 'property', subCategory: 'property_contract', description: '与物业公司签订的服务合同', fileUrl: '#', fileSize: '3.5MB', uploader: '李明华', uploadedAt: '2024-06-01', permission: 'internal' },
  { id: '4', name: '2025年度审计报告.pdf', category: 'finance', subCategory: 'finance_audit', description: '2025年度财务审计报告', fileUrl: '#', fileSize: '2.1MB', uploader: '李明华', uploadedAt: '2026-02-20', permission: 'confidential' },
  { id: '5', name: '2026年4月公共收益明细.xlsx', category: 'finance', subCategory: 'finance_revenue', description: '2026年4月公共收益明细', fileUrl: '#', fileSize: '156KB', uploader: '王淑芳', uploadedAt: '2026-05-04', permission: 'public' },
  { id: '6', name: '业主名册_2026.xlsx', category: 'owner', subCategory: 'owner_roster', description: '2026年度业主名册', fileUrl: '#', fileSize: '890KB', uploader: '王淑芳', uploadedAt: '2026-01-05', permission: 'confidential' },
];

const mockOperationLogs: OperationLog[] = [
  { id: '1', operator: '张建国', action: '审核通过', module: '维修资金审核', detail: '审核通过"3栋电梯维修资金申请"', ip: '192.168.1.100', createdAt: '2026-04-22 15:00' },
  { id: '2', operator: '李明华', action: '发布公告', module: '公告发布', detail: '发布"2026年4月公共收益公示"', ip: '192.168.1.101', createdAt: '2026-05-05 09:00' },
  { id: '3', operator: '王淑芳', action: '回复', module: '业主沟通', detail: '回复业主王磊的提问', ip: '192.168.1.102', createdAt: '2026-05-04 10:00' },
  { id: '4', operator: '张建国', action: '删除', module: '档案管理', detail: '删除过期文件"2023年公共收益明细"', ip: '192.168.1.100', createdAt: '2026-05-03 11:00' },
];

const mockCoordinationLetters: CoordinationLetter[] = [
  { id: '1', title: '关于小区绿化改造的沟通函', content: '请物业公司就绿化改造方案提供详细预算和施工计划。', to: '物业公司', reply: '已提供详细预算和施工计划，详见附件。', repliedAt: '2026-04-30 14:00', status: 'replied', createdAt: '2026-04-25 09:00', createdBy: '张建国' },
  { id: '2', title: '关于加强夜间巡逻的通知', content: '近期业主反映夜间巡逻频次不足，请物业加强夜间巡逻管理。', to: '物业公司', status: 'sent', createdAt: '2026-05-04 10:00', createdBy: '李明华' },
];

const mockTermChangeRecords: TermChangeRecord[] = [
  { id: '1', changeDate: '2024-01-01', previousDirector: '陈国栋', newDirector: '张建国', members: ['李明华', '王淑芳', '赵德明', '刘美琴'], description: '第二届业委会换届选举' },
];

// ===== API 函数 =====

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ---- 工作台 ----

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  return {
    pendingFundReviews: mockFundApplications.filter(a => a.status === 'pending_review').length,
    pendingComplaints: 3,
    pendingReports: mockReports.filter(r => r.status === 'submitted').length,
    pendingMinutes: mockMeetings.filter(m => m.status === 'ended' && !m.minutes?.confirmedBy.length).length,
    monthlyComplaints: 12,
    serviceScore: 87,
    fundBalance: 1250000,
    satisfaction: 84,
  };
}

export async function getRecentReports(): Promise<PropertyReport[]> {
  await delay();
  return mockReports.slice(0, 3);
}

// ---- 成员管理 ----

export async function getCommitteeMembers(): Promise<CommitteeMember[]> {
  await delay();
  return mockMembers;
}

export async function createCommitteeMember(data: Partial<CommitteeMember>): Promise<CommitteeMember> {
  await delay();
  const newMember: CommitteeMember = {
    id: String(Date.now()),
    name: data.name || '',
    position: data.position || 'member',
    houseId: data.houseId || '',
    building: data.building || '',
    unit: data.unit || '',
    phone: data.phone || '',
    termStart: data.termStart || new Date().toISOString().split('T')[0],
    termEnd: data.termEnd || '',
    status: 'active',
    attendance: 0,
  };
  return newMember;
}

export async function updateCommitteeMember(id: string, data: Partial<CommitteeMember>): Promise<void> {
  await delay();
}

export async function resignCommitteeMember(id: string): Promise<void> {
  await delay();
}

export async function getTermChangeRecords(): Promise<TermChangeRecord[]> {
  await delay();
  return mockTermChangeRecords;
}

// ---- 会议管理 ----

export async function getMeetings(): Promise<Meeting[]> {
  await delay();
  return mockMeetings;
}

export async function getMeetingById(id: string): Promise<Meeting | undefined> {
  await delay();
  return mockMeetings.find(m => m.id === id);
}

export async function createMeeting(data: Partial<Meeting>): Promise<Meeting> {
  await delay(500);
  const newMeeting: Meeting = {
    id: String(Date.now()),
    title: data.title || '',
    type: data.type || 'regular',
    startTime: data.startTime || '',
    location: data.location || '',
    agenda: data.agenda || [],
    materials: data.materials || [],
    attendees: data.attendees || [],
    signInRecords: [],
    status: 'pending',
  };
  return newMeeting;
}

export async function updateMeeting(id: string, data: Partial<Meeting>): Promise<void> {
  await delay();
}

export async function startMeeting(id: string): Promise<void> {
  await delay();
}

export async function endMeeting(id: string): Promise<void> {
  await delay();
}

export async function signInMeeting(meetingId: string, memberId: string, method: 'qr_code' | 'manual'): Promise<void> {
  await delay();
}

export async function saveMeetingMinutes(meetingId: string, minutes: MeetingMinutes): Promise<void> {
  await delay(500);
}

// ---- 业主大会 ----

export async function getAssemblies(): Promise<GeneralAssembly[]> {
  await delay();
  return mockAssemblies;
}

export async function createAssembly(data: Partial<GeneralAssembly>): Promise<GeneralAssembly> {
  await delay(500);
  const newAssembly: GeneralAssembly = {
    id: String(Date.now()),
    title: data.title || '',
    type: data.type || 'annual',
    topics: data.topics || [],
    voteStartTime: data.voteStartTime || '',
    voteEndTime: data.voteEndTime || '',
    status: 'pending',
  };
  return newAssembly;
}

export async function publishAssemblyResult(id: string): Promise<void> {
  await delay();
}

/**
 * 获取已发布结果的业主大会（供物业端查看）
 * 只返回 status === 'ended' 且 result?.published === true 的大会
 */
export async function getPublishedAssemblies(): Promise<GeneralAssembly[]> {
  await delay();
  return mockAssemblies.filter(a => a.status === 'ended' && a.result?.published);
}

// ---- 维修资金审核 ----

export async function getFundApplications(): Promise<MaintenanceFundApplication[]> {
  await delay();
  return mockFundApplications;
}

export async function reviewFundApplication(id: string, status: 'approved' | 'rejected' | 'supplement', comment: string): Promise<void> {
  await delay(500);
}

// ---- 物业协同监督 ----

export async function getPropertyReports(): Promise<PropertyReport[]> {
  await delay();
  return mockReports;
}

export async function reviewPropertyReport(id: string, comment: string): Promise<void> {
  await delay();
}

// ---- 公告发布 ----

export async function getCommitteeNotices(): Promise<CommitteeNotice[]> {
  await delay();
  return mockNotices;
}

export async function createCommitteeNotice(data: Partial<CommitteeNotice>): Promise<CommitteeNotice> {
  await delay(500);
  const newNotice: CommitteeNotice = {
    id: String(Date.now()),
    title: data.title || '',
    type: data.type || 'committee',
    content: data.content || '',
    attachments: data.attachments || [],
    scope: data.scope || 'all',
    isTop: data.isTop || false,
    status: 'draft',
    publishTime: data.publishTime || '',
    readCount: 0,
    totalTarget: 500,
    createdBy: data.createdBy || '',
    createdAt: new Date().toISOString(),
  };
  return newNotice;
}

export async function publishCommitteeNotice(id: string): Promise<void> {
  await delay();
}

export async function deleteCommitteeNotice(id: string): Promise<void> {
  await delay();
}

// ---- 业主沟通 ----

export async function getOpinionPolls(): Promise<OpinionPoll[]> {
  await delay();
  return mockOpinionPolls;
}

export async function createOpinionPoll(data: Partial<OpinionPoll>): Promise<OpinionPoll> {
  await delay(500);
  const newPoll: OpinionPoll = {
    id: String(Date.now()),
    title: data.title || '',
    description: data.description || '',
    deadline: data.deadline || '',
    options: data.options || [],
    results: [],
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  return newPoll;
}

export async function getOwnerQuestions(): Promise<OwnerQuestion[]> {
  await delay();
  return mockQuestions;
}

export async function replyOwnerQuestion(id: string, reply: string, repliedBy: string): Promise<void> {
  await delay();
}

export async function getSatisfactionSurveys(): Promise<SatisfactionSurvey[]> {
  await delay();
  return mockSurveys;
}

export async function createSatisfactionSurvey(data: Partial<SatisfactionSurvey>): Promise<SatisfactionSurvey> {
  await delay(500);
  const newSurvey: SatisfactionSurvey = {
    id: String(Date.now()),
    title: data.title || '',
    questions: data.questions || [],
    status: 'draft',
    responses: 0,
    createdAt: new Date().toISOString(),
  };
  return newSurvey;
}

// ---- 档案管理 ----

export async function getArchiveCategories(): Promise<ArchiveCategory[]> {
  await delay();
  return mockArchiveCategories;
}

export async function getArchiveFiles(category?: string, subCategory?: string): Promise<ArchiveFile[]> {
  await delay();
  let files = mockArchiveFiles;
  if (category) files = files.filter(f => f.category === category);
  if (subCategory) files = files.filter(f => f.subCategory === subCategory);
  return files;
}

export async function uploadArchiveFile(data: Partial<ArchiveFile>): Promise<ArchiveFile> {
  await delay(500);
  const newFile: ArchiveFile = {
    id: String(Date.now()),
    name: data.name || '',
    category: data.category || '',
    subCategory: data.subCategory || '',
    description: data.description || '',
    fileUrl: '#',
    fileSize: data.fileSize || '0KB',
    uploader: data.uploader || '',
    uploadedAt: new Date().toISOString().split('T')[0],
    permission: data.permission || 'internal',
  };
  return newFile;
}

export async function deleteArchiveFile(id: string): Promise<void> {
  await delay();
}

// ---- 系统管理 ----

export async function getOperationLogs(): Promise<OperationLog[]> {
  await delay();
  return mockOperationLogs;
}

// ---- 物业协同监督 ----

export async function getCoordinationLetters(): Promise<CoordinationLetter[]> {
  await delay();
  return mockCoordinationLetters;
}

export async function sendCoordinationLetter(data: Partial<CoordinationLetter>): Promise<CoordinationLetter> {
  await delay(500);
  const newLetter: CoordinationLetter = {
    id: String(Date.now()),
    title: data.title || '',
    content: data.content || '',
    to: data.to || '物业公司',
    status: 'sent',
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy || '',
  };
  return newLetter;
}

export async function getPublicRevenues(): Promise<PublicRevenue[]> {
  await delay();
  return [
    { item: '电梯广告收入', amount: 25000, period: '2026-04', remark: '3部电梯广告位' },
    { item: '临时停车收入', amount: 8500, period: '2026-04', remark: '临时车辆停车费' },
    { item: '场地租赁收入', amount: 12000, period: '2026-04', remark: '快递柜/售货机场地' },
    { item: '其他收入', amount: 3000, period: '2026-04', remark: '废品回收等' },
  ];
}

export async function getServiceScores(): Promise<ServiceScoreItem[]> {
  await delay();
  return [
    { dimension: '保洁服务', score: 88, fullScore: 100 },
    { dimension: '保安服务', score: 85, fullScore: 100 },
    { dimension: '绿化养护', score: 82, fullScore: 100 },
    { dimension: '维修服务', score: 90, fullScore: 100 },
  ];
}