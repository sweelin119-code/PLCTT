import React, { useState, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import type { InvoiceRecord, BillItem } from '../../services/ownerBillService';
import * as ownerBillService from '../../services/ownerBillService';

const formatAmount = (amount: number): string => `¥${amount.toFixed(2)}`;

const InvoiceApply: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const currentHouseId = 'H1001';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [invoiceData, billsData] = await Promise.all([
          ownerBillService.getInvoices(currentHouseId),
          ownerBillService.getBills(currentHouseId, { status: 'paid' }),
        ]);
        setInvoices(invoiceData);
        setBills(billsData.list);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 可开票的已缴费账单（未申请开票的）
  const billableBills = bills.filter(b => b.invoiceStatus === 'none');

  const handleApply = async (billId: string) => {
    setApplyingId(billId);
    try {
      await ownerBillService.applyInvoice(billId);
      const [invoiceData] = await Promise.all([
        ownerBillService.getInvoices(currentHouseId),
      ]);
      setInvoices(invoiceData);
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
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

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* ===== 已开发票 ===== */}
      <div style={{ padding: '12px 12px 0' }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: '#1d1d1f',
          marginBottom: 12, padding: '0 4px',
        }}>
          已开发票
        </div>

        {invoices.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 14, padding: 32,
            textAlign: 'center', border: '1px solid #f2f2f7',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            <div style={{ fontSize: 14, color: '#8e8e93' }}>暂无发票记录</div>
          </div>
        ) : (
          invoices.map(inv => (
            <div
              key={inv.id}
              style={{
                background: '#fff', borderRadius: 14, marginBottom: 12,
                padding: 16, border: '1px solid #f2f2f7',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>
                      {inv.billTypeName} · {inv.period.replace('-', '年')}月
                    </div>
                    <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>
                      {inv.invoiceNo || '开票中...'}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '3px 10px', borderRadius: 10,
                  fontSize: 11, fontWeight: 600,
                  background: inv.status === 'issued' ? '#EBFFEB' : '#FFF5EB',
                  color: inv.status === 'issued' ? '#34C759' : '#FF9500',
                }}>
                  {inv.status === 'issued' ? '已开票' : '开票中'}
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, color: '#8e8e93',
              }}>
                <span>申请时间: {inv.applyTime}</span>
                <span style={{ fontWeight: 600, color: '#1d1d1f' }}>
                  {formatAmount(inv.amount)}
                </span>
              </div>
              {inv.issueTime && (
                <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 4 }}>
                  开票时间: {inv.issueTime}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ===== 可开票账单 ===== */}
      {billableBills.length > 0 && (
        <div style={{ padding: '12px 12px 0' }}>
          <div style={{
            fontSize: 15, fontWeight: 600, color: '#1d1d1f',
            marginBottom: 12, padding: '0 4px',
          }}>
            可申请开票
          </div>
          {billableBills.map(bill => (
            <div
              key={bill.id}
              style={{
                background: '#fff', borderRadius: 14, marginBottom: 12,
                padding: 16, border: '1px solid #f2f2f7',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    padding: '3px 8px', borderRadius: 4,
                    fontSize: 11, fontWeight: 600,
                    background: '#EBF5FF', color: '#007AFF',
                  }}>
                    {bill.billTypeName}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>
                    {bill.period.replace('-', '年')}月
                  </span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>
                  {formatAmount(bill.amount)}
                </span>
              </div>
              <div
                onClick={() => handleApply(bill.id)}
                style={{
                  marginTop: 10, padding: '10px 0', textAlign: 'center',
                  borderRadius: 20, fontSize: 14, fontWeight: 600,
                  background: '#007AFF', color: '#fff', cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                  opacity: applyingId === bill.id ? 0.7 : 1,
                }}
              >
                {applyingId === bill.id ? (
                  <span><LoadingOutlined style={{ marginRight: 6 }} />申请中...</span>
                ) : (
                  '申请开票'
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== 发票说明 ===== */}
      <div style={{
        margin: '16px 12px 0',
        padding: 16,
        background: '#FFF5EB',
        borderRadius: 14,
        border: '1px solid #FFE0B2',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#FF9500',
        }}>
          <span>💡</span>
          <span>发票说明</span>
        </div>
        <div style={{ fontSize: 12, color: '#8e8e93', lineHeight: 1.8 }}>
          <div>• 仅已缴清的账单可申请开票</div>
          <div>• 发票申请提交后，将在 3 个工作日内开具</div>
          <div>• 如需纸质发票，请联系物业服务中心</div>
          <div>• 发票抬头默认为业主姓名，如需变更请前往物业服务中心</div>
        </div>
      </div>

      <div style={{ height: 16 }} />
    </div>
  );
};

export default InvoiceApply;
