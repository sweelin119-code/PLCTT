import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress, List, Typography, Badge, Timeline } from 'antd';
import {
  DollarOutlined,
  ToolOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PropertyDashboard: React.FC = () => {
  const workOrderData = [
    { key: '1', title: '3栋2单元水管爆裂', type: '紧急维修', status: '处理中', assignee: '张师傅', time: '10分钟前' },
    { key: '2', title: '5栋1单元电梯故障', type: '设备维修', status: '待派单', assignee: '-', time: '30分钟前' },
    { key: '3', title: '8栋大堂灯管更换', type: '日常维修', status: '已完成', assignee: '李师傅', time: '1小时前' },
    { key: '4', title: '地下车库排水泵检修', type: '设备保养', status: '处理中', assignee: '王师傅', time: '2小时前' },
    { key: '5', title: '小区大门道闸故障', type: '紧急维修', status: '待处理', assignee: '-', time: '3小时前' },
  ];

  const columns = [
    { title: '工单标题', dataIndex: 'title', key: 'title', width: 200 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (type: string) => {
        const colorMap: Record<string, string> = { '紧急维修': 'red', '设备维修': 'orange', '日常维修': 'blue', '设备保养': 'green' };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '处理中': 'processing', '待派单': 'warning', '待处理': 'error', '已完成': 'success' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee', width: 80 },
    { title: '时间', dataIndex: 'time', key: 'time', width: 100 },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>物业管理工作台</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="在管户数" value={1286} prefix={<HomeOutlined />} suffix="户" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="本月物业费收缴" value={85.6} precision={1} prefix={<DollarOutlined />} suffix="%" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="待处理工单" value={12} prefix={<ToolOutlined />} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="在岗人员" value={46} prefix={<UserOutlined />} suffix="人" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="最新工单" extra={<a href="/property/workorder">查看全部</a>}>
            <Table dataSource={workOrderData} columns={columns} pagination={false} size="small" />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="今日工作动态">
            <Timeline
              items={[
                { color: 'green', children: <><Text strong>保安巡逻</Text><br /><Text type="secondary">已完成上午园区巡逻任务</Text></> },
                { color: 'blue', children: <><Text strong>保洁清洁</Text><br /><Text type="secondary">3栋大堂深度清洁完成</Text></> },
                { color: 'red', children: <><Text strong>紧急维修</Text><br /><Text type="secondary">3栋2单元水管爆裂，张师傅已到场</Text></> },
                { color: 'gray', children: <><Text strong>绿化养护</Text><br /><Text type="secondary">园区草坪修剪进行中</Text></> },
                { color: 'orange', children: <><Text strong>设备巡检</Text><br /><Text type="secondary">配电房巡检计划已生成</Text></> },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card title="收费情况" size="small">
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Progress type="circle" percent={85.6} size={80} />
              <div style={{ marginTop: 12 }}>
                <Text>已收 <Text strong>1,102</Text> 户 / 共 <Text strong>1,286</Text> 户</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">欠费 <Text style={{ color: '#cf1322' }} strong>184</Text> 户</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="设备运行状态" size="small">
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>电梯 <Badge status="success" /></span><span>24/24 正常</span>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>水泵 <Badge status="success" /></span><span>6/6 正常</span>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>配电房 <Badge status="success" /></span><span>3/3 正常</span>
              </div>
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>消防系统 <Badge status="warning" /></span><span>2/3 正常</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>监控系统 <Badge status="success" /></span><span>48/48 正常</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="待办提醒" size="small">
            <List
              size="small"
              dataSource={[
                { content: '审核装修申请（3条）', type: 'warning' },
                { content: '设备月度保养计划确认', type: 'info' },
                { content: '保安排班表提交审批', type: 'info' },
                { content: '业主投诉回访（5条）', type: 'error' },
                { content: '保洁用品库存预警', type: 'warning' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Badge status={item.type as any} />
                  <Text style={{ marginLeft: 8, fontSize: 13 }}>{item.content}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PropertyDashboard;
