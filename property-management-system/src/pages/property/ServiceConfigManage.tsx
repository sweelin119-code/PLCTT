import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Switch, Space, Modal, Input, message,
  Typography, Popconfirm, Tabs, Tag, Select,
} from 'antd';
import {
  DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  RollbackOutlined, EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getOwnerConfig, updateServiceCategories, updateServices, resetToDefaults,
} from '../../services/ownerConfigService';
import type {
  OwnerServiceCategoryConfig,
  OwnerServiceConfig,
} from '../../services/ownerConfigTypes';

const { Title } = Typography;

// 预设分类颜色
const PRESET_CATEGORY_COLORS = [
  { color: '#007AFF', bg: '#EBF5FF', label: '蓝色' },
  { color: '#FF9500', bg: '#FFF5EB', label: '橙色' },
  { color: '#AF52DE', bg: '#F5EBFF', label: '紫色' },
  { color: '#34C759', bg: '#EBFFEB', label: '绿色' },
  { color: '#FF3B30', bg: '#FFEBEB', label: '红色' },
  { color: '#5856D6', bg: '#F0EBFF', label: '深紫' },
];

// "我的"菜单路径选项
const MINE_MENU_OPTIONS = [
  { value: '/owner/mine/repairs', label: '我的报修' },
  { value: '/owner/mine/payments', label: '缴费记录' },
  { value: '/owner/mine/expresses', label: '我的快递' },
  { value: '/owner/mine/coupons', label: '我的优惠券' },
  { value: '/owner/mine/houses', label: '我的房屋' },
  { value: '/owner/mine/votes', label: '我的投票' },
  { value: '/owner/mine/complaints', label: '我的投诉' },
  { value: '/owner/mine/activities', label: '我的活动' },
];

const ServiceConfigManage: React.FC = () => {
  const [categories, setCategories] = useState<OwnerServiceCategoryConfig[]>([]);
  const [services, setServices] = useState<OwnerServiceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');

  // 分类编辑
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<OwnerServiceCategoryConfig>>({
    title: '', emoji: '🏠', color: PRESET_CATEGORY_COLORS[0].color,
    bg: PRESET_CATEGORY_COLORS[0].bg, enabled: true,
  });

  // 服务编辑
  const [svcModalVisible, setSvcModalVisible] = useState(false);
  const [editingSvc, setEditingSvc] = useState<Partial<OwnerServiceConfig>>({
    categoryId: 1, icon: '🔧', label: '', path: '', desc: '',
    enabled: true, relatedMineMenus: [],
  });

  const loadData = useCallback(() => {
    setLoading(true);
    const config = getOwnerConfig();
    setCategories([...config.serviceCategories].sort((a, b) => a.sortOrder - b.sortOrder));
    setServices([...config.services].sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== 分类操作 =====
  const handleCatSave = () => {
    if (!editingCat.title?.trim()) {
      message.warning('请输入分类名称');
      return;
    }
    const newItem: OwnerServiceCategoryConfig = {
      id: editingCat.id || Date.now(),
      title: editingCat.title || '',
      emoji: editingCat.emoji || '🏠',
      color: editingCat.color || PRESET_CATEGORY_COLORS[0].color,
      bg: editingCat.bg || PRESET_CATEGORY_COLORS[0].bg,
      sortOrder: editingCat.sortOrder || categories.length + 1,
      enabled: editingCat.enabled ?? true,
    };

    let newList: OwnerServiceCategoryConfig[];
    if (editingCat.id) {
      newList = categories.map(c => c.id === editingCat.id ? newItem : c);
    } else {
      newList = [...categories, newItem];
    }

    updateServiceCategories(newList);
    setCategories(newList);
    setCatModalVisible(false);
    setEditingCat({ title: '', emoji: '🏠', color: PRESET_CATEGORY_COLORS[0].color, bg: PRESET_CATEGORY_COLORS[0].bg, enabled: true });
    message.success('分类保存成功');
  };

  const handleCatDelete = (id: number) => {
    // 检查该分类下是否有服务
    const hasServices = services.some(s => s.categoryId === id);
    if (hasServices) {
      message.warning('该分类下存在服务功能，请先删除或移动服务后再删除分类');
      return;
    }
    const newList = categories.filter(c => c.id !== id);
    updateServiceCategories(newList);
    setCategories(newList);
    message.success('分类已删除');
  };

  const handleCatMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...categories];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    newList.forEach((c, i) => { c.sortOrder = i + 1; });
    updateServiceCategories(newList);
    setCategories(newList);
  };

  const handleCatMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const newList = [...categories];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    newList.forEach((c, i) => { c.sortOrder = i + 1; });
    updateServiceCategories(newList);
    setCategories(newList);
  };

  const handleCatToggle = (id: number, checked: boolean) => {
    const newList = categories.map(c => c.id === id ? { ...c, enabled: checked } : c);
    updateServiceCategories(newList);
    setCategories(newList);
  };

  // ===== 服务操作 =====
  const handleSvcSave = () => {
    if (!editingSvc.label?.trim()) {
      message.warning('请输入服务名称');
      return;
    }
    if (!editingSvc.path?.trim()) {
      message.warning('请输入路由路径');
      return;
    }

    const newItem: OwnerServiceConfig = {
      id: editingSvc.id || Date.now(),
      categoryId: editingSvc.categoryId || 1,
      icon: editingSvc.icon || '🔧',
      label: editingSvc.label || '',
      path: editingSvc.path || '',
      desc: editingSvc.desc || '',
      sortOrder: editingSvc.sortOrder || services.length + 1,
      enabled: editingSvc.enabled ?? true,
      relatedMineMenus: editingSvc.relatedMineMenus || [],
    };

    let newList: OwnerServiceConfig[];
    if (editingSvc.id) {
      newList = services.map(s => s.id === editingSvc.id ? newItem : s);
    } else {
      newList = [...services, newItem];
    }

    updateServices(newList);
    setServices(newList);
    setSvcModalVisible(false);
    setEditingSvc({ categoryId: 1, icon: '🔧', label: '', path: '', desc: '', enabled: true, relatedMineMenus: [] });
    message.success('服务保存成功');
  };

  const handleSvcDelete = (id: number) => {
    const newList = services.filter(s => s.id !== id);
    updateServices(newList);
    setServices(newList);
    message.success('服务已删除');
  };

  const handleSvcMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...services];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    newList.forEach((s, i) => { s.sortOrder = i + 1; });
    updateServices(newList);
    setServices(newList);
  };

  const handleSvcMoveDown = (index: number) => {
    if (index === services.length - 1) return;
    const newList = [...services];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    newList.forEach((s, i) => { s.sortOrder = i + 1; });
    updateServices(newList);
    setServices(newList);
  };

  const handleSvcToggle = (id: number, checked: boolean) => {
    const newList = services.map(s => s.id === id ? { ...s, enabled: checked } : s);
    updateServices(newList);
    setServices(newList);
  };

  const handleReset = () => {
    resetToDefaults();
    loadData();
    message.success('已重置为默认配置');
  };

  // 获取分类名称
  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.title || `分类(${id})`;
  };

  // ===== 分类表格列 =====
  const catColumns: ColumnsType<OwnerServiceCategoryConfig> = [
    {
      title: '排序',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Space>
          <Button type="text" size="small" icon={<ArrowUpOutlined />}
            disabled={index === 0} onClick={() => handleCatMoveUp(index)} />
          <Button type="text" size="small" icon={<ArrowDownOutlined />}
            disabled={index === categories.length - 1} onClick={() => handleCatMoveDown(index)} />
        </Space>
      ),
    },
    {
      title: '图标',
      dataIndex: 'emoji',
      width: 60,
      render: (emoji: string) => <span style={{ fontSize: 22 }}>{emoji}</span>,
    },
    { title: '分类名称', dataIndex: 'title', key: 'title' },
    {
      title: '颜色',
      key: 'color',
      render: (_: any, record: OwnerServiceCategoryConfig) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: record.color }} />
          <div style={{ width: 20, height: 20, borderRadius: 6, background: record.bg, border: '1px solid #eee' }} />
        </div>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (enabled: boolean, record: OwnerServiceCategoryConfig) => (
        <Switch checked={enabled} onChange={(checked) => handleCatToggle(record.id, checked)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: OwnerServiceCategoryConfig) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => { setEditingCat({ ...record }); setCatModalVisible(true); }}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleCatDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ===== 服务表格列 =====
  const svcColumns: ColumnsType<OwnerServiceConfig> = [
    {
      title: '排序',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Space>
          <Button type="text" size="small" icon={<ArrowUpOutlined />}
            disabled={index === 0} onClick={() => handleSvcMoveUp(index)} />
          <Button type="text" size="small" icon={<ArrowDownOutlined />}
            disabled={index === services.length - 1} onClick={() => handleSvcMoveDown(index)} />
        </Space>
      ),
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 60,
      render: (icon: string) => <span style={{ fontSize: 22 }}>{icon}</span>,
    },
    { title: '服务名称', dataIndex: 'label', key: 'label' },
    {
      title: '所属分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (catId: number) => (
        <Tag color={categories.find(c => c.id === catId)?.color || '#999'}>
          {getCategoryName(catId)}
        </Tag>
      ),
    },
    { title: '路由', dataIndex: 'path', key: 'path', render: (p: string) => <Tag>{p}</Tag> },
    {
      title: '关联"我的"菜单',
      dataIndex: 'relatedMineMenus',
      key: 'relatedMineMenus',
      render: (menus: string[]) => (
        menus.length > 0
          ? menus.map(m => {
            const opt = MINE_MENU_OPTIONS.find(o => o.value === m);
            return <Tag key={m} color="purple" style={{ marginBottom: 2 }}>{opt?.label || m}</Tag>;
          })
          : <span style={{ color: '#999' }}>无</span>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (enabled: boolean, record: OwnerServiceConfig) => (
        <Switch checked={enabled} onChange={(checked) => handleSvcToggle(record.id, checked)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: OwnerServiceConfig) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => { setEditingSvc({ ...record }); setSvcModalVisible(true); }}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleSvcDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>服务功能配置</Title>
          <Button icon={<RollbackOutlined />} onClick={handleReset}>重置默认</Button>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'categories',
              label: '服务分类管理',
              children: (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <Button type="primary" onClick={() => {
                      setEditingCat({ title: '', emoji: '🏠', color: PRESET_CATEGORY_COLORS[0].color, bg: PRESET_CATEGORY_COLORS[0].bg, enabled: true });
                      setCatModalVisible(true);
                    }}>
                      新增分类
                    </Button>
                  </div>
                  <Table
                    columns={catColumns}
                    dataSource={categories}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'services',
              label: '服务功能管理',
              children: (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <Button type="primary" onClick={() => {
                      setEditingSvc({ categoryId: categories[0]?.id || 1, icon: '🔧', label: '', path: '', desc: '', enabled: true, relatedMineMenus: [] });
                      setSvcModalVisible(true);
                    }}>
                      新增服务
                    </Button>
                  </div>
                  <Table
                    columns={svcColumns}
                    dataSource={services}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* 分类编辑弹窗 */}
      <Modal
        title={editingCat.id ? '编辑分类' : '新增分类'}
        open={catModalVisible}
        onOk={handleCatSave}
        onCancel={() => setCatModalVisible(false)}
        width={480}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>分类名称</div>
            <Input value={editingCat.title} onChange={e => setEditingCat({ ...editingCat, title: e.target.value })} placeholder="例如：物业服务" />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>图标 (Emoji)</div>
            <Input value={editingCat.emoji} onChange={e => setEditingCat({ ...editingCat, emoji: e.target.value })} placeholder="例如：🏠 🛍️ 💬" maxLength={4} />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>颜色方案</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_CATEGORY_COLORS.map((c, i) => (
                <div key={i} onClick={() => setEditingCat({ ...editingCat, color: c.color, bg: c.bg })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                    borderRadius: 6, cursor: 'pointer',
                    border: editingCat.color === c.color ? '2px solid #333' : '2px solid transparent',
                    background: '#fafafa',
                  }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: c.color }} />
                  <span style={{ fontSize: 12 }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>启用</div>
            <Switch checked={editingCat.enabled ?? true} onChange={checked => setEditingCat({ ...editingCat, enabled: checked })} />
          </div>
        </div>
      </Modal>

      {/* 服务编辑弹窗 */}
      <Modal
        title={editingSvc.id ? '编辑服务' : '新增服务'}
        open={svcModalVisible}
        onOk={handleSvcSave}
        onCancel={() => setSvcModalVisible(false)}
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>服务名称</div>
            <Input value={editingSvc.label} onChange={e => setEditingSvc({ ...editingSvc, label: e.target.value })} placeholder="例如：在线报修" />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>图标 (Emoji)</div>
            <Input value={editingSvc.icon} onChange={e => setEditingSvc({ ...editingSvc, icon: e.target.value })} placeholder="例如：🔧 💳" maxLength={4} />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>路由路径</div>
            <Input value={editingSvc.path} onChange={e => setEditingSvc({ ...editingSvc, path: e.target.value })} placeholder="例如：/owner/repair" />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>描述</div>
            <Input value={editingSvc.desc} onChange={e => setEditingSvc({ ...editingSvc, desc: e.target.value })} placeholder="例如：水、电、门窗等维修" />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>所属分类</div>
            <Select
              value={editingSvc.categoryId}
              onChange={v => setEditingSvc({ ...editingSvc, categoryId: v })}
              style={{ width: '100%' }}
              options={categories.map(c => ({ value: c.id, label: c.title }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>关联"我的"菜单（控制"我的"页面显示）</div>
            <Select
              mode="multiple"
              value={editingSvc.relatedMineMenus || []}
              onChange={v => setEditingSvc({ ...editingSvc, relatedMineMenus: v })}
              style={{ width: '100%' }}
              placeholder="选择关联的菜单（可多选）"
              options={MINE_MENU_OPTIONS}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              启用此服务后，关联的"我的"菜单也会同步显示
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>启用</div>
            <Switch checked={editingSvc.enabled ?? true} onChange={checked => setEditingSvc({ ...editingSvc, enabled: checked })} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceConfigManage;
