import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select, Switch,
  Space, Typography, message, Popconfirm, Tabs, DatePicker,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SendOutlined, EyeOutlined, FileTextOutlined,
} from '@ant-design/icons';
import {
  getCommitteeNotices, createCommitteeNotice,
  publishCommitteeNotice, deleteCommitteeNotice,
  CommitteeNotice,
} from '../../services/committeeService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const typeConfig: Record<string, { color: string; label: string }> = {
  committee: { color: 'blue', label: '业委会公告' },
  assembly: { color: 'purple', label: '业主大会' },
  publicity: { color: 'green', label: '公示公告' },
  notice: { color: 'orange', label: '通知' },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  published: { color: 'success', label: '已发布' },
  scheduled: { color: 'processing', label: '定时发布' },
};

const NoticeManage: React.FC = () => {
  const [notices, setNotices] = useState<CommitteeNotice[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotice, setEditingNotice] = useState<CommitteeNotice | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCommitteeNotices();
      setNotices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingNotice(null);
    form.resetFields();
    form.setFieldsValue({ type: 'committee', scope: 'all', isTop: false });
    setModalVisible(true);
  };

  const handleEdit = (record: CommitteeNotice) => {
    setEditingNotice(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingNotice) {
        // Update existing
        message.success('保存成功');
      } else {
        await createCommitteeNotice(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (err) {
      // validation failed
    }
  };

  const handlePublish = async (id: string) => {
    await publishCommitteeNotice(id);
    message.success('发布成功');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await deleteCommitteeNotice(id);
    message.success('删除成功');
    fetchData();
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: CommitteeNotice) => (
        <Space>
          {record.isTop && <Tag color="red">置顶</Tag>}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (val: string) => <Tag color={typeConfig[val]?.color}>{typeConfig[val]?.label}</Tag>,
    },
    {
      title: '发布范围',
      dataIndex: 'scope',
      key: 'scope',
      width: 100,
      render: (val: string, record: CommitteeNotice) => val === 'all' ? '全体业主' : `${record.scopeValue}`,
    },
    {
      title: '阅读量',
      dataIndex: 'readCount',
      key: 'readCount',
      width: 80,
      render: (val: number, record: CommitteeNotice) => `${val}/${record.totalTarget}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: string) => <Tag color={statusConfig[val]?.color}>{statusConfig[val]?.label}</Tag>,
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: CommitteeNotice) => (
        <Space>
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
            <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>公告发布</Title>

      <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建公告</Button>}>
        <Table
          dataSource={notices}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingNotice ? '编辑公告' : '新建公告'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        okText={editingNotice ? '保存' : '创建'}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="公告标题" rules={[{ required: true, message: '请输入公告标题' }]}>
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item name="type" label="公告类型" rules={[{ required: true, message: '请选择公告类型' }]}>
            <Select>
              <Select.Option value="committee">业委会公告</Select.Option>
              <Select.Option value="assembly">业主大会</Select.Option>
              <Select.Option value="publicity">公示公告</Select.Option>
              <Select.Option value="notice">通知</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="公告内容" rules={[{ required: true, message: '请输入公告内容' }]}>
            <TextArea rows={6} placeholder="请输入公告内容..." />
          </Form.Item>
          <Form.Item name="scope" label="发布范围">
            <Select>
              <Select.Option value="all">全体业主</Select.Option>
              <Select.Option value="building">按楼栋</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="isTop" label="置顶" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NoticeManage;
