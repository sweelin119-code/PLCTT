import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, DatePicker, Space, Button, Select, message } from 'antd';
import { DollarOutlined, CarOutlined, RiseOutlined, BarChartOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getParkingFeeStats,
  getParkingFeeTrend,
  getParkingChargeRecords,
  type ParkingFeeStats as ParkingFeeStatsType,
  type FeeTrendPoint,
  type ParkingChargeRecord,
} from '../../../services/parkingFeeService';

const { RangePicker } = DatePicker;

const ParkingFeeStats: React.FC = () => {
  const projectId = 1;

  const [stats, setStats] = useState<ParkingFeeStatsType | null>(null);
  const [trend, setTrend] = useState<FeeTrendPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // 收费明细
  const [records, setRecords] = useState<ParkingChargeRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<string>('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [page, setPage] = useState(1);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, trendData] = await Promise.all([
        getParkingFeeStats(projectId),
        getParkingFeeTrend(projectId),
      ]);
      setStats(statsData);
      setTrend(trendData);
    } catch (err) {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const result = await getParkingChargeRecords({
        projectId,
        payMethod: payMethod || undefined,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
        page,
        pageSize: 10,
      });
      setRecords(result.list);
    } catch (err) {
      message.error('加载收费记录失败');
    } finally {
      setRecordsLoading(false);
    }
  }, [payMethod, dateRange, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const getPayMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      wechat: '微信支付',
      alipay: '支付宝',
      cash: '现金',
      monthly: '月租车',
      free: '免费',
    };
    return map[method] || method;
  };

  const getPayMethodColor = (method: string) => {
    const map: Record<string, string> = {
      wechat: 'green',
      alipay: 'blue',
      cash: 'orange',
      monthly: 'purple',
      free: 'default',
    };
    return map[method] || 'default';
  };

  const columns: ColumnsType<ParkingChargeRecord> = [
    {
      title: '车牌号',
      dataIndex: 'plateNo',
      key: 'plateNo',
      width: 120,
    },
    {
      title: '入场时间',
      dataIndex: 'entryTime',
      key: 'entryTime',
      width: 160,
    },
    {
      title: '出场时间',
      dataIndex: 'exitTime',
      key: 'exitTime',
      width: 160,
    },
    {
      title: '停留时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
    },
    {
      title: '应收',
      dataIndex: 'fee',
      key: 'fee',
      width: 80,
      render: (val: number) => `¥${val.toFixed(2)}`,
    },
    {
      title: '实收',
      dataIndex: 'actualFee',
      key: 'actualFee',
      width: 80,
      render: (val: number) => `¥${val.toFixed(2)}`,
    },
    {
      title: '支付方式',
      dataIndex: 'payMethod',
      key: 'payMethod',
      width: 100,
      render: (method: string) => (
        <Tag color={getPayMethodColor(method)}>{getPayMethodLabel(method)}</Tag>
      ),
    },
    {
      title: '收费时间',
      dataIndex: 'payTime',
      key: 'payTime',
      width: 160,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}>
          <Card loading={loading} size="small">
            <Statistic
              title="今日收入"
              value={stats?.todayIncome || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={loading} size="small">
            <Statistic
              title="本月收入"
              value={stats?.monthIncome || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#1890ff', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={loading} size="small">
            <Statistic
              title="本年收入"
              value={stats?.yearIncome || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#722ed1', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={loading} size="small">
            <Statistic
              title="累计收入"
              value={stats?.totalIncome || 0}
              precision={2}
              prefix={<RiseOutlined />}
              suffix="元"
              valueStyle={{ color: '#fa8c16', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={loading} size="small">
            <Statistic
              title="今日收费笔数"
              value={stats?.todayCount || 0}
              prefix={<BarChartOutlined />}
              suffix="笔"
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={loading} size="small">
            <Statistic
              title="当前在场"
              value={stats?.currentParked || 0}
              prefix={<CarOutlined />}
              suffix="辆"
              valueStyle={{ color: '#faad14', fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 7日趋势 */}
      <Card title="近7日收费趋势" size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 8, padding: '16px 0' }}>
          {trend.map((point, idx) => {
            const maxAmount = Math.max(...trend.map(t => t.amount), 1);
            const height = (point.amount / maxAmount) * 160;
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                  ¥{point.amount.toFixed(0)}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 40,
                    height: Math.max(height, 4),
                    background: 'linear-gradient(180deg, #1890ff 0%, #69c0ff 100%)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s',
                    minHeight: 4,
                  }}
                />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  {point.date.slice(5)}
                </div>
                <div style={{ fontSize: 10, color: '#bbb' }}>
                  {point.count}笔
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 收费明细 */}
      <Card
        title="收费明细"
        size="small"
        extra={
          <Space>
            <Select
              placeholder="支付方式"
              value={payMethod || undefined}
              onChange={v => { setPayMethod(v || ''); setPage(1); }}
              allowClear
              style={{ width: 120 }}
              options={[
                { label: '微信支付', value: 'wechat' },
                { label: '支付宝', value: 'alipay' },
                { label: '现金', value: 'cash' },
                { label: '月租车', value: 'monthly' },
                { label: '免费', value: 'free' },
              ]}
            />
            <RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
                } else {
                  setDateRange(null);
                }
                setPage(1);
              }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => { loadStats(); loadRecords(); }}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={recordsLoading}
          pagination={{
            pageSize: 10,
            current: page,
            onChange: p => setPage(p),
            showTotal: t => `共 ${t} 条`,
          }}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ParkingFeeStats;
