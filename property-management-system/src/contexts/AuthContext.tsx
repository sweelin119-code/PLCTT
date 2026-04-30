import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CurrentUser, LoginRequest } from '../services/types';
import * as authService from '../services/authService';

interface AuthContextType {
  currentUser: CurrentUser | null;
  loading: boolean;
  login: (data: LoginRequest, port?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (roleId: number) => Promise<void>;
  hasPermission: (permCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：检查是否已登录
  useEffect(() => {
    const init = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (data: LoginRequest, port?: string) => {
    const response = await authService.login(data, port);
    const roles = response.user.roles;
    setCurrentUser({
      user: response.user,
      roles,
      currentRole: roles.length > 0 ? roles[0] : null,
      token: response.token,
    });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
  }, []);

  const switchRole = useCallback(async (roleId: number) => {
    const updated = await authService.switchRole(roleId);
    if (updated) {
      setCurrentUser(updated);
    }
  }, []);

  const hasPermission = useCallback((permCode: string): boolean => {
    return authService.hasPermission(currentUser, permCode);
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
