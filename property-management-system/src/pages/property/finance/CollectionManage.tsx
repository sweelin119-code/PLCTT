import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Input, Space, Tag, message, Card, Row, Col, Statistic, Tabs } from 'antd';
import { SearchOutlined, BellOutlined, PhoneOutlined, MessageOutlined, WechatOutlined, HistoryOutlined } from '@ant-design/icons';
import { getCollections, getOverdueBills, sendCollection, getCollectionTemplates, saveCollectionTemplate, getFeeStatistics } from '../../../services/feeService';
import { CollectionRecord, CollectionType, CollectionTemplate } from '../../../services/feeTypes';
import { useCommunity } from '../../../contexts/CommunityContext';

const COLLECTION_TYPE_MAP: Record<CollectionType, { label: string; color: string; icon: React.ReactNode }> = {
  sms: { label: '短信催缴', color: 'blue', icon: <MessageOutlined /> },
  app: { label: 'APP推送', color: 'cyan', icon: <BellOutlined /> },
  wechat: { label: '微信通知', color: 'green', icon: <WechatOutlined /> },
  phone: { label: '电话催缴', color: 'orange', icon: <PhoneOutlined /> },
  visit: { label: '上门催缴', color: 'purple', icon: <HistoryOutlined /> },
  legal: { label: '法律催缴', color: 'red', icon: <BellOutlined /> },
};

const CollectionManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [data, setData] = useState<CollectionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [overdueCount, setOverdueCount] = useState(0);
  const [stats, setStats] = useState({ totalArrears: 0, overdueCount: 0 });

  const [filters, setFilters] = useState<{ keyword?: string }>({});

  // 催缴弹窗
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [collectingBillId] = useState<number | null>(null);
  const [collectionType, setCollectionType] = useState<CollectionType>('sms');

  // 模板管理
  const [templates, setTemplates] = useState<CollectionTemplate[]>([]);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [templateForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getCollections({
        projectId: currentCommunity?.id || 1,
        page,
        pageSize,
        ...filters,
      });
      setData(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  const loadOverdueInfo = async () => {
    const overdue = await getOverdueBills(currentCommunity?.id || 1);
    setOverdueCount(overdue.length);
    const s = await getFeeStatistics(currentCommunity?.id || 1);
    setStats({ totalArrears: s.totalArrears, overdueCount: s.overdueCount });
  };

  const loadTemplates = async () => {
    const t = await getCollectionTemplates(currentCommunity?.id || 1);
    setTemplates(t);
  };

  useEffect(() => {
    loadData();
    loadOverdueInfo();
    loadTemplates();
  }, [currentCommunity, page, pageSize, filters]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleSendCollection = async () => {
    if (!collectingBillId) return;
    await sendCollection(collectingBillId, collectionType);
    message.success('催缴已发送');
    setCollectionModalVisible(false);
    loadData();
    loadOverdueInfo();
  };

  const handleSaveTemplate = async () => {
    const values = await templateForm.validateFields();
    await saveCollectionTemplate({ ...values, projectId: currentCommunity?.id || 1 });
    message.success('模板已保存');
    setTemplateModalVisible(false);
    templateForm.resetFields();
    loadTemplates();
  };

  const columns = [
    { title: '催缴方式', dataIndex: 'collectionType', key: 'collectionType', width: 100,
      render: (v: CollectionType) => {
        const m = COLLECTION_TYPE_MAP[v];
        return <Tag icon={m.icon} color={m.color}>{m.label}</Tag>;
      },
    },
    { title: '业主', dataIndex: 'ownerName', key: 'ownerName', width: 80 },
    { title: '房号', dataIndex: 'houseFullName', key: 'houseFullName', width: 120 },
    { title: '联系方式', dataIndex: 'ownerPhone', key: 'ownerPhone', width: 120 },
    { title: '催缴内容', dataIndex: 'content', key: 'content', width: 300, ellipsis: true },
    {
      title: '结果', dataIndex: 'result', key: 'result', width: 80,
      render: (v: string) => {
        const colorMap: Record<string, string> = { sent: 'blue', contacted: 'cyan', promised: 'orange', paid: 'green', ignored: 'red' };
        const labelMap: Record<string, string> = { sent: '已发送', contacted: '已联系', promised: '承诺缴费', paid: '已缴费', ignored: '未理会' };
        return <Tag color={colorMap[v] || 'default'}>{labelMap[v] || v}</Tag>;
      },
    },
    { title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 80 },
    { title: '时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small"><Statistic title="总欠费金额" value={stats.totalArrears} precision={2} prefix="¥" valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="逾期户数" value={stats.overdueCount} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="待催缴账单" value={overdueCount} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="催缴记录" value={total} /></Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索业主/房号"
            style={{ width: 200 }}
            value={filters.keyword}
            onChange={(e) => setFilters(f => ({ ...f, keyword: e.target.value }))}
            onPressEnter={handleSearch}
            suffix={<SearchOutlined onClick={handleSearch} />}
          />
          <Button icon={<HistoryOutlined />} onClick={() => loadData()}>刷新</Button>
        </Space>
      </Card>

      {/* 催缴记录表格 */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
        scroll={{ x: 1100 }}
      />

      {/* 催缴弹窗 */}
      <Modal
        title="发送催缴通知"
        open={collectionModalVisible}
        onOk={handleSendCollection}
        onCancel={() => setCollectionModalVisible(false)}
        okText="发送"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>选择催缴方式：</div>
          <Space wrap>
            {(Object.entries(COLLECTION_TYPE_MAP) as [CollectionType, typeof COLLECTION_TYPE_MAP['sms']][]).map(([key, m]) => (
              <Button
                key={key}
                type={collectionType === key ? 'primary' : 'default'}
                icon={m.icon}
                onClick={() => setCollectionType(key)}
              >
                {m.label}
              </Button>
            ))}
          </Space>
        </div>
        <div style={{ color: '#666', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
          将向该业主发送 {COLLECTION_TYPE_MAP[collectionType].label} 通知
        </div>
      </Modal>

      {/* 模板管理弹窗 */}
      <Modal
        title="催缴模板管理"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Tabs items={[
          {
            key: 'templates',
            label: '现有模板',
            children: (
              <Table
                rowKey="id"
                dataSource={templates}
                columns={[
                  { title: '模板名称', dataIndex: 'name', key: 'name' },
                  { title: '类型', dataIndex: 'type', key: 'type', render: (v: CollectionType) => COLLECTION_TYPE_MAP[v]?.label || v },
                  { title: '标题', dataIndex: 'title', key: 'title' },
                  { title: '状态', dataIndex: 'enabled', key: 'enabled', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '禁用'}</Tag> },
                ]}
                pagination={false}
                size="small"
              />
            ),
          },
          {
            key: 'add',
            label: '新增模板',
            children: (
              <Form form={templateForm} layout="vertical">
                <Form.Item name="name" label="模板名称" rules={[{ required: true }]}>
                  <Input placeholder="如：短信催缴模板" />
                </Form.Item>
                <Form.Item name="type" label="催缴方式" rules={[{ required: true }]}>
                  <Select options={Object.entries(COLLECTION_TYPE_MAP).map(([value, m]) => ({ value, label: m.label }))} />
                </Form.Item>
                <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                  <Input placeholder="如：物业费催缴通知" />
                </Form.Item>
                <Form.Item name="content" label="内容" rules={[{ required: true }]}>
                  <Input.TextArea rows={4} placeholder="支持变量：{业主姓名} {房屋名称} {费用项目} {账期} {金额}" />
                </Form.Item>
                <Form.Item name="enabled" label="状态" valuePropName="checked" initialValue={true}>
                  <Select options={[{ value: true, label: '启用' }, { value: false, label: '禁用' }]} />
                </Form.Item>
                <Button type="primary" onClick={handleSaveTemplate}>保存模板</Button>
              </Form>
            ),
          },
        ]} />
      </Modal>
    </div>
  );
};

export default CollectionManage;
