import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, Descriptions, message, Popconfirm, Alert } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { getMerchantList, createMerchant, updateMerchant, deleteMerchant, getMerchantCategories } from '../../services/merchantService';
import type { Merchant, AuditStatus } from '../../services/types';

const auditStatusMap: Record<AuditStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
};

const categoryColors: Record<string, string> = {
  '超市': 'blue',
  '餐饮': 'orange',
  '家政': 'green',
  '维修': 'purple',
  '快递': 'cyan',
  '美容': 'pink',
  '教育': 'geekblue',
  '医疗': 'red',
  '其他': 'default',
};

const MerchantManage: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<AuditStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<Merchant | null>(null);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMerchantList({
        keyword: keyword || undefined,
        auditStatus: (filterStatus as AuditStatus) || undefined,
        category: filterCategory || undefined,
      });
      setMerchants(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getMerchantCategories().then(setCategories);
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  const handleAdd = () => {
    setEditingMerchant(null);
    form.resetFields();
    form.setFieldsValue({ category: '其他' });
    setModalVisible(true);
  };

  const handleEdit = (record: Merchant) => {
    setEditingMerchant(record);
    form.setFieldsValue({
      shopName: record.shopName,
      companyName: record.companyName,
      unifiedCode: record.unifiedCode,
      contactPerson: record.contactPerson,
      contactPhone: record.contactPhone,
      category: record.category,
      address: record.address,
      businessLicense: record.businessLicense,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMerchant(id);
      message.success('删除成功');
      fetchData();
    } catch (err: any) {
      message.error(err.message || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editingMerchant) {
        await updateMerchant(editingMerchant.id, values);
        message.success('更新成功');
      } else {
        await createMerchant({
          ...values,
          propertyCompanyId: 1, // 当前物业公司ID，实际应从登录信息获取
          propertyCompanyName: '万科物业有限公司',
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (err: any) {
      if (err.message) {
        message.error(err.message || '操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: '店铺名称',
      dataIndex: 'shopName',
      key: 'shopName',
      width: 180,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '所属公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 180,
    },
    {
      title: '商家类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat: string) => (
        <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>
      ),
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 120,
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 100,
      render: (status: AuditStatus) => (
        <Tag color={auditStatusMap[status].color}>{auditStatusMap[status].label}</Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Merchant) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetailData(record);
              setDetailVisible(true);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该商家？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="商家管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增商家
            </Button>
          </Space>
        }
      >
        {/* 搜索栏 */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索店铺名称/公司名称"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="审核状态"
            value={filterStatus || undefined}
            onChange={v => setFilterStatus(v || '')}
            allowClear
            style={{ width: 120 }}
            options={[
              { label: '待审核', value: 'pending' },
              { label: '已通过', value: 'approved' },
              { label: '已驳回', value: 'rejected' },
            ]}
          />
          <Select
            placeholder="商家类别"
            value={filterCategory || undefined}
            onChange={v => setFilterCategory(v || '')}
            allowClear
            style={{ width: 120 }}
            options={categories.map(c => ({ label: c, value: c }))}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
        </Space>

        <Table
          dataSource={merchants}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingMerchant ? '编辑商家' : '新增商家'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        width={640}
      >
        {!editingMerchant && (
          <Alert
            type="info"
            showIcon
            message="账号说明"
            description="创建商家后，系统将自动生成商家管理端登录账号，默认账号和密码均为填写的联系电话（手机号），请提醒商家首次登录后及时修改密码。"
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="shopName"
            label="店铺名称"
            rules={[{ required: true, message: '请输入店铺名称' }]}
          >
            <Input placeholder="请输入店铺名称" />
          </Form.Item>
          <Form.Item
            name="companyName"
            label="所属公司"
            rules={[{ required: true, message: '请输入所属公司名称' }]}
          >
            <Input placeholder="请输入所属公司名称" />
          </Form.Item>
          <Form.Item
            name="unifiedCode"
            label="统一社会信用代码"
            rules={[{ required: true, message: '请输入统一社会信用代码' }]}
          >
            <Input placeholder="请输入统一社会信用代码" />
          </Form.Item>
          <Form.Item
            name="businessLicense"
            label="营业执照号"
            rules={[{ required: true, message: '请输入营业执照号' }]}
          >
            <Input placeholder="请输入营业执照号" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="category"
              label="商家类别"
              rules={[{ required: true, message: '请选择商家类别' }]}
              style={{ width: 200 }}
            >
              <Select
                placeholder="请选择商家类别"
                options={categories.map(c => ({ label: c, value: c }))}
              />
            </Form.Item>
            <Form.Item
              name="contactPerson"
              label="联系人"
              rules={[{ required: true, message: '请输入联系人' }]}
              style={{ width: 200 }}
            >
              <Input placeholder="请输入联系人" />
            </Form.Item>
          </Space>
          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入联系电话" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="address"
            label="店铺地址"
            rules={[{ required: true, message: '请输入店铺地址' }]}
          >
            <Input.TextArea rows={2} placeholder="请输入店铺地址" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title={`商家详情 - ${detailData?.shopName || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {detailData && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="店铺名称" span={2}>{detailData.shopName}</Descriptions.Item>
            <Descriptions.Item label="所属公司" span={2}>{detailData.companyName}</Descriptions.Item>
            <Descriptions.Item label="统一社会信用代码" span={2}>{detailData.unifiedCode}</Descriptions.Item>
            <Descriptions.Item label="营业执照号" span={2}>{detailData.businessLicense}</Descriptions.Item>
            <Descriptions.Item label="商家类别">{detailData.category}</Descriptions.Item>
            <Descriptions.Item label="所属物业">{detailData.propertyCompanyName || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系人">{detailData.contactPerson}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{detailData.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="店铺地址" span={2}>{detailData.address}</Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag color={auditStatusMap[detailData.auditStatus].color}>
                {auditStatusMap[detailData.auditStatus].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="启用状态">
              <Tag color={detailData.status === 1 ? 'green' : 'red'}>
                {detailData.status === 1 ? '已启用' : '已禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">{detailData.submitTime}</Descriptions.Item>
            <Descriptions.Item label="审核时间">{detailData.auditTime || '-'}</Descriptions.Item>
            {detailData.auditRemark && (
              <Descriptions.Item label="审核意见" span={2}>
                <span style={{ color: detailData.auditStatus === 'rejected' ? '#ff4d4f' : '#52c41a' }}>
                  {detailData.auditRemark}
                </span>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MerchantManage;
