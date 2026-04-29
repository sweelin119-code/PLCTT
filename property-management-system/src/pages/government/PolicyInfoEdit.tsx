import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Select, Button, Space, Switch,
  message, Typography, Row, Col, Spin, Divider, Upload,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined, SaveOutlined, SendOutlined, UploadOutlined,
} from '@ant-design/icons';
import { getPolicyInfoById, createPolicyInfo, updatePolicyInfo, getCategoryList } from '../../services/portalService';
import RichTextEditor from '../../components/RichTextEditor';

const { Title } = Typography;
const { TextArea } = Input;

const PolicyInfoEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [content, setContent] = useState('');
  const isEdit = !!id;

  useEffect(() => {
    getCategoryList('policy').then(cats => {
      setCategories(cats.map(c => ({ value: c.code, label: c.name })));
    });
  }, []);

  // 编辑模式加载数据
  useEffect(() => {
    if (id) {
      setLoading(true);
      getPolicyInfoById(Number(id)).then(data => {
        if (data) {
          form.setFieldsValue({
            ...data,
            publishTime: data.publishTime ? data.publishTime : undefined,
          });
          setContent(data.content || '');
        } else {
          message.error('数据不存在');
          navigate('/government/policy/info');
        }
      }).finally(() => setLoading(false));
    }
  }, [id, form, navigate]);

  // 保存
  const handleSave = async (publish: boolean = false) => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const data = {
        ...values,
        content,
        status: publish ? 'published' : (values.status || 'draft'),
        publishTime: publish ? new Date().toISOString() : (values.publishTime || undefined),
      };

      // 获取分类名称
      const cat = categories.find(c => c.value === values.category);
      data.categoryName = cat?.label || values.category;

      if (isEdit) {
        await updatePolicyInfo(Number(id), data);
        message.success('更新成功');
      } else {
        await createPolicyInfo(data);
        message.success('创建成功');
      }
      navigate('/government/policy/info');
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        // Form validation error, already shown by antd
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
        {/* 头部 */}
        <Row align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/government/policy/info')}
              style={{ marginRight: 12 }}>
              返回列表
            </Button>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0 }}>
              {isEdit ? '编辑政策资讯' : '新增政策资讯'}
            </Title>
          </Col>
        </Row>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft',
            isTop: false,
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
                <Input placeholder="请输入政策资讯标题" maxLength={200} showCount />
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
            <TextArea rows={3} placeholder="请输入摘要内容，将展示在列表卡片上" maxLength={500} showCount />
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
              <Form.Item name="isTop" label="置顶" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="状态">
                <Select
                  options={[
                    { value: 'draft', label: '草稿' },
                    { value: 'published', label: '已发布' },
                    { value: 'archived', label: '已归档' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="attachments" label="附件">
            <Upload>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>

          <Divider />

          {/* 操作按钮 */}
          <Space>
            <Button icon={<SaveOutlined />} onClick={() => handleSave(false)} loading={saving}>
              保存草稿
            </Button>
            <Button type="primary" icon={<SendOutlined />} onClick={() => handleSave(true)} loading={saving}>
              发布
            </Button>
            <Button onClick={() => navigate('/government/policy/info')}>取消</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default PolicyInfoEdit;
