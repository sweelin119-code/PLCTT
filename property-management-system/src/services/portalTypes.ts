// ===== 门户页相关类型定义 =====

// 政策资讯
export interface PolicyInfo {
  id: number;
  title: string;
  category: string;
  categoryName: string;
  summary: string;
  content: string;
  coverImage?: string;
  attachments?: string[];
  tags?: string[];
  isTop: boolean;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  publishTime?: string;
  createBy: string;
  createTime: string;
  updateTime: string;
}

// 规章制度
export interface ManagementRule {
  id: number;
  title: string;
  category: string;
  categoryName: string;
  version: string;
  summary: string;
  content: string;
  attachments?: string[];
  tags?: string[];
  status: 'draft' | 'published' | 'deprecated';
  effectiveDate: string;
  viewCount: number;
  publishTime?: string;
  createBy: string;
  createTime: string;
  updateTime: string;
}

// 制度版本历史
export interface RuleVersion {
  id: number;
  ruleId: number;
  version: string;
  changeLog: string;
  createdBy: string;
  createTime: string;
}

// 分类
export interface Category {
  id: number;
  type: 'policy' | 'rule';
  name: string;
  code: string;
  sortOrder: number;
  status: 0 | 1;
}

// Banner
export interface PortalBanner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkType: 'policy' | 'rule' | 'url';
  linkId?: number;
  linkUrl?: string;
  sortOrder: number;
  status: 0 | 1;
  createTime: string;
}
