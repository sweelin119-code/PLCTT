import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Switch, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getFeeItems, createFeeItem, updateFeeItem, deleteFeeItem } from '../../../services/feeService';
import { FeeItem, FeeCategory, BillingCycle } from '../../../services/feeTypes';
import { useCommunity } from '../../../contexts/CommunityContext';

const CATEGORY_OPTIONS: { value: FeeCategory; label: string }[] = [
  { value: 'property_fee', label: '物业费' },
  { value: 'parking_fee', label: '停车费' },
  { value: 'public_share', label: '公摊费' },
  { value: 'agency', label: '代收代缴' },
  { value: 'deposit', label: '押金/保证金' },
  { value: 'value_added', label: '增值服务费' },
  { value: 'other', label: '其他' },
];

const CYCLE_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季' },
  { value: 'year', label: '年' },
  { value: 'one_time', label: '一次性' },
];

const FeeItemManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [data, setData] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeItem | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await getFeeItems(currentCommunity?.id || 1);
      setData(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentCommunity]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true, taxRate: 0, sortOrder: 0 });
    setModalVisible(true);
  };

  const handleEdit = (item: FeeItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deleteFeeItem(id);
    message.success('已删除');
    loadData();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingItem) {
      await updateFeeItem(editingItem.id, values);
      message.success('已更新');
    } else {
      await createFeeItem({ ...values, projectId: currentCommunity?.id || 1 });
      message.success('已创建');
    }
    setModalVisible(false);
    loadData();
  };

  const columns = [
    { title: '费用项名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '编码', dataIndex: 'code', key: 'code', width: 120 },
    {
      title: '类别', dataIndex: 'category', key: 'category', width: 100,
      render: (v: FeeCategory) => CATEGORY_OPTIONS.find(o => o.value === v)?.label || v,
    },
    { title: '计费单位', dataIndex: 'unit', key: 'unit', width: 100 },
    {
      title: '周期', dataIndex: 'billingCycle', key: 'billingCycle', width: 80,
      render: (v: BillingCycle) => CYCLE_OPTIONS.find(o => o.value === v)?.label || v,
    },
    {
      title: '税率(%)', dataIndex: 'taxRate', key: 'taxRate', width: 80,
      render: (v: number) => v > 0 ? `${v}%` : '-',
    },
    {
      title: '状态', dataIndex: 'enabled', key: 'enabled', width: 80,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: any, record: FeeItem) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>费用项目管理</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增费用项</Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingItem ? '编辑费用项' : '新增费用项'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="费用项名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：物业管理服务费" />
          </Form.Item>
          <Form.Item name="code" label="费用项编码" rules={[{ required: true, message: '请输入编码' }]}>
            <Input placeholder="如：PROP_001" />
          </Form.Item>
          <Form.Item name="category" label="费用类别" rules={[{ required: true }]}>
            <Select options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="unit" label="计费单位" rules={[{ required: true, message: '请输入计费单位' }]}>
            <Input placeholder="如：元/㎡/月" />
          </Form.Item>
          <Form.Item name="billingCycle" label="计费周期" rules={[{ required: true }]}>
            <Select options={CYCLE_OPTIONS} />
          </Form.Item>
          <Form.Item name="taxRate" label="税率(%)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序号">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="enabled" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeItemManage;
