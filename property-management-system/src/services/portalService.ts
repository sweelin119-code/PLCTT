import type { PolicyInfo, ManagementRule, RuleVersion, Category, PortalBanner } from './portalTypes';
import {
  mockPolicyInfoList as policyInfoList,
  mockManagementRules as managementRuleList,
  mockRuleVersions as ruleVersionList,
  mockCategories as categoryList,
  mockBanners as bannerList,
} from './portalMockData';

// ==================== 政策资讯管理 ====================

/** 获取政策资讯列表（支持筛选和分页） */
export async function getPolicyInfoList(params?: {
  category?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ list: PolicyInfo[]; total: number }> {
  let filtered = [...policyInfoList];

  if (params?.category) {
    filtered = filtered.filter(item => item.category === params.category);
  }
  if (params?.status) {
    filtered = filtered.filter(item => item.status === params.status);
  }
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.title.toLowerCase().includes(kw) ||
        item.summary.toLowerCase().includes(kw) ||
        item.tags?.some(tag => tag.toLowerCase().includes(kw))
    );
  }

  // 按置顶和发布时间排序
  filtered.sort((a, b) => {
    if (a.isTop !== b.isTop) return a.isTop ? -1 : 1;
    return new Date(b.publishTime || b.createTime).getTime() - new Date(a.publishTime || a.createTime).getTime();
  });

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return { list, total: filtered.length };
}

/** 获取单条政策资讯详情 */
export async function getPolicyInfoById(id: number): Promise<PolicyInfo | undefined> {
  return policyInfoList.find(item => item.id === id);
}

/** 新增政策资讯 */
export async function createPolicyInfo(data: Omit<PolicyInfo, 'id' | 'createTime' | 'updateTime' | 'viewCount'>): Promise<PolicyInfo> {
  const newItem: PolicyInfo = {
    ...data,
    id: Math.max(...policyInfoList.map(i => i.id)) + 1,
    viewCount: 0,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  };
  policyInfoList.unshift(newItem);
  return newItem;
}

/** 更新政策资讯 */
export async function updatePolicyInfo(id: number, data: Partial<PolicyInfo>): Promise<PolicyInfo | undefined> {
  const index = policyInfoList.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  policyInfoList[index] = {
    ...policyInfoList[index],
    ...data,
    id,
    updateTime: new Date().toISOString(),
  };
  return policyInfoList[index];
}

/** 删除政策资讯 */
export async function deletePolicyInfo(id: number): Promise<boolean> {
  const index = policyInfoList.findIndex(item => item.id === id);
  if (index === -1) return false;
  policyInfoList.splice(index, 1);
  return true;
}

// ==================== 规章制度管理 ====================

/** 获取规章制度列表（支持筛选和分页） */
export async function getManagementRuleList(params?: {
  category?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ list: ManagementRule[]; total: number }> {
  let filtered = [...managementRuleList];

  if (params?.category) {
    filtered = filtered.filter(item => item.category === params.category);
  }
  if (params?.status) {
    filtered = filtered.filter(item => item.status === params.status);
  }
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.title.toLowerCase().includes(kw) ||
        item.summary.toLowerCase().includes(kw) ||
        item.tags?.some(tag => tag.toLowerCase().includes(kw))
    );
  }

  filtered.sort((a, b) => {
    return new Date(b.publishTime || b.createTime).getTime() - new Date(a.publishTime || a.createTime).getTime();
  });

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return { list, total: filtered.length };
}

/** 获取单条规章制度详情 */
export async function getManagementRuleById(id: number): Promise<ManagementRule | undefined> {
  return managementRuleList.find(item => item.id === id);
}

/** 新增规章制度 */
export async function createManagementRule(data: Omit<ManagementRule, 'id' | 'createTime' | 'updateTime' | 'viewCount'>): Promise<ManagementRule> {
  const newItem: ManagementRule = {
    ...data,
    id: Math.max(...managementRuleList.map(i => i.id)) + 1,
    viewCount: 0,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  };
  managementRuleList.unshift(newItem);
  return newItem;
}

/** 更新规章制度 */
export async function updateManagementRule(id: number, data: Partial<ManagementRule>): Promise<ManagementRule | undefined> {
  const index = managementRuleList.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  managementRuleList[index] = {
    ...managementRuleList[index],
    ...data,
    id,
    updateTime: new Date().toISOString(),
  };
  return managementRuleList[index];
}

/** 删除规章制度 */
export async function deleteManagementRule(id: number): Promise<boolean> {
  const index = managementRuleList.findIndex(item => item.id === id);
  if (index === -1) return false;
  managementRuleList.splice(index, 1);
  return true;
}

// ==================== 版本管理 ====================

/** 获取指定制度的版本历史 */
export async function getRuleVersions(ruleId: number): Promise<RuleVersion[]> {
  return ruleVersionList.filter(v => v.ruleId === ruleId);
}

/** 新增版本 */
export async function createRuleVersion(data: Omit<RuleVersion, 'id' | 'createTime'>): Promise<RuleVersion> {
  const newVersion: RuleVersion = {
    ...data,
    id: Math.max(...ruleVersionList.map(v => v.id)) + 1,
    createTime: new Date().toISOString(),
  };
  ruleVersionList.unshift(newVersion);
  return newVersion;
}

// ==================== 分类管理 ====================

/** 获取分类列表 */
export async function getCategoryList(type?: 'policy' | 'rule'): Promise<Category[]> {
  if (type) {
    return categoryList.filter(c => c.type === type);
  }
  return categoryList;
}

/** 新增分类 */
export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const newCategory: Category = {
    ...data,
    id: Math.max(...categoryList.map(c => c.id)) + 1,
  };
  categoryList.push(newCategory);
  return newCategory;
}

/** 更新分类 */
export async function updateCategory(id: number, data: Partial<Category>): Promise<Category | undefined> {
  const index = categoryList.findIndex(c => c.id === id);
  if (index === -1) return undefined;
  categoryList[index] = { ...categoryList[index], ...data, id };
  return categoryList[index];
}

/** 删除分类 */
export async function deleteCategory(id: number): Promise<boolean> {
  const index = categoryList.findIndex(c => c.id === id);
  if (index === -1) return false;
  categoryList.splice(index, 1);
  return true;
}

// ==================== Banner 管理 ====================

/** 获取 Banner 列表 */
export async function getBannerList(): Promise<PortalBanner[]> {
  return bannerList;
}

/** 更新 Banner */
export async function updateBanner(id: number, data: Partial<PortalBanner>): Promise<PortalBanner | undefined> {
  const index = bannerList.findIndex(b => b.id === id);
  if (index === -1) return undefined;
  bannerList[index] = { ...bannerList[index], ...data, id };
  return bannerList[index];
}
