import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Spin, Typography, Tag, Card, Row, Col, Pagination, Input, Empty, Button,
} from 'antd';
import {
  EyeOutlined, ClockCircleOutlined, ArrowLeftOutlined,
  FileProtectOutlined, InfoCircleOutlined, BookOutlined,
} from '@ant-design/icons';
import type { PolicyInfo, ManagementRule } from '../../services/portalTypes';
import { getPolicyInfoList, getManagementRuleList } from '../../services/portalService';

const { Title, Text } = Typography;

type TabType = 'policy' | 'rule';

interface TabItem {
  key: TabType;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { key: 'policy', label: '政策资讯', icon: <InfoCircleOutlined /> },
  { key: 'rule', label: '规章制度', icon: <BookOutlined /> },
];

const ContentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState<TabType>('policy');
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<(PolicyInfo | ManagementRule)[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [keyword, setKeyword] = useState(searchFromUrl);

  // 初始化时如果有 search 参数，自动触发搜索
  useEffect(() => {
    if (searchFromUrl) {
      setKeyword(searchFromUrl);
    }
  }, [searchFromUrl]);

  useEffect(() => {
    setLoading(true);
    const fetchData = activeTab === 'policy'
      ? getPolicyInfoList({ keyword: keyword || undefined, page, pageSize })
      : getManagementRuleList({ keyword: keyword || undefined, page, pageSize });

    fetchData.then(result => {
      setList(result.list);
      setTotal(result.total);
    }).finally(() => setLoading(false));
  }, [activeTab, keyword, page, pageSize]);

  // 切换 tab 时重置页码
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  // 搜索
  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  // 点击卡片
  const handleItemClick = (item: PolicyInfo | ManagementRule) => {
    navigate(activeTab === 'policy' ? `/info/${item.id}` : `/rule/${item.id}`);
  };

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    published: { color: 'success', text: '已发布' },
    deprecated: { color: 'error', text: '已废止' },
  };

  const renderCard = (item: PolicyInfo | ManagementRule) => {
    const isRule = 'version' in item;
    const rule = isRule ? (item as ManagementRule) : null;
    const policy = !isRule ? (item as PolicyInfo) : null;

    return (
      <Col key={`${isRule ? 'rule' : 'policy'}-${item.id}`} xs={24} sm={12} md={8}>
        <Card
          hoverable
          style={{ borderRadius: 10, height: '100%' }}
          onClick={() => handleItemClick(item)}
          styles={{ body: { padding: 20 } }}
        >
          <div style={{ marginBottom: 8 }}>
            {isRule ? (
              <>
                <Tag color="green">{rule!.categoryName}</Tag>
                <Tag color="purple" style={{ marginLeft: 4 }}>{rule!.version}</Tag>
                <Tag color={statusMap[rule!.status]?.color || 'default'} style={{ marginLeft: 4 }}>
                  {statusMap[rule!.status]?.text || rule!.status}
                </Tag>
              </>
            ) : (
              <>
                <Tag color="blue">{policy!.categoryName}</Tag>
                {policy!.isTop && <Tag color="red" style={{ marginLeft: 4 }}>置顶</Tag>}
              </>
            )}
          </div>
          <Title level={5} style={{
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 48,
          }}>
            {isRule && <FileProtectOutlined style={{ marginRight: 8, color: '#52c41a' }} />}
            {item.title}
          </Title>
          <Text type="secondary" style={{
            fontSize: 13,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 12,
            minHeight: 40,
          }}>
            {item.summary}
          </Text>
          <div style={{ color: '#999', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
            {isRule ? (
              <span><ClockCircleOutlined /> 生效：{rule!.effectiveDate}</span>
            ) : (
              <span><ClockCircleOutlined /> {policy!.publishTime || policy!.createTime}</span>
            )}
            <span><EyeOutlined /> {item.viewCount}</span>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '40px 24px',
      minHeight: '100vh',
      background: '#f5f7fa',
    }}>
      {/* 头部 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ color: '#666', marginRight: 12 }}
          >
            返回首页
          </Button>
          <Title level={3} style={{ margin: 0, flex: 1 }}>
            {activeTab === 'policy' ? '政策资讯' : '规章制度'}
          </Title>
        </div>

        {/* 搜索栏 - 全局搜索标题 */}
        <div style={{ maxWidth: 400 }}>
          <Input.Search
            placeholder="搜索标题关键词..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onSearch={handleSearch}
            enterButton
            allowClear
            onClear={() => { setKeyword(''); setPage(1); }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* 左侧 Tab 切换 */}
        <div style={{ width: 160, flexShrink: 0 }}>
          <div style={{
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            {tabs.map(tab => (
              <div
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 20px',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: activeTab === tab.key ? '#1890ff' : '#595959',
                  background: activeTab === tab.key ? '#e6f7ff' : 'transparent',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  borderRight: activeTab === tab.key ? '3px solid #1890ff' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {tab.icon}
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Spin spinning={loading}>
            {list.length === 0 ? (
              <Empty description="暂无数据" style={{ padding: 60, background: '#fff', borderRadius: 10 }} />
            ) : (
              <>
                <Row gutter={[20, 20]}>
                  {list.map(item => renderCard(item))}
                </Row>

                {/* 分页 */}
                {total > pageSize && (
                  <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Pagination
                      current={page}
                      total={total}
                      pageSize={pageSize}
                      onChange={p => setPage(p)}
                      showTotal={t => `共 ${t} 条`}
                    />
                  </div>
                )}
              </>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default ContentListPage;
