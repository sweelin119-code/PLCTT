import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select, Tree,
  Space, Typography, message, Popconfirm, Upload, Row, Col,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, DownloadOutlined,
  FolderOutlined, FileOutlined, UploadOutlined,
} from '@ant-design/icons';
import {
  getArchiveCategories, getArchiveFiles,
  uploadArchiveFile, deleteArchiveFile,
  ArchiveCategory, ArchiveFile,
} from '../../services/committeeService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const permissionConfig: Record<string, { color: string; label: string }> = {
  public: { color: 'green', label: '公开' },
  internal: { color: 'blue', label: '内部' },
  confidential: { color: 'red', label: '保密' },
};

const ArchiveManage: React.FC = () => {
  const [categories, setCategories] = useState<ArchiveCategory[]>([]);
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>(undefined);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    const data = await getArchiveCategories();
    setCategories(data);
  };

  const fetchFiles = async (category?: string, subCategory?: string) => {
    setLoading(true);
    try {
      const data = await getArchiveFiles(category, subCategory);
      setFiles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFiles();
  }, []);

  const handleCategorySelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length === 0) {
      setSelectedCategory(undefined);
      setSelectedSubCategory(undefined);
      fetchFiles();
      return;
    }
    const key = selectedKeys[0] as string;
    // Check if it's a subcategory (contains underscore)
    const allSubCategories = categories.flatMap(c => c.children || []);
    const isSubCategory = allSubCategories.some(sc => sc.key === key);
    if (isSubCategory) {
      const parent = categories.find(c => c.children?.some(sc => sc.key === key));
      setSelectedCategory(parent?.key);
      setSelectedSubCategory(key);
      fetchFiles(parent?.key, key);
    } else {
      setSelectedCategory(key);
      setSelectedSubCategory(undefined);
      fetchFiles(key);
    }
  };

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      await uploadArchiveFile(values);
      message.success('上传成功');
      setUploadVisible(false);
      form.resetFields();
      fetchFiles(selectedCategory, selectedSubCategory);
    } catch (err) {
      // validation failed
    }
  };

  const handleDelete = async (id: string) => {
    await deleteArchiveFile(id);
    message.success('删除成功');
    fetchFiles(selectedCategory, selectedSubCategory);
  };

  const columns = [
    { title: '文件名', dataIndex: 'name', key: 'name', ellipsis: true, render: (text: string) => <><FileOutlined style={{ marginRight: 8 }} />{text}</> },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '文件大小', dataIndex: 'fileSize', key: 'fileSize', width: 100 },
    { title: '上传人', dataIndex: 'uploader', key: 'uploader', width: 100 },
    { title: '上传时间', dataIndex: 'uploadedAt', key: 'uploadedAt', width: 110 },
    {
      title: '权限', dataIndex: 'permission', key: 'permission', width: 80,
      render: (val: string) => <Tag color={permissionConfig[val]?.color}>{permissionConfig[val]?.label}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: ArchiveFile) => (
        <Space>
          <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
          <Popconfirm title="确定删除此文件？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>档案管理</Title>

      <Row gutter={16}>
        <Col span={6}>
          <Card title="档案分类" size="small">
            <Tree
              treeData={categories.map(cat => ({
                key: cat.key,
                title: cat.label,
                icon: <FolderOutlined />,
                children: cat.children?.map(sub => ({
                  key: sub.key,
                  title: sub.label,
                  icon: <FolderOutlined />,
                })),
              }))}
              defaultExpandAll
              showIcon
              onSelect={handleCategorySelect}
            />
          </Card>
        </Col>
        <Col span={18}>
          <Card
            extra={<Button type="primary" icon={<UploadOutlined />} onClick={() => { setUploadVisible(true); form.resetFields(); }}>上传文件</Button>}
          >
            <Table
              dataSource={files}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={false}
              locale={{ emptyText: '请选择分类查看文件' }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="上传文件"
        open={uploadVisible}
        onCancel={() => { setUploadVisible(false); form.resetFields(); }}
        onOk={handleUpload}
        okText="上传"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="文件名" rules={[{ required: true, message: '请输入文件名' }]}>
            <Input placeholder="请输入文件名（含扩展名）" />
          </Form.Item>
          <Form.Item name="category" label="所属分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Select.OptGroup key={cat.key} label={cat.label}>
                  {cat.children?.map(sub => (
                    <Select.Option key={sub.key} value={sub.key}>{sub.label}</Select.Option>
                  ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="文件描述">
            <TextArea rows={2} placeholder="请输入文件描述" />
          </Form.Item>
          <Form.Item name="permission" label="访问权限" rules={[{ required: true, message: '请选择访问权限' }]}>
            <Select>
              <Select.Option value="public">公开（所有业主可见）</Select.Option>
              <Select.Option value="internal">内部（业委会成员可见）</Select.Option>
              <Select.Option value="confidential">保密（仅管理员可见）</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="fileSize" label="文件大小">
            <Input placeholder="如：1.2MB" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ArchiveManage;
