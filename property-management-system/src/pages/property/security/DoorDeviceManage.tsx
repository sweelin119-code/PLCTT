import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Card, Tag,
  message, Popconfirm, Switch, Tabs, DatePicker, Row, Col, Statistic,
  Spin, Progress, Empty, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DownloadOutlined, KeyOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getDoorDevicesManage,
  createDoorDevice,
  updateDoorDevice,
  deleteDoorDevice,
  getAccessRecordsManage,
  getVisitorAuthReviews,
  reviewVisitorAuth,
  getAccessStats,
  type DoorDeviceManage as DoorDeviceManageType,
  type AccessRecord,
  type VisitorAuthReview,
  type AccessStats,
} from '../../../services/accessService';

const { RangePicker } = DatePicker;

// ===== 门禁设备管理子页面 =====
const DeviceManageTab: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [data, setData] = useState<DoorDeviceManageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DoorDeviceManageType | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getDoorDevicesManage({
        keyword: keyword || undefined,
        type: typeFilter,
      });
      setData(list);
    } catch {
      message.error('加载门禁设备失败');
    } finally {
      setLoading(false);
    }
  }, [keyword, typeFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  // 统计
  const totalCount = data.length;
  const onlineCount = data.filter(d => d.isOnline).length;
  const offlineCount = data.filter(d => !d.isOnline).length;
  const enabledCount = data.filter(d => d.isEnabled).length;

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingItem) {
        await updateDoorDevice(editingItem.id, values);
        message.success('更新成功');
      } else {
        await createDoorDevice(values);
        message.success('新增成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      loadData();
    } catch {
      // 表单校验失败
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDoorDevice(id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      main: '大门',
      unit: '单元门',
      underground: '地库门',
      side: '侧门',
    };
    return map[type] || type;
  };

  const columns: ColumnsType<DoorDeviceManageType> = [
    { title: '设备名称', dataIndex: 'name', width: 140 },
    {
      title: '设备类型',
      dataIndex: 'type',
      width: 90,
      render: (val) => getTypeLabel(val),
    },
    { title: '安装位置', dataIndex: 'location', width: 140 },
    {
      title: '关联楼栋',
      dataIndex: 'buildingName',
      width: 100,
      render: (val) => val || '-',
    },
    { title: '蓝牙MAC', dataIndex: 'bluetoothMac', width: 150, render: (val) => val || '-' },
    {
      title: '在线状态',
      dataIndex: 'isOnline',
      width: 90,
      render: (val) => val
        ? <Tag color="green">在线</Tag>
        : <Tag color="default">离线</Tag>,
    },
    {
      title: '启用状态',
      dataIndex: 'isEnabled',
      width: 90,
      render: (val) => val
        ? <Tag color="blue">启用</Tag>
        : <Tag color="error">停用</Tag>,
    },
    { title: '最后心跳', dataIndex: 'lastHeartbeat', width: 160, render: (val) => val || '-' },
    {
      title: '操作',
      width: 180,
      render: (_: any, record: DoorDeviceManageType) => (
        <Space>
          <Button
            type="link" size="small" icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除该设备？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="设备总数" value={totalCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="在线" value={onlineCount} valueStyle={{ color: '#52c41a' }} suffix={`/ ${totalCount}`} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="离线" value={offlineCount} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="已启用" value={enabledCount} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索设备名称/位置"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={() => loadData()}
          />
          <Select
            placeholder="设备类型"
            allowClear
            style={{ width: 120 }}
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: '大门', value: 'main' },
              { label: '单元门', value: 'unit' },
              { label: '地库门', value: 'underground' },
              { label: '侧门', value: 'side' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setModalVisible(true);
          }}>
            新增设备
          </Button>
        </Space>
      </Card>

      {/* 设备列表 */}
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 台设备` }}
          size="middle"
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑门禁设备' : '新增门禁设备'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
        confirmLoading={saving}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="设备名称" rules={[{ required: true, message: '请输入设备名称' }]}>
            <Input placeholder="如：小区东门" maxLength={30} />
          </Form.Item>
          <Form.Item name="type" label="设备类型" rules={[{ required: true, message: '请选择设备类型' }]}>
            <Select
              placeholder="请选择设备类型"
              options={[
                { label: '大门', value: 'main' },
                { label: '单元门', value: 'unit' },
                { label: '地库门', value: 'underground' },
                { label: '侧门', value: 'side' },
              ]}
            />
          </Form.Item>
          <Form.Item name="location" label="安装位置" rules={[{ required: true, message: '请输入安装位置' }]}>
            <Input placeholder="如：小区东侧入口" />
          </Form.Item>
          <Form.Item name="buildingName" label="关联楼栋">
            <Input placeholder="单元门时填写，如：3栋" />
          </Form.Item>
          <Form.Item
            name="bluetoothMac"
            label="蓝牙MAC地址"
            rules={[
              { pattern: /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, message: 'MAC地址格式不正确（如 AA:BB:CC:DD:EE:FF）' },
            ]}
          >
            <Input placeholder="AA:BB:CC:DD:EE:FF" />
          </Form.Item>
          <Form.Item name="isEnabled" label="启用状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ===== 开门记录查询子页面 =====
const AccessRecordsTab: React.FC = () => {
  const [data, setData] = useState<AccessRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选
  const [doorFilter, setDoorFilter] = useState<number | undefined>();
  const [methodFilter, setMethodFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  // 门禁设备列表（用于筛选）
  const [doorDevices, setDoorDevices] = useState<DoorDeviceManageType[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAccessRecordsManage({
        doorId: doorFilter,
        method: methodFilter,
        status: statusFilter,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
        page,
        pageSize,
      });
      setData(result.records);
      setTotal(result.total);
    } catch {
      message.error('加载开门记录失败');
    } finally {
      setLoading(false);
    }
  }, [doorFilter, methodFilter, statusFilter, dateRange, page, pageSize]);

  useEffect(() => {
    getDoorDevicesManage().then(setDoorDevices).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      bluetooth: '蓝牙', qrcode: '二维码', remote: '远程',
      password: '密码', face: '人脸',
    };
    return map[method] || method;
  };

  const columns: ColumnsType<AccessRecord> = [
    { title: '开门时间', dataIndex: 'time', width: 160 },
    { title: '门禁名称', dataIndex: 'doorName', width: 120 },
    {
      title: '开门方式',
      dataIndex: 'method',
      width: 90,
      render: (val) => <Tag>{getMethodLabel(val)}</Tag>,
    },
    {
      title: '开门人',
      width: 120,
      render: (_: any, record: AccessRecord) => record.ownerName || record.visitorName || '-',
    },
    {
      title: '联系方式',
      width: 120,
      render: (_: any, record: AccessRecord) => record.ownerPhone || record.visitorPhone || '-',
    },
    { title: '所属房屋', dataIndex: 'houseAddress', width: 140, render: (val) => val || '-' },
    {
      title: '结果',
      dataIndex: 'status',
      width: 70,
      render: (val) => val === 'success'
        ? <Tag color="green">成功</Tag>
        : <Tag color="red">失败</Tag>,
    },
    {
      title: '失败原因',
      dataIndex: 'failReason',
      width: 120,
      render: (val) => val || '-',
    },
  ];

  return (
    <div>
      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="门禁设备"
            allowClear
            style={{ width: 150 }}
            value={doorFilter}
            onChange={setDoorFilter}
            options={doorDevices.map(d => ({ label: d.name, value: d.id }))}
          />
          <Select
            placeholder="开门方式"
            allowClear
            style={{ width: 120 }}
            value={methodFilter}
            onChange={setMethodFilter}
            options={[
              { label: '蓝牙', value: 'bluetooth' },
              { label: '二维码', value: 'qrcode' },
              { label: '远程', value: 'remote' },
              { label: '密码', value: 'password' },
              { label: '人脸', value: 'face' },
            ]}
          />
          <Select
            placeholder="开门结果"
            allowClear
            style={{ width: 110 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '成功', value: 'success' },
              { label: '失败', value: 'failed' },
            ]}
          />
          <RangePicker
            onChange={(_, dateStrings) => {
              if (dateStrings[0] && dateStrings[1]) {
                setDateRange([dateStrings[0], dateStrings[1]]);
              } else {
                setDateRange(undefined);
              }
            }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => { setPage(1); loadData(); }}>刷新</Button>
          <Button icon={<DownloadOutlined />}>导出Excel</Button>
        </Space>
      </Card>

      {/* 记录列表 */}
      <Card>
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
            showTotal: (t) => `共 ${t} 条记录`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          size="middle"
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

// ===== 访客授权审核子页面 =====
const AuthReviewTab: React.FC = () => {
  const [data, setData] = useState<VisitorAuthReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // 审核弹窗
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<VisitorAuthReview | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewRemark, setReviewRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getVisitorAuthReviews(statusFilter);
      setData(list);
    } catch {
      message.error('加载审核列表失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReview = async () => {
    if (!reviewingItem) return;
    setSubmitting(true);
    try {
      await reviewVisitorAuth(reviewingItem.id, reviewAction, reviewRemark);
      message.success(reviewAction === 'approved' ? '已通过审核' : '已驳回');
      setReviewVisible(false);
      setReviewingItem(null);
      setReviewRemark('');
      loadData();
    } catch {
      message.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已驳回' },
    };
    const item = map[status] || { color: 'default', text: status };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  const columns: ColumnsType<VisitorAuthReview> = [
    { title: '访客姓名', dataIndex: 'visitorName', width: 100 },
    { title: '手机号', dataIndex: 'visitorPhone', width: 110 },
    { title: '来访事由', dataIndex: 'visitReason', width: 120, render: (val) => val || '-' },
    { title: '业主', dataIndex: 'ownerName', width: 80 },
    { title: '房屋', dataIndex: 'ownerHouse', width: 130 },
    { title: '授权门禁', dataIndex: 'doorName', width: 120 },
    { title: '有效期', width: 160, render: (_: any, record: VisitorAuthReview) => `${record.validFrom} ~ ${record.validTo}` },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (val) => getStatusTag(val),
    },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: VisitorAuthReview) => (
        record.status === 'pending' ? (
          <Space>
            <Button
              type="link" size="small"
              icon={<CheckCircleOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => {
                setReviewingItem(record);
                setReviewAction('approved');
                setReviewRemark('');
                setReviewVisible(true);
              }}
            >
              通过
            </Button>
            <Button
              type="link" size="small" danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setReviewingItem(record);
                setReviewAction('rejected');
                setReviewRemark('');
                setReviewVisible(true);
              }}
            >
              驳回
            </Button>
          </Space>
        ) : (
          <span style={{ color: '#999', fontSize: 12 }}>
            {record.reviewedBy || '已处理'}
          </span>
        )
      ),
    },
  ];

  return (
    <div>
      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="审核状态"
            allowClear
            style={{ width: 130 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '待审核', value: 'pending' },
              { label: '已通过', value: 'approved' },
              { label: '已驳回', value: 'rejected' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => loadData()}>刷新</Button>
        </Space>
      </Card>

      {/* 审核列表 */}
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      </Card>

      {/* 审核弹窗 */}
      <Modal
        title={reviewAction === 'approved' ? '确认通过审核' : '确认驳回'}
        open={reviewVisible}
        onOk={handleReview}
        onCancel={() => {
          setReviewVisible(false);
          setReviewingItem(null);
          setReviewRemark('');
        }}
        confirmLoading={submitting}
        okText={reviewAction === 'approved' ? '通过' : '驳回'}
        okButtonProps={{ danger: reviewAction === 'rejected' }}
      >
        <div style={{ marginBottom: 16 }}>
          <p><strong>访客：</strong>{reviewingItem?.visitorName}（{reviewingItem?.visitorPhone}）</p>
          <p><strong>业主：</strong>{reviewingItem?.ownerName} - {reviewingItem?.ownerHouse}</p>
          <p><strong>门禁：</strong>{reviewingItem?.doorName}</p>
          <p><strong>有效期：</strong>{reviewingItem?.validFrom} ~ {reviewingItem?.validTo}</p>
          {reviewingItem?.visitReason && <p><strong>事由：</strong>{reviewingItem.visitReason}</p>}
        </div>
        {reviewAction === 'rejected' && (
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>驳回原因 *</label>
            <Input.TextArea
              rows={3}
              placeholder="请输入驳回原因"
              value={reviewRemark}
              onChange={e => setReviewRemark(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===== 开锁记录统计标签页 =====
const AccessStatsTab: React.FC = () => {
  const [stats, setStats] = useState<AccessStats | null>(null);
  const [loading, setLoading] = useState(false);

  /** 安全计算百分比，避免 toFixed 调用非数字 */
  const safePercent = (part: number, total: number): string => {
    const p = Number(part);
    const t = Number(total);
    if (!t || !p || !isFinite(p) || !isFinite(t)) return '0';
    return ((p / t) * 100).toFixed(1);
  };

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccessStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const methodLabels: Record<string, string> = {
    qr_code: '二维码',
    password: '密码',
    remote: '远程开门',
    card: '门禁卡',
    face: '人脸识别',
    intercom: '对讲',
  };

  const methodColors: string[] = ['#1890ff','#52c41a','#faad14','#ff4d4f','#722ed1','#13c2c2'];

  return (
    <Spin spinning={loading}>
      {stats && (
        <div>
          {/* 今日统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
                <Statistic
                  title="今日开门总数"
                  value={stats.todayStats.total}
                  valueStyle={{ color: '#1890ff', fontSize: 28 }}
                  prefix={<KeyOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
                <Statistic
                  title="成功次数"
                  value={stats.todayStats.successCount}
                  valueStyle={{ color: '#52c41a', fontSize: 28 }}
                  prefix={<CheckCircleOutlined />}
                  suffix={
                    stats.todayStats.total > 0 ? (
                      <span style={{ color: '#999', fontSize: 14 }}>
                        ({safePercent(stats.todayStats.successCount, stats.todayStats.total)}%)
                      </span>
                    ) : null
                  }
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
                <Statistic
                  title="失败次数"
                  value={stats.todayStats.failedCount}
                  valueStyle={{ color: '#ff4d4f', fontSize: 28 }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" styles={{ body: { padding: '16px 20px' } }}>
                <Statistic
                  title="已过期"
                  value={stats.todayStats.expiredCount}
                  valueStyle={{ color: '#faad14', fontSize: 28 }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* 开门方式分布 */}
            <Col xs={24} md={12}>
              <Card title="今日开门方式分布" size="small">
                {stats.methodDistribution.length > 0 ? (
                  <div style={{ padding: '8px 0' }}>
                    {stats.methodDistribution.map((item, idx) => {
                      const pct = safePercent(item.count, stats.todayStats.total);
                      return (
                        <div key={item.access_type} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span>{methodLabels[item.access_type] || item.access_type}</span>
                            <span style={{ fontWeight: 600 }}>{item.count} 次（{pct}%）</span>
                          </div>
                          <Progress
                            percent={Number(pct)}
                            strokeColor={methodColors[idx % methodColors.length]}
                            size="small"
                            showInfo={false}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>

            {/* 每小时趋势 */}
            <Col xs={24} md={12}>
              <Card title="今日每小时开门趋势" size="small">
                {stats.hourlyTrend.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 200, padding: '8px 0' }}>
                    {Array.from({ length: 24 }, (_, h) => {
                      const point = stats.hourlyTrend.find(p => p.hour === h);
                      const maxVal = Math.max(...stats.hourlyTrend.map(p => p.total), 1);
                      const barH = point ? (point.total / maxVal) * 170 : 0;
                      return (
                        <Tooltip
                          key={h}
                          title={`${h}时: ${point?.total || 0}次（成功${point?.successCount || 0}次）`}
                        >
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 200, justifyContent: 'flex-end' }}>
                            <div style={{
                              width: '100%',
                              height: barH,
                              background: point ? (point.successCount === point.total ? '#52c41a' : '#1890ff') : '#f0f0f0',
                              borderRadius: '2px 2px 0 0',
                              minHeight: point ? 2 : 0,
                              transition: 'height 0.3s',
                            }} />
                            <span style={{ fontSize: 10, marginTop: 2 }}>{h}</span>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>

            {/* 近30天每日趋势 */}
            <Col xs={24}>
              <Card title="近30天开门趋势" size="small">
                {stats.dailyTrend.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 200, padding: '8px 0', overflowX: 'auto' }}>
                    {stats.dailyTrend.map((point) => {
                      const maxVal = Math.max(...stats.dailyTrend.map(p => p.total), 1);
                      const barH = (point.total / maxVal) * 170;
                      return (
                        <Tooltip
                          key={point.date}
                          title={`${point.date}: ${point.total}次（成功${point.successCount}次, 失败${point.failedCount}次）`}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 200, justifyContent: 'flex-end', minWidth: 32 }}>
                            <div style={{
                              width: 24,
                              height: barH,
                              background: 'linear-gradient(to top, #1890ff, #52c41a)',
                              borderRadius: '2px 2px 0 0',
                              minHeight: point.total > 0 ? 2 : 0,
                              transition: 'height 0.3s',
                            }} />
                            <span style={{ fontSize: 10, marginTop: 2 }}>{point.date.slice(5)}</span>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>

            {/* 设备排行 */}
            <Col xs={24}>
              <Card title="设备开门排行（近30天）" size="small">
                {stats.deviceRanking.length > 0 ? (
                  <Table
                    dataSource={stats.deviceRanking}
                    rowKey="device_code"
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '排名', key: 'rank', width: 60, render: (_: any, __: any, idx: number) => <Tag color={idx < 3 ? 'gold' : undefined}>{idx + 1}</Tag> },
                      { title: '设备名称', dataIndex: 'device_name', key: 'device_name' },
                      { title: '设备编号', dataIndex: 'device_code', key: 'device_code' },
                      { title: '总开门数', dataIndex: 'total', key: 'total' },
                      {
                        title: '成功率',
                        key: 'successRate',
                        render: (_: any, record: any) => {
                          const rate = safePercent(record.successCount, record.total);
                          return <Progress percent={Number(rate)} size="small" />;
                        },
                      },
                    ]}
                  />
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Spin>
  );
};

// ===== 主页面：智能门禁管理 =====
const DoorDeviceManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const projectId = currentCommunity?.id || 1;

  const tabItems = [
    {
      key: 'devices',
      label: '门禁设备管理',
      children: <DeviceManageTab projectId={projectId} />,
    },
    {
      key: 'records',
      label: '开门记录查询',
      children: <AccessRecordsTab />,
    },
    {
      key: 'review',
      label: '访客授权审核',
      children: <AuthReviewTab />,
    },
    {
      key: 'stats',
      label: '开锁记录统计',
      children: <AccessStatsTab />,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Tabs defaultActiveKey="devices" items={tabItems} />
    </div>
  );
};

export default DoorDeviceManage;
