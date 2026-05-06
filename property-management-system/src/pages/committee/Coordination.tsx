import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Space, Typography,
  message, Tabs, Row, Col, Statistic, Progress, Descriptions, Timeline, Divider,
} from 'antd';
import {
  SendOutlined, CheckCircleOutlined, ClockCircleOutlined,
  FileTextOutlined, BarChartOutlined,
} from '@ant-design/icons';
import {
  getCoordinationLetters, sendCoordinationLetter,
  getPropertyReports, reviewPropertyReport,
  getPublicRevenues, getServiceScores,
  CoordinationLetter, PropertyReport,
  PublicRevenue, ServiceScoreItem,
} from '../../services/committeeService';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Coordination: React.FC = () => {
  // 协同发函
  const [letters, setLetters] = useState<CoordinationLetter[]>([]);
  const [letterLoading, setLetterLoading] = useState(false);
  const [sendVisible, setSendVisible] = useState(false);
  const [sendForm] = Form.useForm();

  // 物业报告
  const [reports, setReports] = useState<PropertyReport[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<PropertyReport | null>(null);
  const [reviewForm] = Form.useForm();

  // 公共收益
  const [revenues, setRevenues] = useState<PublicRevenue[]>([]);

  // 服务评分
  const [scores, setScores] = useState<ServiceScoreItem[]>([]);

  const fetchLetters = async () => {
    setLetterLoading(true);
    try {
      const data = await getCoordinationLetters();
      setLetters(data);
    } finally {
      setLetterLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportLoading(true);
    try {
      const data = await getPropertyReports();
      setReports(data);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchRevenues = async () => {
    const data = await getPublicRevenues();
    setRevenues(data);
  };

  const fetchScores = async () => {
    const data = await getServiceScores();
    setScores(data);
  };

  useEffect(() => {
    fetchLetters();
    fetchReports();
    fetchRevenues();
    fetchScores();
  }, []);

  const handleSend = async () => {
    try {
      const values = await sendForm.validateFields();
      await sendCoordinationLetter(values);
      message.success('发函成功');
      setSendVisible(false);
      sendForm.resetFields();
      fetchLetters();
    } catch (err) {
      // validation failed
    }
  };

  const handleReview = (record: PropertyReport) => {
    setCurrentReport(record);
    setReviewVisible(true);
    reviewForm.resetFields();
  };

  const handleReviewSubmit = async () => {
    if (!currentReport) return;
    try {
      const values = await reviewForm.validateFields();
      await reviewPropertyReport(currentReport.id, values.comment);
      message.success('审阅完成');
      setReviewVisible(false);
      fetchReports();
    } catch (err) {
      // validation failed
    }
  };

  const letterColumns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '发送对象', dataIndex: 'to', key: 'to', width: 120 },
    { title: '发送人', dataIndex: 'createdBy', key: 'createdBy', width: 100 },
    { title: '发送时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (val: string) => val === 'replied'
        ? <Tag icon={<CheckCircleOutlined />} color="success">已回复</Tag>
        : <Tag icon={<ClockCircleOutlined />} color="processing">待回复</Tag>,
    },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: unknown, record: CoordinationLetter) => (
        <Button type="link" size="small" onClick={() => {
          Modal.info({
            title: record.title,
            width: 600,
            content: (
              <div>
                <Descriptions column={1} size="small" bordered style={{ marginTop: 16 }}>
                  <Descriptions.Item label="发送对象">{record.to}</Descriptions.Item>
                  <Descriptions.Item label="发送人">{record.createdBy}</Descriptions.Item>
                  <Descriptions.Item label="发送时间">{record.createdAt}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    {record.status === 'replied'
                      ? <Tag color="success">已回复</Tag>
                      : <Tag color="processing">待回复</Tag>}
                  </Descriptions.Item>
                </Descriptions>
                <Divider>函件内容</Divider>
                <div style={{ padding: '8px 0', whiteSpace: 'pre-wrap' }}>{record.content}</div>
                {record.reply && (
                  <>
                    <Divider>回复内容</Divider>
                    <div style={{ padding: '8px 0', whiteSpace: 'pre-wrap', color: '#52c41a' }}>{record.reply}</div>
                    <Text type="secondary">回复时间：{record.repliedAt}</Text>
                  </>
                )}
              </div>
            ),
          });
        }}>查看</Button>
      ),
    },
  ];

  const reportColumns = [
    { title: '报告标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 80,
      render: (val: string) => ({ monthly: '月报', quarterly: '季报', annual: '年报' })[val] || val,
    },
    { title: '报告周期', dataIndex: 'period', key: 'period', width: 100 },
    { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', width: 160 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (val: string) => val === 'submitted'
        ? <Tag color="processing">待审阅</Tag>
        : <Tag color="success">已审阅</Tag>,
    },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: unknown, record: PropertyReport) => (
        <Space>
          <Button type="link" size="small" icon={<FileTextOutlined />}>查看</Button>
          {record.status === 'submitted' && (
            <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => handleReview(record)}>
              审阅
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>物业协同监督</Title>

      <Tabs defaultActiveKey="letters">
        <TabPane tab="协同发函" key="letters">
          <Card
            extra={<Button type="primary" icon={<SendOutlined />} onClick={() => setSendVisible(true)}>发送函件</Button>}
          >
            <Table
              dataSource={letters}
              columns={letterColumns}
              rowKey="id"
              loading={letterLoading}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="物业报告审阅" key="reports">
          <Card>
            <Table
              dataSource={reports}
              columns={reportColumns}
              rowKey="id"
              loading={reportLoading}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="公共收益" key="revenue">
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card><Statistic title="本月公共收益总额" value={totalRevenue} prefix="¥" suffix="元" /></Card>
            </Col>
          </Row>
          <Card>
            <Table
              dataSource={revenues}
              columns={[
                { title: '收入项目', dataIndex: 'item', key: 'item' },
                { title: '金额', dataIndex: 'amount', key: 'amount', render: (val: number) => `¥${val.toLocaleString()}` },
                { title: '所属周期', dataIndex: 'period', key: 'period' },
                { title: '备注', dataIndex: 'remark', key: 'remark' },
              ]}
              rowKey="item"
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="服务评分" key="scores">
          <Row gutter={[16, 16]}>
            {scores.map((item) => (
              <Col span={12} key={item.dimension}>
                <Card>
                  <Statistic
                    title={item.dimension}
                    value={item.score}
                    suffix={`/ ${item.fullScore}`}
                    valueStyle={{ color: item.score >= 85 ? '#52c41a' : item.score >= 70 ? '#faad14' : '#ff4d4f' }}
                  />
                  <Progress
                    percent={Math.round((item.score / item.fullScore) * 100)}
                    status={item.score >= 85 ? 'success' : item.score >= 70 ? 'active' : 'exception'}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      {/* 发送函件 Modal */}
      <Modal
        title="发送函件"
        open={sendVisible}
        onCancel={() => { setSendVisible(false); sendForm.resetFields(); }}
        onOk={handleSend}
        okText="发送"
      >
        <Form form={sendForm} layout="vertical">
          <Form.Item name="title" label="函件标题" rules={[{ required: true, message: '请输入函件标题' }]}>
            <Input placeholder="请输入函件标题" />
          </Form.Item>
          <Form.Item name="to" label="发送对象" rules={[{ required: true, message: '请输入发送对象' }]}>
            <Input placeholder="如：物业公司" />
          </Form.Item>
          <Form.Item name="content" label="函件内容" rules={[{ required: true, message: '请输入函件内容' }]}>
            <TextArea rows={6} placeholder="请输入函件内容..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 审阅报告 Modal */}
      <Modal
        title="审阅物业报告"
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        onOk={handleReviewSubmit}
        okText="提交审阅"
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item name="comment" label="审阅意见" rules={[{ required: true, message: '请输入审阅意见' }]}>
            <TextArea rows={4} placeholder="请输入审阅意见..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Coordination;
