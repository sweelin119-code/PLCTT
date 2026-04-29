import React from 'react';
import { Tag, Typography } from 'antd';
import { ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { PolicyInfo, ManagementRule } from '../../services/portalTypes';

const { Text, Paragraph } = Typography;

interface ContentSectionProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  policyList: PolicyInfo[];
  ruleList: ManagementRule[];
  onItemClick: (item: PolicyInfo | ManagementRule, type: 'policy' | 'rule') => void;
  onMoreClick: (type: 'policy' | 'rule') => void;
}

const tabs = [
  { key: 'policy', label: '📰 政策资讯' },
  { key: 'rule', label: '📋 规章制度' },
  { key: 'industry', label: '📊 行业动态' },
  { key: 'notice', label: '🔔 通知公告' },
];

const categoryColors: Record<string, string> = {
  policy: 'red', notice: 'orange', interpret: 'purple', industry: 'cyan',
  security: 'red', service: 'blue', device: 'geekblue', finance: 'green',
  personnel: 'purple', comprehensive: 'orange',
};

const ContentSection: React.FC<ContentSectionProps> = ({
  activeTab, onTabChange, policyList, ruleList, onItemClick, onMoreClick,
}) => {
  // 根据Tab筛选数据
  const getDisplayData = () => {
    if (activeTab === 'policy') {
      return policyList.filter(item => item.category === 'policy' || item.category === 'interpret');
    }
    if (activeTab === 'notice') {
      return policyList.filter(item => item.category === 'notice');
    }
    if (activeTab === 'industry') {
      return policyList.filter(item => item.category === 'industry');
    }
    // rule tab
    return ruleList;
  };

  const displayData = getDisplayData().slice(0, 6);
  const isRuleTab = activeTab === 'rule';

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '24px 28px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      {/* Tab 导航 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, borderBottom: '2px solid #f0f0f0', paddingBottom: 0,
      }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'transparent',
                fontSize: 15,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#1890ff' : '#666',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #1890ff' : '2px solid transparent',
                marginBottom: -2,
                transition: 'all 0.3s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onMoreClick(isRuleTab ? 'rule' : 'policy')}
          style={{
            border: 'none', background: 'transparent',
            color: '#1890ff', cursor: 'pointer', fontSize: 13,
            padding: '4px 12px', borderRadius: 4,
          }}
        >
          查看更多 →
        </button>
      </div>

      {/* 内容卡片网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
      }}>
        {displayData.map(item => {
          const isRule = 'version' in item;
          const catColor = categoryColors[item.category] || 'default';
          return (
            <div
              key={item.id}
              onClick={() => onItemClick(item, isRule ? 'rule' : 'policy')}
              style={{
                padding: 16,
                borderRadius: 12,
                border: '1px solid #f0f0f0',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex', flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1890ff';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(24,144,255,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f0f0f0';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* 标签行 */}
              <div style={{ marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                <Tag color={catColor} style={{ margin: 0, fontSize: 11 }}>
                  {item.categoryName}
                </Tag>
                {isRule && (
                  <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
                    {(item as ManagementRule).version}
                  </Tag>
                )}
                {'isTop' in item && (item as PolicyInfo).isTop && (
                  <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>置顶</Tag>
                )}
              </div>

              {/* 标题 */}
              <Text strong style={{
                fontSize: 14, marginBottom: 8,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', lineHeight: '20px', height: 40,
              }}>
                {item.title}
              </Text>

              {/* 摘要 */}
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{
                  fontSize: 12, color: '#888', marginBottom: 12, flex: 1,
                  lineHeight: '18px',
                }}
              >
                {item.summary}
              </Paragraph>

              {/* 底部信息 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', fontSize: 11, color: '#bbb',
                borderTop: '1px solid #f5f5f5', paddingTop: 8,
              }}>
                <span>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {item.publishTime?.slice(0, 10) || item.createTime.slice(0, 10)}
                </span>
                <span>
                  <EyeOutlined style={{ marginRight: 4 }} />
                  {item.viewCount}次
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentSection;
