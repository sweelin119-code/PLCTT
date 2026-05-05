import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber, Space, Tag,
  message, Row, Col, Descriptions, Divider, Statistic,
} from 'antd';
import {
  DollarOutlined, SwapOutlined, WalletOutlined,
} from '@ant-design/icons';
import { useCommunity } from '../../../contexts/CommunityContext';
import {
  getOwnerAccounts,
  rechargeOwnerAccount,
  getAccountTransactions,
} from '../../../services/assetService';
import type { OwnerAccount, AccountTransaction, AccountTransactionType, AccountTransactionStatus } from '../../../services/assetTypes';

// 交易类型映射
const TX_TYPE_MAP: Record<AccountTransactionType, { label: string; color: string }> = {
  recharge: { label: '充值', color: 'green' },
  payment: { label: '消费', color: 'red' },
  refund: { label: '退款', color: 'orange' },
  withdraw: { label: '提现', color: 'blue' },
};

// 交易状态映射
const TX_STATUS_MAP: Record<AccountTransactionStatus, { label: string; color: string }> = {
  pending: { label: '处理中', color: 'processing' },
  success: { label: '成功', color: 'success' },
  failed: { label: '失败', color: 'error' },
};

const OwnerAccountManage: React.FC = () => {
  const { currentCommunity } = useCommunity();
  const [accounts, setAccounts] = useState<OwnerAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<OwnerAccount | null>(null);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [rechargeForm] = Form.useForm();

  const loadData = async () => {
    if (!currentCommunity) return;
    setLoading(true);
    try {
      const data = await getOwnerAccounts(currentCommunity.id);
      setAccounts(data);
    } catch {
      message.error('加载账户数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommunity]);

  // 加载交易记录
  const loadTransactions = async (accountId: number) => {
    setTxLoading(true);
    try {
      const data = await getAccountTransactions(accountId);
      setTransactions(data);
    } catch {
      message.error('加载交易记录失败');
    } finally {
      setTxLoading(false);
    }
  };

  // 打开充值弹窗
  const handleOpenRecharge = (account: OwnerAccount) => {
    setSelectedAccount(account);
    rechargeForm.resetFields();
    setRechargeModalVisible(true);
  };

  // 执行充值
  const handleRecharge = async () => {
    try {
      const values = await rechargeForm.validateFields();
      if (!selectedAccount) return;

      const amount = Math.round(values.amount * 100); // 元转分

      const result = await rechargeOwnerAccount(selectedAccount.id, amount, values.remark);
      if (!result) {
        message.error('充值失败');
        return;
      }

      message.success(`充值成功：${values.amount} 元`);
      setRechargeModalVisible(false);
      loadData();
    } catch {
      // validation failed
    }
  };

  // 打开交易记录弹窗
  const handleOpenTxHistory = (account: OwnerAccount) => {
    setSelectedAccount(account);
    loadTransactions(account.id);
    setTxModalVisible(true);
  };

  const columns = [
    {
      title: '业主姓名', dataIndex: 'ownerName', key: 'ownerName', width: 100,
      render: (v: string) => v || '-',
    },
    {
      title: '手机号', dataIndex: 'ownerPhone', key: 'ownerPhone', width: 130,
      render: (v: string) => v || '-',
    },
    {
      title: '账户余额', dataIndex: 'balance', key: 'balance', width: 140,
      render: (v: number) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold', fontSize: 16 }}>
          ¥{(v / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: '累计充值', dataIndex: 'totalRecharge', key: 'totalRecharge', width: 120,
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    {
      title: '累计消费', dataIndex: 'totalPayment', key: 'totalPayment', width: 120,
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    {
      title: '冻结金额', dataIndex: 'freezeAmount', key: 'freezeAmount', width: 120,
      render: (v: number) => (
        <span style={{ color: v > 0 ? '#faad14' : undefined }}>
          ¥{(v / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 70,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '正常' : '冻结'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: any, record: OwnerAccount) => (
        <Space>
          <Button type="link" size="small" icon={<DollarOutlined />} onClick={() => handleOpenRecharge(record)}>
            充值
          </Button>
          <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => handleOpenTxHistory(record)}>
            交易记录
          </Button>
        </Space>
      ),
    },
  ];

  // 交易记录列
  const txColumns = [
    {
      title: '时间', dataIndex: 'createTime', key: 'createTime', width: 160,
    },
    {
      title: '类型', dataIndex: 'transactionType', key: 'transactionType', width: 80,
      render: (v: AccountTransactionType) => {
        const info = TX_TYPE_MAP[v];
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: '金额', dataIndex: 'amount', key: 'amount', width: 120,
      render: (v: number) => {
        const isPositive = v > 0;
        return (
          <span style={{ color: isPositive ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
            {isPositive ? '+' : ''}{'¥' + (v / 100).toFixed(2)}
          </span>
        );
      },
    },
    {
      title: '交易前余额', dataIndex: 'balanceBefore', key: 'balanceBefore', width: 110,
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    {
      title: '交易后余额', dataIndex: 'balanceAfter', key: 'balanceAfter', width: 110,
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (v: AccountTransactionStatus) => {
        const info = TX_STATUS_MAP[v];
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: '备注', dataIndex: 'remark', key: 'remark', width: 180,
      render: (v: string) => v || '-',
    },
    {
      title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 100,
      render: (v: string) => v || '-',
    },
  ];

  if (!currentCommunity) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <WalletOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16 }}>请先选择小区</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card title="业主账户管理">
        <Table
          dataSource={accounts}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 个账户` }}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 充值弹窗 */}
      <Modal
        title={`充值 - ${selectedAccount?.ownerName || ''}`}
        open={rechargeModalVisible}
        onOk={handleRecharge}
        onCancel={() => setRechargeModalVisible(false)}
        width={480}
      >
        {selectedAccount && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="业主姓名">{selectedAccount.ownerName}</Descriptions.Item>
              <Descriptions.Item label="手机号">{selectedAccount.ownerPhone}</Descriptions.Item>
              <Descriptions.Item label="当前余额">
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ¥{(selectedAccount.balance / 100).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="账户状态">
                <Tag color={selectedAccount.status ? 'green' : 'red'}>
                  {selectedAccount.status ? '正常' : '冻结'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
          </div>
        )}
        <Form form={rechargeForm} layout="vertical">
          <Form.Item
            name="amount"
            label="充值金额（元）"
            rules={[
              { required: true, message: '请输入充值金额' },
              { type: 'number', min: 0.01, message: '金额必须大于0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入充值金额"
              min={0.01}
              precision={2}
              prefix="¥"
              size="large"
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="充值备注（选填）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 交易记录弹窗 */}
      <Modal
        title={`交易记录 - ${selectedAccount?.ownerName || ''}`}
        open={txModalVisible}
        onCancel={() => setTxModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedAccount && (
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="当前余额"
                    value={selectedAccount.balance / 100}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="累计充值"
                    value={selectedAccount.totalRecharge / 100}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="累计消费"
                    value={selectedAccount.totalPayment / 100}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="冻结金额"
                    value={selectedAccount.freezeAmount / 100}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>
            <Divider />
          </div>
        )}
        <Table
          dataSource={transactions}
          columns={txColumns}
          rowKey="id"
          loading={txLoading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条记录` }}
          size="small"
          scroll={{ x: 900 }}
        />
      </Modal>
    </div>
  );
};

export default OwnerAccountManage;
