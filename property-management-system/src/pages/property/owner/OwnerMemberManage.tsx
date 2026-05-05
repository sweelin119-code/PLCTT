import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm,
  message, Row, Col, Switch,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import type { OwnerMember, MemberRelation } from '../../../services/assetTypes';

// 关系映射
const RELATION_MAP: Record<MemberRelation, string> = {
  spouse: '配偶',
  child: '子女',
  parent: '父母',
  relative: '亲属',
  other: '其他',
};

// Mock 业主成员数据
let mockMembers: OwnerMember[] = [
  { id: 1, projectId: 20, ownerId: 1, ownerName: '孙业主', name: '孙太太', phone: '13600000011', relation: 'spouse', gender: 'female', status: true, createTime: '2026-03-01 10:00:00', updateTime: '2026-03-01 10:00:00' },
  { id: 2, projectId: 20, ownerId: 1, ownerName: '孙业主', name: '孙小明', phone: '13600000012', relation: 'child', gender: 'male', birthday: '2015-06-15', status: true, createTime: '2026-03-01 10:00:00', updateTime: '2026-03-01 10:00:00' },
  { id: 3, projectId: 21, ownerId: 2, ownerName: '张建国', name: '张丽华', phone: '13600000013', relation: 'spouse', gender: 'female', status: true, createTime: '2026-03-05 14:00:00', updateTime: '2026-03-05 14:00:00' },
];

// Mock 业主列表（用于下拉选择）
const mockOwnerOptions = [
  { id: 1, name: '孙业主', phone: '13600000001', projectId: 20 },
  { id: 2, name: '张建国', phone: '13800000002', projectId: 21 },
];

let nextMemberId = 4;

const OwnerMemberManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [members, setMembers] = useState<OwnerMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<OwnerMember | null>(null);
  const [form] = Form.useForm();

  const loadData = () => {
    if (!currentCommunity) return;
    setLoading(true);
    // 模拟异步加载
    setTimeout(() => {
      const filtered = mockMembers.filter(m => m.projectId === currentCommunity.id);
      setMembers(filtered);
      setLoading(false);
    }, 200);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommunity]);

  const handleAdd = () => {
    setEditingMember(null);
    form.resetFields();
    form.setFieldsValue({ status: true });
    setModalVisible(true);
  };

  const handleEdit = (record: OwnerMember) => {
    setEditingMember(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    mockMembers = mockMembers.filter(m => m.id !== id);
    message.success('删除成功');
    loadData();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingMember) {
        // 更新
        mockMembers = mockMembers.map(m =>
          m.id === editingMember.id
            ? { ...m, ...values, updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19) }
            : m
        );
        message.success('更新成功');
      } else {
        // 新增
        const newMember: OwnerMember = {
          id: nextMemberId++,
          projectId: currentCommunity!.id,
          ownerId: values.ownerId,
          ownerName: mockOwnerOptions.find(o => o.id === values.ownerId)?.name || '',
          ...values,
          createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        mockMembers.push(newMember);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch {
      // validation failed
    }
  };

  const columns = [
    { title: '成员姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: '关联业主', dataIndex: 'ownerName', key: 'ownerName', width: 100,
      render: (v: string) => v || '-',
    },
    {
      title: '关系', dataIndex: 'relation', key: 'relation', width: 80,
      render: (v: MemberRelation) => {
        const colorMap: Record<string, string> = { spouse: 'magenta', child: 'blue', parent: 'orange', relative: 'purple', other: 'default' };
        return <Tag color={colorMap[v] || 'default'}>{RELATION_MAP[v] || v}</Tag>;
      },
    },
    {
      title: '性别', dataIndex: 'gender', key: 'gender', width: 60,
      render: (v: string) => v === 'male' ? '男' : v === 'female' ? '女' : '-',
    },
    { title: '身份证号', dataIndex: 'idCard', key: 'idCard', width: 160, render: (v: string) => v || '-' },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, render: (v: string) => v || '-' },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 70,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 140,
      render: (_: any, record: OwnerMember) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除该成员？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!currentCommunity) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <UserOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16 }}>请先选择小区</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="业主成员管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增成员
          </Button>
        }
      >
        <Table
          dataSource={members}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 人` }}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingMember ? '编辑成员' : '新增成员'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ownerId" label="关联业主" rules={[{ required: true, message: '请选择关联业主' }]}>
                <Select
                  placeholder="请选择业主"
                  options={mockOwnerOptions
                    .filter(o => o.projectId === currentCommunity?.id)
                    .map(o => ({ value: o.id, label: `${o.name} (${o.phone})` }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="relation" label="关系" rules={[{ required: true, message: '请选择关系' }]}>
                <Select placeholder="请选择关系" options={[
                  { value: 'spouse', label: '配偶' },
                  { value: 'child', label: '子女' },
                  { value: 'parent', label: '父母' },
                  { value: 'relative', label: '亲属' },
                  { value: 'other', label: '其他' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="成员姓名" rules={[{ required: true, message: '请输入成员姓名' }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="手机号" rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '手机号格式不正确' },
              ]}>
                <Input placeholder="请输入11位手机号" maxLength={11} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="性别">
                <Select allowClear placeholder="请选择" options={[
                  { value: 'male', label: '男' },
                  { value: 'female', label: '女' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="idCard" label="身份证号">
                <Input placeholder="请输入身份证号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OwnerMemberManage;
