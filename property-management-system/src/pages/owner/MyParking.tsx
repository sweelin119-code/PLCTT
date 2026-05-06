import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getParkingInfos,
  getAllParkingBills,
  getParkingBillOverview,
  getVehicleRecords,
  type ParkingInfo,
  type ParkingBill,
  type VehicleRecord,
} from '../../services/ownerParkingService';
// ===== 样式常量 =====
const styles = {
  container: {
    paddingBottom: 24,
    background: '#F5F5F7',
    minHeight: '100vh',
  } as React.CSSProperties,
  headerGradient: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '24px 16px 32px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
  } as React.CSSProperties,
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  } as React.CSSProperties,
  overviewRow: {
    display: 'flex',
    gap: 10,
  } as React.CSSProperties,
  overviewCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: '12px 14px',
    textAlign: 'center' as const,
  },
  overviewLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  } as React.CSSProperties,
  overviewValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
  } as React.CSSProperties,
  overviewUnit: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  } as React.CSSProperties,
  section: {
    margin: '12px 16px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 12,
  } as React.CSSProperties,
  cardItem: {
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  cardItemLast: {
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  parkingInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  } as React.CSSProperties,
  parkingBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  } as React.CSSProperties,
  parkingName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1d1d1f',
  } as React.CSSProperties,
  parkingLoc: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 2,
  } as React.CSSProperties,
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  } as React.CSSProperties,
  billItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f5f5f7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  billInfo: {
    flex: 1,
  } as React.CSSProperties,
  billType: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1d1d1f',
  } as React.CSSProperties,
  billPeriod: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 2,
  } as React.CSSProperties,
  billAmount: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1d1d1f',
    textAlign: 'right' as const,
  } as React.CSSProperties,
  billStatus: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right' as const,
  } as React.CSSProperties,
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 14px',
    borderRadius: 18,
    fontSize: 13,
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const,
    padding: '32px 16px',
    color: '#86868b',
  } as React.CSSProperties,
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  } as React.CSSProperties,
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  } as React.CSSProperties,
  errorContainer: {
    textAlign: 'center' as const,
    padding: 48,
    color: '#86868b',
  } as React.CSSProperties,
  retryBtn: {
    marginTop: 12,
    padding: '8px 24px',
    borderRadius: 20,
    border: '1px solid #007AFF',
    background: 'transparent',
    color: '#007AFF',
    fontSize: 14,
    cursor: 'pointer',
  } as React.CSSProperties,
  quickActions: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
  } as React.CSSProperties,
  quickAction: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 10,
    border: '1px solid #e8e8ed',
    background: '#fff',
    textAlign: 'center' as const,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#1d1d1f',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  vehicleItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f5f5f7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  vehiclePlate: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1d1d1f',
  } as React.CSSProperties,
  vehicleTime: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 2,
  } as React.CSSProperties,
  vehicleEntrance: {
    fontSize: 12,
    color: '#86868b',
  } as React.CSSProperties,
  vehicleFee: {
    fontSize: 14,
    fontWeight: 600,
    color: '#FF3B30',
  } as React.CSSProperties,
  menuArrow: {
    color: '#c7c7cc',
    fontSize: 16,
  } as React.CSSProperties,
};

// ===== 子组件：加载状态 =====
const LoadingSpinner: React.FC = () => (
  <div style={styles.loadingContainer}>
    <div style={{
      width: 32,
      height: 32,
      border: '3px solid #e8e8ed',
      borderTopColor: '#007AFF',
      borderRadius: '50%',
      animation: 'parkingSpin 0.8s linear infinite',
    }} />
    <style>{`@keyframes parkingSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ===== 子组件：错误状态 =====
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div style={styles.errorContainer}>
    <div style={{ fontSize: 40, marginBottom: 8 }}>😵</div>
    <div style={{ fontSize: 14, marginBottom: 4 }}>加载失败</div>
    <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>{message}</div>
    <button style={styles.retryBtn} onClick={onRetry}>重新加载</button>
  </div>
);

// ===== 主组件 =====
const MyParking: React.FC = () => {
  const navigate = useNavigate();
  const houseId = 'H1001'; // TODO: 从用户信息获取

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parkingInfos, setParkingInfos] = useState<ParkingInfo[]>([]);
  const [parkingBills, setParkingBills] = useState<ParkingBill[]>([]);
  const [billOverview, setBillOverview] = useState({ totalPending: 0, totalOverdue: 0, overdueCount: 0, monthAmount: 0 });
  const [vehicleRecords, setVehicleRecords] = useState<VehicleRecord[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [infos, bills, overview, records] = await Promise.all([
        getParkingInfos(houseId),
        getAllParkingBills(houseId),
        getParkingBillOverview(houseId),
        getVehicleRecords(houseId),
      ]);
      setParkingInfos(infos);
      setParkingBills(bills);
      setBillOverview(overview);
      setVehicleRecords(records.slice(0, 3)); // 最近3条
    } catch (err: any) {
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 获取账单状态标签
  const getBillStatusTag = (status: ParkingBill['status']) => {
    switch (status) {
      case 'pending':
        return <span style={{ ...styles.tag, background: '#FFF5EB', color: '#FF9500' }}>待缴费</span>;
      case 'paid':
        return <span style={{ ...styles.tag, background: '#EBFFEB', color: '#34C759' }}>已缴费</span>;
      case 'overdue':
        return <span style={{ ...styles.tag, background: '#FFEBEB', color: '#FF3B30' }}>已逾期</span>;
    }
  };

  // 获取车位状态标签
  const getParkingStatusTag = (status: ParkingInfo['status'], type: ParkingInfo['type']) => {
    if (type === 'rented' && status === 'occupied') {
      return <span style={{ ...styles.tag, background: '#EBF5FF', color: '#007AFF' }}>租赁中</span>;
    }
    switch (status) {
      case 'idle':
        return <span style={{ ...styles.tag, background: '#EBFFEB', color: '#34C759' }}>空闲</span>;
      case 'occupied':
        return <span style={{ ...styles.tag, background: '#EBF5FF', color: '#007AFF' }}>使用中</span>;
      case 'expired':
        return <span style={{ ...styles.tag, background: '#FFEBEB', color: '#FF3B30' }}>已到期</span>;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const pendingBills = parkingBills.filter(b => b.status === 'pending' || b.status === 'overdue');
  const recentBills = pendingBills.slice(0, 5);

  return (
    <div style={styles.container}>
      {/* 头部概览 */}
      <div style={styles.headerGradient}>
        <div style={styles.headerTitle}>🚗 停车缴费</div>
        <div style={styles.headerSub}>管理您的车位与停车费用</div>
        <div style={styles.overviewRow}>
          <div style={styles.overviewCard}>
            <div style={styles.overviewLabel}>待缴金额</div>
            <div style={styles.overviewValue}>
              ¥{billOverview.totalPending.toFixed(2)}
            </div>
          </div>
          <div style={styles.overviewCard}>
            <div style={styles.overviewLabel}>本月应缴</div>
            <div style={styles.overviewValue}>
              ¥{billOverview.monthAmount.toFixed(2)}
            </div>
          </div>
          <div style={styles.overviewCard}>
            <div style={styles.overviewLabel}>逾期</div>
            <div style={{ ...styles.overviewValue, color: '#FF6B6B' }}>
              {billOverview.overdueCount}
            </div>
            <div style={styles.overviewUnit}>笔</div>
          </div>
        </div>
      </div>

      {/* 我的车位 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📌 我的车位</span>
          {parkingInfos.length > 0 && parkingInfos.length < 2 && (
            <span style={{ fontSize: 12, color: '#007AFF', cursor: 'pointer' }}
              onClick={() => navigate('/owner/parking/rent')}>
              去租赁 +
            </span>
          )}
        </div>
        {parkingInfos.length === 0 ? (
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <div style={styles.emptyEmoji}>🅿️</div>
              <div style={{ fontSize: 14, color: '#1d1d1f', marginBottom: 4 }}>暂无绑定车位</div>
              <div style={{ fontSize: 12, marginBottom: 12 }}>您还没有绑定任何车位</div>
              <button style={{ ...styles.actionBtn, background: '#007AFF', color: '#fff' }}
                onClick={() => navigate('/owner/parking/rent')}>
                去租赁车位
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            {parkingInfos.map((info, idx) => (
              <div key={info.id}
                style={idx === parkingInfos.length - 1 ? styles.cardItemLast : styles.cardItem}
                onClick={() => navigate(`/owner/parking/detail/${info.id}`)}>
                <div style={styles.parkingInfo}>
                  <div style={{
                    ...styles.parkingBadge,
                    background: info.type === 'owned' ? '#EBF5FF' : '#FFF5EB',
                  }}>
                    🅿️
                  </div>
                  <div>
                    <div style={styles.parkingName}>{info.parkingNo}</div>
                    <div style={styles.parkingLoc}>{info.location}</div>
                    {info.plateNo && (
                      <div style={{ fontSize: 11, color: '#007AFF', marginTop: 2 }}>
                        🚗 {info.plateNo}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {getParkingStatusTag(info.status, info.type)}
                  {info.type === 'rented' && info.rentExpireDate && (
                    <div style={{ fontSize: 11, color: '#86868b' }}>
                      到期 {info.rentExpireDate}
                    </div>
                  )}
                  <div style={{ fontSize: 16, color: '#c7c7cc' }}>›</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 快捷操作 */}
        {parkingInfos.length > 0 && (
          <div style={styles.quickActions}>
            <button style={styles.quickAction}
              onClick={() => navigate('/owner/parking/records')}>
              📋 出入记录
            </button>
            <button style={styles.quickAction}
              onClick={() => navigate('/owner/parking/rent')}>
              📝 租赁车位
            </button>
            <button style={styles.quickAction}
              onClick={() => navigate('/owner/parking/share')}>
              🔄 车位共享
            </button>
          </div>
        )}
      </div>

      {/* 停车费账单 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>💰 停车费账单</span>
          {pendingBills.length > 0 && (
            <span style={{ fontSize: 12, color: '#FF3B30' }}>
              {pendingBills.length} 笔待缴
            </span>
          )}
        </div>
        {recentBills.length === 0 ? (
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <div style={styles.emptyEmoji}>🎉</div>
              <div style={{ fontSize: 14, color: '#1d1d1f' }}>暂无待缴停车费</div>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            {recentBills.map((bill, idx) => (
              <div key={bill.id}
                style={idx === recentBills.length - 1 ? styles.billItem : { ...styles.billItem }}
                onClick={() => navigate(`/owner/bills/detail/${bill.id}`)}>
                <div style={styles.billInfo}>
                  <div style={styles.billType}>{bill.billTypeName}</div>
                  <div style={styles.billPeriod}>{bill.period} · {bill.parkingId === 'PI001' ? 'B1-001' : 'B1-002'}</div>
                </div>
                <div>
                  <div style={styles.billAmount}>¥{bill.amount.toFixed(2)}</div>
                  <div style={styles.billStatus}>{getBillStatusTag(bill.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 车辆出入记录 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🚘 最近出入记录</span>
          <span style={{ fontSize: 12, color: '#007AFF', cursor: 'pointer' }}
            onClick={() => navigate('/owner/parking/records')}>
            查看全部 ›
          </span>
        </div>
        {vehicleRecords.length === 0 ? (
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <div style={styles.emptyEmoji}>🚗</div>
              <div style={{ fontSize: 14, color: '#1d1d1f' }}>暂无出入记录</div>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            {vehicleRecords.map((record, idx) => (
              <div key={record.id}
                style={idx === vehicleRecords.length - 1 ? styles.vehicleItem : { ...styles.vehicleItem }}>
                <div>
                  <div style={styles.vehiclePlate}>{record.plateNo}</div>
                  <div style={styles.vehicleTime}>
                    入 {record.entryTime} {record.exitTime ? `| 出 ${record.exitTime}` : '| 未出场'}
                  </div>
                  <div style={styles.vehicleEntrance}>
                    {record.entrance} · {record.duration}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {record.fee ? (
                    <div style={styles.vehicleFee}>¥{record.fee.toFixed(2)}</div>
                  ) : (
                    <span style={{ ...styles.tag, background: '#EBF5FF', color: '#007AFF' }}>业主</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyParking;
