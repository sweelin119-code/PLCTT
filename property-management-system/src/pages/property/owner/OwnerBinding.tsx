import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Select, Space, Tag, Popconfirm,
  message, Row, Col, Input, Descriptions, Timeline,
} from 'antd';
import { LinkOutlined, DisconnectOutlined, HistoryOutlined, HomeOutlined } from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getBuildings,
  getUnits,
  getHouses,
  getHouseById,
  getOwners,
  getHouseOwners,
  bindOwner,
  unbindOwner,
  getOwnerChangeHistory,
} from '../../../services/assetService';
import type { Building, BuildingUnit, House, Owner, HouseOwner, OwnerChangeLog } from '../../../services/assetTypes';

const OwnerBinding: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [houses, setHouses] = useState<House[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<BuildingUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // 筛选
  const [filterBuilding, setFilterBuilding] = useState<number | undefined>();
  const [filterUnit, setFilterUnit] = useState<number | undefined>();
  const [filterKeyword, setFilterKeyword] = useState('');

  // 绑定弹窗
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [bindForm] = Form.useForm();

  // 详情弹窗
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailHouse, setDetailHouse] = useState<House | null>(null);
  const [houseOwners, setHouseOwners] = useState<HouseOwner[]>([]);
  const [changeHistory, setChangeHistory] = useState<OwnerChangeLog[]>([]);

  // 加载楼栋
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

  const loadHouses = async () => {
    if (!currentCommunity) return;
    setLoading(true);
    try {
      const result = await getHouses({
        projectId: currentCommunity.id,
        buildingId: filterBuilding,
        unitId: filterUnit,
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
    loadHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommunity, filterBuilding, filterUnit, page]);

  // 打开绑定弹窗
  const handleOpenBind = async (house: House) => {
    setSelectedHouse(house);
    bindForm.resetFields();
    // 加载该小区的业主列表
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
      if (!selectedHouse) return;
      await bindOwner({
        houseId: selectedHouse.id,
        ownerId: values.ownerId,
        ownerType: values.ownerType,
        remark: values.remark,
      });
      message.success('绑定成功');
      setBindModalVisible(false);
      loadHouses();
    } catch {
      // validation failed
    }
  };

  // 解绑
  const handleUnbind = async (id: number) => {
    try {
      await unbindOwner(id);
      message.success('解绑成功');
      loadHouses();
      if (detailVisible) {
        loadDetail(selectedHouse?.id || 0);
      }
    } catch {
      message.error('解绑失败');
    }
  };

  // 查看详情
  const loadDetail = async (houseId: number) => {
    try {
      const [house, owners, history] = await Promise.all([
        getHouseById(houseId),
        getHouseOwners(houseId),
        getOwnerChangeHistory(houseId),
      ]);
      if (house) setDetailHouse(house);
      setHouseOwners(owners);
      setChangeHistory(history);
      setDetailVisible(true);
    } catch {
      message.error('加载详情失败');
    }
  };

  const statusLabelMap: Record<string, string> = {
    vacant: '空置', occupied: '已入住', rented: '出租', for_sale: '待售', renovating: '装修中',
  };
  const statusColorMap: Record<string, string> = {
    vacant: 'default', occupied: 'green', rented: 'blue', for_sale: 'orange', renovating: 'purple',
  };
  const ownerTypeLabelMap: Record<string, string> = {
    owner: '业主', co_owner: '共有人', family: '家属', tenant: '租户',
  };

  const columns = [
    { title: '房号', dataIndex: 'fullName', key: 'fullName', width: 130 },
    { title: '楼栋', dataIndex: 'buildingName', key: 'buildingName', width: 80 },
    { title: '单元', dataIndex: 'unitName', key: 'unitName', width: 60 },
    { title: '楼层', dataIndex: 'floor', key: 'floor', width: 60 },
    { title: '面积', dataIndex: 'area', key: 'area', width: 80, render: (v: number) => v ? `${v}㎡` : '-' },
    {
      title: '状态', dataIndex: 'ownershipStatus', key: 'ownershipStatus', width: 80,
      render: (v: string) => <Tag color={statusColorMap[v]}>{statusLabelMap[v] || v}</Tag>,
    },
    {
      title: '业主', key: 'owner', width: 100,
      render: (_: any, record: House) => {
        // 简化：从mockHouseOwners中查找
        return record.ownerName ? <Tag color="blue">{record.ownerName}</Tag> : <Tag>未绑定</Tag>;
      },
    },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: any, record: House) => (
        <Space>
          <Button type="link" size="small" icon={<LinkOutlined />} onClick={() => handleOpenBind(record)}>绑定</Button>
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => loadDetail(record.id)}>详情</Button>
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
      <Card title="业主绑定管理">
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
          <Col span={6}>
            <Input.Search
              placeholder="搜索房号"
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
          scroll={{ x: 900 }}
        />
      </Card>

      {/* 绑定弹窗 */}
      <Modal
        title={`绑定业主 - ${selectedHouse?.fullName || ''}`}
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
          <Form.Item name="ownerType" label="关系类型" rules={[{ required: true }]}>
            <Select options={Object.entries(ownerTypeLabelMap).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="如：配偶、子女等" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title={`房屋业主详情 - ${detailHouse?.fullName || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={640}
      >
        {detailHouse && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="房号" span={2}>{detailHouse.fullName}</Descriptions.Item>
              <Descriptions.Item label="面积">{detailHouse.area ? `${detailHouse.area}㎡` : '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColorMap[detailHouse.ownershipStatus]}>
                  {statusLabelMap[detailHouse.ownershipStatus]}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginBottom: 12 }}>当前绑定业主</h4>
            {houseOwners.length > 0 ? (
              <Table
                dataSource={houseOwners}
                columns={[
                  { title: '业主姓名', dataIndex: 'ownerName', key: 'ownerName' },
                  { title: '手机号', dataIndex: 'ownerPhone', key: 'ownerPhone' },
                  {
                    title: '关系', dataIndex: 'ownerType', key: 'ownerType',
                    render: (v: string) => ownerTypeLabelMap[v] || v,
                  },
                  { title: '绑定时间', dataIndex: 'bindTime', key: 'bindTime' },
                  {
                    title: '操作', key: 'action',
                    render: (_: any, record: HouseOwner) => (
                      <Popconfirm title="确定解绑该业主？" onConfirm={() => handleUnbind(record.id)}>
                        <Button type="link" size="small" danger icon={<DisconnectOutlined />}>解绑</Button>
                      </Popconfirm>
                    ),
                  },
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <div style={{ color: '#999', padding: 16, textAlign: 'center' }}>暂无绑定业主</div>
            )}

            <h4 style={{ margin: '16px 0 12px' }}>变更记录</h4>
            {changeHistory.length > 0 ? (
              <Timeline
                items={changeHistory.map(log => ({
                  color: log.changeType === 'sale' ? 'red' : 'blue',
                  children: (
                    <div>
                      <div>{log.changeReason} - {log.operatorName}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{log.changeTime}</div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <div style={{ color: '#999', padding: 16, textAlign: 'center' }}>暂无变更记录</div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default OwnerBinding;
