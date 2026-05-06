import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select,
  Space, Typography, message, Tabs, Progress, Statistic, Row, Col,
} from 'antd';
import {
  MessageOutlined, CheckCircleOutlined, ClockCircleOutlined,
  PlusOutlined, EditOutlined, BarChartOutlined,
} from '@ant-design/icons';
import {
  getOpinionPolls, createOpinionPoll,
  getOwnerQuestions, replyOwnerQuestion,
  getSatisfactionSurveys, createSatisfactionSurvey,
  OpinionPoll, OwnerQuestion, SatisfactionSurvey,
} from '../../services/committeeService';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Communication: React.FC = () => {
  // 意见征集
  const [polls, setPolls] = useState<OpinionPoll[]>([]);
  const [pollLoading, setPollLoading] = useState(false);
  const [pollVisible, setPollVisible] = useState(false);
  const [pollForm] = Form.useForm();

  // 业主提问
  const [questions, setQuestions] = useState<OwnerQuestion[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [replyVisible, setReplyVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<OwnerQuestion | null>(null);
  const [replyForm] = Form.useForm();

  // 满意度调查
  const [surveys, setSurveys] = useState<SatisfactionSurvey[]>([]);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyVisible, setSurveyVisible] = useState(false);
  const [surveyForm] = Form.useForm();

  const fetchPolls = async () => {
    setPollLoading(true);
    try {
      const data = await getOpinionPolls();
      setPolls(data);
    } finally {
      setPollLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setQuestionLoading(true);
    try {
      const data = await getOwnerQuestions();
      setQuestions(data);
    } finally {
      setQuestionLoading(false);
    }
  };

  const fetchSurveys = async () => {
    setSurveyLoading(true);
    try {
      const data = await getSatisfactionSurveys();
      setSurveys(data);
    } finally {
      setSurveyLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
    fetchQuestions();
    fetchSurveys();
  }, []);

  const handleCreatePoll = async () => {
    try {
      const values = await pollForm.validateFields();
      const options = values.options.split('\n').filter((s: string) => s.trim());
      await createOpinionPoll({ ...values, options });
      message.success('意见征集创建成功');
      setPollVisible(false);
      pollForm.resetFields();
      fetchPolls();
    } catch (err) {
      // validation failed
    }
  };

  const handleReply = (record: OwnerQuestion) => {
    setCurrentQuestion(record);
    setReplyVisible(true);
    replyForm.resetFields();
  };

  const handleReplySubmit = async () => {
    if (!currentQuestion) return;
    try {
      const values = await replyForm.validateFields();
      await replyOwnerQuestion(currentQuestion.id, values.reply, '当前用户');
      message.success('回复成功');
      setReplyVisible(false);
      fetchQuestions();
    } catch (err) {
      // validation failed
    }
  };

  const handleCreateSurvey = async () => {
    try {
      const values = await surveyForm.validateFields();
      const questions = values.questions.split('\n').filter((s: string) => s.trim()).map((q: string, i: number) => ({
        id: `q${i + 1}`,
        content: q,
        type: 'rating' as const,
      }));
      await createSatisfactionSurvey({ title: values.title, questions });
      message.success('满意度调查创建成功');
      setSurveyVisible(false);
      surveyForm.resetFields();
      fetchSurveys();
    } catch (err) {
      // validation failed
    }
  };

  const pollColumns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 120 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (val: string) => val === 'active'
        ? <Tag color="processing">进行中</Tag>
        : <Tag color="default">已结束</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: OpinionPoll) => (
        <Button type="link" size="small" icon={<BarChartOutlined />} onClick={() => {
          Modal.info({
            title: `"${record.title}" 投票结果`,
            width: 500,
            content: (
              <div style={{ marginTop: 16 }}>
                {record.options.map((opt, idx) => {
                  const result = record.results.find(r => r.option === opt);
                  const total = record.results.reduce((s, r) => s + r.count, 0);
                  const percent = total > 0 ? Math.round(((result?.count || 0) / total) * 100) : 0;
                  return (
                    <div key={idx} style={{ marginBottom: 12 }}>
                      <Text>{opt}</Text>
                      <Progress percent={percent} size="small" />
                      <Text type="secondary">{result?.count || 0} 票</Text>
                    </div>
                  );
                })}
              </div>
            ),
          });
        }}>查看结果</Button>
      ),
    },
  ];

  const questionColumns = [
    { title: '业主', dataIndex: 'ownerName', key: 'ownerName', width: 80 },
    { title: '房屋地址', dataIndex: 'houseAddress', key: 'houseAddress', width: 140 },
    { title: '提问内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '提问时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (val: string) => val === 'pending'
        ? <Tag icon={<ClockCircleOutlined />} color="processing">待回复</Tag>
        : <Tag icon={<CheckCircleOutlined />} color="success">已回复</Tag>,
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: OwnerQuestion) => (
        record.status === 'pending'
          ? <Button type="link" size="small" icon={<MessageOutlined />} onClick={() => handleReply(record)}>回复</Button>
          : <Button type="link" size="small" onClick={() => {
            Modal.info({
              title: '提问详情',
              content: (
                <div style={{ marginTop: 16 }}>
                  <p><Text strong>提问：</Text>{record.content}</p>
                  <p><Text strong>回复：</Text>{record.reply}</p>
                  <p><Text type="secondary">回复人：{record.repliedBy} | 回复时间：{record.repliedAt}</Text></p>
                </div>
              ),
            });
          }}>查看</Button>
      ),
    },
  ];

  const surveyColumns = [
    { title: '调查标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '题目数', key: 'questionCount', width: 80,
      render: (_: unknown, record: SatisfactionSurvey) => record.questions.length,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (val: string) => {
        const map: Record<string, { color: string; label: string }> = {
          draft: { color: 'default', label: '草稿' },
          active: { color: 'processing', label: '进行中' },
          ended: { color: 'default', label: '已结束' },
        };
        return <Tag color={map[val]?.color}>{map[val]?.label}</Tag>;
      },
    },
    { title: '参与人数', dataIndex: 'responses', key: 'responses', width: 90 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: SatisfactionSurvey) => (
        <Button type="link" size="small" icon={<BarChartOutlined />} onClick={() => {
          Modal.info({
            title: `"${record.title}" 调查详情`,
            width: 500,
            content: (
              <div style={{ marginTop: 16 }}>
                <p>参与人数：{record.responses}</p>
                {record.questions.map((q, idx) => (
                  <div key={q.id} style={{ marginBottom: 8 }}>
                    <Text>{idx + 1}. {q.content}</Text>
                    <Tag style={{ marginLeft: 8 }}>{q.type === 'rating' ? '评分' : q.type === 'choice' ? '选择' : '文本'}</Tag>
                  </div>
                ))}
              </div>
            ),
          });
        }}>查看</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>业主沟通</Title>

      <Tabs defaultActiveKey="questions">
        <TabPane tab="业主提问" key="questions">
          <Card>
            <Table
              dataSource={questions}
              columns={questionColumns}
              rowKey="id"
              loading={questionLoading}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="意见征集" key="polls">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setPollVisible(true); pollForm.resetFields(); }}>发起征集</Button>}>
            <Table
              dataSource={polls}
              columns={pollColumns}
              rowKey="id"
              loading={pollLoading}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="满意度调查" key="surveys">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setSurveyVisible(true); surveyForm.resetFields(); }}>创建调查</Button>}>
            <Table
              dataSource={surveys}
              columns={surveyColumns}
              rowKey="id"
              loading={surveyLoading}
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 回复 Modal */}
      <Modal
        title="回复业主提问"
        open={replyVisible}
        onCancel={() => setReplyVisible(false)}
        onOk={handleReplySubmit}
        okText="回复"
      >
        {currentQuestion && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <p><Text strong>业主：</Text>{currentQuestion.ownerName}</p>
            <p><Text strong>提问：</Text>{currentQuestion.content}</p>
          </div>
        )}
        <Form form={replyForm} layout="vertical">
          <Form.Item name="reply" label="回复内容" rules={[{ required: true, message: '请输入回复内容' }]}>
            <TextArea rows={4} placeholder="请输入回复内容..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 发起意见征集 Modal */}
      <Modal
        title="发起意见征集"
        open={pollVisible}
        onCancel={() => { setPollVisible(false); pollForm.resetFields(); }}
        onOk={handleCreatePoll}
        okText="发起"
        width={600}
      >
        <Form form={pollForm} layout="vertical">
          <Form.Item name="title" label="征集标题" rules={[{ required: true, message: '请输入征集标题' }]}>
            <Input placeholder="请输入征集标题" />
          </Form.Item>
          <Form.Item name="description" label="征集说明">
            <TextArea rows={3} placeholder="请输入征集说明..." />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true, message: '请选择截止日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="options" label="选项（每行一个）" rules={[{ required: true, message: '请输入至少两个选项' }]}>
            <TextArea rows={4} placeholder="选项1&#10;选项2&#10;选项3" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建满意度调查 Modal */}
      <Modal
        title="创建满意度调查"
        open={surveyVisible}
        onCancel={() => { setSurveyVisible(false); surveyForm.resetFields(); }}
        onOk={handleCreateSurvey}
        okText="创建"
        width={600}
      >
        <Form form={surveyForm} layout="vertical">
          <Form.Item name="title" label="调查标题" rules={[{ required: true, message: '请输入调查标题' }]}>
            <Input placeholder="如：2026年第二季度业主满意度调查" />
          </Form.Item>
          <Form.Item name="questions" label="调查题目（每行一个）" rules={[{ required: true, message: '请输入至少一道题目' }]}>
            <TextArea rows={6} placeholder="您对物业保洁服务是否满意？&#10;您对物业安保服务是否满意？&#10;您对物业维修服务是否满意？" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Communication;
