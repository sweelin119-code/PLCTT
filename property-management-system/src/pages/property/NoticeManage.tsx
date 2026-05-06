import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select, Switch,
  Space, Typography, message, Popconfirm, Tabs, DatePicker, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SendOutlined, EyeOutlined,
  ClockCircleOutlined, BarChartOutlined, UploadOutlined,
} from '@ant-design/icons';
import {
  getAnnouncements, createAnnouncement, publishAnnouncement,
  withdrawAnnouncement, deleteAnnouncement, getReadRecords,
  type Announcement, type ReadRecord,
} from '../../services/dailyService';
import RichTextEditor from '../../components/RichTextEditor';
import BuildingSelect from '../../components/BuildingSelect';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  published: { color: 'success', label: '已发布' },
  scheduled: { color: 'processing', label: '定时发布' },
  withdrawn: { color: 'error', label: '已撤回' },
};

const scopeConfig: Record<string, string> = {
  all: '全部业主',
  building: '指定楼栋',
  unit: '指定单元',
  internal: '内部',
};

// ===== 内部公告子组件 =====
const InternalNoticePanel: React.FC<{
  announcements: Announcement[];
  loading: boolean;
  onRefresh: () => void;
}> = ({ announcements, loading, onRefresh }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingAnnouncement(null);
    form.resetFields();
    form.setFieldsValue({ isTop: false, status: 'draft' });
    setModalVisible(true);
  };

  const handleEdit = (record: Announcement) => {
    setEditingAnnouncement(record);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      isTop: record.isTop,
      status: record.status,
      publishTime: record.publishTime,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const result = await createAnnouncement({ ...values, scope: 'internal' });
    if (values.status === 'published') {
      await publishAnnouncement(result.id);
    }
    message.success(editingAnnouncement ? '公告已更新' : '公告已创建');
    setModalVisible(false);
    onRefresh();
  };

  const handlePublish = async (id: string) => {
    await publishAnnouncement(id);
    message.success('公告已发布');
    onRefresh();
  };

  const handleWithdraw = async (id: string) => {
    await withdrawAnnouncement(id);
    message.success('公告已撤回');
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteAnnouncement(id);
    message.success('公告已删除');
    onRefresh();
  };

  const showDetail = (record: Announcement) => {
    setCurrentAnnouncement(record);
    setDetailVisible(true);
  };

  const filtered = activeTab === 'all'
    ? announcements
    : announcements.filter(a => a.status === activeTab);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string, record: Announcement) => (
        <Space>
          {record.isTop && <Tag color="red">置顶</Tag>}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const cfg = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: Announcement) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            查看
          </Button>
          {record.status === 'draft' && (
            <>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                编辑
              </Button>
              <Button type="link" size="small" icon={<SendOutlined />} onClick={() => handlePublish(record.id)}>
                发布
              </Button>
              <Popconfirm title="确定删除此公告？" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'published' && (
            <Popconfirm title="撤回后内部将不可见，确定撤回？" onConfirm={() => handleWithdraw(record.id)}>
              <Button type="link" size="small" icon={<ClockCircleOutlined />}>撤回</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: `全部 (${announcements.length})` },
    { key: 'published', label: `已发布 (${announcements.filter(a => a.status === 'published').length})` },
    { key: 'draft', label: `草稿 (${announcements.filter(a => a.status === 'draft').length})` },
    { key: 'scheduled', label: `定时发布 (${announcements.filter(a => a.status === 'scheduled').length})` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>内部公告</Title>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
          发布公告
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 0 }} />
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        size="small"
        style={{ marginTop: 8 }}
      />

      {/* 发布/编辑弹窗 */}
      <Modal
        title={editingAnnouncement ? '编辑内部公告' : '发布内部公告'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="公告标题" rules={[{ required: true, message: '请输入公告标题' }]}>
            <Input placeholder="请输入公告标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="content" label="公告内容" rules={[{ required: true, message: '请输入公告内容' }]}>
            <RichTextEditor height={300} />
          </Form.Item>
          <Form.Item name="isTop" label="置顶设置" valuePropName="checked">
            <Switch checkedChildren="置顶" unCheckedChildren="普通" />
          </Form.Item>
          <Form.Item name="status" label="发布方式" rules={[{ required: true }]}>
            <Select options={[
              { value: 'draft', label: '保存为草稿' },
              { value: 'published', label: '立即发布' },
              { value: 'scheduled', label: '定时发布' },
            ]} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.status !== curr.status}>
            {({ getFieldValue }) =>
              getFieldValue('status') === 'scheduled' ? (
                <Form.Item name="publishTime" label="定时发布时间" rules={[{ required: true, message: '请选择发布时间' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="attachments" label="附件">
            <Upload multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal title="公告详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentAnnouncement && (
          <div>
            <div style={{ marginBottom: 16 }}>
              {currentAnnouncement.isTop && <Tag color="red">置顶</Tag>}
              <Tag color={statusConfig[currentAnnouncement.status]?.color}>
                {statusConfig[currentAnnouncement.status]?.label}
              </Tag>
            </div>
            <Title level={4}>{currentAnnouncement.title}</Title>
            <div style={{ marginBottom: 16, color: '#999', fontSize: 13 }}>
              <Text type="secondary">
                发布人：{currentAnnouncement.createdBy} |
                发布时间：{currentAnnouncement.publishTime ? new Date(currentAnnouncement.publishTime).toLocaleString('zh-CN') : '未发布'}
              </Text>
            </div>
            <div
              style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4, minHeight: 200 }}
              dangerouslySetInnerHTML={{ __html: currentAnnouncement.content }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===== 业主公告子组件 =====
const OwnerNoticePanel: React.FC<{
  announcements: Announcement[];
  loading: boolean;
  onRefresh: () => void;
}> = ({ announcements, loading, onRefresh }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [readRecords, setReadRecords] = useState<ReadRecord[]>([]);
  const [readLoading, setReadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingAnnouncement(null);
    form.resetFields();
    form.setFieldsValue({ scope: 'all', isTop: false, status: 'draft' });
    setModalVisible(true);
  };

  const handleEdit = (record: Announcement) => {
    setEditingAnnouncement(record);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      scope: record.scope,
      scopeValue: record.scopeValue,
      isTop: record.isTop,
      status: record.status,
      publishTime: record.publishTime,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const result = await createAnnouncement(values);
    if (values.status === 'published') {
      await publishAnnouncement(result.id);
    }
    message.success(editingAnnouncement ? '公告已更新' : '公告已创建');
    setModalVisible(false);
    onRefresh();
  };

  const handlePublish = async (id: string) => {
    await publishAnnouncement(id);
    message.success('公告已发布');
    onRefresh();
  };

  const handleWithdraw = async (id: string) => {
    await withdrawAnnouncement(id);
    message.success('公告已撤回');
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteAnnouncement(id);
    message.success('公告已删除');
    onRefresh();
  };

  const showDetail = async (record: Announcement) => {
    setCurrentAnnouncement(record);
    setDetailVisible(true);
    if (record.status === 'published') {
      setReadLoading(true);
      try {
        const records = await getReadRecords(record.id);
        setReadRecords(records);
      } finally {
        setReadLoading(false);
      }
    }
  };

  const filtered = activeTab === 'all'
    ? announcements
    : announcements.filter(a => a.status === activeTab);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string, record: Announcement) => (
        <Space>
          {record.isTop && <Tag color="red">置顶</Tag>}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '发布范围',
      dataIndex: 'scope',
      key: 'scope',
      width: 100,
      render: (scope: string) => scopeConfig[scope] || scope,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const cfg = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '阅读量',
      key: 'readStats',
      width: 120,
      render: (_: any, record: Announcement) => (
        record.status === 'published' ? (
          <span>{record.readCount} / {record.totalTarget}</span>
        ) : '-'
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: Announcement) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            查看
          </Button>
          {record.status === 'draft' && (
            <>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                编辑
              </Button>
              <Button type="link" size="small" icon={<SendOutlined />} onClick={() => handlePublish(record.id)}>
                发布
              </Button>
              <Popconfirm title="确定删除此公告？" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'published' && (
            <Popconfirm title="撤回后业主端将不可见，确定撤回？" onConfirm={() => handleWithdraw(record.id)}>
              <Button type="link" size="small" icon={<ClockCircleOutlined />}>撤回</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: `全部 (${announcements.length})` },
    { key: 'published', label: `已发布 (${announcements.filter(a => a.status === 'published').length})` },
    { key: 'draft', label: `草稿 (${announcements.filter(a => a.status === 'draft').length})` },
    { key: 'scheduled', label: `定时发布 (${announcements.filter(a => a.status === 'scheduled').length})` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>业主公告</Title>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
          发布公告
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 0 }} />
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        size="small"
        style={{ marginTop: 8 }}
      />

      {/* 发布/编辑弹窗 */}
      <Modal
        title={editingAnnouncement ? '编辑业主公告' : '发布业主公告'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="公告标题" rules={[{ required: true, message: '请输入公告标题' }]}>
            <Input placeholder="请输入公告标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="content" label="公告内容" rules={[{ required: true, message: '请输入公告内容' }]}>
            <RichTextEditor height={300} />
          </Form.Item>
          <Form.Item name="scope" label="发布范围" rules={[{ required: true }]}>
            <Select options={[
              { value: 'all', label: '全部业主' },
              { value: 'building', label: '指定楼栋' },
              { value: 'unit', label: '指定单元' },
            ]} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.scope !== curr.scope}>
            {({ getFieldValue }) =>
              (getFieldValue('scope') === 'building' || getFieldValue('scope') === 'unit') ? (
                <Form.Item name="scopeValue" label="选择范围" rules={[{ required: true, message: '请选择楼栋/单元' }]}>
                  <BuildingSelect />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="isTop" label="置顶设置" valuePropName="checked">
            <Switch checkedChildren="置顶" unCheckedChildren="普通" />
          </Form.Item>
          <Form.Item name="status" label="发布方式" rules={[{ required: true }]}>
            <Select options={[
              { value: 'draft', label: '保存为草稿' },
              { value: 'published', label: '立即发布' },
              { value: 'scheduled', label: '定时发布' },
            ]} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.status !== curr.status}>
            {({ getFieldValue }) =>
              getFieldValue('status') === 'scheduled' ? (
                <Form.Item name="publishTime" label="定时发布时间" rules={[{ required: true, message: '请选择发布时间' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="attachments" label="附件">
            <Upload multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal title="公告详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentAnnouncement && (
          <div>
            <div style={{ marginBottom: 16 }}>
              {currentAnnouncement.isTop && <Tag color="red">置顶</Tag>}
              <Tag color={statusConfig[currentAnnouncement.status]?.color}>
                {statusConfig[currentAnnouncement.status]?.label}
              </Tag>
              <Tag>{scopeConfig[currentAnnouncement.scope]}</Tag>
            </div>
            <Title level={4}>{currentAnnouncement.title}</Title>
            <div style={{ marginBottom: 16, color: '#999', fontSize: 13 }}>
              <Text type="secondary">
                发布人：{currentAnnouncement.createdBy} |
                发布时间：{currentAnnouncement.publishTime ? new Date(currentAnnouncement.publishTime).toLocaleString('zh-CN') : '未发布'}
              </Text>
            </div>
            <div
              style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4, minHeight: 200 }}
              dangerouslySetInnerHTML={{ __html: currentAnnouncement.content }}
            />
            {currentAnnouncement.status === 'published' && (
              <Card size="small" title={<><BarChartOutlined /> 阅读统计</>}>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>已读：{readRecords.length}</Text> / <Text>目标：{currentAnnouncement.totalTarget}</Text>
                  <Text style={{ marginLeft: 16 }}>
                    阅读率：{((readRecords.length / currentAnnouncement.totalTarget) * 100).toFixed(1)}%
                  </Text>
                </div>
                <Table
                  dataSource={readRecords}
                  columns={[
                    { title: '业主姓名', dataIndex: 'ownerName', key: 'ownerName', width: 100 },
                    { title: '房号', dataIndex: 'houseAddress', key: 'houseAddress', width: 180 },
                    { title: '阅读时间', dataIndex: 'readTime', key: 'readTime', width: 160,
                      render: (t: string) => new Date(t).toLocaleString('zh-CN') },
                  ]}
                  rowKey="ownerId"
                  loading={readLoading}
                  pagination={false}
                  size="small"
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===== 通知公告主组件（两个 Tab 容器） =====
const NoticeManage: React.FC = () => {
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('internal');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAllAnnouncements(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const internalAnnouncements = allAnnouncements.filter(a => a.scope === 'internal');
  const ownerAnnouncements = allAnnouncements.filter(a => a.scope !== 'internal');

  const tabItems = [
    {
      key: 'internal',
      label: `内部公告 (${internalAnnouncements.length})`,
      children: (
        <InternalNoticePanel
          announcements={internalAnnouncements}
          loading={loading}
          onRefresh={fetchData}
        />
      ),
    },
    {
      key: 'owner',
      label: `业主公告 (${ownerAnnouncements.length})`,
      children: (
        <OwnerNoticePanel
          announcements={ownerAnnouncements}
          loading={loading}
          onRefresh={fetchData}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>通知公告</Title>
      </div>
      <Card size="small">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default NoticeManage;
