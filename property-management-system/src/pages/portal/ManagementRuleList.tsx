import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Spin, Typography, Tag, Card, Row, Col, Pagination, Input, Select, Empty, Button,
} from 'antd';
import { EyeOutlined, ClockCircleOutlined, ArrowLeftOutlined, FileProtectOutlined } from '@ant-design/icons';
import type { ManagementRule } from '../../services/portalTypes';
import { getManagementRuleList, getCategoryList } from '../../services/portalService';

const { Title, Text } = Typography;

const ManagementRuleList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ManagementRule[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [categoryFilter, setCategoryFilter] = useState(categoryParam);
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    getCategoryList('rule').then(cats => {
      setCategories([{ value: '', label: '全部分类' }, ...cats.map(c => ({ value: c.code, label: c.name }))]);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getManagementRuleList({
      category: categoryFilter || undefined,
      keyword: keyword || undefined,
      page,
      pageSize,
    }).then(result => {
      setList(result.list);
      setTotal(result.total);
    }).finally(() => setLoading(false));
  }, [categoryFilter, keyword, page, pageSize]);

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    published: { color: 'success', text: '已发布' },
    deprecated: { color: 'error', text: '已废止' },
  };

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '40px 24px',
      minHeight: '100vh',
      background: '#f5f7fa',
    }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ color: '#666', marginRight: 12 }}
          >
            返回首页
          </Button>
          <Title level={3} style={{ margin: 0, flex: 1 }}>规章制度</Title>
        </div>

        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="选择分类"
              value={categoryFilter || undefined}
              onChange={v => { setCategoryFilter(v || ''); setPage(1); }}
              allowClear
              style={{ width: '100%' }}
              options={categories.filter(c => c.value !== '')}
            />
          </Col>
          <Col span={8}>
            <Input.Search
              placeholder="搜索标题..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onSearch={() => setPage(1)}
              enterButton
            />
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        {list.length === 0 ? (
          <Empty description="暂无数据" style={{ padding: 60 }} />
        ) : (
          <Row gutter={[20, 20]}>
            {list.map(item => (
              <Col key={item.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  style={{ borderRadius: 10, height: '100%' }}
                  onClick={() => navigate(`/rule/${item.id}`)}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="green">{item.categoryName}</Tag>
                    <Tag color="purple" style={{ marginLeft: 4 }}>{item.version}</Tag>
                    <Tag color={statusMap[item.status]?.color || 'default'}
                      style={{ marginLeft: 4 }}>
                      {statusMap[item.status]?.text || item.status}
                    </Tag>
                  </div>
                  <Title level={5} style={{
                    marginBottom: 8,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 48,
                  }}>
                    <FileProtectOutlined style={{ marginRight: 8, color: '#52c41a' }} />
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
                    <span><ClockCircleOutlined /> 生效：{item.effectiveDate}</span>
                    <span><EyeOutlined /> {item.viewCount}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

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
      </Spin>
    </div>
  );
};

export default ManagementRuleList;
