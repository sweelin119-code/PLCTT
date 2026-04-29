import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import {
  SearchOutlined, LoginOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import BannerCarousel from './BannerCarousel';
import ContentSection from './ContentSection';
import SystemEntrance from './SystemEntrance';
import SidebarRanking from './SidebarRanking';
import {
  mockPolicyInfoList,
  mockManagementRules,
  mockBanners,
} from '../../services/portalMockData';
import type { PolicyInfo, ManagementRule, PortalBanner } from '../../services/portalTypes';

const PortalPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('policy');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    document.title = '物业全生命周期管理系统 - 门户首页';
  }, []);

  // 处理 Banner 点击
  const handleBannerClick = (banner: PortalBanner) => {
    if (banner.linkType === 'policy' && banner.linkId) {
      navigate(`/info/${banner.linkId}`);
    } else if (banner.linkType === 'rule' && banner.linkId) {
      navigate(`/rule/${banner.linkId}`);
    } else if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank');
    }
  };

  // 处理内容卡片点击
  const handleItemClick = (item: PolicyInfo | ManagementRule, type: 'policy' | 'rule') => {
    navigate(type === 'policy' ? `/info/${item.id}` : `/rule/${item.id}`);
  };

  // 处理"查看更多"
  const handleMoreClick = (type: 'policy' | 'rule') => {
    navigate(type === 'policy' ? '/info/list' : '/rule/list');
  };

  // 搜索
  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    navigate(`/info/list?search=${encodeURIComponent(value)}`);
  };

  // 计算热门排行（按浏览量排序）
  const allItems: (PolicyInfo | ManagementRule)[] = [
    ...mockPolicyInfoList.filter(i => i.status === 'published'),
    ...mockManagementRules.filter(i => i.status === 'published'),
  ].sort((a, b) => b.viewCount - a.viewCount);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* ===== 顶部导航栏 ===== */}
      <header style={{
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: 64, padding: '0 24px',
        }}>
          {/* Logo 和导航 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <a href="/" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              textDecoration: 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                🏘️
              </div>
              <span style={{
                fontSize: 18, fontWeight: 700,
                color: '#262626', letterSpacing: 1,
              }}>
                物业全生命周期管理系统
              </span>
            </a>
          </div>

          {/* 右侧：搜索 + 登录 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Input.Search
              placeholder="搜索政策、制度..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 240 }}
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            />
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              登录系统
            </Button>
          </div>
        </div>
      </header>

      {/* ===== 主体内容 ===== */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Banner 轮播 */}
        <BannerCarousel banners={mockBanners} onBannerClick={handleBannerClick} />

        {/* 系统快捷入口 - 放在 Banner 下方，内容区域上方 */}
        <div style={{ marginTop: 24 }}>
          <SystemEntrance />
        </div>

        {/* 内容区域 + 侧边栏 */}
        <div style={{
          display: 'flex', gap: 24, marginTop: 24,
        }}>
          {/* 主内容区 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ContentSection
              activeTab={activeTab}
              onTabChange={setActiveTab}
              policyList={mockPolicyInfoList.filter(i => i.status === 'published')}
              ruleList={mockManagementRules.filter(i => i.status === 'published')}
              onItemClick={handleItemClick}
              onMoreClick={handleMoreClick}
            />
          </div>

          {/* 侧边栏 */}
          <div style={{ width: 320, flexShrink: 0 }}>
            <SidebarRanking
              hotList={allItems}
              onItemClick={handleItemClick}
            />
          </div>
        </div>
      </main>

      {/* ===== 底部 ===== */}
      <footer style={{
        background: '#001529',
        padding: '32px 24px 20px',
        marginTop: 48,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: 24, flexWrap: 'wrap', gap: 24,
          }}>
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
              }}>
                <span style={{ fontSize: 20 }}>🏘️</span>
                <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                  物业全生命周期管理系统
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, lineHeight: 1.8 }}>
                构建智慧物业 · 服务美好生活
              </p>
            </div>
            <div style={{ display: 'flex', gap: 48 }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 12 }}>快速链接</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href="/info/list" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none' }}>政策资讯</a>
                  <a href="/rule/list" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none' }}>规章制度</a>
                  <a href="/login" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none' }}>系统登录</a>
                </div>
              </div>
              <div>
                <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 12 }}>关于我们</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>联系电话：0571-8888-8888</span>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>联系邮箱：contact@pmc.com</span>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>工作时间：周一至周五 9:00-17:00</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 16,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 12,
          }}>
            © 2026 物业全生命周期管理系统 v1.0 | All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortalPage;
