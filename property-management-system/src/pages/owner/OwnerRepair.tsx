import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Space, Modal, Form, Input, Select, message, Rate, Steps, Empty, Descriptions, Divider } from 'antd';
import { PlusOutlined, ToolOutlined, ClockCircleOutlined, PhoneOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import type { RepairOrder, UrgencyLevel } from '../../services/types';
import { getRepairOrderList, getRepairOrderById, createRepairOrder, evaluateRepair, repairTypeMap, urgencyMap, repairStatusMap } from '../../services/repairService';

const OwnerRepair: React.FC = () => {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [submitVisible, setSubmitVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<RepairOrder | null>(null);
  const [evaluateVisible, setEvaluateVisible] = useState(false);
  const [evaluateOrder, setEvaluateOrder] = useState<RepairOrder | null>(null);
  const [submitForm] = Form.useForm();
  const [evaluateForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRepairOrderList();
      setOrders(data);
    } catch (err) {
      message.error('获取报修记录失败');
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
      await createRepairOrder({
        ...values,
        propertyCompanyId: 1,
        propertyCompanyName: '万科物业',
      });
      message.success('报修提交成功，请等待派单');
      setSubmitVisible(false);
      submitForm.resetFields();
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const handleViewDetail = async (record: RepairOrder) => {
    const data = await getRepairOrderById(record.id);
    if (data) {
      setDetailData(data);
      setDetailVisible(true);
    }
  };

  const handleEvaluate = (record: RepairOrder) => {
    setEvaluateOrder(record);
    evaluateForm.resetFields();
    setEvaluateVisible(true);
  };

  const handleEvaluateSubmit = async () => {
    if (!evaluateOrder) return;
    try {
      const values = await evaluateForm.validateFields();
      await evaluateRepair(evaluateOrder.id, {
        rating: values.rating,
        evaluation: values.evaluation,
      });
      message.success('评价成功，感谢您的反馈！');
      setEvaluateVisible(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'active') return orders.filter(o => !['completed', 'confirmed', 'evaluated', 'closed'].includes(o.status));
    if (activeTab === 'completed') return orders.filter(o => ['completed', 'confirmed', 'evaluated', 'closed'].includes(o.status));
    return orders;
  };

  const renderStatusTag = (status: string) => {
    const colorMap: Record<string, string> = {
      pending_assign: 'orange',
      assigned: 'blue',
      on_the_way: 'cyan',
      in_progress: 'processing',
      completed: 'green',
      confirmed: 'lime',
      evaluated: 'purple',
      closed: 'default',
    };
    return <Tag color={colorMap[status] || 'default'}>{repairStatusMap[status as keyof typeof repairStatusMap] || status}</Tag>;
  };

  const renderUrgencyTag = (urgency: UrgencyLevel) => {
    const colorMap: Record<UrgencyLevel, string> = {
      normal: 'default',
      urgent: 'orange',
      emergency: 'red',
    };
    return <Tag color={colorMap[urgency]}>{urgencyMap[urgency]}</Tag>;
  };

  const getStepCurrent = (status: string) => {
    const order = ['pending_assign', 'assigned', 'on_the_way', 'in_progress', 'completed', 'confirmed', 'evaluated', 'closed'];
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
            进行中
          </Button>
          <Button
            type={activeTab === 'completed' ? 'primary' : 'default'}
            size="small"
            onClick={() => setActiveTab('completed')}
          >
            已完成
          </Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setSubmitVisible(true)}>
          我要报修
        </Button>
      </div>

      {/* 报修列表 */}
      <List
        loading={loading}
        dataSource={getFilteredOrders()}
        locale={{ emptyText: <Empty description="暂无报修记录" /> }}
        renderItem={(item) => (
          <Card
            size="small"
            style={{ marginBottom: 8, borderRadius: 8 }}
            onClick={() => handleViewDetail(item)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{item.repairDesc}</div>
              {renderStatusTag(item.status)}
            </div>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Space size={6}>
                <EnvironmentOutlined style={{ fontSize: 12, color: '#999' }} />
                <span style={{ fontSize: 12, color: '#666' }}>{item.ownerAddress}</span>
              </Space>
              <Space size={6}>
                <ToolOutlined style={{ fontSize: 12, color: '#999' }} />
                <span style={{ fontSize: 12, color: '#666' }}>{repairTypeMap[item.repairType]}</span>
                {renderUrgencyTag(item.urgency)}
              </Space>
              <Space size={6}>
                <ClockCircleOutlined style={{ fontSize: 12, color: '#999' }} />
                <span style={{ fontSize: 12, color: '#999' }}>{item.createTime}</span>
              </Space>
            </Space>
            {item.status === 'completed' && (
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <Button type="primary" size="small" onClick={(e) => { e.stopPropagation(); handleEvaluate(item); }}>
                  评价
                </Button>
              </div>
            )}
          </Card>
        )}
      />

      {/* 提交报修弹窗 */}
      <Modal
        title="在线报修"
        open={submitVisible}
        onCancel={() => setSubmitVisible(false)}
        onOk={handleSubmit}
        okText="提交报修"
        destroyOnClose
      >
        <Form form={submitForm} layout="vertical" autoComplete="off">
          <Form.Item name="ownerName" label="业主姓名" rules={[{ required: true, message: '请输入业主姓名' }]}>
            <Input placeholder="请输入您的姓名" />
          </Form.Item>
          <Form.Item name="ownerPhone" label="联系电话" rules={[
            { required: true, message: '请输入联系电话' },
            { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
          ]}>
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item name="ownerAddress" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input placeholder="如：1栋1单元101" />
          </Form.Item>
          <Form.Item name="repairType" label="报修类型" rules={[{ required: true, message: '请选择报修类型' }]}>
            <Select placeholder="请选择报修类型"
              options={Object.entries(repairTypeMap).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
          <Form.Item name="urgency" label="紧急程度" rules={[{ required: true, message: '请选择紧急程度' }]} initialValue="normal">
            <Select
              options={[
                { value: 'normal', label: '普通 - 非紧急问题' },
                { value: 'urgent', label: '紧急 - 影响正常生活' },
                { value: 'emergency', label: '特急 - 存在安全隐患' },
              ]}
            />
          </Form.Item>
          <Form.Item name="repairDesc" label="问题描述" rules={[{ required: true, message: '请描述问题' }]}>
            <Input.TextArea rows={3} placeholder="请详细描述您遇到的问题" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="报修详情"
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
                { title: '提交报修', description: detailData.createTime },
                { title: '待派单', description: detailData.status === 'pending_assign' ? '等待物业派单中...' : detailData.assignTime },
                { title: '已派单', description: detailData.assignedTo ? `维修人员：${detailData.assignedTo} ${detailData.assignedPhone}` : undefined },
                { title: '维修中', description: detailData.arrivalTime || undefined },
                { title: '已完成', description: detailData.completeTime || undefined },
                { title: '已评价', description: detailData.evaluateTime || undefined },
              ]}
            />
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="工单编号">{detailData.orderNo}</Descriptions.Item>
              <Descriptions.Item label="报修类型">{repairTypeMap[detailData.repairType]}</Descriptions.Item>
              <Descriptions.Item label="紧急程度">{renderUrgencyTag(detailData.urgency)}</Descriptions.Item>
              <Descriptions.Item label="问题描述">{detailData.repairDesc}</Descriptions.Item>
              {detailData.assignedTo && (
                <Descriptions.Item label="维修人员">
                  <Space>
                    <UserOutlined />
                    {detailData.assignedTo}
                    <PhoneOutlined />
                    {detailData.assignedPhone}
                  </Space>
                </Descriptions.Item>
              )}
              {detailData.repairResult && (
                <Descriptions.Item label="维修结果">{detailData.repairResult}</Descriptions.Item>
              )}
              {detailData.cost !== undefined && detailData.cost > 0 && (
                <Descriptions.Item label="维修费用">{detailData.cost} 元</Descriptions.Item>
              )}
              {detailData.rating && (
                <Descriptions.Item label="我的评价">
                  <Rate disabled value={detailData.rating} />
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>{detailData.evaluation}</div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 评价弹窗 */}
      <Modal
        title="维修评价"
        open={evaluateVisible}
        onCancel={() => setEvaluateVisible(false)}
        onOk={handleEvaluateSubmit}
        okText="提交评价"
        destroyOnClose
      >
        <Form form={evaluateForm} layout="vertical">
          <Form.Item name="rating" label="评分" rules={[{ required: true, message: '请评分' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="evaluation" label="评价内容" rules={[{ required: true, message: '请填写评价' }]}>
            <Input.TextArea rows={3} placeholder="请描述您的维修体验" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OwnerRepair;
