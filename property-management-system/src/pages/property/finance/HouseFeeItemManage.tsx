import React, { useState, useCallback, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Select, Space, Card, Input,
  Tag, message, Popconfirm, Switch, Alert, Tree, Spin, Empty,
} from 'antd';
import {
  PlusOutlined, ImportOutlined, DownloadOutlined,
  UploadOutlined, HomeOutlined, ApartmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode, EventDataNode } from 'antd/es/tree';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getHouseFeeItems, createHouseFeeItem, updateHouseFeeItem,
  deleteHouseFeeItem, importHouseFeeItems, getFeeItems, getChargeRules,
} from '../../../services/feeService';
import { getBuildings, getUnits, getHouses, getHouseById } from '../../../services/assetService';
import type { HouseFeeItem, HouseFeeItemImportResult, FeeItem, ChargeRule } from '../../../services/feeTypes';

// ===== 树节点 key 编码规则 =====
// building-{id}   → 楼栋
// unit-{id}       → 单元
// house-{id}      → 房屋

const parseNodeKey = (key: string): { type: 'building' | 'unit' | 'house'; id: number } | null => {
  const parts = key.split('-');
  if (parts.length < 2) return null;
  const type = parts[0] as 'building' | 'unit' | 'house';
  const id = parseInt(parts[1]);
  if (isNaN(id)) return null;
  return { type, id };
};

const HouseFeeItemManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const projectId = currentCommunity?.id;

  // ===== 左侧树 =====
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [selectedHouseName, setSelectedHouseName] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // ===== 右侧列表 =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HouseFeeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [feeItemFilter, setFeeItemFilter] = useState<number | undefined>();

  // 费用项列表
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [chargeRules, setChargeRules] = useState<ChargeRule[]>([]);

  // 新增/编辑弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<HouseFeeItem | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // 导入弹窗
  const [importVisible, setImportVisible] = useState(false);
  const [importResult, setImportResult] = useState<HouseFeeItemImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');

  // ===== 构建左侧树 =====
  const buildTree = useCallback(async () => {
    if (!projectId) return;
    setTreeLoading(true);
    try {
      const buildings = await getBuildings(projectId);
      const treeNodes: DataNode[] = [];

      for (const building of buildings) {
        const units = await getUnits(building.id);
        const children: DataNode[] = [];

        for (const unit of units) {
          const houseResult = await getHouses({
            projectId,
            buildingId: building.id,
            unitId: unit.id,
            pageSize: 500,
          });

          const houseNodes: DataNode[] = houseResult.list.map(house => ({
            key: `house-${house.id}`,
            title: (
              <span style={{ fontSize: 13 }}>
                {house.fullName}
                <span style={{ color: '#999', marginLeft: 6, fontSize: 12 }}>
                  {house.area ? `${house.area}㎡` : ''}
                </span>
              </span>
            ),
            icon: <HomeOutlined style={{ fontSize: 14 }} />,
            isLeaf: true,
          }));

          children.push({
            key: `unit-${unit.id}`,
            title: `${unit.name}（${houseResult.total}户）`,
            icon: <ApartmentOutlined style={{ fontSize: 14 }} />,
            children: houseNodes,
          });
        }

        treeNodes.push({
          key: `building-${building.id}`,
          title: `${building.name}（${building.aliasName || ''}）`,
          icon: <ApartmentOutlined style={{ fontSize: 14 }} />,
          children,
        });
      }

      setTreeData(treeNodes);
      setExpandedKeys(treeNodes.map(n => n.key));
    } finally {
      setTreeLoading(false);
    }
  }, [projectId]);

  // ===== 加载右侧数据 =====
  const loadData = useCallback(async (p: number) => {
    if (!projectId || !selectedHouseId) {
      setData([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await getHouseFeeItems({
        projectId,
        page: p,
        pageSize,
        feeItemId: feeItemFilter || undefined,
      });
      const filtered = res.list.filter(item => item.houseId === selectedHouseId);
      setData(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedHouseId, pageSize, feeItemFilter]);

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
  }, [selectedHouseId, feeItemFilter]);

  useEffect(() => {
    loadData(page);
  }, [loadData, page]);

  // ===== 树节点选择 =====
  const onSelect = (keys: React.Key[], info: { node: EventDataNode<DataNode> }) => {
    const key = keys[0] as string | undefined;
    if (!key) {
      setSelectedHouseId(null);
      setSelectedHouseName('');
      return;
    }
    const parsed = parseNodeKey(key);
    if (parsed && parsed.type === 'house') {
      setSelectedHouseId(parsed.id);
      // 从节点 title 中提取房屋名称
      const nodeTitle = info.node.title as React.ReactNode;
      let houseName = '';
      if (React.isValidElement(nodeTitle)) {
        // 从 span 中提取文本
        const children = (nodeTitle.props as any)?.children;
        if (Array.isArray(children)) {
          houseName = children[0] || '';
        }
      }
      setSelectedHouseName(houseName);
    } else {
      setSelectedHouseId(null);
      setSelectedHouseName('');
    }
  };

  // ===== CRUD 操作 =====
  const handleAdd = () => {
    if (!selectedHouseId) {
      message.warning('请先在左侧选择一个房屋');
      return;
    }
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ houseId: selectedHouseId });
    setModalVisible(true);
  };

  const handleEdit = (record: HouseFeeItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deleteHouseFeeItem(id);
    message.success('删除成功');
    loadData(page);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingItem) {
        await updateHouseFeeItem(editingItem.id, values);
        message.success('更新成功');
      } else {
        await createHouseFeeItem({ ...values, projectId: projectId!, enabled: true });
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
      const rows: { houseId: number; feeItemId: number; customPrice?: number }[] = [];
      const errors: { row: number; message: string }[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(',').map(s => s.trim());
        const rowNum = idx + 1;
        if (parts.length < 2) {
          errors.push({ row: rowNum, message: '格式错误，至少需要"房屋ID,费用项ID"' });
          return;
        }
        const houseId = parseInt(parts[0]);
        const feeItemId = parseInt(parts[1]);
        if (isNaN(houseId)) {
          errors.push({ row: rowNum, message: `房屋ID"${parts[0]}"不是有效数字` });
          return;
        }
        if (isNaN(feeItemId)) {
          errors.push({ row: rowNum, message: `费用项ID"${parts[1]}"不是有效数字` });
          return;
        }
        const customPrice = parts.length >= 3 && parts[2] ? parseFloat(parts[2]) : undefined;
        rows.push({ houseId, feeItemId, customPrice });
      });

      if (rows.length === 0) {
        setImportResult({ success: 0, failed: errors.length, errors });
        return;
      }

      const result = await importHouseFeeItems(projectId!, rows);
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
    const template = `房屋ID,费用项ID,自定义单价(可选)
1,1,2.5
1,3,25
2,1,2.5`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '房屋费用项关联导入模板.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== 表格列 =====
  const columns: ColumnsType<HouseFeeItem> = [
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
      render: (_: any, record: HouseFeeItem) => (
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
        title={<span><ApartmentOutlined /> 房屋结构</span>}
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
        {/* 选中房屋信息 */}
        {selectedHouseId ? (
          <Card size="small" style={{ marginBottom: 12, flexShrink: 0 }}>
            <Space>
              <HomeOutlined style={{ fontSize: 18, color: '#1890ff' }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>{selectedHouseName}</span>
              <Tag color="blue">房屋ID: {selectedHouseId}</Tag>
            </Space>
          </Card>
        ) : (
          <Card size="small" style={{ marginBottom: 12, flexShrink: 0 }}>
            <Empty description="请在左侧选择一个房屋" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        )}

        {/* 操作栏 + 表格 */}
        {selectedHouseId && (
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
                locale={{ emptyText: '该房屋暂无费用项关联，请点击"新增费用"添加' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== 新增/编辑弹窗 ===== */}
      <Modal
        title={editingItem ? '编辑房屋费用' : '新增房屋费用'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="houseId" label="房屋" rules={[{ required: true, message: '请选择房屋' }]}>
            <Input disabled placeholder="已自动填充为选中房屋" />
          </Form.Item>
          <Form.Item name="feeItemId" label="费用项" rules={[{ required: true, message: '请选择费用项' }]}>
            <Select
              placeholder="请选择费用项"
              options={(() => {
                // 房屋费用：只显示收费标准中房屋类型非"车位"的费用项
                const allowedIds = new Set(
                  chargeRules
                    .filter(r => r.houseType !== 'parking')
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
        title="导入房屋费用"
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
              <p>1. 每行一条数据，格式：<code>房屋ID,费用项ID,自定义单价(可选)</code></p>
              <p>2. 系统会自动验证房屋和费用项是否存在</p>
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
          placeholder={`请粘贴导入数据，格式：房屋ID,费用项ID,自定义单价(可选)
示例：
1,1,2.5
1,3,25
2,1`}
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

export default HouseFeeItemManage;
