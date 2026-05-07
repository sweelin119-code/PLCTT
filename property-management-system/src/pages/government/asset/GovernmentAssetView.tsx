import React, { useState, useEffect } from 'react';
import {
  Card, Table, Select, Row, Col, Tag, Statistic, Progress,
} from 'antd';
import { HomeOutlined, TeamOutlined, CarOutlined, BankOutlined } from '@ant-design/icons';
import { getProjectList } from '../../../services/orgService';
import {
  getHouses,
  getOwners,
  getAssetStatistics,
} from '../../../services/assetService';
import type { Organization } from '../../../services/types';

/**
 * 政府监管端 - 资产查看页面
 * 只读模式查看管辖范围内的小区、房屋、业主信息
 */
const GovernmentAssetView: React.FC = () => {
  const [communities, setCommunities] = useState<Organization[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    buildingCount: number;
    houseCount: number;
    occupiedCount: number;
    vacantCount: number;
    parkingCount: number;
    soldRentedParkingCount: number;
    parkingUtilizationRate: number;
    ownerCount: number;
    boundHouseCount: number;
    unboundHouseCount: number;
    dataSource: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载小区列表
  useEffect(() => {
    getProjectList().then(list => {
      setCommunities(list);
      if (list.length > 0) {
        setSelectedCommunity(list[0].id);
      }
    });
  }, []);

  // 加载统计数据
  useEffect(() => {
    if (!selectedCommunity) return;
    setLoading(true);
    getAssetStatistics(selectedCommunity).then(data => {
      // 转换 assetService 返回的统计格式为组件使用的格式
      setStats({
        buildingCount: data.buildingCount,
        houseCount: data.houseCount,
        occupiedCount: data.occupiedCount,
        vacantCount: data.vacantCount,
        parkingCount: data.parkingCount,
        soldRentedParkingCount: data.soldRentedParkingCount,
        parkingUtilizationRate: data.parkingCount > 0 ? data.soldRentedParkingCount / data.parkingCount : 0,
        ownerCount: data.ownerCount,
        boundHouseCount: data.boundHouseCount,
        unboundHouseCount: data.unboundHouseCount,
        dataSource: 'gov_sync',
      });
      setLoading(false);
    });
  }, [selectedCommunity]);

  return (
    <div>
      {/* 小区选择器 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <strong style={{ fontSize: 15 }}>管辖小区：</strong>
          </Col>
          <Col flex="auto">
            <Select
              style={{ width: 300 }}
              value={selectedCommunity}
              onChange={setSelectedCommunity}
              options={communities.map(c => ({ value: c.id, label: c.name }))}
              placeholder="请选择小区"
            />
          </Col>
        </Row>
      </Card>

      {!selectedCommunity ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
            <BankOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <p style={{ marginTop: 16, fontSize: 16 }}>请先选择管辖小区查看资产信息</p>
          </div>
        </Card>
      ) : (
        <>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card loading={loading}>
                <Statistic
                  title="楼栋总数"
                  value={stats?.buildingCount || 0}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card loading={loading}>
                <Statistic
                  title="房屋总数"
                  value={stats?.houseCount || 0}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card loading={loading}>
                <Statistic
                  title="业主总数"
                  value={stats?.ownerCount || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card loading={loading}>
                <Statistic
                  title="车位数"
                  value={stats?.parkingCount || 0}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 入住率 & 车位利用率 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card title="入住率" size="small" loading={loading}>
                <Progress
                  type="dashboard"
                  percent={stats ? Math.round((stats.occupiedCount / stats.houseCount) * 100) : 0}
                  format={pct => `${pct}%`}
                />
                <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
                  已入住 {stats?.occupiedCount || 0} / 总计 {stats?.houseCount || 0}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="车位利用率" size="small" loading={loading}>
                <Progress
                  type="dashboard"
                  percent={stats ? Math.round(stats.parkingUtilizationRate * 100) : 0}
                  format={pct => `${pct}%`}
                  strokeColor="#fa8c16"
                />
                <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
                  已使用 {stats?.soldRentedParkingCount || 0} / 总计 {stats?.parkingCount || 0}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="数据来源" size="small" loading={loading}>
                <div style={{ padding: '8px 0', color: '#666' }}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#1890ff' }}>●</span> 数据来源：{stats?.dataSource === 'gov_sync' ? '政府同步' : stats?.dataSource === 'manual' ? '手动录入' : stats?.dataSource === 'import' ? '批量导入' : stats?.dataSource || '-'}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#52c41a' }}>●</span> 空置房屋：{stats?.vacantCount || 0} 套
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#722ed1' }}>●</span> 已绑定业主：{stats?.boundHouseCount || 0} 套
                  </div>
                  <div>
                    <span style={{ color: '#fa8c16' }}>●</span> 未绑定业主：{stats?.unboundHouseCount || 0} 套
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 房屋列表（只读） */}
          <Card title="房屋列表（只读）" style={{ marginBottom: 16 }} loading={loading}>
            <HouseReadOnlyTable projectId={selectedCommunity} />
          </Card>

          {/* 业主列表（只读） */}
          <Card title="业主列表（只读）" loading={loading}>
            <OwnerReadOnlyTable projectId={selectedCommunity} />
          </Card>
        </>
      )}
    </div>
  );
};

/** 房屋只读表格 */
const HouseReadOnlyTable: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getHouses({ projectId, page, pageSize: 10 }).then(result => {
      setHouses(result.list);
      setTotal(result.total);
      setLoading(false);
    });
  }, [projectId, page]);

  const columns = [
    { title: '房号', dataIndex: 'fullName', key: 'fullName', width: 130 },
    { title: '楼栋', dataIndex: 'buildingName', key: 'buildingName', width: 80 },
    { title: '面积', dataIndex: 'sizeArea', key: 'sizeArea', width: 80, render: (v: number) => v ? `${v}㎡` : '-' },
    { title: '户型', dataIndex: 'layout', key: 'layout', width: 80, render: (v: string) => v || '-' },
    {
      title: '状态', dataIndex: 'ownershipStatus', key: 'ownershipStatus', width: 80,
      render: (v: string) => {
        const map: Record<string, string> = { vacant: '空置', occupied: '已入住', rented: '出租', for_sale: '待售', renovating: '装修中' };
        const colorMap: Record<string, string> = { vacant: 'default', occupied: 'green', rented: 'blue', for_sale: 'orange', renovating: 'purple' };
        return <Tag color={colorMap[v] || 'default'}>{map[v] || v}</Tag>;
      },
    },
    {
      title: '数据来源', dataIndex: 'dataSource', key: 'dataSource', width: 80,
      render: (v: string) => ({ manual: '录入', gov_sync: '同步', import: '导入', owner_register: '登记' }[v] || v),
    },
  ];

  return (
    <Table
      dataSource={houses}
      columns={columns}
      rowKey="id"
      loading={loading}
      size="small"
      pagination={{
        current: page,
        pageSize: 10,
        total,
        showTotal: (t) => `共 ${t} 套`,
        onChange: (p) => setPage(p),
      }}
      scroll={{ x: 600 }}
    />
  );
};

/** 业主只读表格 */
const OwnerReadOnlyTable: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getOwners({ projectId, page, pageSize: 10 }).then(result => {
      setOwners(result.list);
      setTotal(result.total);
      setLoading(false);
    });
  }, [projectId, page]);

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 80 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '性别', dataIndex: 'gender', key: 'gender', width: 60, render: (v: string) => v === 'male' ? '男' : v === 'female' ? '女' : '-' },
    {
      title: '标签', dataIndex: 'tags', key: 'tags', width: 160,
      render: (tags: string[]) => tags?.length > 0
        ? tags.map((t, i) => <Tag key={i} color="blue">{t}</Tag>)
        : <span style={{ color: '#ccc' }}>-</span>,
    },
    {
      title: '数据来源', dataIndex: 'dataSource', key: 'dataSource', width: 80,
      render: (v: string) => ({ manual: '录入', gov_sync: '同步', import: '导入', owner_register: '登记' }[v] || v),
    },
  ];

  return (
    <Table
      dataSource={owners}
      columns={columns}
      rowKey="id"
      loading={loading}
      size="small"
      pagination={{
        current: page,
        pageSize: 10,
        total,
        showTotal: (t) => `共 ${t} 人`,
        onChange: (p) => setPage(p),
      }}
      scroll={{ x: 600 }}
    />
  );
};

export default GovernmentAssetView;
