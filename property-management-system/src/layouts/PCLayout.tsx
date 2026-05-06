import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Breadcrumb, theme, Select, Space, message, Modal } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  HomeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useCommunity } from '../contexts/CommunityContext';
import { useAuth } from '../contexts/AuthContext';
import { TabProvider, useTabs } from '../contexts/TabContext';
import TabBar from '../components/TabBar';

const { Header, Sider, Content } = Layout;

interface PCLayoutProps {
  menuItems: MenuProps['items'];
  title: string;
  subTitle?: string;
  /** 是否显示小区切换器（物业管理端专用） */
  showCommunitySwitcher?: boolean;
}

/**
 * 将嵌套的菜单项扁平化为 path -> label 的映射
 */
const flattenMenuItems = (items: MenuProps['items']): Record<string, string> => {
  const map: Record<string, string> = {};
  const walk = (list: MenuProps['items']) => {
    if (!list) return;
    list.forEach(item => {
      if (!item) return;
      // 跳过分隔线类型
      if ('key' in item && typeof item.key === 'string' && 'label' in item) {
        const label = item.label;
        map[item.key] = typeof label === 'string' ? label : (label as any)?.props?.children || item.key;
      }
      if ('children' in item && item.children) {
        walk(item.children as MenuProps['items']);
      }
    });
  };
  walk(items);
  return map;
};

const PCLayoutInner: React.FC<PCLayoutProps> = ({ menuItems, title, subTitle, showCommunitySwitcher }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const { currentCommunity, communityList, switchCommunity } = useCommunity();
  const { currentUser, logout } = useAuth();
  const { addTab } = useTabs();

  // 扁平化菜单项，用于获取标签页标题
  const menuLabelMap = useMemo(() => flattenMenuItems(menuItems), [menuItems]);

  // 设置浏览器窗口标题
  useEffect(() => {
    document.title = `${title} - 物业全生命周期管理系统`;
  }, [title]);

  // 首次加载时，将当前路径添加到标签页
  useEffect(() => {
    const path = location.pathname;
    const label = menuLabelMap[path] || getDefaultTabLabel(path);
    addTab(path, label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    const label = menuLabelMap[key] || getDefaultTabLabel(key);
    addTab(key, label);
    navigate(key);
  };

  // 退出登录
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      icon: <ExclamationCircleOutlined />,
      content: '确定要退出登录吗？',
      okText: '确认退出',
      cancelText: '取消',
      onOk: async () => {
        await logout();
        message.success('已退出登录');
        const port = location.pathname.split('/')[1] || 'property';
        navigate(`/login?port=${port}`, { replace: true });
      },
    });
  };

  // 用户下拉菜单点击处理
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      message.info('个人中心 - 开发中');
    } else if (key === 'settings') {
      message.info('系统设置 - 开发中');
    }
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  // 生成面包屑
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const nameMap: Record<string, string> = {
      'government': '政府监管端',
      'property': '物业管理端',
      'merchant': '商家端',
      'dashboard': '工作台',
      'policy': '政策监管',
      'industry': '行业管理',
      'qualification': '资质管理',
      'complaint': '投诉建议',
      'data': '数据统计',
      'special': '专项管理',
      'daily': '日常管理',
      'service': '服务管理',
      'security': '安全管理',
      'finance': '收费管理',
      'device': '设备管理',
      'staff': '员工管理',
      'repair': '报事报修',
      'contract': '合同管理',
      'quality': '品质管理',
      'shop': '店铺管理',
      'product': '商品管理',
      'order': '订单管理',
      'marketing': '营销活动',
      'customer': '客户管理',
      'asset': '资产管理',
      'building': '楼栋管理',
      'house': '房屋管理',
      'owner': '业主管理',
      'binding': '业主绑定',
      'parking': '车位管理',
      'sync': '数据同步',
      'security-guard': '安保管理',
      'owner-config': '业主端管理',
    };
    return { title: nameMap[pathSnippets[index]] || pathSnippets[index] };
  });

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* 左侧菜单 - 独立滚动 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          scrollbarWidth: 'thin',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 18,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '0 16px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {collapsed ? 'PM' : title}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[pathSnippets[1] || '']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* 右侧区域 */}
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        {/* 顶部 Header - 固定不滚动 */}
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          height: 56,
          lineHeight: '56px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              style: { fontSize: 18, cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
            <span style={{ fontSize: 16, fontWeight: 500 }}>{subTitle || title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {showCommunitySwitcher && communityList.length > 0 && (
              <Select
                value={currentCommunity?.id}
                onChange={(value) => {
                  const community = communityList.find(c => c.id === value);
                  if (community) switchCommunity(community);
                }}
                style={{ width: 180 }}
                options={communityList.map(c => ({
                  value: c.id,
                  label: (
                    <Space>
                      <HomeOutlined />
                      <span>{c.name}</span>
                    </Space>
                  ),
                }))}
              />
            )}
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <span>{currentUser?.user?.phone || '管理员'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 页面 Tab 标签栏 - 固定不滚动（顶部下来第二行） */}
        <TabBar />

        {/* 页面内容区域 - 可滚动（包含面包屑和页面内容） */}
        <Content style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1,
          height: 0, // 让 flex 正确计算剩余高度
          padding: '12px 24px 24px',
        }}>
          {/* 面包屑 - 跟随页面内容滚动 */}
          <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 12 }} />
          <div style={{
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

/**
 * 根据路径获取默认的标签页标题
 */
function getDefaultTabLabel(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return '首页';
  const last = segments[segments.length - 1];
  const nameMap: Record<string, string> = {
    'dashboard': '工作台',
    'fee-items': '费用项目管理',
    'bills': '账单管理',
    'payments': '缴费管理',
    'collection': '催缴管理',
    'reports': '收费报表',
    'parking-fee': '停车收费管理',
    'parking-fee-rates': '收费标准设置',
    'parking-fee-stats': '停车收费统计',
    'staff': '员工管理',
    'roles': '角色管理',
    'organization': '组织架构',
    'merchant': '商家管理',
    'complaint': '投诉建议',
    'repair': '报事报修',
    'order': '工单管理',
    'submit': '提交报修',
    'type-config': '类型配置',
    'type': '设备类型',
    'asset': '资产管理',
    'building': '楼栋管理',
    'house': '房屋管理',
    'parking': '车位管理',
    'owner': '业主管理',
    'members': '成员管理',
    'accounts': '账户管理',
    'sync': '数据同步',
    'banner': 'Banner配置',
    'quick-menu': '快捷菜单',
    'service': '服务配置',
    'port-config': '端口配置',
    'system': '系统管理',
    'logs': '日志管理',
    'audit': '安全审计',
    'monitor': '系统监控',
    'backup': '数据备份',
    'tenant': '多租户管理',
    'open': '开放平台',
    'data-platform': '数据中台',
    'wechat': '公众号管理',
    'templates': '消息模板',
    'users': '用户管理',
    'messages': '消息记录',
    'settings': '系统设置',
    'config': '系统配置',
    'dict': '数据字典',
    'operation': '操作日志',
    'login': '登录日志',
    'server': '服务器监控',
    'api': '接口监控',
    'overview': '数据总览',
    'analysis': '数据分析',
    'visualization': '数据可视化',
    'governance': '数据治理',
    'archive': '档案管理',
    // 业委会端路由
    'meetings': '会议管理',
    'vote': '业主大会',
    'fund': '维修资金监督',
    'coordination': '物业协同',
    'notice': '公告发布',
    'communication': '业主沟通',
    'attendance': '考勤管理',
    'performance': '绩效考核',
    'inspect-plan': '巡检计划',
    'inspect-task': '巡检任务',
    'inspect-record': '巡检台账',
    'energy': '能耗管理',
    'patrol': '巡逻管理',
    'visitor': '访客登记',
    'intercom': '对讲系统',
    'owner-config': '业主端管理',
    'security-guard': '安保管理',
  };
  return nameMap[last] || last;
}

const PCLayout: React.FC<PCLayoutProps> = (props) => {
  return (
    <TabProvider>
      <PCLayoutInner {...props} />
    </TabProvider>
  );
};

export default PCLayout;
