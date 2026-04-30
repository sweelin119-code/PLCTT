import React, { useState, useEffect } from 'react';
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

const { Header, Sider, Content } = Layout;

interface PCLayoutProps {
  menuItems: MenuProps['items'];
  title: string;
  subTitle?: string;
  /** 是否显示小区切换器（物业管理端专用） */
  showCommunitySwitcher?: boolean;
}

const PCLayout: React.FC<PCLayoutProps> = ({ menuItems, title, subTitle, showCommunitySwitcher }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const { currentCommunity, communityList, switchCommunity } = useCommunity();
  const { currentUser, logout } = useAuth();

  // 设置浏览器窗口标题
  useEffect(() => {
    document.title = `${title} - 物业全生命周期管理系统`;
  }, [title]);

  const handleMenuClick = ({ key }: { key: string }) => {
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
        // 获取当前路径对应的端口
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
      'complaint': '投诉处理',
      'data': '数据统计',
      'special': '专项管理',
      'daily': '日常管理',
      'service': '服务管理',
      'security': '安全管理',
      'finance': '财务管理',
      'device': '设备管理',
      'staff': '人员管理',
      'workorder': '工单管理',
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
    };
    return { title: nameMap[pathSnippets[index]] || pathSnippets[index] };
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
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
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
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
        <div style={{ padding: '12px 24px 0' }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <Content style={{
          margin: '12px 24px 24px',
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PCLayout;
