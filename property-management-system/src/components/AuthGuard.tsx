import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  /** 需要的权限编码，如果不指定则只需登录即可 */
  permission?: string;
}

// 根据路径推断端口标识
const getPortFromPath = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0) {
    const port = parts[0];
    if (['government', 'property', 'merchant', 'owner', 'superadmin'].includes(port)) {
      return port;
    }
  }
  return 'property';
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children, permission }) => {
  const { currentUser, loading, hasPermission } = useAuth();
  const location = useLocation();

  // 加载中
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 未登录，跳转登录页（带上端口参数）
  if (!currentUser) {
    const port = getPortFromPath(location.pathname);
    return <Navigate to={`/login?port=${port}`} state={{ from: location }} replace />;
  }

  // 需要特定权限
  if (permission && !hasPermission(permission)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        color: '#999',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2>暂无权限访问</h2>
        <p>当前角色没有访问该页面的权限，请联系管理员</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
