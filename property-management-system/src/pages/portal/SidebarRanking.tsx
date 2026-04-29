import React from 'react';
import { Tag, Typography } from 'antd';
import { FireOutlined, EyeOutlined, RightOutlined } from '@ant-design/icons';
import type { PolicyInfo, ManagementRule } from '../../services/portalTypes';

const { Text } = Typography;

interface SidebarRankingProps {
  hotList: (PolicyInfo | ManagementRule)[];
  onItemClick: (item: PolicyInfo | ManagementRule, type: 'policy' | 'rule') => void;
}

const SidebarRanking: React.FC<SidebarRankingProps> = ({ hotList, onItemClick }) => {
  const getItemType = (item: PolicyInfo | ManagementRule): 'policy' | 'rule' => {
    return 'version' in item ? 'rule' : 'policy';
  };

  const renderListItem = (item: PolicyInfo | ManagementRule, index: number) => {
    const type = getItemType(item);
    return (
      <div
        key={`${type}-${item.id}`}
        onClick={() => onItemClick(item, type)}
        style={{
          display: 'flex', gap: 10,
          padding: '8px 0',
          cursor: 'pointer',
          borderBottom: '1px solid #f5f5f5',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 10,
          background: index < 3 ? '#ff4d4f' : '#f0f0f0',
          color: index < 3 ? '#fff' : '#999',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 'bold', flexShrink: 0, marginTop: 2,
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            ellipsis
            style={{
              fontSize: 13, color: '#333',
              display: 'block', marginBottom: 4,
            }}
          >
            {item.title}
          </Text>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: '#bbb' }}>
            <Tag color={type === 'policy' ? 'blue' : 'green'} style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>
              {type === 'policy' ? '资讯' : '制度'}
            </Tag>
            <span><EyeOutlined style={{ marginRight: 2 }} />{item.viewCount}</span>
          </div>
        </div>
        <RightOutlined style={{ color: '#ddd', fontSize: 12, alignSelf: 'center' }} />
      </div>
    );
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 8, paddingBottom: 10,
        borderBottom: '2px solid #fff1f0',
      }}>
        <FireOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: '#262626' }}>热门排行</span>
      </div>
      <div>
        {hotList.slice(0, 8).map((item, i) => renderListItem(item, i))}
      </div>
    </div>
  );
};

export default SidebarRanking;
