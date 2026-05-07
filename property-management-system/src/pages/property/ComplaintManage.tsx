import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, Descriptions, message, Tabs, Statistic, Row, Col, Rate, Steps, Divider } from 'antd';
import { SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, UserOutlined, PhoneOutlined, FileTextOutlined } from '@ant-design/icons';
import type { Complaint, ComplaintStatus, ComplaintCategory, UrgencyLevel } from '../../services/types';
import { getComplaintList, getComplaintById, acceptComplaint, assignComplaint, processComplaint, feedbackComplaint, revisitComplaint, getComplaintStats, complaintCategoryMap, complaintStatusMap, complaintSourceMap } from '../../services/complaintService';

const ComplaintManage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'all'>('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<Complaint | null>(null);
  const [acceptVisible, setAcceptVisible] = useState(false);
  const [acceptComplaintData, setAcceptComplaintData] = useState<Complaint | null>(null);
  const [assignVisible, setAssignVisible] = useState(false);
  const [assignComplaintData, setAssignComplaintData] = useState<Complaint | null>(null);
  const [processVisible, setProcessVisible] = useState(false);
  const [processComplaintData, setProcessComplaintData] = useState<Complaint | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackComplaintData, setFeedbackComplaintData] = useState<Complaint | null>(null);
  const [revisitVisible, setRevisitVisible] = useState(false);
  const [revisitComplaintData, setRevisitComplaintData] = useState<Complaint | null>(null);
  const [stats, setStats] = useState({ total: 0, pendingAccept: 0, processing: 0, closed: 0, urgentCount: 0, satisfactionAvg: 0, categoryStats: [] as { category: ComplaintCategory; count: number }[] });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [acceptForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [processForm] = Form.useForm();
  const [feedbackForm] = Form.useForm();
  const [revisitForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getComplaintList({
        keyword: keyword || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
      });
      setComplaints(data.list);
      const s = await getComplaintStats();
      setStats({
        total: s.total,
        pendingAccept: s.pendingAccept,
        processing: s.processing,
        closed: s.closed,
        urgentCount: 0,
        satisfactionAvg: 0,
        categoryStats: s.categoryStats.map(c => ({ category: c.category as ComplaintCategory, count: c.count })),
      });
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

  // 查看详情
  const handleViewDetail = async (record: Complaint) => {
    const data = await getComplaintById(record.id);
    if (data) {
      setDetailData(data);
      setDetailVisible(true);
    }
  };

  // 受理
  const handleAccept = (record: Complaint) => {
    setAcceptComplaintData(record);
    acceptForm.resetFields();
    setAcceptVisible(true);
  };

  const handleAcceptSubmit = async () => {
    if (!acceptComplaintData) return;
    try {
      const values = await acceptForm.validateFields();
      await acceptComplaint(acceptComplaintData.id, values.acceptedBy);
      message.success('受理成功');
      setAcceptVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 分派
  const handleAssign = (record: Complaint) => {
    setAssignComplaintData(record);
    assignForm.resetFields();
    setAssignVisible(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignComplaintData) return;
    try {
      const values = await assignForm.validateFields();
      await assignComplaint(assignComplaintData.id, values.assignedTo, values.assignedPhone);
      message.success('分派成功');
      setAssignVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 处理
  const handleProcess = (record: Complaint) => {
    setProcessComplaintData(record);
    processForm.resetFields();
    setProcessVisible(true);
  };

  const handleProcessSubmit = async () => {
    if (!processComplaintData) return;
    try {
      const values = await processForm.validateFields();
      await processComplaint(processComplaintData.id, values.handleResult);
      message.success('处理完成');
      setProcessVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 反馈
  const handleFeedback = (record: Complaint) => {
    setFeedbackComplaintData(record);
    feedbackForm.resetFields();
    setFeedbackVisible(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackComplaintData) return;
    try {
      const values = await feedbackForm.validateFields();
      await feedbackComplaint(feedbackComplaintData.id, values.feedbackContent);
      message.success('反馈成功');
      setFeedbackVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 回访
  const handleRevisit = (record: Complaint) => {
    setRevisitComplaintData(record);
    revisitForm.resetFields();
    setRevisitVisible(true);
  };

  const handleRevisitSubmit = async () => {
    if (!revisitComplaintData) return;
    try {
      const values = await revisitForm.validateFields();
      await revisitComplaint(revisitComplaintData.id, {
        revisitRemark: values.revisitRemark,
        satisfaction: values.satisfaction,
      });
      message.success('回访完成，投诉已归档');
      setRevisitVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  // 状态标签
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

  // 紧急程度标签
  const renderUrgencyTag = (urgency: UrgencyLevel) => {
    const colorMap: Record<UrgencyLevel, string> = {
      normal: 'default',
      urgent: 'orange',
      emergency: 'red',
    };
    return <Tag color={colorMap[urgency]}>{urgency === 'normal' ? '普通' : urgency === 'urgent' ? '紧急' : '特急'}</Tag>;
  };

  // 投诉进度步骤
  const renderSteps = (status: ComplaintStatus) => {
    const statusOrder: ComplaintStatus[] = ['pending_accept', 'accepted', 'assigned', 'processing', 'feedback', 'revisit_pending', 'closed'];
    const current = statusOrder.indexOf(status);
    return (
      <Steps
        size="small"
        current={current}
        style={{ marginBottom: 16 }}
        items={[
          { title: '待受理' },
          { title: '已受理' },
          { title: '已分派' },
          { title: '处理中' },
          { title: '已反馈' },
          { title: '待回访' },
          { title: '已归档' },
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
      width: 180,
      render: (_: any, record: Complaint) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <UserOutlined style={{ fontSize: 12, color: '#999' }} />
            <span>{record.complainant}</span>
          </Space>
          <Space size={4}>
            <PhoneOutlined style={{ fontSize: 12, color: '#999' }} />
            <span style={{ color: '#666' }}>{record.complainantPhone}</span>
          </Space>
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
      width: 100,
      render: (cat: ComplaintCategory) => complaintCategoryMap[cat],
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (src: string) => complaintSourceMap[src as keyof typeof complaintSourceMap] || src,
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
      title: '处理人',
      key: 'handler',
      width: 100,
      render: (_: any, record: Complaint) => record.assignedTo || '-',
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
      width: 320,
      fixed: 'right' as const,
      render: (_: any, record: Complaint) => {
        const actions: React.ReactNode[] = [];
        actions.push(
          <Button key="detail" type="link" size="small" onClick={() => handleViewDetail(record)}>详情</Button>
        );
        if (record.status === 'pending_accept') {
          actions.push(
            <Button key="accept" type="link" size="small" style={{ color: '#1890ff' }} onClick={() => handleAccept(record)}>受理</Button>
          );
        }
        if (record.status === 'accepted') {
          actions.push(
            <Button key="assign" type="link" size="small" style={{ color: '#52c41a' }} onClick={() => handleAssign(record)}>分派</Button>
          );
        }
        if (record.status === 'assigned') {
          actions.push(
            <Button key="process" type="link" size="small" style={{ color: '#fa8c16' }} onClick={() => handleProcess(record)}>处理</Button>
          );
        }
        if (record.status === 'processing') {
          actions.push(
            <Button key="feedback" type="link" size="small" style={{ color: '#722ed1' }} onClick={() => handleFeedback(record)}>反馈</Button>
          );
        }
        if (record.status === 'feedback' || record.status === 'revisit_pending') {
          actions.push(
            <Button key="revisit" type="link" size="small" style={{ color: '#13c2c2' }} onClick={() => handleRevisit(record)}>回访</Button>
          );
        }
        return <Space size={0}>{actions}</Space>;
      },
    },
  ];

  const getFilteredOrders = () => {
    if (activeTab === 'all') return complaints;
    if (activeTab === 'pending_accept') return complaints.filter(c => c.status === 'pending_accept');
    if (activeTab === 'processing') return complaints.filter(c => ['accepted', 'assigned', 'processing', 'feedback', 'revisit_pending'].includes(c.status));
    if (activeTab === 'closed') return complaints.filter(c => c.status === 'closed');
    return complaints;
  };

  const tabItems = [
    { key: 'all', label: `全部 (${stats.total})` },
    { key: 'pending_accept', label: `待受理 (${stats.pendingAccept})` },
    { key: 'processing', label: `处理中 (${stats.processing})` },
    { key: 'closed', label: `已归档 (${stats.closed})` },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small"><Statistic title="总投诉" value={stats.total} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="待受理" value={stats.pendingAccept} valueStyle={{ color: stats.pendingAccept > 0 ? '#fa8c16' : undefined }} prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="处理中" value={stats.processing} valueStyle={{ color: '#1890ff' }} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="已归档" value={stats.closed} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card size="small"><Statistic title="紧急待办" value={stats.urgentCount} valueStyle={{ color: stats.urgentCount > 0 ? '#ff4d4f' : undefined }} prefix={<ExclamationCircleOutlined />} /></Card>
        </Col>
        <Col span={4}>
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
                <>
                  <Descriptions.Item label="受理人">{detailData.acceptedBy}</Descriptions.Item>
                  <Descriptions.Item label="受理时间">{detailData.acceptTime}</Descriptions.Item>
                </>
              )}
              {detailData.assignedTo && (
                <>
                  <Descriptions.Item label="处理人">{detailData.assignedTo}</Descriptions.Item>
                  <Descriptions.Item label="处理人电话">{detailData.assignedToPhone}</Descriptions.Item>
                  <Descriptions.Item label="分派时间">{detailData.assignTime}</Descriptions.Item>
                </>
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
                  <Descriptions.Item label="截止日期">{detailData.governmentDeadline}</Descriptions.Item>
                  <Descriptions.Item label="督办意见" span={2}>{detailData.governmentRemark}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 受理弹窗 */}
      <Modal title="受理投诉" open={acceptVisible} onCancel={() => setAcceptVisible(false)} onOk={handleAcceptSubmit} okText="确认受理">
        <Form form={acceptForm} layout="vertical">
          <Form.Item name="acceptedBy" label="受理人" rules={[{ required: true, message: '请填写受理人' }]}>
            <Input placeholder="请输入受理人姓名" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 分派弹窗 */}
      <Modal title="分派投诉" open={assignVisible} onCancel={() => setAssignVisible(false)} onOk={handleAssignSubmit} okText="确认分派">
        <Form form={assignForm} layout="vertical">
          <Form.Item name="assignedTo" label="处理人" rules={[{ required: true, message: '请填写处理人' }]}>
            <Input placeholder="请输入处理人姓名" />
          </Form.Item>
          <Form.Item name="assignedPhone" label="联系电话" rules={[{ required: true, message: '请填写联系电话' }]}>
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 处理弹窗 */}
      <Modal title="填写处理结果" open={processVisible} onCancel={() => setProcessVisible(false)} onOk={handleProcessSubmit} okText="确认处理">
        <Form form={processForm} layout="vertical">
          <Form.Item name="handleResult" label="处理结果" rules={[{ required: true, message: '请填写处理结果' }]}>
            <Input.TextArea rows={4} placeholder="请详细描述投诉处理过程和结果" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 反馈弹窗 */}
      <Modal title="反馈处理结果" open={feedbackVisible} onCancel={() => setFeedbackVisible(false)} onOk={handleFeedbackSubmit} okText="确认反馈">
        <Form form={feedbackForm} layout="vertical">
          <Form.Item name="feedbackContent" label="反馈内容" rules={[{ required: true, message: '请填写反馈内容' }]}>
            <Input.TextArea rows={4} placeholder="请填写向投诉人反馈的内容" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 回访弹窗 */}
      <Modal title="投诉回访" open={revisitVisible} onCancel={() => setRevisitVisible(false)} onOk={handleRevisitSubmit} okText="确认回访">
        <Form form={revisitForm} layout="vertical">
          <Form.Item name="satisfaction" label="满意度评分" rules={[{ required: true, message: '请评分' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="revisitRemark" label="回访记录" rules={[{ required: true, message: '请填写回访记录' }]}>
            <Input.TextArea rows={4} placeholder="请填写回访记录，完成后投诉将归档" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplaintManage;
