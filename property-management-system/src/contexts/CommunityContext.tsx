import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Organization } from '../services/types';
import { getProjectList } from '../services/orgService';

interface CommunityContextType {
  /** 当前选中的小区 */
  currentCommunity: Organization | null;
  /** 该物业公司管理的小区列表 */
  communityList: Organization[];
  /** 切换小区 */
  switchCommunity: (community: Organization) => void;
  /** 加载状态 */
  loading: boolean;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

export const CommunityProvider: React.FC<{ children: React.ReactNode; companyId?: number }> = ({
  children,
  companyId,
}) => {
  const [currentCommunity, setCurrentCommunity] = useState<Organization | null>(null);
  const [communityList, setCommunityList] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载小区列表
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const projects = await getProjectList(companyId);
        setCommunityList(projects);
        // 默认选中第一个小区
        if (projects.length > 0 && !currentCommunity) {
          setCurrentCommunity(projects[0]);
        }
      } catch {
        setCommunityList([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const switchCommunity = useCallback((community: Organization) => {
    setCurrentCommunity(community);
  }, []);

  return (
    <CommunityContext.Provider
      value={{ currentCommunity, communityList, switchCommunity, loading }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = (): CommunityContextType => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
