import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Space, Tag, Input, Select, Modal, message,
  Typography, Tooltip, Popconfirm, Row, Col, Timeline,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, ReloadOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ManagementRule, RuleVersion } from '../../services/portalTypes';
import {
  getManagementRuleList, deleteManagementRule, getCategoryList,
  getRuleVersions,
} from '../../services/portalService';

const { Title, Text } = Typography;

const ManagementRuleManage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ManagementRule[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [versionList, setVersionList] = useState<RuleVersion[]>([]);
  const [currentRuleTitle, setCurrentRuleTitle] = useState('');

  useEffect(() => {
    getCategoryList('rule').then(cats => {
      setCategories(cats.map(c => ({ value: c.code, label: c.name })));
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getManagementRuleList({
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

  const handleDelete = async (id: number) => {
    const success = await deleteManagementRule(id);
    if (success) {
      message.success('删除成功');
      loadData();
    } else {
      message.error('删除失败');
    }
  };

  // 查看版本历史
  const showVersionHistory = async (ruleId: number, title: string) => {
    setCurrentRuleTitle(title);
    const versions = await getRuleVersions(ruleId);
    setVersionList(versions);
    setVersionModalVisible(true);
  };

  const renderStatus = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      published: { color: 'success', text: '已发布' },
      deprecated: { color: 'error', text: '已废止' },
    };
    const s = map[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const columns: ColumnsType<ManagementRule> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 350,
      ellipsis: { showTitle: false },
      render: (title: string, record) => (
        <Tooltip title={title}>
          <a onClick={() => navigate(`/government/rule/edit/${record.id}`)}
            style={{ fontWeight: 500 }}>
            {title}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'category',
      width: 100,
      render: (name: string) => <Tag color="green">{name}</Tag>,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (v: string) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => renderStatus(status),
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
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
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看">
            <Button type="link" size="small" icon={<EyeOutlined />}
              onClick={() => navigate(`/government/rule/edit/${record.id}`)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />}
              onClick={() => navigate(`/government/rule/edit/${record.id}`)} />
          </Tooltip>
          <Tooltip title="版本历史">
            <Button type="link" size="small" icon={<HistoryOutlined />}
              onClick={() => showVersionHistory(record.id, record.title)} />
          </Tooltip>
          <Popconfirm title="确定删除该规章制度吗？" onConfirm={() => handleDelete(record.id)}>
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
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>规章制度管理</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
              <Button type="primary" icon={<PlusOutlined />}
                onClick={() => navigate('/government/rule/add')}>
                新增规章制度
              </Button>
            </Space>
          </Col>
        </Row>

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
                { value: 'deprecated', label: '已废止' },
              ]}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => { setPage(1); loadData(); }}>
              查询
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
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

      {/* 版本历史弹窗 */}
      <Modal
        title={`版本历史 - ${currentRuleTitle}`}
        open={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
        width={600}
      >
        {versionList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂无版本记录</div>
        ) : (
          <Timeline
            items={versionList.map(v => ({
              color: 'blue',
              children: (
                <div>
                  <Text strong style={{ fontSize: 16 }}>{v.version}</Text>
                  <div style={{ color: '#666', marginTop: 4 }}>{v.changeLog}</div>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    {v.createdBy} · {v.createTime}
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManagementRuleManage;
