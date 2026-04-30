import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Switch, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getChargeRules, createChargeRule, updateChargeRule, deleteChargeRule, getFeeItems } from '../../../services/feeService';
import { ChargeRule, PricingMode } from '../../../services/feeTypes';
import { useCommunity } from '../../../contexts/CommunityContext';
import dayjs from 'dayjs';

const HOUSE_TYPE_OPTIONS = [
  { value: 'residence', label: '住宅' },
  { value: 'shop', label: '商铺' },
  { value: 'office', label: '办公' },
  { value: 'warehouse', label: '仓库' },
  { value: 'parking', label: '车位' },
];

const PRICING_MODE_OPTIONS: { value: PricingMode; label: string }[] = [
  { value: 'fixed', label: '固定金额' },
  { value: 'area', label: '按面积计费' },
  { value: 'household', label: '按户计费' },
  { value: 'step', label: '阶梯计费' },
  { value: 'per_time', label: '按次计费' },
  { value: 'per_hour', label: '按时计费' },
  { value: 'formula', label: '公式计费' },
];

const PRICING_MODE_UNITS: Record<PricingMode, string> = {
  fixed: '元',
  area: '元/㎡',
  household: '元/户',
  step: '元/阶梯',
  per_time: '元/次',
  per_hour: '元/小时',
  formula: '公式',
};

const ChargeRuleManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [data, setData] = useState<ChargeRule[]>([]);
  const [feeItems, setFeeItems] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ChargeRule | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const rules = await getChargeRules(currentCommunity?.id || 1);
      setData(rules);
    } finally {
      setLoading(false);
    }
  };

  const loadFeeItems = async () => {
    const items = await getFeeItems(currentCommunity?.id || 1);
    setFeeItems(items.map(f => ({ value: f.id, label: `${f.name} (${f.code})` })));
  };

  useEffect(() => {
    loadData();
    loadFeeItems();
  }, [currentCommunity]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true });
    setModalVisible(true);
  };

  const handleEdit = (item: ChargeRule) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      effectiveDate: item.effectiveDate ? dayjs(item.effectiveDate) : undefined,
      expireDate: item.expireDate ? dayjs(item.expireDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deleteChargeRule(id);
    message.success('已删除');
    loadData();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      projectId: currentCommunity?.id || 1,
      effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
      expireDate: values.expireDate ? values.expireDate.format('YYYY-MM-DD') : undefined,
    };
    if (editingItem) {
      await updateChargeRule(editingItem.id, payload);
      message.success('已更新');
    } else {
      await createChargeRule(payload);
      message.success('已创建');
    }
    setModalVisible(false);
    loadData();
  };

  const columns = [
    { title: '费用项', dataIndex: 'feeItemName', key: 'feeItemName', width: 160 },
    {
      title: '房屋类型', dataIndex: 'houseType', key: 'houseType', width: 100,
      render: (v: string) => HOUSE_TYPE_OPTIONS.find(o => o.value === v)?.label || v,
    },
    {
      title: '计费模式', dataIndex: 'pricingMode', key: 'pricingMode', width: 100,
      render: (v: PricingMode) => PRICING_MODE_OPTIONS.find(o => o.value === v)?.label || v,
    },
    {
      title: '单价', dataIndex: 'price', key: 'price', width: 120,
      render: (v: number, record: ChargeRule) => `${v} ${PRICING_MODE_UNITS[record.pricingMode] || ''}`,
    },
    { title: '生效日', dataIndex: 'effectiveDate', key: 'effectiveDate', width: 100 },
    { title: '失效日', dataIndex: 'expireDate', key: 'expireDate', width: 100, render: (v: string) => v || '永久' },
    {
      title: '状态', dataIndex: 'enabled', key: 'enabled', width: 80,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: any, record: ChargeRule) => (
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
        <div style={{ fontSize: 16, fontWeight: 600 }}>收费标准设置</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增收费标准</Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingItem ? '编辑收费标准' : '新增收费标准'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="feeItemId" label="关联费用项" rules={[{ required: true, message: '请选择费用项' }]}>
            <Select options={feeItems} placeholder="选择费用项" showSearch />
          </Form.Item>
          <Form.Item name="houseType" label="适用房屋类型" rules={[{ required: true, message: '请选择房屋类型' }]}>
            <Select options={HOUSE_TYPE_OPTIONS} placeholder="选择房屋类型" />
          </Form.Item>
          <Form.Item name="pricingMode" label="计费模式" rules={[{ required: true, message: '请选择计费模式' }]}>
            <Select options={PRICING_MODE_OPTIONS} placeholder="选择计费模式" />
          </Form.Item>
          <Form.Item name="price" label="单价" rules={[{ required: true, message: '请输入单价' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入单价" />
          </Form.Item>
          <Form.Item name="formula" label="计费公式">
            <Select mode="tags" placeholder="选择公式变量" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择生效日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expireDate" label="失效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="enabled" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChargeRuleManage;
