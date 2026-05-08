import apiClient from './apiClient';

// ===== 类型定义 =====
export interface TodoItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  assignee?: string;
  status: 'pending' | 'completed';
  category?: string;
  createTime: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'full';
  startTime: string;
  endTime: string;
  color: string;
  // 兼容字段 - ScheduleManage.tsx 使用
  staffIds: number[];
  leaderId: number;
}

export interface DutySchedule {
  id: string;
  staffId: number;
  staffName: string;
  date: string;
  shiftType: string;
  templateId?: string;
  remark?: string;
  // 兼容字段 - ScheduleManage.tsx 使用
  shift: string;
  staffIds: number[];
  leaderId: number;
  createdBy?: string;
}

export interface HandoverRecord {
  id: string;
  date: string;
  shiftType: string;
  handoverStaff: string;
  receiverStaff: string;
  content: string;
  status: 'pending' | 'confirmed';
  handoverSign?: string;
  receiverSign?: string;
  createTime: string;
  // 兼容字段 - ScheduleManage.tsx 使用
  takeoverStaff: string;
  handoverTime: string;
  items: { content: string; resolved: boolean; priority: 'urgent' | 'important' | 'normal' }[];
  pendingTodos: string[];
}

export interface DutyStats {
  staffName: string;
  totalShifts: number;
  morningShifts: number;
  afternoonShifts: number;
  nightShifts: number;
  fullShifts: number;
  overtime: number;
}

export interface AnnouncementAttachment {
  name: string;
  url: string;
  size?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'activity' | 'emergency' | 'other';
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'published' | 'withdrawn' | 'scheduled';
  attachments?: AnnouncementAttachment[];
  publishTime?: string;
  createTime: string;
  readCount?: number;
  // 兼容字段（组件使用）
  isTop?: boolean;
  scope?: string;
  scopeValue?: string;
  createdBy?: string;
  totalTarget?: number;
}

export interface ReadRecord {
  readerName: string;
  readTime: string;
}

export interface FileDirectory {
  id: string;
  name: string;
  parentId?: string;
  createTime: string;
}

export interface InternalFile {
  id: string;
  name: string;
  directoryId?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
  uploader: string;
  uploadTime: string;
  downloadCount?: number;
}

// ===== 待办事项 =====
export async function getTodoStats(): Promise<TodoStats> {
  try {
    const res = await apiClient.get('/api/daily/todos/stats');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return { total: 0, completed: 0, pending: 0, overdue: 0 };
  }
}

export async function getTodos(): Promise<TodoItem[]> {
  try {
    const res = await apiClient.get('/api/daily/todos');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function markTodoCompleted(id: string): Promise<void> {
  try {
    await apiClient.put(`/api/daily/todos/${id}/complete`);
  } catch (error) {
    console.error('[dailyService] markTodoCompleted error:', error);
  }
}

// ===== 排班管理 =====
export async function getStaffList(): Promise<{ id: number; name: string }[]> {
  try {
    const res = await apiClient.get('/api/daily/schedules/staff');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function getScheduleTemplates(): Promise<ScheduleTemplate[]> {
  try {
    const res = await apiClient.get('/api/daily/schedules/templates');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function createScheduleTemplate(data: Partial<ScheduleTemplate>): Promise<ScheduleTemplate> {
  try {
    const res = await apiClient.post('/api/daily/schedules/templates', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[dailyService] createScheduleTemplate error:', error);
    throw error;
  }
}

export async function getSchedules(year: number, month: number): Promise<DutySchedule[]> {
  try {
    const res = await apiClient.get('/api/daily/schedules', { params: { year, month } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function createSchedule(data: Partial<DutySchedule>): Promise<DutySchedule> {
  try {
    const res = await apiClient.post('/api/daily/schedules', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[dailyService] createSchedule error:', error);
    throw error;
  }
}

// ===== 交接班 =====
export async function getHandoverRecords(): Promise<HandoverRecord[]> {
  try {
    const res = await apiClient.get('/api/daily/handovers');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function confirmHandover(id: string, sign: string): Promise<void> {
  try {
    await apiClient.put(`/api/daily/handovers/${id}/confirm`, { sign });
  } catch (error) {
    console.error('[dailyService] confirmHandover error:', error);
  }
}

// ===== 考勤统计 =====
export async function getDutyStats(month: string): Promise<DutyStats[]> {
  try {
    const res = await apiClient.get('/api/daily/stats', { params: { month } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

// ===== 公告管理 =====
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const res = await apiClient.get('/api/daily/announcements');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
  try {
    const res = await apiClient.post('/api/daily/announcements', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[dailyService] createAnnouncement error:', error);
    throw error;
  }
}

export async function publishAnnouncement(id: string): Promise<void> {
  try {
    await apiClient.put(`/api/daily/announcements/${id}/publish`);
  } catch (error) {
    console.error('[dailyService] publishAnnouncement error:', error);
  }
}

export async function withdrawAnnouncement(id: string): Promise<void> {
  try {
    await apiClient.put(`/api/daily/announcements/${id}/withdraw`);
  } catch (error) {
    console.error('[dailyService] withdrawAnnouncement error:', error);
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/daily/announcements/${id}`);
  } catch (error) {
    console.error('[dailyService] deleteAnnouncement error:', error);
  }
}

export async function getReadRecords(announcementId: string): Promise<ReadRecord[]> {
  try {
    const res = await apiClient.get(`/api/daily/announcements/${announcementId}/reads`);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

// =============================================================
//  通知/消息系统
// =============================================================

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  isTop: boolean;
  source: string;
  publishTime: string;
  createTime: string;
  createdBy: string;
  isRead?: boolean;
}

export interface UnreadCount {
  count: number;
}

// GET /api/daily/announcements/recent - 获取最近通知列表
export async function getRecentNotifications(limit: number = 5): Promise<NotificationItem[]> {
  try {
    const res = await apiClient.get('/api/daily/announcements/recent', { params: { limit } });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

// GET /api/daily/announcements/unread-count - 未读通知数量
export async function getUnreadCount(): Promise<number> {
  try {
    const res = await apiClient.get('/api/daily/announcements/unread-count');
    if (res.data.code === 200) return res.data.data.count;
    throw new Error(res.data.message);
  } catch {
    return 0;
  }
}

// POST /api/daily/announcements/:id/read - 标记为已读
export async function markNotificationRead(id: string): Promise<void> {
  try {
    await apiClient.post(`/api/daily/announcements/${id}/read`);
  } catch (error) {
    console.error('[dailyService] markNotificationRead error:', error);
  }
}

// GET /api/daily/announcements/owner - 业主端通知列表
export async function getOwnerNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await apiClient.get('/api/daily/announcements/owner');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

// POST /api/daily/announcements/:id/owner-read - 业主标记阅读
export async function markOwnerNotificationRead(id: string, readerName?: string, readerPhone?: string): Promise<void> {
  try {
    await apiClient.post(`/api/daily/announcements/${id}/owner-read`, { readerName, readerPhone });
  } catch (error) {
    console.error('[dailyService] markOwnerNotificationRead error:', error);
  }
}

// =============================================================
//  文件管理
// =============================================================
export async function getDirectories(): Promise<FileDirectory[]> {
  try {
    const res = await apiClient.get('/api/daily/files/directories');
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function createDirectory(data: Partial<FileDirectory>): Promise<FileDirectory> {
  try {
    const res = await apiClient.post('/api/daily/files/directories', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[dailyService] createDirectory error:', error);
    throw error;
  }
}

export async function deleteDirectory(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/daily/files/directories/${id}`);
  } catch (error) {
    console.error('[dailyService] deleteDirectory error:', error);
  }
}

export async function getFiles(directoryId?: string, search?: string): Promise<InternalFile[]> {
  try {
    const params: Record<string, string> = {};
    if (directoryId) params.directoryId = directoryId;
    if (search && search.trim()) params.search = search.trim();
    const res = await apiClient.get('/api/daily/files', { params });
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch {
    return [];
  }
}

export async function uploadFile(data: Partial<InternalFile>): Promise<InternalFile> {
  try {
    const res = await apiClient.post('/api/daily/files', data);
    if (res.data.code === 200) return res.data.data;
    throw new Error(res.data.message);
  } catch (error: any) {
    console.error('[dailyService] uploadFile error:', error);
    throw error;
  }
}

export async function deleteFile(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/daily/files/${id}`);
  } catch (error) {
    console.error('[dailyService] deleteFile error:', error);
  }
}
