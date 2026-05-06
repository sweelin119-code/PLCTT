import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Space, Button, Input, Select, Modal, Form, InputNumber, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getParkingFeeRules,
  getParkingFeeRuleById,
  createParkingFeeRule,
  updateParkingFeeRule,
  deleteParkingFeeRule,
  type ParkingFeeRule,
  type FeeRateType,
  type FeeRuleStatus,
} from '../../../services/parkingFeeService';

const ParkingFeeRateManage: React.FC = () => {
  const projectId = 1;

  const [rules, setRules] = useState<ParkingFeeRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('');

  // 编辑弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getParkingFeeRules(projectId);
      let filtered = data;
      if (keyword) {
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      if (vehicleType) {
        filtered = filtered.filter(r => r.vehicleType === vehicleType);
      }
      setRules(filtered);
    } catch (err) {
      message.error('加载收费标准失败');
    } finally {
      setLoading(false);
    }
  }, [keyword, vehicleType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      projectId,
      rateType: 'hourly',
      freeMinutes: 30,
      dailyCap: 0,
      status: 'active',
      sortOrder: 1,
    });
    setModalVisible(true);
  };

  const handleEdit = async (id: number) => {
    setEditingId(id);
    try {
      const rule = await getParkingFeeRuleById(id);
      if (rule) {
        form.setFieldsValue(rule);
        setModalVisible(true);
      } else {
        message.error('未找到该收费标准');
      }
    } catch (err) {
      message.error('加载收费标准详情失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteParkingFeeRule(id);
      message.success('删除成功');
      loadData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingId) {
        await updateParkingFeeRule(editingId, values);
        message.success('更新成功');
      } else {
        await createParkingFeeRule(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      if (err.errorFields) return; // 表单校验未通过
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      car: '小型车',
      motorcycle: '摩托车',
      large: '大型车',
    };
    return map[type] || type;
  };

  const getRateTypeLabel = (type: FeeRateType) => {
    const map: Record<string, string> = {
      hourly: '按小时',
      daily: '按天',
      monthly: '按月',
      yearly: '按年',
    };
    return map[type] || type;
  };

  const columns: ColumnsType<ParkingFeeRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
    },
    {
      title: '车辆类型',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      width: 100,
      render: (type: string) => getVehicleTypeLabel(type),
    },
    {
      title: '计费方式',
      dataIndex: 'rateType',
      key: 'rateType',
      width: 100,
      render: (type: FeeRateType) => getRateTypeLabel(type),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => `${price}元`,
    },
    {
      title: '免费时长',
      dataIndex: 'freeMinutes',
      key: 'freeMinutes',
      width: 100,
      render: (minutes: number) => `${minutes}分钟`,
    },
    {
      title: '每日封顶',
      dataIndex: 'dailyCap',
      key: 'dailyCap',
      width: 100,
      render: (cap: number) => (cap ? `${cap}元` : '无封顶'),
    },
    {
      title: '月租价格',
      dataIndex: 'monthlyPrice',
      key: 'monthlyPrice',
      width: 100,
      render: (price?: number) => (price ? `${price}元/月` : '-'),
    },
    {
      title: '年租价格',
      dataIndex: 'yearlyPrice',
      key: 'yearlyPrice',
      width: 100,
      render: (price?: number) => (price ? `${price}元/年` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: FeeRuleStatus) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ParkingFeeRule) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该收费标准？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="搜索规则名称"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="车辆类型"
              value={vehicleType || undefined}
              onChange={v => setVehicleType(v || '')}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: '小型车', value: 'car' },
                { label: '摩托车', value: 'motorcycle' },
                { label: '大型车', value: 'large' },
              ]}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增规则
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadData}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑收费标准' : '新增收费标准'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="projectId" hidden><Input /></Form.Item>
          <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="如：临时停车收费标准（小型车）" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="vehicleType" label="车辆类型" rules={[{ required: true, message: '请选择车辆类型' }]}>
                <Select
                  options={[
                    { label: '小型车', value: 'car' },
                    { label: '摩托车', value: 'motorcycle' },
                    { label: '大型车', value: 'large' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rateType" label="计费方式" rules={[{ required: true, message: '请选择计费方式' }]}>
                <Select
                  options={[
                    { label: '按小时', value: 'hourly' },
                    { label: '按天', value: 'daily' },
                    { label: '按月', value: 'monthly' },
                    { label: '按年', value: 'yearly' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sortOrder" label="排序号">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="unitPrice" label="单价（元）" rules={[{ required: true, message: '请输入单价' }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="如：5" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="freeMinutes" label="免费时长（分钟）">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="如：30" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dailyCap" label="每日封顶（元，0为不封顶）">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="如：30" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="monthlyPrice" label="月租价格（元/月）">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="如：300" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="yearlyPrice" label="年租价格（元/年）">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="如：3000" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '启用', value: 'active' },
                    { label: '停用', value: 'inactive' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="规则说明">
            <Input.TextArea rows={3} placeholder="如：30分钟内免费，超过后按5元/小时计费，每日封顶30元" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ParkingFeeRateManage;
