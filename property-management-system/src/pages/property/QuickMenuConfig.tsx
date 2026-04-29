import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Switch, Space, Modal, Input, message,
  Typography, Popconfirm, Tag,
} from 'antd';
import {
  DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  RollbackOutlined, EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getOwnerConfig, updateQuickMenus, resetToDefaults,
} from '../../services/ownerConfigService';
import type { OwnerQuickMenuConfig } from '../../services/ownerConfigTypes';

const { Title } = Typography;

// 预设图标颜色组合
const PRESET_COLORS = [
  { color: '#007AFF', bg: '#EBF5FF', label: '蓝色' },
  { color: '#34C759', bg: '#EBFFEB', label: '绿色' },
  { color: '#FF9500', bg: '#FFF5EB', label: '橙色' },
  { color: '#AF52DE', bg: '#F5EBFF', label: '紫色' },
  { color: '#FF3B30', bg: '#FFEBEB', label: '红色' },
  { color: '#5AC8FA', bg: '#EBF8FF', label: '天蓝' },
  { color: '#FF2D55', bg: '#FFEBF0', label: '粉色' },
  { color: '#5856D6', bg: '#F0EBFF', label: '深紫' },
];

const QuickMenuConfig: React.FC = () => {
  const [menus, setMenus] = useState<OwnerQuickMenuConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<OwnerQuickMenuConfig>>({
    label: '',
    icon: '🔧',
    path: '',
    enabled: true,
    color: PRESET_COLORS[0].color,
    bg: PRESET_COLORS[0].bg,
  });

  const loadData = useCallback(() => {
    setLoading(true);
    const config = getOwnerConfig();
    setMenus([...config.quickMenus].sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = () => {
    if (!editingItem.label?.trim()) {
      message.warning('请输入菜单名称');
      return;
    }
    if (!editingItem.path?.trim()) {
      message.warning('请输入路由路径');
      return;
    }

    const newItem: OwnerQuickMenuConfig = {
      id: editingItem.id || Date.now(),
      label: editingItem.label || '',
      icon: editingItem.icon || '🔧',
      path: editingItem.path || '',
      sortOrder: editingItem.sortOrder || menus.length + 1,
      enabled: editingItem.enabled ?? true,
      color: editingItem.color || PRESET_COLORS[0].color,
      bg: editingItem.bg || PRESET_COLORS[0].bg,
    };

    let newList: OwnerQuickMenuConfig[];
    if (editingItem.id) {
      newList = menus.map(m => m.id === editingItem.id ? newItem : m);
    } else {
      newList = [...menus, newItem];
    }

    updateQuickMenus(newList);
    setMenus(newList);
    setModalVisible(false);
    setEditingItem({ label: '', icon: '🔧', path: '', enabled: true, color: PRESET_COLORS[0].color, bg: PRESET_COLORS[0].bg });
    message.success('保存成功');
  };

  const handleDelete = (id: number) => {
    const newList = menus.filter(m => m.id !== id);
    updateQuickMenus(newList);
    setMenus(newList);
    message.success('已删除');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...menus];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    newList.forEach((m, i) => { m.sortOrder = i + 1; });
    updateQuickMenus(newList);
    setMenus(newList);
  };

  const handleMoveDown = (index: number) => {
    if (index === menus.length - 1) return;
    const newList = [...menus];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    newList.forEach((m, i) => { m.sortOrder = i + 1; });
    updateQuickMenus(newList);
    setMenus(newList);
  };

  const handleToggle = (id: number, checked: boolean) => {
    const newList = menus.map(m => m.id === id ? { ...m, enabled: checked } : m);
    updateQuickMenus(newList);
    setMenus(newList);
  };

  const handleReset = () => {
    resetToDefaults();
    loadData();
    message.success('已重置为默认配置');
  };

  const columns: ColumnsType<OwnerQuickMenuConfig> = [
    {
      title: '排序',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            onClick={() => handleMoveUp(index)}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={index === menus.length - 1}
            onClick={() => handleMoveDown(index)}
          />
        </Space>
      ),
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon: string) => <span style={{ fontSize: 22 }}>{icon}</span>,
    },
    {
      title: '菜单名称',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => <Tag>{path}</Tag>,
    },
    {
      title: '颜色',
      key: 'color',
      render: (_: any, record: OwnerQuickMenuConfig) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6,
            background: record.color,
          }} />
          <div style={{
            width: 20, height: 20, borderRadius: 6,
            background: record.bg,
            border: '1px solid #eee',
          }} />
        </div>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: OwnerQuickMenuConfig) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggle(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: OwnerQuickMenuConfig) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem({ ...record });
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>常用菜单配置</Title>
          <Space>
            <Button icon={<RollbackOutlined />} onClick={handleReset}>重置默认</Button>
            <Button type="primary" onClick={() => {
              setEditingItem({ label: '', icon: '🔧', path: '', enabled: true, color: PRESET_COLORS[0].color, bg: PRESET_COLORS[0].bg });
              setModalVisible(true);
            }}>
              新增菜单
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={menus}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingItem.id ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>菜单名称</div>
            <Input
              value={editingItem.label}
              onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
              placeholder="例如：报修、缴费"
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>图标 (Emoji)</div>
            <Input
              value={editingItem.icon}
              onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })}
              placeholder="例如：🔧 💳 🚗"
              maxLength={4}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>路由路径</div>
            <Input
              value={editingItem.path}
              onChange={e => setEditingItem({ ...editingItem, path: e.target.value })}
              placeholder="例如：/owner/repair"
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>颜色方案</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((c, i) => (
                <div
                  key={i}
                  onClick={() => setEditingItem({ ...editingItem, color: c.color, bg: c.bg })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: editingItem.color === c.color ? '2px solid #333' : '2px solid transparent',
                    background: '#fafafa',
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: c.color }} />
                  <span style={{ fontSize: 12 }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>启用</div>
            <Switch
              checked={editingItem.enabled ?? true}
              onChange={checked => setEditingItem({ ...editingItem, enabled: checked })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuickMenuConfig;
