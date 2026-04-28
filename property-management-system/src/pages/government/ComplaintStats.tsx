import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Rate, Progress } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SmileOutlined, FrownOutlined, MehOutlined } from '@ant-design/icons';
import { getComplaintList, getComplaintStats, complaintCategoryMap } from '../../services/complaintService';
import type { Complaint, ComplaintCategory } from '../../services/types';

const ComplaintStats: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0, pendingAccept: 0, processing: 0, closed: 0,
    urgentCount: 0, satisfactionAvg: 0,
    categoryStats: [] as { category: ComplaintCategory; count: number }[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getComplaintList();
      setComplaints(data);
      const s = await getComplaintStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 满意度分布
  const satisfactionDistribution = () => {
    const closed = complaints.filter(c => c.status === 'closed' && c.satisfaction);
    const excellent = closed.filter(c => (c.satisfaction || 0) >= 5).length;
    const good = closed.filter(c => (c.satisfaction || 0) === 4).length;
    const fair = closed.filter(c => (c.satisfaction || 0) === 3).length;
    const poor = closed.filter(c => (c.satisfaction || 0) <= 2).length;
    return { excellent, good, fair, poor, total: closed.length };
  };

  const satDist = satisfactionDistribution();

  // 各物业投诉排行
  const companyComplaintStats = () => {
    const map = new Map<string, { total: number; closed: number; satisfactionSum: number; satisfactionCount: number }>();
    complaints.forEach(c => {
      const name = c.propertyCompanyName || '未知';
      if (!map.has(name)) {
        map.set(name, { total: 0, closed: 0, satisfactionSum: 0, satisfactionCount: 0 });
      }
      const item = map.get(name)!;
      item.total++;
      if (c.status === 'closed') {
        item.closed++;
        if (c.satisfaction) {
          item.satisfactionSum += c.satisfaction;
          item.satisfactionCount++;
        }
      }
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({
        companyName: name,
        total: data.total,
        closed: data.closed,
        avgSatisfaction: data.satisfactionCount > 0 ? Math.round((data.satisfactionSum / data.satisfactionCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const companyStats = companyComplaintStats();

  // 分类占比
  const totalCount = stats.categoryStats.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <div>
      {/* 概览统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="投诉总量" value={stats.total} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待受理" value={stats.pendingAccept} prefix={<ClockCircleOutlined />} valueStyle={{ color: stats.pendingAccept > 0 ? '#fa8c16' : undefined }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="处理中" value={stats.processing} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已归档" value={stats.closed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="紧急待办" value={stats.urgentCount} prefix={<ExclamationCircleOutlined />} valueStyle={{ color: stats.urgentCount > 0 ? '#ff4d4f' : undefined }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="综合满意度" value={stats.satisfactionAvg} precision={1} suffix="/ 5" prefix={<SmileOutlined />} valueStyle={{ color: stats.satisfactionAvg >= 4 ? '#52c41a' : stats.satisfactionAvg >= 3 ? '#fa8c16' : '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="归档率" value={stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0} suffix="%" prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="紧急占比" value={stats.total > 0 ? Math.round((stats.urgentCount / stats.total) * 100) : 0} suffix="%" prefix={<ExclamationCircleOutlined />} valueStyle={{ color: stats.urgentCount > 0 ? '#ff4d4f' : undefined }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 投诉分类统计 */}
        <Col span={12}>
          <Card title="投诉分类统计" style={{ marginBottom: 16 }}>
            <Table
              dataSource={stats.categoryStats}
              rowKey="category"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '投诉分类',
                  dataIndex: 'category',
                  key: 'category',
                  render: (cat: ComplaintCategory) => complaintCategoryMap[cat] || cat,
                },
                {
                  title: '数量',
                  dataIndex: 'count',
                  key: 'count',
                  width: 80,
                },
                {
                  title: '占比',
                  key: 'percent',
                  width: 200,
                  render: (_: any, record: { category: ComplaintCategory; count: number }) => (
                    <Progress
                      percent={Math.round((record.count / totalCount) * 100)}
                      size="small"
                      format={pct => `${pct}%`}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 满意度分布 */}
        <Col span={12}>
          <Card title="满意度分布" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
                  <SmileOutlined style={{ fontSize: 28, color: '#52c41a' }} />
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', margin: '8px 0' }}>{satDist.excellent}</div>
                  <div style={{ color: '#666' }}>非常满意 (5分)</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
                  <MehOutlined style={{ fontSize: 28, color: '#fa8c16' }} />
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#fa8c16', margin: '8px 0' }}>{satDist.good + satDist.fair}</div>
                  <div style={{ color: '#666' }}>一般满意 (3-4分)</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center', background: '#fff2f0' }}>
                  <FrownOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f', margin: '8px 0' }}>{satDist.poor}</div>
                  <div style={{ color: '#666' }}>不满意 (1-2分)</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, color: '#1890ff', fontWeight: 700 }}>{stats.satisfactionAvg}</div>
                  <div style={{ color: '#666' }}>平均满意度</div>
                  <Rate disabled value={stats.satisfactionAvg} style={{ fontSize: 12 }} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 各物业投诉排行 */}
      <Card title="各物业公司投诉统计排行">
        <Table
          dataSource={companyStats}
          rowKey="companyName"
          loading={loading}
          pagination={false}
          columns={[
            {
              title: '排名',
              key: 'rank',
              width: 60,
              render: (_: any, __: any, index: number) => {
                const colors = ['#ff4d4f', '#fa8c16', '#faad14', '#1890ff', '#52c41a'];
                return <Tag color={colors[index] || '#999'}>{index + 1}</Tag>;
              },
            },
            {
              title: '物业公司',
              dataIndex: 'companyName',
              key: 'companyName',
            },
            {
              title: '投诉总量',
              dataIndex: 'total',
              key: 'total',
              sorter: (a: any, b: any) => b.total - a.total,
            },
            {
              title: '已归档',
              dataIndex: 'closed',
              key: 'closed',
            },
            {
              title: '归档率',
              key: 'closeRate',
              render: (_: any, record: any) => {
                const rate = record.total > 0 ? Math.round((record.closed / record.total) * 100) : 0;
                return <span>{rate}%</span>;
              },
            },
            {
              title: '平均满意度',
              dataIndex: 'avgSatisfaction',
              key: 'avgSatisfaction',
              sorter: (a: any, b: any) => b.avgSatisfaction - a.avgSatisfaction,
              render: (val: number) => val > 0 ? <Rate disabled value={val} style={{ fontSize: 12 }} /> : '-',
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ComplaintStats;
