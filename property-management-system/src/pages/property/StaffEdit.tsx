import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, message, Space, Switch, Spin } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getUserById, createUser, updateUser } from '../../services/userService';
import { getRolesByPortType } from '../../services/roleService';
import { getProjectList, getCompanyList } from '../../services/orgService';
import type { Role, Organization, PortType } from '../../services/types';

const { Option } = Select;

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

const StaffEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [projects, setProjects] = useState<Organization[]>([]);
  const [companies, setCompanies] = useState<Organization[]>([]);
  const [allProjects, setAllProjects] = useState<Organization[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const portType = getPortFromPath(location.pathname);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [roleData, projectData, companyData] = await Promise.all([
          getRolesByPortType(portType),
          getProjectList(),
          getCompanyList(),
        ]);
        setRoles(roleData);
        setProjects(projectData);
        setCompanies(companyData);
        setAllProjects(projectData);

        // 编辑模式：加载用户数据
        if (isEdit && id) {
          const user = await getUserById(parseInt(id));
          if (user) {
            form.setFieldsValue({
              realName: user.realName,
              phone: user.phone,
              status: user.status === 1,
              roleId: user.roles[0]?.roleId,
              orgId: user.roles[0]?.orgId,
              manageProjectIds: user.manageProjectIds || [],
            });
          } else {
            message.error('用户不存在');
            navigate(`/${portType}/staff/list`);
          }
        }
      } catch (err: any) {
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit, form, navigate, portType]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateUser(parseInt(id), {
          realName: values.realName,
          phone: values.phone,
          status: values.status ? 1 : 0,
          roles: [{ roleId: values.roleId, orgId: values.orgId }],
        });
        message.success('修改成功');
      } else {
        await createUser({
          phone: values.phone,
          password: values.phone,
          realName: values.realName,
          portType,
          status: values.status ? 1 : 0,
          roles: [{ roleId: values.roleId, orgId: values.orgId }],
        });
        message.success('新增成功');
      }
      navigate(`/${portType}/staff/list`);
    } catch (err: any) {
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title={isEdit ? '编辑账号' : '新增账号'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: true }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="realName"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1\d{10}$/, message: '请输入正确的手机号格式' },
            ]}
          >
            <Input
              placeholder="请输入手机号（初始密码与手机号相同）"
              maxLength={11}
              disabled={isEdit}
            />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roles.map(r => (
                <Option key={r.id} value={r.id}>
                  {r.roleName} - {r.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="orgId"
            label="所属组织"
            rules={[{ required: true, message: '请选择所属组织' }]}
          >
            <Select placeholder="请选择所属组织">
              <Select.OptGroup label="物业公司">
                {companies.map(c => (
                  <Option key={`company-${c.id}`} value={c.id}>{c.name}</Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="小区项目">
                {projects.map(p => (
                  <Option key={`project-${p.id}`} value={p.id}>{p.name}</Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Form.Item>

          {portType === 'property' && (
            <Form.Item
              name="manageProjectIds"
              label="可管理小区"
              tooltip="选择该账号可管理的小区项目，不选或留空表示可管理所有小区"
            >
              <Select
                mode="multiple"
                placeholder="请选择可管理的小区（留空表示全部）"
                allowClear
                style={{ width: '100%' }}
              >
                {allProjects.map(p => (
                  <Option key={p.id} value={p.id}>{p.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? '保存修改' : '确认新增'}
              </Button>
              <Button onClick={() => navigate(`/${portType}/staff/list`)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {!isEdit && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: '#fff7e6',
            borderRadius: 8,
            border: '1px solid #ffd591',
            fontSize: 13,
            color: '#d46b08',
          }}>
            <strong>📌 温馨提示：</strong>
            新增人员的初始密码默认为手机号，可在登录后自行修改。
          </div>
        )}
      </Card>
    </Spin>
  );
};

export default StaffEdit;
