import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Card, Tag,
  message, Popconfirm, Switch, Tabs, Statistic, Row, Col, DatePicker,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getVisitorTypes,
  createVisitorType,
  updateVisitorType,
  deleteVisitorType,
  getVisitorLedgerList,
  getVisitorLedgerStats,
  registerVisitor,
  markVisitorLeft,
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  getDoorDevicesManage,
  type VisitorType,
  type VisitorLedger,
  type VisitorLedgerStats,
  type VisitorBlacklist,
  type DoorDeviceManage,
} from '../../../services/accessService';

const { RangePicker } = DatePicker;

// ===== 访客类型管理页面 =====
const VisitorTypeManage: React.FC<{
  projectId: number;
}> = ({ projectId }) => {
  const [data, setData] = useState<VisitorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<VisitorType | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getVisitorTypes();
      setData(list);
    } catch {
      message.error('加载访客类型失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingItem) {
        await updateVisitorType(editingItem.id, values);
        message.success('更新成功');
      } else {
        await createVisitorType({ ...values, projectId });
        message.success('创建成功');
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
      await deleteVisitorType(id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<VisitorType> = [
    { title: '排序', dataIndex: 'sortOrder', width: 60, align: 'center' },
    {
      title: '类型名称',
      dataIndex: 'typeName',
      width: 150,
      render: (text, record) => (
        <span>
          {text}
          {record.isPreset && <Tag style={{ marginLeft: 6 }} color="blue">预设</Tag>}
        </span>
      ),
    },
    { title: '类型编码', dataIndex: 'typeCode', width: 160 },
    {
      title: '需要审核',
      dataIndex: 'needReview',
      width: 100,
      align: 'center',
      render: (val) => val ? <Tag color="orange">是</Tag> : <Tag color="green">否</Tag>,
    },
    {
      title: '默认有效期(h)',
      dataIndex: 'defaultValidity',
      width: 120,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 80,
      align: 'center',
      render: (val) => val ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>,
    },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: VisitorType) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          {!record.isPreset && (
            <Popconfirm title="确定删除该访客类型？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="访客类型配置"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingItem(null);
          form.resetFields();
          setModalVisible(true);
        }}>
          新增类型
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={editingItem ? '编辑访客类型' : '新增访客类型'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="typeName" label="类型名称" rules={[{ required: true, message: '请输入类型名称' }]}>
            <Input placeholder="如：亲友来访" maxLength={20} />
          </Form.Item>
          <Form.Item name="typeCode" label="类型编码" rules={[{ required: true, message: '请输入类型编码' }]}>
            <Input placeholder="如：VISITOR_FRIEND" disabled={editingItem?.isPreset} />
          </Form.Item>
          <Form.Item name="needReview" label="需要审核" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Form.Item name="defaultValidity" label="默认有效期（小时）" rules={[{ required: true, message: '请输入有效期' }]}>
            <Input type="number" min={1} max={720} addonAfter="小时" />
          </Form.Item>
          <Form.Item name="isActive" label="启用状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

// ===== 访客台账页面 =====
const VisitorLedgerManage: React.FC<{
  projectId: number;
}> = ({ projectId }) => {
  const [data, setData] = useState<VisitorLedger[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<VisitorLedgerStats>({
    todayVisitors: 0, currentVisiting: 0, todayLeft: 0, totalThisMonth: 0,
  });

  // 筛选条件
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterAuthType, setFilterAuthType] = useState<string | undefined>();
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  // 访客类型列表（用于筛选）
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([]);

  // 手动登记弹窗
  const [registerVisible, setRegisterVisible] = useState(false);
  const [registerForm] = Form.useForm();
  const [registering, setRegistering] = useState(false);

  // 门禁设备列表
  const [doorDevices, setDoorDevices] = useState<DoorDeviceManage[]>([]);

  const loadStats = useCallback(async () => {
    try {
      const s = await getVisitorLedgerStats();
      setStats(s);
    } catch { /* 静默 */ }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getVisitorLedgerList({
        projectId,
        visitorType: filterType,
        status: filterStatus,
        authType: filterAuthType,
        keyword: keyword || undefined,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
        page,
        pageSize,
      });
      setData(result.list);
      setTotal(result.total);
    } catch {
      message.error('加载访客台账失败');
    } finally {
      setLoading(false);
    }
  }, [projectId, filterType, filterStatus, filterAuthType, keyword, dateRange, page, pageSize]);

  useEffect(() => {
    loadStats();
    loadData();
    getVisitorTypes().then(setVisitorTypes).catch(() => {});
    getDoorDevicesManage().then(setDoorDevices).catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegister = async () => {
    try {
      const values = await registerForm.validateFields();
      setRegistering(true);
      await registerVisitor({
        ...values,
        ownerId: values.ownerId || 0,
        houseId: values.houseId || 0,
      });
      message.success('登记成功');
      setRegisterVisible(false);
      registerForm.resetFields();
      loadData();
      loadStats();
    } catch {
      // 表单校验失败
    } finally {
      setRegistering(false);
    }
  };

  const handleMarkLeft = async (id: number) => {
    try {
      await markVisitorLeft(id);
      message.success('已标记离开');
      loadData();
      loadStats();
    } catch {
      message.error('操作失败');
    }
  };

  const handleAddBlacklist = async (record: VisitorLedger) => {
    try {
      await addToBlacklist({
        visitorName: record.visitorName,
        visitorPhone: record.visitorPhone,
        reason: '物业手动加入黑名单',
      });
      message.success('已加入黑名单');
    } catch {
      message.error('操作失败');
    }
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待进入' },
      entered: { color: 'processing', text: '已进入' },
      left: { color: 'default', text: '已离开' },
      expired: { color: 'error', text: '已过期' },
    };
    const item = map[status] || { color: 'default', text: status };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  const getAuthTypeTag = (authType: string) => {
    const map: Record<string, string> = {
      owner_grant: '业主授权',
      property_register: '物业登记',
      manual_entry: '手动录入',
    };
    return map[authType] || authType;
  };

  const columns: ColumnsType<VisitorLedger> = [
    { title: '访客姓名', dataIndex: 'visitorName', width: 100 },
    { title: '手机号', dataIndex: 'visitorPhone', width: 110 },
    { title: '访客类型', dataIndex: 'visitorTypeName', width: 100 },
    { title: '业主', dataIndex: 'ownerName', width: 80 },
    { title: '房屋', dataIndex: 'ownerHouse', width: 130 },
    {
      title: '授权方式',
      dataIndex: 'authType',
      width: 100,
      render: (val) => getAuthTypeTag(val),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (val) => getStatusTag(val),
    },
    { title: '来访时间', dataIndex: 'visitTime', width: 160 },
    {
      title: '离开时间',
      dataIndex: 'leaveTime',
      width: 160,
      render: (val) => val || '-',
    },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: VisitorLedger) => (
        <Space>
          {record.status === 'visiting' && (
            <Button type="link" size="small" onClick={() => handleMarkLeft(record.id)}>
              标记离开
            </Button>
          )}
          {true && (
            <Popconfirm
              title="确定将该访客加入黑名单？"
              onConfirm={() => handleAddBlacklist(record)}
            >
              <Button type="link" size="small" danger>拉黑</Button>
            </Popconfirm>
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
          <Card size="small">
            <Statistic title="今日访客" value={stats.todayCount} suffix="人" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="本月访客" value={stats.monthCount} suffix="人" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="本周访客" value={stats.weekCount} suffix="人" valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="累计访客" value={stats.totalCount} suffix="人" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="访客类型"
            allowClear
            style={{ width: 140 }}
            value={filterType}
            onChange={setFilterType}
            options={visitorTypes.map(t => ({ label: t.typeName, value: t.typeCode }))}
          />
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 110 }}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { label: '待进入', value: 'pending' },
              { label: '已进入', value: 'entered' },
              { label: '已离开', value: 'left' },
              { label: '已过期', value: 'expired' },
            ]}
          />
          <Select
            placeholder="授权方式"
            allowClear
            style={{ width: 120 }}
            value={filterAuthType}
            onChange={setFilterAuthType}
            options={[
              { label: '业主授权', value: 'owner_grant' },
              { label: '物业登记', value: 'property_register' },
              { label: '手动录入', value: 'manual_entry' },
            ]}
          />
          <Input
            placeholder="搜索访客/业主"
            prefix={<SearchOutlined />}
            style={{ width: 180 }}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={() => { setPage(1); loadData(); }}
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            registerForm.resetFields();
            setRegisterVisible(true);
          }}>
            手动登记
          </Button>
        </Space>
      </Card>

      {/* 台账表格 */}
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
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          size="middle"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 手动登记弹窗 */}
      <Modal
        title="手动登记访客"
        open={registerVisible}
        onOk={handleRegister}
        onCancel={() => {
          setRegisterVisible(false);
          registerForm.resetFields();
        }}
        confirmLoading={registering}
        width={560}
      >
        <Form form={registerForm} layout="vertical">
          <Form.Item name="visitorName" label="访客姓名" rules={[{ required: true, message: '请输入访客姓名' }]}>
            <Input placeholder="请输入访客姓名" />
          </Form.Item>
          <Form.Item name="visitorPhone" label="访客手机号" rules={[
            { required: true, message: '请输入访客手机号' },
            { pattern: /^1\d{10}$/, message: '请输入正确的11位手机号' },
          ]}>
            <Input placeholder="请输入11位手机号" maxLength={11} />
          </Form.Item>
          <Form.Item name="visitorType" label="访客类型" rules={[{ required: true, message: '请选择访客类型' }]}>
            <Select
              placeholder="请选择访客类型"
              options={visitorTypes.filter(t => t.isActive).map(t => ({ label: t.typeName, value: t.typeCode }))}
            />
          </Form.Item>
          <Form.Item name="ownerName" label="业主姓名" rules={[{ required: true, message: '请输入业主姓名' }]}>
            <Input placeholder="请输入业主姓名" />
          </Form.Item>
          <Form.Item name="ownerHouse" label="房屋地址" rules={[{ required: true, message: '请输入房屋地址' }]}>
            <Input placeholder="如：3栋1单元101室" />
          </Form.Item>
          <Form.Item name="doorIds" label="可通行门禁" rules={[{ required: true, message: '请选择可通行的门禁' }]}>
            <Select
              mode="multiple"
              placeholder="请选择门禁"
              options={doorDevices.filter(d => d.status === 'online' || d.status === 'offline').map(d => ({ label: d.deviceName, value: d.id }))}
            />
          </Form.Item>
          <Form.Item name="plateNo" label="车牌号">
            <Input placeholder="如有车辆请填写车牌号" />
          </Form.Item>
          <Form.Item name="visitReason" label="来访事由">
            <Input.TextArea rows={2} placeholder="请输入来访事由" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ===== 黑名单管理页面 =====
const BlacklistManage: React.FC = () => {
  const [data, setData] = useState<VisitorBlacklist[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getBlacklist();
      setData(list);
    } catch {
      message.error('加载黑名单失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRemove = async (id: number) => {
    try {
      await removeFromBlacklist(id);
      message.success('已移出黑名单');
      loadData();
    } catch {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<VisitorBlacklist> = [
    { title: '姓名', dataIndex: 'visitorName', width: 100 },
    { title: '手机号', dataIndex: 'visitorPhone', width: 120 },
    { title: '拉黑原因', dataIndex: 'reason', width: 200 },
    { title: '过期时间', dataIndex: 'expireTime', width: 160, render: (val) => val || '永久' },
    { title: '操作人', dataIndex: 'createdBy', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', width: 160 },
    {
      title: '操作',
      width: 120,
      render: (_: any, record: VisitorBlacklist) => (
        <Popconfirm title="确定移出黑名单？" onConfirm={() => handleRemove(record.id)}>
          <Button type="link" size="small" danger>移出</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="黑名单管理">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
        size="middle"
      />
    </Card>
  );
};

// ===== 主页面：访客管理 =====
const VisitorManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const projectId = currentCommunity?.id || 1;

  const tabItems = [
    {
      key: 'ledger',
      label: '访客台账',
      children: <VisitorLedgerManage projectId={projectId} />,
    },
    {
      key: 'types',
      label: '访客类型',
      children: <VisitorTypeManage projectId={projectId} />,
    },
    {
      key: 'blacklist',
      label: '黑名单',
      children: <BlacklistManage />,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Tabs defaultActiveKey="ledger" items={tabItems} />
    </div>
  );
};

export default VisitorManage;
