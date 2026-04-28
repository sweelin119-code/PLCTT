import type { Complaint, ComplaintStatus, ComplaintCategory, ComplaintSource, UrgencyLevel } from './types';

// 模拟投诉数据
let complaints: Complaint[] = [
  {
    id: 1,
    complaintNo: 'TS20260428001',
    complainant: '张建国',
    complainantPhone: '13800138001',
    complainantAddress: '万科城市花园·1栋1单元·101',
    category: 'noise',
    title: '楼上住户深夜噪音扰民',
    content: '楼上住户每天晚上11点后还在走动、搬动家具，严重影响休息。已多次沟通无效，希望物业协调处理。',
    status: 'processing',
    source: 'owner_app',
    urgency: 'normal',
    propertyCompanyId: 1,
    propertyCompanyName: '万科物业',
    acceptedBy: '王经理',
    acceptTime: '2026-04-28 09:00:00',
    assignedTo: '客服小刘',
    assignedToPhone: '13900139010',
    assignTime: '2026-04-28 09:30:00',
    handleResult: '已上门与楼上住户沟通，对方表示会注意减少噪音。后续将持续关注。',
    handleTime: '2026-04-28 11:00:00',
    createTime: '2026-04-28 08:00:00',
    updateTime: '2026-04-28 11:00:00',
  },
  {
    id: 2,
    complaintNo: 'TS20260428002',
    complainant: '李明华',
    complainantPhone: '13800138002',
    complainantAddress: '碧桂园·3栋2单元·502',
    category: 'parking',
    title: '小区停车位被占用',
    content: '本人固定车位（B-023）连续三天被外来车辆占用，物业未及时处理。要求加强停车管理。',
    urgency: 'urgent',
    status: 'assigned',
    source: 'owner_app',
    propertyCompanyId: 2,
    propertyCompanyName: '碧桂园物业',
    acceptedBy: '张主管',
    acceptTime: '2026-04-28 10:00:00',
    assignedTo: '保安队长',
    assignedToPhone: '13900139020',
    assignTime: '2026-04-28 10:30:00',
    createTime: '2026-04-28 09:30:00',
    updateTime: '2026-04-28 10:30:00',
  },
  {
    id: 3,
    complaintNo: 'TS20260428003',
    complainant: '王芳',
    complainantPhone: '13800138003',
    complainantAddress: '保利花园·5栋·1803',
    category: 'property_service',
    title: '物业费收费标准不透明',
    content: '本月物业费账单中多了一项"公摊费用"，但未公示具体明细。要求物业公示公摊费用明细。',
    urgency: 'normal',
    status: 'pending_accept',
    source: 'phone',
    propertyCompanyId: 3,
    propertyCompanyName: '保利物业',
    createTime: '2026-04-28 10:00:00',
    updateTime: '2026-04-28 10:00:00',
  },
  {
    id: 4,
    complaintNo: 'TS20260427004',
    complainant: '赵德明',
    complainantPhone: '13800138004',
    complainantAddress: '龙湖花园·2栋·1501',
    category: 'security',
    title: '小区门禁系统故障，陌生人随意进出',
    content: '小区大门门禁已损坏3天，任何人都可以随意进出，存在安全隐患。请尽快维修。',
    urgency: 'emergency',
    status: 'feedback',
    source: 'owner_app',
    propertyCompanyId: 4,
    propertyCompanyName: '龙湖物业',
    acceptedBy: '李经理',
    acceptTime: '2026-04-27 09:00:00',
    assignedTo: '工程部',
    assignedToPhone: '13900139030',
    assignTime: '2026-04-27 09:30:00',
    handleResult: '已安排工程部维修门禁系统，目前已恢复正常使用。',
    handleTime: '2026-04-27 14:00:00',
    feedbackContent: '门禁已修好，感谢物业及时处理。但希望以后能更快速地响应类似问题。',
    feedbackTime: '2026-04-27 15:00:00',
    revisitStatus: 'pending',
    createTime: '2026-04-27 08:00:00',
    updateTime: '2026-04-27 15:00:00',
  },
  {
    id: 5,
    complaintNo: 'TS20260426005',
    complainant: '陈晓燕',
    complainantPhone: '13800138005',
    complainantAddress: '万科城市花园·8栋·202',
    category: 'clean',
    title: '楼道卫生打扫不及时',
    content: '8栋楼道已经一周没有打扫，地面有污渍和垃圾，电梯间也有异味。',
    urgency: 'normal',
    status: 'closed',
    source: 'owner_app',
    propertyCompanyId: 1,
    propertyCompanyName: '万科物业',
    acceptedBy: '王经理',
    acceptTime: '2026-04-26 08:00:00',
    assignedTo: '保洁组长',
    assignedToPhone: '13900139040',
    assignTime: '2026-04-26 08:30:00',
    handleResult: '已安排保洁人员对8栋楼道进行全面清洁，并加强日常保洁频次。',
    handleTime: '2026-04-26 10:00:00',
    feedbackContent: '楼道已打扫干净，希望保持。',
    feedbackTime: '2026-04-26 14:00:00',
    revisitStatus: 'completed',
    revisitRemark: '回访业主，对处理结果表示满意。',
    revisitTime: '2026-04-26 15:00:00',
    satisfaction: 4,
    closeTime: '2026-04-26 15:00:00',
    createTime: '2026-04-26 07:00:00',
    updateTime: '2026-04-26 15:00:00',
  },
  {
    id: 6,
    complaintNo: 'TS20260425006',
    complainant: '刘伟',
    complainantPhone: '13800138006',
    complainantAddress: '碧桂园·1栋·3301',
    category: 'maintenance',
    title: '电梯运行异常，有异响',
    content: '1栋电梯运行时有异响，偶尔会突然停顿，乘坐时感到害怕。已报修多次未彻底解决。',
    urgency: 'emergency',
    status: 'revisit_pending',
    source: 'government_transfer',
    propertyCompanyId: 2,
    propertyCompanyName: '碧桂园物业',
    acceptedBy: '张主管',
    acceptTime: '2026-04-25 09:00:00',
    assignedTo: '维保公司',
    assignedToPhone: '13900139050',
    assignTime: '2026-04-25 09:30:00',
    handleResult: '已安排电梯维保公司进行全面检修，更换了部分磨损零件，目前运行正常。',
    handleTime: '2026-04-25 16:00:00',
    feedbackContent: '电梯暂时正常了，但担心以后还会出现问题。希望物业定期维护。',
    feedbackTime: '2026-04-25 17:00:00',
    revisitStatus: 'pending',
    // 政府督办信息
    governmentSupervisor: '住建局张科长',
    governmentRemark: '请物业公司高度重视电梯安全问题，限期3日内完成全面检修并提交检修报告。',
    governmentDeadline: '2026-04-28',
    createTime: '2026-04-25 08:00:00',
    updateTime: '2026-04-25 17:00:00',
  },
  {
    id: 7,
    complaintNo: 'TS20260424007',
    complainant: '周丽',
    complainantPhone: '13800138007',
    complainantAddress: '保利花园·6栋·605',
    category: 'neighbor',
    title: '邻居装修噪音过大',
    content: '隔壁装修从早上7点开始施工，周末也不停，严重干扰正常生活。',
    urgency: 'normal',
    status: 'closed',
    source: 'owner_app',
    propertyCompanyId: 3,
    propertyCompanyName: '保利物业',
    acceptedBy: '客服小刘',
    acceptTime: '2026-04-24 08:30:00',
    assignedTo: '客服小刘',
    assignedToPhone: '13900139010',
    assignTime: '2026-04-24 08:30:00',
    handleResult: '已与装修业主沟通，要求遵守装修时间规定（工作日8:30-12:00,14:00-18:00），周末禁止噪音施工。',
    handleTime: '2026-04-24 09:00:00',
    feedbackContent: '已改善，谢谢。',
    feedbackTime: '2026-04-24 12:00:00',
    revisitStatus: 'completed',
    revisitRemark: '回访确认，装修噪音问题已解决。',
    revisitTime: '2026-04-24 15:00:00',
    satisfaction: 4,
    closeTime: '2026-04-24 15:00:00',
    createTime: '2026-04-24 08:00:00',
    updateTime: '2026-04-24 15:00:00',
  },
  {
    id: 8,
    complaintNo: 'TS20260423008',
    complainant: '吴建国',
    complainantPhone: '13800138008',
    complainantAddress: '龙湖花园·7栋·801',
    category: 'other',
    title: '建议增加小区健身设施',
    content: '小区老年人较多，但健身器材只有3个且已老旧。建议增加适合老年人的健身设施。',
    urgency: 'normal',
    status: 'closed',
    source: 'visit',
    propertyCompanyId: 4,
    propertyCompanyName: '龙湖物业',
    acceptedBy: '李经理',
    acceptTime: '2026-04-23 10:00:00',
    assignedTo: '李经理',
    assignedToPhone: '13900139060',
    assignTime: '2026-04-23 10:00:00',
    handleResult: '已将建议纳入下季度改造计划，预计5月份采购安装新健身器材。',
    handleTime: '2026-04-23 14:00:00',
    feedbackContent: '感谢采纳建议，期待新器材到位。',
    feedbackTime: '2026-04-23 15:00:00',
    revisitStatus: 'completed',
    revisitRemark: '已告知业主改造计划时间安排。',
    revisitTime: '2026-04-23 16:00:00',
    satisfaction: 5,
    closeTime: '2026-04-23 16:00:00',
    createTime: '2026-04-23 09:00:00',
    updateTime: '2026-04-23 16:00:00',
  },
];

// 投诉分类映射
export const complaintCategoryMap: Record<ComplaintCategory, string> = {
  property_service: '物业服务',
  noise: '噪音扰民',
  parking: '停车管理',
  security: '安全管理',
  clean: '环境卫生',
  maintenance: '设施维修',
  neighbor: '邻里纠纷',
  other: '其他',
};

// 投诉来源映射
export const complaintSourceMap: Record<ComplaintSource, string> = {
  owner_app: '业主APP',
  phone: '电话',
  visit: '来访',
  government_transfer: '政府转办',
  other: '其他',
};

// 投诉状态映射
export const complaintStatusMap: Record<ComplaintStatus, string> = {
  pending_accept: '待受理',
  accepted: '已受理',
  assigned: '已分派',
  processing: '处理中',
  feedback: '已反馈',
  revisit_pending: '待回访',
  closed: '已归档',
};

// 获取投诉列表
export async function getComplaintList(params?: {
  keyword?: string;
  status?: ComplaintStatus;
  category?: ComplaintCategory;
  urgency?: UrgencyLevel;
  propertyCompanyId?: number;
  source?: ComplaintSource;
}): Promise<Complaint[]> {
  let result = [...complaints];
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    result = result.filter(
      c => c.complaintNo.toLowerCase().includes(kw)
        || c.complainant.includes(kw)
        || c.complainantPhone.includes(kw)
        || c.title.includes(kw)
        || c.content.includes(kw)
    );
  }
  if (params?.status) {
    result = result.filter(c => c.status === params.status);
  }
  if (params?.category) {
    result = result.filter(c => c.category === params.category);
  }
  if (params?.urgency) {
    result = result.filter(c => c.urgency === params.urgency);
  }
  if (params?.propertyCompanyId) {
    result = result.filter(c => c.propertyCompanyId === params.propertyCompanyId);
  }
  if (params?.source) {
    result = result.filter(c => c.source === params.source);
  }
  return result.sort((a, b) => b.id - a.id);
}

// 根据ID获取投诉
export async function getComplaintById(id: number): Promise<Complaint | undefined> {
  return complaints.find(c => c.id === id);
}

// 创建投诉
export async function createComplaint(data: {
  complainant: string;
  complainantPhone: string;
  complainantAddress: string;
  category: ComplaintCategory;
  title: string;
  content: string;
  urgency: UrgencyLevel;
  source: ComplaintSource;
  propertyCompanyId: number;
  propertyCompanyName?: string;
}): Promise<Complaint> {
  const newId = Math.max(...complaints.map(c => c.id), 0) + 1;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newComplaint: Complaint = {
    id: newId,
    complaintNo: `TS${now.replace(/[-: ]/g, '').substring(0, 8)}${String(newId).padStart(3, '0')}`,
    ...data,
    status: 'pending_accept',
    createTime: now,
    updateTime: now,
  };
  complaints.push(newComplaint);
  return newComplaint;
}

// 受理投诉
export async function acceptComplaint(id: number, acceptedBy: string): Promise<void> {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('投诉不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  complaint.acceptedBy = acceptedBy;
  complaint.acceptTime = now;
  complaint.status = 'accepted';
  complaint.updateTime = now;
}

// 分派投诉
export async function assignComplaint(id: number, assignedTo: string, assignedToPhone: string): Promise<void> {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('投诉不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  complaint.assignedTo = assignedTo;
  complaint.assignedToPhone = assignedToPhone;
  complaint.assignTime = now;
  complaint.status = 'assigned';
  complaint.updateTime = now;
}

// 处理投诉（填写处理结果）
export async function processComplaint(id: number, handleResult: string): Promise<void> {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('投诉不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  complaint.handleResult = handleResult;
  complaint.handleTime = now;
  complaint.status = 'processing';
  complaint.updateTime = now;
}

// 反馈投诉处理结果
export async function feedbackComplaint(id: number, feedbackContent: string): Promise<void> {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('投诉不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  complaint.feedbackContent = feedbackContent;
  complaint.feedbackTime = now;
  complaint.status = 'feedback';
  complaint.updateTime = now;
}

// 回访投诉
export async function revisitComplaint(id: number, data: {
  revisitRemark: string;
  satisfaction: number;
}): Promise<void> {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('投诉不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  complaint.revisitStatus = 'completed';
  complaint.revisitRemark = data.revisitRemark;
  complaint.revisitTime = now;
  complaint.satisfaction = data.satisfaction;
  complaint.status = 'closed';
  complaint.closeTime = now;
  complaint.updateTime = now;
}

// 政府督办
export async function superviseComplaint(id: number, data: {
  supervisor: string;
  remark: string;
  deadline: string;
}): Promise<void> {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('投诉不存在');
  complaint.governmentSupervisor = data.supervisor;
  complaint.governmentRemark = data.remark;
  complaint.governmentDeadline = data.deadline;
  complaint.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// 获取投诉统计
export async function getComplaintStats(propertyCompanyId?: number): Promise<{
  total: number;
  pendingAccept: number;
  processing: number;
  closed: number;
  urgentCount: number;
  satisfactionAvg: number;
  categoryStats: { category: ComplaintCategory; count: number }[];
}> {
  let list = [...complaints];
  if (propertyCompanyId) {
    list = list.filter(c => c.propertyCompanyId === propertyCompanyId);
  }

  const closedList = list.filter(c => c.status === 'closed' && c.satisfaction);
  const satisfactionAvg = closedList.length > 0
    ? Math.round((closedList.reduce((sum, c) => sum + (c.satisfaction || 0), 0) / closedList.length) * 10) / 10
    : 0;

  // 分类统计
  const categoryMap = new Map<ComplaintCategory, number>();
  list.forEach(c => {
    categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1);
  });
  const categoryStats = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  })).sort((a, b) => b.count - a.count);

  return {
    total: list.length,
    pendingAccept: list.filter(c => c.status === 'pending_accept').length,
    processing: list.filter(c => ['accepted', 'assigned', 'processing', 'feedback', 'revisit_pending'].includes(c.status)).length,
    closed: list.filter(c => c.status === 'closed').length,
    urgentCount: list.filter(c => ['urgent', 'emergency'].includes(c.urgency) && c.status !== 'closed').length,
    satisfactionAvg,
    categoryStats,
  };
}
