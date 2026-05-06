// 业主端配置服务层 - 含默认mock数据
import type {
  OwnerAppConfig,
  OwnerBannerConfig,
  OwnerQuickMenuConfig,
  OwnerServiceCategoryConfig,
  OwnerServiceConfig,
} from './ownerConfigTypes';

// ===== 默认配置数据 =====

const defaultBanners: OwnerBannerConfig[] = [
  {
    id: 1,
    sourceType: 'policy',
    sourceId: 1,
    title: '《XX市物业管理条例（2026年修订版）》正式发布',
    subtitle: '为进一步规范物业管理活动，维护业主合法权益',
    gradient: 'linear-gradient(135deg, #007AFF, #5856D6)',
    emoji: '📋',
    sortOrder: 1,
    enabled: true,
  },
  {
    id: 2,
    sourceType: 'policy',
    sourceId: 7,
    title: '关于加强住宅小区电动自行车充电安全管理的紧急通知',
    subtitle: '保障居民生命财产安全，消除安全隐患',
    gradient: 'linear-gradient(135deg, #FF3B30, #FF9500)',
    emoji: '🔥',
    sortOrder: 2,
    enabled: true,
  },
  {
    id: 3,
    sourceType: 'rule',
    sourceId: 1,
    title: '住宅小区消防安全管理标准',
    subtitle: '规范消防安全管理，明确企业责任',
    gradient: 'linear-gradient(135deg, #34C759, #30B350)',
    emoji: '🛡️',
    sortOrder: 3,
    enabled: true,
  },
  {
    id: 4,
    sourceType: 'rule',
    sourceId: 2,
    title: '物业服务人员岗位行为规范',
    subtitle: '提升物业服务水平，规范岗位行为',
    gradient: 'linear-gradient(135deg, #AF52DE, #7B2FBE)',
    emoji: '👔',
    sortOrder: 4,
    enabled: true,
  },
];

const defaultQuickMenus: OwnerQuickMenuConfig[] = [
  { id: 1, label: '报修', icon: '🔧', path: '/owner/repair', sortOrder: 1, enabled: true, color: '#007AFF', bg: '#EBF5FF' },
  { id: 2, label: '我的账单', icon: '💳', path: '/owner/bills', sortOrder: 2, enabled: true, color: '#34C759', bg: '#EBFFEB' },
  { id: 3, label: '停车', icon: '🚗', path: '/owner/parking', sortOrder: 3, enabled: true, color: '#FF9500', bg: '#FFF5EB' },
  { id: 4, label: '门禁', icon: '🔑', path: '/owner/access', sortOrder: 4, enabled: true, color: '#AF52DE', bg: '#F5EBFF' },
  { id: 5, label: '投诉', icon: '💡', path: '/owner/complaint', sortOrder: 5, enabled: true, color: '#FF3B30', bg: '#FFEBEB' },
  { id: 6, label: '投票表决', icon: '📋', path: '/owner/vote', sortOrder: 6, enabled: true, color: '#1677ff', bg: '#EBF5FF' },
  { id: 7, label: '快递', icon: '📦', path: '/owner/express', sortOrder: 7, enabled: true, color: '#5AC8FA', bg: '#EBF8FF' },
  { id: 8, label: '社区活动', icon: '🎪', path: '/owner/activities', sortOrder: 8, enabled: true, color: '#FF2D55', bg: '#FFEBF0' },
  { id: 9, label: '邻里圈', icon: '🤝', path: '/owner/neighborhood', sortOrder: 9, enabled: true, color: '#5856D6', bg: '#F0EBFF' },
];

const defaultServiceCategories: OwnerServiceCategoryConfig[] = [
  { id: 1, title: '物业服务', emoji: '🏠', color: '#007AFF', bg: '#EBF5FF', sortOrder: 1, enabled: true },
  { id: 2, title: '生活服务', emoji: '🛍️', color: '#FF9500', bg: '#FFF5EB', sortOrder: 2, enabled: true },
  { id: 3, title: '社区社交', emoji: '💬', color: '#AF52DE', bg: '#F5EBFF', sortOrder: 3, enabled: true },
  { id: 4, title: '社区集市', emoji: '🏪', color: '#FF2D55', bg: '#FFEBF0', sortOrder: 4, enabled: true },
  { id: 5, title: '便民服务', emoji: '🛠️', color: '#5856D6', bg: '#F0EBFF', sortOrder: 5, enabled: true },
];

const defaultServices: OwnerServiceConfig[] = [
  // 物业服务（物业相关服务）
  { id: 1, categoryId: 1, icon: '🔧', label: '在线报修', path: '/owner/repair', desc: '水、电、门窗等维修', sortOrder: 1, enabled: true, relatedMineMenus: ['/owner/mine/repairs'] },
  { id: 2, categoryId: 1, icon: '💳', label: '我的账单', path: '/owner/bills', desc: '物业费、水电费、停车费缴纳', sortOrder: 2, enabled: true, relatedMineMenus: ['/owner/mine/payments'] },
  { id: 3, categoryId: 1, icon: '🚗', label: '停车服务', path: '/owner/parking', desc: '车位查询、租赁', sortOrder: 3, enabled: true, relatedMineMenus: [] },
  { id: 4, categoryId: 1, icon: '🔑', label: '门禁管理', path: '/owner/access', desc: '手机开门、访客授权', sortOrder: 4, enabled: true, relatedMineMenus: [] },
  { id: 5, categoryId: 1, icon: '📋', label: '投票表决', path: '/owner/vote', desc: '业主大会、业委会选举、小区事务投票', sortOrder: 5, enabled: true, relatedMineMenus: ['/owner/mine/votes'] },
  { id: 6, categoryId: 1, icon: '📦', label: '快递服务', path: '/owner/express', desc: '快递代收查询', sortOrder: 6, enabled: true, relatedMineMenus: ['/owner/mine/expresses'] },
  { id: 7, categoryId: 1, icon: '📋', label: '装修申请', path: '/owner/decoration', desc: '装修备案申请', sortOrder: 7, enabled: true, relatedMineMenus: [] },
  // 生活服务（第三方商业服务）
  { id: 7, categoryId: 2, icon: '🏪', label: '周边商家', path: '/owner/shops', desc: '社区商家查询', sortOrder: 1, enabled: true, relatedMineMenus: [] },
  { id: 8, categoryId: 2, icon: '🛒', label: '在线购物', path: '/owner/services/online-shopping', desc: '商品在线购买', sortOrder: 2, enabled: true, relatedMineMenus: [] },
  { id: 9, categoryId: 2, icon: '🍱', label: '外卖服务', path: '/owner/services/delivery', desc: '餐饮外卖配送', sortOrder: 3, enabled: true, relatedMineMenus: [] },
  { id: 10, categoryId: 2, icon: '🧹', label: '家政服务预约', path: '/owner/services/housekeeping', desc: '保洁、月嫂等预约', sortOrder: 4, enabled: true, relatedMineMenus: [] },
  { id: 11, categoryId: 2, icon: '💧', label: '生活缴费', path: '/owner/services/utilities', desc: '水电气等生活缴费', sortOrder: 5, enabled: true, relatedMineMenus: [] },
  // 社区社交
  { id: 12, categoryId: 3, icon: '📢', label: '社区公告', path: '/owner/notice', desc: '查看最新通知', sortOrder: 1, enabled: true, relatedMineMenus: [] },
  { id: 13, categoryId: 3, icon: '🎪', label: '社区活动', path: '/owner/activities', desc: '活动报名参与', sortOrder: 2, enabled: true, relatedMineMenus: ['/owner/mine/activities'] },
  { id: 14, categoryId: 3, icon: '💬', label: '邻里圈', path: '/owner/neighborhood', desc: '社区论坛交流', sortOrder: 3, enabled: true, relatedMineMenus: [] },
  { id: 15, categoryId: 3, icon: '🤝', label: '邻里互助', path: '/owner/community', desc: '邻里交流平台', sortOrder: 4, enabled: true, relatedMineMenus: [] },
  // 社区集市
  { id: 16, categoryId: 4, icon: '🔄', label: '二手交易', path: '/owner/market/used', desc: '闲置物品交易', sortOrder: 1, enabled: true, relatedMineMenus: [] },
  { id: 17, categoryId: 4, icon: '👥', label: '社区拼团', path: '/owner/market/groupbuy', desc: '生鲜、日用品团购', sortOrder: 2, enabled: true, relatedMineMenus: ['/owner/mine/coupons'] },
  // 便民服务
  { id: 18, categoryId: 5, icon: '🔍', label: '失物招领', path: '/owner/services/lost-found', desc: '失物发布与认领', sortOrder: 1, enabled: true, relatedMineMenus: [] },
];

// ===== 运行时配置状态（模拟数据库） =====

let currentConfig: OwnerAppConfig = {
  banners: [...defaultBanners],
  quickMenus: [...defaultQuickMenus],
  serviceCategories: [...defaultServiceCategories],
  services: [...defaultServices],
};

// ===== 通知监听器 =====
type ConfigChangeListener = () => void;
const listeners: ConfigChangeListener[] = [];

function notifyListeners(): void {
  listeners.forEach(fn => fn());
}

export function onConfigChange(fn: ConfigChangeListener): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

// ===== 公共方法 =====

/** 获取完整业主端配置 */
export function getOwnerConfig(): OwnerAppConfig {
  return { ...currentConfig };
}

/** 获取已启用的Banner列表（按排序） */
export function getEnabledBanners(): OwnerBannerConfig[] {
  return [...currentConfig.banners]
    .filter(b => b.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 获取已启用的常用菜单（按排序） */
export function getEnabledQuickMenus(): OwnerQuickMenuConfig[] {
  return [...currentConfig.quickMenus]
    .filter(m => m.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 获取已启用的服务分类（按排序） */
export function getEnabledServiceCategories(): OwnerServiceCategoryConfig[] {
  return [...currentConfig.serviceCategories]
    .filter(c => c.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 获取已启用的服务功能（按排序） */
export function getEnabledServices(): OwnerServiceConfig[] {
  return [...currentConfig.services]
    .filter(s => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 获取已启用的"我的"菜单路径列表（基于服务配置的关联） */
export function getEnabledMineMenuPaths(): string[] {
  const paths = new Set<string>();
  currentConfig.services
    .filter(s => s.enabled)
    .forEach(s => s.relatedMineMenus.forEach(p => paths.add(p)));
  return Array.from(paths);
}

// ===== 更新方法 =====

/** 更新Banner配置 */
export function updateBannerConfig(items: OwnerBannerConfig[]): void {
  currentConfig.banners = items;
  notifyListeners();
}

/** 更新常用菜单配置 */
export function updateQuickMenus(items: OwnerQuickMenuConfig[]): void {
  currentConfig.quickMenus = items;
  notifyListeners();
}

/** 更新服务分类配置 */
export function updateServiceCategories(items: OwnerServiceCategoryConfig[]): void {
  currentConfig.serviceCategories = items;
  notifyListeners();
}

/** 更新服务功能配置 */
export function updateServices(items: OwnerServiceConfig[]): void {
  currentConfig.services = items;
  notifyListeners();
}

/** 重置为默认配置 */
export function resetToDefaults(): void {
  currentConfig = {
    banners: [...defaultBanners],
    quickMenus: [...defaultQuickMenus],
    serviceCategories: [...defaultServiceCategories],
    services: [...defaultServices],
  };
  notifyListeners();
}
