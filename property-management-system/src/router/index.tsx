import React from 'react';
import OrganizationManage from '../pages/property/OrganizationManage';
import RepairOrderManage from '../pages/property/RepairOrderManage';
import ComplaintManage from '../pages/property/ComplaintManage';
import ComplaintSupervise from '../pages/government/ComplaintSupervise';
import ComplaintStats from '../pages/government/ComplaintStats';
import OwnerRepair from '../pages/owner/OwnerRepair';
import OwnerComplaint from '../pages/owner/OwnerComplaint';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppstoreOutlined, BankOutlined, ShopOutlined, WechatOutlined, TeamOutlined, MessageOutlined, SettingOutlined, HomeOutlined, CloudSyncOutlined, ApartmentOutlined, SafetyCertificateOutlined, PieChartOutlined, BarChartOutlined, KeyOutlined } from '@ant-design/icons';
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
import MyBills from '../pages/owner/MyBills';
import BillDetailPage from '../pages/owner/BillDetail';
import PaymentConfirm from '../pages/owner/PaymentConfirm';
import PaymentSuccess from '../pages/owner/PaymentSuccess';
import InvoiceApply from '../pages/owner/InvoiceApply';
import MyParking from '../pages/owner/MyParking';
import VehicleRecords from '../pages/owner/VehicleRecords';
import ParkingRent from '../pages/owner/ParkingRent';
import ParkingShare from '../pages/owner/ParkingShare';
import OwnerVotePage from '../pages/owner/VotePage';
import AssemblyResolution from '../pages/property/AssemblyResolution';

// 门户页
import PortalPage from '../pages/portal/PortalPage';

// 账号体系相关页面
import Login from '../pages/login/Login';
import StaffList from '../pages/property/StaffList';
import StaffEdit from '../pages/property/StaffEdit';
import RoleManage from '../pages/property/RoleManage';
import PortConfig from '../pages/superadmin/PortConfig';
import MenuConfigPage from '../pages/superadmin/MenuConfigPage';

// 企业相关页面
import QualificationReview from '../pages/government/QualificationReview';
import CompanyList from '../pages/government/CompanyList';
import CompanyRegister from '../pages/property/CompanyRegister';

// 商家管理相关页面
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
import OwnerMemberManage from '../pages/property/owner/OwnerMemberManage';
import OwnerAccountManage from '../pages/property/owner/OwnerAccountManage';

// 数据同步页面
import GovDataSync from '../pages/property/sync/GovDataSync';

// 智能门禁页面
import DoorAccess from '../pages/owner/DoorAccess';

// 访客管理页面
import VisitorManage from '../pages/property/security/VisitorManage';

// 门禁设备管理页面
import DoorDeviceManage from '../pages/property/security/DoorDeviceManage';

// 业委会端页面
import CommitteeDashboard from '../pages/committee/Dashboard';
import CommitteeMemberManage from '../pages/committee/MemberManage';
import CommitteeMeetingManage from '../pages/committee/MeetingManage';
import CommitteeAssemblyManage from '../pages/committee/AssemblyManage';
import CommitteeFundReview from '../pages/committee/FundReview';
import CommitteeCoordination from '../pages/committee/Coordination';
import CommitteeNoticeManage from '../pages/committee/NoticeManage';
import CommitteeCommunication from '../pages/committee/Communication';
import CommitteeArchiveManage from '../pages/committee/ArchiveManage';
import CommitteeSystemSettings from '../pages/committee/SystemSettings';

// 收费管理页面
import FeeItemManage from '../pages/property/finance/FeeItemManage';
import BillManage from '../pages/property/finance/BillManage';
import PaymentManage from '../pages/property/finance/PaymentManage';
import CollectionManage from '../pages/property/finance/CollectionManage';
import ReportManage from '../pages/property/finance/ReportManage';
import ParkingFeeManage from '../pages/property/finance/ParkingFeeManage';
import ParkingFeeRateManage from '../pages/property/finance/ParkingFeeRateManage';
import ParkingFeeStats from '../pages/property/finance/ParkingFeeStats';
import HouseFeeItemManage from '../pages/property/finance/HouseFeeItemManage';
import ParkingFeeItemManage from '../pages/property/finance/ParkingFeeItemManage';

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
import { getPortMenus, type MenuItem } from '../utils/menuConfig';

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
  KeyOutlined: <KeyOutlined />,
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

/**
 * 从端口配置中获取动态菜单并转换为 antd Menu 格式
 * @param portType 端口类型（government/property/merchant）
 */
const getDynamicMenuItems = (portType: string): MenuProps['items'] => {
  const menus = getPortMenus(portType);
  return convertToAntdMenu(menus);
};

const GovernmentLayout: React.FC = () => {
  const menuItems = getDynamicMenuItems('government');
  return <AuthGuard><PCLayout menuItems={menuItems} title="政府监管端" subTitle="物业全生命周期管理系统" /></AuthGuard>;
};

const PropertyLayout: React.FC = () => {
  const menuItems = getDynamicMenuItems('property');
  return <AuthGuard><PCLayout menuItems={menuItems} title="物业管理端" subTitle="物业全生命周期管理系统" showCommunitySwitcher /></AuthGuard>;
};

const MerchantLayout: React.FC = () => {
  const menuItems = getDynamicMenuItems('merchant');
  return <AuthGuard><PCLayout menuItems={menuItems} title="商家管理端" subTitle="物业全生命周期管理系统" /></AuthGuard>;
};

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
    element: <GovernmentLayout />,
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
    element: <PropertyLayout />,
    children: [
      { index: true, element: <Navigate to="/property/dashboard" replace /> },
      { path: 'dashboard', element: <PropertyDashboard /> },

      // 收费管理
      { path: 'finance/fee-items', element: <FeeItemManage /> },
      { path: 'finance/house-fee-items', element: <HouseFeeItemManage /> },
      { path: 'finance/bills', element: <BillManage /> },
      { path: 'finance/payments', element: <PaymentManage /> },
      { path: 'finance/collection', element: <CollectionManage /> },
      { path: 'finance/reports', element: <ReportManage /> },
      // 停车收费管理
      { path: 'finance/parking-fee', element: <ParkingFeeManage /> },
      { path: 'finance/parking-fee-rates', element: <ParkingFeeRateManage /> },
      { path: 'finance/parking-fee-stats', element: <ParkingFeeStats /> },
      { path: 'finance/parking-fee-items', element: <ParkingFeeItemManage /> },

      // 报事报修（原维修工单）
      { path: 'repair/order', element: <RepairOrderManage /> },
      { path: 'repair/submit', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>提交报修 - 开发中</div> },
      { path: 'repair/type-config', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>报修类型配置 - 开发中</div> },
      { path: 'repair/stats', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>报修统计 - 开发中</div> },

      // 投诉建议（原投诉处理）
      { path: 'complaint/list', element: <ComplaintManage /> },
      { path: 'complaint/type-config', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>投诉类型配置 - 开发中</div> },
      { path: 'complaint/stats', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>投诉统计 - 开发中</div> },

      // 资产管理
      { path: 'asset/overview', element: <AssetOverview /> },
      { path: 'asset/building', element: <BuildingManage /> },
      { path: 'asset/house', element: <HouseManage /> },
      { path: 'asset/parking', element: <ParkingManage /> },
      { path: 'asset/sync', element: <GovDataSync /> },

      // 业主管理
      { path: 'owner/archive', element: <OwnerManage /> },
      { path: 'owner/members', element: <OwnerMemberManage /> },
      { path: 'owner/accounts', element: <OwnerAccountManage /> },

      // 安保管理（原保安管理改名）
      { path: 'security-guard/patrol', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>巡逻管理 - 开发中</div> },
      { path: 'security-guard/monitor', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>安全监控 - 开发中</div> },
      { path: 'security-guard/visitor', element: <VisitorManage /> },
      { path: 'security-guard/parking', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>停车收费执行 - 开发中</div> },
      { path: 'security-guard/intercom', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>对讲系统使用 - 开发中</div> },

      // 智能门禁管理
      { path: 'security/door-devices', element: <DoorDeviceManage /> },

      // 设备管理（设备管理+维保管理合并）
      { path: 'device/type', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>设备类型 - 开发中</div> },
      { path: 'device/asset', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>设备台账 - 开发中</div> },
      { path: 'device/inspect-plan', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>巡检计划 - 开发中</div> },
      { path: 'device/inspect-task', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>巡检任务 - 开发中</div> },
      { path: 'device/inspect-record', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>巡检台账 - 开发中</div> },
      { path: 'device/energy', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>能耗管理 - 开发中</div> },

      // 日常管理
      { path: 'daily/todo', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>待办事项 - 开发中</div> },
      { path: 'daily/schedule', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>值班排班 - 开发中</div> },
      { path: 'daily/notice', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>通知公告 - 开发中</div> },
      { path: 'daily/document', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>内部文件 - 开发中</div> },
      { path: 'daily/assembly-resolution', element: <AssemblyResolution /> },

      // 员工管理（原人员管理改名）
      { path: 'staff/archive', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>员工档案 - 开发中</div> },
      { path: 'staff/attendance', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>考勤管理 - 开发中</div> },
      { path: 'staff/performance', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>绩效考核 - 开发中</div> },

      // 合同管理
      { path: 'contract', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>合同管理 - 开发中</div> },

      // 业主端管理
      { path: 'owner-config/banner', element: <BannerConfigManage /> },
      { path: 'owner-config/quick-menu', element: <QuickMenuConfig /> },
      { path: 'owner-config/service', element: <ServiceConfigManage /> },

      // 系统管理
      { path: 'staff/list', element: <StaffList /> },
      { path: 'staff/add', element: <StaffEdit /> },
      { path: 'staff/edit/:id', element: <StaffEdit /> },
      { path: 'roles', element: <RoleManage /> },
      { path: 'organization', element: <OrganizationManage /> },

      // 企业入驻（重定向到顶层路由）
      { path: 'company/register', element: <Navigate to="/company/register" replace /> },
    ],
  },
  // 商家端路由
  {
    path: '/merchant',
    element: <MerchantLayout />,
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
      { key: '/superadmin/system-config', label: '系统配置', icon: <SettingOutlined />, children: [
        { key: '/superadmin/system/config', label: '系统参数配置', icon: <SettingOutlined /> },
        { key: '/superadmin/system/dict', label: '数据字典', icon: <AppstoreOutlined /> },
      ]},
      { key: '/superadmin/logs', label: '日志管理', icon: <MessageOutlined />, children: [
        { key: '/superadmin/logs/operation', label: '操作日志', icon: <MessageOutlined /> },
        { key: '/superadmin/logs/login', label: '登录日志', icon: <TeamOutlined /> },
      ]},
      { key: '/superadmin/audit', label: '安全审计', icon: <SafetyCertificateOutlined /> },
      { key: '/superadmin/monitor', label: '系统监控', icon: <AppstoreOutlined />, children: [
        { key: '/superadmin/monitor/server', label: '服务器监控', icon: <SettingOutlined /> },
        { key: '/superadmin/monitor/api', label: '接口监控', icon: <MessageOutlined /> },
      ]},
      { key: '/superadmin/backup', label: '数据备份', icon: <CloudSyncOutlined /> },
      { key: '/superadmin/tenant', label: '多租户管理', icon: <BankOutlined /> },
      { key: '/superadmin/open', label: '开放平台', icon: <ShopOutlined />, children: [
        { key: '/superadmin/open/api', label: 'API管理', icon: <SettingOutlined /> },
      ]},
      { key: '/superadmin/data-platform', label: '数据中台', icon: <PieChartOutlined />, children: [
        { key: '/superadmin/data-platform/overview', label: '数据总览', icon: <AppstoreOutlined /> },
        { key: '/superadmin/data-platform/analysis', label: '数据分析', icon: <BarChartOutlined /> },
        { key: '/superadmin/data-platform/visualization', label: '数据可视化', icon: <PieChartOutlined /> },
        { key: '/superadmin/data-platform/governance', label: '数据治理', icon: <SettingOutlined /> },
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
      { path: 'port-config/:portKey/menus', element: <MenuConfigPage /> },
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
      // 系统配置
      { path: 'system/config', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>系统参数配置 - 开发中</div> },
      { path: 'system/dict', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>数据字典 - 开发中</div> },
      // 日志管理
      { path: 'logs/operation', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>操作日志 - 开发中</div> },
      { path: 'logs/login', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>登录日志 - 开发中</div> },
      // 安全审计
      { path: 'audit', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>安全审计 - 开发中</div> },
      // 系统监控
      { path: 'monitor/server', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>服务器监控 - 开发中</div> },
      { path: 'monitor/api', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>接口监控 - 开发中</div> },
      // 数据备份
      { path: 'backup', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>数据备份与恢复 - 开发中</div> },
      // 多租户管理
      { path: 'tenant', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>多租户管理 - 开发中</div> },
      // 开放平台
      { path: 'open/api', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>API管理 - 开发中</div> },
      // 数据中台
      { path: 'data-platform/overview', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>数据中台总览 - 开发中</div> },
      { path: 'data-platform/analysis', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>数据分析 - 开发中</div> },
      { path: 'data-platform/visualization', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>数据可视化 - 开发中</div> },
      { path: 'data-platform/governance', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>数据治理 - 开发中</div> },
    ],
  },
  // 业委会端路由
  {
    path: '/committee',
    element: <AuthGuard><PCLayout menuItems={[
      { key: '/committee/dashboard', label: '工作台', icon: <AppstoreOutlined /> },
      { key: '/committee/members', label: '成员管理', icon: <TeamOutlined /> },
      { key: '/committee/meetings', label: '会议管理', icon: <MessageOutlined /> },
      { key: '/committee/vote', label: '业主大会', icon: <AppstoreOutlined /> },
      { key: '/committee/fund', label: '维修资金监督', icon: <SettingOutlined /> },
      { key: '/committee/coordination', label: '物业协同', icon: <TeamOutlined /> },
      { key: '/committee/notice', label: '公告发布', icon: <MessageOutlined /> },
      { key: '/committee/communication', label: '业主沟通', icon: <TeamOutlined /> },
      { key: '/committee/archive', label: '档案管理', icon: <HomeOutlined /> },
      { key: '/committee/system', label: '系统管理', icon: <SettingOutlined />, children: [
        { key: '/committee/staff/list', label: '账号管理', icon: <TeamOutlined /> },
        { key: '/committee/roles', label: '角色管理', icon: <SettingOutlined /> },
      ]},
    ]} title="业委会端" subTitle="业主委员会工作平台" /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/committee/dashboard" replace /> },
      { path: 'dashboard', element: <CommitteeDashboard /> },
      { path: 'members', element: <CommitteeMemberManage /> },
      { path: 'meetings', element: <CommitteeMeetingManage /> },
      { path: 'vote', element: <CommitteeAssemblyManage /> },
      { path: 'fund', element: <CommitteeFundReview /> },
      { path: 'coordination', element: <CommitteeCoordination /> },
      { path: 'notice', element: <CommitteeNoticeManage /> },
      { path: 'communication', element: <CommitteeCommunication /> },
      { path: 'archive', element: <CommitteeArchiveManage /> },
      { path: 'staff/list', element: <CommitteeSystemSettings /> },
      { path: 'roles', element: <CommitteeSystemSettings /> },
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
      { path: 'bills', element: <MyBills /> },
      { path: 'bills/detail/:billId', element: <BillDetailPage /> },
      { path: 'bills/pay/:billId', element: <PaymentConfirm /> },
      { path: 'bills/success/:billId', element: <PaymentSuccess /> },
      { path: 'bills/invoices', element: <InvoiceApply /> },
      { path: 'parking', element: <MyParking /> },
      { path: 'parking/records', element: <VehicleRecords /> },
      { path: 'parking/rent', element: <ParkingRent /> },
      { path: 'parking/share', element: <ParkingShare /> },
      { path: 'parking/detail/:parkingId', element: <MyParking /> },
      { path: 'access', element: <DoorAccess /> },
      { path: 'complaint', element: <OwnerComplaint /> },
      { path: 'express', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>快递服务 - 开发中</div> },
      { path: 'decoration', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>装修申请 - 开发中</div> },
      { path: 'vote', element: <OwnerVotePage /> },
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
