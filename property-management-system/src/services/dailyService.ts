// ===== 日常管理模块 - 统一数据服务 =====

// 模拟延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ===== 类型定义 =====

// ---- 待办事项 ----
export interface TodoItem {
  id: string;
  module: 'repair' | 'complaint' | 'decoration' | 'contract' | 'inspect' | 'resolution' | 'fee';
  title: string;
  description?: string;
  submitter: string;
  submitTime: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  status: 'pending' | 'processing' | 'completed';
  targetPath: string;
  relatedId: string;
}

export interface TodoStats {
  pendingRepairs: number;
  pendingComplaints: number;
  pendingDecorations: number;
  pendingSuggestions: number;
  expiringContracts: number;
  todayInspectTasks: number;
}

// ---- 值班管理 ----
export interface ScheduleTemplate {
  id: string;
  name: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  staffIds: string[];
  leaderId: string;
}

export interface DutySchedule {
  id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  staffIds: string[];
  leaderId: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface HandoverRecord {
  id: string;
  scheduleId: string;
  handoverStaff: string;
  takeoverStaff: string;
  handoverTime: string;
  takeoverTime?: string;
  items: { content: string; priority: 'normal' | 'important' | 'urgent'; resolved: boolean }[];
  pendingTodos: string[];
  status: 'pending' | 'confirmed';
  handoverSign?: string;
  takeoverSign?: string;
}

export interface DutyStats {
  staffId: string;
  staffName: string;
  totalDutyDays: number;
  attendanceRate: number;
  lateCount: number;
  earlyLeaveCount: number;
  month: string;
}

// ---- 通知公告 ----
export interface AnnouncementAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  scope: 'all' | 'building' | 'unit' | 'internal';
  scopeValue?: string;
  isTop: boolean;
  attachments: AnnouncementAttachment[];
  status: 'draft' | 'published' | 'scheduled' | 'withdrawn';
  publishTime: string;
  readCount: number;
  totalTarget: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  source: 'property' | 'committee';
}

export interface ReadRecord {
  announcementId: string;
  ownerId: string;
  ownerName: string;
  houseAddress: string;
  readTime: string;
}

// ---- 内部文件 ----
export interface FileDirectory {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
}

export interface InternalFile {
  id: string;
  name: string;
  directoryId: string;
  fileType: 'pdf' | 'word' | 'excel' | 'image' | 'other';
  fileUrl: string;
  fileSize: number;
  uploader: string;
  uploadedAt: string;
  downloadCount: number;
  description?: string;
}

// ===== Mock 数据 =====

// ---- 待办事项 Mock ----
const mockTodoStats: TodoStats = {
  pendingRepairs: 5,
  pendingComplaints: 3,
  pendingDecorations: 2,
  pendingSuggestions: 1,
  expiringContracts: 4,
  todayInspectTasks: 8,
};

const mockTodos: TodoItem[] = [
  { id: '1', module: 'repair', title: '3栋2单元水管爆裂维修', description: '紧急维修工单，需尽快处理', submitter: '张建国', submitTime: '2026-05-06 08:30', urgency: 'emergency', status: 'pending', targetPath: '/property/repair', relatedId: '101' },
  { id: '2', module: 'repair', title: '5栋1单元电梯故障', description: '电梯运行异响，需排查', submitter: '李明华', submitTime: '2026-05-06 09:00', urgency: 'urgent', status: 'pending', targetPath: '/property/repair', relatedId: '102' },
  { id: '3', module: 'complaint', title: '楼上住户深夜噪音扰民', description: '多次沟通无效，要求物业协调', submitter: '王芳', submitTime: '2026-05-06 07:30', urgency: 'normal', status: 'processing', targetPath: '/property/complaint', relatedId: '201' },
  { id: '4', module: 'complaint', title: '小区停车位被占用', description: '固定车位连续被占', submitter: '赵德明', submitTime: '2026-05-05 16:00', urgency: 'urgent', status: 'pending', targetPath: '/property/complaint', relatedId: '202' },
  { id: '5', module: 'decoration', title: '2栋1502室装修申请', description: '室内装修，工期30天', submitter: '刘先生', submitTime: '2026-05-05 14:00', urgency: 'normal', status: 'pending', targetPath: '/property/decoration', relatedId: '301' },
  { id: '6', module: 'inspect', title: '配电房月度巡检', description: '今日需完成配电房巡检', submitter: '系统', submitTime: '2026-05-06 00:00', urgency: 'normal', status: 'pending', targetPath: '/property/device/inspect-task', relatedId: '401' },
  { id: '7', module: 'resolution', title: '关于增设电动车充电桩的决议', description: '业主大会已通过，需物业执行', submitter: '业委会', submitTime: '2026-05-04 10:00', urgency: 'normal', status: 'pending', targetPath: '/property/daily/assembly-resolution', relatedId: '501' },
];

// ---- 值班管理 Mock ----
const mockStaffList = [
  { id: 's1', name: '张师傅' }, { id: 's2', name: '李师傅' },
  { id: 's3', name: '王师傅' }, { id: 's4', name: '刘师傅' },
  { id: 's5', name: '陈师傅' }, { id: 's6', name: '赵师傅' },
];

const mockTemplates: ScheduleTemplate[] = [
  { id: 't1', name: '工作日早班', shiftType: 'morning', staffIds: ['s1', 's2'], leaderId: 's1' },
  { id: 't2', name: '工作日晚班', shiftType: 'night', staffIds: ['s3', 's4'], leaderId: 's3' },
  { id: 't3', name: '周末全天班', shiftType: 'morning', staffIds: ['s5', 's6'], leaderId: 's5' },
];

const mockSchedules: DutySchedule[] = [
  { id: 'd1', date: '2026-05-06', shift: 'morning', staffIds: ['s1', 's2'], leaderId: 's1', createdBy: '管理员', createdAt: '2026-05-01' },
  { id: 'd2', date: '2026-05-06', shift: 'night', staffIds: ['s3', 's4'], leaderId: 's3', createdBy: '管理员', createdAt: '2026-05-01' },
];

const mockHandovers: HandoverRecord[] = [
  {
    id: 'h1', scheduleId: 'd1', handoverStaff: '张师傅', takeoverStaff: '李师傅',
    handoverTime: '2026-05-06 08:00', items: [
      { content: '夜间巡逻已完成', priority: 'normal', resolved: true },
      { content: '3栋电梯故障需跟进', priority: 'important', resolved: false },
    ], pendingTodos: ['跟进3栋电梯维修'], status: 'confirmed',
  },
];

// ---- 通知公告 Mock ----
const mockAnnouncements: Announcement[] = [
  {
    id: 'a1', title: '关于2026年五一假期物业服务中心值班安排的通知',
    content: '<h3>五一假期值班安排</h3><p>尊敬的业主：</p><p>五一假期期间，物业服务中心正常值班，具体安排如下...</p>',
    scope: 'all', isTop: true, attachments: [], status: 'published',
    publishTime: '2026-04-28 10:00', readCount: 356, totalTarget: 500,
    createdBy: '王经理', createdAt: '2026-04-27 16:00', updatedAt: '2026-04-28 10:00', source: 'property',
  },
  {
    id: 'a2', title: '小区绿化消杀温馨提示',
    content: '<p>尊敬的业主：</p><p>物业服务中心将于本周六进行小区绿化全面消杀，请各位业主注意关闭门窗...</p>',
    scope: 'all', isTop: false, attachments: [], status: 'published',
    publishTime: '2026-05-04 09:00', readCount: 128, totalTarget: 500,
    createdBy: '王经理', createdAt: '2026-05-03 14:00', updatedAt: '2026-05-04 09:00', source: 'property',
  },
  {
    id: 'a3', title: '关于规范小区停车管理的通知（草稿）',
    content: '<p>为进一步规范小区停车秩序...</p>',
    scope: 'all', isTop: false, attachments: [], status: 'draft',
    publishTime: '', readCount: 0, totalTarget: 500,
    createdBy: '王经理', createdAt: '2026-05-05 11:00', updatedAt: '2026-05-05 11:00', source: 'property',
  },
];

const mockReadRecords: ReadRecord[] = [
  { announcementId: 'a1', ownerId: 'o1', ownerName: '张建国', houseAddress: '1栋1单元101', readTime: '2026-04-28 10:30' },
  { announcementId: 'a1', ownerId: 'o2', ownerName: '李明华', houseAddress: '3栋2单元502', readTime: '2026-04-28 11:00' },
];

// ---- 内部文件 Mock ----
const mockDirectories: FileDirectory[] = [
  { id: 'dir1', name: '公司制度', parentId: null, sortOrder: 1, createdBy: '管理员', createdAt: '2026-01-01' },
  { id: 'dir2', name: '操作手册', parentId: null, sortOrder: 2, createdBy: '管理员', createdAt: '2026-01-01' },
  { id: 'dir3', name: '培训资料', parentId: null, sortOrder: 3, createdBy: '管理员', createdAt: '2026-01-01' },
  { id: 'dir4', name: '会议纪要', parentId: null, sortOrder: 4, createdBy: '管理员', createdAt: '2026-01-01' },
  { id: 'dir1-1', name: '人事制度', parentId: 'dir1', sortOrder: 1, createdBy: '管理员', createdAt: '2026-01-01' },
  { id: 'dir1-2', name: '财务制度', parentId: 'dir1', sortOrder: 2, createdBy: '管理员', createdAt: '2026-01-01' },
  { id: 'dir2-1', name: '保洁操作规范', parentId: 'dir2', sortOrder: 1, createdBy: '管理员', createdAt: '2026-01-01' },
  { id: 'dir2-2', name: '保安巡逻流程', parentId: 'dir2', sortOrder: 2, createdBy: '管理员', createdAt: '2026-01-01' },
];

const mockFiles: InternalFile[] = [
  { id: 'f1', name: '员工考勤管理制度.pdf', directoryId: 'dir1-1', fileType: 'pdf', fileUrl: '#', fileSize: 1024000, uploader: '管理员', uploadedAt: '2026-01-15', downloadCount: 45 },
  { id: 'f2', name: '物业费收费标准.docx', directoryId: 'dir1-2', fileType: 'word', fileUrl: '#', fileSize: 512000, uploader: '管理员', uploadedAt: '2026-01-20', downloadCount: 32 },
  { id: 'f3', name: '保洁工作流程手册.pdf', directoryId: 'dir2-1', fileType: 'pdf', fileUrl: '#', fileSize: 2048000, uploader: '张主管', uploadedAt: '2026-02-01', downloadCount: 78 },
  { id: 'f4', name: '保安巡逻路线图.jpg', directoryId: 'dir2-2', fileType: 'image', fileUrl: '#', fileSize: 256000, uploader: '张主管', uploadedAt: '2026-02-05', downloadCount: 56 },
  { id: 'f5', name: '4月份工作例会纪要.docx', directoryId: 'dir4', fileType: 'word', fileUrl: '#', fileSize: 128000, uploader: '王经理', uploadedAt: '2026-04-30', downloadCount: 23 },
];

// ===== API 函数 =====

// ---- 待办事项 API ----

export async function getTodoStats(): Promise<TodoStats> {
  await delay();
  return mockTodoStats;
}

export async function getTodos(): Promise<TodoItem[]> {
  await delay();
  return mockTodos;
}

export async function markTodoCompleted(id: string): Promise<void> {
  await delay();
  const todo = mockTodos.find(t => t.id === id);
  if (todo) todo.status = 'completed';
}

// ---- 值班管理 API ----

export async function getStaffList(): Promise<{ id: string; name: string }[]> {
  await delay();
  return mockStaffList;
}

export async function getScheduleTemplates(): Promise<ScheduleTemplate[]> {
  await delay();
  return mockTemplates;
}

export async function createScheduleTemplate(data: Partial<ScheduleTemplate>): Promise<ScheduleTemplate> {
  await delay(500);
  const template: ScheduleTemplate = {
    id: String(Date.now()),
    name: data.name || '',
    shiftType: data.shiftType || 'morning',
    staffIds: data.staffIds || [],
    leaderId: data.leaderId || '',
  };
  mockTemplates.push(template);
  return template;
}

export async function getSchedules(year: number, month: number): Promise<DutySchedule[]> {
  await delay();
  return mockSchedules;
}

export async function createSchedule(data: Partial<DutySchedule>): Promise<DutySchedule> {
  await delay(500);
  const schedule: DutySchedule = {
    id: String(Date.now()),
    date: data.date || '',
    shift: data.shift || 'morning',
    staffIds: data.staffIds || [],
    leaderId: data.leaderId || '',
    createdBy: data.createdBy || '管理员',
    createdAt: new Date().toISOString(),
  };
  mockSchedules.push(schedule);
  return schedule;
}

export async function getHandoverRecords(): Promise<HandoverRecord[]> {
  await delay();
  return mockHandovers;
}

export async function confirmHandover(id: string, sign: string): Promise<void> {
  await delay();
  const record = mockHandovers.find(h => h.id === id);
  if (record) {
    record.status = 'confirmed';
    record.takeoverSign = sign;
    record.takeoverTime = new Date().toISOString();
  }
}

export async function getDutyStats(month: string): Promise<DutyStats[]> {
  await delay();
  return mockStaffList.map(s => ({
    staffId: s.id,
    staffName: s.name,
    totalDutyDays: Math.floor(Math.random() * 20) + 10,
    attendanceRate: 85 + Math.floor(Math.random() * 15),
    lateCount: Math.floor(Math.random() * 3),
    earlyLeaveCount: Math.floor(Math.random() * 2),
    month,
  }));
}

// ---- 通知公告 API ----

export async function getAnnouncements(): Promise<Announcement[]> {
  await delay();
  return mockAnnouncements;
}

export async function createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
  await delay(500);
  const announcement: Announcement = {
    id: String(Date.now()),
    title: data.title || '',
    content: data.content || '',
    scope: data.scope || 'all',
    isTop: data.isTop || false,
    attachments: data.attachments || [],
    status: data.status || 'draft',
    publishTime: data.publishTime || '',
    readCount: 0,
    totalTarget: 500,
    createdBy: data.createdBy || '管理员',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'property',
  };
  mockAnnouncements.unshift(announcement);
  return announcement;
}

export async function publishAnnouncement(id: string): Promise<void> {
  await delay();
  const item = mockAnnouncements.find(a => a.id === id);
  if (item) {
    item.status = 'published';
    item.publishTime = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
  }
}

export async function withdrawAnnouncement(id: string): Promise<void> {
  await delay();
  const item = mockAnnouncements.find(a => a.id === id);
  if (item) {
    item.status = 'withdrawn';
    item.updatedAt = new Date().toISOString();
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await delay();
  const idx = mockAnnouncements.findIndex(a => a.id === id);
  if (idx >= 0) mockAnnouncements.splice(idx, 1);
}

export async function getReadRecords(announcementId: string): Promise<ReadRecord[]> {
  await delay();
  return mockReadRecords.filter(r => r.announcementId === announcementId);
}

// ---- 内部文件 API ----

export async function getDirectories(): Promise<FileDirectory[]> {
  await delay();
  return mockDirectories;
}

export async function createDirectory(data: Partial<FileDirectory>): Promise<FileDirectory> {
  await delay(500);
  const dir: FileDirectory = {
    id: String(Date.now()),
    name: data.name || '',
    parentId: data.parentId || null,
    sortOrder: data.sortOrder || 0,
    createdBy: data.createdBy || '管理员',
    createdAt: new Date().toISOString(),
  };
  mockDirectories.push(dir);
  return dir;
}

export async function deleteDirectory(id: string): Promise<void> {
  await delay();
  const idx = mockDirectories.findIndex(d => d.id === id);
  if (idx >= 0) mockDirectories.splice(idx, 1);
}

export async function getFiles(directoryId?: string): Promise<InternalFile[]> {
  await delay();
  if (directoryId) return mockFiles.filter(f => f.directoryId === directoryId);
  return mockFiles;
}

export async function uploadFile(data: Partial<InternalFile>): Promise<InternalFile> {
  await delay(500);
  const file: InternalFile = {
    id: String(Date.now()),
    name: data.name || '',
    directoryId: data.directoryId || '',
    fileType: data.fileType || 'other',
    fileUrl: data.fileUrl || '#',
    fileSize: data.fileSize || 0,
    uploader: data.uploader || '管理员',
    uploadedAt: new Date().toISOString(),
    downloadCount: 0,
  };
  mockFiles.push(file);
  return file;
}

export async function deleteFile(id: string): Promise<void> {
  await delay();
  const idx = mockFiles.findIndex(f => f.id === id);
  if (idx >= 0) mockFiles.splice(idx, 1);
}
