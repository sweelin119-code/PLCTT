import React from 'react';
import { Tabs, Dropdown } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useTabs } from '../contexts/TabContext';
import { useNavigate, useLocation } from 'react-router-dom';

const TabBar: React.FC = () => {
  const { tabs, activeKey, closeTab, switchTab, closeOtherTabs, closeAllTabs } = useTabs();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (key: string) => {
    switchTab(key);
    navigate(key);
  };

  const handleTabClose = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    closeTab(key);
    // 如果关闭后需要导航到其他标签页
    const remainingTabs = tabs.filter(t => t.key !== key);
    if (key === location.pathname && remainingTabs.length > 0) {
      const lastTab = remainingTabs[remainingTabs.length - 1];
      navigate(lastTab.key);
    } else if (remainingTabs.length === 0) {
      // 如果没有标签页了，导航到首页
      navigate('/property/dashboard');
    }
  };

  const handleContextMenu = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
  };

  const getTabMenu = (key: string): MenuProps['items'] => [
    {
      key: 'close',
      label: '关闭',
      disabled: !tabs.find(t => t.key === key)?.closable,
      onClick: () => {
        closeTab(key);
        const remainingTabs = tabs.filter(t => t.key !== key);
        if (key === location.pathname && remainingTabs.length > 0) {
          navigate(remainingTabs[remainingTabs.length - 1].key);
        }
      },
    },
    {
      key: 'closeOthers',
      label: '关闭其他',
      onClick: () => {
        closeOtherTabs(key);
        navigate(key);
      },
    },
    {
      key: 'closeAll',
      label: '关闭全部',
      onClick: () => {
        closeAllTabs();
        const firstTab = tabs.filter(t => !t.closable)[0];
        if (firstTab) navigate(firstTab.key);
      },
    },
  ];

  // 自定义标签页渲染
  const renderTabLabel = (tab: typeof tabs[0]) => {
    return (
      <Dropdown menu={{ items: getTabMenu(tab.key) }} trigger={['contextMenu']}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            userSelect: 'none',
            padding: '0 2px',
          }}
          onContextMenu={(e) => handleContextMenu(tab.key, e)}
        >
          <span style={{ fontSize: 13, lineHeight: '32px' }}>{tab.label}</span>
          {tab.closable && (
            <CloseOutlined
              style={{
                fontSize: 10,
                color: '#999',
                padding: 2,
                borderRadius: 3,
                transition: 'all 0.2s',
              }}
              onClick={(e) => handleTabClose(tab.key, e)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#fff';
                (e.currentTarget as HTMLElement).style.backgroundColor = '#999';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#999';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            />
          )}
        </span>
      </Dropdown>
    );
  };

  if (tabs.length === 0) return null;

  return (
    <div
      style={{
        background: '#f5f5f5',
        borderBottom: '1px solid #e8e8e8',
        padding: '0 8px',
        flexShrink: 0,
      }}
    >
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        type="card"
        size="small"
        style={{ marginBottom: 0 }}
        tabBarStyle={{ marginBottom: 0 }}
        items={tabs.map(tab => ({
          key: tab.key,
          label: renderTabLabel(tab),
          closable: false, // 我们自定义关闭按钮
        }))}
      />
    </div>
  );
};

export default TabBar;
