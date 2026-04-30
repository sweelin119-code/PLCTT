import React from 'react';
import OrganizationManage from '../pages/property/OrganizationManage';
import RepairOrderManage from '../pages/property/RepairOrderManage';
import ComplaintManage from '../pages/property/ComplaintManage';
import ComplaintSupervise from '../pages/government/ComplaintSupervise';
import ComplaintStats from '../pages/government/ComplaintStats';
import OwnerRepair from '../pages/owner/OwnerRepair';
import OwnerComplaint from '../pages/owner/OwnerComplaint';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppstoreOutlined, BankOutlined, ShopOutlined, WechatOutlined, TeamOutlined, MessageOutlined, SettingOutlined, HomeOutlined, CloudSyncOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

import PCLayout from '../layouts/PCLayout';
import AuthGuard from '../components/AuthGuard';
import GovernmentDashboard from '../pages/government/Dashboard';
import PolicyManagement from '../pages/government/PolicyManagement';
import StreetOffice from '../pages/government/StreetOffice';
import CommunityOffice from '../pages/government/CommunityOffice';
import PropertyDashboard from '../pages/property/Dashboard';
import MerchantDashboard from '../pages/merchant/Dashboard';
import WeChatMessageTemplate from '../pages/wechat/WeChatMessageTemplate';

// 业主端微信 H5 页面
import WeChatLayout from '../pages/owner/WeChatLayout';
import OwnerHome from '../pages/owner/Home';
import OwnerServices from '../pages/owner/Services';
import OwnerNotice from '../pages/owner/Notice';
import OwnerMine from '../pages/owner/Mine';

// 门户页
import PortalPage from '../pages/portal/PortalPage';

// 账号体系相关页面
import Login from '../pages/login/Login';
import StaffList from '../pages/property/StaffList';
import StaffEdit from '../pages/property/StaffEdit';
import RoleManage from '../pages/property/RoleManage';
import PortConfig from '../pages/superadmin/PortConfig';

// 企业相关页面
import QualificationReview from '../pages/government/QualificationReview';
import CompanyList from '../pages/government/CompanyList';
import CompanyRegister from '../pages/property/CompanyRegister';

// 商家管理相关页面
import MerchantManage from '../pages/property/MerchantManage';
import MerchantList from '../pages/government/MerchantList';

// 业主端配置管理页面
import BannerConfigManage from '../pages/property/BannerConfigManage';
import QuickMenuConfig from '../pages/property/QuickMenuConfig';
import ServiceConfigManage from '../pages/property/ServiceConfigManage';

// 资产管理页面
import AssetOverview from '../pages/property/asset/AssetOverview';
import BuildingManage from '../pages/property/asset/BuildingManage';
import HouseManage from '../pages/property/asset/HouseManage';
import ParkingManage from '../pages/property/asset/ParkingManage';

// 业主管理页面
import OwnerManage from '../pages/property/owner/OwnerManage';

// 数据同步页面
import GovDataSync from '../pages/property/sync/GovDataSync';

// 收费管理页面
import FeeItemManage from '../pages/property/finance/FeeItemManage';
import ChargeRuleManage from '../pages/property/finance/ChargeRuleManage';
import BillManage from '../pages/property/finance/BillManage';
import PaymentManage from '../pages/property/finance/PaymentManage';
import CollectionManage from '../pages/property/finance/CollectionManage';
import ReportManage from '../pages/property/finance/ReportManage';

// 政府端资产查看页面
import GovernmentAssetView from '../pages/government/asset/GovernmentAssetView';

// 门户内容管理页面
import PolicyInfoManage from '../pages/government/PolicyInfoManage';
import PolicyInfoEdit from '../pages/government/PolicyInfoEdit';
import InfoCategoryManage from '../pages/government/InfoCategoryManage';
import ManagementRuleManage from '../pages/government/ManagementRuleManage';
import ManagementRuleEdit from '../pages/government/ManagementRuleEdit';

// 门户详情/列表页
import PolicyInfoDetail from '../pages/portal/PolicyInfoDetail';
import ManagementRuleDetail from '../pages/portal/ManagementRuleDetail';
import ContentListPage from '../pages/portal/ContentListPage';

// 将 menuConfig 中的菜单项转换为 antd Menu 可用的格式
import { governmentMenus, propertyMenus, merchantMenus, type MenuItem } from '../utils/menuConfig';

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <AppstoreOutlined />,
  FileTextOutlined: <MessageOutlined />,
  BankOutlined: <BankOutlined />,
  SafetyCertificateOutlined: <SettingOutlined />,
  WarningOutlined: <MessageOutlined />,
  PieChartOutlined: <AppstoreOutlined />,
  ToolOutlined: <SettingOutlined />,
  ScheduleOutlined: <AppstoreOutlined />,
  CustomerServiceOutlined: <TeamOutlined />,
  SafetyOutlined: <SettingOutlined />,
  DollarOutlined: <AppstoreOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  FileProtectOutlined: <MessageOutlined />,
  StarOutlined: <AppstoreOutlined />,
  ShopOutlined: <ShopOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  UnorderedListOutlined: <MessageOutlined />,
  BulbOutlined: <AppstoreOutlined />,
  BarChartOutlined: <AppstoreOutlined />,
  HomeOutlined: <HomeOutlined />,
  CloudSyncOutlined: <CloudSyncOutlined />,
};

// 转换菜单项为 antd Menu 格式
const convertToAntdMenu = (items: MenuItem[]): MenuProps['items'] => {
  return items.map(item => {
    const result: any = {
      key: item.path || item.key,
      label: item.label,
      icon: item.icon ? iconMap[item.icon] : undefined,
    };
    if (item.children) {
      result.children = convertToAntdMenu(item.children);
    }
    return result;
  });
};

const governmentMenuItems = convertToAntdMenu(governmentMenus);
const propertyMenuItems = convertToAntdMenu(propertyMenus);
const merchantMenuItems = convertToAntdMenu(merchantMenus);

const router = createBrowserRouter([
  // 登录页（无需登录）
  {
    path: '/login',
    element: <Login />,
  },
  // 门户页（首页）
  {
    path: '/',
    element: <PortalPage />,
  },
  // 门户详情页
  {
    path: '/info/:id',
    element: <PolicyInfoDetail />,
  },
  {
    path: '/rule/:id',
    element: <ManagementRuleDetail />,
  },
  {
    path: '/info/list',
    element: <ContentListPage />,
  },
  {
    path: '/rule/list',
    element: <ContentListPage />,
  },
  // 企业入驻（无需登录）
  {
    path: '/company/register',
    element: <CompanyRegister />,
  },
  // 政府监管端路由
  {
    path: '/government',
    element: <AuthGuard><PCLayout menuItems={governmentMenuItems} title="政府监管端" subTitle="物业全生命周期管理系统" /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/government/dashboard" replace /> },
      { path: 'dashboard', element: <GovernmentDashboard /> },
      // 系统管理 - 账号管理
      { path: 'staff/list', element: <StaffList /> },
      { path: 'staff/add', element: <StaffEdit /> },
      { path: 'staff/edit/:id', element: <StaffEdit /> },
      // 系统管理 - 角色管理
      { path: 'roles', element: <RoleManage /> },
      // 门户内容管理
      { path: 'policy/info', element: <PolicyInfoManage /> },
      { path: 'policy/info/add', element: <PolicyInfoEdit /> },
      { path: 'policy/info/edit/:id', element: <PolicyInfoEdit /> },
      { path: 'policy/category', element: <InfoCategoryManage /> },
      { path: 'rule', element: <ManagementRuleManage /> },
      { path: 'rule/add', element: <ManagementRuleEdit /> },
      { path: 'rule/edit/:id', element: <ManagementRuleEdit /> },
      { path: 'policy', element: <PolicyManagement /> },
      { path: 'policy/enforce', element: <PolicyManagement /> },
      { path: 'industry/company', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>物业企业备案 - 开发中</div> },
      { path: 'industry/contract', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>合同备案管理 - 开发中</div> },
      { path: 'industry/credit', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>信用评价体系 - 开发中</div> },
      { path: 'industry/training', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>行业培训考核 - 开发中</div> },
      { path: 'qualification/review', element: <QualificationReview /> },
      { path: 'qualification/cert', element: <CompanyList /> },
      { path: 'qualification/annual', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>年检续期 - 开发中</div> },
      // 商家监管
      { path: 'merchant/list', element: <MerchantList /> },
      { path: 'complaint/list', element: <ComplaintSupervise /> },
      { path: 'complaint/track', element: <ComplaintSupervise /> },
      { path: 'complaint/stats', element: <ComplaintStats /> },
      { path: 'data/overview', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>运行数据总览 - 开发中</div> },
      { path: 'data/quality', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>服务质量排名 - 开发中</div> },
      { path: 'data/hotspot', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>投诉热点分析 - 开发中</div> },
      { path: 'data/screen', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>可视化大屏 - 开发中</div> },
      // 资产查看
      { path: 'asset/view', element: <GovernmentAssetView /> },
      // 组织架构管理
      { path: 'organization', element: <OrganizationManage /> },
      // 街道物业管理部门路由
      { path: 'street/supervise', element: <StreetOffice /> },
      { path: 'street/dispute', element: <StreetOffice /> },
      { path: 'street/coordinate', element: <StreetOffice /> },
      { path: 'street/emergency', element: <StreetOffice /> },
      { path: 'street/report', element: <StreetOffice /> },
      // 社区管理部门路由
      { path: 'community/service', element: <CommunityOffice /> },
      { path: 'community/activity', element: <CommunityOffice /> },
      { path: 'community/notice', element: <CommunityOffice /> },
      { path: 'community/grid', element: <CommunityOffice /> },
      { path: 'community/resident', element: <CommunityOffice /> },
      { path: 'special/fund', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>维修资金监督 - 开发中</div> },
      { path: 'special/renovation', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>老旧小区改造 - 开发中</div> },
      { path: 'special/garbage', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>垃圾分类监管 - 开发中</div> },
    ],
  },
  // 物业管理端路由
  {
    path: '/property',
    element: <AuthGuard><PCLayout menuItems={propertyMenuItems} title="物业管理端" subTitle="物业全生命周期管理系统" showCommunitySwitcher /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/property/dashboard" replace /> },
      { path: 'dashboard', element: <PropertyDashboard /> },

      // 商家管理
      { path: 'merchant/list', element: <MerchantManage /> },
      // 人员管理
      { path: 'staff/list', element: <StaffList /> },
      { path: 'staff/add', element: <StaffEdit /> },
      { path: 'staff/edit/:id', element: <StaffEdit /> },
      // 角色管理
      { path: 'roles', element: <RoleManage /> },
      { path: 'daily/todo', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>待办事项 - 开发中</div> },
      { path: 'daily/schedule', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>值班排班 - 开发中</div> },
      { path: 'daily/notice', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>通知公告 - 开发中</div> },
      { path: 'daily/document', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>内部文件 - 开发中</div> },
      { path: 'service/standard', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>服务标准 - 开发中</div> },
      { path: 'service/satisfaction', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>满意度评价 - 开发中</div> },
      { path: 'service/value', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>增值服务 - 开发中</div> },
      { path: 'security/check', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>安全检查 - 开发中</div> },
      { path: 'security/fire', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>消防管理 - 开发中</div> },
      { path: 'security/emergency', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>应急预案 - 开发中</div> },
      // 收费管理
      { path: 'finance/fee-items', element: <FeeItemManage /> },
      { path: 'finance/charge-rules', element: <ChargeRuleManage /> },
      { path: 'finance/bills', element: <BillManage /> },
      { path: 'finance/payments', element: <PaymentManage /> },
      { path: 'finance/collection', element: <CollectionManage /> },
      { path: 'finance/reports', element: <ReportManage /> },
      { path: 'device/asset', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>设备台账 - 开发中</div> },
      { path: 'device/inspect', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>设备巡检 - 开发中</div> },
      { path: 'device/energy', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>能耗管理 - 开发中</div> },
      { path: 'staff/archive', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>员工档案 - 开发中</div> },
      { path: 'staff/attendance', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>考勤管理 - 开发中</div> },
      { path: 'staff/performance', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>绩效考核 - 开发中</div> },
      { path: 'complaint/list', element: <ComplaintManage /> },
      { path: 'complaint/stats', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>投诉统计 - 开发中</div> },
      { path: 'workorder/list', element: <RepairOrderManage /> },
      { path: 'workorder/stats', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>工单统计 - 开发中</div> },
      { path: 'contract', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>合同管理 - 开发中</div> },
      { path: 'quality', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>品质管理 - 开发中</div> },
      // 组织架构管理
      { path: 'organization', element: <OrganizationManage /> },
      // 业主端管理
      { path: 'owner-config/banner', element: <BannerConfigManage /> },
      { path: 'owner-config/quick-menu', element: <QuickMenuConfig /> },
      { path: 'owner-config/service', element: <ServiceConfigManage /> },
      // 资产管理
      { path: 'asset/overview', element: <AssetOverview /> },
      { path: 'asset/building', element: <BuildingManage /> },
      { path: 'asset/house', element: <HouseManage /> },
      { path: 'asset/parking', element: <ParkingManage /> },
      // 业主管理
      { path: 'owner/archive', element: <OwnerManage /> },
      // 资产管理 - 数据同步
      { path: 'asset/sync', element: <GovDataSync /> },
      // 企业入驻（重定向到顶层路由）
      { path: 'company/register', element: <Navigate to="/company/register" replace /> },
    ],
  },
  // 商家端路由
  {
    path: '/merchant',
    element: <AuthGuard><PCLayout menuItems={merchantMenuItems} title="商家管理端" subTitle="物业全生命周期管理系统" /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/merchant/dashboard" replace /> },
      { path: 'dashboard', element: <MerchantDashboard /> },
      // 系统管理 - 账号管理
      { path: 'staff/list', element: <StaffList /> },
      { path: 'staff/add', element: <StaffEdit /> },
      { path: 'staff/edit/:id', element: <StaffEdit /> },
      // 系统管理 - 角色管理
      { path: 'roles', element: <RoleManage /> },
      // 组织架构管理
      { path: 'organization', element: <OrganizationManage /> },
      { path: 'shop/info', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>店铺信息 - 开发中</div> },
      { path: 'shop/cert', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>资质认证 - 开发中</div> },
      { path: 'shop/decorate', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>店铺装修 - 开发中</div> },
      { path: 'product/list', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>商品管理 - 开发中</div> },
      { path: 'product/category', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>分类管理 - 开发中</div> },
      { path: 'product/service', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>服务项目管理 - 开发中</div> },
      { path: 'order', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>订单管理 - 开发中</div> },
      { path: 'marketing/coupon', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>优惠券管理 - 开发中</div> },
      { path: 'marketing/promotion', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>促销活动 - 开发中</div> },
      { path: 'marketing/group', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>拼团秒杀 - 开发中</div> },
      { path: 'finance', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>财务管理 - 开发中</div> },
      { path: 'customer/list', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>客户列表 - 开发中</div> },
      { path: 'customer/member', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>会员管理 - 开发中</div> },
      { path: 'customer/feedback', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>客户反馈 - 开发中</div> },
      { path: 'data', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>数据统计 - 开发中</div> },
    ],
  },
  // 超级管理端路由
  {
    path: '/superadmin',
    element: <AuthGuard><PCLayout menuItems={[
      { key: '/superadmin/port-config', label: '端口配置', icon: <AppstoreOutlined /> },
      { key: '/superadmin/system', label: '系统管理', icon: <SettingOutlined />, children: [
        { key: '/superadmin/staff/list', label: '账号管理', icon: <TeamOutlined /> },
        { key: '/superadmin/roles', label: '角色管理', icon: <SettingOutlined /> },
        { key: '/superadmin/organization', label: '组织架构管理', icon: <ApartmentOutlined /> },
      ]},
      { key: '/superadmin/wechat', label: '公众号管理', icon: <WechatOutlined />, children: [
        { key: '/superadmin/wechat/templates', label: '消息模板管理', icon: <MessageOutlined /> },
        { key: '/superadmin/wechat/users', label: '粉丝管理', icon: <TeamOutlined /> },
        { key: '/superadmin/wechat/messages', label: '消息记录', icon: <MessageOutlined /> },
        { key: '/superadmin/wechat/settings', label: '公众号设置', icon: <SettingOutlined /> },
      ]},
    ]} title="超级管理端" subTitle="系统全局配置管理" /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/superadmin/port-config" replace /> },
      { path: 'port-config', element: <PortConfig /> },
      // 系统管理
      { path: 'staff/list', element: <StaffList /> },
      { path: 'staff/add', element: <StaffEdit /> },
      { path: 'staff/edit/:id', element: <StaffEdit /> },
      { path: 'roles', element: <RoleManage /> },
      // 组织架构管理
      { path: 'organization', element: <OrganizationManage /> },
      // 公众号管理
      { path: 'wechat/templates', element: <WeChatMessageTemplate /> },
      { path: 'wechat/users', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>粉丝管理 - 开发中</div> },
      { path: 'wechat/messages', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>消息记录 - 开发中</div> },
      { path: 'wechat/settings', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>公众号设置 - 开发中</div> },
    ],
  },
  // 业主端微信 H5 路由（独立布局）
  {
    path: '/owner',
    element: <AuthGuard><WeChatLayout><Outlet /></WeChatLayout></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/owner/home" replace /> },
      { path: 'home', element: <OwnerHome /> },
      { path: 'services', element: <OwnerServices /> },
      { path: 'notice', element: <OwnerNotice /> },
      { path: 'mine', element: <OwnerMine /> },
      // 占位路由
      { path: 'repair', element: <OwnerRepair /> },
      { path: 'payment', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>物业缴费 - 开发中</div> },
      { path: 'parking', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>停车服务 - 开发中</div> },
      { path: 'access', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>门禁管理 - 开发中</div> },
      { path: 'complaint', element: <OwnerComplaint /> },
      { path: 'express', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>快递服务 - 开发中</div> },
      { path: 'decoration', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>装修申请 - 开发中</div> },
      { path: 'vote', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>投票表决 - 开发中</div> },
      { path: 'community', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>邻里互助 - 开发中</div> },
      { path: 'activities', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>社区活动 - 开发中</div> },
      { path: 'shops', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>周边商家 - 开发中</div> },
      { path: 'services/housekeeping', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>家政保洁 - 开发中</div> },
      { path: 'services/appliance', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>家电维修 - 开发中</div> },
      { path: 'services/groupbuy', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>社区团购 - 开发中</div> },
      { path: 'services/moving', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>搬家服务 - 开发中</div> },
      { path: 'services/greening', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>绿化服务 - 开发中</div> },
      { path: 'services/nanny', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>家政月嫂 - 开发中</div> },
      // 我的相关路由
      { path: 'mine/repairs', element: <OwnerRepair /> },
      { path: 'mine/payments', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>缴费记录 - 开发中</div> },
      { path: 'mine/expresses', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>我的快递 - 开发中</div> },
      { path: 'mine/coupons', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>我的优惠券 - 开发中</div> },
      { path: 'mine/houses', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>我的房屋 - 开发中</div> },
      { path: 'mine/votes', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>我的投票 - 开发中</div> },
      { path: 'mine/complaints', element: <OwnerComplaint /> },
      { path: 'mine/activities', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>我的活动 - 开发中</div> },
      { path: 'mine/profile', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>个人信息 - 开发中</div> },
      { path: 'mine/notify-settings', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>消息设置 - 开发中</div> },
      { path: 'mine/security', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>账号安全 - 开发中</div> },
      { path: 'mine/help', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>使用帮助 - 开发中</div> },
      { path: 'mine/about', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>关于我们 - 开发中</div> },
    ],
  },
  // 404
  {
    path: '*',
    element: <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>404 - 页面不存在</div>,
  },
]);

export default router;
