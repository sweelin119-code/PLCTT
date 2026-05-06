import React, { useState, useCallback, useEffect } from 'react';
import { Table, Tag, Button, Input, Select, Modal, Form, Row, Col, Space, message, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getParkingEntryRecords,
  processParkingExit,
  type ParkingEntryRecord,
  type ParkingEntryQueryParams,
} from '../../../services/parkingFeeService';

interface Props {
  projectId: number;
  onStatsChange: () => void;
}

const EntryManage: React.FC<Props> = ({ projectId, onStatsChange }) => {
  const [data, setData] = useState<ParkingEntryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [exitRecord, setExitRecord] = useState<ParkingEntryRecord | null>(null);
  const [exitForm] = Form.useForm();
  const [exitLoading, setExitLoading] = useState(false);

  const loadData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params: ParkingEntryQueryParams = { projectId, page: p, pageSize: 10 };
      if (keyword) params.keyword = keyword;
      if (status) params.status = status as any;
      const result = await getParkingEntryRecords(params);
      setData(result.list);
      setTotal(result.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [projectId, keyword, status]);

  useEffect(() => { loadData(1); }, [loadData]);

  const handleExit = async () => {
    try {
      const values = await exitForm.validateFields();
      if (!exitRecord) return;
      setExitLoading(true);
      await processParkingExit(exitRecord.id, values.payMethod, values.actualFee, values.operator);
      message.success('出场收费成功');
      setExitModalVisible(false);
      loadData(page);
      onStatsChange();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '操作失败');
    } finally {
      setExitLoading(false);
    }
  };

  const getStatusBadge = (status: ParkingEntryRecord['status']) => {
    switch (status) {
      case 'parked': return <Badge status="processing" text="在场" />;
      case 'exited': return <Badge status="default" text="已出场" />;
      case 'free': return <Badge status="success" text="免费出场" />;
    }
  };

  const getPayMethodText = (method?: string) => {
    switch (method) {
      case 'wechat': return <Tag color="#07C160">微信</Tag>;
      case 'alipay': return <Tag color="#1677FF">支付宝</Tag>;
      case 'cash': return <Tag color="#faad14">现金</Tag>;
      case 'monthly': return <Tag color="#722ed1">月租</Tag>;
      case 'free': return <Tag color="#52c41a">免费</Tag>;
      default: return '-';
    }
  };

  const columns: ColumnsType<ParkingEntryRecord> = [
    { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120, render: (text) => <strong>{text}</strong> },
    { title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 90, render: (t) => t === 'car' ? '小型车' : t === 'motorcycle' ? '摩托车' : '大型车' },
    { title: '入场时间', dataIndex: 'entryTime', key: 'entryTime', width: 160 },
    { title: '入口', dataIndex: 'entrance', key: 'entrance', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (_, r) => getStatusBadge(r.status) },
    { title: '停留时长', dataIndex: 'duration', key: 'duration', width: 120, render: (d, r) => r.status === 'parked' ? <span style={{ color: '#faad14' }}>计算中...</span> : d },
    { title: '应收', dataIndex: 'fee', key: 'fee', width: 80, render: (fee) => fee > 0 ? `¥${fee}` : '-' },
    { title: '实收', dataIndex: 'actualFee', key: 'actualFee', width: 80, render: (fee, r) => fee > 0 ? `¥${fee}` : '-' },
    { title: '支付方式', dataIndex: 'payMethod', key: 'payMethod', width: 90, render: (m) => getPayMethodText(m) },
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 80 },
    {
      title: '操作', key: 'action', width: 100, fixed: 'right' as const,
      render: (_, record) => (
        record.status === 'parked' ? (
          <Button type="primary" size="small" onClick={() => {
            setExitRecord(record);
            exitForm.setFieldsValue({
              plateNo: record.plateNo,
              entryTime: record.entryTime,
              fee: record.fee,
              actualFee: record.fee,
              payMethod: 'wechat',
              operator: '当前操作员',
            });
            setExitModalVisible(true);
          }}>
            出场收费
          </Button>
        ) : (
          <Tag color="#999">已处理</Tag>
        )
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索车牌号"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={() => loadData(1)}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="车辆状态"
            value={status || undefined}
            onChange={v => setStatus(v || '')}
            allowClear
            options={[
              { value: 'parked', label: '在场' },
              { value: 'exited', label: '已出场' },
              { value: 'free', label: '免费出场' },
            ]}
          />
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => loadData(1)}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); setStatus(''); loadData(1); }}>重置</Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: loadData,
          showTotal: (t) => `共 ${t} 条记录`,
        }}
      />
      <Modal
        title="出场收费"
        open={exitModalVisible}
        onCancel={() => setExitModalVisible(false)}
        onOk={handleExit}
        confirmLoading={exitLoading}
        okText="确认收费"
        cancelText="取消"
      >
        <Form form={exitForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="plateNo" label="车牌号">
            <Input disabled />
          </Form.Item>
          <Form.Item name="entryTime" label="入场时间">
            <Input disabled />
          </Form.Item>
          <Form.Item name="fee" label="应收金额（元）">
            <Input disabled prefix="¥" />
          </Form.Item>
          <Form.Item name="actualFee" label="实收金额（元）" rules={[{ required: true, message: '请输入实收金额' }]}>
            <Input type="number" min={0} prefix="¥" />
          </Form.Item>
          <Form.Item name="payMethod" label="支付方式" rules={[{ required: true, message: '请选择支付方式' }]}>
            <Select
              options={[
                { value: 'wechat', label: '微信支付' },
                { value: 'alipay', label: '支付宝' },
                { value: 'cash', label: '现金' },
                { value: 'free', label: '免费' },
              ]}
            />
          </Form.Item>
          <Form.Item name="operator" label="操作人" rules={[{ required: true, message: '请输入操作人' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EntryManage;
