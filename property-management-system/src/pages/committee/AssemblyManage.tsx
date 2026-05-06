import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, Select, Space, message, Descriptions, Progress, Statistic, Row, Col, Empty, Tooltip, Badge } from 'antd';
import { PlusOutlined, BarChartOutlined, CheckCircleOutlined, EyeOutlined, ClockCircleOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';
import { getAssemblies, createAssembly, publishAssemblyResult, type GeneralAssembly } from '../../services/committeeService';
import TopicEditor from '../../components/TopicEditor';

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
    // values.topics 已由 TopicEditor 组件直接提供 AssemblyTopic[] 格式数据
    await createAssembly({ ...values, topics: values.topics || [] });
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

  // 计算参与率
  const getRate = (assembly: GeneralAssembly): number => {
    if (!assembly.result) return 0;
    return assembly.result.voterRate;
  };

  // 计算倒计时
  const getCountdown = (endTime: string): string => {
    const now = Date.now();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    if (diff <= 0) return '已截止';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `剩余 ${days} 天`;
    return `剩余 ${hours} 小时`;
  };

  const columns = [
    {
      title: '大会标题', dataIndex: 'title', key: 'title', ellipsis: true,
      render: (text: string, record: GeneralAssembly) => (
        <Space>
          <span style={{ fontWeight: record.status === 'active' ? 600 : 400 }}>{text}</span>
          {record.status === 'active' && <Badge status="processing" />}
        </Space>
      ),
    },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (t: string) => <Tag color={assemblyTypeMap[t]?.color}>{assemblyTypeMap[t]?.label || t}</Tag>,
    },
    {
      title: '议题数', key: 'topics', width: 70,
      render: (_: any, record: GeneralAssembly) => record.topics.length,
    },
    { title: '投票开始', dataIndex: 'voteStartTime', key: 'voteStartTime', width: 150 },
    { title: '投票结束', dataIndex: 'voteEndTime', key: 'voteEndTime', width: 150 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string, record: GeneralAssembly) => (
        <Space>
          <Tag color={statusMap[s]?.color}>{statusMap[s]?.label || s}</Tag>
          {s === 'active' && (
            <span style={{ fontSize: 12, color: '#ff4d4f' }}>
              <ClockCircleOutlined /> {getCountdown(record.voteEndTime)}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: '参与率', key: 'rate', width: 120,
      render: (_: any, record: GeneralAssembly) => {
        const rate = getRate(record);
        return record.result ? (
          <Space>
            <Progress percent={rate} size="small" style={{ width: 80 }} />
            <span style={{ fontSize: 12, color: '#666' }}>{rate}%</span>
          </Space>
        ) : record.status === 'active' ? (
          <span style={{ fontSize: 12, color: '#999' }}>投票进行中</span>
        ) : (
          <span style={{ fontSize: 12, color: '#999' }}>-</span>
        );
      },
    },
    {
      title: '操作', key: 'action', width: 220,
      render: (_: any, record: GeneralAssembly) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            {record.status === 'ended' ? '查看结果' : '查看'}
          </Button>
          {record.status === 'active' && (
            <Tooltip title="实时查看投票进度">
              <Button type="link" size="small" icon={<BarChartOutlined />} onClick={() => showDetail(record)}>
                监控进度
              </Button>
            </Tooltip>
          )}
          {record.status === 'ended' && record.result && !record.result.published && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handlePublishResult(record.id)}>
              发布结果
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="总大会数"
              value={assemblies.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="进行中"
              value={assemblies.filter(a => a.status === 'active').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 24, color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="已结束"
              value={assemblies.filter(a => a.status === 'ended').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ fontSize: 24, color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="总参与率"
              value={assemblies.length > 0
                ? Math.round(assemblies.filter(a => a.result).reduce((sum, a) => sum + (a.result?.voterRate || 0), 0) / assemblies.filter(a => a.result).length * 10) / 10
                : 0
              }
              suffix="%"
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>发起业主大会</Button>
        </div>
        <Table
          dataSource={assemblies}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* 创建大会弹窗 */}
      <Modal title="发起业主大会" open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={700}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="大会标题" rules={[{ required: true }]}>
            <Input placeholder="如：2026年第二次业主大会" />
          </Form.Item>
          <Form.Item name="type" label="大会类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'annual', label: '年度大会' },
              { value: 'extraordinary', label: '临时大会' },
              { value: 'special_vote', label: '专项表决' },
            ]} />
          </Form.Item>
          <Form.Item name="voteStartTime" label="投票开始时间" rules={[{ required: true }]}>
            <Input placeholder="如：2026-06-01 00:00" />
          </Form.Item>
          <Form.Item name="voteEndTime" label="投票结束时间" rules={[{ required: true }]}>
            <Input placeholder="如：2026-06-15 23:59" />
          </Form.Item>
          <Form.Item
            name="topics"
            label="议题设置"
            rules={[{ required: true, message: '请添加至少一个议题' }]}
            initialValue={[]}
          >
            <TopicEditor />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情/结果弹窗 */}
      <Modal title="业主大会详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {currentAssembly && (
          <div>
            {/* 基本信息 */}
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="标题" span={2}>{currentAssembly.title}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={assemblyTypeMap[currentAssembly.type]?.color}>{assemblyTypeMap[currentAssembly.type]?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[currentAssembly.status]?.color}>{statusMap[currentAssembly.status]?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="投票时间" span={2}>
                {currentAssembly.voteStartTime} ~ {currentAssembly.voteEndTime}
              </Descriptions.Item>
              <Descriptions.Item label="议题数量">{currentAssembly.topics.length} 个</Descriptions.Item>
              <Descriptions.Item label="投票规则">
                {currentAssembly.topics.map(t => t.voteType === 'multiple' ? '多选' : '单选').join(' / ')}
              </Descriptions.Item>
            </Descriptions>

            {/* 投票进度（进行中） */}
            {currentAssembly.status === 'active' && !currentAssembly.result && (
              <Card size="small" title="📊 投票进度监控" style={{ marginBottom: 16 }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Statistic
                    title="投票尚未结束，暂无最终结果"
                    value="等待业主投票..."
                    valueStyle={{ fontSize: 16, color: '#1677ff' }}
                  />
                  <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
                    投票截止后，可在此查看各议题的详细结果
                  </div>
                </div>
              </Card>
            )}

            {/* 投票结果 */}
            {currentAssembly.result ? (
              <div>
                {/* 统计概览 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Card size="small" hoverable>
                      <Statistic title="总投票权户数" value={currentAssembly.result.totalVoters} prefix={<TeamOutlined />} />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" hoverable>
                      <Statistic title="已投票数" value={currentAssembly.result.votedCount} prefix={<CheckCircleOutlined />} />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" hoverable>
                      <Statistic title="投票率" value={currentAssembly.result.voterRate} suffix="%" prefix={<BarChartOutlined />}
                        valueStyle={{ color: currentAssembly.result.voterRate >= 50 ? '#52c41a' : '#ff4d4f' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 各议题结果 */}
                {currentAssembly.result.topics.map(topic => (
                  <Card
                    key={topic.id}
                    size="small"
                    title={(
                      <Space>
                        <span>{topic.title}</span>
                        <Tag color={topic.result?.passed ? 'green' : 'red'}>
                          {topic.result?.passed ? '✓ 通过' : '✗ 未通过'}
                        </Tag>
                        <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>
                          （{topic.voteType === 'multiple' ? '多选' : '单选'} · 通过阈值 {Math.round(topic.passThreshold * 100)}%）
                        </span>
                      </Space>
                    )}
                    style={{ marginBottom: 12 }}
                  >
                    {topic.options.map((opt, idx) => {
                      const votes = topic.result?.optionVotes[idx] || 0;
                      const total = topic.result?.totalVotes || 1;
                      const pct = Math.round((votes / total) * 100);
                      return (
                        <div key={idx} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{opt}</span>
                            <span style={{ fontSize: 13, color: '#666' }}>{votes}票 ({pct}%)</span>
                          </div>
                          <Progress
                            percent={pct}
                            size="small"
                            strokeColor={topic.result?.passed ? '#52c41a' : '#1677ff'}
                            format={() => ''}
                          />
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                      总投票数：{topic.result?.totalVotes || 0} 票
                    </div>
                  </Card>
                ))}

                {/* 发布结果按钮 */}
                {currentAssembly.result && !currentAssembly.result.published && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handlePublishResult(currentAssembly.id)}
                    >
                      发布投票结果公告
                    </Button>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                      发布后，业主端将可查看最终投票结果
                    </div>
                  </div>
                )}

                {currentAssembly.result?.published && (
                  <div style={{ textAlign: 'center', marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 8 }}>
                    <Tag color="green">✓ 投票结果已发布</Tag>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>业主端已可查看最终结果</div>
                  </div>
                )}
              </div>
            ) : currentAssembly.status === 'pending' ? (
              <Empty description="投票尚未开始" />
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommitteeAssemblyManage;
