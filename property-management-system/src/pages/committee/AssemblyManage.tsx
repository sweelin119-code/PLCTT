import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, Select, Space, message, Descriptions, Progress, Statistic, Row, Col, Empty } from 'antd';
import { PlusOutlined, BarChartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getAssemblies, createAssembly, publishAssemblyResult, type GeneralAssembly } from '../../services/committeeService';

const { TextArea } = Input;

const assemblyTypeMap: Record<string, { label: string; color: string }> = {
  annual: { label: '年度大会', color: 'blue' },
  extraordinary: { label: '临时大会', color: 'orange' },
  special_vote: { label: '专项表决', color: 'purple' },
};

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: 'default' },
  active: { label: '投票中', color: 'processing' },
  ended: { label: '已结束', color: 'success' },
};

const CommitteeAssemblyManage: React.FC = () => {
  const [assemblies, setAssemblies] = useState<GeneralAssembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentAssembly, setCurrentAssembly] = useState<GeneralAssembly | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAssemblies();
      setAssemblies(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const topics = values.topics ? values.topics.split('\n').filter(Boolean).map((t: string, i: number) => ({
      id: `t${Date.now()}_${i}`,
      title: t,
      description: '',
      options: ['同意', '不同意', '弃权'],
      voteType: 'single' as const,
      passThreshold: 0.5,
    })) : [];
    await createAssembly({ ...values, topics });
    message.success('业主大会已创建');
    setModalVisible(false);
    loadData();
  };

  const handlePublishResult = async (id: string) => {
    await publishAssemblyResult(id);
    message.success('投票结果已发布');
    loadData();
  };

  const showDetail = (assembly: GeneralAssembly) => {
    setCurrentAssembly(assembly);
    setDetailVisible(true);
  };

  const columns = [
    { title: '大会标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (t: string) => <Tag color={assemblyTypeMap[t]?.color}>{assemblyTypeMap[t]?.label || t}</Tag>,
    },
    { title: '投票开始', dataIndex: 'voteStartTime', key: 'voteStartTime', width: 160 },
    { title: '投票结束', dataIndex: 'voteEndTime', key: 'voteEndTime', width: 160 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label || s}</Tag>,
    },
    {
      title: '参与率', key: 'rate', width: 100,
      render: (_: any, record: GeneralAssembly) => record.result ? `${record.result.voterRate}%` : '-',
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: any, record: GeneralAssembly) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>
            {record.status === 'ended' ? '查看结果' : '查看'}
          </Button>
          {record.status === 'ended' && record.result && !record.result.published && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handlePublishResult(record.id)}>发布结果</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>发起业主大会</Button>
        </div>
        <Table dataSource={assemblies} columns={columns} rowKey="id" loading={loading} pagination={false} size="middle" />
      </Card>

      <Modal title="发起业主大会" open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="大会标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="大会类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'annual', label: '年度大会' },
              { value: 'extraordinary', label: '临时大会' },
              { value: 'special_vote', label: '专项表决' },
            ]} />
          </Form.Item>
          <Form.Item name="voteStartTime" label="投票开始时间" rules={[{ required: true }]}>
            <Input placeholder="如：2026-05-20 00:00" />
          </Form.Item>
          <Form.Item name="voteEndTime" label="投票结束时间" rules={[{ required: true }]}>
            <Input placeholder="如：2026-06-05 23:59" />
          </Form.Item>
          <Form.Item name="topics" label="议题（每行一项）" rules={[{ required: true, message: '请输入至少一个议题' }]}>
            <TextArea rows={4} placeholder="每行输入一个议题标题" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情/结果 */}
      <Modal title="业主大会详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentAssembly && (
          <div>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="标题" span={2}>{currentAssembly.title}</Descriptions.Item>
              <Descriptions.Item label="类型"><Tag color={assemblyTypeMap[currentAssembly.type]?.color}>{assemblyTypeMap[currentAssembly.type]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusMap[currentAssembly.status]?.color}>{statusMap[currentAssembly.status]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="投票时间">{currentAssembly.voteStartTime} ~ {currentAssembly.voteEndTime}</Descriptions.Item>
            </Descriptions>

            {currentAssembly.result ? (
              <div>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}><Card size="small"><Statistic title="总投票权户数" value={currentAssembly.result.totalVoters} /></Card></Col>
                  <Col span={8}><Card size="small"><Statistic title="已投票数" value={currentAssembly.result.votedCount} /></Card></Col>
                  <Col span={8}><Card size="small"><Statistic title="投票率" value={currentAssembly.result.voterRate} suffix="%" /></Card></Col>
                </Row>
                {currentAssembly.result.topics.map(topic => (
                  <Card key={topic.id} size="small" title={topic.title} style={{ marginBottom: 12 }}>
                    {topic.options.map((opt, idx) => {
                      const votes = topic.result?.optionVotes[idx] || 0;
                      const total = topic.result?.totalVotes || 1;
                      const pct = Math.round((votes / total) * 100);
                      return (
                        <div key={idx} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span>{opt}</span>
                            <span>{votes}票 ({pct}%)</span>
                          </div>
                          <Progress percent={pct} size="small" />
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 8 }}>
                      结果：<Tag color={topic.result?.passed ? 'green' : 'red'}>{topic.result?.passed ? '通过' : '未通过'}</Tag>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="投票尚未开始或暂无结果" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommitteeAssemblyManage;
