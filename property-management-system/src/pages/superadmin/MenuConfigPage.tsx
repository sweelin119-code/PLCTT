import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, message, Space, Tag, Tooltip, Input, Spin, Switch } from 'antd';
import { ArrowLeftOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { MenuItem } from '../../utils/menuConfig';
import { governmentMenus, propertyMenus, merchantMenus, mergeDefaultMenus } from '../../utils/menuConfig';

// 端口信息映射
const PORT_INFO: Record<string, { name: string; color: string }> = {
  government: { name: '政府监管端', color: '#1890ff' },
  property: { name: '物业管理端', color: '#52c41a' },
  merchant: { name: '商家管理端', color: '#722ed1' },
};

// 默认菜单映射
const DEFAULT_MENUS: Record<string, MenuItem[]> = {
  government: governmentMenus,
  property: propertyMenus,
  merchant: merchantMenus,
};

interface MenuVisibility {
  [portKey: string]: {
    [menuKey: string]: boolean;
  };
}

interface MenuLabels {
  [portKey: string]: {
    [menuKey: string]: string;
  };
}

const STORAGE_KEY = 'plcct_port_config';

interface PortConfigData {
  ports: Array<{
    key: string;
    name: string;
    icon: string;
    color: string;
    enabled: boolean;
    sortOrder: number;
    menus: MenuItem[];
  }>;
  menuVisibility: MenuVisibility;
  menuLabels: MenuLabels;
}

const MenuConfigPage: React.FC = () => {
  const { portKey } = useParams<{ portKey: string }>();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibility>({});
  const [menuLabels, setMenuLabels] = useState<MenuLabels>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  // 正在编辑名称的菜单 key
  const [editingLabelKey, setEditingLabelKey] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState('');
  const inputRef = useRef<any>(null);

  const portInfo = portKey ? PORT_INFO[portKey] : null;

  // 初始化
  useEffect(() => {
    if (!portKey || !PORT_INFO[portKey]) {
      message.error('无效的端口');
      navigate('/superadmin/port-config', { replace: true });
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    let visibility: MenuVisibility = {};
    let labels: MenuLabels = {};

    if (saved) {
      try {
        const parsed: PortConfigData = JSON.parse(saved);
        visibility = parsed.menuVisibility || {};
        labels = parsed.menuLabels || {};
        // 从配置中获取该端口的菜单（含自定义排序）
        const portConfig = parsed.ports?.find(p => p.key === portKey);
        if (portConfig && portConfig.menus && portConfig.menus.length > 0) {
          // 将已保存的菜单与默认菜单合并，确保代码新增的菜单项也能显示在配置页面中
          const merged = mergeDefaultMenus(portConfig.menus, DEFAULT_MENUS[portKey] || []);
          setMenuItems(JSON.parse(JSON.stringify(merged)));
        } else {
          // 使用默认菜单
          setMenuItems(JSON.parse(JSON.stringify(DEFAULT_MENUS[portKey] || [])));
        }
      } catch {
        setMenuItems(JSON.parse(JSON.stringify(DEFAULT_MENUS[portKey] || [])));
      }
    } else {
      setMenuItems(JSON.parse(JSON.stringify(DEFAULT_MENUS[portKey] || [])));
    }

    setMenuVisibility(visibility);
    setMenuLabels(labels);
    setLoading(false);
  }, [portKey, navigate]);

  // 切换菜单项可见性
  const handleToggleMenuItem = (menuKey: string, checked: boolean) => {
    setMenuVisibility(prev => ({
      ...prev,
      [portKey!]: {
        ...prev[portKey!],
        [menuKey]: checked,
      },
    }));
  };

  // 开始编辑菜单名称
  const handleStartEditLabel = (menuKey: string, currentLabel: string) => {
    setEditingLabelKey(menuKey);
    setEditingLabelValue(currentLabel);
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
    setMenuLabels(prev => ({
      ...prev,
      [portKey!]: {
        ...prev[portKey!],
        [editingLabelKey]: newLabel,
      },
    }));
    // 同时更新 menuItems 中的 label（用于实时显示）
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
    setMenuItems(prev => updateLabel(prev));
    setEditingLabelKey(null);
  };

  // 取消编辑菜单名称
  const handleCancelEditLabel = () => {
    setEditingLabelKey(null);
  };

  // 保存配置
  const handleSave = () => {
    setSaving(true);
    try {
      // 读取现有配置
      const saved = localStorage.getItem(STORAGE_KEY);
      let config: PortConfigData;
      if (saved) {
        config = JSON.parse(saved);
      } else {
        // 创建默认配置
        config = {
          ports: [
            { key: 'government', name: '政府监管端', icon: 'BankOutlined', color: '#1890ff', enabled: true, sortOrder: 1, menus: governmentMenus },
            { key: 'property', name: '物业管理端', icon: 'AppstoreOutlined', color: '#52c41a', enabled: true, sortOrder: 2, menus: propertyMenus },
            { key: 'merchant', name: '商家管理端', icon: 'ShopOutlined', color: '#722ed1', enabled: true, sortOrder: 3, menus: merchantMenus },
            { key: 'owner', name: '业主微信端', icon: 'WechatOutlined', color: '#07c160', enabled: true, sortOrder: 4, menus: [] },
            { key: 'superadmin', name: '超级管理端', icon: 'SettingOutlined', color: '#fa8c16', enabled: true, sortOrder: 5, menus: [] },
          ],
          menuVisibility: {},
          menuLabels: {},
        };
      }

      // 更新该端口的菜单（含排序）
      config.ports = config.ports.map(p =>
        p.key === portKey ? { ...p, menus: menuItems } : p
      );
      // 更新可见性和标签
      config.menuVisibility = { ...config.menuVisibility, ...menuVisibility };
      config.menuLabels = { ...config.menuLabels, ...menuLabels };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      message.success('菜单配置已保存');
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    navigate('/superadmin/port-config');
  };

  // 菜单项上移
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setMenuItems(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  // 菜单项下移
  const handleMoveDown = useCallback((index: number) => {
    setMenuItems(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  // 子菜单项上移
  const handleMoveChildUp = useCallback((parentIndex: number, childIndex: number) => {
    if (childIndex === 0) return;
    setMenuItems(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const children = next[parentIndex].children;
      if (!children) return prev;
      [children[childIndex - 1], children[childIndex]] = [children[childIndex], children[childIndex - 1]];
      return next;
    });
  }, []);

  // 子菜单项下移
  const handleMoveChildDown = useCallback((parentIndex: number, childIndex: number) => {
    setMenuItems(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      const children = next[parentIndex].children;
      if (!children || childIndex >= children.length - 1) return prev;
      [children[childIndex], children[childIndex + 1]] = [children[childIndex + 1], children[childIndex]];
      return next;
    });
  }, []);

  // 获取菜单显示名称
  const getMenuLabel = (item: MenuItem): string => {
    const itemKey = item.path || item.key;
    const customLabel = menuLabels[portKey!]?.[itemKey];
    return customLabel || item.label;
  };

  // 渲染菜单树
  const renderMenuItems = (items: MenuItem[], level: number = 0, parentIndex?: number) => {
    return items.map((item: MenuItem, idx: number) => {
      const visKey = item.path || item.key;
      const checked = menuVisibility[portKey!]?.[visKey] !== false;
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginRight: 8 }}
            />
            <span>菜单配置 - {portInfo?.name || portKey}</span>
            {portInfo && (
              <Tag color={portInfo.color} style={{ marginLeft: 8 }}>{portKey}</Tag>
            )}
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            保存配置
          </Button>
        }
      >
        <div style={{ marginBottom: 16, fontSize: 13, color: '#666', lineHeight: 2 }}>
          <strong>操作说明：</strong><br />
          • <strong>勾选/取消勾选</strong> Switch 开关控制菜单项的显示与隐藏<br />
          • 使用 <strong>↑↓ 按钮</strong> 调整菜单项的排列顺序<br />
          • <strong>点击菜单名称</strong> 可修改显示名称（自定义名称会覆盖默认名称）<br />
          • 配置完成后点击右上角 <strong>"保存配置"</strong> 按钮生效
        </div>
        <div style={{ minHeight: 200 }}>
          {menuItems.length > 0 ? (
            renderMenuItems(menuItems)
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: 48 }}>
              该端口暂无菜单配置
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MenuConfigPage;
