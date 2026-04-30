import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import router from './router';
import { AuthProvider } from './contexts/AuthContext';
import { CommunityProvider } from './contexts/CommunityContext';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <CommunityProvider>
          <RouterProvider router={router} />
        </CommunityProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
