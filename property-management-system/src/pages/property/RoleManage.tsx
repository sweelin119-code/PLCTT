import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, Tree, message, Space, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { getRoleList, updateRolePermissions, getAllPermissions, createRole, deleteRole, updateRole } from '../../services/roleService';
import { useAuth } from '../../contexts/AuthContext';
import type { Role, Permission, PortType } from '../../services/types';

// 端口颜色映射
const portColorMap: Record<string, string> = {
  property: 'blue',
  government: 'purple',
  merchant: 'orange',
  owner: 'green',
  wechat: 'cyan',
};

const portNameMap: Record<string, string> = {
  property: '物业管理端',
  government: '政府监管端',
  merchant: '商家管理端',
  owner: '业主微信端',
  wechat: '公众号管理',
};

// 从路径中提取端口类型
const getPortFromPath = (pathname: string): PortType => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0) {
    const port = parts[0];
    if (['government', 'property', 'merchant', 'superadmin'].includes(port)) {
      return port as PortType;
    }
  }
  return 'property';
};

// 根据端口类型过滤权限列表
const getPermissionsByPortType = (perms: Permission[], portType: PortType): Permission[] => {
  // 超级管理端显示所有端口的权限
  if (portType === 'superadmin') {
    return perms;
  }
  return perms.filter(p => p.permCode.startsWith(portType + ':'));
};

const RoleManage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [permModalVisible, setPermModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const { hasPermission } = useAuth();
  const location = useLocation();
  const portType = getPortFromPath(location.pathname);

  // 根据当前端口动态生成权限编码前缀
  const permPrefix = portType === 'government' ? 'government' : portType === 'merchant' ? 'merchant' : portType === 'superadmin' ? 'property' : 'property';

  const canAdd = hasPermission(`${permPrefix}:roles:add`);
  const canEdit = hasPermission(`${permPrefix}:roles:edit`);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoleList({ portType });
      setRoles(data);
    } catch {
      message.error('加载角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portType]);

  // 打开权限配置弹窗
  const handleOpenPermModal = async (role: Role) => {
    setEditingRole(role);
    setCheckedKeys(role.permissions);
    setPermModalVisible(true);
    if (permissions.length === 0) {
      const perms = await getAllPermissions();
      setPermissions(perms);
    }
  };

  // 保存权限
  const handleSavePermissions = async () => {
    if (!editingRole) return;
    setPermLoading(true);
    try {
      await updateRolePermissions(editingRole.id, checkedKeys as string[]);
      message.success('权限配置已更新');
      setPermModalVisible(false);
      fetchRoles();
    } catch (err: any) {
      message.error(err.message || '保存失败');
    } finally {
      setPermLoading(false);
    }
  };

  // 新增角色
  const handleAddRole = async (values: any) => {
    try {
      await createRole({
        roleCode: values.roleCode,
        roleName: values.roleName,
        portType,
        description: values.description,
      });
      message.success('角色创建成功');
      setAddModalVisible(false);
      addForm.resetFields();
      fetchRoles();
    } catch (err: any) {
      message.error(err.message || '创建失败');
    }
  };

  // 打开编辑角色弹窗
  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role);
    editForm.setFieldsValue({
      roleName: role.roleName,
      description: role.description,
    });
    setEditModalVisible(true);
  };

  // 保存编辑角色
  const handleEditRole = async (values: any) => {
    if (!editingRole) return;
    try {
      await updateRole(editingRole.id, {
        roleName: values.roleName,
        description: values.description,
      });
      message.success('角色信息已更新');
      setEditModalVisible(false);
      editForm.resetFields();
      fetchRoles();
    } catch (err: any) {
      message.error(err.message || '更新失败');
    }
  };

  // 删除角色
  const handleDeleteRole = async (role: Role) => {
    try {
      await deleteRole(role.id);
      message.success('角色已删除');
      fetchRoles();
    } catch (err: any) {
      message.error(err.message || '删除失败');
    }
  };

  // 构建权限树（仅显示当前端类型的权限）
  const buildTreeData = (perms: Permission[]): any[] => {
    const portPerms = getPermissionsByPortType(perms, portType);
    const topLevel = portPerms.filter(p => p.parentId === null && p.type === 'menu');
    return topLevel.map(p => ({
      key: p.permCode,
      title: p.permName,
      children: portPerms
        .filter(child => child.parentId === p.id)
        .map(child => ({
          key: child.permCode,
          title: (
            <span>
              {child.permName}
              <Tag style={{ marginLeft: 8 }} color={child.type === 'button' ? 'orange' : 'blue'}>
                {child.type === 'button' ? '按钮' : '页面'}
              </Tag>
            </span>
          ),
          children: portPerms
            .filter(grandChild => grandChild.parentId === child.id)
            .map(gc => ({
              key: gc.permCode,
              title: (
                <span>
                  {gc.permName}
                  <Tag style={{ marginLeft: 8 }} color="orange">按钮</Tag>
                </span>
              ),
            })),
        })),
    }));
  };

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150,
      render: (name: string, record: Role) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{name}</span>
          <Tag color={portColorMap[record.portType] || 'default'}>
            {portNameMap[record.portType] || record.portType}
          </Tag>
        </Space>
      ),
    },
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      key: 'roleCode',
      width: 160,
      render: (code: string) => <code style={{ fontSize: 12, color: '#666' }}>{code}</code>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 250,
    },
    {
      title: '权限数',
      key: 'permCount',
      width: 100,
      render: (_: any, record: Role) => (
        <Tag>{record.permissions.length} 项</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      render: (_: any, record: Role) => (
        <Space>
          {canEdit && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenPermModal(record)}
            >
              配置权限
            </Button>
          )}
          {canEdit && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
            >
              编辑
            </Button>
          )}
          {canEdit && record.roleCode !== `${portType === 'government' ? 'GOV' : portType === 'merchant' ? 'MER' : 'PROP'}_ADMIN` && (
            <Popconfirm
              title="确认删除"
              description={`确定要删除「${record.roleName}」角色吗？`}
              onConfirm={() => handleDeleteRole(record)}
              okText="确认"
              cancelText="取消"
            >
              <Tooltip title="删除角色">
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <span>角色管理</span>
            <Tag color="blue">{portNameMap[portType] || portType}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchRoles}>刷新</Button>
            {canAdd && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
                新增角色
              </Button>
            )}
          </Space>
        }
      >
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 权限配置弹窗 */}
      <Modal
        title={`配置权限 - ${editingRole?.roleName}`}
        open={permModalVisible}
        onOk={handleSavePermissions}
        onCancel={() => setPermModalVisible(false)}
        confirmLoading={permLoading}
        width={520}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
          勾选需要授予该角色的权限项（仅显示当前端权限）：
        </div>
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <Tree
            checkable
            defaultExpandAll
            checkedKeys={checkedKeys}
            onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
            treeData={buildTreeData(permissions)}
          />
        </div>
      </Modal>

      {/* 新增角色弹窗 */}
      <Modal
        title="新增角色"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          addForm.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddRole}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="roleCode"
            label="角色编码"
            rules={[
              { required: true, message: '请输入角色编码' },
              { pattern: /^[A-Z_]+$/, message: '编码格式：大写字母+下划线' },
            ]}
          >
            <Input placeholder="例如：PROP_NEW_ROLE" />
          </Form.Item>
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="例如：新角色名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="角色描述"
          >
            <Input.TextArea placeholder="描述该角色的职责范围" rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button onClick={() => {
                setAddModalVisible(false);
                addForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑角色弹窗 */}
      <Modal
        title="编辑角色"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        width={480}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditRole}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="例如：新角色名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="角色描述"
          >
            <Input.TextArea placeholder="描述该角色的职责范围" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManage;
