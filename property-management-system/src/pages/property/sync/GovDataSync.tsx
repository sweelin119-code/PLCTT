import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Tag, message, Row, Col, Select, Space, Modal, Alert, Statistic,
} from 'antd';
import {
  SyncOutlined, CloudSyncOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, HomeOutlined, ApartmentOutlined, TeamOutlined, CarOutlined,
} from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import { getSyncLogs, triggerSync, getAssetStatistics } from '../../../services/assetService';
import type { SyncLog } from '../../../services/assetService';

const GovDataSync: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['building', 'house', 'owner', 'parking']);
  const [stats, setStats] = useState<{
    buildingCount: number;
    houseCount: number;
    ownerCount: number;
    parkingCount: number;
  } | null>(null);

  const loadLogs = async () => {
    if (!currentCommunity) return;
    setLoading(true);
    try {
      const data = await getSyncLogs(currentCommunity.id);
      setLogs(data);
    } catch {
      message.error('加载同步记录失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!currentCommunity) return;
    try {
      const data = await getAssetStatistics(currentCommunity.id);
      setStats({
        buildingCount: data.buildingCount,
        houseCount: data.houseCount,
        ownerCount: data.ownerCount,
        parkingCount: data.parkingCount,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadLogs();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommunity]);

  const handleTriggerSync = async () => {
    if (!currentCommunity) return;
    setSyncing(true);
    try {
      const newLogs = await triggerSync(currentCommunity.id, selectedTypes);
      message.success(`同步完成，共处理 ${newLogs.length} 项`);
      setSyncModalVisible(false);
      loadLogs();
      loadStats();
    } catch {
      message.error('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const statusIconMap: Record<string, React.ReactNode> = {
    success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    failed: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    partial: <ClockCircleOutlined style={{ color: '#faad14' }} />,
  };
  const statusLabelMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    partial: '部分成功',
  };
  const typeLabelMap: Record<string, string> = {
    building: '楼栋',
    house: '房屋',
    owner: '业主',
    parking: '车位',
  };

  const columns = [
    {
      title: '同步时间', dataIndex: 'syncTime', key: 'syncTime', width: 170,
    },
    {
      title: '同步类型', dataIndex: 'syncTypes', key: 'syncTypes', width: 200,
      render: (types: string[]) => (
        <Space size={4}>
          {types.map(t => <Tag key={t} color="blue">{typeLabelMap[t] || t}</Tag>)}
        </Space>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => (
        <Space>
          {statusIconMap[v]}
          <span>{statusLabelMap[v] || v}</span>
        </Space>
      ),
    },
    {
      title: '同步详情', dataIndex: 'detail', key: 'detail', width: 200,
      render: (v: string) => v || '-',
    },
    {
      title: '操作人', dataIndex: 'operator', key: 'operator', width: 100,
    },
  ];

  if (!currentCommunity) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <CloudSyncOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16 }}>请先选择小区</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* 数据概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="楼栋总数"
              value={stats?.buildingCount || 0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="房屋总数"
              value={stats?.houseCount || 0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="业主总数"
              value={stats?.ownerCount || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="车位总数"
              value={stats?.parkingCount || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="政府数据同步管理"
        extra={
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => setSyncModalVisible(true)}
          >
            触发同步
          </Button>
        }
      >
        <Alert
          message="数据同步说明"
          description="通过与住建局等政府系统对接，自动同步小区基础数据（楼栋、房屋、业主、车位）。同步后的数据将自动更新到物业管理系统中，无需手动录入。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条记录` }}
          size="small"
        />
      </Card>

      {/* 触发同步弹窗 */}
      <Modal
        title="触发数据同步"
        open={syncModalVisible}
        onOk={handleTriggerSync}
        onCancel={() => setSyncModalVisible(false)}
        confirmLoading={syncing}
        okText="开始同步"
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 12 }}>请选择需要同步的数据类型：</p>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            value={selectedTypes}
            onChange={setSelectedTypes}
            options={[
              { value: 'building', label: '楼栋数据' },
              { value: 'house', label: '房屋数据' },
              { value: 'owner', label: '业主数据' },
              { value: 'parking', label: '车位数据' },
            ]}
          />
        </div>
        <Alert
          message="同步将从住建局系统拉取最新数据，并与现有数据进行合并。重复数据将自动去重。"
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default GovDataSync;
