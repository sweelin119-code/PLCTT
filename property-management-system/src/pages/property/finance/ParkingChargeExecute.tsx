import React, { useState, useCallback, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Button, Input, Select, Modal, Form,
  Space, message, Badge, Descriptions, Divider, Alert, Typography,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, PlusOutlined, CarOutlined,
  DollarOutlined, TeamOutlined, FileTextOutlined, CheckCircleOutlined,
  StopOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getParkingEntryRecords,
  getParkingChargeRecords,
  getParkingFeeStats,
  createParkingEntry,
  processParkingExit,
  type ParkingEntryRecord,
  type ParkingChargeRecord,
  type ParkingFeeStats,
  type ParkingEntryQueryParams,
  type ParkingChargeQueryParams,
} from '../../../services/parkingFeeService';

const { Text, Title } = Typography;

const ParkingChargeExecute: React.FC = () => {
  const projectId = 1;

  // ===== 统计 =====
  const [stats, setStats] = useState<ParkingFeeStats | null>(null);

  // ===== 在场车辆 =====
  const [parkedData, setParkedData] = useState<ParkingEntryRecord[]>([]);
  const [parkedTotal, setParkedTotal] = useState(0);
  const [parkedLoading, setParkedLoading] = useState(false);
  const [parkedKeyword, setParkedKeyword] = useState('');
  const [parkedPage, setParkedPage] = useState(1);

  // ===== 入场登记 =====
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [entryForm] = Form.useForm();
  const [entryLoading, setEntryLoading] = useState(false);

  // ===== 出场收费 =====
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [exitRecord, setExitRecord] = useState<ParkingEntryRecord | null>(null);
  const [exitForm] = Form.useForm();
  const [exitLoading, setExitLoading] = useState(false);

  // ===== 最近收费记录 =====
  const [recentCharges, setRecentCharges] = useState<ParkingChargeRecord[]>([]);
  const [chargeLoading, setChargeLoading] = useState(false);

  // 加载统计
  const loadStats = useCallback(async () => {
    try {
      const data = await getParkingFeeStats(projectId);
      setStats(data);
    } catch { /* ignore */ }
  }, []);

  // 加载在场车辆
  const loadParked = useCallback(async (p: number) => {
    setParkedLoading(true);
    try {
      const params: ParkingEntryQueryParams = {
        projectId, page: p, pageSize: 10, status: 'parked',
      };
      if (parkedKeyword) params.keyword = parkedKeyword;
      const result = await getParkingEntryRecords(params);
      setParkedData(result.list);
      setParkedTotal(result.total);
      setParkedPage(p);
    } finally {
      setParkedLoading(false);
    }
  }, [parkedKeyword]);

  // 加载最近收费记录
  const loadRecentCharges = useCallback(async () => {
    setChargeLoading(true);
    try {
      const params: ParkingChargeQueryParams = { projectId, page: 1, pageSize: 5 };
      const result = await getParkingChargeRecords(params);
      setRecentCharges(result.list);
    } finally {
      setChargeLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadParked(1);
    loadRecentCharges();
  }, [loadStats, loadParked, loadRecentCharges]);

  // ===== 入场登记 =====
  const handleEntrySubmit = async () => {
    try {
      const values = await entryForm.validateFields();
      setEntryLoading(true);
      await createParkingEntry({
        projectId,
        plateNo: values.plateNo.toUpperCase(),
        vehicleType: values.vehicleType || 'car',
        entrance: values.entrance || '北门入口',
        remark: values.remark,
      });
      message.success({ content: `车辆 ${values.plateNo.toUpperCase()} 入场登记成功`, icon: <CheckCircleOutlined /> });
      setEntryModalVisible(false);
      entryForm.resetFields();
      loadParked(1);
      loadStats();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '入场登记失败');
    } finally {
      setEntryLoading(false);
    }
  };

  // ===== 出场收费 =====
  const handleExitClick = (record: ParkingEntryRecord) => {
    setExitRecord(record);
    setExitModalVisible(true);
    // 预填费用
    exitForm.setFieldsValue({
      payMethod: 'wechat',
      actualFee: record.fee || 0,
      operator: '',
    });
  };

  const handleExitSubmit = async () => {
    try {
      const values = await exitForm.validateFields();
      if (!exitRecord) return;
      setExitLoading(true);
      await processParkingExit(exitRecord.id, values.payMethod, values.actualFee, values.operator || '');
      message.success({ content: `车辆 ${exitRecord.plateNo} 出场收费成功`, icon: <CheckCircleOutlined /> });
      setExitModalVisible(false);
      setExitRecord(null);
      exitForm.resetFields();
      loadParked(1);
      loadStats();
      loadRecentCharges();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.message || '出场收费失败');
    } finally {
      setExitLoading(false);
    }
  };

  // ===== 状态标签 =====
  const getVehicleTypeTag = (t?: string) => {
    switch (t) {
      case 'car': return <Tag color="#1677ff">小型车</Tag>;
      case 'motorcycle': return <Tag color="#722ed1">摩托车</Tag>;
      case 'large': return <Tag color="#fa541c">大型车</Tag>;
      default: return <Tag>未知</Tag>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'parked': return <Badge status="success" text={<Text strong style={{ color: '#52c41a' }}>在场</Text>} />;
      case 'exited': return <Badge status="default" text="已出场" />;
      case 'free': return <Badge status="default" text="免费出场" />;
      default: return <Badge status="default" text={status} />;
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

  // ===== 在场车辆表格列 =====
  const parkedColumns: ColumnsType<ParkingEntryRecord> = [
    {
      title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 130,
      render: (text) => <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 90,
      render: (t) => getVehicleTypeTag(t),
    },
    {
      title: '入场时间', dataIndex: 'entryTime', key: 'entryTime', width: 170,
    },
    {
      title: '入口', dataIndex: 'entrance', key: 'entrance', width: 110,
    },
    {
      title: '预计应收', dataIndex: 'fee', key: 'fee', width: 90,
      render: (fee) => fee > 0 ? <Text style={{ color: '#faad14' }}>¥{fee.toFixed(2)}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s) => getStatusBadge(s),
    },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right',
      render: (_, record) => (
        record.status === 'parked' ? (
          <Button type="primary" size="small" icon={<DollarOutlined />}
            onClick={() => handleExitClick(record)}>
            出场收费
          </Button>
        ) : (
          <Button type="link" size="small" disabled>已出场</Button>
        )
      ),
    },
  ];

  // ===== 最近收费记录列 =====
  const chargeColumns: ColumnsType<ParkingChargeRecord> = [
    { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120, render: (t) => <Text strong>{t}</Text> },
    { title: '入场', dataIndex: 'entryTime', key: 'entryTime', width: 160 },
    { title: '出场', dataIndex: 'exitTime', key: 'exitTime', width: 160 },
    { title: '停留时长', dataIndex: 'duration', key: 'duration', width: 110 },
    { title: '实收', dataIndex: 'actualFee', key: 'actualFee', width: 80, render: (fee) => <Text strong style={{ color: '#52c41a' }}>¥{fee.toFixed(2)}</Text> },
    { title: '支付方式', dataIndex: 'payMethod', key: 'payMethod', width: 90, render: (m) => getPayMethodText(m) },
    { title: '收费员', dataIndex: 'operator', key: 'operator', width: 90 },
    { title: '收费时间', dataIndex: 'payTime', key: 'payTime', width: 160 },
  ];

  return (
    <div>
      {/* ===== 统计卡片 ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>在场车辆</span>}
              value={stats?.currentParked ?? 0} suffix="辆"
              valueStyle={{ color: '#fff', fontSize: 28 }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>今日收入</span>}
              value={stats?.todayIncome ?? 0} prefix="¥" precision={2}
              valueStyle={{ color: '#fff', fontSize: 28 }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>月租订阅</span>}
              value={stats?.monthlySubscribers ?? 0} suffix="个"
              valueStyle={{ color: '#fff', fontSize: 28 }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>本月收入</span>}
              value={stats?.monthIncome ?? 0} prefix="¥" precision={2}
              valueStyle={{ color: '#fff', fontSize: 28 }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>待缴管理费</span>}
              value={stats?.propertyFeePending ?? 0} prefix="¥" precision={2}
              valueStyle={{ color: '#fff', fontSize: 28 }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card loading={!stats} size="small" style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>待缴月租费</span>}
              value={stats?.rentalFeePending ?? 0} prefix="¥" precision={2}
              valueStyle={{ color: '#fff', fontSize: 28 }} />
          </Card>
        </Col>
      </Row>

      {/* ===== 快捷操作 + 在场车辆列表 ===== */}
      <Row gutter={16}>
        {/* 左侧：在场车辆管理 */}
        <Col xs={24} lg={16}>
          <Card
            size="small"
            title={
              <Space>
                <CarOutlined style={{ color: '#1677ff' }} />
                <span>在场车辆管理</span>
                <Tag color="blue">{parkedTotal} 辆在场</Tag>
              </Space>
            }
            extra={
              <Space>
                <Input.Search
                  placeholder="搜索车牌号"
                  allowClear
                  style={{ width: 180 }}
                  value={parkedKeyword}
                  onChange={e => setParkedKeyword(e.target.value)}
                  onSearch={() => loadParked(1)}
                />
                <Button icon={<PlusOutlined />} type="primary" onClick={() => {
                  entryForm.resetFields();
                  setEntryModalVisible(true);
                }}>
                  入场登记
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => { loadParked(1); loadStats(); }}>
                  刷新
                </Button>
              </Space>
            }
          >
            <Table
              columns={parkedColumns}
              dataSource={parkedData}
              rowKey="id"
              loading={parkedLoading}
              size="small"
              scroll={{ x: 820 }}
              pagination={{
                current: parkedPage,
                pageSize: 10,
                total: parkedTotal,
                showSizeChanger: false,
                onChange: loadParked,
              }}
            />
          </Card>
        </Col>

        {/* 右侧：最近收费记录 */}
        <Col xs={24} lg={8}>
          <Card
            size="small"
            title={
              <Space>
                <FileTextOutlined style={{ color: '#52c41a' }} />
                <span>最近收费</span>
              </Space>
            }
          >
            <Table
              columns={[
                { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100, render: (t) => <Text strong>{t}</Text> },
                { title: '实收', dataIndex: 'actualFee', key: 'actualFee', width: 70, render: (fee) => <Text style={{ color: '#52c41a' }}>¥{fee.toFixed(2)}</Text> },
                { title: '支付', dataIndex: 'payMethod', key: 'payMethod', width: 70, render: (m) => getPayMethodText(m) },
              ]}
              dataSource={recentCharges}
              rowKey="id"
              loading={chargeLoading}
              size="small"
              pagination={false}
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== 入场登记弹窗 ===== */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#1677ff' }} />
            车辆入场登记
          </Space>
        }
        open={entryModalVisible}
        onCancel={() => { setEntryModalVisible(false); entryForm.resetFields(); }}
        onOk={handleEntrySubmit}
        confirmLoading={entryLoading}
        okText="确认入场"
        cancelText="取消"
        width={500}
      >
        <Divider />
        <Form form={entryForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="plateNo"
            label="车牌号"
            rules={[
              { required: true, message: '请输入车牌号' },
              { pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警]$/, message: '请输入正确的车牌号格式' },
            ]}
          >
            <Input
              placeholder="请输入车牌号，如 京A12345"
              style={{ textTransform: 'uppercase' }}
              maxLength={8}
              prefix={<CarOutlined />}
            />
          </Form.Item>
          <Form.Item name="vehicleType" label="车辆类型" initialValue="car" rules={[{ required: true, message: '请选择车辆类型' }]}>
            <Select
              options={[
                { value: 'car', label: '小型车' },
                { value: 'motorcycle', label: '摩托车' },
                { value: 'large', label: '大型车' },
              ]}
            />
          </Form.Item>
          <Form.Item name="entrance" label="入口" initialValue="北门入口" rules={[{ required: true, message: '请选择入口' }]}>
            <Select
              options={[
                { value: '北门入口', label: '北门入口' },
                { value: '南门入口', label: '南门入口' },
                { value: '东门入口', label: '东门入口' },
                { value: '西门入口', label: '西门入口' },
                { value: '地库入口', label: '地库入口' },
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="可选，如：临时访客、送货车辆等" />
          </Form.Item>
        </Form>
        <Alert
          message="提示：月租车辆将自动识别，无需人工登记。手动登记适用于临时车辆入场。"
          type="info"
          showIcon
          style={{ marginTop: 8 }}
        />
      </Modal>

      {/* ===== 出场收费弹窗 ===== */}
      <Modal
        title={
          <Space>
            <DollarOutlined style={{ color: '#52c41a' }} />
            出场收费
          </Space>
        }
        open={exitModalVisible}
        onCancel={() => { setExitModalVisible(false); setExitRecord(null); exitForm.resetFields(); }}
        onOk={handleExitSubmit}
        confirmLoading={exitLoading}
        okText="确认出场并收费"
        cancelText="取消"
        width={520}
      >
        {exitRecord && (
          <>
            <Divider />
            <Descriptions column={2} size="small" bordered style={{ marginTop: 8 }}>
              <Descriptions.Item label="车牌号" span={2}>
                <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{exitRecord.plateNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="车辆类型">{exitRecord.vehicleType === 'car' ? '小型车' : exitRecord.vehicleType === 'motorcycle' ? '摩托车' : '大型车'}</Descriptions.Item>
              <Descriptions.Item label="入口">{exitRecord.entrance}</Descriptions.Item>
              <Descriptions.Item label="入场时间" span={2}>{exitRecord.entryTime}</Descriptions.Item>
              <Descriptions.Item label="预计收费" span={2}>
                <Text strong style={{ color: '#faad14', fontSize: 16 }}>
                  ¥{(exitRecord.fee || 0).toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
            <Divider>收费信息</Divider>
            <Form form={exitForm} layout="vertical">
              <Form.Item name="payMethod" label="支付方式" rules={[{ required: true, message: '请选择支付方式' }]}>
                <Select
                  options={[
                    { value: 'wechat', label: '微信支付' },
                    { value: 'alipay', label: '支付宝' },
                    { value: 'cash', label: '现金' },
                    { value: 'monthly', label: '月租抵扣' },
                    { value: 'free', label: '免费放行' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="actualFee"
                label="实收金额（元）"
                rules={[
                  { required: true, message: '请输入实收金额' },
                  { type: 'number', min: 0, message: '金额不能为负' },
                ]}
                initialValue={exitRecord.fee || 0}
              >
                <Input type="number" prefix="¥" min={0} step={0.01} />
              </Form.Item>
              <Form.Item name="operator" label="收费员">
                <Input placeholder="默认当前用户" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ParkingChargeExecute;
