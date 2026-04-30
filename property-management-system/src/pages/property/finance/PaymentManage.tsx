import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Input, Space, Tag, message, Card, Row, Col, Statistic } from 'antd';
import { SearchOutlined, DollarOutlined } from '@ant-design/icons';
import { getPayments, createOfflinePayment, getFeeStatistics } from '../../../services/feeService';
import { PaymentRecord, PayMethod, OfflinePaymentData } from '../../../services/feeTypes';
import { useCommunity } from '../../../contexts/CommunityContext';

const PAY_METHOD_MAP: Record<PayMethod, { label: string; color: string }> = {
  wechat: { label: '微信支付', color: 'green' },
  alipay: { label: '支付宝', color: 'blue' },
  cash: { label: '现金', color: 'orange' },
  transfer: { label: '银行转账', color: 'purple' },
  bank: { label: '银行代扣', color: 'cyan' },
};

const PaymentManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [data, setData] = useState<PaymentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState({ totalReceived: 0, monthReceived: 0, paidBills: 0, totalBills: 0 });

  const [filters, setFilters] = useState<{ payMethod?: PayMethod; startDate?: string; endDate?: string; keyword?: string }>({});

  // 线下缴费弹窗
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);
  const [offlineForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getPayments({
        projectId: currentCommunity?.id || 1,
        page,
        pageSize,
        ...filters,
      });
      setData(result.list);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const s = await getFeeStatistics(currentCommunity?.id || 1);
    setStats({ totalReceived: s.totalReceived, monthReceived: s.monthReceived, paidBills: s.paidBills, totalBills: s.totalBills });
  };

  useEffect(() => {
    loadData();
    loadStats();
  }, [currentCommunity, page, pageSize, filters]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleOfflinePayment = async () => {
    const values = await offlineForm.validateFields();
    const data: OfflinePaymentData = {
      billIds: values.billIds,
      payMethod: values.payMethod,
      payAmount: values.payAmount,
      payTime: values.payTime ? values.payTime.format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString().replace('T', ' ').substring(0, 19),
      remark: values.remark,
    };
    const records = await createOfflinePayment(data);
    message.success(`登记成功，共 ${records.length} 条缴费记录`);
    setOfflineModalVisible(false);
    offlineForm.resetFields();
    loadData();
    loadStats();
  };

  const columns = [
    { title: '流水号', dataIndex: 'paymentNo', key: 'paymentNo', width: 180 },
    { title: '业主', dataIndex: 'ownerName', key: 'ownerName', width: 80 },
    { title: '房号', dataIndex: 'houseFullName', key: 'houseFullName', width: 120 },
    { title: '费用项', dataIndex: 'feeItemName', key: 'feeItemName', width: 120 },
    {
      title: '金额', dataIndex: 'payAmount', key: 'payAmount', width: 100,
      render: (v: number) => <span style={{ color: '#3f8600', fontWeight: 600 }}>¥{v.toFixed(2)}</span>,
    },
    {
      title: '支付方式', dataIndex: 'payMethod', key: 'payMethod', width: 100,
      render: (v: PayMethod) => {
        const m = PAY_METHOD_MAP[v];
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    { title: '支付时间', dataIndex: 'payTime', key: 'payTime', width: 160 },
    { title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 80, render: (v: string) => v || '业主自助' },
    {
      title: '交易号', dataIndex: 'tradeNo', key: 'tradeNo', width: 140,
      render: (v: string) => v || '-',
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small"><Statistic title="总收费金额" value={stats.totalReceived} precision={2} prefix="¥" valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="本月收费" value={stats.monthReceived} precision={2} prefix="¥" valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="已缴账单" value={stats.paidBills} suffix={`/ ${stats.totalBills}`} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="收费率" value={stats.totalBills > 0 ? ((stats.paidBills / stats.totalBills) * 100).toFixed(1) : 0} suffix="%" /></Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="支付方式"
            allowClear
            style={{ width: 120 }}
            value={filters.payMethod}
            onChange={(v) => setFilters(f => ({ ...f, payMethod: v }))}
            options={Object.entries(PAY_METHOD_MAP).map(([value, m]) => ({ value, label: m.label }))}
          />
          <DatePicker
            placeholder="开始日期"
            value={filters.startDate ? undefined : undefined}
            onChange={(_, dateStr) => setFilters(f => ({ ...f, startDate: dateStr as string }))}
          />
          <DatePicker
            placeholder="结束日期"
            onChange={(_, dateStr) => setFilters(f => ({ ...f, endDate: dateStr as string }))}
          />
          <Input
            placeholder="搜索业主/房号/流水号"
            style={{ width: 200 }}
            value={filters.keyword}
            onChange={(e) => setFilters(f => ({ ...f, keyword: e.target.value }))}
            onPressEnter={handleSearch}
            suffix={<SearchOutlined onClick={handleSearch} />}
          />
          <Button type="primary" icon={<DollarOutlined />} onClick={() => { offlineForm.resetFields(); setOfflineModalVisible(true); }}>
            线下缴费登记
          </Button>
        </Space>
      </Card>

      {/* 表格 */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
        scroll={{ x: 1100 }}
      />

      {/* 线下缴费登记弹窗 */}
      <Modal
        title="线下缴费登记"
        open={offlineModalVisible}
        onOk={handleOfflinePayment}
        onCancel={() => setOfflineModalVisible(false)}
        okText="登记缴费"
        cancelText="取消"
        width={500}
      >
        <Form form={offlineForm} layout="vertical">
          <Form.Item name="billIds" label="选择账单" rules={[{ required: true, message: '请选择账单' }]}>
            <Select mode="multiple" placeholder="搜索并选择账单" showSearch
              filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="payMethod" label="支付方式" rules={[{ required: true, message: '请选择支付方式' }]}>
            <Select options={Object.entries(PAY_METHOD_MAP).map(([value, m]) => ({ value, label: m.label }))} />
          </Form.Item>
          <Form.Item name="payAmount" label="缴费金额" rules={[{ required: true, message: '请输入缴费金额' }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="输入缴费金额" prefix="¥" />
          </Form.Item>
          <Form.Item name="payTime" label="缴费时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentManage;
