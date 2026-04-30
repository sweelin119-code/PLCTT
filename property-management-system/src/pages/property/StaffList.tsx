import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, message, Tooltip, Badge, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserList, toggleUserStatus, resetPassword, deleteUser } from '../../services/userService';
import { getRolesByPortType } from '../../services/roleService';
import { getProjectList } from '../../services/orgService';
import { useAuth } from '../../contexts/AuthContext';
import type { UserWithRoles, Role, Organization, PortType } from '../../services/types';

const { Option } = Select;

// 角色颜色映射
const roleColorMap: Record<string, string> = {
  PROP_ADMIN: 'purple',
  PROP_MANAGER: 'blue',
  PROP_CUSTOMER_SVC: 'cyan',
  PROP_ENGINEER: 'orange',
  PROP_SECURITY: 'green',
  PROP_FINANCE: 'red',
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

// 端口名称映射
const portNameMap: Record<string, string> = {
  property: '物业管理端',
  government: '政府监管端',
  merchant: '商家管理端',
};

const StaffList: React.FC = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [projects, setProjects] = useState<Organization[]>([]);
  const [keyword, setKeyword] = useState('');
  const [filterRole, setFilterRole] = useState<number | undefined>();
  const [filterProject, setFilterProject] = useState<number | undefined>();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const portType = getPortFromPath(location.pathname);

  // 根据当前端口动态生成权限编码前缀
  const permPrefix = portType === 'government' ? 'government' : portType === 'merchant' ? 'merchant' : portType === 'superadmin' ? 'property' : 'property';

  const canAdd = hasPermission(`${permPrefix}:staff:add`);
  const canEdit = hasPermission(`${permPrefix}:staff:edit`);
  const canDelete = hasPermission(`${permPrefix}:staff:delete`);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, roleData, projectData] = await Promise.all([
        getUserList({ keyword: keyword || undefined, roleId: filterRole, orgId: filterProject, portType }),
        getRolesByPortType(portType),
        getProjectList(),
      ]);
      setUsers(userData);
      setRoles(roleData);
      setProjects(projectData);
    } catch (err: any) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [keyword, filterRole, filterProject, portType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 搜索
  const handleSearch = () => {
    fetchData();
  };

  // 重置
  const handleReset = () => {
    setKeyword('');
    setFilterRole(undefined);
    setFilterProject(undefined);
    setTimeout(() => fetchData(), 0);
  };

  // 切换状态
  const handleToggleStatus = async (id: number) => {
    try {
      const newStatus = await toggleUserStatus(id);
      message.success(newStatus === 1 ? '已启用' : '已禁用');
      fetchData();
    } catch (err: any) {
      message.error(err.message || '操作失败');
    }
  };

  // 重置密码
  const handleResetPassword = async (id: number) => {
    try {
      await resetPassword(id);
      message.success('密码已重置为手机号');
    } catch (err: any) {
      message.error(err.message || '操作失败');
    }
  };

  // 删除用户
  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchData();
    } catch (err: any) {
      message.error(err.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120,
      render: (name: string, record: UserWithRoles) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.status === 0 && <Badge status="default" text="已禁用" />}
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: '角色',
      key: 'roles',
      width: 200,
      render: (_: any, record: UserWithRoles) => (
        <Space wrap>
          {record.roles.map(ur => (
            <Tag key={ur.id} color={roleColorMap[ur.role?.roleCode || ''] || 'default'}>
              {ur.role?.roleName || '未知角色'}
            </Tag>
          ))}
          {record.roles.length === 0 && <span style={{ color: '#999' }}>未分配角色</span>}
        </Space>
      ),
    },
    {
      title: '所属项目',
      key: 'org',
      width: 160,
      render: (_: any, record: UserWithRoles) => (
        <div>
          {record.roles.map(ur => (
            <div key={ur.id} style={{ fontSize: 12, color: '#666', lineHeight: '22px' }}>
              {ur.org?.name || '—'}
            </div>
          ))}
        </div>
      ),
    },
    ...(portType === 'property' ? [{
      title: '可管理小区',
      key: 'manageProjects',
      width: 200,
      render: (_: any, record: UserWithRoles) => {
        if (!record.manageProjectIds || record.manageProjectIds.length === 0) {
          return <span style={{ color: '#999' }}>全部小区</span>;
        }
        return (
          <Space wrap>
            {record.manageProjectIds.map(pid => {
              const p = projects.find(pr => pr.id === pid);
              return p ? <Tag key={pid} color="blue">{p.name}</Tag> : null;
            })}
          </Space>
        );
      },
    }] : []),
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: any, record: UserWithRoles) => (
        <Space>
          {canEdit && (
            <Tooltip title="编辑">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/${portType}/staff/edit/${record.id}`)}
              >
                编辑
              </Button>
            </Tooltip>
          )}
          <Tooltip title={record.status === 1 ? '禁用' : '启用'}>
            <Button
              type="link"
              size="small"
              danger={record.status === 1}
              onClick={() => handleToggleStatus(record.id)}
            >
              {record.status === 1 ? '禁用' : '启用'}
            </Button>
          </Tooltip>
          <Tooltip title="重置密码">
            <Button
              type="link"
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleResetPassword(record.id)}
            >
              重置密码
            </Button>
          </Tooltip>
          {canDelete && (
            <Popconfirm
              title="确认删除"
              description={`确定要删除「${record.realName}」吗？`}
              onConfirm={() => handleDelete(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Tooltip title="删除">
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
      {/* 搜索栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索姓名/手机号"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="按角色筛选"
            value={filterRole}
            onChange={setFilterRole}
            allowClear
            style={{ width: 150 }}
          >
            {roles.map(r => (
              <Option key={r.id} value={r.id}>{r.roleName}</Option>
            ))}
          </Select>
          <Select
            placeholder="按项目筛选"
            value={filterProject}
            onChange={setFilterProject}
            allowClear
            style={{ width: 180 }}
          >
            {projects.map(p => (
              <Option key={p.id} value={p.id}>{p.name}</Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Card>

      {/* 表格 */}
      <Card
        title={
          <Space>
            <span>账号列表</span>
            <Tag color="blue">{portNameMap[portType] || portType}</Tag>
            <span style={{ fontSize: 13, color: '#999', fontWeight: 400 }}>
              共 {users.length} 人
            </span>
          </Space>
        }
        extra={
          canAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/${portType}/staff/add`)}>
              新增账号
            </Button>
          )
        }
      >
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default StaffList;
