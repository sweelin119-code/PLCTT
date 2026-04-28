// ===== 组织服务（Mock 实现）=====
import type { Organization } from './types';
import { mockOrganizations, findChildOrgs, findDescendantOrgIds } from './mockData';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// 获取组织树
export async function getOrgTree(orgType?: string): Promise<Organization[]> {
  await delay();

  let orgs = mockOrganizations;
  if (orgType) {
    orgs = orgs.filter(o => o.orgType === orgType);
  }

  // 构建树形结构
  const buildTree = (parentId: number | null): Organization[] => {
    return orgs
      .filter(o => o.parentId === parentId)
      .map(o => ({
        ...o,
        children: buildTree(o.id),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  return buildTree(null);
}

// 获取组织列表（扁平）
export async function getOrgList(params?: {
  orgType?: string;
  parentId?: number;
}): Promise<Organization[]> {
  await delay();

  let filtered = [...mockOrganizations];

  if (params?.orgType) {
    filtered = filtered.filter(o => o.orgType === params.orgType);
  }

  if (params?.parentId !== undefined) {
    filtered = filtered.filter(o => o.parentId === params.parentId);
  }

  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

// 根据ID获取组织
export async function getOrgById(id: number): Promise<Organization | null> {
  await delay();
  return mockOrganizations.find(o => o.id === id) || null;
}

// 获取子组织列表
export async function getChildOrgs(parentId: number): Promise<Organization[]> {
  await delay();
  return findChildOrgs(parentId).sort((a, b) => a.sortOrder - b.sortOrder);
}

// 获取所有下级组织ID（含自身）
export function getDescendantOrgIds(orgId: number): number[] {
  return findDescendantOrgIds(orgId);
}

// 根据组织类型获取组织列表（用于下拉选择）
export async function getOrgsByType(orgType: string): Promise<Organization[]> {
  await delay();
  return mockOrganizations
    .filter(o => o.orgType === orgType && o.status === 1)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// 获取物业公司列表
export async function getCompanyList(): Promise<Organization[]> {
  return getOrgsByType('company');
}

// 获取小区项目列表（可按物业公司筛选）
export async function getProjectList(companyId?: number): Promise<Organization[]> {
  let projects = mockOrganizations.filter(o => o.orgType === 'project');
  if (companyId) {
    projects = projects.filter(o => o.parentId === companyId);
  }
  return projects.sort((a, b) => a.sortOrder - b.sortOrder);
}
