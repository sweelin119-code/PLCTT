import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Space, Modal, Form, Input, Select, message, Rate, Steps, Empty, Descriptions, Divider } from 'antd';
import { PlusOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Complaint } from '../../services/types';
import { getComplaintList, getComplaintById, createComplaint, complaintCategoryMap, complaintStatusMap } from '../../services/complaintService';

const OwnerComplaint: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed'>('all');
  const [submitVisible, setSubmitVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<Complaint | null>(null);
  const [submitForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getComplaintList();
      setComplaints(result.list);
    } catch (err) {
      message.error('获取投诉记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await submitForm.validateFields();
      await createComplaint({
        ...values,
        source: 'owner_app',
        propertyCompanyId: 1,
        propertyCompanyName: '万科物业',
      });
      message.success('投诉提交成功，请等待物业处理');
      setSubmitVisible(false);
      submitForm.resetFields();
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleViewDetail = async (record: Complaint) => {
    const data = await getComplaintById(record.id);
    if (data) {
      setDetailData(data);
      setDetailVisible(true);
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') return complaints;
    if (activeTab === 'active') return complaints.filter(c => c.status !== 'closed');
    if (activeTab === 'closed') return complaints.filter(c => c.status === 'closed');
    return complaints;
  };

  const renderStatusTag = (status: string) => {
    const colorMap: Record<string, string> = {
      pending_accept: 'orange',
      accepted: 'blue',
      assigned: 'cyan',
      processing: 'processing',
      feedback: 'purple',
      revisit_pending: 'geekblue',
      closed: 'default',
    };
    return <Tag color={colorMap[status] || 'default'}>{complaintStatusMap[status as keyof typeof complaintStatusMap] || status}</Tag>;
  };

  const getStepCurrent = (status: string) => {
    const order = ['pending_accept', 'accepted', 'assigned', 'processing', 'feedback', 'revisit_pending', 'closed'];
    return order.indexOf(status);
  };

  return (
    <div style={{ padding: 12 }}>
      {/* 顶部操作栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Space>
          <Button
            type={activeTab === 'all' ? 'primary' : 'default'}
            size="small"
            onClick={() => setActiveTab('all')}
          >
            全部
          </Button>
          <Button
            type={activeTab === 'active' ? 'primary' : 'default'}
            size="small"
            onClick={() => setActiveTab('active')}
          >
            处理中
          </Button>
          <Button
            type={activeTab === 'closed' ? 'primary' : 'default'}
            size="small"
            onClick={() => setActiveTab('closed')}
          >
            已归档
          </Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setSubmitVisible(true)}>
          投诉建议
        </Button>
      </div>

      {/* 投诉列表 */}
      <List
        loading={loading}
        dataSource={getFilteredOrders()}
        locale={{ emptyText: <Empty description="暂无投诉记录" /> }}
        renderItem={(item) => (
          <Card
            size="small"
            style={{ marginBottom: 8, borderRadius: 8 }}
            onClick={() => handleViewDetail(item)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{item.title}</div>
              {renderStatusTag(item.status)}
            </div>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.content}
              </div>
              <Space size={6}>
                <FileTextOutlined style={{ fontSize: 12, color: '#999' }} />
                <span style={{ fontSize: 12, color: '#999' }}>{complaintCategoryMap[item.category]}</span>
                <ClockCircleOutlined style={{ fontSize: 12, color: '#999' }} />
                <span style={{ fontSize: 12, color: '#999' }}>{item.createTime}</span>
              </Space>
            </Space>
            {item.status === 'feedback' && (
              <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', borderRadius: 4, fontSize: 12, color: '#52c41a' }}>
                物业已反馈处理结果，请查看
              </div>
            )}
          </Card>
        )}
      />

      {/* 提交投诉弹窗 */}
      <Modal
        title="提交投诉建议"
        open={submitVisible}
        onCancel={() => setSubmitVisible(false)}
        onOk={handleSubmit}
        okText="提交"
        destroyOnClose
      >
        <Form form={submitForm} layout="vertical" autoComplete="off">
          <Form.Item name="complainant" label="您的姓名" rules={[{ required: true, message: '请输入您的姓名' }]}>
            <Input placeholder="请输入您的姓名" />
          </Form.Item>
          <Form.Item name="complainantPhone" label="联系电话" rules={[
            { required: true, message: '请输入联系电话' },
            { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
          ]}>
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item name="complainantAddress" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input placeholder="如：1栋1单元101" />
          </Form.Item>
          <Form.Item name="category" label="投诉分类" rules={[{ required: true, message: '请选择投诉分类' }]}>
            <Select placeholder="请选择投诉分类"
              options={Object.entries(complaintCategoryMap).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
          <Form.Item name="urgency" label="紧急程度" rules={[{ required: true, message: '请选择紧急程度' }]} initialValue="normal">
            <Select
              options={[
                { value: 'normal', label: '普通' },
                { value: 'urgent', label: '紧急' },
                { value: 'emergency', label: '特急' },
              ]}
            />
          </Form.Item>
          <Form.Item name="title" label="投诉标题" rules={[{ required: true, message: '请输入投诉标题' }]}>
            <Input placeholder="请简要描述投诉事项" />
          </Form.Item>
          <Form.Item name="content" label="投诉内容" rules={[{ required: true, message: '请详细描述投诉内容' }]}>
            <Input.TextArea rows={4} placeholder="请详细描述您要投诉或建议的内容" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="投诉详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        destroyOnClose
      >
        {detailData && (
          <div>
            <Steps
              size="small"
              current={getStepCurrent(detailData.status)}
              direction="vertical"
              items={[
                { title: '提交投诉', description: detailData.createTime },
                { title: '待受理', description: detailData.status === 'pending_accept' ? '等待物业受理...' : detailData.acceptTime },
                { title: '处理中', description: detailData.assignedTo ? `处理人：${detailData.assignedTo}` : undefined },
                { title: '已反馈', description: detailData.feedbackTime || undefined },
                { title: '已归档', description: detailData.closeTime || undefined },
              ]}
            />
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="投诉编号">{detailData.complaintNo}</Descriptions.Item>
              <Descriptions.Item label="投诉分类">{complaintCategoryMap[detailData.category]}</Descriptions.Item>
              <Descriptions.Item label="投诉标题">{detailData.title}</Descriptions.Item>
              <Descriptions.Item label="投诉内容">{detailData.content}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{detailData.createTime}</Descriptions.Item>
              {detailData.acceptedBy && (
                <Descriptions.Item label="受理人">{detailData.acceptedBy}</Descriptions.Item>
              )}
              {detailData.handleResult && (
                <Descriptions.Item label="处理结果">{detailData.handleResult}</Descriptions.Item>
              )}
              {detailData.feedbackContent && (
                <Descriptions.Item label="物业反馈">{detailData.feedbackContent}</Descriptions.Item>
              )}
              {detailData.satisfaction && (
                <Descriptions.Item label="满意度">
                  <Rate disabled value={detailData.satisfaction} />
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OwnerComplaint;
