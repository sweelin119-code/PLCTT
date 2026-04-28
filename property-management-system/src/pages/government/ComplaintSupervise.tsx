import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, Descriptions, message, Tabs, Statistic, Row, Col, Rate, Steps, Divider, DatePicker } from 'antd';
import { SearchOutlined, ExclamationCircleOutlined, ClockCircleOutlined, CheckCircleOutlined, FileTextOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import type { Complaint, ComplaintStatus, ComplaintCategory, UrgencyLevel } from '../../services/types';
import { getComplaintList, getComplaintById, superviseComplaint, getComplaintStats, complaintCategoryMap, complaintStatusMap, complaintSourceMap } from '../../services/complaintService';

const ComplaintSupervise: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<Complaint | null>(null);
  const [superviseVisible, setSuperviseVisible] = useState(false);
  const [superviseData, setSuperviseData] = useState<Complaint | null>(null);
  const [stats, setStats] = useState({ total: 0, pendingAccept: 0, processing: 0, closed: 0, urgentCount: 0, satisfactionAvg: 0, categoryStats: [] as { category: ComplaintCategory; count: number }[] });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [superviseForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getComplaintList({
        keyword: keyword || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
      });
      setComplaints(data);
      const s = await getComplaintStats();
      setStats(s);
    } catch (err) {
      message.error('获取投诉列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterCategory]);

  const handleSearch = () => fetchData();

  const handleViewDetail = async (record: Complaint) => {
    const data = await getComplaintById(record.id);
    if (data) {
      setDetailData(data);
      setDetailVisible(true);
    }
  };

  // 督办
  const handleSupervise = (record: Complaint) => {
    setSuperviseData(record);
    superviseForm.resetFields();
    setSuperviseVisible(true);
  };

  const handleSuperviseSubmit = async () => {
    if (!superviseData) return;
    try {
      const values = await superviseForm.validateFields();
      await superviseComplaint(superviseData.id, {
        supervisor: values.supervisor,
        remark: values.remark,
        deadline: values.deadline.format('YYYY-MM-DD'),
      });
      message.success('督办成功');
      setSuperviseVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const renderStatusTag = (status: ComplaintStatus) => {
    const colorMap: Record<ComplaintStatus, string> = {
      pending_accept: 'orange',
      accepted: 'blue',
      assigned: 'cyan',
      processing: 'processing',
      feedback: 'purple',
      revisit_pending: 'geekblue',
      closed: 'default',
    };
    return <Tag color={colorMap[status]}>{complaintStatusMap[status]}</Tag>;
  };

  const renderUrgencyTag = (urgency: UrgencyLevel) => {
    const colorMap: Record<UrgencyLevel, string> = {
      normal: 'default',
      urgent: 'orange',
      emergency: 'red',
    };
    return <Tag color={colorMap[urgency]}>{urgency === 'normal' ? '普通' : urgency === 'urgent' ? '紧急' : '特急'}</Tag>;
  };

  const renderSteps = (status: ComplaintStatus) => {
    const statusOrder: ComplaintStatus[] = ['pending_accept', 'accepted', 'assigned', 'processing', 'feedback', 'revisit_pending', 'closed'];
    const current = statusOrder.indexOf(status);
    return (
      <Steps size="small" current={current} style={{ marginBottom: 16 }}
        items={[
          { title: '待受理' }, { title: '已受理' }, { title: '已分派' },
          { title: '处理中' }, { title: '已反馈' }, { title: '待回访' }, { title: '已归档' },
        ]}
      />
    );
  };

  const columns = [
    {
      title: '投诉编号',
      dataIndex: 'complaintNo',
      key: 'complaintNo',
      width: 150,
      render: (no: string, record: Complaint) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>{no}</Button>
      ),
    },
    {
      title: '投诉人',
      key: 'complainant',
      width: 160,
      render: (_: any, record: Complaint) => (
        <Space direction="vertical" size={2}>
          <Space size={4}><UserOutlined style={{ fontSize: 12, color: '#999' }} /><span>{record.complainant}</span></Space>
          <Space size={4}><PhoneOutlined style={{ fontSize: 12, color: '#999' }} /><span style={{ color: '#666' }}>{record.complainantPhone}</span></Space>
        </Space>
      ),
    },
    {
      title: '投诉标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 90,
      render: (cat: ComplaintCategory) => complaintCategoryMap[cat],
    },
    {
      title: '紧急',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 70,
      render: (urgency: UrgencyLevel) => renderUrgencyTag(urgency),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: ComplaintStatus) => renderStatusTag(status),
    },
    {
      title: '物业公司',
      dataIndex: 'propertyCompanyName',
      key: 'propertyCompanyName',
      width: 120,
    },
    {
      title: '处理人',
      key: 'handler',
      width: 90,
      render: (_: any, record: Complaint) => record.assignedTo || '-',
    },
    {
      title: '督办信息',
      key: 'supervise',
      width: 120,
      render: (_: any, record: Complaint) => (
        record.governmentSupervisor ? (
          <Tag color="red">已督办</Tag>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      ),
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
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Complaint) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>详情</Button>
          {record.status !== 'closed' && (
            <Button type="link" size="small" style={{ color: '#ff4d4f' }} onClick={() => handleSupervise(record)}>
              {record.governmentSupervisor ? '重新督办' : '督办'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getFilteredOrders = () => {
    if (activeTab === 'all') return complaints;
    if (activeTab === 'urgent') return complaints.filter(c => ['urgent', 'emergency'].includes(c.urgency) && c.status !== 'closed');
    if (activeTab === 'supervised') return complaints.filter(c => c.governmentSupervisor);
    if (activeTab === 'closed') return complaints.filter(c => c.status === 'closed');
    return complaints;
  };

  const tabItems = [
    { key: 'all', label: `全部 (${stats.total})` },
    { key: 'urgent', label: `紧急待办 (${stats.urgentCount})` },
    { key: 'supervised', label: `已督办` },
    { key: 'closed', label: `已归档 (${stats.closed})` },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small"><Statistic title="总投诉" value={stats.total} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col span={5}>
          <Card size="small"><Statistic title="待受理/处理中" value={stats.pendingAccept + stats.processing} valueStyle={{ color: '#fa8c16' }} prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col span={5}>
          <Card size="small"><Statistic title="紧急待办" value={stats.urgentCount} valueStyle={{ color: stats.urgentCount > 0 ? '#ff4d4f' : undefined }} prefix={<ExclamationCircleOutlined />} /></Card>
        </Col>
        <Col span={5}>
          <Card size="small"><Statistic title="已归档" value={stats.closed} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card>
        </Col>
        <Col span={5}>
          <Card size="small"><Statistic title="满意度" value={stats.satisfactionAvg} precision={1} suffix="/ 5" prefix={<Rate disabled value={stats.satisfactionAvg} style={{ fontSize: 14 }} />} /></Card>
        </Col>
      </Row>

      {/* 搜索 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索投诉编号/投诉人/电话/标题"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={filterCategory}
            onChange={v => setFilterCategory(v)}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部分类' },
              ...Object.entries(complaintCategoryMap).map(([k, v]) => ({ value: k, label: v })),
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
        </Space>
      </Card>

      {/* 投诉列表 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        <Table
          dataSource={getFilteredOrders()}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
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
        title={`投诉详情 - ${detailData?.complaintNo}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {detailData && (
          <div>
            {renderSteps(detailData.status)}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="投诉编号" span={2}>{detailData.complaintNo}</Descriptions.Item>
              <Descriptions.Item label="投诉人">{detailData.complainant}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{detailData.complainantPhone}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{detailData.complainantAddress}</Descriptions.Item>
              <Descriptions.Item label="投诉分类">{complaintCategoryMap[detailData.category]}</Descriptions.Item>
              <Descriptions.Item label="来源">{complaintSourceMap[detailData.source]}</Descriptions.Item>
              <Descriptions.Item label="紧急程度">{renderUrgencyTag(detailData.urgency)}</Descriptions.Item>
              <Descriptions.Item label="当前状态">{renderStatusTag(detailData.status)}</Descriptions.Item>
              <Descriptions.Item label="投诉标题" span={2}>{detailData.title}</Descriptions.Item>
              <Descriptions.Item label="投诉内容" span={2}>{detailData.content}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{detailData.createTime}</Descriptions.Item>
              <Descriptions.Item label="所属物业">{detailData.propertyCompanyName}</Descriptions.Item>
              {detailData.acceptedBy && (
                <><Descriptions.Item label="受理人">{detailData.acceptedBy}</Descriptions.Item><Descriptions.Item label="受理时间">{detailData.acceptTime}</Descriptions.Item></>
              )}
              {detailData.assignedTo && (
                <><Descriptions.Item label="处理人">{detailData.assignedTo}</Descriptions.Item><Descriptions.Item label="处理人电话">{detailData.assignedToPhone}</Descriptions.Item><Descriptions.Item label="分派时间">{detailData.assignTime}</Descriptions.Item></>
              )}
              {detailData.handleResult && (
                <Descriptions.Item label="处理结果" span={2}>{detailData.handleResult}</Descriptions.Item>
              )}
              {detailData.feedbackContent && (
                <Descriptions.Item label="反馈内容" span={2}>{detailData.feedbackContent}</Descriptions.Item>
              )}
              {detailData.revisitRemark && (
                <>
                  <Descriptions.Item label="回访状态">
                    <Tag color={detailData.revisitStatus === 'completed' ? 'green' : 'orange'}>
                      {detailData.revisitStatus === 'completed' ? '已回访' : '待回访'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="满意度">
                    {detailData.satisfaction ? <Rate disabled value={detailData.satisfaction} /> : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="回访记录" span={2}>{detailData.revisitRemark}</Descriptions.Item>
                </>
              )}
              {detailData.governmentSupervisor && (
                <>
                  <Divider>政府督办信息</Divider>
                  <Descriptions.Item label="督办人">{detailData.governmentSupervisor}</Descriptions.Item>
                  <Descriptions.Item label="截止日期">
                    <Tag color={new Date(detailData.governmentDeadline!) < new Date() ? 'red' : 'blue'}>
                      {detailData.governmentDeadline}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="督办意见" span={2}>{detailData.governmentRemark}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 督办弹窗 */}
      <Modal
        title="投诉督办"
        open={superviseVisible}
        onCancel={() => setSuperviseVisible(false)}
        onOk={handleSuperviseSubmit}
        okText="确认督办"
        width={600}
      >
        <Form form={superviseForm} layout="vertical">
          <Form.Item name="supervisor" label="督办人" rules={[{ required: true, message: '请填写督办人' }]}>
            <Input placeholder="请输入督办人姓名" />
          </Form.Item>
          <Form.Item name="deadline" label="督办截止日期" rules={[{ required: true, message: '请选择截止日期' }]}>
            <DatePicker style={{ width: '100%' }} placeholder="请选择截止日期" />
          </Form.Item>
          <Form.Item name="remark" label="督办意见" rules={[{ required: true, message: '请填写督办意见' }]}>
            <Input.TextArea rows={4} placeholder="请填写督办意见和要求" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplaintSupervise;
