import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, Descriptions, message, Tabs, Statistic, Row, Col, Rate, Steps } from 'antd';
import { SearchOutlined, ToolOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, PhoneOutlined, EnvironmentOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import type { RepairOrder, RepairStatus, RepairType, UrgencyLevel } from '../../services/types';
import { getRepairOrderList, getRepairOrderById, assignRepairOrder, acceptRepairOrder, startRepair, completeRepair, confirmRepair, revisitRepair, getRepairStats, getMaintenanceStaff, repairTypeMap, urgencyMap, repairStatusMap } from '../../services/repairService';

const RepairOrderManage: React.FC = () => {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterStatus] = useState<RepairStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<RepairType | 'all'>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<RepairOrder | null>(null);
  const [assignVisible, setAssignVisible] = useState(false);
  const [assignOrder, setAssignOrder] = useState<RepairOrder | null>(null);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [completeOrder, setCompleteOrder] = useState<RepairOrder | null>(null);
  const [revisitVisible, setRevisitVisible] = useState(false);
  const [revisitOrder, setRevisitOrder] = useState<RepairOrder | null>(null);
  const [staffList, setStaffList] = useState<{ name: string; phone: string }[]>([]);
  const [stats, setStats] = useState({ total: 0, pendingAssign: 0, inProgress: 0, completed: 0, closed: 0, urgentCount: 0 });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [assignForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [revisitForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRepairOrderList({
        keyword: keyword || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        repairType: filterType !== 'all' ? filterType : undefined,
      });
      setOrders(data.list);
      const s = await getRepairStats();
      setStats({
        total: s.total,
        pendingAssign: s.pendingAssign,
        inProgress: s.inProgress,
        completed: s.completed,
        closed: 0,
        urgentCount: 0,
      });
    } catch (err) {
      message.error('获取工单列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterType]);

  const handleSearch = () => {
    fetchData();
  };

  // 查看详情
  const handleViewDetail = async (record: RepairOrder) => {
    const data = await getRepairOrderById(record.id);
    if (data) {
      setDetailData(data);
      setDetailVisible(true);
    }
  };

  // 派单
  const handleAssign = async (record: RepairOrder) => {
    setAssignOrder(record);
    const staff = await getMaintenanceStaff();
    setStaffList(staff);
    assignForm.resetFields();
    setAssignVisible(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignOrder) return;
    try {
      const values = await assignForm.validateFields();
      await assignRepairOrder(assignOrder.id, values.assignedTo, values.assignedPhone);
      message.success('派单成功');
      setAssignVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 接单（前往中）
  const handleAccept = async (record: RepairOrder) => {
    try {
      await acceptRepairOrder(record.id);
      message.success('已接单，前往中');
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 开始维修
  const handleStartRepair = async (record: RepairOrder) => {
    try {
      await startRepair(record.id);
      message.success('已开始维修');
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 完成维修
  const handleComplete = (record: RepairOrder) => {
    setCompleteOrder(record);
    completeForm.resetFields();
    setCompleteVisible(true);
  };

  const handleCompleteSubmit = async () => {
    if (!completeOrder) return;
    try {
      const values = await completeForm.validateFields();
      await completeRepair(completeOrder.id, {
        repairResult: values.repairResult,
        cost: values.cost,
        chargeType: values.chargeType || 'free',
      });
      message.success('维修完成');
      setCompleteVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 业主确认
  const handleConfirm = async (record: RepairOrder) => {
    try {
      await confirmRepair(record.id);
      message.success('业主已确认');
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 回访
  const handleRevisit = (record: RepairOrder) => {
    setRevisitOrder(record);
    revisitForm.resetFields();
    setRevisitVisible(true);
  };

  const handleRevisitSubmit = async () => {
    if (!revisitOrder) return;
    try {
      const values = await revisitForm.validateFields();
      await revisitRepair(revisitOrder.id, values.remark);
      message.success('回访完成，工单已归档');
      setRevisitVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 状态标签
  const renderStatusTag = (status: RepairStatus) => {
    const colorMap: Record<RepairStatus, string> = {
      pending_assign: 'orange',
      assigned: 'blue',
      on_the_way: 'cyan',
      in_progress: 'processing',
      completed: 'green',
      confirmed: 'lime',
      evaluated: 'purple',
      closed: 'default',
    };
    return <Tag color={colorMap[status]}>{repairStatusMap[status]}</Tag>;
  };

  // 紧急程度标签
  const renderUrgencyTag = (urgency: UrgencyLevel) => {
    const colorMap: Record<UrgencyLevel, string> = {
      normal: 'default',
      urgent: 'orange',
      emergency: 'red',
    };
    return <Tag color={colorMap[urgency]}>{urgencyMap[urgency]}</Tag>;
  };

  // 工单进度步骤
  const renderSteps = (status: RepairStatus) => {
    const statusOrder = ['pending_assign', 'assigned', 'on_the_way', 'in_progress', 'completed', 'confirmed', 'evaluated', 'closed'];
    const current = statusOrder.indexOf(status);
    return (
      <Steps
        size="small"
        current={current}
        style={{ marginBottom: 16 }}
        items={[
          { title: '待派单' },
          { title: '已派单' },
          { title: '前往中' },
          { title: '维修中' },
          { title: '已完成' },
          { title: '已确认' },
          { title: '已评价' },
          { title: '已归档' },
        ]}
      />
    );
  };

  const columns = [
    {
      title: '工单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 160,
      render: (no: string, record: RepairOrder) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>{no}</Button>
      ),
    },
    {
      title: '业主信息',
      key: 'owner',
      width: 200,
      render: (_: any, record: RepairOrder) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <UserOutlined style={{ fontSize: 12, color: '#999' }} />
            <span>{record.ownerName}</span>
          </Space>
          <Space size={4}>
            <PhoneOutlined style={{ fontSize: 12, color: '#999' }} />
            <span style={{ color: '#666' }}>{record.ownerPhone}</span>
          </Space>
          <Space size={4}>
            <EnvironmentOutlined style={{ fontSize: 12, color: '#999' }} />
            <span style={{ color: '#666', fontSize: 12 }}>{record.ownerAddress}</span>
          </Space>
        </Space>
      ),
    },
    {
      title: '报修类型',
      dataIndex: 'repairType',
      key: 'repairType',
      width: 100,
      render: (type: RepairType) => repairTypeMap[type],
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 80,
      render: (urgency: UrgencyLevel) => renderUrgencyTag(urgency),
    },
    {
      title: '问题描述',
      dataIndex: 'repairDesc',
      key: 'repairDesc',
      width: 200,
      ellipsis: true,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: RepairStatus) => renderStatusTag(status),
    },
    {
      title: '维保人员',
      key: 'staff',
      width: 120,
      render: (_: any, record: RepairOrder) => record.assignedTo || '-',
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: RepairOrder) => {
        const actions: React.ReactNode[] = [];
        actions.push(
          <Button key="detail" type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
        );
        if (record.status === 'pending_assign') {
          actions.push(
            <Button key="assign" type="link" size="small" style={{ color: '#1890ff' }} onClick={() => handleAssign(record)}>
              派单
            </Button>
          );
        }
        if (record.status === 'assigned') {
          actions.push(
            <Button key="accept" type="link" size="small" style={{ color: '#52c41a' }} onClick={() => handleAccept(record)}>
              接单
            </Button>
          );
        }
        if (record.status === 'on_the_way') {
          actions.push(
            <Button key="start" type="link" size="small" style={{ color: '#fa8c16' }} onClick={() => handleStartRepair(record)}>
              开始维修
            </Button>
          );
        }
        if (record.status === 'in_progress') {
          actions.push(
            <Button key="complete" type="link" size="small" style={{ color: '#52c41a' }} onClick={() => handleComplete(record)}>
              完工
            </Button>
          );
        }
        if (record.status === 'completed') {
          actions.push(
            <Button key="confirm" type="link" size="small" style={{ color: '#722ed1' }} onClick={() => handleConfirm(record)}>
              确认
            </Button>
          );
        }
        if (record.status === 'evaluated' && record.revisitStatus === 'pending') {
          actions.push(
            <Button key="revisit" type="link" size="small" style={{ color: '#13c2c2' }} onClick={() => handleRevisit(record)}>
              回访
            </Button>
          );
        }
        return <Space size={0}>{actions}</Space>;
      },
    },
  ];

  // 根据tab过滤
  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'pending_assign') return orders.filter(o => o.status === 'pending_assign');
    if (activeTab === 'in_progress') return orders.filter(o => ['assigned', 'on_the_way', 'in_progress'].includes(o.status));
    if (activeTab === 'completed') return orders.filter(o => ['completed', 'confirmed', 'evaluated'].includes(o.status));
    if (activeTab === 'closed') return orders.filter(o => o.status === 'closed');
    return orders;
  };

  const tabItems = [
    { key: 'all', label: `全部 (${stats.total})` },
    { key: 'pending_assign', label: `待派单 (${stats.pendingAssign})` },
    { key: 'in_progress', label: `处理中 (${stats.inProgress})` },
    { key: 'completed', label: `已完成 (${stats.completed})` },
    { key: 'closed', label: `已归档 (${stats.closed})` },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="总工单" value={stats.total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="待派单" value={stats.pendingAssign} valueStyle={{ color: stats.pendingAssign > 0 ? '#fa8c16' : undefined }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="处理中" value={stats.inProgress} valueStyle={{ color: '#1890ff' }} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已归档" value={stats.closed} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="紧急待办" value={stats.urgentCount} valueStyle={{ color: stats.urgentCount > 0 ? '#ff4d4f' : undefined }} prefix={<ExclamationCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索工单编号/业主姓名/电话/地址"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={filterType}
            onChange={v => setFilterType(v)}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部类型' },
              ...Object.entries(repairTypeMap).map(([k, v]) => ({ value: k, label: v })),
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
        </Space>
      </Card>

      {/* 工单列表 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        <Table
          dataSource={getFilteredOrders()}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
            pageSize: 10,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title={`工单详情 - ${detailData?.orderNo}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {detailData && (
          <div>
            {renderSteps(detailData.status)}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="工单编号" span={2}>{detailData.orderNo}</Descriptions.Item>
              <Descriptions.Item label="业主姓名">{detailData.ownerName}</Descriptions.Item>
              <Descriptions.Item label="业主电话">{detailData.ownerPhone}</Descriptions.Item>
              <Descriptions.Item label="业主地址" span={2}>{detailData.ownerAddress}</Descriptions.Item>
              <Descriptions.Item label="报修类型">{repairTypeMap[detailData.repairType]}</Descriptions.Item>
              <Descriptions.Item label="紧急程度">{renderUrgencyTag(detailData.urgency)}</Descriptions.Item>
              <Descriptions.Item label="问题描述" span={2}>{detailData.repairDesc}</Descriptions.Item>
              <Descriptions.Item label="当前状态" span={2}>{renderStatusTag(detailData.status)}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{detailData.createTime}</Descriptions.Item>
              <Descriptions.Item label="所属物业">{detailData.propertyCompanyName}</Descriptions.Item>
              {detailData.assignedTo && (
                <>
                  <Descriptions.Item label="维保人员">{detailData.assignedTo}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{detailData.assignedPhone}</Descriptions.Item>
                  <Descriptions.Item label="派单时间">{detailData.assignTime}</Descriptions.Item>
                </>
              )}
              {detailData.arrivalTime && (
                <Descriptions.Item label="到场时间">{detailData.arrivalTime}</Descriptions.Item>
              )}
              {detailData.completeTime && (
                <Descriptions.Item label="维修完成时间">{detailData.completeTime}</Descriptions.Item>
              )}
              {detailData.confirmTime && (
                <Descriptions.Item label="业主确认时间">{detailData.confirmTime}</Descriptions.Item>
              )}
              {detailData.repairResult && (
                <Descriptions.Item label="维修结果" span={2}>{detailData.repairResult}</Descriptions.Item>
              )}
              {detailData.cost !== undefined && (
                <>
                  <Descriptions.Item label="维修费用">{detailData.cost} 元</Descriptions.Item>
                  <Descriptions.Item label="收费类型">{detailData.chargeType === 'free' ? '免费' : '收费'}</Descriptions.Item>
                </>
              )}
              {detailData.rating && (
                <>
                  <Descriptions.Item label="业主评分">
                    <Rate disabled value={detailData.rating} />
                  </Descriptions.Item>
                  <Descriptions.Item label="评价时间">{detailData.evaluateTime}</Descriptions.Item>
                  <Descriptions.Item label="业主评价" span={2}>{detailData.evaluation}</Descriptions.Item>
                </>
              )}
              {detailData.revisitRemark && (
                <>
                  <Descriptions.Item label="回访状态">
                    <Tag color={detailData.revisitStatus === 'completed' ? 'green' : 'orange'}>
                      {detailData.revisitStatus === 'completed' ? '已回访' : '待回访'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="回访记录" span={2}>{detailData.revisitRemark}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 派单弹窗 */}
      <Modal
        title="派单 - 选择维保人员"
        open={assignVisible}
        onCancel={() => setAssignVisible(false)}
        onOk={handleAssignSubmit}
        okText="确认派单"
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="assignedTo"
            label="维保人员"
            rules={[{ required: true, message: '请选择维保人员' }]}
          >
            <Select
              placeholder="请选择维保人员"
              onChange={(_, option: any) => {
                const staff = staffList.find(s => s.name === option?.value);
                if (staff) {
                  assignForm.setFieldValue('assignedPhone', staff.phone);
                }
              }}
              options={staffList.map(s => ({ value: s.name, label: `${s.name} (${s.phone})` }))}
            />
          </Form.Item>
          <Form.Item
            name="assignedPhone"
            label="联系电话"
          >
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>

      {/* 完工弹窗 */}
      <Modal
        title="维修完工确认"
        open={completeVisible}
        onCancel={() => setCompleteVisible(false)}
        onOk={handleCompleteSubmit}
        okText="确认完工"
      >
        <Form form={completeForm} layout="vertical">
          <Form.Item
            name="repairResult"
            label="维修结果"
            rules={[{ required: true, message: '请填写维修结果' }]}
          >
            <Input.TextArea rows={3} placeholder="请描述维修处理结果" />
          </Form.Item>
          <Form.Item
            name="chargeType"
            label="收费类型"
            rules={[{ required: true, message: '请选择收费类型' }]}
          >
            <Select
              options={[
                { value: 'free', label: '免费（质保期内）' },
                { value: 'paid', label: '收费' },
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.chargeType !== cur.chargeType}
          >
            {({ getFieldValue }) =>
              getFieldValue('chargeType') === 'paid' ? (
                <Form.Item
                  name="cost"
                  label="维修费用（元）"
                  rules={[{ required: true, message: '请填写维修费用' }]}
                >
                  <Input type="number" min={0} placeholder="请输入维修费用" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* 回访弹窗 */}
      <Modal
        title="工单回访"
        open={revisitVisible}
        onCancel={() => setRevisitVisible(false)}
        onOk={handleRevisitSubmit}
        okText="确认回访"
      >
        <Form form={revisitForm} layout="vertical">
          <Form.Item
            name="remark"
            label="回访记录"
            rules={[{ required: true, message: '请填写回访记录' }]}
          >
            <Input.TextArea rows={4} placeholder="请填写回访记录，回访完成后工单将归档" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RepairOrderManage;
