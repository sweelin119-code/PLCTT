import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleOutlined, WechatOutlined, AlipayOutlined } from '@ant-design/icons';
import type { BillItem, PayMethod } from '../../services/ownerBillService';
import * as ownerBillService from '../../services/ownerBillService';

const formatAmount = (amount: number): string => `¥${amount.toFixed(2)}`;

const PaymentConfirm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bill = location.state?.bill as BillItem | undefined;

  const [payMethod, setPayMethod] = useState<PayMethod>('wechat');
  const [paying, setPaying] = useState(false);

  if (!bill) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 15, color: '#8e8e93' }}>账单数据异常，请返回重试</div>
        <div
          onClick={() => navigate(-1)}
          style={{
            marginTop: 16, display: 'inline-flex', padding: '10px 24px',
            background: '#007AFF', color: '#fff', borderRadius: 22,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          返回
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    setPaying(true);
    try {
      const result = await ownerBillService.confirmPayment({
        billIds: [bill.id],
        payMethod,
      });
      if (result.success) {
        navigate(`/owner/bills/success/${bill.id}`, {
          state: {
            bill,
            tradeNo: result.tradeNo,
            payMethod,
            payTime: new Date().toLocaleString('zh-CN'),
          },
        });
      }
    } catch {
      // 支付失败
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* ===== 支付金额 ===== */}
      <div style={{
        background: '#fff',
        margin: '12px 12px 0',
        borderRadius: 14,
        padding: '24px 20px',
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        border: '1px solid #f2f2f7',
      }}>
        <div style={{ fontSize: 13, color: '#8e8e93', marginBottom: 8, fontWeight: 500 }}>
          支付金额
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, color: '#1d1d1f', letterSpacing: -2 }}>
          {formatAmount(bill.amount)}
        </div>
        <div style={{
          marginTop: 12, fontSize: 13, color: '#8e8e93',
          display: 'flex', justifyContent: 'center', gap: 16,
        }}>
          <span>{bill.billTypeName}</span>
          <span>{bill.period.replace('-', '年')}月</span>
        </div>
      </div>

      {/* ===== 账单明细摘要 ===== */}
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
          marginBottom: 12,
        }}>
          账单明细
        </div>
        {bill.details.map((detail, index) => (
          <div
            key={index}
            style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: 13,
            }}
          >
            <span style={{ color: '#8e8e93' }}>{detail.itemName}</span>
            <span style={{ color: '#1d1d1f', fontWeight: 500 }}>
              {detail.amount < 0 ? '-' : '+'}{formatAmount(Math.abs(detail.amount))}
            </span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '10px 0 0', marginTop: 8,
          borderTop: '1px solid #f2f2f7',
          fontSize: 15, fontWeight: 700, color: '#1d1d1f',
        }}>
          <span>合计</span>
          <span style={{ color: '#007AFF' }}>{formatAmount(bill.amount)}</span>
        </div>
      </div>

      {/* ===== 支付方式选择 ===== */}
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
          marginBottom: 12,
        }}>
          选择支付方式
        </div>

        {/* 微信支付 */}
        <div
          onClick={() => setPayMethod('wechat')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 12px',
            borderRadius: 12,
            border: payMethod === 'wechat' ? '2px solid #07C160' : '1px solid #f2f2f7',
            marginBottom: 10,
            cursor: 'pointer',
            background: payMethod === 'wechat' ? '#F0FFF4' : '#fff',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#07C160', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#fff', flexShrink: 0,
          }}>
            <WechatOutlined />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>微信支付</div>
            <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>推荐微信用户使用</div>
          </div>
          {payMethod === 'wechat' && (
            <CheckCircleOutlined style={{ fontSize: 20, color: '#07C160' }} />
          )}
        </div>

        {/* 支付宝 */}
        <div
          onClick={() => setPayMethod('alipay')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 12px',
            borderRadius: 12,
            border: payMethod === 'alipay' ? '2px solid #1677FF' : '1px solid #f2f2f7',
            cursor: 'pointer',
            background: payMethod === 'alipay' ? '#F0F5FF' : '#fff',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#1677FF', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#fff', flexShrink: 0,
          }}>
            <AlipayOutlined />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>支付宝</div>
            <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>支持花呗、余额宝</div>
          </div>
          {payMethod === 'alipay' && (
            <CheckCircleOutlined style={{ fontSize: 20, color: '#1677FF' }} />
          )}
        </div>
      </div>

      {/* ===== 确认支付按钮 ===== */}
      <div style={{ padding: '20px 12px' }}>
        <div
          onClick={handlePay}
          style={{
            width: '100%', padding: '16px 0', textAlign: 'center',
            background: paying ? '#8e8e93' : 'linear-gradient(135deg, #007AFF, #5856D6)',
            color: '#fff', borderRadius: 24,
            fontSize: 17, fontWeight: 600, cursor: paying ? 'not-allowed' : 'pointer',
            boxShadow: paying ? 'none' : '0 4px 16px rgba(0,122,255,0.3)',
            transition: 'all 0.2s ease',
            opacity: paying ? 0.7 : 1,
          }}
        >
          {paying ? (
            <span>
              <span style={{
                display: 'inline-block', width: 18, height: 18,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginRight: 8, verticalAlign: 'middle',
              }} />
              支付中...
            </span>
          ) : (
            `确认支付 ${formatAmount(bill.amount)}`
          )}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* ===== 安全提示 ===== */}
      <div style={{
        textAlign: 'center', padding: '0 12px 20px',
        fontSize: 12, color: '#c7c7cc',
      }}>
        本服务由物业全生命周期管理系统提供 · 资金由第三方支付平台托管
      </div>
    </div>
  );
};

export default PaymentConfirm;
