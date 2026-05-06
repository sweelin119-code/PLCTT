import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, DatePicker, Switch, Space, Tag, message, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getFeeItems, createFeeItem, updateFeeItem, deleteFeeItem, getChargeRules, createChargeRule, updateChargeRule, deleteChargeRule } from '../../../services/feeService';
import { FeeItem, FeeCategory, BillingCycle, ChargeRule, PricingMode } from '../../../services/feeTypes';
import { useCommunity } from '../../../contexts/CommunityContext';
import dayjs from 'dayjs';

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

const FeeItemManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [activeTab, setActiveTab] = useState('fee-items');

  // FeeItem state
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [feeItemsLoading, setFeeItemsLoading] = useState(false);
  const [feeItemModalVisible, setFeeItemModalVisible] = useState(false);
  const [editingFeeItem, setEditingFeeItem] = useState<FeeItem | null>(null);
  const [feeItemForm] = Form.useForm();

  // ChargeRule state
  const [chargeRules, setChargeRules] = useState<ChargeRule[]>([]);
  const [chargeRuleFeeItems, setChargeRuleFeeItems] = useState<{ value: number; label: string }[]>([]);
  const [chargeRulesLoading, setChargeRulesLoading] = useState(false);
  const [chargeRuleModalVisible, setChargeRuleModalVisible] = useState(false);
  const [editingChargeRule, setEditingChargeRule] = useState<ChargeRule | null>(null);
  const [chargeRuleForm] = Form.useForm();

  // ========== FeeItem CRUD ==========
  const loadFeeItems = async () => {
    setFeeItemsLoading(true);
    try {
      const items = await getFeeItems(currentCommunity?.id || 1);
      setFeeItems(items);
    } finally {
      setFeeItemsLoading(false);
    }
  };

  const handleAddFeeItem = () => {
    setEditingFeeItem(null);
    feeItemForm.resetFields();
    feeItemForm.setFieldsValue({ enabled: true, taxRate: 0, sortOrder: 0 });
    setFeeItemModalVisible(true);
  };

  const handleEditFeeItem = (item: FeeItem) => {
    setEditingFeeItem(item);
    feeItemForm.setFieldsValue(item);
    setFeeItemModalVisible(true);
  };

  const handleDeleteFeeItem = async (id: number) => {
    await deleteFeeItem(id);
    message.success('已删除');
    loadFeeItems();
  };

  const handleSaveFeeItem = async () => {
    const values = await feeItemForm.validateFields();
    if (editingFeeItem) {
      await updateFeeItem(editingFeeItem.id, values);
      message.success('已更新');
    } else {
      await createFeeItem({ ...values, projectId: currentCommunity?.id || 1 });
      message.success('已创建');
    }
    setFeeItemModalVisible(false);
    loadFeeItems();
  };

  // ========== ChargeRule CRUD ==========
  const loadChargeRules = async () => {
    setChargeRulesLoading(true);
    try {
      const rules = await getChargeRules(currentCommunity?.id || 1);
      setChargeRules(rules);
    } finally {
      setChargeRulesLoading(false);
    }
  };

  const loadChargeRuleFeeItems = async () => {
    const items = await getFeeItems(currentCommunity?.id || 1);
    setChargeRuleFeeItems(items.map(f => ({ value: f.id, label: `${f.name} (${f.code})` })));
  };

  const handleAddChargeRule = () => {
    setEditingChargeRule(null);
    chargeRuleForm.resetFields();
    chargeRuleForm.setFieldsValue({ enabled: true });
    setChargeRuleModalVisible(true);
  };

  const handleEditChargeRule = (item: ChargeRule) => {
    setEditingChargeRule(item);
    chargeRuleForm.setFieldsValue({
      ...item,
      effectiveDate: item.effectiveDate ? dayjs(item.effectiveDate) : undefined,
      expireDate: item.expireDate ? dayjs(item.expireDate) : undefined,
    });
    setChargeRuleModalVisible(true);
  };

  const handleDeleteChargeRule = async (id: number) => {
    await deleteChargeRule(id);
    message.success('已删除');
    loadChargeRules();
  };

  const handleSaveChargeRule = async () => {
    const values = await chargeRuleForm.validateFields();
    const payload = {
      ...values,
      projectId: currentCommunity?.id || 1,
      effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : undefined,
      expireDate: values.expireDate ? values.expireDate.format('YYYY-MM-DD') : undefined,
    };
    if (editingChargeRule) {
      await updateChargeRule(editingChargeRule.id, payload);
      message.success('已更新');
    } else {
      await createChargeRule(payload);
      message.success('已创建');
    }
    setChargeRuleModalVisible(false);
    loadChargeRules();
  };

  // ========== Tab switching ==========
  const onTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'charge-rules') {
      loadChargeRules();
      loadChargeRuleFeeItems();
    }
  };

  // ========== Columns ==========
  const feeItemColumns = [
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
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditFeeItem(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteFeeItem(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const chargeRuleColumns = [
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
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditChargeRule(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteChargeRule(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={onTabChange} items={[
        {
          key: 'fee-items',
          label: '费用项管理',
          children: (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>费用项目管理</div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFeeItem}>新增费用项</Button>
              </div>
              <Table
                rowKey="id"
                columns={feeItemColumns}
                dataSource={feeItems}
                loading={feeItemsLoading}
                pagination={false}
              />
              <Modal
                title={editingFeeItem ? '编辑费用项' : '新增费用项'}
                open={feeItemModalVisible}
                onOk={handleSaveFeeItem}
                onCancel={() => setFeeItemModalVisible(false)}
                okText="保存"
                cancelText="取消"
              >
                <Form form={feeItemForm} layout="vertical">
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
                  <Form.Item label="自动生成账单" style={{ marginBottom: 0 }}>
                    <Space>
                      <Form.Item name="autoGenerate" valuePropName="checked" noStyle>
                        <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                      </Form.Item>
                      <Form.Item noStyle shouldUpdate={(prev, next) => prev.autoGenerate !== next.autoGenerate}>
                        {({ getFieldValue }) => getFieldValue('autoGenerate') ? (
                          <Form.Item name="generateDay" label="生成日" style={{ marginBottom: 0, marginLeft: 12 }}>
                            <Select style={{ width: 120 }} placeholder="每月几号" options={Array.from({ length: 28 }, (_, i) => ({ value: i + 1, label: `每月${i + 1}日` }))} />
                          </Form.Item>
                        ) : null}
                      </Form.Item>
                    </Space>
                  </Form.Item>
                  <Form.Item name="remark" label="备注">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </Form>
              </Modal>
            </div>
          ),
        },
        {
          key: 'charge-rules',
          label: '收费标准配置',
          children: (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>收费标准设置</div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddChargeRule}>新增收费标准</Button>
              </div>
              <Table
                rowKey="id"
                columns={chargeRuleColumns}
                dataSource={chargeRules}
                loading={chargeRulesLoading}
                pagination={false}
              />
              <Modal
                title={editingChargeRule ? '编辑收费标准' : '新增收费标准'}
                open={chargeRuleModalVisible}
                onOk={handleSaveChargeRule}
                onCancel={() => setChargeRuleModalVisible(false)}
                okText="保存"
                cancelText="取消"
                width={600}
              >
                <Form form={chargeRuleForm} layout="vertical">
                  <Form.Item name="feeItemId" label="关联费用项" rules={[{ required: true, message: '请选择费用项' }]}>
                    <Select options={chargeRuleFeeItems} placeholder="选择费用项" showSearch />
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
          ),
        },
      ]} />
    </div>
  );
};

export default FeeItemManage;
