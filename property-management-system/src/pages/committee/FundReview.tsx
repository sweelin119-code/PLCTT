import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Descriptions, Space, Typography,
  Form, Input, Radio, Divider, Statistic, Row, Col, message, Popconfirm,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EditOutlined,
  FileTextOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  getFundApplications, reviewFundApplication,
  MaintenanceFundApplication,
} from '../../services/committeeService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  pending_review: { color: 'processing', label: '待审核' },
  approved: { color: 'success', label: '已通过' },
  rejected: { color: 'error', label: '已驳回' },
  supplement: { color: 'warning', label: '需补充' },
};

const urgencyConfig: Record<string, { color: string; label: string }> = {
  normal: { color: 'default', label: '普通' },
  urgent: { color: 'red', label: '紧急' },
};

const FundReview: React.FC = () => {
  const [applications, setApplications] = useState<MaintenanceFundApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [currentApp, setCurrentApp] = useState<MaintenanceFundApplication | null>(null);
  const [reviewForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getFundApplications();
      setApplications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReview = (record: MaintenanceFundApplication) => {
    setCurrentApp(record);
    setReviewVisible(true);
    reviewForm.resetFields();
  };

  const handleReviewSubmit = async () => {
    if (!currentApp) return;
    try {
      const values = await reviewForm.validateFields();
      await reviewFundApplication(currentApp.id, values.status, values.comment);
      message.success('审核完成');
      setReviewVisible(false);
      fetchData();
    } catch (err) {
      // validation failed
    }
  };

  const showDetail = (record: MaintenanceFundApplication) => {
    setCurrentApp(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '申请编号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string) => <Text copyable>{id}</Text>,
    },
    {
      title: '申请事项',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      key: 'budgetAmount',
      width: 120,
      render: (val: number) => `¥${val.toLocaleString()}`,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 90,
      render: (val: string) => <Tag color={urgencyConfig[val]?.color}>{urgencyConfig[val]?.label}</Tag>,
    },
    {
      title: '提交人',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      width: 150,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: string) => <Tag color={statusConfig[val]?.color}>{statusConfig[val]?.label}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: MaintenanceFundApplication) => (
        <Space>
          <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => showDetail(record)}>
            详情
          </Button>
          {record.status === 'pending_review' && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleReview(record)}>
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>维修资金审核</Title>

      <Card>
        <Table
          dataSource={applications}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 详情 Modal */}
      <Modal
        title="申请详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {currentApp && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="申请事项" span={2}>{currentApp.title}</Descriptions.Item>
              <Descriptions.Item label="紧急程度" span={1}>
                <Tag color={urgencyConfig[currentApp.urgency]?.color}>{urgencyConfig[currentApp.urgency]?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="预算金额" span={1}>¥{currentApp.budgetAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="申请描述" span={2}>{currentApp.description}</Descriptions.Item>
              <Descriptions.Item label="施工方案" span={2}>{currentApp.constructionPlan}</Descriptions.Item>
              <Descriptions.Item label="业主意见" span={2}>{currentApp.ownerOpinionResult}</Descriptions.Item>
              <Descriptions.Item label="提交人" span={1}>{currentApp.submittedBy}</Descriptions.Item>
              <Descriptions.Item label="提交时间" span={1}>{currentApp.submittedAt}</Descriptions.Item>
              {currentApp.reviewedBy && (
                <>
                  <Descriptions.Item label="审核人" span={1}>{currentApp.reviewedBy}</Descriptions.Item>
                  <Descriptions.Item label="审核时间" span={1}>{currentApp.reviewedAt}</Descriptions.Item>
                </>
              )}
              {currentApp.reviewComment && (
                <Descriptions.Item label="审核意见" span={2}>{currentApp.reviewComment}</Descriptions.Item>
              )}
            </Descriptions>

            <Divider>报价对比</Divider>
            <Table
              dataSource={currentApp.quotations}
              columns={[
                { title: '公司名称', dataIndex: 'companyName', key: 'companyName' },
                { title: '报价金额', dataIndex: 'amount', key: 'amount', render: (val: number) => `¥${val.toLocaleString()}` },
                { title: '联系人', dataIndex: 'contact', key: 'contact' },
                { title: '联系电话', dataIndex: 'phone', key: 'phone' },
              ]}
              rowKey="companyName"
              pagination={false}
              size="small"
            />
          </>
        )}
      </Modal>

      {/* 审核 Modal */}
      <Modal
        title="维修资金审核"
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        onOk={handleReviewSubmit}
        okText="提交审核"
        width={600}
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item name="status" label="审核结果" rules={[{ required: true, message: '请选择审核结果' }]}>
            <Radio.Group>
              <Radio value="approved" style={{ color: '#52c41a' }}><CheckCircleOutlined /> 通过</Radio>
              <Radio value="rejected" style={{ color: '#ff4d4f' }}><CloseCircleOutlined /> 驳回</Radio>
              <Radio value="supplement" style={{ color: '#faad14' }}><EditOutlined /> 需补充材料</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="comment" label="审核意见" rules={[{ required: true, message: '请输入审核意见' }]}>
            <TextArea rows={4} placeholder="请输入审核意见..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FundReview;
