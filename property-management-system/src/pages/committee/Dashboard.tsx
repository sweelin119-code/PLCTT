import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Spin, Button, Progress, Timeline } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, TeamOutlined, FundOutlined, SmileOutlined, WarningOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getRecentReports, type DashboardStats, type PropertyReport } from '../../services/committeeService';

const CommitteeDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<PropertyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, r] = await Promise.all([getDashboardStats(), getRecentReports()]);
        setStats(s);
        setReports(r);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) {
    return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  }

  const todoItems = [
    { count: stats.pendingFundReviews, label: '待审核维修资金申请', color: 'red', key: 'fund' },
    { count: stats.pendingComplaints, label: '待处理业主投诉升级', color: 'orange', key: 'complaint' },
    { count: stats.pendingReports, label: '待审阅物业报告', color: 'blue', key: 'report' },
    { count: stats.pendingMinutes, label: '待确认会议纪要', color: 'purple', key: 'minutes' },
  ];

  return (
    <div>
      {/* 待办事项 */}
      <Card title="待办事项" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {todoItems.map(item => (
            <Col span={6} key={item.key}>
              <Card size="small" hoverable onClick={() => navigate(`/committee/${item.key}`)}>
                <Statistic
                  title={item.label}
                  value={item.count}
                  prefix={item.count > 0 ? <WarningOutlined style={{ color: '#ff4d4f' }} /> : <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: item.count > 0 ? '#ff4d4f' : '#52c41a', fontSize: 28 }}
                  suffix={item.count > 0 ? '项待处理' : '全部完成'}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 快捷入口 */}
      <Card title="快捷入口" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Button type="primary" block icon={<TeamOutlined />} onClick={() => navigate('/committee/vote')}>
              发起业主大会
            </Button>
          </Col>
          <Col span={8}>
            <Button block icon={<FileTextOutlined />} onClick={() => navigate('/committee/meetings')}>
              召开会议
            </Button>
          </Col>
          <Col span={8}>
            <Button block icon={<FundOutlined />} onClick={() => navigate('/committee/notice')}>
              发布公告
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 数据概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="本月业主投诉量" value={stats.monthlyComplaints} suffix="件" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="物业服务质量评分" value={stats.serviceScore} suffix="分" prefix={<SmileOutlined />} valueStyle={{ color: stats.serviceScore >= 85 ? '#52c41a' : '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="维修资金余额" value={stats.fundBalance} prefix="¥" precision={0} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="业主满意度" value={stats.satisfaction} suffix="%" prefix={<SmileOutlined />} valueStyle={{ color: stats.satisfaction >= 85 ? '#52c41a' : '#faad14' }} />
            <Progress percent={stats.satisfaction} size="small" status={stats.satisfaction >= 85 ? 'success' : 'active'} />
          </Card>
        </Col>
      </Row>

      {/* 最近动态 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近动态" size="small">
            <Timeline
              items={[
                { color: 'green', children: '物业提交4月工作报告' },
                { color: 'blue', children: '3栋电梯维修资金申请待审核' },
                { color: 'gray', children: '业主满意度调查结束，共312户参与' },
                { color: 'orange', children: '绿化改造方案意见征集中' },
                { color: 'red', children: '小区供水故障已修复' },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最新物业报告" size="small" extra={<a onClick={() => navigate('/committee/coordination')}>查看全部 <ArrowRightOutlined /></a>}>
            <List
              size="small"
              dataSource={reports}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                    title={item.title}
                    description={`提交时间：${item.submittedAt} | 状态：${item.status === 'submitted' ? <Tag color="orange">待审阅</Tag> : <Tag color="green">已审阅</Tag>}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CommitteeDashboard;
