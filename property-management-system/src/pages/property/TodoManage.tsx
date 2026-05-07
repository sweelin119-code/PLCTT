import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Button, Space,
  Typography, Badge, Select, Timeline, Tooltip, message,
} from 'antd';
import {
  ToolOutlined, MessageOutlined, HomeOutlined,
  FileProtectOutlined, SettingOutlined, CheckCircleOutlined,
  RightCircleOutlined, BellOutlined, FileTextOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getTodoStats, getTodos, markTodoCompleted,
  type TodoItem, type TodoStats,
} from '../../services/dailyService';

const { Title, Text } = Typography;

const moduleConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  repair: { color: '#FF3B30', label: '报修', icon: <ToolOutlined /> },
  complaint: { color: '#FF9500', label: '投诉', icon: <MessageOutlined /> },
  decoration: { color: '#007AFF', label: '装修', icon: <HomeOutlined /> },
  contract: { color: '#34C759', label: '合同', icon: <FileProtectOutlined /> },
  inspect: { color: '#5AC8FA', label: '巡检', icon: <SettingOutlined /> },
  resolution: { color: '#AF52DE', label: '决议', icon: <FileTextOutlined /> },
  fee: { color: '#FF6482', label: '收费', icon: <DollarOutlined /> },
};

const urgencyConfig: Record<string, { color: string; label: string }> = {
  normal: { color: 'default', label: '普通' },
  urgent: { color: 'orange', label: '紧急' },
  emergency: { color: 'red', label: '特急' },
};

const TodoManage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    pendingRepairs: number;
    pendingComplaints: number;
    pendingDecorations: number;
    pendingSuggestions: number;
    expiringContracts: number;
    todayInspectTasks: number;
  }>({
    pendingRepairs: 0, pendingComplaints: 0, pendingDecorations: 0,
    pendingSuggestions: 0, expiringContracts: 0, todayInspectTasks: 0,
  });
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, todosData] = await Promise.all([
        getTodoStats(),
        getTodos(),
      ]);
      // 转换 stats 数据
      setStats({
        pendingRepairs: statsData.pending,
        pendingComplaints: statsData.pending,
        pendingDecorations: statsData.pending,
        pendingSuggestions: statsData.pending,
        expiringContracts: statsData.overdue,
        todayInspectTasks: statsData.pending,
      });
      setTodos(todosData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkDone = async (id: string) => {
    await markTodoCompleted(id);
    message.success('已标记为已完成');
    fetchData();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const filteredTodos = moduleFilter === 'all'
    ? todos.filter(t => t.status !== 'completed')
    : todos.filter(t => t.category === moduleFilter && t.status !== 'completed');

  const columns = [
    {
      title: '来源',
      dataIndex: 'module',
      key: 'module',
      width: 70,
      render: (category: string) => {
        const cfg = moduleConfig[category] || { color: '#999', label: category, icon: null };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '待办事项',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text: string, record: TodoItem) => (
        <Space>
          <span>{text}</span>
          {record.deadline && (
            <Tooltip title={`截止日期: ${record.deadline}`}>
              <Text type="secondary" style={{ fontSize: 12, cursor: 'help' }}>ℹ️</Text>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 140,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 80,
      render: (urgency: string) => {
        const cfg = urgencyConfig[urgency] || { color: 'default', label: urgency };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Badge status={status === 'pending' ? 'error' : status === 'processing' ? 'processing' : 'success'}
          text={status === 'pending' ? '待处理' : status === 'processing' ? '处理中' : '已完成'} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: TodoItem) => (
        <Space>
          <Button type="link" size="small" icon={<RightCircleOutlined />}
            onClick={() => handleNavigate('/property/daily/todo')}>
            去处理
          </Button>
          {record.status !== 'completed' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />}
              onClick={() => handleMarkDone(record.id)}>
              标记完成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const statCards = [
    { key: 'repair', title: '待处理报修', value: stats.pendingRepairs, icon: <ToolOutlined />, color: '#FF3B30', path: '/property/repair' },
    { key: 'complaint', title: '待处理投诉', value: stats.pendingComplaints, icon: <MessageOutlined />, color: '#FF9500', path: '/property/complaint' },
    { key: 'decoration', title: '待审核装修', value: stats.pendingDecorations, icon: <HomeOutlined />, color: '#007AFF', path: '/property/decoration' },
    { key: 'inspect', title: '今日巡检任务', value: stats.todayInspectTasks, icon: <SettingOutlined />, color: '#5AC8FA', path: '/property/device/inspect-task' },
    { key: 'contract', title: '即将到期合同', value: stats.expiringContracts, icon: <FileProtectOutlined />, color: '#34C759', path: '/property/contract' },
    { key: 'suggestion', title: '待处理建议', value: stats.pendingSuggestions, icon: <MessageOutlined />, color: '#AF52DE', path: '/property/suggestion' },
  ];

  const moduleOptions = [
    { value: 'all', label: '全部' },
    ...Object.entries(moduleConfig).map(([key, cfg]) => ({
      value: key,
      label: cfg.label,
    })),
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>待办事项</Title>

      {/* 统计卡片 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {statCards.map(card => (
          <Col xs={12} sm={8} lg={4} key={card.key}>
            <Card
              hoverable
              size="small"
              onClick={() => handleNavigate(card.path)}
              style={{ cursor: 'pointer' }}
            >
              <Statistic
                title={card.title}
                value={card.value}
                prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                valueStyle={{ color: card.value > 0 ? card.color : undefined, fontSize: 24 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 待办列表 */}
      <Card
        size="small"
        title={
          <Space>
            <BellOutlined />
            <span>待办列表</span>
          </Space>
        }
        extra={
          <Select
            value={moduleFilter}
            onChange={setModuleFilter}
            options={moduleOptions}
            style={{ width: 120 }}
            size="small"
          />
        }
      >
        <Table
          dataSource={filteredTodos}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* 快捷操作 */}
      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card
            size="small"
            title="快捷操作"
            hoverable
            actions={[
              <Button type="link" key="notice" onClick={() => navigate('/property/daily/notice')}>
                发布通知公告
              </Button>,
              <Button type="link" key="repair" onClick={() => navigate('/property/repair')}>
                新建报修工单
              </Button>,
              <Button type="link" key="report" onClick={() => navigate('/property/finance/report')}>
                查看报表
              </Button>,
            ]}
          >
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <Text type="secondary">常用功能快捷入口</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={16}>
          <Card size="small" title="最近动态">
            <Timeline
              items={[
                { color: 'red', children: <><Text strong>报修</Text> - 3栋2单元水管爆裂，张师傅已到场维修</> },
                { color: 'orange', children: <><Text strong>投诉</Text> - 业主李明华投诉停车位被占用，已派保安处理</> },
                { color: 'blue', children: <><Text strong>公告</Text> - 小区绿化消杀温馨提示已发布</> },
                { color: 'green', children: <><Text strong>巡检</Text> - 配电房月度巡检任务已生成</> },
                { color: 'purple', children: <><Text strong>决议</Text> - 增设电动车充电桩决议已发布，待物业执行</> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TodoManage;
