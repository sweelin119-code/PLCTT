import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Space, DatePicker, Descriptions } from 'antd';
import { getFeeStatistics, getBuildingFeeSummary, getFeeTrend } from '../../../services/feeService';
import { FeeStatistics, BuildingFeeSummary, FeeTrendPoint } from '../../../services/feeTypes';
import { useCommunity } from '../../../contexts/CommunityContext';

const ReportManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [stats, setStats] = useState<FeeStatistics | null>(null);
  const [buildingSummary, setBuildingSummary] = useState<BuildingFeeSummary[]>([]);
  const [trend, setTrend] = useState<FeeTrendPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  const loadData = async () => {
    setLoading(true);
    try {
      const projectId = currentCommunity?.id || 1;
      const [s, b, t] = await Promise.all([
        getFeeStatistics(projectId),
        getBuildingFeeSummary(projectId),
        getFeeTrend(projectId, year),
      ]);
      setStats(s);
      setBuildingSummary(b);
      setTrend(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCommunity, year]);

  // 简单柱状图（用 div 模拟）
  const renderBarChart = () => {
    if (trend.length === 0) return null;
    const maxValue = Math.max(...trend.map(t => Math.max(t.receivable, t.received)), 1);

    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 8, padding: '16px 0' }}>
        {trend.map((point, idx) => (
          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            {/* 已收柱 */}
            <div style={{
              width: '60%',
              height: `${(point.received / maxValue) * 160}px`,
              background: 'linear-gradient(180deg, #52c41a, #73d13d)',
              borderRadius: '4px 4px 0 0',
              minHeight: point.received > 0 ? 4 : 0,
              position: 'relative',
            }} title={`已收: ¥${point.received.toFixed(2)}`} />
            {/* 应收柱 */}
            <div style={{
              width: '60%',
              height: `${(point.receivable / maxValue) * 160}px`,
              background: 'linear-gradient(180deg, #1890ff, #40a9ff)',
              borderRadius: '4px 4px 0 0',
              minHeight: point.receivable > 0 ? 4 : 0,
              marginTop: 2,
              position: 'relative',
            }} title={`应收: ¥${point.receivable.toFixed(2)}`} />
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{point.month}</div>
          </div>
        ))}
      </div>
    );
  };

  // 收费率趋势线（用 div 模拟）
  const renderRateChart = () => {
    if (trend.length === 0) return null;
    const maxRate = Math.max(...trend.map(t => t.collectionRate), 100);

    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 150, gap: 8, padding: '16px 0' }}>
        {trend.map((point, idx) => (
          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{
              width: '70%',
              height: `${(point.collectionRate / maxRate) * 120}px`,
              background: point.collectionRate >= 90 ? '#52c41a' : point.collectionRate >= 70 ? '#faad14' : '#ff4d4f',
              borderRadius: '4px 4px 0 0',
              minHeight: point.collectionRate > 0 ? 4 : 0,
              transition: 'height 0.3s',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: 4,
            }}>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{point.collectionRate}%</span>
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{point.month}</div>
          </div>
        ))}
      </div>
    );
  };

  const buildingColumns = [
    { title: '楼栋名称', dataIndex: 'buildingName', key: 'buildingName' },
    { title: '总户数', dataIndex: 'totalHouses', key: 'totalHouses' },
    {
      title: '应收金额', dataIndex: 'receivable', key: 'receivable',
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '已收金额', dataIndex: 'received', key: 'received',
      render: (v: number) => <span style={{ color: '#3f8600' }}>¥${v.toFixed(2)}</span>,
    },
    {
      title: '欠费金额', dataIndex: 'arrears', key: 'arrears',
      render: (v: number) => <span style={{ color: v > 0 ? '#cf1322' : '#3f8600' }}>¥${v.toFixed(2)}</span>,
    },
    {
      title: '收费率', dataIndex: 'collectionRate', key: 'collectionRate',
      render: (v: number) => {
        const color = v >= 90 ? '#3f8600' : v >= 70 ? '#faad14' : '#cf1322';
        return <span style={{ color, fontWeight: 600 }}>{v}%</span>;
      },
    },
  ];

  return (
    <div>
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small" loading={loading}>
            <Statistic title="总应收" value={stats?.totalReceivable || 0} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" loading={loading}>
            <Statistic title="总已收" value={stats?.totalReceived || 0} precision={2} prefix="¥" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" loading={loading}>
            <Statistic title="总欠费" value={stats?.totalArrears || 0} precision={2} prefix="¥" valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" loading={loading}>
            <Statistic title="收费率" value={stats?.collectionRate || 0} precision={1} suffix="%" valueStyle={{ color: (stats?.collectionRate || 0) >= 90 ? '#3f8600' : '#faad14' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" loading={loading}>
            <Statistic title="本月应收" value={stats?.monthReceivable || 0} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" loading={loading}>
            <Statistic title="本月已收" value={stats?.monthReceived || 0} precision={2} prefix="¥" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
      </Row>

      {/* 收费趋势图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title={
            <Space>
              <span>月度收费趋势</span>
              <DatePicker picker="year" value={undefined} onChange={(_, dateStr) => setYear(Number(dateStr) || new Date().getFullYear())} />
            </Space>
          } size="small" loading={loading}>
            <div style={{ marginBottom: 8, display: 'flex', gap: 16 }}>
              <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#1890ff', borderRadius: 2, marginRight: 4 }} /> 应收</span>
              <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#52c41a', borderRadius: 2, marginRight: 4 }} /> 已收</span>
            </div>
            {renderBarChart()}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="月度收费率" size="small" loading={loading}>
            <div style={{ marginBottom: 8, display: 'flex', gap: 16 }}>
              <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#52c41a', borderRadius: 2, marginRight: 4 }} /> 收费率</span>
              <span style={{ color: '#999', fontSize: 12 }}>绿色≥90%, 黄色≥70%, 红色&lt;70%</span>
            </div>
            {renderRateChart()}
          </Card>
        </Col>
      </Row>

      {/* 按楼栋汇总 */}
      <Card title="按楼栋收费汇总" size="small" loading={loading} style={{ marginBottom: 16 }}>
        <Table
          rowKey="buildingId"
          columns={buildingColumns}
          dataSource={buildingSummary}
          pagination={false}
          size="small"
          summary={() => {
            if (buildingSummary.length === 0) return null;
            const totalReceivable = buildingSummary.reduce((s, r) => s + r.receivable, 0);
            const totalReceived = buildingSummary.reduce((s, r) => s + r.received, 0);
            const totalArrears = totalReceivable - totalReceived;
            const totalRate = totalReceivable > 0 ? ((totalReceived / totalReceivable) * 100).toFixed(1) : '0';
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><strong>合计</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1}>{buildingSummary.reduce((s, r) => s + r.totalHouses, 0)}</Table.Summary.Cell>
                <Table.Summary.Cell index={2}><strong>¥{totalReceivable.toFixed(2)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={3}><strong style={{ color: '#3f8600' }}>¥{totalReceived.toFixed(2)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={4}><strong style={{ color: totalArrears > 0 ? '#cf1322' : '#3f8600' }}>¥{totalArrears.toFixed(2)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={5}><strong style={{ color: Number(totalRate) >= 90 ? '#3f8600' : '#faad14' }}>{totalRate}%</strong></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* 收费概况说明 */}
      <Card title="收费概况" size="small" loading={loading}>
        {stats && (
          <Descriptions column={4} size="small" bordered>
            <Descriptions.Item label="总账单数">{stats.totalBills}</Descriptions.Item>
            <Descriptions.Item label="已缴账单数">{stats.paidBills}</Descriptions.Item>
            <Descriptions.Item label="逾期户数">{stats.overdueCount}</Descriptions.Item>
            <Descriptions.Item label="本月收费率">{stats.monthCollectionRate}%</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default ReportManage;
