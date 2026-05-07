import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Space, Tag,
  Typography, message, Popconfirm, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined,
} from '@ant-design/icons';
import { getPositions } from '../../services/employeeService';

const { Title } = Typography;

// 岗位数据（Mock）
interface Position {
  id: string;
  name: string;
  department: string;
  description: string;
  employeeCount: number;
  createdAt: string;
}

const mockPositions: Position[] = [
  { id: 'p1', name: '客服主管', department: '客服部', description: '负责客服团队管理', employeeCount: 1, createdAt: '2025-01-15' },
  { id: 'p2', name: '客服专员', department: '客服部', description: '接待业主咨询与投诉', employeeCount: 1, createdAt: '2025-02-01' },
  { id: 'p3', name: '维修工程师', department: '工程部', description: '负责设施设备维修', employeeCount: 1, createdAt: '2025-01-20' },
  { id: 'p4', name: '维修工', department: '工程部', description: '日常维修作业', employeeCount: 1, createdAt: '2025-04-15' },
  { id: 'p5', name: '保安队长', department: '安保部', description: '负责保安团队管理', employeeCount: 1, createdAt: '2025-03-01' },
  { id: 'p6', name: '会计', department: '财务部', description: '负责财务核算', employeeCount: 1, createdAt: '2025-02-10' },
  { id: 'p7', name: '保洁员', department: '保洁部', description: '负责小区保洁工作', employeeCount: 1, createdAt: '2025-04-01' },
];

const PositionManage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 从 employeeService 获取实际岗位列表，合并 Mock 数据
      const posNames = await getPositions();
      // 使用 mockPositions 作为基础数据，保持描述等信息
      setPositions(mockPositions);
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Position) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    message.success('删除成功');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        setPositions(prev => prev.map(p =>
          p.id === editingId ? { ...p, ...values } : p
        ));
        message.success('更新成功');
      } else {
        const newPos: Position = {
          id: String(Date.now()),
          ...values,
          employeeCount: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setPositions(prev => [...prev, newPos]);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const columns = [
    {
      title: '岗位名称', dataIndex: 'name', key: 'name', width: 150,
    },
    {
      title: '所属部门', dataIndex: 'department', key: 'department', width: 150,
      render: (dept: string) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: '岗位描述', dataIndex: 'description', key: 'description',
    },
    {
      title: '在岗人数', dataIndex: 'employeeCount', key: 'employeeCount', width: 100,
      render: (count: number) => <Tag color={count > 0 ? 'green' : 'default'}>{count} 人</Tag>,
    },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 120,
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: any, record: Position) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除该岗位？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>岗位管理</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增岗位
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={positions}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingId ? '编辑岗位' : '新增岗位'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="岗位名称" rules={[{ required: true, message: '请输入岗位名称' }]}>
            <Input placeholder="请输入岗位名称" />
          </Form.Item>
          <Form.Item name="department" label="所属部门" rules={[{ required: true, message: '请输入所属部门' }]}>
            <Input placeholder="请输入所属部门" />
          </Form.Item>
          <Form.Item name="description" label="岗位描述">
            <Input.TextArea rows={3} placeholder="请输入岗位描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PositionManage;
