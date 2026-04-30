import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Spin, Alert, Progress } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  CarOutlined,
  ApartmentOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import { getAssetStatistics, getBuildingStatistics } from '../../../services/assetService';
import type { AssetStatistics, BuildingStatistics } from '../../../services/assetTypes';

const AssetOverview: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [stats, setStats] = useState<AssetStatistics | null>(null);
  const [buildingStats, setBuildingStats] = useState<BuildingStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentCommunity) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [assetStats, bStats] = await Promise.all([
          getAssetStatistics(currentCommunity.id),
          getBuildingStatistics(currentCommunity.id),
        ]);
        setStats(assetStats);
        setBuildingStats(bStats);
      } catch (e) {
        setError('加载资产数据失败，请稍后重试');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentCommunity]);

  if (!currentCommunity) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Alert
          message="请先选择小区"
          description="请在右上角选择要管理的小区后查看资产数据"
          type="info"
          showIcon
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" tip="加载资产数据中..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="加载失败" description={error} type="error" showIcon />;
  }

  if (!stats) return null;

  const buildingColumns = [
    { title: '楼栋名称', dataIndex: 'buildingName', key: 'buildingName', width: 120 },
    { title: '总户数', dataIndex: 'totalHouses', key: 'totalHouses', width: 100 },
    { title: '已入住', dataIndex: 'occupiedCount', key: 'occupiedCount', width: 100 },
    {
      title: '入住率',
      dataIndex: 'occupancyRate',
      key: 'occupancyRate',
      width: 200,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 80 ? 'success' : rate >= 50 ? 'active' : 'exception'}
        />
      ),
    },
  ];

  return (
    <div>
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="楼栋总数"
              value={stats.buildingCount}
              prefix={<ApartmentOutlined style={{ color: '#1890ff' }} />}
              suffix="栋"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="房屋总数"
              value={stats.houseCount}
              prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
              suffix="套"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="业主总数"
              value={stats.ownerCount}
              prefix={<TeamOutlined style={{ color: '#faad14' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="车位总数"
              value={stats.parkingCount}
              prefix={<CarOutlined style={{ color: '#722ed1' }} />}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      {/* 入住率 & 车位利用率 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="房屋入住情况" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="已入住"
                  value={stats.occupiedCount}
                  prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                  suffix={`套 / ${stats.occupancyRate}%`}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="空置"
                  value={stats.vacantCount}
                  prefix={<FallOutlined style={{ color: '#ff4d4f' }} />}
                  suffix="套"
                />
              </Col>
            </Row>
            <Progress
              percent={stats.occupancyRate}
              style={{ marginTop: 12 }}
              status={stats.occupancyRate >= 80 ? 'success' : 'active'}
            />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              已绑定业主 {stats.boundHouseCount} 套 / 未绑定 {stats.unboundHouseCount} 套
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="车位使用情况" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="固定车位" value={stats.fixedParkingCount} suffix="个" />
              </Col>
              <Col span={8}>
                <Statistic title="临时车位" value={stats.temporaryParkingCount} suffix="个" />
              </Col>
              <Col span={8}>
                <Statistic title="已售/租" value={stats.soldRentedParkingCount} suffix="个" />
              </Col>
            </Row>
            <Progress
              percent={stats.parkingUtilizationRate}
              style={{ marginTop: 12 }}
              status={stats.parkingUtilizationRate >= 70 ? 'success' : 'active'}
            />
          </Card>
        </Col>
      </Row>

      {/* 楼栋入住率分布 */}
      <Card title="楼栋入住率分布" size="small" style={{ marginTop: 16 }}>
        <Table
          dataSource={buildingStats}
          columns={buildingColumns}
          rowKey="buildingId"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 数据来源说明 */}
      <Alert
        message="数据说明"
        description={`当前展示的是「${currentCommunity.name}」的资产数据概览。本月新增业主 ${stats.monthlyNewOwnerCount} 人。数据来源：${stats.dataSource === 'gov_sync' ? '政府端同步' : '物业端录入'}`}
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default AssetOverview;
