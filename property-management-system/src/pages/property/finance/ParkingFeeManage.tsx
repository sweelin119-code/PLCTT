import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tabs } from 'antd';
import { HomeOutlined, KeyOutlined, DollarOutlined, CarOutlined, FileTextOutlined } from '@ant-design/icons';
import {
  getParkingFeeStats,
  getParkingFeeTrend,
  type ParkingFeeStats,
  type FeeTrendPoint,
} from '../../../services/parkingFeeService';
import PropertyParkingFee from './PropertyParkingFee';
import RentalParkingManage from './RentalParkingManage';
import RentalParkingFee from './RentalParkingFee';
import EntryManage from './EntryManage';
import TemporaryCharge from './TemporaryCharge';

const ParkingFeeManage: React.FC = () => {
  const projectId = 1;

  const [activeTab, setActiveTab] = useState('property');
  const [stats, setStats] = useState<ParkingFeeStats | null>(null);
  const [trend, setTrend] = useState<FeeTrendPoint[]>([]);

  const loadStats = useCallback(async () => {
    const data = await getParkingFeeStats(projectId);
    setStats(data);
    const trendData = await getParkingFeeTrend(projectId, 7);
    setTrend(trendData);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const tabItems = [
    {
      key: 'property',
      label: (
        <span>
          <HomeOutlined /> 产权车位收费
        </span>
      ),
      children: <PropertyParkingFee projectId={projectId} onStatsChange={loadStats} />,
    },
    {
      key: 'rental',
      label: (
        <span>
          <KeyOutlined /> 月租车位管理
        </span>
      ),
      children: <RentalParkingManage projectId={projectId} />,
    },
    {
      key: 'rental_fees',
      label: (
        <span>
          <DollarOutlined /> 月租收费记录
        </span>
      ),
      children: <RentalParkingFee projectId={projectId} onStatsChange={loadStats} />,
    },
    {
      key: 'entry',
      label: (
        <span>
          <CarOutlined /> 车辆出入管理
        </span>
      ),
      children: <EntryManage projectId={projectId} onStatsChange={loadStats} />,
    },
    {
      key: 'charge',
      label: (
        <span>
          <FileTextOutlined /> 临时收费记录
        </span>
      ),
      children: <TemporaryCharge projectId={projectId} />,
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small">
            <Statistic title="产权车位管理费" value={stats?.propertyParkingCount ?? 0} suffix="笔" />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small">
            <Statistic title="月租订阅数" value={stats?.rentalSubscriberCount ?? 0} suffix="个" />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small">
            <Statistic title="待缴管理费" value={stats?.propertyFeePending ?? 0} prefix="¥" precision={2} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small">
            <Statistic title="待缴月租费" value={stats?.rentalFeePending ?? 0} prefix="¥" precision={2} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small">
            <Statistic title="在场车辆" value={stats?.currentParked ?? 0} suffix="辆" />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small">
            <Statistic title="今日收入" value={stats?.todayIncome ?? 0} prefix="¥" precision={2} />
          </Card>
        </Col>
      </Row>

      {/* 趋势图 */}
      {trend.length > 0 && (
        <Card title="近7日收费趋势" size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 8 }}>
            {trend.map((point, idx) => {
              const maxAmount = Math.max(...trend.map(t => t.amount), 1);
              const height = (point.amount / maxAmount) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>¥{point.amount.toFixed(0)}</span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 40,
                      height: Math.max(height, 4),
                      background: 'linear-gradient(to top, #1677ff, #69b1ff)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s',
                    }}
                  />
                  <span style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{point.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 标签页 */}
      <Card size="small">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default ParkingFeeManage;
