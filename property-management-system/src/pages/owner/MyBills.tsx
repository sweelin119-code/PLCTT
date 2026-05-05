import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RightOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { BillItem, BillOverview, BillType } from '../../services/ownerBillService';
import * as ownerBillService from '../../services/ownerBillService';

// ===== 类型定义 =====
type TabKey = 'all' | BillType;

interface TabItem {
  key: TabKey;
  label: string;
}

const tabs: TabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'property', label: '物业费' },
  { key: 'water', label: '水费' },
  { key: 'electric', label: '电费' },
  { key: 'parking', label: '停车费' },
];

// ===== 工具函数 =====
const formatAmount = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

const getStatusConfig = (status: BillItem['status']) => {
  switch (status) {
    case 'pending':
      return { label: '待缴费', color: '#FF9500', bg: '#FFF5EB', icon: <ClockCircleOutlined /> };
    case 'paid':
      return { label: '已缴清', color: '#34C759', bg: '#EBFFEB', icon: <CheckCircleOutlined /> };
    case 'overdue':
      return { label: '已逾期', color: '#FF3B30', bg: '#FFEBEB', icon: <ExclamationCircleOutlined /> };
  }
};

const getBillTypeColor = (type: BillType): string => {
  switch (type) {
    case 'property': return '#007AFF';
    case 'water': return '#34C759';
    case 'electric': return '#FF9500';
    case 'parking': return '#AF52DE';
  }
};

const getBillTypeBg = (type: BillType): string => {
  switch (type) {
    case 'property': return '#EBF5FF';
    case 'water': return '#EBFFEB';
    case 'electric': return '#FFF5EB';
    case 'parking': return '#F5EBFF';
  }
};

// ===== 主组件 =====
const MyBills: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [overview, setOverview] = useState<BillOverview | null>(null);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayHistory, setShowPayHistory] = useState(false);

  // 当前模拟的房屋ID
  const currentHouseId = 'H1001';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, billsData] = await Promise.all([
        ownerBillService.getBillOverview(currentHouseId),
        ownerBillService.getBills(currentHouseId, {
          billType: activeTab === 'all' ? undefined : activeTab,
        }),
      ]);
      setOverview(overviewData);
      setBills(billsData.list);
    } catch (err) {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 切换Tab
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
  };

  // 去缴费
  const handlePay = (bill: BillItem) => {
    navigate(`/owner/bills/pay/${bill.id}`, { state: { bill } });
  };

  // 查看详情
  const handleDetail = (bill: BillItem) => {
    navigate(`/owner/bills/detail/${bill.id}`, { state: { bill } });
  };

  // 渲染加载状态
  if (loading && !overview) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #f2f2f7',
          borderTopColor: '#007AFF', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }} />
        <div style={{ fontSize: 14, color: '#8e8e93' }}>加载中...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😵</div>
        <div style={{ fontSize: 15, color: '#8e8e93', marginBottom: 20 }}>{error}</div>
        <div
          onClick={loadData}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 24px', background: '#007AFF', color: '#fff',
            borderRadius: 22, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          重新加载
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* ===== 账单总览头部 ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        margin: 0,
        padding: '20px 20px 28px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景装饰 */}
        <div style={{
          position: 'absolute', right: -30, top: -30,
          width: 140, height: 140, borderRadius: 70,
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', right: 40, bottom: -20,
          width: 80, height: 80, borderRadius: 40,
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4, fontWeight: 500 }}>
            总待缴金额
          </div>
          <div style={{
            fontSize: 36, fontWeight: 700, letterSpacing: -1,
            marginBottom: 16,
          }}>
            {formatAmount(overview?.totalPending || 0)}
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>本月应缴</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {formatAmount(overview?.monthAmount || 0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>欠费笔数</div>
              <div style={{
                fontSize: 18, fontWeight: 600,
                color: (overview?.overdueCount || 0) > 0 ? '#FFD60A' : '#fff',
              }}>
                {(overview?.overdueCount || 0) > 0
                  ? `${overview?.overdueCount}笔`
                  : '无欠费'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 分类Tab ===== */}
      <div style={{
        background: '#fff',
        padding: '0 12px',
        borderBottom: '1px solid #f2f2f7',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          display: 'flex',
          gap: 0,
          overflow: 'auto',
          scrollbarWidth: 'none',
        }}>
          {tabs.map(tab => (
            <div
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                flex: 1,
                minWidth: 60,
                textAlign: 'center',
                padding: '14px 8px 12px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #007AFF' : '2px solid transparent',
                color: activeTab === tab.key ? '#007AFF' : '#8e8e93',
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 400,
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* ===== 账单列表 ===== */}
      <div style={{ padding: '12px 12px 0' }}>
        {bills.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 15, color: '#8e8e93', fontWeight: 500 }}>
              暂无账单
            </div>
            <div style={{ fontSize: 13, color: '#c7c7cc', marginTop: 4 }}>
              该分类下暂无待处理账单
            </div>
          </div>
        ) : (
          bills.map(bill => {
            const statusConfig = getStatusConfig(bill.status);
            const typeColor = getBillTypeColor(bill.billType);
            const typeBg = getBillTypeBg(bill.billType);

            return (
              <div
                key={bill.id}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  marginBottom: 12,
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  border: '1px solid #f2f2f7',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* 账单卡片头部 */}
                <div style={{ padding: '16px 16px 12px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* 类型标签 */}
                      <div style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: typeBg, color: typeColor,
                        fontSize: 12, fontWeight: 600,
                      }}>
                        {bill.billTypeName}
                      </div>
                      {/* 费用周期 */}
                      <div style={{
                        fontSize: 13, color: '#1d1d1f', fontWeight: 500,
                      }}>
                        {bill.period.replace('-', '年')}月
                      </div>
                    </div>
                    {/* 状态标签 */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, fontWeight: 600,
                      color: statusConfig.color,
                      background: statusConfig.bg,
                      padding: '3px 10px', borderRadius: 12,
                    }}>
                      {statusConfig.icon}
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* 金额 */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', letterSpacing: -0.5 }}>
                      {formatAmount(bill.amount)}
                    </div>
                    <div style={{ fontSize: 12, color: '#8e8e93' }}>
                      截止 {bill.dueDate}
                    </div>
                  </div>

                  {/* 已缴金额提示 */}
                  {bill.status === 'paid' && bill.paidAt && (
                    <div style={{
                      marginTop: 8, fontSize: 12, color: '#34C759',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <CheckCircleOutlined style={{ fontSize: 12 }} />
                      已缴清 · {bill.paidAt?.split('T')[0]}
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div style={{
                  borderTop: '1px solid #f2f2f7',
                  padding: '10px 16px',
                  display: 'flex', justifyContent: 'flex-end', gap: 10,
                }}>
                  <div
                    onClick={() => handleDetail(bill)}
                    style={{
                      padding: '6px 16px', borderRadius: 18,
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      color: '#007AFF', background: '#EBF5FF',
                      transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    查看详情
                  </div>
                  {(bill.status === 'pending' || bill.status === 'overdue') && (
                    <div
                      onClick={() => handlePay(bill)}
                      style={{
                        padding: '6px 20px', borderRadius: 18,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        color: '#fff', background: '#007AFF',
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                      去缴费
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== 底部操作区 ===== */}
      <div style={{ padding: '8px 12px 20px' }}>
        {/* 缴费记录入口 */}
        <div
          onClick={() => setShowPayHistory(!showPayHistory)}
          style={{
            background: '#fff', borderRadius: 14,
            padding: '14px 16px', marginBottom: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            border: '1px solid #f2f2f7',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>缴费记录</span>
          </div>
          <RightOutlined style={{ fontSize: 14, color: '#c7c7cc' }} />
        </div>

        {/* 电子发票入口 */}
        <div
          onClick={() => navigate('/owner/bills/invoices')}
          style={{
            background: '#fff', borderRadius: 14,
            padding: '14px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            border: '1px solid #f2f2f7',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🧾</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>电子发票</span>
          </div>
          <RightOutlined style={{ fontSize: 14, color: '#c7c7cc' }} />
        </div>
      </div>

      {/* 底部留白 */}
      <div style={{ height: 16 }} />
    </div>
  );
};

export default MyBills;
