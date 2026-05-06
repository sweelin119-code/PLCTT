import React, { useState, useCallback, useEffect } from 'react';
import { Table, Tag, Button, Input, Select, Modal, Form, Row, Col, Space, message, Popconfirm } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getRentalSubscriptions,
  createRentalSubscription,
  updateRentalSubscription,
  deleteRentalSubscription,
  type RentalParkingSubscription,
  type RentalParkingQueryParams,
} from '../../../services/parkingFeeService';

interface Props {
  projectId: number;
}

const RentalParkingManage: React.FC<Props> = ({ projectId }) => {
  const [data, setData] = useState<RentalParkingSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<RentalParkingSubscription | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params: RentalParkingQueryParams = { projectId, page: p, pageSize: 10 };
      if (keyword) params.keyword = keyword;
      if (status) params.status = status;
      const result = await getRentalSubscriptions(params);
      setData(result.list);
      setTotal(result.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [projectId, keyword, status]);

  useEffect(() => { loadData(1); }, [loadData]);

  const handleOpenModal = (record?: RentalParkingSubscription) => {
    if (record) {
      setEditing(record);
      form.setFieldsValue(record);
    } else {
      setEditing(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await updateRentalSubscription(editing.id, values);
        message.success('更新成功');
      } else {
        await createRentalSubscription({ ...values, projectId, status: 'active' });
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData(page);
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRentalSubscription(id);
      message.success('删除成功');
      loadData(1);
    } catch (err: any) {
      message.error(err.message || '删除失败');
    }
  };

  const getSubStatusTag = (s: string) => {
    switch (s) {
      case 'active': return <Tag color="success">有效</Tag>;
      case 'expired': return <Tag color="error">已过期</Tag>;
      case 'cancelled': return <Tag color="default">已取消</Tag>;
      default: return <Tag>{s}</Tag>;
    }
  };

  const columns: ColumnsType<RentalParkingSubscription> = [
    { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120, render: (text) => <strong>{text}</strong> },
    { title: '业主姓名', dataIndex: 'ownerName', key: 'ownerName', width: 100 },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '固定车位', dataIndex: 'parkingCode', key: 'parkingCode', width: 100, render: (text) => text || '无固定车位' },
    { title: '月租金(元)', dataIndex: 'monthlyRent', key: 'monthlyRent', width: 100, render: (fee) => <strong>¥{fee.toFixed(2)}</strong> },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 110 },
    { title: '到期日期', dataIndex: 'endDate', key: 'endDate', width: 110 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s) => getSubStatusTag(s) },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>编辑</Button>
          <Popconfirm title="确定删除该订阅？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索车牌号/业主姓名/电话"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={() => loadData(1)}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="订阅状态"
            value={status || undefined}
            onChange={v => setStatus(v || '')}
            allowClear
            options={[
              { value: 'active', label: '有效' },
              { value: 'expired', label: '已过期' },
              { value: 'cancelled', label: '已取消' },
            ]}
          />
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => loadData(1)}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); setStatus(''); loadData(1); }}>重置</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>新增月租订阅</Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: loadData,
          showTotal: (t) => `共 ${t} 条记录`,
        }}
      />
      <Modal
        title={editing ? '编辑月租订阅' : '新增月租订阅'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="plateNo" label="车牌号" rules={[{ required: true, message: '请输入车牌号' }]}>
                <Input placeholder="如：浙A·88888" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ownerName" label="业主/租户姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthlyRent" label="月租金（元）" rules={[{ required: true, message: '请输入月租金' }]}>
                <Input type="number" min={0} prefix="¥" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="开始日期" rules={[{ required: true, message: '请选择开始日期' }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="到期日期" rules={[{ required: true, message: '请选择到期日期' }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RentalParkingManage;
