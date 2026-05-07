import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag,
  Popconfirm, message, Row, Col, Descriptions, Drawer, Timeline,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, HomeOutlined, ThunderboltOutlined, UserAddOutlined } from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getBuildings,
  getUnits,
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
  batchGenerateHouses,
  getOwners,
  getHouseOwners,
  bindOwner,
  unbindOwner,
  getOwnerChangeHistory,
} from '../../../services/assetService';
import type { Building, BuildingUnit, House, Owner } from '../../../services/assetService';
import type { BatchGenerateParams } from '../../../services/assetService';

const HouseManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [houses, setHouses] = useState<House[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<BuildingUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // 筛选条件
  const [filterBuilding, setFilterBuilding] = useState<number | undefined>();
  const [filterUnit, setFilterUnit] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterKeyword, setFilterKeyword] = useState<string>('');

  // 弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailHouse, setDetailHouse] = useState<House | null>(null);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  // 业主绑定相关
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [bindHouseId, setBindHouseId] = useState<number | null>(null);
  const [ownerList, setOwnerList] = useState<Owner[]>([]);
  const [houseOwners, setHouseOwners] = useState<any[]>([]);
  const [ownerChangeHistory, setOwnerChangeHistory] = useState<any[]>([]);
  const [bindForm] = Form.useForm();

  // 加载楼栋列表
  useEffect(() => {
    if (!currentCommunity) return;
    getBuildings(currentCommunity.id).then(setBuildings);
  }, [currentCommunity]);

  // 楼栋变化时加载单元
  useEffect(() => {
    if (filterBuilding) {
      getUnits(filterBuilding).then(setUnits);
    } else {
      setUnits([]);
    }
  }, [filterBuilding]);

  const loadData = async () => {
    if (!currentCommunity) return;
    setLoading(true);
    try {
      const result = await getHouses({
        projectId: currentCommunity.id,
        buildingId: filterBuilding,
        unitId: filterUnit,
        ownershipStatus: filterStatus,
        keyword: filterKeyword || undefined,
        page,
        pageSize,
      });
      setHouses(result.list);
      setTotal(result.total);
    } catch {
      message.error('加载房屋数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommunity, filterBuilding, filterUnit, filterStatus, page]);

  const handleAdd = () => {
    setEditingHouse(null);
    form.resetFields();
    form.setFieldsValue({
      projectId: currentCommunity?.id,
      decorationStatus: 'rough',
      ownershipStatus: 'vacant',
      propertyType: 'residence',
      sortOrder: 1,
      enabled: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: House) => {
    setEditingHouse(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHouse(id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const house = await getHouseById(id);
      setDetailHouse(house);
      setDetailVisible(true);
    } catch {
      message.error('加载详情失败');
    }
  };

  // 打开绑定业主弹窗
  const handleBindOwner = async (record: House) => {
    setBindHouseId(record.id);
    bindForm.resetFields();
    // 加载业主列表
    const result = await getOwners({ projectId: currentCommunity!.id, page: 1, pageSize: 100 });
    setOwnerList(result.list);
    // 加载当前房屋已绑定的业主
    const owners = await getHouseOwners(record.id);
    setHouseOwners(owners);
    const history = await getOwnerChangeHistory(record.id);
    setOwnerChangeHistory(history);
    setBindModalVisible(true);
  };

  // 执行绑定
  const handleConfirmBind = async () => {
    try {
      const values = await bindForm.validateFields();
      await bindOwner({
        houseId: bindHouseId!,
        ownerId: values.ownerId,
        ownerType: values.ownerType,
        remark: values.remark,
      });
      message.success('绑定成功');
      // 刷新绑定列表
      const owners = await getHouseOwners(bindHouseId!);
      setHouseOwners(owners);
      const history = await getOwnerChangeHistory(bindHouseId!);
      setOwnerChangeHistory(history);
      bindForm.resetFields();
    } catch {
      // validation failed
    }
  };

  // 解绑业主
  const handleUnbindOwner = async (id: number) => {
    try {
      await unbindOwner(id);
      message.success('解绑成功');
      const owners = await getHouseOwners(bindHouseId!);
      setHouseOwners(owners);
      const history = await getOwnerChangeHistory(bindHouseId!);
      setOwnerChangeHistory(history);
    } catch {
      message.error('解绑失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingHouse) {
        await updateHouse(editingHouse.id, values);
        message.success('更新成功');
      } else {
        await createHouse(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch {
      // validation failed
    }
  };

  const handleBatchGenerate = async () => {
    try {
      const values = await batchForm.validateFields();
      await batchGenerateHouses(values as BatchGenerateParams);
      message.success('批量生成成功');
      setBatchModalVisible(false);
      loadData();
    } catch {
      // validation failed
    }
  };

  const statusColorMap: Record<string, string> = {
    vacant: 'default',
    occupied: 'green',
    rented: 'blue',
    for_sale: 'orange',
    renovating: 'purple',
  };
  const statusLabelMap: Record<string, string> = {
    vacant: '空置',
    occupied: '已入住',
    rented: '出租',
    for_sale: '待售',
    renovating: '装修中',
  };
  const decorationLabelMap: Record<string, string> = {
    rough: '毛坯',
    simple: '简装',
    standard: '精装',
    luxury: '豪装',
  };

  const columns = [
    { title: '房号', dataIndex: 'fullName', key: 'fullName', width: 130 },
    { title: '楼栋', dataIndex: 'buildingName', key: 'buildingName', width: 80 },
    { title: '单元', dataIndex: 'unitName', key: 'unitName', width: 60 },
    { title: '楼层', dataIndex: 'floor', key: 'floor', width: 60 },
    { title: '户型', dataIndex: 'layout', key: 'layout', width: 80, render: (v: string) => v || '-' },
    { title: '面积', dataIndex: 'area', key: 'area', width: 80, render: (v: number) => v ? `${v}㎡` : '-' },
    {
      title: '装修', dataIndex: 'decorationStatus', key: 'decorationStatus', width: 60,
      render: (v: string) => decorationLabelMap[v] || v,
    },
    {
      title: '状态', dataIndex: 'ownershipStatus', key: 'ownershipStatus', width: 80,
      render: (v: string) => <Tag color={statusColorMap[v] || 'default'}>{statusLabelMap[v] || v}</Tag>,
    },
    {
      title: '数据来源', dataIndex: 'dataSource', key: 'dataSource', width: 80,
      render: (v: string) => ({ manual: '录入', gov_sync: '同步', import: '导入', owner_register: '登记' }[v] || v),
    },
    {
      title: '操作', key: 'action', width: 240,
      render: (_: any, record: House) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" icon={<UserAddOutlined />} onClick={() => handleBindOwner(record)}>绑定业主</Button>
          <Popconfirm title="确定删除该房屋？" onConfirm={() => handleDelete(record.id)}>
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
          <HomeOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16 }}>请先选择小区</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="房屋管理"
        extra={
          <Space>
            <Button icon={<ThunderboltOutlined />} onClick={() => {
              batchForm.resetFields();
              batchForm.setFieldsValue({ projectId: currentCommunity?.id, roomsPerFloor: 2, startFloor: 1 });
              setBatchModalVisible(true);
            }}>
              批量生成
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增房屋
            </Button>
          </Space>
        }
      >
        {/* 筛选栏 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Select
              placeholder="选择楼栋"
              allowClear
              style={{ width: '100%' }}
              value={filterBuilding}
              onChange={(v) => { setFilterBuilding(v); setFilterUnit(undefined); setPage(1); }}
              options={buildings.map(b => ({ value: b.id, label: b.name }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择单元"
              allowClear
              style={{ width: '100%' }}
              value={filterUnit}
              onChange={(v) => { setFilterUnit(v); setPage(1); }}
              options={units.map(u => ({ value: u.id, label: u.name }))}
              disabled={!filterBuilding}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="房屋状态"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={(v) => { setFilterStatus(v); setPage(1); }}
              options={Object.entries(statusLabelMap).map(([value, label]) => ({ value, label }))}
            />
          </Col>
          <Col span={6}>
            <Input.Search
              placeholder="搜索房号/楼栋"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              onSearch={() => setPage(1)}
              allowClear
            />
          </Col>
        </Row>

        <Table
          dataSource={houses}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: (t) => `共 ${t} 套`,
            onChange: (p) => setPage(p),
          }}
          size="small"
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingHouse ? '编辑房屋' : '新增房屋'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="buildingId" label="所属楼栋" rules={[{ required: true }]}>
                <Select options={buildings.map(b => ({ value: b.id, label: b.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unitId" label="所属单元">
                <Select allowClear options={units.map(u => ({ value: u.id, label: u.name }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="floor" label="楼层" rules={[{ required: true }]}>
                <InputNumber min={-10} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="roomNo" label="房号" rules={[{ required: true, message: '请输入房号' }]}>
                <Input placeholder="如：0101" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fullName" label="完整名称" rules={[{ required: true }]}>
                <Input placeholder="如：1栋1单元0101" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="layout" label="户型">
                <Input placeholder="如：3室2厅" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="area" label="建筑面积(㎡)">
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="usableArea" label="使用面积(㎡)">
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="orientation" label="朝向">
                <Select allowClear options={[
                  { value: '南', label: '南' },
                  { value: '南北', label: '南北' },
                  { value: '东', label: '东' },
                  { value: '西', label: '西' },
                  { value: '北', label: '北' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="decorationStatus" label="装修状态">
                <Select options={Object.entries(decorationLabelMap).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ownershipStatus" label="房屋状态">
                <Select options={Object.entries(statusLabelMap).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="propertyType" label="房产类型">
                <Select options={[
                  { value: 'residence', label: '住宅' },
                  { value: 'shop', label: '商铺' },
                  { value: 'office', label: '办公' },
                ]} />
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

      {/* 批量生成弹窗 */}
      <Modal
        title="批量生成房屋"
        open={batchModalVisible}
        onOk={handleBatchGenerate}
        onCancel={() => setBatchModalVisible(false)}
        width={480}
      >
        <Form form={batchForm} layout="vertical">
          <Form.Item name="buildingId" label="楼栋" rules={[{ required: true }]}>
            <Select options={buildings.map(b => ({ value: b.id, label: b.name }))} />
          </Form.Item>
          <Form.Item name="unitId" label="单元" rules={[{ required: true }]}>
            <Select options={units.map(u => ({ value: u.id, label: u.name }))} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startFloor" label="起始楼层" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endFloor" label="结束楼层" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="roomsPerFloor" label="每层户数" rules={[{ required: true }]}>
            <InputNumber min={1} max={6} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 绑定业主弹窗 */}
      <Modal
        title={`绑定业主 - ${detailHouse?.fullName || ''}`}
        open={bindModalVisible}
        onCancel={() => setBindModalVisible(false)}
        width={640}
        footer={null}
      >
        <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
          <Descriptions.Item label="当前已绑定业主">
            {houseOwners.length === 0 ? (
              <span style={{ color: '#999' }}>暂无绑定业主</span>
            ) : (
              houseOwners.map((ho: any) => (
                <Tag key={ho.id} closable onClose={() => handleUnbindOwner(ho.id)}>
                  {ho.ownerName} ({ho.relationship === 'owner' ? '业主' : ho.relationship === 'tenant' ? '租客' : ho.relationship === 'family' ? '家属' : ho.relationship})
                  {ho.isPrimary ? ' [户主]' : ''}
                </Tag>
              ))
            )}
          </Descriptions.Item>
        </Descriptions>

        <Form form={bindForm} layout="vertical">
          <Form.Item name="ownerId" label="选择业主" rules={[{ required: true, message: '请选择业主' }]}>
            <Select
              showSearch
              placeholder="搜索业主姓名/手机号"
              filterOption={(input, option) =>
                (option?.label as string || '').toLowerCase().includes(input.toLowerCase())
              }
              options={ownerList.map(o => ({
                value: o.id,
                label: `${o.name} (${o.phone})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="ownerType" label="关系" rules={[{ required: true, message: '请选择关系' }]}>
            <Select options={[
              { value: 'owner', label: '业主' },
              { value: 'tenant', label: '租客' },
              { value: 'family', label: '家属' },
              { value: 'other', label: '其他' },
            ]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input placeholder="如：户主、配偶等" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleConfirmBind}>确认绑定</Button>
          </Form.Item>
        </Form>

        {ownerChangeHistory.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>变更记录</h4>
            <Timeline
              items={ownerChangeHistory.map((log: any) => ({
                children: `${log.changeDesc} - ${log.createTime}`,
              }))}
            />
          </div>
        )}
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="房屋详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={480}
      >
        {detailHouse && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="完整房号" span={2}>{detailHouse.fullName}</Descriptions.Item>
            <Descriptions.Item label="楼栋">{detailHouse.buildingName}</Descriptions.Item>
            <Descriptions.Item label="单元">{detailHouse.unitName}</Descriptions.Item>
            <Descriptions.Item label="楼层">{detailHouse.floor}</Descriptions.Item>
            <Descriptions.Item label="房号">{detailHouse.roomNo}</Descriptions.Item>
            <Descriptions.Item label="户型">{detailHouse.layout || '-'}</Descriptions.Item>
            <Descriptions.Item label="面积">{detailHouse.area ? `${detailHouse.area}㎡` : '-'}</Descriptions.Item>
            <Descriptions.Item label="使用面积">{detailHouse.usableArea ? `${detailHouse.usableArea}㎡` : '-'}</Descriptions.Item>
            <Descriptions.Item label="朝向">{detailHouse.orientation || '-'}</Descriptions.Item>
            <Descriptions.Item label="装修">{decorationLabelMap[detailHouse.decorationStatus]}</Descriptions.Item>
            <Descriptions.Item label="状态" span={2}>
              <Tag color={statusColorMap[detailHouse.ownershipStatus]}>
                {statusLabelMap[detailHouse.ownershipStatus]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="数据来源" span={2}>
              {({ manual: '录入', gov_sync: '同步', import: '导入', owner_register: '登记' } as any)[detailHouse.dataSource] || detailHouse.dataSource}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>{detailHouse.createTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>{detailHouse.updateTime}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default HouseManage;
