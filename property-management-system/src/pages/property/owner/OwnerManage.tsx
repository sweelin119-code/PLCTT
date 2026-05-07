import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm,
  message, Row, Col, Descriptions, Drawer, DatePicker,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, TeamOutlined, TagsOutlined } from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  deleteOwner,
  getAllOwnerTags,
} from '../../../services/assetService';
import type { Owner } from '../../../services/assetService';
import dayjs from 'dayjs';

const OwnerManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // 筛选
  const [keyword, setKeyword] = useState('');
  const [filterTag, setFilterTag] = useState<string | undefined>();
  const [filterDataSource, setFilterDataSource] = useState<string | undefined>();
  const [allTags, setAllTags] = useState<string[]>([]);

  // 弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailOwner, setDetailOwner] = useState<Owner | null>(null);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    if (!currentCommunity) return;
    setLoading(true);
    try {
      const result = await getOwners({
        projectId: currentCommunity.id,
        keyword: keyword || undefined,
        tags: filterTag ? [filterTag] : undefined,
        status: filterDataSource as any,
        page,
        pageSize,
      });
      setOwners(result.list);
      setTotal(result.total);
    } catch {
      message.error('加载业主数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommunity, filterTag, filterDataSource, page]);

  // 加载标签列表
  useEffect(() => {
    if (!currentCommunity) return;
    getAllOwnerTags(currentCommunity.id).then(setAllTags);
  }, [currentCommunity]);

  const handleAdd = () => {
    setEditingOwner(null);
    form.resetFields();
    form.setFieldsValue({
      projectId: currentCommunity?.id,
      tags: [],
      status: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: Owner) => {
    setEditingOwner(record);
    form.setFieldsValue({
      ...record,
      birthday: record.birthday ? dayjs(record.birthday) : undefined,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOwner(id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const owner = await getOwnerById(id);
      setDetailOwner(owner);
      setDetailVisible(true);
    } catch {
      message.error('加载详情失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
      };
      if (editingOwner) {
        await updateOwner(editingOwner.id, data);
        message.success('更新成功');
      } else {
        await createOwner(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch {
      // validation failed
    }
  };

  const dataSourceLabelMap: Record<string, string> = {
    manual: '录入',
    gov_sync: '同步',
    import: '导入',
    owner_register: '登记',
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 90 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 120 },
    {
      title: '性别', dataIndex: 'gender', key: 'gender', width: 60,
      render: (v: string) => v === 'male' ? '男' : v === 'female' ? '女' : '-',
    },
    { title: '身份证号', dataIndex: 'idCard', key: 'idCard', width: 160, render: (v: string) => v || '-' },
    {
      title: '标签', dataIndex: 'tags', key: 'tags', width: 160,
      render: (tags: string[]) => (
        <Space size={4} wrap>
          {tags.length > 0 ? tags.map(t => <Tag key={t} color="blue">{t}</Tag>) : '-'}
        </Space>
      ),
    },
    { title: '房屋数', dataIndex: 'houseCount', key: 'houseCount', width: 70 },
    { title: '车位数', dataIndex: 'parkingCount', key: 'parkingCount', width: 70 },
    {
      title: '数据来源', dataIndex: 'dataSource', key: 'dataSource', width: 80,
      render: (v: string) => dataSourceLabelMap[v] || v,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 60,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '正常' : '禁用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: any, record: Owner) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定禁用该业主？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>禁用</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!currentCommunity) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <TeamOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16 }}>请先选择小区</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="业主档案管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增业主
          </Button>
        }
      >
        {/* 筛选栏 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input.Search
              placeholder="搜索姓名/手机号/身份证"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => setPage(1)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="标签筛选"
              allowClear
              style={{ width: '100%' }}
              value={filterTag}
              onChange={(v) => { setFilterTag(v); setPage(1); }}
              options={allTags.map(t => ({ value: t, label: t }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="数据来源"
              allowClear
              style={{ width: '100%' }}
              value={filterDataSource}
              onChange={(v) => { setFilterDataSource(v); setPage(1); }}
              options={Object.entries(dataSourceLabelMap).map(([value, label]) => ({ value, label }))}
            />
          </Col>
        </Row>

        <Table
          dataSource={owners}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: (t) => `共 ${t} 人`,
            onChange: (p) => setPage(p),
          }}
          size="small"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingOwner ? '编辑业主' : '新增业主'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入业主姓名' }]}>
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
            <Col span={12}>
              <Form.Item name="idCard" label="身份证号">
                <Input placeholder="请输入身份证号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="gender" label="性别">
                <Select allowClear options={[
                  { value: 'male', label: '男' },
                  { value: 'female', label: '女' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="birthday" label="出生日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="nationality" label="民族">
                <Input placeholder="如：汉族" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nativePlace" label="籍贯">
                <Input placeholder="如：浙江杭州" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="education" label="学历">
                <Select allowClear options={[
                  { value: '初中', label: '初中' },
                  { value: '高中', label: '高中' },
                  { value: '大专', label: '大专' },
                  { value: '本科', label: '本科' },
                  { value: '硕士', label: '硕士' },
                  { value: '博士', label: '博士' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="profession" label="职业">
                <Input placeholder="如：教师、医生" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="标签">
                <Select mode="tags" placeholder="输入标签后回车" options={allTags.map(t => ({ value: t, label: t }))} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="业主详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={520}
      >
        {detailOwner && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="姓名" span={2}>{detailOwner.name}</Descriptions.Item>
            <Descriptions.Item label="手机号" span={2}>{detailOwner.phone}</Descriptions.Item>
            <Descriptions.Item label="性别">{detailOwner.gender === 'male' ? '男' : detailOwner.gender === 'female' ? '女' : '-'}</Descriptions.Item>
            <Descriptions.Item label="出生日期">{detailOwner.birthday || '-'}</Descriptions.Item>
            <Descriptions.Item label="身份证号" span={2}>{detailOwner.idCard || '-'}</Descriptions.Item>
            <Descriptions.Item label="民族">{detailOwner.nationality || '-'}</Descriptions.Item>
            <Descriptions.Item label="籍贯">{detailOwner.nativePlace || '-'}</Descriptions.Item>
            <Descriptions.Item label="学历">{detailOwner.education || '-'}</Descriptions.Item>
            <Descriptions.Item label="职业">{detailOwner.profession || '-'}</Descriptions.Item>
            <Descriptions.Item label="标签" span={2}>
              {detailOwner.tags.length > 0
                ? detailOwner.tags.map(t => <Tag key={t} color="blue">{t}</Tag>)
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="关联房屋" span={2}>
              {detailOwner.houseCount ? `${detailOwner.houseCount} 套` : '无'}
            </Descriptions.Item>
            <Descriptions.Item label="关联车位" span={2}>
              {detailOwner.parkingCount ? `${detailOwner.parkingCount} 个` : '无'}
            </Descriptions.Item>
            <Descriptions.Item label="数据来源" span={2}>{dataSourceLabelMap[detailOwner.dataSource] || detailOwner.dataSource}</Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>{detailOwner.createTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>{detailOwner.updateTime}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default OwnerManage;
