import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Switch, Space, Modal, Select, Tag, message,
  Typography, Popconfirm, Spin,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getOwnerConfig, updateBannerConfig, resetToDefaults,
} from '../../services/ownerConfigService';
import type { OwnerBannerConfig } from '../../services/ownerConfigTypes';
import {
  getPolicyInfoList,
  getManagementRuleList,
} from '../../services/portalService';
import type { PolicyInfo, ManagementRule } from '../../services/portalTypes';

const { Title } = Typography;

// 预设的Banner样式选项
const PRESET_STYLES = [
  { gradient: 'linear-gradient(135deg, #007AFF, #5856D6)', emoji: '📋', label: '蓝色科技' },
  { gradient: 'linear-gradient(135deg, #34C759, #30B350)', emoji: '🛡️', label: '绿色安全' },
  { gradient: 'linear-gradient(135deg, #FF9500, #FF6B00)', emoji: '📢', label: '橙色通知' },
  { gradient: 'linear-gradient(135deg, #AF52DE, #7B2FBE)', emoji: '👔', label: '紫色规范' },
  { gradient: 'linear-gradient(135deg, #FF3B30, #FF9500)', emoji: '🔥', label: '红色紧急' },
  { gradient: 'linear-gradient(135deg, #5AC8FA, #007AFF)', emoji: '📰', label: '天蓝资讯' },
];

const BannerConfigManage: React.FC = () => {
  const [banners, setBanners] = useState<OwnerBannerConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<OwnerBannerConfig>>({
    sourceType: 'policy',
    sourceId: undefined,
    title: '',
    subtitle: '',
    gradient: PRESET_STYLES[0].gradient,
    emoji: PRESET_STYLES[0].emoji,
    enabled: true,
  });

  // 社区内容选择相关
  const [contentType, setContentType] = useState<'policy' | 'rule'>('policy');
  const [policyList, setPolicyList] = useState<PolicyInfo[]>([]);
  const [ruleList, setRuleList] = useState<ManagementRule[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // 加载社区内容列表
  const loadContentList = useCallback(async (type: 'policy' | 'rule') => {
    setContentLoading(true);
    try {
      if (type === 'policy') {
        const result = await getPolicyInfoList({ pageSize: 100 });
        setPolicyList(result.list);
      } else {
        const result = await getManagementRuleList({ pageSize: 100 });
        setRuleList(result.list);
      }
    } finally {
      setContentLoading(false);
    }
  }, []);

  // 当弹窗打开时加载内容列表
  useEffect(() => {
    if (modalVisible) {
      loadContentList(contentType);
    }
  }, [modalVisible, contentType, loadContentList]);

  const loadData = useCallback(() => {
    setLoading(true);
    const config = getOwnerConfig();
    setBanners([...config.banners].sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 选择内容项后自动填充标题和副标题
  const handleContentSelect = (sourceId: number | undefined) => {
    setEditingItem(prev => ({ ...prev, sourceId }));

    if (!sourceId) return;

    if (contentType === 'policy') {
      const item = policyList.find(p => p.id === sourceId);
      if (item) {
        setEditingItem(prev => ({
          ...prev,
          sourceId,
          title: item.title,
          subtitle: item.summary.length > 50 ? item.summary.substring(0, 50) + '...' : item.summary,
        }));
      }
    } else {
      const item = ruleList.find(r => r.id === sourceId);
      if (item) {
        setEditingItem(prev => ({
          ...prev,
          sourceId,
          title: item.title,
          subtitle: item.summary.length > 50 ? item.summary.substring(0, 50) + '...' : item.summary,
        }));
      }
    }
  };

  const handleSave = () => {
    if (!editingItem.sourceId) {
      message.warning('请选择社区内容');
      return;
    }
    if (!editingItem.title?.trim()) {
      message.warning('标题不能为空');
      return;
    }
    const newItem: OwnerBannerConfig = {
      id: editingItem.id || Date.now(),
      sourceType: contentType,
      sourceId: editingItem.sourceId,
      title: editingItem.title || '',
      subtitle: editingItem.subtitle || '',
      gradient: editingItem.gradient || PRESET_STYLES[0].gradient,
      emoji: editingItem.emoji || PRESET_STYLES[0].emoji,
      sortOrder: editingItem.sortOrder || banners.length + 1,
      enabled: editingItem.enabled ?? true,
    };

    let newList: OwnerBannerConfig[];
    if (editingItem.id) {
      newList = banners.map(b => b.id === editingItem.id ? newItem : b);
    } else {
      newList = [...banners, newItem];
    }

    updateBannerConfig(newList);
    setBanners(newList);
    setModalVisible(false);
    setEditingItem({ sourceType: 'policy', sourceId: undefined, title: '', subtitle: '', gradient: PRESET_STYLES[0].gradient, emoji: PRESET_STYLES[0].emoji, enabled: true });
    setContentType('policy');
    message.success('保存成功');
  };

  const handleDelete = (id: number) => {
    const newList = banners.filter(b => b.id !== id);
    updateBannerConfig(newList);
    setBanners(newList);
    message.success('已删除');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...banners];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    newList.forEach((b, i) => { b.sortOrder = i + 1; });
    updateBannerConfig(newList);
    setBanners(newList);
  };

  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const newList = [...banners];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    newList.forEach((b, i) => { b.sortOrder = i + 1; });
    updateBannerConfig(newList);
    setBanners(newList);
  };

  const handleToggle = (id: number, checked: boolean) => {
    const newList = banners.map(b => b.id === id ? { ...b, enabled: checked } : b);
    updateBannerConfig(newList);
    setBanners(newList);
  };

  const handleReset = () => {
    resetToDefaults();
    loadData();
    message.success('已重置为默认配置');
  };

  const columns: ColumnsType<OwnerBannerConfig> = [
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
            disabled={index === banners.length - 1}
            onClick={() => handleMoveDown(index)}
          />
        </Space>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: OwnerBannerConfig) => (
        <Space>
          <span style={{ fontSize: 20 }}>{record.emoji}</span>
          <span style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '副标题',
      dataIndex: 'subtitle',
      key: 'subtitle',
      ellipsis: true,
      width: 260,
    },
    {
      title: '来源',
      key: 'source',
      render: (_: any, record: OwnerBannerConfig) => (
        <Tag color={record.sourceType === 'policy' ? 'blue' : 'green'}>
          {record.sourceType === 'policy' ? '政策资讯' : '规章制度'}
        </Tag>
      ),
    },
    {
      title: '预览',
      key: 'preview',
      render: (_: any, record: OwnerBannerConfig) => (
        <div style={{
          width: 120,
          height: 50,
          borderRadius: 8,
          background: record.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {record.emoji} {record.title.substring(0, 8)}
        </div>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: OwnerBannerConfig) => (
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
      render: (_: any, record: OwnerBannerConfig) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setContentType(record.sourceType);
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
          <Title level={4} style={{ margin: 0 }}>Banner配置管理</Title>
          <Space>
            <Button icon={<RollbackOutlined />} onClick={handleReset}>重置默认</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setContentType('policy');
              setEditingItem({ sourceType: 'policy', sourceId: undefined, title: '', subtitle: '', gradient: PRESET_STYLES[0].gradient, emoji: PRESET_STYLES[0].emoji, enabled: true });
              setModalVisible(true);
            }}>
              新增Banner
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={banners}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingItem.id ? '编辑Banner' : '新增Banner'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          setContentType('policy');
        }}
        width={640}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 内容类型选择 */}
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>内容类型</div>
            <Select
              value={contentType}
              onChange={v => {
                setContentType(v as 'policy' | 'rule');
                setEditingItem(prev => ({ ...prev, sourceType: v as 'policy' | 'rule', sourceId: undefined, title: '', subtitle: '' }));
              }}
              style={{ width: '100%' }}
              options={[
                { value: 'policy', label: '政策资讯' },
                { value: 'rule', label: '规章制度' },
              ]}
            />
          </div>

          {/* 社区内容选择 */}
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>选择内容</div>
            <Spin spinning={contentLoading}>
              <Select
                value={editingItem.sourceId}
                onChange={handleContentSelect}
                style={{ width: '100%' }}
                placeholder="请搜索并选择内容"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string || '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent="暂无数据"
                options={
                  contentType === 'policy'
                    ? policyList.map(p => ({
                        value: p.id,
                        label: `${p.title} [${p.categoryName}]`,
                      }))
                    : ruleList.map(r => ({
                        value: r.id,
                        label: `${r.title} [${r.categoryName}]`,
                      }))
                }
              />
            </Spin>
          </div>

          {/* 自动填充的标题（可手动修改） */}
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>
              展示标题 <span style={{ fontWeight: 400, color: '#999', fontSize: 12 }}>（自动填充，可手动修改）</span>
            </div>
            <input
              value={editingItem.title || ''}
              onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
              placeholder="选择内容后自动填充"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}
            />
          </div>

          {/* 自动填充的副标题（可手动修改） */}
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>
              展示副标题 <span style={{ fontWeight: 400, color: '#999', fontSize: 12 }}>（自动填充，可手动修改）</span>
            </div>
            <input
              value={editingItem.subtitle || ''}
              onChange={e => setEditingItem({ ...editingItem, subtitle: e.target.value })}
              placeholder="选择内容后自动填充"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}
            />
          </div>

          {/* Banner样式选择 */}
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Banner样式</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_STYLES.map((style, i) => (
                <div
                  key={i}
                  onClick={() => setEditingItem({ ...editingItem, gradient: style.gradient, emoji: style.emoji })}
                  style={{
                    width: 80,
                    height: 50,
                    borderRadius: 8,
                    background: style.gradient,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 20,
                    border: editingItem.gradient === style.gradient ? '3px solid #333' : '3px solid transparent',
                    transition: 'border 0.2s',
                  }}
                  title={style.label}
                >
                  {style.emoji}
                </div>
              ))}
            </div>
          </div>

          {/* 启用开关 */}
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

export default BannerConfigManage;
