import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Modal, Descriptions, Progress, Statistic, Row, Col, Space, Empty } from 'antd';
import { EyeOutlined, TeamOutlined, CheckCircleOutlined, BarChartOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getPublishedAssemblies, type GeneralAssembly } from '../../services/committeeService';

const assemblyTypeMap: Record<string, { label: string; color: string }> = {
  annual: { label: '年度大会', color: 'blue' },
  extraordinary: { label: '临时大会', color: 'orange' },
  special_vote: { label: '专项表决', color: 'purple' },
};

const AssemblyResolution: React.FC = () => {
  const [assemblies, setAssemblies] = useState<GeneralAssembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentAssembly, setCurrentAssembly] = useState<GeneralAssembly | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPublishedAssemblies();
      setAssemblies(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showDetail = (assembly: GeneralAssembly) => {
    setCurrentAssembly(assembly);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '大会标题', dataIndex: 'title', key: 'title', ellipsis: true,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (t: string) => <Tag color={assemblyTypeMap[t]?.color}>{assemblyTypeMap[t]?.label || t}</Tag>,
    },
    { title: '投票时间', key: 'time', width: 300,
      render: (_: any, record: GeneralAssembly) => `${record.voteStartTime} ~ ${record.voteEndTime}`,
    },
    {
      title: '议题数', key: 'topics', width: 70,
      render: (_: any, record: GeneralAssembly) => record.topics.length,
    },
    {
      title: '参与率', key: 'rate', width: 120,
      render: (_: any, record: GeneralAssembly) => {
        const rate = record.result?.voterRate || 0;
        return (
          <Space>
            <Progress percent={rate} size="small" style={{ width: 80 }} />
            <span style={{ fontSize: 12, color: '#666' }}>{rate}%</span>
          </Space>
        );
      },
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: any, record: GeneralAssembly) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
          查看决议
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small" hoverable>
            <Statistic
              title="已完成决议"
              value={assemblies.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" hoverable>
            <Statistic
              title="平均参与率"
              value={assemblies.length > 0
                ? Math.round(assemblies.reduce((sum, a) => sum + (a.result?.voterRate || 0), 0) / assemblies.length * 10) / 10
                : 0
              }
              suffix="%"
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: 24, color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" hoverable>
            <Statistic
              title="待执行决议"
              value={assemblies.filter(a => a.result?.published).length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 24, color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 说明提示 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#666', padding: '4px 0' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#1677ff' }} />
          以下为业委会已发布结果的业主大会决议，供物业公司查阅和执行。仅展示已结束并发布结果的大会。
        </div>
      </Card>

      {/* 决议列表 */}
      <Card size="small">
        <Table
          dataSource={assemblies}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* 决议详情弹窗 */}
      <Modal title="业主大会决议详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {currentAssembly && (
          <div>
            {/* 基本信息 */}
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="大会标题" span={2}>{currentAssembly.title}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={assemblyTypeMap[currentAssembly.type]?.color}>{assemblyTypeMap[currentAssembly.type]?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color="success">已结束 · 结果已发布</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="投票时间" span={2}>
                {currentAssembly.voteStartTime} ~ {currentAssembly.voteEndTime}
              </Descriptions.Item>
              <Descriptions.Item label="议题数量">{currentAssembly.topics.length} 个</Descriptions.Item>
              <Descriptions.Item label="投票规则">
                {currentAssembly.topics.map(t => t.voteType === 'multiple' ? '多选' : '单选').join(' / ')}
              </Descriptions.Item>
            </Descriptions>

            {/* 投票结果统计 */}
            {currentAssembly.result ? (
              <div>
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
                    title={
                      <Space>
                        <span>{topic.title}</span>
                        <Tag color={topic.result?.passed ? 'green' : 'red'}>
                          {topic.result?.passed ? '✓ 通过' : '✗ 未通过'}
                        </Tag>
                        <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>
                          （{topic.voteType === 'multiple' ? '多选' : '单选'} · 通过阈值 {Math.round(topic.passThreshold * 100)}%）
                        </span>
                      </Space>
                    }
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

                {/* 已发布标识 */}
                <div style={{ textAlign: 'center', marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 8 }}>
                  <Tag color="green">✓ 投票结果已发布</Tag>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    此决议已由业委会正式发布，请物业公司按决议内容执行
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="暂无投票结果数据" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssemblyResolution;
