import React, { useState, useEffect } from 'react';
import { Card, Table, Switch, Button, message, Space, Tag } from 'antd';
import { MenuOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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

// 菜单可见性配置
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

/**
 * 保存配置到 localStorage
 */
function saveConfig(ports: PortInfo[], menuVisibility: MenuVisibility, menuLabels: MenuLabels) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ports, menuVisibility, menuLabels }));
}

/**
 * 从 localStorage 加载配置
 */
function loadConfig(): { ports: PortInfo[]; menuVisibility: MenuVisibility; menuLabels: MenuLabels } | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return null;
}

const PortConfig: React.FC = () => {
  const navigate = useNavigate();
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibility>({});
  const [menuLabels, setMenuLabels] = useState<MenuLabels>({});

  // 初始化
  useEffect(() => {
    const config = loadConfig();
    if (config) {
      setPorts(config.ports || defaultPorts);
      setMenuVisibility(config.menuVisibility || {});
      setMenuLabels(config.menuLabels || {});
      return;
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

  // 自动保存（任何状态变化时触发）
  useEffect(() => {
    if (ports.length > 0) {
      saveConfig(ports, menuVisibility, menuLabels);
    }
  }, [ports, menuVisibility, menuLabels]);

  // 切换端口启用状态
  const handleTogglePort = (portKey: string, checked: boolean) => {
    setPorts(prev => prev.map(p =>
      p.key === portKey ? { ...p, enabled: checked } : p
    ));
  };

  // 跳转到菜单配置页面
  const handleConfigMenu = (portKey: string) => {
    navigate(`/superadmin/port-config/${portKey}/menus`);
  };

  // 重置配置
  const handleReset = () => {
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
            onClick={() => handleConfigMenu(record.key)}
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
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            恢复默认
          </Button>
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
          • <strong>菜单配置</strong>：点击"配置菜单"跳转到独立配置页面，可控制菜单项的显示/隐藏、调整排序、修改名称<br />
          • <strong>菜单名称</strong>：在配置页面点击菜单名称可直接修改，自定义名称会覆盖默认名称<br />
          • <strong>保存生效</strong>：在配置页面修改完成后，点击"保存配置"按钮即可生效
        </div>
      </Card>
    </div>
  );
};

export default PortConfig;
