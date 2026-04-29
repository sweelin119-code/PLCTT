import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Modal, Form, Input, Select,
  message, Typography, Row, Col, Popconfirm, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Category } from '../../services/portalTypes';
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '../../services/portalService';

const { Title } = Typography;

const InfoCategoryManage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [typeFilter, setTypeFilter] = useState<'policy' | 'rule'>('policy');
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCategoryList(typeFilter);
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  // 打开新增/编辑弹窗
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue(category);
    } else {
      setEditingCategory(null);
      form.resetFields();
      form.setFieldsValue({ type: typeFilter });
    }
    setModalVisible(true);
  };

  // 保存分类
  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingCategory) {
      await updateCategory(editingCategory.id, values);
      message.success('更新成功');
    } else {
      await createCategory(values);
      message.success('新增成功');
    }
    setModalVisible(false);
    loadData();
  };

  // 删除分类
  const handleDelete = async (id: number) => {
    await deleteCategory(id);
    message.success('删除成功');
    loadData();
  };

  const columns: ColumnsType<Category> = [
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'policy' ? 'blue' : 'green'}>
          {type === 'policy' ? '政策资讯' : '规章制度'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />}
              onClick={() => openModal(record)} />
          </Tooltip>
          <Popconfirm title="确定删除该分类吗？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>分类管理</Title>
          </Col>
          <Col>
            <Space>
              <Select
                value={typeFilter}
                onChange={v => setTypeFilter(v)}
                style={{ width: 140 }}
                options={[
                  { value: 'policy', label: '政策资讯分类' },
                  { value: 'rule', label: '规章制度分类' },
                ]}
              />
              <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                新增分类
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="编码"
            rules={[{ required: true, message: '请输入编码' }]}>
            <Input placeholder="如：policy, notice" disabled={!!editingCategory} />
          </Form.Item>
          <Form.Item name="name" label="名称"
            rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：政策法规" />
          </Form.Item>
          <Form.Item name="type" label="类型"
            rules={[{ required: true, message: '请选择类型' }]}>
            <Select
              disabled={!!editingCategory}
              options={[
                { value: 'policy', label: '政策资讯' },
                { value: 'rule', label: '规章制度' },
              ]}
            />
          </Form.Item>
          <Form.Item name="sort" label="排序号"
            rules={[{ required: true, message: '请输入排序号' }]}>
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InfoCategoryManage;
