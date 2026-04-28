// 菜单配置 - 定义各端的导航菜单结构

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  path?: string;
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
    ]
  },
  {
    key: 'policy',
    label: '政策监管',
    icon: 'FileTextOutlined',
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
    key: 'enterprise',
    label: '企业入驻',
    icon: 'BankOutlined',
    path: '/property/company/register'
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
    ]
  },
  {
    key: 'daily',
    label: '日常管理',
    icon: 'ScheduleOutlined',
    children: [
      { key: 'todo', label: '待办事项', path: '/property/daily/todo' },
      { key: 'schedule', label: '值班排班', path: '/property/daily/schedule' },
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
    label: '财务管理',
    icon: 'DollarOutlined',
    children: [
      { key: 'property-fee', label: '物业费管理', path: '/property/finance/fee' },
      { key: 'parking-fee', label: '停车费管理', path: '/property/finance/parking' },
      { key: 'repair-fund', label: '维修资金', path: '/property/finance/repair-fund' },
      { key: 'report', label: '财务报表', path: '/property/finance/report' },
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
    label: '维修工单',
    icon: 'FileTextOutlined',
    children: [
      { key: 'prop-workorder-list', label: '工单管理', path: '/property/workorder/list' },
      { key: 'prop-workorder-stats', label: '工单统计', path: '/property/workorder/stats' },
    ]
  },
  {
    key: 'contract',
    label: '合同管理',
    icon: 'FileProtectOutlined',
    path: '/property/contract'
  },
  {
    key: 'quality',
    label: '品质管理',
    icon: 'StarOutlined',
    path: '/property/quality'
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
