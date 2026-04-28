import React, { useEffect } from 'react';
import RepairOrderManage from '../pages/property/RepairOrderManage';
import ComplaintManage from '../pages/property/ComplaintManage';
import ComplaintSupervise from '../pages/government/ComplaintSupervise';
import ComplaintStats from '../pages/government/ComplaintStats';
import OwnerRepair from '../pages/owner/OwnerRepair';
import OwnerComplaint from '../pages/owner/OwnerComplaint';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppstoreOutlined, BankOutlined, ShopOutlined, WechatOutlined, TeamOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
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

// 账号体系相关页面
import Login from '../pages/login/Login';
import StaffList from '../pages/property/StaffList';
import StaffEdit from '../pages/property/StaffEdit';
import RoleManage from '../pages/property/RoleManage';
import PortConfig from '../pages/superadmin/PortConfig';

// 企业相关页面
import CompanyRegister from '../pages/property/CompanyRegister';
import QualificationReview from '../pages/government/QualificationReview';
import CompanyList from '../pages/government/CompanyList';

// 商家管理相关页面
import MerchantManage from '../pages/property/MerchantManage';
import MerchantList from '../pages/government/MerchantList';

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

// 系统选择页面（首页）- 全面美化版
const SystemSelect: React.FC = () => {
  useEffect(() => {
    document.title = '全生命周期物业管理系统';
  }, []);

  const systems = [
    {
      key: 'government', title: '政府监管端',
      icon: <BankOutlined />,
      desc: '市区住建 · 街道物业 · 社区管理',
      color: '#1890ff', gradient: 'linear-gradient(135deg, #1890ff, #096dd9)',
      bgGradient: 'linear-gradient(135deg, #e6f7ff, #bae7ff)',
      path: '/government/dashboard',
      features: ['政策监管', '投诉督办', '数据大屏'],
      emoji: '🏛️',
    },
    {
      key: 'property', title: '物业管理端',
      icon: <AppstoreOutlined />,
      desc: '物业人员 · 保安保洁 · 维保服务',
      color: '#52c41a', gradient: 'linear-gradient(135deg, #52c41a, #389e0d)',
      bgGradient: 'linear-gradient(135deg, #f6ffed, #d9f7be)',
      path: '/property/dashboard',
      features: ['工单管理', '设备巡检', '财务收费'],
      emoji: '🏢',
    },
    {
      key: 'merchant', title: '商家管理端',
      icon: <ShopOutlined />,
      desc: '社区商家 · 服务提供商 · 供应链',
      color: '#722ed1', gradient: 'linear-gradient(135deg, #722ed1, #531dab)',
      bgGradient: 'linear-gradient(135deg, #f9f0ff, #efdbff)',
      path: '/merchant/dashboard',
      features: ['店铺管理', '订单处理', '营销活动'],
      emoji: '🏪',
    },
    {
      key: 'owner', title: '业主微信端',
      icon: <WechatOutlined />,
      desc: '业主 · 访客 · 微信H5便捷服务',
      color: '#07c160', gradient: 'linear-gradient(135deg, #07c160, #059b4f)',
      bgGradient: 'linear-gradient(135deg, #f0fff4, #b7eb8f)',
      path: '/owner/home',
      features: ['在线报修', '物业缴费', '邻里互动'],
      emoji: '📱',
      tag: '微信 H5',
      tagColor: '#07c160',
      tagBg: '#e6fff2',
    },
    {
      key: 'superadmin', title: '超级管理端',
      icon: <SettingOutlined />,
      desc: '系统配置 · 端口管理 · 全局设置',
      color: '#fa8c16', gradient: 'linear-gradient(135deg, #fa8c16, #d46b08)',
      bgGradient: 'linear-gradient(135deg, #fff7e6, #ffe7ba)',
      path: '/superadmin/port-config',
      features: ['端口配置', '公众号管理', '系统设置'],
      emoji: '⚙️',
      tag: '管理',
      tagColor: '#fa8c16',
      tagBg: '#fff3e0',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 装饰性背景粒子 */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }} />
        ))}
        {/* 城市天际线剪影 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          opacity: 0.06,
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\'%3E%3Crect x=\'0\' y=\'40\' width=\'60\' height=\'80\' fill=\'white\'/%3E%3Crect x=\'70\' y=\'20\' width=\'50\' height=\'100\' fill=\'white\'/%3E%3Crect x=\'130\' y=\'50\' width=\'70\' height=\'70\' fill=\'white\'/%3E%3Crect x=\'210\' y=\'10\' width=\'45\' height=\'110\' fill=\'white\'/%3E%3Crect x=\'265\' y=\'35\' width=\'55\' height=\'85\' fill=\'white\'/%3E%3Crect x=\'330\' y=\'55\' width=\'80\' height=\'65\' fill=\'white\'/%3E%3Crect x=\'420\' y=\'25\' width=\'40\' height=\'95\' fill=\'white\'/%3E%3Crect x=\'470\' y=\'45\' width=\'65\' height=\'75\' fill=\'white\'/%3E%3Crect x=\'545\' y=\'15\' width=\'50\' height=\'105\' fill=\'white\'/%3E%3Crect x=\'605\' y=\'40\' width=\'70\' height=\'80\' fill=\'white\'/%3E%3Crect x=\'685\' y=\'30\' width=\'45\' height=\'90\' fill=\'white\'/%3E%3Crect x=\'740\' y=\'55\' width=\'60\' height=\'65\' fill=\'white\'/%3E%3Crect x=\'810\' y=\'10\' width=\'55\' height=\'110\' fill=\'white\'/%3E%3Crect x=\'875\' y=\'40\' width=\'75\' height=\'80\' fill=\'white\'/%3E%3Crect x=\'960\' y=\'20\' width=\'40\' height=\'100\' fill=\'white\'/%3E%3Crect x=\'1010\' y=\'50\' width=\'60\' height=\'70\' fill=\'white\'/%3E%3Crect x=\'1080\' y=\'30\' width=\'50\' height=\'90\' fill=\'white\'/%3E%3Crect x=\'1140\' y=\'45\' width=\'60\' height=\'75\' fill=\'white\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat-x',
          backgroundSize: '1200px 120px',
        }} />
      </div>

      {/* 头部区域 */}
      <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}>
        {/* Logo 图标 */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 36,
          boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
        }}>
          🏘️
        </div>
        <h1 style={{
          color: '#fff', fontSize: 38, fontWeight: 800,
          marginBottom: 12, letterSpacing: 2,
          textShadow: '0 2px 20px rgba(0,0,0,0.3)',
        }}>
          物业全生命周期管理系统
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)', fontSize: 16,
          letterSpacing: 4,
        }}>
          PROPERTY LIFE CYCLE MANAGEMENT SYSTEM
        </p>
        {/* 装饰分割线 */}
        <div style={{
          width: 60, height: 3, borderRadius: 2,
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          margin: '16px auto 0',
        }} />
      </div>

      {/* 卡片容器 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: 20,
        maxWidth: 1300,
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        {systems.map(sys => {
          const isOwner = sys.key === 'owner';
          const isWechat = sys.key === 'wechat';
          return (
            <a
              key={sys.key}
              href={sys.path}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: '1 1 0',
                minWidth: 200,
                maxWidth: 260,
                background: '#fff',
                borderRadius: 20,
                padding: '0',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 16px 48px ${sys.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
              }}
            >
              {/* 顶部彩色区域 */}
              <div style={{
                background: sys.gradient,
                padding: '28px 20px 36px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* 装饰性大背景图标 */}
                <div style={{
                  position: 'absolute',
                  right: -10,
                  top: -10,
                  fontSize: 80,
                  opacity: 0.1,
                  transform: 'rotate(10deg)',
                }}>
                  {sys.emoji}
                </div>
                {/* 图标容器 */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                  marginBottom: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}>
                  {sys.icon}
                </div>
                {/* 标题 */}
                <div style={{
                  fontSize: 20, fontWeight: 700, color: '#fff',
                  marginBottom: 4,
                  textShadow: '0 1px 8px rgba(0,0,0,0.15)',
                }}>
                  {sys.title}
                </div>
                {/* 描述 */}
                <div style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.5,
                }}>
                  {sys.desc}
                </div>
                {/* 标签 */}
                {(isOwner || isWechat) && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    padding: '3px 10px',
                    background: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                    {sys.tag}
                  </div>
                )}
              </div>

              {/* 底部白色区域 */}
              <div style={{
                padding: '16px 20px 20px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* 功能标签 */}
                <div style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                  marginBottom: 12,
                }}>
                  {sys.features.map((feat, i) => (
                    <span key={i} style={{
                      fontSize: 11,
                      padding: '2px 10px',
                      borderRadius: 10,
                      background: `${sys.color}12`,
                      color: sys.color,
                      fontWeight: 500,
                    }}>
                      {feat}
                    </span>
                  ))}
                </div>
                {/* 入口提示 */}
                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid #f0f0f0',
                }}>
                  <span style={{ fontSize: 12, color: '#bbb' }}>点击进入</span>
                  <span style={{
                    width: 28, height: 28, borderRadius: 14,
                    background: `${sys.color}10`,
                    color: sys.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                    transition: 'all 0.3s',
                  }}>
                    →
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* 底部信息 */}
      <div style={{
        marginTop: 48,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        position: 'relative',
        zIndex: 1,
        letterSpacing: 1,
      }}>
        © 2026 物业全生命周期管理系统 v1.0
      </div>

      {/* 全局动画样式 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

const router = createBrowserRouter([
  // 登录页（无需登录）
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <SystemSelect />,
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
    element: <AuthGuard><PCLayout menuItems={propertyMenuItems} title="物业管理端" subTitle="物业全生命周期管理系统" /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/property/dashboard" replace /> },
      { path: 'dashboard', element: <PropertyDashboard /> },
      // 企业入驻
      { path: 'company/register', element: <CompanyRegister /> },
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
      { path: 'finance/fee', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>物业费管理 - 开发中</div> },
      { path: 'finance/parking', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>停车费管理 - 开发中</div> },
      { path: 'finance/repair-fund', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>维修资金 - 开发中</div> },
      { path: 'finance/report', element: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>财务报表 - 开发中</div> },
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
