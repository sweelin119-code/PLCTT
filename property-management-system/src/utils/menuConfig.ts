// 菜单配置 - 定义各端的导航菜单结构

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  path?: string;
}

// localStorage 存储键名（与 PortConfig.tsx 保持一致）
const STORAGE_KEY = 'plcct_port_config';

interface PortConfigData {
  ports: Array<{
    key: string;
    name: string;
    icon: string;
    color: string;
    enabled: boolean;
    sortOrder: number;
    menus: MenuItem[];
  }>;
  menuVisibility: {
    [portKey: string]: {
      [menuKey: string]: boolean;
    };
  };
  menuLabels: {
    [portKey: string]: {
      [menuKey: string]: string;
    };
  };
}

/**
 * 将默认菜单中新增的菜单项合并到已保存的菜单配置中
 * 确保代码新增的菜单项在已保存的 localStorage 配置中也能显示
 */
export function mergeDefaultMenus(savedMenus: MenuItem[], defaultMenus: MenuItem[]): MenuItem[] {
  return defaultMenus.map(defaultItem => {
    const itemKey = defaultItem.path || defaultItem.key;
    const savedItem = savedMenus.find(m => (m.path || m.key) === itemKey);
    
    if (!savedItem) {
      // 这是新增的菜单项，直接使用默认值
      return JSON.parse(JSON.stringify(defaultItem));
    }
    
    // 保留已保存的标签（自定义名称）
    const merged: MenuItem = {
      ...defaultItem,
      label: savedItem.label,
    };
    
    // 递归合并子菜单
    if (defaultItem.children && savedItem.children) {
      merged.children = mergeDefaultMenus(savedItem.children, defaultItem.children);
    } else if (defaultItem.children) {
      merged.children = JSON.parse(JSON.stringify(defaultItem.children));
    } else {
      merged.children = savedItem.children;
    }
    
    return merged;
  });
}

/**
 * 从超级管理端的端口配置中获取指定端口的动态菜单
 * 如果未配置或读取失败，则返回默认菜单
 */
export function getPortMenus(portType: string): MenuItem[] {
  // 获取默认菜单
  const defaultMenus = getDefaultMenus(portType);
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultMenus;
    
    const config: PortConfigData = JSON.parse(saved);
    
    // 从配置中获取该端口的菜单结构（包含自定义排序）
    const portConfig = config.ports?.find(p => p.key === portType);
    if (!portConfig || !portConfig.menus || portConfig.menus.length === 0) {
      return defaultMenus;
    }
    
    // 将已保存的菜单与默认菜单合并，确保新增菜单项也能显示
    const mergedMenus = mergeDefaultMenus(portConfig.menus, defaultMenus);
    
    const visibility = config.menuVisibility?.[portType] || {};
    const labels = config.menuLabels?.[portType] || {};
    
    // 递归处理菜单：应用自定义名称、过滤隐藏项
    const processMenus = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => {
          const visKey = item.path || item.key;
          return visibility[visKey] !== false; // 默认可见
        })
        .map(item => {
          const visKey = item.path || item.key;
          const newItem: MenuItem = {
            ...item,
            label: labels[visKey] || item.label,
          };
          if (item.children) {
            newItem.children = processMenus(item.children);
            // 如果子菜单全部被隐藏，父菜单也隐藏
            if (newItem.children.length === 0) {
              return null;
            }
          }
          return newItem;
        })
        .filter(Boolean) as MenuItem[];
    };
    
    return processMenus(mergedMenus);
  } catch {
    return defaultMenus;
  }
}

/**
 * 获取指定端口的默认菜单
 */
function getDefaultMenus(portType: string): MenuItem[] {
  switch (portType) {
    case 'government': return governmentMenus;
    case 'property': return propertyMenus;
    case 'merchant': return merchantMenus;
    default: return [];
  }
}

// 政府监管端菜单
export const governmentMenus: MenuItem[] = [
  {
    key: 'dashboard',
    label: '工作台',
    icon: 'DashboardOutlined',
    path: '/government/dashboard'
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      { key: 'gov-staff-list', label: '账号管理', path: '/government/staff/list' },
      { key: 'gov-role-mgmt', label: '角色管理', path: '/government/roles' },
      { key: 'gov-organization', label: '组织架构管理', path: '/government/organization' },
    ]
  },
  {
    key: 'portal-content',
    label: '门户内容管理',
    icon: 'FileTextOutlined',
    children: [
      { key: 'policy-info', label: '政策资讯管理', path: '/government/policy/info' },
      { key: 'policy-info-add', label: '新增政策资讯', path: '/government/policy/info/add' },
      { key: 'rule-mgmt', label: '规章制度管理', path: '/government/rule' },
      { key: 'rule-add', label: '新增规章制度', path: '/government/rule/add' },
      { key: 'info-category', label: '分类管理', path: '/government/policy/category' },
    ]
  },
  {
    key: 'policy',
    label: '政策监管',
    icon: 'SafetyCertificateOutlined',
    children: [
      { key: 'policy-mgmt', label: '政策法规管理', path: '/government/policy' },
      { key: 'policy-enforce', label: '政策执行督查', path: '/government/policy/enforce' },
    ]
  },
  {
    key: 'industry',
    label: '行业管理',
    icon: 'BankOutlined',
    children: [
      { key: 'qual-review', label: '资质审核', path: '/government/qualification/review' },
      { key: 'qual-cert', label: '物业备案管理', path: '/government/qualification/cert' },
      { key: 'qual-annual', label: '年检续期', path: '/government/qualification/annual' },
      { key: 'gov-asset-view', label: '小区资产查看', path: '/government/asset/view' },
      { key: 'contract-reg', label: '合同备案管理', path: '/government/industry/contract' },
      { key: 'credit', label: '信用评价体系', path: '/government/industry/credit' },
      { key: 'training', label: '行业培训考核', path: '/government/industry/training' },
    ]
  },
  {
    key: 'merchant-supervise',
    label: '商家监管',
    icon: 'ShopOutlined',
    children: [
      { key: 'gov-merchant-list', label: '商家信息查看', path: '/government/merchant/list' },
    ]
  },
  {
    key: 'complaint',
    label: '投诉处理',
    icon: 'WarningOutlined',
    children: [
      { key: 'complaint-list', label: '投诉受理', path: '/government/complaint/list' },
      { key: 'complaint-track', label: '投诉督办', path: '/government/complaint/track' },
      { key: 'complaint-stats', label: '投诉统计', path: '/government/complaint/stats' },
    ]
  },
  {
    key: 'data',
    label: '数据统计分析',
    icon: 'PieChartOutlined',
    children: [
      { key: 'data-overview', label: '运行数据总览', path: '/government/data/overview' },
      { key: 'data-quality', label: '服务质量排名', path: '/government/data/quality' },
      { key: 'data-hotspot', label: '投诉热点分析', path: '/government/data/hotspot' },
      { key: 'data-screen', label: '可视化大屏', path: '/government/data/screen' },
    ]
  },
  {
    key: 'street',
    label: '街道物业管理',
    icon: 'ApartmentOutlined',
    children: [
      { key: 'street-supervise', label: '日常监督', path: '/government/street/supervise' },
      { key: 'street-dispute', label: '纠纷调解', path: '/government/street/dispute' },
      { key: 'street-coordinate', label: '社区协调', path: '/government/street/coordinate' },
      { key: 'street-emergency', label: '应急管理', path: '/government/street/emergency' },
      { key: 'street-report', label: '数据上报', path: '/government/street/report' },
    ]
  },
  {
    key: 'community',
    label: '社区管理',
    icon: 'TeamOutlined',
    children: [
      { key: 'community-service', label: '基层服务', path: '/government/community/service' },
      { key: 'community-activity', label: '活动组织', path: '/government/community/activity' },
      { key: 'community-notice', label: '信息发布', path: '/government/community/notice' },
      { key: 'community-grid', label: '网格化管理', path: '/government/community/grid' },
      { key: 'community-resident', label: '居民沟通', path: '/government/community/resident' },
    ]
  },
  {
    key: 'special',
    label: '专项管理',
    icon: 'ToolOutlined',
    children: [
      { key: 'fund-supervise', label: '维修资金监督', path: '/government/special/fund' },
      { key: 'renovation', label: '老旧小区改造', path: '/government/special/renovation' },
      { key: 'garbage', label: '垃圾分类监管', path: '/government/special/garbage' },
    ]
  },
];

// 物业管理端菜单
export const propertyMenus: MenuItem[] = [
  {
    key: 'dashboard',
    label: '工作台',
    icon: 'DashboardOutlined',
    path: '/property/dashboard'
  },
  {
    key: 'asset',
    label: '资产管理',
    icon: 'HomeOutlined',
    children: [
      { key: 'asset-overview', label: '资产总览', path: '/property/asset/overview' },
      { key: 'building', label: '楼栋管理', path: '/property/asset/building' },
      { key: 'house', label: '房屋管理', path: '/property/asset/house' },
      { key: 'parking', label: '车位管理', path: '/property/asset/parking' },
      { key: 'data-sync', label: '数据同步', path: '/property/asset/sync' },
    ]
  },
  {
    key: 'owner',
    label: '业主管理',
    icon: 'TeamOutlined',
    children: [
      { key: 'owner-archive', label: '业主档案', path: '/property/owner/archive' },
      { key: 'owner-members', label: '业主成员', path: '/property/owner/members' },
      { key: 'owner-accounts', label: '业主账户', path: '/property/owner/accounts' },
    ]
  },
  {
    key: 'merchant',
    label: '商家管理',
    icon: 'ShopOutlined',
    children: [
      { key: 'prop-merchant-list', label: '商家列表', path: '/property/merchant/list' },
    ]
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      { key: 'staff-list', label: '账号管理', path: '/property/staff/list' },
      { key: 'role-mgmt', label: '角色管理', path: '/property/roles' },
      { key: 'prop-organization', label: '组织架构管理', path: '/property/organization' },
    ]
  },
  {
    key: 'daily',
    label: '日常管理',
    icon: 'ScheduleOutlined',
    children: [
      { key: 'todo', label: '待办事项', path: '/property/daily/todo' },
      { key: 'schedule', label: '值班管理', path: '/property/daily/schedule' },
      { key: 'notice', label: '通知公告', path: '/property/daily/notice' },
      { key: 'document', label: '内部文件', path: '/property/daily/document' },
    ]
  },
  {
    key: 'service',
    label: '服务管理',
    icon: 'CustomerServiceOutlined',
    children: [
      { key: 'service-standard', label: '服务标准', path: '/property/service/standard' },
      { key: 'service-satisfaction', label: '满意度评价', path: '/property/service/satisfaction' },
      { key: 'service-value', label: '增值服务', path: '/property/service/value' },
    ]
  },
  {
    key: 'security',
    label: '安全管理',
    icon: 'SafetyOutlined',
    children: [
      { key: 'security-check', label: '安全检查', path: '/property/security/check' },
      { key: 'security-fire', label: '消防管理', path: '/property/security/fire' },
      { key: 'security-emergency', label: '应急预案', path: '/property/security/emergency' },
    ]
  },
  {
    key: 'finance',
    label: '收费管理',
    icon: 'DollarOutlined',
    children: [
      { key: 'fee-items', label: '费用项目管理', path: '/property/finance/fee-items' },
      { key: 'charge-rules', label: '收费标准设置', path: '/property/finance/charge-rules' },
      { key: 'bills', label: '账单管理', path: '/property/finance/bills' },
      { key: 'payments', label: '缴费管理', path: '/property/finance/payments' },
      { key: 'collection', label: '催缴管理', path: '/property/finance/collection' },
      { key: 'reports', label: '收费报表', path: '/property/finance/reports' },
    ]
  },
  {
    key: 'device',
    label: '设备管理',
    icon: 'SettingOutlined',
    children: [
      { key: 'device-asset', label: '设备台账', path: '/property/device/asset' },
      { key: 'device-inspect', label: '设备巡检', path: '/property/device/inspect' },
      { key: 'device-energy', label: '能耗管理', path: '/property/device/energy' },
    ]
  },
  {
    key: 'staff',
    label: '人员管理',
    icon: 'TeamOutlined',
    children: [
      { key: 'staff-archive', label: '员工档案', path: '/property/staff/archive' },
      { key: 'staff-attendance', label: '考勤管理', path: '/property/staff/attendance' },
      { key: 'staff-performance', label: '绩效考核', path: '/property/staff/performance' },
    ]
  },
  {
    key: 'complaint',
    label: '投诉处理',
    icon: 'WarningOutlined',
    children: [
      { key: 'prop-complaint-list', label: '投诉受理', path: '/property/complaint/list' },
      { key: 'prop-complaint-stats', label: '投诉统计', path: '/property/complaint/stats' },
    ]
  },
  {
    key: 'workorder',
    label: '报事报修管理',
    icon: 'FileTextOutlined',
    children: [
      { key: 'prop-workorder-list', label: '工单管理', path: '/property/workorder/list' },
      { key: 'prop-workorder-stats', label: '工单统计', path: '/property/workorder/stats' },
    ]
  },
  {
    key: 'contract',
    label: '采购/服务合同',
    icon: 'FileProtectOutlined',
    path: '/property/contract'
  },
  {
    key: 'quality',
    label: '品质管理',
    icon: 'StarOutlined',
    path: '/property/quality'
  },
  // 保安管理
  {
    key: 'security-guard',
    label: '保安管理',
    icon: 'SafetyOutlined',
    children: [
      { key: 'guard-patrol', label: '巡逻管理', path: '/property/security-guard/patrol' },
      { key: 'guard-monitor', label: '安全监控', path: '/property/security-guard/monitor' },
      { key: 'guard-visitor', label: '访客登记', path: '/property/security-guard/visitor' },
      { key: 'guard-parking', label: '停车收费执行', path: '/property/security-guard/parking' },
      { key: 'guard-intercom', label: '对讲系统使用', path: '/property/security-guard/intercom' },
    ]
  },
  // 保洁管理
  {
    key: 'cleaning',
    label: '保洁管理',
    icon: 'CustomerServiceOutlined',
    children: [
      { key: 'clean-plan', label: '清洁计划', path: '/property/cleaning/plan' },
      { key: 'clean-execute', label: '清洁执行', path: '/property/cleaning/execute' },
      { key: 'clean-garbage', label: '垃圾处理', path: '/property/cleaning/garbage' },
      { key: 'clean-disinfect', label: '消杀管理', path: '/property/cleaning/disinfect' },
    ]
  },
  // 维保管理
  {
    key: 'maintenance',
    label: '维保管理',
    icon: 'ToolOutlined',
    children: [
      { key: 'maint-equip', label: '设备维护', path: '/property/maintenance/equipment' },
      { key: 'maint-inspect', label: '巡检管理', path: '/property/maintenance/inspect' },
      { key: 'maint-parts', label: '备件管理', path: '/property/maintenance/parts' },
      { key: 'maint-special', label: '专项维修', path: '/property/maintenance/special' },
    ]
  },
  // 绿化管理
  {
    key: 'greening',
    label: '绿化管理',
    icon: 'BulbOutlined',
    children: [
      { key: 'green-plan', label: '绿化养护计划', path: '/property/greening/plan' },
      { key: 'green-execute', label: '绿化养护执行', path: '/property/greening/execute' },
      { key: 'green-inspect', label: '绿化巡检', path: '/property/greening/inspect' },
      { key: 'green-quality', label: '绿化质量评估', path: '/property/greening/quality' },
    ]
  },
  {
    key: 'owner-config',
    label: '业主端管理',
    icon: 'AppstoreOutlined',
    children: [
      { key: 'owner-banner', label: 'Banner配置管理', path: '/property/owner-config/banner' },
      { key: 'owner-quick-menu', label: '常用菜单配置', path: '/property/owner-config/quick-menu' },
      { key: 'owner-service', label: '服务功能配置', path: '/property/owner-config/service' },
    ]
  },
];

// 商家端菜单
export const merchantMenus: MenuItem[] = [
  {
    key: 'dashboard',
    label: '工作台',
    icon: 'DashboardOutlined',
    path: '/merchant/dashboard'
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      { key: 'mcht-staff-list', label: '账号管理', path: '/merchant/staff/list' },
      { key: 'mcht-role-mgmt', label: '角色管理', path: '/merchant/roles' },
      { key: 'mcht-organization', label: '组织架构管理', path: '/merchant/organization' },
    ]
  },
  {
    key: 'shop',
    label: '店铺管理',
    icon: 'ShopOutlined',
    children: [
      { key: 'shop-info', label: '店铺信息', path: '/merchant/shop/info' },
      { key: 'shop-cert', label: '资质认证', path: '/merchant/shop/cert' },
      { key: 'shop-decorate', label: '店铺装修', path: '/merchant/shop/decorate' },
    ]
  },
  {
    key: 'product',
    label: '商品/服务管理',
    icon: 'AppstoreOutlined',
    children: [
      { key: 'product-list', label: '商品管理', path: '/merchant/product/list' },
      { key: 'product-category', label: '分类管理', path: '/merchant/product/category' },
      { key: 'service-mgmt', label: '服务项目管理', path: '/merchant/product/service' },
    ]
  },
  {
    key: 'order',
    label: '订单管理',
    icon: 'UnorderedListOutlined',
    path: '/merchant/order'
  },
  {
    key: 'marketing',
    label: '营销活动',
    icon: 'BulbOutlined',
    children: [
      { key: 'coupon', label: '优惠券管理', path: '/merchant/marketing/coupon' },
      { key: 'promotion', label: '促销活动', path: '/merchant/marketing/promotion' },
      { key: 'group-buy', label: '拼团秒杀', path: '/merchant/marketing/group' },
    ]
  },
  {
    key: 'finance',
    label: '财务管理',
    icon: 'DollarOutlined',
    path: '/merchant/finance'
  },
  {
    key: 'customer',
    label: '客户管理',
    icon: 'TeamOutlined',
    children: [
      { key: 'customer-list', label: '客户列表', path: '/merchant/customer/list' },
      { key: 'member', label: '会员管理', path: '/merchant/customer/member' },
      { key: 'feedback', label: '客户反馈', path: '/merchant/customer/feedback' },
    ]
  },
  {
    key: 'data',
    label: '数据统计',
    icon: 'BarChartOutlined',
    path: '/merchant/data'
  },
];
