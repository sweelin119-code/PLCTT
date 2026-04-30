import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, TreeSelect, message, Popconfirm, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { Organization } from '../../services/types';
import { getOrgTree } from '../../services/orgService';
import { mockOrganizations } from '../../services/mockData';

const { Option } = Select;

const ORG_TYPE_MAP: Record<string, { label: string; color: string }> = {
  city: { label: '城市', color: '#1890ff' },
  area: { label: '区县', color: '#52c41a' },
  street: { label: '街道', color: '#722ed1' },
  company: { label: '物业公司', color: '#fa8c16' },
  project: { label: '小区项目', color: '#13c2c2' },
  shop: { label: '商家店铺', color: '#eb2f96' },
};

const OrganizationManage: React.FC = () => {
  const [orgTree, setOrgTree] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [form] = Form.useForm();

  const fetchOrgTree = useCallback(async () => {
    setLoading(true);
    try {
      const tree = await getOrgTree();
      setOrgTree(tree);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgTree();
  }, [fetchOrgTree]);

  const handleAdd = (parentId: number | null = null) => {
    setEditOrg(null);
    form.resetFields();
    if (parentId) {
      form.setFieldsValue({ parentId });
    }
    setModalVisible(true);
  };

  const handleEdit = async (org: Organization) => {
    setEditOrg(org);
    form.setFieldsValue({
      name: org.name,
      code: org.code,
      orgType: org.orgType,
      parentId: org.parentId,
      contactPerson: org.contactPerson,
      contactPhone: org.contactPhone,
      address: org.address,
      sortOrder: org.sortOrder,
    });
    setModalVisible(true);
  };

  const handleDelete = async (org: Organization) => {
    // 检查是否有子组织
    const children = mockOrganizations.filter(o => o.parentId === org.id);
    if (children.length > 0) {
      message.error('该组织下存在子组织，无法删除');
      return;
    }
    // 检查是否有用户关联
    const { mockUserRoles } = await import('../../services/mockData');
    const hasUsers = mockUserRoles.some(ur => ur.orgId === org.id);
    if (hasUsers) {
      message.error('该组织下存在关联用户，无法删除');
      return;
    }
    const index = mockOrganizations.findIndex(o => o.id === org.id);
    if (index !== -1) {
      mockOrganizations.splice(index, 1);
      message.success('删除成功');
      fetchOrgTree();
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editOrg) {
      // 编辑
      const org = mockOrganizations.find(o => o.id === editOrg.id);
      if (org) {
        Object.assign(org, {
          name: values.name,
          code: values.code,
          orgType: values.orgType,
          parentId: values.parentId || null,
          contactPerson: values.contactPerson,
          contactPhone: values.contactPhone,
          address: values.address,
          sortOrder: values.sortOrder || 0,
        });
        message.success('编辑成功');
      }
    } else {
      // 新增
      const maxId = Math.max(...mockOrganizations.map(o => o.id), 0);
      const newOrg: Organization = {
        id: maxId + 1,
        name: values.name,
        code: values.code,
        orgType: values.orgType,
        parentId: values.parentId || null,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        address: values.address,
        sortOrder: values.sortOrder || 0,
        status: 1,
      };
      mockOrganizations.push(newOrg);
      message.success('新增成功');
    }
    setModalVisible(false);
    setEditOrg(null);
    form.resetFields();
    fetchOrgTree();
  };

  // 构建父级组织 TreeSelect 数据
  const buildParentTreeData = (orgs: Organization[]): any[] => {
    return orgs.map(org => ({
      value: org.id,
      title: `${org.name} (${ORG_TYPE_MAP[org.orgType]?.label || org.orgType})`,
      disabled: editOrg?.id === org.id,
      children: org.children ? buildParentTreeData(org.children) : [],
    }));
  };

  // 递归渲染组织树表格
  const renderTreeTable = (orgs: Organization[], level: number = 0): any[] => {
    const result: any[] = [];
    for (const org of orgs) {
      const typeInfo = ORG_TYPE_MAP[org.orgType] || { label: org.orgType, color: '#999' };
      result.push({
        key: org.id,
        name: org.name,
        code: org.code,
        orgType: org.orgType,
        orgTypeLabel: typeInfo.label,
        orgTypeColor: typeInfo.color,
        contactPerson: org.contactPerson,
        contactPhone: org.contactPhone,
        address: org.address,
        sortOrder: org.sortOrder,
        status: org.status,
        level,
        hasChildren: (org.children && org.children.length > 0) || false,
        children: org.children ? renderTreeTable(org.children, level + 1) : [],
      });
    }
    return result;
  };

  const columns = [
    {
      title: '组织名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <ApartmentOutlined style={{ color: record.orgTypeColor, marginLeft: record.level * 20 }} />
          <span style={{ fontWeight: record.level === 0 ? 600 : 'normal' }}>{name}</span>
          <Tag color={record.orgTypeColor} style={{ fontSize: 11 }}>{record.orgTypeLabel}</Tag>
        </Space>
      ),
    },
    {
      title: '组织编码',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 120,
      render: (v: string) => v || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 140,
      render: (v: string) => v || '-',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="新增子组织">
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(record.key)}>
              新增下级
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
              const org = mockOrganizations.find(o => o.id === record.key);
              if (org) handleEdit(org);
            }} />
          </Tooltip>
          <Popconfirm
            title="确定删除该组织吗？"
            onConfirm={() => {
              const org = mockOrganizations.find(o => o.id === record.key);
              if (org) handleDelete(org);
            }}
          >
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tableData = renderTreeTable(orgTree);

  return (
    <div>
      <Card
        title={
          <Space>
            <ApartmentOutlined />
            <span>组织架构管理</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchOrgTree}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(null)}>
              新增根组织
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          pagination={false}
          size="middle"
          expandable={{
            defaultExpandAllRows: true,
          }}
        />
      </Card>

      <Modal
        title={editOrg ? '编辑组织' : '新增组织'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditOrg(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="组织名称" rules={[{ required: true, message: '请输入组织名称' }]}>
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="code" label="组织编码" rules={[{ required: true, message: '请输入组织编码' }]}>
            <Input placeholder="请输入组织编码" />
          </Form.Item>
          <Form.Item name="orgType" label="组织类型" rules={[{ required: true, message: '请选择组织类型' }]}>
            <Select placeholder="请选择组织类型">
              {Object.entries(ORG_TYPE_MAP).map(([key, info]) => (
                <Option key={key} value={key}>{info.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="parentId" label="上级组织">
            <TreeSelect
              treeData={buildParentTreeData(orgTree)}
              placeholder="请选择上级组织（不选则为根组织）"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="contactPerson" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="contactPhone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序号">
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationManage;
