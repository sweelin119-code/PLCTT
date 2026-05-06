import React, { useState, useCallback, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Select, Space, Card, Input,
  Tag, message, Popconfirm, Switch, Alert, Tree, Spin, Empty,
} from 'antd';
import {
  PlusOutlined, ImportOutlined, DownloadOutlined,
  UploadOutlined, CarOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode, EventDataNode } from 'antd/es/tree';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getParkingFeeItems, createParkingFeeItem, updateParkingFeeItem,
  deleteParkingFeeItem, importParkingFeeItems,
} from '../../../services/parkingFeeService';
import { getFeeItems, getChargeRules } from '../../../services/feeService';
import { getParkingSpaces } from '../../../services/assetService';
import type { ParkingFeeItem, ParkingFeeItemImportResult, FeeItem, ChargeRule } from '../../../services/feeTypes';

// ===== 车位类型映射 =====
const PARKING_TYPE_MAP: Record<string, { label: string; color: string }> = {
  fixed: { label: '固定车位', color: 'blue' },
  temporary: { label: '临时车位', color: 'orange' },
  mechanical: { label: '机械车位', color: 'purple' },
  mother_child: { label: '子母车位', color: 'cyan' },
};

// ===== 树节点 key 编码规则 =====
// type-{typeKey}  → 车位类型分组
// parking-{id}    → 具体车位

const parseNodeKey = (key: string): { type: 'typeGroup' | 'parking'; id?: string; parkingId?: number } | null => {
  const parts = key.split('-');
  if (parts.length < 2) return null;
  if (parts[0] === 'type') {
    return { type: 'typeGroup', id: parts.slice(1).join('-') };
  }
  if (parts[0] === 'parking') {
    return { type: 'parking', parkingId: parseInt(parts[1]) };
  }
  return null;
};

const ParkingFeeItemManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const projectId = currentCommunity?.id;

  // ===== 左侧树 =====
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);
  const [selectedParkingCode, setSelectedParkingCode] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // ===== 右侧列表 =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ParkingFeeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [feeItemFilter, setFeeItemFilter] = useState<number | undefined>();

  // 费用项列表
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [chargeRules, setChargeRules] = useState<ChargeRule[]>([]);

  // 新增/编辑弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ParkingFeeItem | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // 导入弹窗
  const [importVisible, setImportVisible] = useState(false);
  const [importResult, setImportResult] = useState<ParkingFeeItemImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');

  // ===== 构建左侧树 =====
  const buildTree = useCallback(async () => {
    if (!projectId) return;
    setTreeLoading(true);
    try {
      // 获取所有车位
      const parkingResult = await getParkingSpaces({ projectId, pageSize: 500 });
      const allParkings = parkingResult.list;

      // 按类型分组
      const grouped: Record<string, { label: string; color: string; list: typeof allParkings }> = {};
      for (const [key, meta] of Object.entries(PARKING_TYPE_MAP)) {
        grouped[key] = { ...meta, list: [] };
      }
      // 未匹配类型的归入"其他"
      grouped['other'] = { label: '其他', color: 'default', list: [] };

      for (const p of allParkings) {
        if (grouped[p.type]) {
          grouped[p.type].list.push(p);
        } else {
          grouped['other'].list.push(p);
        }
      }

      const treeNodes: DataNode[] = Object.entries(grouped)
        .filter(([, g]) => g.list.length > 0)
        .map(([key, group]) => ({
          key: `type-${key}`,
          title: `${group.label}（${group.list.length}个）`,
          icon: <EnvironmentOutlined style={{ fontSize: 14 }} />,
          children: group.list.map(p => ({
            key: `parking-${p.id}`,
            title: (
              <span style={{ fontSize: 13 }}>
                {p.code}
                <span style={{ color: '#999', marginLeft: 6, fontSize: 12 }}>
                  {p.area ? `${p.area}` : p.sizeArea ? `${p.sizeArea}㎡` : ''}
                  {p.ownerName ? ` · ${p.ownerName}` : ''}
                </span>
              </span>
            ),
            icon: <CarOutlined style={{ fontSize: 14 }} />,
            isLeaf: true,
          })),
        }));

      setTreeData(treeNodes);
      setExpandedKeys(treeNodes.map(n => n.key));
    } finally {
      setTreeLoading(false);
    }
  }, [projectId]);

  // ===== 加载右侧数据 =====
  const loadData = useCallback(async (p: number) => {
    if (!projectId || !selectedParkingId) {
      setData([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await getParkingFeeItems({
        projectId,
        page: p,
        pageSize,
        feeItemId: feeItemFilter || undefined,
      });
      const filtered = res.list.filter(item => item.parkingId === selectedParkingId);
      setData(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedParkingId, pageSize, feeItemFilter]);

  // ===== 加载费用项和收费标准 =====
  const loadFeeItems = useCallback(async () => {
    if (!projectId) return;
    const [items, rules] = await Promise.all([
      getFeeItems(projectId),
      getChargeRules(projectId),
    ]);
    setFeeItems(items);
    setChargeRules(rules);
  }, [projectId]);

  // ===== 初始化 =====
  useEffect(() => {
    loadFeeItems();
    buildTree();
  }, [loadFeeItems, buildTree]);

  useEffect(() => {
    setPage(1);
  }, [selectedParkingId, feeItemFilter]);

  useEffect(() => {
    loadData(page);
  }, [loadData, page]);

  // ===== 树节点选择 =====
  const onSelect = (keys: React.Key[], info: { node: EventDataNode<DataNode> }) => {
    const key = keys[0] as string | undefined;
    if (!key) {
      setSelectedParkingId(null);
      setSelectedParkingCode('');
      return;
    }
    const parsed = parseNodeKey(key);
    if (parsed && parsed.type === 'parking' && parsed.parkingId) {
      setSelectedParkingId(parsed.parkingId);
      // 从节点 title 中提取车位编号
      const nodeTitle = info.node.title as React.ReactNode;
      let code = '';
      if (React.isValidElement(nodeTitle)) {
        const children = (nodeTitle.props as any)?.children;
        if (Array.isArray(children)) {
          code = children[0] || '';
        }
      }
      setSelectedParkingCode(code);
    } else {
      setSelectedParkingId(null);
      setSelectedParkingCode('');
    }
  };

  // ===== CRUD 操作 =====
  const handleAdd = () => {
    if (!selectedParkingId) {
      message.warning('请先在左侧选择一个车位');
      return;
    }
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ parkingId: selectedParkingId });
    setModalVisible(true);
  };

  const handleEdit = (record: ParkingFeeItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deleteParkingFeeItem(id);
    message.success('删除成功');
    loadData(page);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingItem) {
        await updateParkingFeeItem(editingItem.id, values);
        message.success('更新成功');
      } else {
        await createParkingFeeItem({ ...values, projectId: projectId!, enabled: true });
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData(page);
    } catch (err: any) {
      if (err.errorFields) return;
      message.error('操作失败');
    } finally {
      setSaving(false);
    }
  };

  // ===== 导入 =====
  const handleImport = async () => {
    if (!importText.trim()) {
      message.warning('请先粘贴导入数据');
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const lines = importText.trim().split('\n').filter(l => l.trim());
      const rows: { parkingId: number; feeItemId: number; customPrice?: number }[] = [];
      const errors: { row: number; message: string }[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(',').map(s => s.trim());
        const rowNum = idx + 1;
        if (parts.length < 2) {
          errors.push({ row: rowNum, message: '格式错误，至少需要"车位ID,费用项ID"' });
          return;
        }
        const parkingId = parseInt(parts[0]);
        const feeItemId = parseInt(parts[1]);
        if (isNaN(parkingId)) {
          errors.push({ row: rowNum, message: `车位ID"${parts[0]}"不是有效数字` });
          return;
        }
        if (isNaN(feeItemId)) {
          errors.push({ row: rowNum, message: `费用项ID"${parts[1]}"不是有效数字` });
          return;
        }
        const customPrice = parts.length >= 3 && parts[2] ? parseFloat(parts[2]) : undefined;
        rows.push({ parkingId, feeItemId, customPrice });
      });

      if (rows.length === 0) {
        setImportResult({ success: 0, failed: errors.length, errors });
        return;
      }

      const result = await importParkingFeeItems(projectId!, rows);
      result.errors = [...errors, ...result.errors];
      result.failed += errors.length;
      setImportResult(result);
      if (result.success > 0) {
        message.success(`成功导入 ${result.success} 条关联`);
        loadData(1);
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `车位ID,费用项ID,自定义单价(可选)
1,2,50
2,2,50
3,2`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '车位费用项关联导入模板.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== 表格列 =====
  const columns: ColumnsType<ParkingFeeItem> = [
    {
      title: '费用项',
      dataIndex: 'feeItemName',
      key: 'feeItemName',
      width: 140,
      render: (name: string, record) => (
        <Tag color={record.feeItemCategory === 'property_fee' ? 'blue'
          : record.feeItemCategory === 'parking_fee' ? 'green'
          : record.feeItemCategory === 'public_share' ? 'orange'
          : record.feeItemCategory === 'agency' ? 'purple'
          : 'default'}>
          {name}
        </Tag>
      ),
    },
    {
      title: '自定义单价',
      dataIndex: 'customPrice',
      key: 'customPrice',
      width: 120,
      render: (v: number | undefined) => v ? `¥${v.toFixed(2)}` : <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (v: boolean) => v ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ParkingFeeItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除该关联？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', gap: 16 }}>
      {/* ===== 左侧树 ===== */}
      <Card
        size="small"
        title={<span><EnvironmentOutlined /> 车位结构</span>}
        style={{ width: 300, minWidth: 300, overflow: 'auto' }}
        styles={{ body: { padding: '8px 12px', overflow: 'auto', height: 'calc(100% - 38px)' } }}
      >
        {treeLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : (
          <Tree
            treeData={treeData}
            showIcon
            defaultExpandAll
            expandedKeys={expandedKeys}
            onExpand={keys => setExpandedKeys(keys)}
            onSelect={onSelect}
            style={{ fontSize: 13 }}
          />
        )}
      </Card>

      {/* ===== 右侧详情 ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 选中车位信息 */}
        {selectedParkingId ? (
          <Card size="small" style={{ marginBottom: 12, flexShrink: 0 }}>
            <Space>
              <CarOutlined style={{ fontSize: 18, color: '#52c41a' }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>{selectedParkingCode}</span>
              <Tag color="blue">车位ID: {selectedParkingId}</Tag>
            </Space>
          </Card>
        ) : (
          <Card size="small" style={{ marginBottom: 12, flexShrink: 0 }}>
            <Empty description="请在左侧选择一个车位" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        )}

        {/* 操作栏 + 表格 */}
        {selectedParkingId && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ marginBottom: 12, flexShrink: 0 }}>
              <Space wrap>
                <Select
                  placeholder="筛选费用项"
                  value={feeItemFilter}
                  onChange={v => setFeeItemFilter(v)}
                  allowClear
                  style={{ width: 180 }}
                  options={feeItems.map(f => ({ label: f.name, value: f.id }))}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增费用</Button>
                <Button icon={<ImportOutlined />} onClick={() => setImportVisible(true)}>导入</Button>
                <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>下载模板</Button>
              </Space>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: page,
                  pageSize,
                  total,
                  showSizeChanger: true,
                  showTotal: t => `共 ${t} 条`,
                  onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                }}
                scroll={{ x: 660 }}
                size="small"
                locale={{ emptyText: '该车位暂无费用项关联，请点击"新增费用"添加' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== 新增/编辑弹窗 ===== */}
      <Modal
        title={editingItem ? '编辑车位费用' : '新增车位费用'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="parkingId" label="车位" rules={[{ required: true, message: '请选择车位' }]}>
            <Input disabled placeholder="已自动填充为选中车位" />
          </Form.Item>
          <Form.Item name="feeItemId" label="费用项" rules={[{ required: true, message: '请选择费用项' }]}>
            <Select
              placeholder="请选择费用项"
              options={(() => {
                // 车位费用：只显示收费标准中房屋类型为"车位"的费用项
                const allowedIds = new Set(
                  chargeRules
                    .filter(r => r.houseType === 'parking')
                    .map(r => r.feeItemId)
                );
                return feeItems
                  .filter(f => allowedIds.has(f.id))
                  .map(f => ({ label: `${f.name} (${f.code})`, value: f.id }));
              })()}
            />
          </Form.Item>
          <Form.Item name="customPrice" label="自定义单价（可选）">
            <Input type="number" step="0.01" placeholder="不填则使用收费标准中的价格" />
          </Form.Item>
          <Form.Item name="enabled" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ===== 导入弹窗 ===== */}
      <Modal
        title="导入车位费用"
        open={importVisible}
        onCancel={() => {
          setImportVisible(false);
          setImportResult(null);
          setImportText('');
        }}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Alert
          message="导入说明"
          description={
            <div>
              <p>1. 每行一条数据，格式：<code>车位ID,费用项ID,自定义单价(可选)</code></p>
              <p>2. 系统会自动验证车位和费用项是否存在</p>
              <p>3. 已存在的关联不会重复导入</p>
              <p>4. 可先下载模板查看格式</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Input.TextArea
          rows={8}
          placeholder={`请粘贴导入数据，格式：车位ID,费用项ID,自定义单价(可选)
示例：
1,2,50
2,2,50
3,2`}
          value={importText}
          onChange={e => setImportText(e.target.value)}
        />
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" icon={<UploadOutlined />} onClick={handleImport} loading={importing}>
            开始导入
          </Button>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>下载模板</Button>
        </Space>

        {importResult && (
          <Card size="small" style={{ marginTop: 16 }}>
            <Space>
              <Tag color="green">成功: {importResult.success}</Tag>
              <Tag color="red">失败: {importResult.failed}</Tag>
            </Space>
            {importResult.errors.length > 0 && (
              <div style={{ marginTop: 8, maxHeight: 200, overflow: 'auto' }}>
                {importResult.errors.map((err, idx) => (
                  <div key={idx} style={{ color: '#ff4d4f', fontSize: 12, padding: '2px 0' }}>
                    第{err.row}行: {err.message}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default ParkingFeeItemManage;
