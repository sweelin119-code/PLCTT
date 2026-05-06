import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleOutlined } from '@ant-design/icons';
import type { BillItem, PayMethod } from '../../services/ownerBillService';

const formatAmount = (amount: number): string => `¥${amount.toFixed(2)}`;

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    bill: BillItem;
    tradeNo: string;
    payMethod: PayMethod;
    payTime: string;
  } | undefined;

  if (!state) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 15, color: '#8e8e93' }}>页面数据异常</div>
        <div
          onClick={() => navigate('/owner/bills')}
          style={{
            marginTop: 16, display: 'inline-flex', padding: '10px 24px',
            background: '#007AFF', color: '#fff', borderRadius: 22,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          返回我的账单
        </div>
      </div>
    );
  }

  const { bill, tradeNo, payMethod, payTime } = state;

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* ===== 成功动画 ===== */}
      <div style={{
        textAlign: 'center',
        padding: '48px 20px 32px',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          background: '#EBFFEB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          <CheckCircleOutlined style={{ fontSize: 44, color: '#34C759' }} />
        </div>
        <div style={{
          fontSize: 22, fontWeight: 700, color: '#1d1d1f',
          marginBottom: 8, letterSpacing: -0.5,
        }}>
          支付成功
        </div>
        <div style={{ fontSize: 14, color: '#8e8e93' }}>
          {bill.billTypeName} · {bill.period.replace('-', '年')}月
        </div>
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>

      {/* ===== 支付金额 ===== */}
      <div style={{
        background: '#fff',
        margin: '0 12px',
        borderRadius: 14,
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        border: '1px solid #f2f2f7',
      }}>
        <div style={{ fontSize: 13, color: '#8e8e93', marginBottom: 4 }}>支付金额</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#1d1d1f', letterSpacing: -1 }}>
          {formatAmount(bill.amount)}
        </div>
      </div>

      {/* ===== 支付详情 ===== */}
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
          支付详情
        </div>
        {[
          { label: '交易单号', value: tradeNo },
          { label: '支付方式', value: payMethod === 'wechat' ? '微信支付' : '支付宝' },
          { label: '支付时间', value: payTime },
          { label: '账单编号', value: bill.id },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: 13,
            }}
          >
            <span style={{ color: '#8e8e93' }}>{item.label}</span>
            <span style={{ color: '#1d1d1f', fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* ===== 操作按钮 ===== */}
      <div style={{ padding: '24px 12px' }}>
        <div
          onClick={() => navigate('/owner/bills/invoices')}
          style={{
            width: '100%', padding: '14px 0', textAlign: 'center',
            background: '#fff', color: '#007AFF', borderRadius: 24,
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            border: '1px solid #007AFF',
            marginBottom: 12,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EBF5FF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
        >
          申请电子发票
        </div>
        <div
          onClick={() => navigate('/owner/bills')}
          style={{
            width: '100%', padding: '14px 0', textAlign: 'center',
            background: 'linear-gradient(135deg, #007AFF, #5856D6)',
            color: '#fff', borderRadius: 24,
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,122,255,0.3)',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          返回账单列表
        </div>
      </div>

      <div style={{ height: 16 }} />
    </div>
  );
};

export default PaymentSuccess;
