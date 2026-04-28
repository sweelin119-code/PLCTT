import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress, List, Typography, Tabs } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  StarOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const MerchantDashboard: React.FC = () => {
  const orderData = [
    { key: '1', id: 'ORD20260427001', product: '新鲜水果礼盒', amount: 88, status: '待配送', customer: '张先生', time: '10:25' },
    { key: '2', id: 'ORD20260427002', product: '家政保洁服务', amount: 199, status: '已完成', customer: '李女士', time: '09:50' },
    { key: '3', id: 'ORD20260427003', product: '社区团购套餐', amount: 66, status: '配送中', customer: '王先生', time: '09:30' },
    { key: '4', id: 'ORD20260427004', product: '维修上门服务', amount: 150, status: '待接单', customer: '赵女士', time: '09:15' },
    { key: '5', id: 'ORD20260427005', product: '饮用水配送', amount: 36, status: '已完成', customer: '刘先生', time: '08:50' },
  ];

  const columns = [
    { title: '订单号', dataIndex: 'id', key: 'id', width: 160 },
    { title: '商品/服务', dataIndex: 'product', key: 'product' },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 80, render: (v: number) => `¥${v}` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '待配送': 'processing', '已完成': 'success', '配送中': 'warning', '待接单': 'error' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    { title: '客户', dataIndex: 'customer', key: 'customer', width: 80 },
    { title: '时间', dataIndex: 'time', key: 'time', width: 80 },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>商家工作台</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="今日订单" value={36} prefix={<ShoppingCartOutlined />} suffix={<span style={{ fontSize: 14, color: '#52c41a' }}><ArrowUpOutlined /> 15%</span>} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="今日收入" value={2860} precision={2} prefix={<DollarOutlined />} suffix="元" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="本月新增客户" value={58} prefix={<UserOutlined />} suffix={<span style={{ fontSize: 14, color: '#52c41a' }}><ArrowUpOutlined /> 8%</span>} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="商品评分" value={4.8} prefix={<StarOutlined />} suffix="/5.0" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="最新订单" extra={<a href="/merchant/order">查看全部</a>}>
            <Table dataSource={orderData} columns={columns} pagination={false} size="small" />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="经营概览">
            <Tabs
              items={[
                { key: 'week', label: '本周', children: (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">总订单量</Text>
                      <div><Text strong style={{ fontSize: 24 }}>256</Text> <Text type="secondary">单</Text></div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">总收入</Text>
                      <div><Text strong style={{ fontSize: 24, color: '#3f8600' }}>¥18,920</Text></div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">客单价</Text>
                      <div><Text strong style={{ fontSize: 24 }}>¥73.9</Text></div>
                    </div>
                    <Progress percent={68} size="small" />
                    <div style={{ marginTop: 8 }}><Text type="secondary">目标完成率 68%</Text></div>
                  </div>
                )},
                { key: 'month', label: '本月', children: (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">总订单量</Text>
                      <div><Text strong style={{ fontSize: 24 }}>1,028</Text> <Text type="secondary">单</Text></div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">总收入</Text>
                      <div><Text strong style={{ fontSize: 24, color: '#3f8600' }}>¥76,580</Text></div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">客单价</Text>
                      <div><Text strong style={{ fontSize: 24 }}>¥74.5</Text></div>
                    </div>
                    <Progress percent={76} size="small" status="active" />
                    <div style={{ marginTop: 8 }}><Text type="secondary">目标完成率 76%</Text></div>
                  </div>
                )},
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card title="商品销售排行" size="small">
            <List
              size="small"
              dataSource={[
                { name: '社区团购套餐A', sales: 128, amount: '¥8,448' },
                { name: '家政保洁服务', sales: 86, amount: '¥17,114' },
                { name: '新鲜水果礼盒', sales: 65, amount: '¥5,720' },
                { name: '饮用水配送', sales: 52, amount: '¥1,872' },
                { name: '维修上门服务', sales: 38, amount: '¥5,700' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.name} description={`销量: ${item.sales} 单`} />
                  <div><Text strong>{item.amount}</Text></div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="待处理事项" size="small">
            <List
              size="small"
              dataSource={[
                { content: '5笔新订单待确认', type: 'error' },
                { content: '3条客户差评待回复', type: 'warning' },
                { content: '商品库存不足预警（2件）', type: 'warning' },
                { content: '提现申请审核中', type: 'info' },
                { content: '新优惠券活动待发布', type: 'info' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Tag color={item.type === 'error' ? 'red' : item.type === 'warning' ? 'orange' : 'blue'} style={{ fontSize: 12 }}>{item.content}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="营销活动效果" size="small">
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>满减活动</span><span>带来 86 单</span>
              </div>
              <Progress percent={86} size="small" strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>优惠券发放</span><span>核销率 62%</span>
              </div>
              <Progress percent={62} size="small" strokeColor="#1890ff" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>拼团活动</span><span>成团率 78%</span>
              </div>
              <Progress percent={78} size="small" strokeColor="#722ed1" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MerchantDashboard;
