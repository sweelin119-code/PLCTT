import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { BillItem } from '../../services/ownerBillService';
import * as ownerBillService from '../../services/ownerBillService';

const formatAmount = (amount: number): string => `¥${amount.toFixed(2)}`;

const BillDetailPage: React.FC = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [bill, setBill] = useState<BillItem | null>(location.state?.bill || null);
  const [loading, setLoading] = useState(!bill);

  useEffect(() => {
    if (!bill && billId) {
      ownerBillService.getBillById(billId).then(data => {
        setBill(data);
        setLoading(false);
      });
    }
  }, [billId, bill]);

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

  if (!bill) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 15, color: '#8e8e93' }}>账单不存在</div>
      </div>
    );
  }

  const getStatusInfo = (status: BillItem['status']) => {
    switch (status) {
      case 'pending': return { label: '待缴费', color: '#FF9500', bg: '#FFF5EB', icon: <ClockCircleOutlined /> };
      case 'paid': return { label: '已缴清', color: '#34C759', bg: '#EBFFEB', icon: <CheckCircleOutlined /> };
      case 'overdue': return { label: '已逾期', color: '#FF3B30', bg: '#FFEBEB', icon: <ExclamationCircleOutlined /> };
    }
  };

  const statusInfo = getStatusInfo(bill.status);

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* ===== 状态头部 ===== */}
      <div style={{
        background: '#fff',
        margin: '12px 12px 0',
        borderRadius: 14,
        padding: '24px 20px',
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        border: '1px solid #f2f2f7',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 14,
          background: statusInfo.bg, color: statusInfo.color,
          fontSize: 13, fontWeight: 600, marginBottom: 12,
        }}>
          {statusInfo.icon}
          <span>{statusInfo.label}</span>
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#1d1d1f', letterSpacing: -1, marginBottom: 4 }}>
          {formatAmount(bill.amount)}
        </div>
        <div style={{ fontSize: 13, color: '#8e8e93' }}>
          {bill.billTypeName} · {bill.period.replace('-', '年')}月
        </div>
      </div>

      {/* ===== 费用明细 ===== */}
      <div style={{
        background: '#fff',
        margin: '12px 12px 0',
        borderRadius: 14,
        padding: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        border: '1px solid #f2f2f7',
      }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: '#1d1d1f',
          marginBottom: 14,
        }}>
          费用明细
        </div>
        {bill.details.map((detail, index) => (
          <div
            key={index}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < bill.details.length - 1 ? '1px solid #f2f2f7' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: '#1d1d1f', fontWeight: 500 }}>
                {detail.itemName}
              </div>
              <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>
                {detail.unitPrice.toFixed(2)} × {detail.quantity}
              </div>
            </div>
            <div style={{
              fontSize: 15, fontWeight: 600,
              color: detail.amount < 0 ? '#34C759' : '#1d1d1f',
            }}>
              {detail.amount < 0 ? '' : '+'}{formatAmount(detail.amount)}
            </div>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 0 0', marginTop: 8,
          borderTop: '1px solid #f2f2f7',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>合计</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#007AFF' }}>
            {formatAmount(bill.amount)}
          </div>
        </div>
      </div>

      {/* ===== 账单信息 ===== */}
      <div style={{
        background: '#fff',
        margin: '12px 12px 0',
        borderRadius: 14,
        padding: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        border: '1px solid #f2f2f7',
      }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: '#1d1d1f',
          marginBottom: 14,
        }}>
          账单信息
        </div>
        {[
          { label: '账单编号', value: bill.id },
          { label: '费用类型', value: bill.billTypeName },
          { label: '费用周期', value: `${bill.period.replace('-', '年')}月` },
          { label: '缴费截止日', value: bill.dueDate },
          { label: '账单生成日', value: bill.createdAt.split('T')[0] },
          ...(bill.paidAt ? [{ label: '缴费时间', value: bill.paidAt.split('T')[0] }] : []),
          ...(bill.paymentMethod ? [{ label: '支付方式', value: bill.paymentMethod }] : []),
        ].map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0',
              fontSize: 13,
            }}
          >
            <span style={{ color: '#8e8e93' }}>{item.label}</span>
            <span style={{ color: '#1d1d1f', fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* ===== 操作按钮 ===== */}
      {(bill.status === 'pending' || bill.status === 'overdue') && (
        <div style={{ padding: '20px 12px' }}>
          <div
            onClick={() => navigate(`/owner/bills/pay/${bill.id}`, { state: { bill } })}
            style={{
              width: '100%', padding: '14px 0', textAlign: 'center',
              background: 'linear-gradient(135deg, #007AFF, #5856D6)',
              color: '#fff', borderRadius: 24,
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,122,255,0.3)',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            立即缴费
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
};

export default BillDetailPage;
