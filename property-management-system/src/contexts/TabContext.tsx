import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface TabItem {
  key: string;
  label: string;
  closable: boolean;
}

interface TabContextType {
  tabs: TabItem[];
  activeKey: string;
  addTab: (key: string, label: string) => void;
  closeTab: (key: string) => void;
  switchTab: (key: string) => void;
  closeOtherTabs: (key: string) => void;
  closeAllTabs: () => void;
}

const TabContext = createContext<TabContextType>({
  tabs: [],
  activeKey: '',
  addTab: () => {},
  closeTab: () => {},
  switchTab: () => {},
  closeOtherTabs: () => {},
  closeAllTabs: () => {},
});

export const useTabs = () => useContext(TabContext);

export const TabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: '/property/dashboard', label: '工作台', closable: false },
  ]);
  const [activeKey, setActiveKey] = useState<string>('/property/dashboard');

  // 当路由变化时，同步激活的标签页
  useEffect(() => {
    const path = location.pathname;
    const exists = tabs.some(t => t.key === path);
    if (exists) {
      setActiveKey(path);
    }
  }, [location.pathname, tabs]);

  const addTab = useCallback((key: string, label: string) => {
    setTabs(prev => {
      const exists = prev.some(t => t.key === key);
      if (exists) {
        setActiveKey(key);
        return prev;
      }
      // 默认所有标签页都可关闭（除了dashboard）
      const closable = key !== '/property/dashboard' && 
                       key !== '/government/dashboard' && 
                       key !== '/merchant/dashboard' &&
                       key !== '/superadmin/port-config' &&
                       key !== '/committee/dashboard';
      setActiveKey(key);
      return [...prev, { key, label, closable }];
    });
  }, []);

  const closeTab = useCallback((key: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.key === key);
      if (idx === -1) return prev;
      
      const newTabs = prev.filter(t => t.key !== key);
      
      // 如果关闭的是当前激活的标签页，切换到相邻标签页
      if (key === activeKey && newTabs.length > 0) {
        const newIdx = Math.min(idx, newTabs.length - 1);
        setActiveKey(newTabs[newIdx].key);
      }
      
      return newTabs;
    });
  }, [activeKey]);

  const switchTab = useCallback((key: string) => {
    setActiveKey(key);
  }, []);

  const closeOtherTabs = useCallback((key: string) => {
    setTabs(prev => {
      const target = prev.find(t => t.key === key);
      if (!target) return prev;
      const newTabs = prev.filter(t => !t.closable || t.key === key);
      setActiveKey(key);
      return newTabs;
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    setTabs(prev => {
      const newTabs = prev.filter(t => !t.closable);
      if (newTabs.length > 0) {
        setActiveKey(newTabs[0].key);
      }
      return newTabs;
    });
  }, []);

  return (
    <TabContext.Provider value={{ tabs, activeKey, addTab, closeTab, switchTab, closeOtherTabs, closeAllTabs }}>
      {children}
    </TabContext.Provider>
  );
};

export default TabContext;
