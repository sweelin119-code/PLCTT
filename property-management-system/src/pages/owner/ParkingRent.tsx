import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getRentableParkings,
  createRentOrder,
  payRentOrder,
  getRentOrders,
  type RentableParking,
  type RentOrder,
} from '../../services/ownerParkingService';

const styles = {
  container: {
    paddingBottom: 24,
    background: '#F5F5F7',
    minHeight: '100vh',
  } as React.CSSProperties,
  header: {
    background: '#fff',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  } as React.CSSProperties,
  backBtn: {
    fontSize: 20,
    cursor: 'pointer',
    color: '#007AFF',
    background: 'none',
    border: 'none',
    padding: 0,
    lineHeight: 1,
  } as React.CSSProperties,
  headerTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#1d1d1f',
  } as React.CSSProperties,
  section: {
    margin: '12px 16px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: 12,
  } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 12,
  } as React.CSSProperties,
  parkingItem: {
    padding: '14px 16px',
    borderBottom: '1px solid #f5f5f7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  parkingItemLast: {
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  parkingNo: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1d1d1f',
  } as React.CSSProperties,
  parkingLoc: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 2,
  } as React.CSSProperties,
  parkingSize: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 1,
  } as React.CSSProperties,
  rentPrice: {
    fontSize: 18,
    fontWeight: 700,
    color: '#FF3B30',
  } as React.CSSProperties,
  rentUnit: {
    fontSize: 12,
    color: '#86868b',
  } as React.CSSProperties,
  rentBtn: {
    marginTop: 6,
    padding: '4px 14px',
    borderRadius: 14,
    border: 'none',
    background: '#007AFF',
    color: '#fff',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  rentBtnDisabled: {
    marginTop: 6,
    padding: '4px 14px',
    borderRadius: 14,
    border: '1px solid #e8e8ed',
    background: '#f5f5f7',
    color: '#c7c7cc',
    fontSize: 12,
    fontWeight: 500,
  } as React.CSSProperties,
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modalContent: {
    background: '#fff',
    borderRadius: '16px 16px 0 0',
    width: '100%',
    maxWidth: 420,
    padding: '24px 20px',
    paddingBottom: 32,
  } as React.CSSProperties,
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: 16,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  modalInfo: {
    background: '#f5f5f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  modalInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 14,
  } as React.CSSProperties,
  modalInfoRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    fontWeight: 600,
    color: '#FF3B30',
  } as React.CSSProperties,
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  } as React.CSSProperties,
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid #e8e8ed',
    background: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#007AFF',
  } as React.CSSProperties,
  monthValue: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1d1d1f',
    minWidth: 60,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  confirmBtn: {
    width: '100%',
    padding: '14px 0',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #007AFF, #5856D6)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 8,
  } as React.CSSProperties,
  cancelBtn: {
    width: '100%',
    padding: '12px 0',
    borderRadius: 12,
    border: 'none',
    background: '#f5f5f7',
    color: '#86868b',
    fontSize: 15,
    cursor: 'pointer',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 16px',
    color: '#86868b',
  } as React.CSSProperties,
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  } as React.CSSProperties,
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  } as React.CSSProperties,
  orderCard: {
    background: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as React.CSSProperties,
  orderStatus: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  } as React.CSSProperties,
  payingOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  } as React.CSSProperties,
};

const ParkingRent: React.FC = () => {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState<RentableParking[]>([]);
  const [orders, setOrders] = useState<RentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedParking, setSelectedParking] = useState<RentableParking | null>(null);
  const [months, setMonths] = useState(6);
  const [paying, setPaying] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [parkingData, orderData] = await Promise.all([
        getRentableParkings(20),
        getRentOrders('H1001'),
      ]);
      setParkings(parkingData);
      setOrders(orderData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRent = (parking: RentableParking) => {
    setSelectedParking(parking);
    setMonths(6);
    setShowModal(true);
  };

  const handleConfirmRent = async () => {
    if (!selectedParking) return;
    try {
      const order = await createRentOrder({
        parkingId: selectedParking.id,
        months,
        monthlyRent: selectedParking.monthlyRent,
      });
      setOrders(prev => [order, ...prev]);
      setShowModal(false);
      // 自动跳转支付
      setPaying(true);
      await payRentOrder(order.id);
      setPaying(false);
      loadData();
    } catch {
      setPaying(false);
    }
  };

  const getOrderStatusTag = (status: RentOrder['status']) => {
    switch (status) {
      case 'paid':
        return <span style={{ ...styles.orderStatus, background: '#EBFFEB', color: '#34C759' }}>已支付</span>;
      case 'pending':
        return <span style={{ ...styles.orderStatus, background: '#FFF5EB', color: '#FF9500' }}>待支付</span>;
      case 'cancelled':
        return <span style={{ ...styles.orderStatus, background: '#f5f5f7', color: '#86868b' }}>已取消</span>;
    }
  };

  return (
    <div style={styles.container}>
      {/* 顶部导航 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/owner/parking')}>‹</button>
        <div style={styles.headerTitle}>车位租赁</div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={{
            width: 28,
            height: 28,
            border: '3px solid #e8e8ed',
            borderTopColor: '#007AFF',
            borderRadius: '50%',
            animation: 'rentSpin 0.8s linear infinite',
          }} />
          <style>{`@keyframes rentSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* 可租车位列表 */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🅿️ 可租车位</div>
            {parkings.filter(p => p.status === 'available').length === 0 ? (
              <div style={styles.card}>
                <div style={styles.emptyState}>
                  <div style={styles.emptyEmoji}>📭</div>
                  <div style={{ fontSize: 15, color: '#1d1d1f', marginBottom: 4 }}>暂无可租车位</div>
                  <div style={{ fontSize: 13 }}>当前没有可租赁的车位</div>
                </div>
              </div>
            ) : (
              <div style={styles.card}>
                {parkings.filter(p => p.status === 'available').map((parking, idx) => {
                  const list = parkings.filter(p => p.status === 'available');
                  return (
                    <div key={parking.id} style={idx === list.length - 1 ? styles.parkingItemLast : styles.parkingItem}>
                      <div>
                        <div style={styles.parkingNo}>{parking.parkingNo}</div>
                        <div style={styles.parkingLoc}>{parking.location}</div>
                        <div style={styles.parkingSize}>{parking.sizeArea}m²</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>
                          <span style={styles.rentPrice}>¥{parking.monthlyRent}</span>
                          <span style={styles.rentUnit}>/月</span>
                        </div>
                        <button style={styles.rentBtn} onClick={() => handleRent(parking)}>
                          立即租赁
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 我的租赁记录 */}
          {orders.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📋 我的租赁记录</div>
              {orders.map(order => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{order.parkingNo}</div>
                    {getOrderStatusTag(order.status)}
                  </div>
                  <div style={{ fontSize: 13, color: '#86868b', marginBottom: 4 }}>
                    {order.location}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#86868b' }}>
                    <span>{order.months}个月 · ¥{order.monthlyRent}/月</span>
                    <span style={{ fontWeight: 600, color: '#1d1d1f' }}>合计 ¥{order.totalAmount.toFixed(2)}</span>
                  </div>
                  {order.startDate && order.endDate && (
                    <div style={{ fontSize: 12, color: '#86868b', marginTop: 4 }}>
                      有效期 {order.startDate} ~ {order.endDate}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 租赁弹窗 */}
      {showModal && selectedParking && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>确认租赁</div>
            <div style={styles.modalInfo}>
              <div style={styles.modalInfoRow}>
                <span style={{ color: '#86868b' }}>车位</span>
                <span>{selectedParking.parkingNo}</span>
              </div>
              <div style={styles.modalInfoRow}>
                <span style={{ color: '#86868b' }}>位置</span>
                <span>{selectedParking.location}</span>
              </div>
              <div style={styles.modalInfoRow}>
                <span style={{ color: '#86868b' }}>月租金</span>
                <span style={{ fontWeight: 600, color: '#FF3B30' }}>¥{selectedParking.monthlyRent}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 14, color: '#86868b' }}>
              选择租赁时长
            </div>
            <div style={styles.monthSelector}>
              <button style={styles.monthBtn} onClick={() => setMonths(Math.max(1, months - 1))}>−</button>
              <div style={styles.monthValue}>{months} 个月</div>
              <button style={styles.monthBtn} onClick={() => setMonths(Math.min(24, months + 1))}>+</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: '#86868b' }}>合计 </span>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#FF3B30' }}>
                ¥{(selectedParking.monthlyRent * months).toFixed(2)}
              </span>
            </div>

            <button style={styles.confirmBtn} onClick={handleConfirmRent}>
              确认并支付
            </button>
            <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* 支付中遮罩 */}
      {paying && (
        <div style={styles.payingOverlay}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #e8e8ed',
            borderTopColor: '#007AFF',
            borderRadius: '50%',
            animation: 'paySpin 0.8s linear infinite',
            marginBottom: 16,
          }} />
          <style>{`@keyframes paySpin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 16, color: '#1d1d1f', fontWeight: 500 }}>支付处理中...</div>
          <div style={{ fontSize: 13, color: '#86868b', marginTop: 4 }}>请稍候</div>
        </div>
      )}
    </div>
  );
};

export default ParkingRent;
