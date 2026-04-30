import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, Input, DatePicker, Space, Tag, message, Statistic, Row, Col, Card, Popconfirm, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined, StopOutlined, EditOutlined } from '@ant-design/icons';
import { getBills, getBillById, generateBills, adjustBill, cancelBill, getFeeItems, getFeeStatistics } from '../../../services/feeService';
import { Bill, BillStatus, BillGenerateParams, BillAdjustData } from '../../../services/feeTypes';
import { useCommunity } from '../../../contexts/CommunityContext';

const STATUS_MAP: Record<BillStatus, { label: string; color: string }> = {
  pending: { label: '待缴', color: 'orange' },
  paid: { label: '已缴', color: 'green' },
  overdue: { label: '逾期', color: 'red' },
  cancelled: { label: '已取消', color: 'default' },
  partially_paid: { label: '部分缴费', color: 'blue' },
};

const BillManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [data, setData] = useState<Bill[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [feeItems, setFeeItems] = useState<{ value: number; label: string }[]>([]);
  const [stats, setStats] = useState({ totalReceivable: 0, totalReceived: 0, totalArrears: 0, collectionRate: 0 });

  // 筛选条件
  const [filters, setFilters] = useState<{ periodYear?: number; periodMonth?: number; status?: BillStatus; feeItemId?: number; keyword?: string }>({});

  // 生成账单弹窗
  const [genModalVisible, setGenModalVisible] = useState(false);
  const [genForm] = Form.useForm();

  // 调整账单弹窗
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustForm] = Form.useForm();
  const [adjustingBill, setAdjustingBill] = useState<Bill | null>(null);

  // 账单详情弹窗
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailBill, setDetailBill] = useState<Bill | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getBills({
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
    setStats(s);
  };

  const loadFeeItems = async () => {
    const items = await getFeeItems(currentCommunity?.id || 1);
    setFeeItems(items.map(f => ({ value: f.id, label: f.name })));
  };

  useEffect(() => {
    loadData();
    loadStats();
    loadFeeItems();
  }, [currentCommunity, page, pageSize, filters]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleGenerate = async () => {
    const values = await genForm.validateFields();
    const params: BillGenerateParams = {
      projectId: currentCommunity?.id || 1,
      feeItemIds: values.feeItemIds,
      periodYear: values.periodYear?.year() || new Date().getFullYear(),
      periodMonth: (values.periodMonth?.month() ?? -1) + 1 || new Date().getMonth() + 1,
      buildingIds: values.buildingIds,
    };
    const newBills = await generateBills(params);
    message.success(`成功生成 ${newBills.length} 条账单`);
    setGenModalVisible(false);
    genForm.resetFields();
    loadData();
    loadStats();
  };

  const handleAdjust = async () => {
    const values = await adjustForm.validateFields();
    if (!adjustingBill) return;
    const data: BillAdjustData = {
      id: adjustingBill.id,
      adjustType: values.adjustType,
      amount: values.amount || 0,
      reason: values.reason,
    };
    await adjustBill(data);
    message.success('账单已调整');
    setAdjustModalVisible(false);
    adjustForm.resetFields();
    loadData();
    loadStats();
  };

  const handleCancel = async (id: number) => {
    await cancelBill(id);
    message.success('账单已取消');
    loadData();
    loadStats();
  };

  const showDetail = async (id: number) => {
    const bill = await getBillById(id);
    setDetailBill(bill);
    setDetailVisible(true);
  };

  const columns = [
    { title: '账单号', dataIndex: 'billNo', key: 'billNo', width: 180 },
    { title: '业主', dataIndex: 'ownerName', key: 'ownerName', width: 80 },
    { title: '房号', dataIndex: 'houseFullName', key: 'houseFullName', width: 120 },
    { title: '费用项', dataIndex: 'feeItemName', key: 'feeItemName', width: 120 },
    {
      title: '账期', key: 'period', width: 100,
      render: (_: any, record: Bill) => `${record.periodYear}年${record.periodMonth}月`,
    },
    {
      title: '金额', dataIndex: 'amount', key: 'amount', width: 100,
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '已缴', dataIndex: 'paidAmount', key: 'paidAmount', width: 100,
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '滞纳金', dataIndex: 'lateFee', key: 'lateFee', width: 80,
      render: (v: number) => v > 0 ? `¥${v.toFixed(2)}` : '-',
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (v: BillStatus) => {
        const s = STATUS_MAP[v];
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: any, record: Bill) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record.id)}>详情</Button>
          {record.status === 'pending' || record.status === 'overdue' ? (
            <>
              <Button type="link" size="small" icon={<EditOutlined />}
                onClick={() => { setAdjustingBill(record); adjustForm.resetFields(); setAdjustModalVisible(true); }}>
                调整
              </Button>
              <Popconfirm title="确定取消该账单？" onConfirm={() => handleCancel(record.id)}>
                <Button type="link" size="small" danger icon={<StopOutlined />}>取消</Button>
              </Popconfirm>
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small"><Statistic title="总应收" value={stats.totalReceivable} precision={2} prefix="¥" /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="总已收" value={stats.totalReceived} precision={2} prefix="¥" valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="总欠费" value={stats.totalArrears} precision={2} prefix="¥" valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="收费率" value={stats.collectionRate} suffix="%" precision={1} /></Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="选择年份"
            allowClear
            style={{ width: 120 }}
            value={filters.periodYear}
            onChange={(v) => setFilters(f => ({ ...f, periodYear: v }))}
            options={Array.from({ length: 5 }, (_, i) => ({ value: new Date().getFullYear() - 2 + i, label: `${new Date().getFullYear() - 2 + i}年` }))}
          />
          <Select
            placeholder="选择月份"
            allowClear
            style={{ width: 100 }}
            value={filters.periodMonth}
            onChange={(v) => setFilters(f => ({ ...f, periodMonth: v }))}
            options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }))}
          />
          <Select
            placeholder="费用项"
            allowClear
            style={{ width: 140 }}
            value={filters.feeItemId}
            onChange={(v) => setFilters(f => ({ ...f, feeItemId: v }))}
            options={feeItems}
          />
          <Select
            placeholder="账单状态"
            allowClear
            style={{ width: 100 }}
            value={filters.status}
            onChange={(v) => setFilters(f => ({ ...f, status: v }))}
            options={Object.entries(STATUS_MAP).map(([value, s]) => ({ value, label: s.label }))}
          />
          <Input
            placeholder="搜索业主/房号/账单号"
            style={{ width: 200 }}
            value={filters.keyword}
            onChange={(e) => setFilters(f => ({ ...f, keyword: e.target.value }))}
            onPressEnter={handleSearch}
            suffix={<SearchOutlined onClick={handleSearch} />}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { genForm.resetFields(); setGenModalVisible(true); }}>
            生成账单
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
        scroll={{ x: 1200 }}
      />

      {/* 生成账单弹窗 */}
      <Modal
        title="生成账单"
        open={genModalVisible}
        onOk={handleGenerate}
        onCancel={() => setGenModalVisible(false)}
        okText="生成"
        cancelText="取消"
      >
        <Form form={genForm} layout="vertical">
          <Form.Item name="feeItemIds" label="费用项" rules={[{ required: true, message: '请选择费用项' }]}>
            <Select mode="multiple" options={feeItems} placeholder="选择费用项" />
          </Form.Item>
          <Form.Item name="periodYear" label="账期年份" rules={[{ required: true }]}>
            <DatePicker picker="year" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="periodMonth" label="账期月份" rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="buildingIds" label="指定楼栋（可选，不选则全部）">
            <Select mode="multiple" placeholder="选择楼栋（不选则全部房屋）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 调整账单弹窗 */}
      <Modal
        title="调整账单"
        open={adjustModalVisible}
        onOk={handleAdjust}
        onCancel={() => setAdjustModalVisible(false)}
        okText="确认调整"
        cancelText="取消"
      >
        <Form form={adjustForm} layout="vertical">
          <Form.Item name="adjustType" label="调整类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'discount', label: '减免金额' },
              { value: 'late_fee', label: '调整滞纳金' },
              { value: 'write_off', label: '坏账核销' },
            ]} />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="输入金额" />
          </Form.Item>
          <Form.Item name="reason" label="调整原因" rules={[{ required: true, message: '请输入调整原因' }]}>
            <Input.TextArea rows={2} placeholder="请输入调整原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 账单详情弹窗 */}
      <Modal
        title="账单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>关闭</Button>}
      >
        {detailBill && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="账单号">{detailBill.billNo}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_MAP[detailBill.status].color}>{STATUS_MAP[detailBill.status].label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="业主">{detailBill.ownerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系方式">{detailBill.ownerPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="房屋">{detailBill.houseFullName}</Descriptions.Item>
            <Descriptions.Item label="楼栋">{detailBill.buildingName}</Descriptions.Item>
            <Descriptions.Item label="费用项">{detailBill.feeItemName}</Descriptions.Item>
            <Descriptions.Item label="账期">{detailBill.periodYear}年{detailBill.periodMonth}月</Descriptions.Item>
            <Descriptions.Item label="应收金额">¥{detailBill.amount.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="已缴金额">¥{detailBill.paidAmount.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="减免金额">¥{detailBill.discountAmount.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="滞纳金">¥{detailBill.lateFee.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="缴费截止日">{detailBill.dueDate}</Descriptions.Item>
            <Descriptions.Item label="缴费时间">{detailBill.paidTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{detailBill.remark || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default BillManage;
