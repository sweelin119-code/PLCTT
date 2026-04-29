import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Select, Button, Tag, Space,
  message, Typography, Row, Col, Spin, Divider, Upload,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined, SaveOutlined, SendOutlined, UploadOutlined,
} from '@ant-design/icons';
import {
  getManagementRuleById, createManagementRule, updateManagementRule,
  getCategoryList, createRuleVersion,
} from '../../services/portalService';
import RichTextEditor from '../../components/RichTextEditor';

const { Title } = Typography;
const { TextArea } = Input;

const ManagementRuleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [currentVersion, setCurrentVersion] = useState('v1.0');
  const [content, setContent] = useState('');
  const isEdit = !!id;

  useEffect(() => {
    getCategoryList('rule').then(cats => {
      setCategories(cats.map(c => ({ value: c.code, label: c.name })));
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getManagementRuleById(Number(id)).then(data => {
        if (data) {
          form.setFieldsValue({
            ...data,
            publishTime: data.publishTime ? data.publishTime : undefined,
          });
          setContent(data.content || '');
          setCurrentVersion(data.version);
        } else {
          message.error('数据不存在');
          navigate('/government/rule');
        }
      }).finally(() => setLoading(false));
    }
  }, [id, form, navigate]);

  const handleSave = async (publish: boolean = false) => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const cat = categories.find(c => c.value === values.category);

      if (isEdit) {
        // 编辑模式：检查是否需要创建新版本
        const oldData = await getManagementRuleById(Number(id));
        if (oldData && publish && oldData.status === 'published') {
          // 已发布的制度再次发布 -> 创建新版本
          const versionParts = oldData.version.replace('v', '').split('.');
          const major = parseInt(versionParts[0]);
          const minor = parseInt(versionParts[1] || '0');
          const newVersion = `v${major}.${minor + 1}`;

          await createRuleVersion({
            ruleId: Number(id),
            version: newVersion,
            changeLog: values.changeLog || '内容更新',
            createdBy: '当前用户',
          });

          values.version = newVersion;
          setCurrentVersion(newVersion);
        }

        await updateManagementRule(Number(id), {
          ...values,
          content,
          categoryName: cat?.label || values.category,
          status: publish ? 'published' : values.status,
          publishTime: publish ? new Date().toISOString() : values.publishTime,
        });
        message.success('更新成功');
      } else {
        // 新增模式
        const version = 'v1.0';
        await createManagementRule({
          ...values,
          content,
          categoryName: cat?.label || values.category,
          version,
          status: publish ? 'published' : 'draft',
          publishTime: publish ? new Date().toISOString() : undefined,
          effectiveDate: values.effectiveDate || new Date().toISOString().split('T')[0],
        });
        message.success('创建成功');
      }
      navigate('/government/rule');
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        // Form validation error
      } else {
        message.error('保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/government/rule')}
              style={{ marginRight: 12 }}>
              返回列表
            </Button>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0 }}>
              {isEdit ? '编辑规章制度' : '新增规章制度'}
            </Title>
          </Col>
          {isEdit && (
            <Col>
              <Tag color="purple" style={{ fontSize: 14, padding: '4px 12px' }}>
                当前版本：{currentVersion}
              </Tag>
            </Col>
          )}
        </Row>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft',
            tags: [],
          }}
          style={{ maxWidth: 1000 }}
        >
          <Row gutter={24}>
            <Col span={18}>
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input placeholder="请输入规章制度标题" maxLength={200} showCount />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="category" label="分类"
                rules={[{ required: true, message: '请选择分类' }]}>
                <Select placeholder="选择分类" options={categories} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="summary" label="摘要"
            rules={[{ required: true, message: '请输入摘要' }]}>
            <TextArea rows={3} placeholder="请输入摘要内容" maxLength={500} showCount />
          </Form.Item>

          <Form.Item label="正文内容" required>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="请输入正文内容..."
              height={400}
            />
          </Form.Item>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="tags" label="标签">
                <Select mode="tags" placeholder="输入标签后回车" tokenSeparators={[',']} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="effectiveDate" label="生效日期"
                rules={[{ required: true, message: '请选择生效日期' }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="status" label="状态">
                <Select
                  options={[
                    { value: 'draft', label: '草稿' },
                    { value: 'published', label: '已发布' },
                    { value: 'deprecated', label: '已废止' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {isEdit && (
            <Form.Item name="changeLog" label="更新说明（发布时将创建新版本）">
              <TextArea rows={2} placeholder="请简要描述本次更新的内容" />
            </Form.Item>
          )}

          <Form.Item name="attachments" label="附件">
            <Upload>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>

          <Divider />

          <Space>
            <Button icon={<SaveOutlined />} onClick={() => handleSave(false)} loading={saving}>
              保存草稿
            </Button>
            <Button type="primary" icon={<SendOutlined />} onClick={() => handleSave(true)} loading={saving}>
              发布{isEdit && '（创建新版本）'}
            </Button>
            <Button onClick={() => navigate('/government/rule')}>取消</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default ManagementRuleEdit;
