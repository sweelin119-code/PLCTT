import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Table, Switch, Button, message, Space, Tag, Modal, Tooltip, Input } from 'antd';
import { MenuOutlined, ReloadOutlined, SaveOutlined, EditOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { MenuItem } from '../../utils/menuConfig';
import { governmentMenus, propertyMenus, merchantMenus } from '../../utils/menuConfig';

// 端口定义
interface PortInfo {
  key: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  sortOrder: number;
  menus: MenuItem[];
}

const defaultPorts: PortInfo[] = [
  { key: 'government', name: '政府监管端', icon: 'BankOutlined', color: '#1890ff', enabled: true, sortOrder: 1, menus: governmentMenus },
  { key: 'property', name: '物业管理端', icon: 'AppstoreOutlined', color: '#52c41a', enabled: true, sortOrder: 2, menus: propertyMenus },
  { key: 'merchant', name: '商家管理端', icon: 'ShopOutlined', color: '#722ed1', enabled: true, sortOrder: 3, menus: merchantMenus },
  { key: 'owner', name: '业主微信端', icon: 'WechatOutlined', color: '#07c160', enabled: true, sortOrder: 4, menus: [] },
  { key: 'superadmin', name: '超级管理端', icon: 'SettingOutlined', color: '#fa8c16', enabled: true, sortOrder: 5, menus: [] },
];

// 菜单可见性配置（本地存储模拟）
interface MenuVisibility {
  [portKey: string]: {
    [menuKey: string]: boolean;
  };
}

// 菜单名称自定义配置
interface MenuLabels {
  [portKey: string]: {
    [menuKey: string]: string;
  };
}

const STORAGE_KEY = 'plcct_port_config';

const PortConfig: React.FC = () => {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibility>({});
  const [menuLabels, setMenuLabels] = useState<MenuLabels>({});
  const [editMenuVisible, setEditMenuVisible] = useState(false);
  const [editMenuPort, setEditMenuPort] = useState<string>('');
  const [editMenuItems, setEditMenuItems] = useState<MenuItem[]>([]);
  const [saving, setSaving] = useState(false);
  // 正在编辑名称的菜单 key
  const [editingLabelKey, setEditingLabelKey] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState('');
  const inputRef = useRef<any>(null);

  // 初始化
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPorts(parsed.ports || defaultPorts);
        setMenuVisibility(parsed.menuVisibility || {});
        setMenuLabels(parsed.menuLabels || {});
        return;
      } catch {}
    }
    setPorts(defaultPorts);
    // 默认所有菜单可见
    const defaultVisibility: MenuVisibility = {};
    defaultPorts.forEach((p: PortInfo) => {
      defaultVisibility[p.key] = {};
      p.menus.forEach((m: MenuItem) => {
        defaultVisibility[p.key][m.key] = true;
        if (m.children) {
          m.children.forEach((c: MenuItem) => {
            defaultVisibility[p.key][c.key] = true;
          });
        }
      });
    });
    setMenuVisibility(defaultVisibility);
  }, []);

  // 切换端口启用状态
  const handleTogglePort = (portKey: string, checked: boolean) => {
    setPorts(prev => prev.map(p =>
      p.key === portKey ? { ...p, enabled: checked } : p
    ));
  };

  // 打开菜单编辑弹窗
  const handleOpenMenuEdit = (port: PortInfo) => {
    setEditMenuPort(port.key);
    setEditMenuItems(JSON.parse(JSON.stringify(port.menus)));
    setEditingLabelKey(null);
    setEditMenuVisible(true);
  };

  // 切换菜单项可见性
  const handleToggleMenuItem = (menuKey: string, checked: boolean) => {
    setMenuVisibility(prev => ({
      ...prev,
      [editMenuPort]: {
        ...prev[editMenuPort],
        [menuKey]: checked,
      },
    }));
  };

  // 开始编辑菜单名称
  const handleStartEditLabel = (menuKey: string, currentLabel: string) => {
    setEditingLabelKey(menuKey);
    setEditingLabelValue(currentLabel);
    // 在下一个 tick 聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  };

  // 确认编辑菜单名称
  const handleConfirmEditLabel = () => {
    if (!editingLabelKey || !editingLabelValue.trim()) {
      setEditingLabelKey(null);
      return;
    }
    const newLabel = editingLabelValue.trim();
    // 更新 menuLabels
    setMenuLabels(prev => ({
      ...prev,
      [editMenuPort]: {
        ...prev[editMenuPort],
        [editingLabelKey]: newLabel,
      },
    }));
    // 同时更新 editMenuItems 中的 label（用于实时显示）
    const updateLabel = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        const itemKey = item.path || item.key;
        if (itemKey === editingLabelKey) {
          return { ...item, label: newLabel };
        }
        if (item.children) {
          return { ...item, children: updateLabel(item.children) };
        }
        return item;
      });
    };
    setEditMenuItems(prev => updateLabel(prev));
    setEditingLabelKey(null);
  };

  // 取消编辑菜单名称
  const handleCancelEditLabel = () => {
    setEditingLabelKey(null);
  };

  // 关闭菜单编辑弹窗时，将排序后的菜单同步回 ports
  const handleCloseMenuEdit = () => {
    setEditMenuVisible(false);
    setEditingLabelKey(null);
    // 将编辑后的菜单顺序同步到 ports 状态
    setPorts(prev => prev.map(p =>
      p.key === editMenuPort ? { ...p, menus: editMenuItems } : p
    ));
  };

  // 保存配置
  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ports, menuVisibility, menuLabels }));
      message.success('端口配置已保存');
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 重置配置
  const handleReset = () => {
    Modal.confirm({
      title: '确认重置',
      content: '重置后将恢复所有端口的默认配置，确定要重置吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        localStorage.removeItem(STORAGE_KEY);
        setPorts(defaultPorts);
        setMenuLabels({});
        const defaultVisibility: MenuVisibility = {};
        defaultPorts.forEach((p: PortInfo) => {
          defaultVisibility[p.key] = {};
          p.menus.forEach((m: MenuItem) => {
            defaultVisibility[p.key][m.key] = true;
            if (m.children) {
              m.children.forEach((c: MenuItem) => {
                defaultVisibility[p.key][c.key] = true;
              });
            }
          });
        });
        setMenuVisibility(defaultVisibility);
        message.success('已恢复默认配置');
      },
    });
  };

  // 菜单项上移
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setEditMenuItems(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  // 菜单项下移
  const handleMoveDown = useCallback((index: number) => {
    setEditMenuItems(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  // 子菜单项上移
  const handleMoveChildUp = useCallback((parentIndex: number, childIndex: number) => {
    if (childIndex === 0) return;
    setEditMenuItems(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const children = next[parentIndex].children;
      if (!children) return prev;
      [children[childIndex - 1], children[childIndex]] = [children[childIndex], children[childIndex - 1]];
      return next;
    });
  }, []);

  // 子菜单项下移
  const handleMoveChildDown = useCallback((parentIndex: number, childIndex: number) => {
    setEditMenuItems(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const children = next[parentIndex].children;
      if (!children || childIndex >= children.length - 1) return prev;
      [children[childIndex], children[childIndex + 1]] = [children[childIndex + 1], children[childIndex]];
      return next;
    });
  }, []);

  // 获取菜单显示名称（优先使用自定义名称）
  const getMenuLabel = (item: MenuItem): string => {
    const itemKey = item.path || item.key;
    const customLabel = menuLabels[editMenuPort]?.[itemKey];
    return customLabel || item.label;
  };

  // 渲染菜单树（用于弹窗展示）
  const renderMenuItems = (items: MenuItem[], level: number = 0, parentIndex?: number) => {
    return items.map((item: MenuItem, idx: number) => {
      const visKey = item.path || item.key;
      const checked = menuVisibility[editMenuPort]?.[visKey] !== false;
      const isFirst = idx === 0;
      const isLast = idx === items.length - 1;
      const displayLabel = getMenuLabel(item);
      const isEditing = editingLabelKey === visKey;

      return (
        <div key={visKey} style={{ marginLeft: level * 24, marginBottom: 8 }}>
          <Space>
            {/* 排序按钮 - 仅顶层菜单显示 */}
            {level === 0 && (
              <Space size={2}>
                <Tooltip title="上移">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={isFirst}
                    onClick={() => handleMoveUp(idx)}
                    style={{ width: 22, height: 22, minWidth: 22, padding: 0, color: isFirst ? '#ddd' : '#999' }}
                  />
                </Tooltip>
                <Tooltip title="下移">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={isLast}
                    onClick={() => handleMoveDown(idx)}
                    style={{ width: 22, height: 22, minWidth: 22, padding: 0, color: isLast ? '#ddd' : '#999' }}
                  />
                </Tooltip>
              </Space>
            )}
            {/* 子菜单排序按钮 */}
            {level === 1 && parentIndex !== undefined && (
              <Space size={2}>
                <Tooltip title="上移">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={isFirst}
                    onClick={() => handleMoveChildUp(parentIndex, idx)}
                    style={{ width: 20, height: 20, minWidth: 20, padding: 0, color: isFirst ? '#ddd' : '#bbb', fontSize: 11 }}
                  />
                </Tooltip>
                <Tooltip title="下移">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={isLast}
                    onClick={() => handleMoveChildDown(parentIndex, idx)}
                    style={{ width: 20, height: 20, minWidth: 20, padding: 0, color: isLast ? '#ddd' : '#bbb', fontSize: 11 }}
                  />
                </Tooltip>
              </Space>
            )}
            <Switch
              size="small"
              checked={checked}
              onChange={(chk) => handleToggleMenuItem(visKey, chk)}
            />
            {/* 菜单名称 - 可编辑 */}
            {isEditing ? (
              <Input
                ref={inputRef}
                size="small"
                value={editingLabelValue}
                onChange={e => setEditingLabelValue(e.target.value)}
                onPressEnter={handleConfirmEditLabel}
                onBlur={handleConfirmEditLabel}
                style={{ width: 150, fontSize: level === 0 ? 14 : 13 }}
                suffix={
                  <Space size={2}>
                    <CheckOutlined
                      style={{ color: '#52c41a', cursor: 'pointer', fontSize: 12 }}
                      onClick={handleConfirmEditLabel}
                    />
                    <CloseOutlined
                      style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 12 }}
                      onClick={handleCancelEditLabel}
                    />
                  </Space>
                }
              />
            ) : (
              <span
                style={{
                  fontWeight: level === 0 ? 600 : 400,
                  color: level === 0 ? '#000' : '#666',
                  fontSize: level === 0 ? 14 : 13,
                  cursor: 'pointer',
                  borderBottom: '1px dashed #d9d9d9',
                  padding: '0 2px',
                }}
                onClick={() => handleStartEditLabel(visKey, displayLabel)}
                title="点击修改名称"
              >
                {displayLabel}
              </span>
            )}
            {item.path && (
              <Tag style={{ fontSize: 11 }}>{item.path}</Tag>
            )}
          </Space>
          {item.children && renderMenuItems(item.children, level + 1, idx)}
        </div>
      );
    });
  };

  const portColumns = [
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      render: (order: number) => (
        <Space>
          <MenuOutlined style={{ color: '#999', cursor: 'grab' }} />
          <span style={{ color: '#999' }}>{order}</span>
        </Space>
      ),
    },
    {
      title: '端口名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: PortInfo) => (
        <Space>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: record.color,
            opacity: record.enabled ? 1 : 0.3,
          }} />
          <span style={{
            fontWeight: 500,
            color: record.enabled ? '#000' : '#bbb',
          }}>
            {name}
          </span>
          <Tag color={record.color}>{record.key}</Tag>
        </Space>
      ),
    },
    {
      title: '菜单数量',
      key: 'menuCount',
      width: 100,
      render: (_: any, record: PortInfo) => {
        const totalMenus = record.menus.reduce((count, m) => {
          let c = 1;
          if (m.children) c += m.children.length;
          return count + c;
        }, 0);
        return <Tag>{totalMenus} 项</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: PortInfo) => (
        <Switch
          checked={enabled}
          onChange={(chk) => handleTogglePort(record.key, chk)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '菜单配置',
      key: 'menuConfig',
      width: 120,
      render: (_: any, record: PortInfo) => (
        record.menus.length > 0 ? (
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenMenuEdit(record)}
          >
            配置菜单
          </Button>
        ) : (
          <span style={{ color: '#ccc', fontSize: 12 }}>无可配置项</span>
        )
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <span>端口配置</span>
            <span style={{ fontSize: 13, color: '#999', fontWeight: 400 }}>
              控制各业务端口的启用状态和菜单可见性
            </span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              恢复默认
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              保存配置
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={ports}
          columns={portColumns}
          rowKey="key"
          pagination={false}
        />
      </Card>

      {/* 提示信息 */}
      <Card style={{ marginTop: 16, background: '#fafafa' }}>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 2 }}>
          <strong style={{ color: '#333' }}>💡 说明：</strong><br />
          • <strong>启用/禁用</strong>：控制该端口是否在首页入口显示，禁用后用户无法访问该端口<br />
          • <strong>菜单配置</strong>：控制该端口侧边栏菜单项的显示/隐藏，可精细化控制用户可见的功能模块<br />
          • <strong>菜单名称</strong>：点击菜单名称可直接修改，自定义名称会覆盖默认名称<br />
          • <strong>排序</strong>：控制首页入口卡片的排列顺序（目前按固定顺序排列）<br />
          • 配置保存后需刷新页面生效
        </div>
      </Card>

      {/* 菜单配置弹窗 */}
      <Modal
        title={`菜单配置 - ${ports.find(p => p.key === editMenuPort)?.name || ''}`}
        open={editMenuVisible}
        onCancel={handleCloseMenuEdit}
        footer={
          <Button type="primary" onClick={handleCloseMenuEdit}>
            完成
          </Button>
        }
        width={560}
      >
        <div style={{ marginBottom: 16, fontSize: 13, color: '#666' }}>
          勾选需要显示的菜单项，取消勾选则隐藏该菜单；使用 ↑↓ 按钮调整菜单排序；<strong>点击菜单名称可修改名称</strong>：
        </div>
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {editMenuItems.length > 0 ? (
            renderMenuItems(editMenuItems)
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>
              该端口暂无菜单配置
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PortConfig;
