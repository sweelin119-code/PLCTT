import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Space, Tag, Input, Select, message,
  Typography, Tooltip, Popconfirm, Row, Col,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { PolicyInfo } from '../../services/portalTypes';
import { getPolicyInfoList, deletePolicyInfo, getCategoryList } from '../../services/portalService';

const { Title } = Typography;

const PolicyInfoManage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<PolicyInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  // 加载分类
  useEffect(() => {
    getCategoryList('policy').then(cats => {
      setCategories(cats.map(c => ({ value: c.code, label: c.name })));
    });
  }, []);

  // 加载列表
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPolicyInfoList({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        keyword: keyword || undefined,
        page,
        pageSize,
      });
      setList(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, keyword, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 删除
  const handleDelete = async (id: number) => {
    const success = await deletePolicyInfo(id);
    if (success) {
      message.success('删除成功');
      loadData();
    } else {
      message.error('删除失败');
    }
  };

  // 状态标签
  const renderStatus = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      published: { color: 'success', text: '已发布' },
      archived: { color: 'warning', text: '已归档' },
    };
    const s = map[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const columns: ColumnsType<PolicyInfo> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 350,
      ellipsis: { showTitle: false },
      render: (title: string, record) => (
        <Tooltip title={title}>
          <Space size={4}>
            {record.isTop && <Tag color="red" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>置顶</Tag>}
            <a onClick={() => navigate(`/government/policy/info/edit/${record.id}`)} style={{ fontWeight: record.isTop ? 600 : 400 }}>
              {title}
            </a>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'category',
      width: 100,
      render: (name: string) => <Tag>{name}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => renderStatus(status),
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      sorter: (a, b) => a.viewCount - b.viewCount,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 170,
      render: (time: string) => time || '-',
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看">
            <Button type="link" size="small" icon={<EyeOutlined />}
              onClick={() => navigate(`/government/policy/info/edit/${record.id}`)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />}
              onClick={() => navigate(`/government/policy/info/edit/${record.id}`)} />
          </Tooltip>
          <Popconfirm title="确定删除该政策资讯吗？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 头部 */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>政策资讯管理</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
              <Button type="primary" icon={<PlusOutlined />}
                onClick={() => navigate('/government/policy/info/add')}>
                新增政策资讯
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 筛选栏 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="搜索标题/摘要/标签"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onPressEnter={() => { setPage(1); loadData(); }}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择分类"
              value={categoryFilter || undefined}
              onChange={v => { setCategoryFilter(v || ''); setPage(1); }}
              allowClear
              style={{ width: '100%' }}
              options={categories}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="状态筛选"
              value={statusFilter || undefined}
              onChange={v => { setStatusFilter(v || ''); setPage(1); }}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 'draft', label: '草稿' },
                { value: 'published', label: '已发布' },
                { value: 'archived', label: '已归档' },
              ]}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => { setPage(1); loadData(); }}>
              查询
            </Button>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: t => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </Card>
    </div>
  );
};

export default PolicyInfoManage;
