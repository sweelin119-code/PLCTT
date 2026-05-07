import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, Tag,
  Typography, message, Popconfirm, Switch, Tooltip, Descriptions,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  getEmployeeList, getEmployeeById, createEmployee, updateEmployee, deleteEmployee,
  getAvailableUsers, getDepartments, getPositions,
  type EmployeeQueryParams,
} from '../../services/employeeService';
import type { EmployeeProfile, EmployeeStatus } from '../../services/types';

const { Title, Text } = Typography;

const statusOptions: { value: EmployeeStatus; label: string; color: string }[] = [
  { value: 'active', label: '在职', color: 'green' },
  { value: 'resigned', label: '离职', color: 'red' },
  { value: 'leave', label: '休假', color: 'orange' },
];

const EmployeeManage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeProfile | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<{ id: number; realName: string; phone: string }[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [form] = Form.useForm();

  // 搜索条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchDept, setSearchDept] = useState<string | undefined>(undefined);
  const [searchStatus, setSearchStatus] = useState<EmployeeStatus | undefined>(undefined);

  const fetchData = useCallback(async (params?: EmployeeQueryParams) => {
    setLoading(true);
    try {
      const data = await getEmployeeList(params);
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    loadOptions();
  }, [fetchData]);

  const loadOptions = async () => {
    try {
      const [depts, pos] = await Promise.all([
        getDepartments(),
        getPositions(),
      ]);
      setDepartments(depts);
      setPositions(pos);
    } catch (err) {
      console.error('Failed to load options:', err);
    }
  };

  const handleSearch = () => {
    fetchData({
      keyword: searchKeyword || undefined,
      department: searchDept,
      status: searchStatus,
    });
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSearchDept(undefined);
    setSearchStatus(undefined);
    fetchData();
  };

  const handleAdd = async () => {
    const users = await getAvailableUsers();
    setAvailableUsers(users);
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ canSchedule: true, status: 'active' });
    setModalVisible(true);
  };

  const handleEdit = async (record: EmployeeProfile) => {
    const users = await getAvailableUsers();
    // 如果当前员工已关联账号，也加入列表
    if (record.userId) {
      const alreadyExists = users.some(u => u.id === record.userId);
      if (!alreadyExists) {
        users.unshift({ id: record.userId, realName: record.realName, phone: record.phone });
      }
    }
    setAvailableUsers(users);
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEmployee(id);
      message.success('删除成功');
      fetchData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await updateEmployee(editingId, values);
        message.success('更新成功');
      } else {
        await createEmployee(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const showDetail = async (record: EmployeeProfile) => {
    setCurrentEmployee(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '员工编号', dataIndex: 'employeeNo', key: 'employeeNo', width: 120,
    },
    {
      title: '姓名', dataIndex: 'realName', key: 'realName', width: 100,
      render: (text: string, record: EmployeeProfile) => (
        <a onClick={() => showDetail(record)}>{text}</a>
      ),
    },
    {
      title: '手机号', dataIndex: 'phone', key: 'phone', width: 130,
    },
    {
      title: '部门', dataIndex: 'department', key: 'department', width: 120,
    },
    {
      title: '岗位', dataIndex: 'position', key: 'position', width: 120,
    },
    {
      title: '技能标签', key: 'skillTags', width: 200,
      render: (_: any, record: EmployeeProfile) => (
        <Space size={4} wrap>
          {record.skillTags.map((tag, idx) => (
            <Tag key={idx} color="blue">{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '参与排班', dataIndex: 'canSchedule', key: 'canSchedule', width: 90,
      render: (val: boolean) => val ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>,
    },
    {
      title: '关联账号', key: 'userId', width: 100,
      render: (_: any, record: EmployeeProfile) =>
        record.userId ? <Tag color="blue">已关联</Tag> : <Tag color="default">未关联</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: EmployeeStatus) => {
        const opt = statusOptions.find(o => o.value === status);
        return <Tag color={opt?.color}>{opt?.label}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', width: 160, fixed: 'right' as const,
      render: (_: any, record: EmployeeProfile) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除该员工？" onConfirm={() => handleDelete(record.id)}>
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
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索姓名/编号/手机号"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ width: 220 }}
            allowClear
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="选择部门"
            value={searchDept}
            onChange={setSearchDept}
            allowClear
            style={{ width: 140 }}
            options={departments.map(d => ({ value: d, label: d }))}
          />
          <Select
            placeholder="选择状态"
            value={searchStatus}
            onChange={setSearchStatus}
            allowClear
            style={{ width: 120 }}
            options={statusOptions.map(o => ({ value: o.value, label: o.label }))}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Card>

      <Card
        title={
          <Space>
            <UserOutlined />
            <span>员工档案</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增员工
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingId ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="userId" label="关联账号">
            <Select
              allowClear
              placeholder="选择关联的账号（可选）"
              options={availableUsers.map(u => ({
                value: u.id,
                label: `${u.realName}（${u.phone}）`,
              }))}
            />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="employeeNo" label="员工编号" rules={[{ required: true, message: '请输入员工编号' }]} style={{ width: 200 }}>
              <Input placeholder="如 EMP001" />
            </Form.Item>
            <Form.Item name="realName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]} style={{ width: 200 }}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1\d{10}$/, message: '手机号格式不正确' }]} style={{ width: 200 }}>
              <Input placeholder="请输入手机号" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="department" label="部门" rules={[{ required: true, message: '请选择部门' }]} style={{ width: 200 }}>
              <Select
                placeholder="请选择部门"
                options={departments.map(d => ({ value: d, label: d }))}
              />
            </Form.Item>
            <Form.Item name="position" label="岗位" rules={[{ required: true, message: '请选择岗位' }]} style={{ width: 200 }}>
              <Select
                placeholder="请选择岗位"
                options={positions.map(p => ({ value: p, label: p }))}
              />
            </Form.Item>
            <Form.Item name="entryDate" label="入职日期" style={{ width: 200 }}>
              <Input type="date" />
            </Form.Item>
          </Space>
          <Form.Item name="skillTags" label="技能标签">
            <Select mode="tags" placeholder="输入技能标签后回车" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="canSchedule" label="参与排班" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select options={statusOptions.map(o => ({ value: o.value, label: o.label }))} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="员工详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {currentEmployee && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="员工编号">{currentEmployee.employeeNo}</Descriptions.Item>
            <Descriptions.Item label="姓名">{currentEmployee.realName}</Descriptions.Item>
            <Descriptions.Item label="手机号">{currentEmployee.phone}</Descriptions.Item>
            <Descriptions.Item label="部门">{currentEmployee.department}</Descriptions.Item>
            <Descriptions.Item label="岗位">{currentEmployee.position}</Descriptions.Item>
            <Descriptions.Item label="入职日期">{currentEmployee.entryDate}</Descriptions.Item>
            <Descriptions.Item label="参与排班">
              {currentEmployee.canSchedule ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusOptions.find(o => o.value === currentEmployee.status)?.color}>
                {statusOptions.find(o => o.value === currentEmployee.status)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="关联账号" span={2}>
              {currentEmployee.userId ? `已关联账号 ID: ${currentEmployee.userId}` : '未关联'}
            </Descriptions.Item>
            <Descriptions.Item label="技能标签" span={2}>
              <Space size={4} wrap>
                {currentEmployee.skillTags.map((tag, idx) => (
                  <Tag key={idx} color="blue">{tag}</Tag>
                ))}
                {currentEmployee.skillTags.length === 0 && <Text type="secondary">无</Text>}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeManage;
