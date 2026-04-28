import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, AppstoreOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

interface WeChatLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showTabBar?: boolean;
}

const WeChatLayout: React.FC<WeChatLayoutProps> = ({ children, title = '智慧社区', showBack = false, showTabBar = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 设置浏览器窗口标题
  useEffect(() => {
    document.title = `业主微信端 - 物业全生命周期管理系统`;
  }, []);

  const tabItems = [
    { key: '/owner/home', label: '首页', icon: <HomeOutlined /> },
    { key: '/owner/services', label: '服务', icon: <AppstoreOutlined /> },
    { key: '/owner/notice', label: '消息', icon: <BellOutlined /> },
    { key: '/owner/mine', label: '我的', icon: <UserOutlined /> },
  ];

  return (
    <div style={{
      maxWidth: 420,
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f5f5f5',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* 顶部导航栏 - 模拟微信导航 */}
      <div style={{
        background: 'linear-gradient(135deg, #07c160 0%, #06ad56 100%)',
        color: '#fff',
        padding: '44px 16px 12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ width: 60 }}>
          {showBack && (
            <span onClick={() => navigate(-1)} style={{ cursor: 'pointer', fontSize: 16 }}>
              ← 返回
            </span>
          )}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
        <div style={{ width: 60, textAlign: 'right', fontSize: 16, cursor: 'pointer' }} onClick={() => navigate('/owner/mine')}>
          ···
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ paddingBottom: showTabBar ? 60 : 0, minHeight: 'calc(100vh - 100px)' }}>
        {children}
      </div>

      {/* 底部Tab栏 - 模拟微信底部导航 */}
      {showTabBar && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          padding: '6px 0',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          zIndex: 100,
        }}>
          {tabItems.map(tab => {
            const isActive = location.pathname === tab.key || location.pathname.startsWith(tab.key + '/');
            return (
              <div
                key={tab.key}
                onClick={() => navigate(tab.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  color: isActive ? '#07c160' : '#999',
                  fontSize: 10,
                }}
              >
                <span style={{ fontSize: 22 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeChatLayout;
