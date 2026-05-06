import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, Select, DatePicker, Space, message, Popconfirm, Tabs, Descriptions, Timeline } from 'antd';
import { PlusOutlined, EditOutlined, LogoutOutlined, SwapOutlined } from '@ant-design/icons';
import { getCommitteeMembers, createCommitteeMember, updateCommitteeMember, resignCommitteeMember, getTermChangeRecords, type CommitteeMember, type TermChangeRecord } from '../../services/committeeService';

const positionMap: Record<string, { label: string; color: string }> = {
  director: { label: '主任', color: 'red' },
  vice_director: { label: '副主任', color: 'orange' },
  member: { label: '委员', color: 'blue' },
  alternate: { label: '候补委员', color: 'purple' },
};

const CommitteeMemberManage: React.FC = () => {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [termRecords, setTermRecords] = useState<TermChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([getCommitteeMembers(), getTermChangeRecords()]);
      setMembers(m);
      setTermRecords(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => {
    setEditingMember(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: CommitteeMember) => {
    setEditingMember(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingMember) {
      await updateCommitteeMember(editingMember.id, values);
      message.success('成员信息已更新');
    } else {
      await createCommitteeMember(values);
      message.success('成员已添加');
    }
    setModalVisible(false);
    loadData();
  };

  const handleResign = async (id: string) => {
    await resignCommitteeMember(id);
    message.success('成员已标记为离职');
    loadData();
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    {
      title: '职务', dataIndex: 'position', key: 'position', width: 120,
      render: (pos: string) => <Tag color={positionMap[pos]?.color}>{positionMap[pos]?.label || pos}</Tag>,
    },
    { title: '楼栋', dataIndex: 'building', key: 'building', width: 100 },
    { title: '单元', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: '任期开始', dataIndex: 'termStart', key: 'termStart', width: 110 },
    { title: '任期结束', dataIndex: 'termEnd', key: 'termEnd', width: 110 },
    {
      title: '出勤率', dataIndex: 'attendance', key: 'attendance', width: 100,
      render: (val: number) => <Tag color={val >= 80 ? 'green' : val >= 60 ? 'orange' : 'red'}>{val}%</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '在职' : '离职'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: any, record: CommitteeMember) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          {record.status === 'active' && (
            <Popconfirm title="确认该成员离职？" onConfirm={() => handleResign(record.id)}>
              <Button type="link" size="small" danger icon={<LogoutOutlined />}>离职</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'members',
      label: '成员列表',
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增成员</Button>
          </div>
          <Table
            dataSource={members}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="middle"
          />
        </>
      ),
    },
    {
      key: 'term',
      label: '换届记录',
      children: (
        <Timeline
          items={termRecords.map(r => ({
            color: 'blue',
            children: (
              <Card size="small" style={{ marginBottom: 8 }}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="换届日期">{r.changeDate}</Descriptions.Item>
                  <Descriptions.Item label="原主任">{r.previousDirector}</Descriptions.Item>
                  <Descriptions.Item label="新主任">{r.newDirector}</Descriptions.Item>
                  <Descriptions.Item label="成员">{r.members.join('、')}</Descriptions.Item>
                  <Descriptions.Item label="说明">{r.description}</Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          }))}
        />
      ),
    },
  ];

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Tabs items={tabItems} />
      </Card>

      <Modal
        title={editingMember ? '编辑成员' : '新增成员'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="职务" rules={[{ required: true, message: '请选择职务' }]}>
            <Select options={[
              { value: 'director', label: '主任' },
              { value: 'vice_director', label: '副主任' },
              { value: 'member', label: '委员' },
              { value: 'alternate', label: '候补委员' },
            ]} />
          </Form.Item>
          <Form.Item name="building" label="楼栋" rules={[{ required: true, message: '请输入楼栋' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unit" label="单元" rules={[{ required: true, message: '请输入单元' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="termStart" label="任期开始">
            <Input placeholder="如：2024-01-01" />
          </Form.Item>
          <Form.Item name="termEnd" label="任期结束">
            <Input placeholder="如：2029-01-01" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommitteeMemberManage;
