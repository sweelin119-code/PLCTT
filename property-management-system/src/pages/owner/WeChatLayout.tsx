import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, AppstoreOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

interface WeChatLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showTabBar?: boolean;
}

const WeChatLayout: React.FC<WeChatLayoutProps> = ({
  children,
  title = '智慧社区',
  showBack = false,
  showTabBar = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = `业主端 - 物业全生命周期管理系统`;
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
      background: '#f2f2f7',
      position: 'relative',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* ===== Apple 风格顶部导航栏 ===== */}
      <div style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: '#1d1d1f',
        padding: '50px 16px 12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ width: 60 }}>
          {showBack ? (
            <span
              onClick={() => navigate(-1)}
              style={{
                cursor: 'pointer', fontSize: 15, color: '#007AFF',
                fontWeight: 500,
              }}
            >
              ← 返回
            </span>
          ) : null}
        </div>
        <div style={{
          fontSize: 17, fontWeight: 600, color: '#1d1d1f',
          letterSpacing: -0.3,
        }}>
          {title}
        </div>
        <div style={{
          width: 60, textAlign: 'right', fontSize: 18,
          color: '#1d1d1f', cursor: 'pointer', fontWeight: 600,
          letterSpacing: 1,
        }}
          onClick={() => navigate('/owner/mine')}
        >
          ···
        </div>
      </div>

      {/* ===== 内容区域 ===== */}
      <div style={{
        paddingBottom: showTabBar ? 64 : 0,
        minHeight: 'calc(100vh - 100px)',
      }}>
        {children}
      </div>

      {/* ===== Apple 风格底部 Tab 栏 ===== */}
      {showTabBar && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          padding: '8px 0',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
          zIndex: 100,
        }}>
          {tabItems.map(tab => {
            const isActive =
              location.pathname === tab.key ||
              location.pathname.startsWith(tab.key + '/');
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
                  color: isActive ? '#007AFF' : '#8e8e93',
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'color 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{
                  fontSize: 22,
                  transition: 'transform 0.2s ease',
                }}>
                  {tab.icon}
                </span>
                <span style={{ fontSize: 10, letterSpacing: 0.2 }}>
                  {tab.label}
                </span>
                {isActive && (
                  <div style={{
                    width: 4, height: 4, borderRadius: 2,
                    background: '#007AFF',
                    marginTop: 1,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeChatLayout;
