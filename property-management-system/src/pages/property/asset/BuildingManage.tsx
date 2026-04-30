import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, Popconfirm, message, Switch, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from '../../../services/assetService';
import type { Building } from '../../../services/assetTypes';

const BuildingManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    if (!currentCommunity) return;
    setLoading(true);
    try {
      const data = await getBuildings(currentCommunity.id);
      setBuildings(data);
    } catch {
      message.error('加载楼栋数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommunity]);

  const handleAdd = () => {
    setEditingBuilding(null);
    form.resetFields();
    form.setFieldsValue({
      projectId: currentCommunity?.id,
      propertyType: 'residence',
      totalUnits: 1,
      sortOrder: 1,
      enabled: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: Building) => {
    setEditingBuilding(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBuilding(id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingBuilding) {
        await updateBuilding(editingBuilding.id, values);
        message.success('更新成功');
      } else {
        await createBuilding(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch {
      // validation failed
    }
  };

  const columns = [
    { title: '楼栋名称', dataIndex: 'name', key: 'name', width: 100 },
    { title: '别名', dataIndex: 'aliasName', key: 'aliasName', width: 120, render: (v: string) => v || '-' },
    { title: '类型', dataIndex: 'propertyType', key: 'propertyType', width: 80, render: (v: string) => ({ residence: '住宅', shop: '商铺', office: '办公' }[v] || v) },
    { title: '总层数', dataIndex: 'totalLayers', key: 'totalLayers', width: 80 },
    { title: '地下层数', dataIndex: 'undergroundLayers', key: 'undergroundLayers', width: 80, render: (v: number | undefined) => v ?? 0 },
    { title: '单元数', dataIndex: 'totalUnits', key: 'totalUnits', width: 80 },
    { title: '电梯数', dataIndex: 'totalElevators', key: 'totalElevators', width: 80, render: (v: number | undefined) => v ?? '-' },
    { title: '建成年份', dataIndex: 'buildYear', key: 'buildYear', width: 80, render: (v: number | undefined) => v ?? '-' },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 60 },
    {
      title: '状态', dataIndex: 'enabled', key: 'enabled', width: 60,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '数据来源', dataIndex: 'dataSource', key: 'dataSource', width: 80,
      render: (v: string) => ({ manual: '录入', gov_sync: '同步', import: '导入', owner_register: '登记' }[v] || v),
    },
    {
      title: '操作', key: 'action', width: 140,
      render: (_: any, record: Building) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除该楼栋？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!currentCommunity) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <ApartmentOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16 }}>请先选择小区</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="楼栋管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增楼栋
          </Button>
        }
      >
        <Table
          dataSource={buildings}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 栋` }}
          size="small"
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={editingBuilding ? '编辑楼栋' : '新增楼栋'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="楼栋名称" rules={[{ required: true, message: '请输入楼栋名称' }]}>
                <Input placeholder="例如：1栋、A栋" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="aliasName" label="别名">
                <Input placeholder="例如：桂花苑1号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="propertyType" label="类型" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'residence', label: '住宅' },
                  { value: 'shop', label: '商铺' },
                  { value: 'office', label: '办公' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalLayers" label="总层数" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="undergroundLayers" label="地下层数">
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="totalUnits" label="单元数" rules={[{ required: true }]}>
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalElevators" label="电梯数">
                <InputNumber min={0} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="buildYear" label="建成年份">
                <InputNumber min={1900} max={2030} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sortOrder" label="排序号">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="enabled" label="启用" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default BuildingManage;
