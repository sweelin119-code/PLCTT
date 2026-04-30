import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag,
  Popconfirm, message, Row, Col, Descriptions, Drawer,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CarOutlined, LinkOutlined, DisconnectOutlined,
} from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getParkingSpaces,
  getParkingSpaceById,
  createParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
  bindParkingOwner,
  unbindParkingOwner,
  getOwners,
} from '../../../services/assetService';
import type { ParkingSpace, Owner } from '../../../services/assetTypes';

const ParkingManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [parkings, setParkings] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // 筛选
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterKeyword, setFilterKeyword] = useState('');

  // 弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailParking, setDetailParking] = useState<ParkingSpace | null>(null);
  const [editingParking, setEditingParking] = useState<ParkingSpace | null>(null);
  const [form] = Form.useForm();

  // 绑定弹窗
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [selectedParking, setSelectedParking] = useState<ParkingSpace | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [bindForm] = Form.useForm();

  const loadData = async () => {
    if (!currentCommunity) return;
    setLoading(true);
    try {
      const result = await getParkingSpaces({
        projectId: currentCommunity.id,
        type: filterType as any,
        status: filterStatus as any,
        keyword: filterKeyword || undefined,
        page,
        pageSize,
      });
      setParkings(result.list);
      setTotal(result.total);
    } catch {
      message.error('加载车位数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommunity, filterType, filterStatus, page]);

  const handleAdd = () => {
    setEditingParking(null);
    form.resetFields();
    form.setFieldsValue({
      projectId: currentCommunity?.id,
      type: 'fixed',
      status: 'vacant',
      propertyType: 'sale',
      enabled: true,
      sortOrder: 1,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: ParkingSpace) => {
    setEditingParking(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteParkingSpace(id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const parking = await getParkingSpaceById(id);
      setDetailParking(parking);
      setDetailVisible(true);
    } catch {
      message.error('加载详情失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingParking) {
        await updateParkingSpace(editingParking.id, values);
        message.success('更新成功');
      } else {
        await createParkingSpace(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch {
      // validation failed
    }
  };

  // 打开绑定弹窗
  const handleOpenBind = async (parking: ParkingSpace) => {
    setSelectedParking(parking);
    bindForm.resetFields();
    if (currentCommunity) {
      const result = await getOwners({ projectId: currentCommunity.id, pageSize: 999 });
      setOwners(result.list);
    }
    setBindModalVisible(true);
  };

  // 执行绑定
  const handleBind = async () => {
    try {
      const values = await bindForm.validateFields();
      if (!selectedParking) return;
      await bindParkingOwner(selectedParking.id, values.ownerId);
      message.success('绑定成功');
      setBindModalVisible(false);
      loadData();
    } catch {
      // validation failed
    }
  };

  // 解绑
  const handleUnbind = async (id: number) => {
    try {
      await unbindParkingOwner(id);
      message.success('解绑成功');
      loadData();
    } catch {
      message.error('解绑失败');
    }
  };

  const typeLabelMap: Record<string, string> = {
    fixed: '固定车位',
    temporary: '临时车位',
    mechanical: '机械车位',
    mother_child: '子母车位',
  };
  const statusLabelMap: Record<string, string> = {
    vacant: '空置',
    occupied: '已占用',
    reserved: '预留',
    maintenance: '维护中',
  };
  const statusColorMap: Record<string, string> = {
    vacant: 'default',
    occupied: 'green',
    reserved: 'blue',
    maintenance: 'orange',
  };
  const propertyTypeLabelMap: Record<string, string> = {
    sale: '产权车位',
    rent: '人防车位',
    public: '公摊车位',
  };

  const columns = [
    { title: '车位编号', dataIndex: 'code', key: 'code', width: 130 },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (v: string) => typeLabelMap[v] || v,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (v: string) => <Tag color={statusColorMap[v] || 'default'}>{statusLabelMap[v] || v}</Tag>,
    },
    {
      title: '产权性质', dataIndex: 'propertyType', key: 'propertyType', width: 100,
      render: (v: string) => propertyTypeLabelMap[v] || v,
    },
    { title: '面积', dataIndex: 'sizeArea', key: 'sizeArea', width: 80, render: (v: number) => v ? `${v}㎡` : '-' },
    { title: '楼层', dataIndex: 'floor', key: 'floor', width: 60 },
    {
      title: '业主', key: 'owner', width: 100,
      render: (_: any, record: ParkingSpace) =>
        record.ownerName ? <Tag color="blue">{record.ownerName}</Tag> : <Tag>未绑定</Tag>,
    },
    {
      title: '数据来源', dataIndex: 'dataSource', key: 'dataSource', width: 80,
      render: (v: string) => ({ manual: '录入', gov_sync: '同步', import: '导入', owner_register: '登记' }[v] || v),
    },
    {
      title: '操作', key: 'action', width: 220,
      render: (_: any, record: ParkingSpace) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          {record.ownerId ? (
            <Popconfirm title="确定解绑业主？" onConfirm={() => handleUnbind(record.id)}>
              <Button type="link" size="small" icon={<DisconnectOutlined />}>解绑</Button>
            </Popconfirm>
          ) : (
            <Button type="link" size="small" icon={<LinkOutlined />} onClick={() => handleOpenBind(record)}>绑定</Button>
          )}
          <Popconfirm title="确定删除该车位？" onConfirm={() => handleDelete(record.id)}>
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
          <CarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16 }}>请先选择小区</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="车位管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增车位
          </Button>
        }
      >
        {/* 筛选栏 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Select
              placeholder="车位类型"
              allowClear
              style={{ width: '100%' }}
              value={filterType}
              onChange={(v) => { setFilterType(v); setPage(1); }}
              options={Object.entries(typeLabelMap).map(([value, label]) => ({ value, label }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="车位状态"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={(v) => { setFilterStatus(v); setPage(1); }}
              options={Object.entries(statusLabelMap).map(([value, label]) => ({ value, label }))}
            />
          </Col>
          <Col span={6}>
            <Input.Search
              placeholder="搜索车位编号"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              onSearch={() => setPage(1)}
              allowClear
            />
          </Col>
        </Row>

        <Table
          dataSource={parkings}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: (t) => `共 ${t} 个`,
            onChange: (p) => setPage(p),
          }}
          size="small"
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingParking ? '编辑车位' : '新增车位'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="车位编号" rules={[{ required: true, message: '请输入车位编号' }]}>
                <Input placeholder="如：B1-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="车位类型" rules={[{ required: true }]}>
                <Select options={Object.entries(typeLabelMap).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="车位状态" rules={[{ required: true }]}>
                <Select options={Object.entries(statusLabelMap).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="propertyType" label="产权性质" rules={[{ required: true }]}>
                <Select options={Object.entries(propertyTypeLabelMap).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sizeArea" label="面积(㎡)">
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="floor" label="楼层">
                <InputNumber min={-10} max={100} style={{ width: '100%' }} placeholder="如：-1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="monthlyRent" label="月租金(元)">
                <InputNumber min={0} step={50} style={{ width: '100%' }} placeholder="如：300" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sortOrder" label="排序号">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 绑定弹窗 */}
      <Modal
        title={`绑定业主 - ${selectedParking?.code || ''}`}
        open={bindModalVisible}
        onOk={handleBind}
        onCancel={() => setBindModalVisible(false)}
        width={480}
      >
        <Form form={bindForm} layout="vertical">
          <Form.Item name="ownerId" label="选择业主" rules={[{ required: true, message: '请选择业主' }]}>
            <Select
              showSearch
              placeholder="搜索并选择业主"
              filterOption={(input, option) =>
                (option?.label as string || '').toLowerCase().includes(input.toLowerCase())
              }
              options={owners.map(o => ({
                value: o.id,
                label: `${o.name} (${o.phone})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="车位详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={480}
      >
        {detailParking && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="车位编号" span={2}>{detailParking.code}</Descriptions.Item>
            <Descriptions.Item label="类型">{typeLabelMap[detailParking.type]}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColorMap[detailParking.status]}>{statusLabelMap[detailParking.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="产权性质">{propertyTypeLabelMap[detailParking.propertyType]}</Descriptions.Item>
            <Descriptions.Item label="面积">{detailParking.sizeArea ? `${detailParking.sizeArea}㎡` : '-'}</Descriptions.Item>
            <Descriptions.Item label="楼层">{detailParking.floor ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="月租金">{detailParking.monthlyRent ? `${detailParking.monthlyRent}元` : '-'}</Descriptions.Item>
            <Descriptions.Item label="绑定业主">{detailParking.ownerName || '未绑定'}</Descriptions.Item>
            <Descriptions.Item label="数据来源" span={2}>
              {({ manual: '录入', gov_sync: '同步', import: '导入', owner_register: '登记' } as any)[detailParking.dataSource] || detailParking.dataSource}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>{detailParking.createTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>{detailParking.updateTime}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default ParkingManage;
