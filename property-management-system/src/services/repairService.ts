import type { RepairOrder, RepairStatus, RepairType, UrgencyLevel } from './types';

// 模拟报修工单数据
let repairOrders: RepairOrder[] = [
  {
    id: 1,
    orderNo: 'BX20260428001',
    ownerName: '张建国',
    ownerPhone: '13800138001',
    ownerAddress: '万科城市花园·1栋1单元·101',
    repairType: 'water',
    repairDesc: '厨房水龙头漏水，关闭后仍然滴水，需要更换水龙头',
    urgency: 'normal',
    status: 'completed',
    propertyCompanyId: 1,
    propertyCompanyName: '万科物业',
    assignedTo: '李师傅',
    assignedPhone: '13900139001',
    assignTime: '2026-04-28 09:30:00',
    arrivalTime: '2026-04-28 10:00:00',
    completeTime: '2026-04-28 10:45:00',
    confirmTime: '2026-04-28 11:00:00',
    repairResult: '已更换厨房水龙头，测试无漏水',
    cost: 80,
    chargeType: 'paid',
    rating: 5,
    evaluation: '师傅来得很快，维修质量很好，非常满意！',
    evaluateTime: '2026-04-28 11:30:00',
    revisitStatus: 'completed',
    revisitRemark: '电话回访，业主表示维修效果很好，无其他问题',
    createTime: '2026-04-28 08:30:00',
    updateTime: '2026-04-28 11:30:00',
  },
  {
    id: 2,
    orderNo: 'BX20260428002',
    ownerName: '李明华',
    ownerPhone: '13800138002',
    ownerAddress: '碧桂园·3栋2单元·502',
    repairType: 'electric',
    repairDesc: '客厅插座没电，同时空调无法启动，怀疑线路故障',
    urgency: 'urgent',
    status: 'in_progress',
    propertyCompanyId: 2,
    propertyCompanyName: '碧桂园物业',
    assignedTo: '王电工',
    assignedPhone: '13900139002',
    assignTime: '2026-04-28 10:00:00',
    arrivalTime: '2026-04-28 10:30:00',
    repairResult: '正在排查线路，发现空开跳闸，正在修复中',
    cost: 0,
    chargeType: 'free',
    createTime: '2026-04-28 09:00:00',
    updateTime: '2026-04-28 10:30:00',
  },
  {
    id: 3,
    orderNo: 'BX20260428003',
    ownerName: '王芳',
    ownerPhone: '13800138003',
    ownerAddress: '保利花园·5栋·1803',
    repairType: 'hvac',
    repairDesc: '空调不制冷，开机后只吹风不制冷，已加氟无效',
    urgency: 'normal',
    status: 'assigned',
    propertyCompanyId: 3,
    propertyCompanyName: '保利物业',
    assignedTo: '刘师傅',
    assignedPhone: '13900139003',
    assignTime: '2026-04-28 11:00:00',
    createTime: '2026-04-28 10:00:00',
    updateTime: '2026-04-28 11:00:00',
  },
  {
    id: 4,
    orderNo: 'BX20260428004',
    ownerName: '赵德明',
    ownerPhone: '13800138004',
    ownerAddress: '龙湖花园·2栋·1501',
    repairType: 'plumbing',
    repairDesc: '马桶堵塞，冲水不畅，已使用疏通剂无效',
    urgency: 'urgent',
    status: 'pending_assign',
    propertyCompanyId: 4,
    propertyCompanyName: '龙湖物业',
    createTime: '2026-04-28 11:30:00',
    updateTime: '2026-04-28 11:30:00',
  },
  {
    id: 5,
    orderNo: 'BX20260427005',
    ownerName: '陈晓燕',
    ownerPhone: '13800138005',
    ownerAddress: '万科城市花园·8栋·202',
    repairType: 'appliance',
    repairDesc: '热水器打不着火，显示故障代码E1',
    urgency: 'emergency',
    status: 'evaluated',
    propertyCompanyId: 1,
    propertyCompanyName: '万科物业',
    assignedTo: '张师傅',
    assignedPhone: '13900139004',
    assignTime: '2026-04-27 14:00:00',
    arrivalTime: '2026-04-27 14:30:00',
    completeTime: '2026-04-27 15:15:00',
    confirmTime: '2026-04-27 15:30:00',
    repairResult: '已更换热水器点火器，测试正常',
    cost: 150,
    chargeType: 'paid',
    rating: 4,
    evaluation: '维修及时，服务态度好',
    evaluateTime: '2026-04-27 16:00:00',
    revisitStatus: 'pending',
    createTime: '2026-04-27 13:00:00',
    updateTime: '2026-04-27 16:00:00',
  },
  {
    id: 6,
    orderNo: 'BX20260427006',
    ownerName: '刘伟',
    ownerPhone: '13800138006',
    ownerAddress: '碧桂园·1栋·3301',
    repairType: 'structure',
    repairDesc: '阳台天花板渗水，楼上邻居反映也在漏水',
    urgency: 'urgent',
    status: 'confirmed',
    propertyCompanyId: 2,
    propertyCompanyName: '碧桂园物业',
    assignedTo: '李师傅',
    assignedPhone: '13900139001',
    assignTime: '2026-04-27 09:00:00',
    arrivalTime: '2026-04-27 09:30:00',
    completeTime: '2026-04-27 11:00:00',
    confirmTime: '2026-04-27 11:30:00',
    repairResult: '已修复楼上水管破裂，天花板需观察干燥后粉刷',
    cost: 0,
    chargeType: 'free',
    createTime: '2026-04-27 08:00:00',
    updateTime: '2026-04-27 11:30:00',
  },
  {
    id: 7,
    orderNo: 'BX20260426007',
    ownerName: '周丽',
    ownerPhone: '13800138007',
    ownerAddress: '保利花园·6栋·605',
    repairType: 'other',
    repairDesc: '门锁损坏，钥匙插进去转不动',
    urgency: 'normal',
    status: 'closed',
    propertyCompanyId: 3,
    propertyCompanyName: '保利物业',
    assignedTo: '刘师傅',
    assignedPhone: '13900139003',
    assignTime: '2026-04-26 08:00:00',
    arrivalTime: '2026-04-26 08:30:00',
    completeTime: '2026-04-26 09:00:00',
    confirmTime: '2026-04-26 09:15:00',
    repairResult: '已更换门锁芯，配新钥匙3把',
    cost: 60,
    chargeType: 'paid',
    rating: 5,
    evaluation: '非常满意，师傅很专业',
    evaluateTime: '2026-04-26 10:00:00',
    revisitStatus: 'completed',
    revisitRemark: '回访确认，业主对维修服务非常满意',
    createTime: '2026-04-26 07:30:00',
    updateTime: '2026-04-26 10:00:00',
  },
  {
    id: 8,
    orderNo: 'BX20260426008',
    ownerName: '吴建国',
    ownerPhone: '13800138008',
    ownerAddress: '龙湖花园·7栋·801',
    repairType: 'water',
    repairDesc: '卫生间地漏返味，需要检查处理',
    urgency: 'normal',
    status: 'pending_assign',
    propertyCompanyId: 4,
    propertyCompanyName: '龙湖物业',
    createTime: '2026-04-26 16:00:00',
    updateTime: '2026-04-26 16:00:00',
  },
];

// 报修类型映射
export const repairTypeMap: Record<RepairType, string> = {
  water: '水管维修',
  electric: '电路维修',
  hvac: '空调维修',
  plumbing: '卫浴疏通',
  appliance: '家电维修',
  structure: '房屋结构',
  other: '其他',
};

// 紧急程度映射
export const urgencyMap: Record<UrgencyLevel, string> = {
  normal: '普通',
  urgent: '紧急',
  emergency: '特急',
};

// 工单状态映射
export const repairStatusMap: Record<RepairStatus, string> = {
  pending_assign: '待派单',
  assigned: '已派单',
  on_the_way: '前往中',
  in_progress: '维修中',
  completed: '已完成',
  confirmed: '已确认',
  evaluated: '已评价',
  closed: '已归档',
};

// 获取报修工单列表
export async function getRepairOrderList(params?: {
  keyword?: string;
  status?: RepairStatus;
  repairType?: RepairType;
  urgency?: UrgencyLevel;
  propertyCompanyId?: number;
}): Promise<RepairOrder[]> {
  let result = [...repairOrders];
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    result = result.filter(
      o => o.orderNo.toLowerCase().includes(kw)
        || o.ownerName.includes(kw)
        || o.ownerPhone.includes(kw)
        || o.ownerAddress.includes(kw)
        || o.repairDesc.includes(kw)
    );
  }
  if (params?.status) {
    result = result.filter(o => o.status === params.status);
  }
  if (params?.repairType) {
    result = result.filter(o => o.repairType === params.repairType);
  }
  if (params?.urgency) {
    result = result.filter(o => o.urgency === params.urgency);
  }
  if (params?.propertyCompanyId) {
    result = result.filter(o => o.propertyCompanyId === params.propertyCompanyId);
  }
  return result.sort((a, b) => b.id - a.id);
}

// 根据ID获取工单
export async function getRepairOrderById(id: number): Promise<RepairOrder | undefined> {
  return repairOrders.find(o => o.id === id);
}

// 创建报修工单
export async function createRepairOrder(data: {
  ownerName: string;
  ownerPhone: string;
  ownerAddress: string;
  repairType: RepairType;
  repairDesc: string;
  urgency: UrgencyLevel;
  propertyCompanyId: number;
  propertyCompanyName?: string;
}): Promise<RepairOrder> {
  const newId = Math.max(...repairOrders.map(o => o.id), 0) + 1;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newOrder: RepairOrder = {
    id: newId,
    orderNo: `BX${now.replace(/[-: ]/g, '').substring(0, 8)}${String(newId).padStart(3, '0')}`,
    ...data,
    status: 'pending_assign',
    createTime: now,
    updateTime: now,
  };
  repairOrders.push(newOrder);
  return newOrder;
}

// 派单
export async function assignRepairOrder(id: number, assignedTo: string, assignedPhone: string): Promise<void> {
  const order = repairOrders.find(o => o.id === id);
  if (!order) throw new Error('工单不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  order.assignedTo = assignedTo;
  order.assignedPhone = assignedPhone;
  order.assignTime = now;
  order.status = 'assigned';
  order.updateTime = now;
}

// 接单（前往中）
export async function acceptRepairOrder(id: number): Promise<void> {
  const order = repairOrders.find(o => o.id === id);
  if (!order) throw new Error('工单不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  order.status = 'on_the_way';
  order.arrivalTime = now;
  order.updateTime = now;
}

// 开始维修
export async function startRepair(id: number): Promise<void> {
  const order = repairOrders.find(o => o.id === id);
  if (!order) throw new Error('工单不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  order.status = 'in_progress';
  order.updateTime = now;
}

// 完成维修
export async function completeRepair(id: number, data: {
  repairResult: string;
  cost?: number;
  chargeType?: 'free' | 'paid';
}): Promise<void> {
  const order = repairOrders.find(o => o.id === id);
  if (!order) throw new Error('工单不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  order.repairResult = data.repairResult;
  order.cost = data.cost;
  order.chargeType = data.chargeType;
  order.completeTime = now;
  order.status = 'completed';
  order.updateTime = now;
}

// 业主确认
export async function confirmRepair(id: number): Promise<void> {
  const order = repairOrders.find(o => o.id === id);
  if (!order) throw new Error('工单不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  order.confirmTime = now;
  order.status = 'confirmed';
  order.updateTime = now;
}

// 业主评价
export async function evaluateRepair(id: number, data: {
  rating: number;
  evaluation: string;
}): Promise<void> {
  const order = repairOrders.find(o => o.id === id);
  if (!order) throw new Error('工单不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  order.rating = data.rating;
  order.evaluation = data.evaluation;
  order.evaluateTime = now;
  order.status = 'evaluated';
  order.updateTime = now;
}

// 回访
export async function revisitRepair(id: number, remark: string): Promise<void> {
  const order = repairOrders.find(o => o.id === id);
  if (!order) throw new Error('工单不存在');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  order.revisitStatus = 'completed';
  order.revisitRemark = remark;
  order.status = 'closed';
  order.updateTime = now;
}

// 获取工单统计
export async function getRepairStats(propertyCompanyId?: number): Promise<{
  total: number;
  pendingAssign: number;
  inProgress: number;
  completed: number;
  closed: number;
  urgentCount: number;
}> {
  let list = [...repairOrders];
  if (propertyCompanyId) {
    list = list.filter(o => o.propertyCompanyId === propertyCompanyId);
  }
  return {
    total: list.length,
    pendingAssign: list.filter(o => o.status === 'pending_assign').length,
    inProgress: list.filter(o => ['assigned', 'on_the_way', 'in_progress'].includes(o.status)).length,
    completed: list.filter(o => ['completed', 'confirmed', 'evaluated'].includes(o.status)).length,
    closed: list.filter(o => o.status === 'closed').length,
    urgentCount: list.filter(o => ['urgent', 'emergency'].includes(o.urgency) && !['completed', 'confirmed', 'evaluated', 'closed'].includes(o.status)).length,
  };
}

// 获取可派单的维保人员列表
export async function getMaintenanceStaff(): Promise<{ name: string; phone: string }[]> {
  return [
    { name: '李师傅', phone: '13900139001' },
    { name: '王电工', phone: '13900139002' },
    { name: '刘师傅', phone: '13900139003' },
    { name: '张师傅', phone: '13900139004' },
    { name: '陈师傅', phone: '13900139005' },
  ];
}
