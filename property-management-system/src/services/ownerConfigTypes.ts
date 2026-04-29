// 业主端配置类型定义

// Banner配置项 - 引用社区内容（政策资讯或规章制度）
export interface OwnerBannerConfig {
  id: number;
  sourceType: 'policy' | 'rule';  // 来源类型: policy=政策资讯, rule=规章制度
  sourceId: number;                    // 政策资讯或规章制度的ID
  title: string;                       // 展示标题（自动填充）
  subtitle: string;                    // 副标题（自动填充）
  gradient: string;                    // 渐变色
  emoji: string;                       // 图标
  sortOrder: number;                   // 排序
  enabled: boolean;                    // 是否启用
}

// 常用菜单配置项
export interface OwnerQuickMenuConfig {
  id: number;
  label: string;          // 菜单名称
  icon: string;           // 图标emoji
  path: string;           // 路由路径
  sortOrder: number;      // 排序号
  enabled: boolean;       // 是否启用
  color: string;          // 图标颜色
  bg: string;             // 背景色
}

// 服务功能配置项
export interface OwnerServiceConfig {
  id: number;
  categoryId: number;     // 所属分类ID
  icon: string;           // 图标emoji
  label: string;          // 服务名称
  path: string;           // 路由路径
  desc: string;           // 描述
  sortOrder: number;      // 排序号
  enabled: boolean;       // 是否启用
  relatedMineMenus: string[];  // 关联的"我的"菜单路径列表
}

// 服务分类配置
export interface OwnerServiceCategoryConfig {
  id: number;
  title: string;          // 分类名称
  emoji: string;          // 分类图标
  color: string;          // 主题色
  bg: string;             // 背景色
  sortOrder: number;      // 排序号
  enabled: boolean;       // 是否启用
}

// 整体配置
export interface OwnerAppConfig {
  banners: OwnerBannerConfig[];
  quickMenus: OwnerQuickMenuConfig[];
  serviceCategories: OwnerServiceCategoryConfig[];
  services: OwnerServiceConfig[];
}
