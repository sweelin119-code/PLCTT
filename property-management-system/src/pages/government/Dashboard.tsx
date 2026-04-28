import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress, List, Typography } from 'antd';
import {
  BankOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const GovernmentDashboard: React.FC = () => {
  const complaintData = [
    { key: '1', community: '碧桂园小区', type: '物业服务', status: '处理中', time: '2026-04-27', level: '紧急' },
    { key: '2', community: '万科城市花园', type: '收费纠纷', status: '已分派', time: '2026-04-26', level: '普通' },
    { key: '3', community: '龙湖花园', type: '设施维修', status: '待处理', time: '2026-04-25', level: '紧急' },
    { key: '4', community: '保利中心', type: '邻里纠纷', status: '处理中', time: '2026-04-24', level: '普通' },
    { key: '5', community: '中海国际', type: '环境卫生', status: '已完成', time: '2026-04-23', level: '普通' },
  ];

  const columns = [
    { title: '小区名称', dataIndex: 'community', key: 'community' },
    { title: '投诉类型', dataIndex: 'type', key: 'type' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = { '处理中': 'processing', '已分派': 'warning', '待处理': 'error', '已完成': 'success' };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: '紧急程度', dataIndex: 'level', key: 'level',
      render: (level: string) => <Tag color={level === '紧急' ? 'red' : 'blue'}>{level}</Tag>
    },
    { title: '投诉时间', dataIndex: 'time', key: 'time' },
  ];

  const qualityRanking = [
    { name: '万科物业', score: 98, change: 'up' },
    { name: '碧桂园服务', score: 95, change: 'up' },
    { name: '龙湖物业', score: 92, change: 'down' },
    { name: '保利物业', score: 88, change: 'up' },
    { name: '中海物业', score: 85, change: 'down' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>政府监管工作台</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="备案物业企业"
              value={128}
              prefix={<BankOutlined />}
              suffix={<span style={{ fontSize: 14, color: '#52c41a' }}><ArrowUpOutlined /> 8%</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="本月投诉量"
              value={256}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix={<span style={{ fontSize: 14, color: '#cf1322' }}><ArrowUpOutlined /> 12%</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="投诉办结率"
              value={94.6}
              precision={1}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="从业人员认证"
              value={3560}
              prefix={<TeamOutlined />}
              suffix={<span style={{ fontSize: 14, color: '#52c41a' }}><ArrowUpOutlined /> 5%</span>}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="最新投诉工单" extra={<a href="/government/complaint/list">查看全部</a>}>
            <Table dataSource={complaintData} columns={columns} pagination={false} size="small" />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="物业服务质量排名">
            <List
              dataSource={qualityRanking}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 24, height: 24, borderRadius: 12,
                        background: index < 3 ? '#1890ff' : '#f0f0f0',
                        color: index < 3 ? '#fff' : '#666',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={item.name}
                    description={<Progress percent={item.score} size="small" />}
                  />
                  <div>
                    {item.change === 'up'
                      ? <ArrowUpOutlined style={{ color: '#52c41a' }} />
                      : <ArrowDownOutlined style={{ color: '#cf1322' }} />
                    }
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card title="物业费收缴率" size="small">
            <Progress type="dashboard" percent={78} size={100} style={{ display: 'flex', justifyContent: 'center' }} />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Text type="secondary">较上月 <Text style={{ color: '#52c41a' }}>↑2.3%</Text></Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="投诉热点分类" size="small">
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>物业服务</span><span>35%</span>
                </div>
                <Progress percent={35} size="small" status="active" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>收费纠纷</span><span>25%</span>
                </div>
                <Progress percent={25} size="small" status="active" strokeColor="#faad14" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>设施维修</span><span>20%</span>
                </div>
                <Progress percent={20} size="small" status="active" strokeColor="#f5222d" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>环境卫生</span><span>20%</span>
                </div>
                <Progress percent={20} size="small" status="active" strokeColor="#722ed1" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="待办事项" size="small">
            <List
              size="small"
              dataSource={[
                '审核3家物业企业资质变更',
                '处理2条街道上报突发事件',
                '审阅5份物业服务合同备案',
                '组织行业培训考核工作',
              ]}
              renderItem={(item) => <List.Item><Text style={{ fontSize: 13 }}>• {item}</Text></List.Item>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="政策动态" size="small">
            <List
              size="small"
              dataSource={[
                '《物业管理条例》修订征求意见',
                '关于开展物业服务质量提升行动的通知',
                '2026年度物业企业信用评价工作启动',
              ]}
              renderItem={(item) => <List.Item><Text style={{ fontSize: 13 }}>• {item}</Text></List.Item>}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GovernmentDashboard;
