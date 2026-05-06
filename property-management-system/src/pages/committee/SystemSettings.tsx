import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select,
  Space, Typography, message, Tabs, Descriptions, Row, Col,
  Statistic, DatePicker,
} from 'antd';
import {
  HistoryOutlined, UserOutlined, KeyOutlined,
  SafetyOutlined, FileTextOutlined,
} from '@ant-design/icons';
import {
  getOperationLogs, getCommitteeMembers,
  OperationLog, CommitteeMember,
} from '../../services/committeeService';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SystemSettings: React.FC = () => {
  // 操作日志
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  // 成员信息（用于展示）
  const [members, setMembers] = useState<CommitteeMember[]>([]);

  const fetchLogs = async () => {
    setLogLoading(true);
    try {
      const data = await getOperationLogs();
      setLogs(data);
    } finally {
      setLogLoading(false);
    }
  };

  const fetchMembers = async () => {
    const data = await getCommitteeMembers();
    setMembers(data);
  };

  useEffect(() => {
    fetchLogs();
    fetchMembers();
  }, []);

  const logColumns = [
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 80 },
    { title: '所属模块', dataIndex: 'module', key: 'module', width: 110 },
    { title: '操作详情', dataIndex: 'detail', key: 'detail', ellipsis: true },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 130 },
    { title: '操作时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  ];

  const activeMembers = members.filter(m => m.status === 'active');

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>系统管理</Title>

      <Tabs defaultActiveKey="logs">
        <TabPane tab={<span><HistoryOutlined />操作日志</span>} key="logs">
          <Card>
            <Table
              dataSource={logs}
              columns={logColumns}
              rowKey="id"
              loading={logLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><UserOutlined />成员信息</span>} key="members">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic title="业委会成员" value={activeMembers.length} suffix="人" />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="主任"
                  value={activeMembers.filter(m => m.position === 'director').length}
                  suffix="人"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="副主任"
                  value={activeMembers.filter(m => m.position === 'vice_director').length}
                  suffix="人"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均出勤率"
                  value={activeMembers.length > 0
                    ? Math.round(activeMembers.reduce((s, m) => s + m.attendance, 0) / activeMembers.length)
                    : 0}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>
          <Card style={{ marginTop: 16 }}>
            {activeMembers.map(member => (
              <Card
                key={member.id}
                size="small"
                style={{ marginBottom: 8 }}
                type="inner"
                title={`${member.name} - ${({
                  director: '主任', vice_director: '副主任', member: '委员', alternate: '候补委员',
                })[member.position] || member.position}`}
              >
                <Descriptions column={4} size="small">
                  <Descriptions.Item label="楼栋">{member.building}</Descriptions.Item>
                  <Descriptions.Item label="单元">{member.unit}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{member.phone}</Descriptions.Item>
                  <Descriptions.Item label="出勤率">{member.attendance}%</Descriptions.Item>
                  <Descriptions.Item label="任期开始">{member.termStart}</Descriptions.Item>
                  <Descriptions.Item label="任期结束">{member.termEnd}</Descriptions.Item>
                </Descriptions>
              </Card>
            ))}
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyOutlined />安全设置</span>} key="security">
          <Card title="密码策略" style={{ marginBottom: 16 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="密码最小长度">8 位</Descriptions.Item>
              <Descriptions.Item label="密码复杂度">必须包含字母和数字</Descriptions.Item>
              <Descriptions.Item label="登录失败锁定">连续 5 次失败锁定 30 分钟</Descriptions.Item>
              <Descriptions.Item label="会话超时">30 分钟无操作自动退出</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="操作审计">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="操作日志保留">永久保留</Descriptions.Item>
              <Descriptions.Item label="敏感操作记录">所有审核、发布、删除操作均记录</Descriptions.Item>
              <Descriptions.Item label="数据导出审批">敏感数据导出需管理员审批</Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        <TabPane tab={<span><FileTextOutlined />关于系统</span>} key="about">
          <Card>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="系统名称">物业全生命周期管理系统 - 业委会端</Descriptions.Item>
              <Descriptions.Item label="当前版本">v1.0.0</Descriptions.Item>
              <Descriptions.Item label="系统架构">React 19 + Ant Design 6 + TypeScript</Descriptions.Item>
              <Descriptions.Item label="数据模式">当前使用 Mock 数据，后续对接真实后端</Descriptions.Item>
              <Descriptions.Item label="业委会任期">2024-01-01 至 2029-01-01</Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
