import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getParkingInfos,
  getShareSettings,
  getShareIncomes,
  getShareIncomeOverview,
  updateShareSetting,
  toggleShareStatus,
  type ParkingInfo,
  type ShareSetting,
  type ShareIncomeRecord,
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
  incomeOverview: {
    display: 'flex',
    gap: 10,
    marginBottom: 12,
  } as React.CSSProperties,
  incomeCard: {
    flex: 1,
    background: '#fff',
    borderRadius: 14,
    padding: '14px 12px',
    textAlign: 'center' as const,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  incomeLabel: {
    fontSize: 11,
    color: '#86868b',
    marginBottom: 4,
  } as React.CSSProperties,
  incomeValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#34C759',
  } as React.CSSProperties,
  settingCard: {
    background: '#fff',
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 12,
  } as React.CSSProperties,
  settingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as React.CSSProperties,
  parkingName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1d1d1f',
  } as React.CSSProperties,
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
  } as React.CSSProperties,
  priceRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 12,
  } as React.CSSProperties,
  priceItem: {
    flex: 1,
  } as React.CSSProperties,
  priceLabel: {
    fontSize: 12,
    color: '#86868b',
    marginBottom: 4,
  } as React.CSSProperties,
  priceInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e8e8ed',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  timeSlotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  } as React.CSSProperties,
  timeInput: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #e8e8ed',
    fontSize: 13,
    outline: 'none',
    width: 80,
  } as React.CSSProperties,
  timeLabel: {
    fontSize: 12,
    color: '#86868b',
  } as React.CSSProperties,
  saveBtn: {
    width: '100%',
    padding: '12px 0',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #007AFF, #5856D6)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  } as React.CSSProperties,
  toggleBtn: {
    padding: '6px 14px',
    borderRadius: 16,
    border: '1px solid #e8e8ed',
    background: '#fff',
    fontSize: 13,
    cursor: 'pointer',
    color: '#1d1d1f',
  } as React.CSSProperties,
  toggleBtnActive: {
    padding: '6px 14px',
    borderRadius: 16,
    border: '1px solid #34C759',
    background: '#EBFFEB',
    fontSize: 13,
    cursor: 'pointer',
    color: '#34C759',
    fontWeight: 500,
  } as React.CSSProperties,
  incomeItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f5f5f7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  incomeItemLast: {
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  incomeDate: {
    fontSize: 13,
    color: '#86868b',
  } as React.CSSProperties,
  incomePlate: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1d1d1f',
    marginTop: 2,
  } as React.CSSProperties,
  incomeAmount: {
    fontSize: 16,
    fontWeight: 600,
    color: '#34C759',
  } as React.CSSProperties,
  incomeDuration: {
    fontSize: 12,
    color: '#86868b',
    textAlign: 'right' as const,
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
  hint: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 8,
    lineHeight: 1.6,
  } as React.CSSProperties,
};

const ParkingShare: React.FC = () => {
  const navigate = useNavigate();
  const houseId = 'H1001';

  const [loading, setLoading] = useState(true);
  const [parkingInfos, setParkingInfos] = useState<ParkingInfo[]>([]);
  const [settings, setSettings] = useState<Record<string, ShareSetting | null>>({});
  const [incomeOverview, setIncomeOverview] = useState<Record<string, { totalIncome: number; monthIncome: number; todayIncome: number; shareCount: number }>>({});
  const [incomes, setIncomes] = useState<Record<string, ShareIncomeRecord[]>>({});
  const [saving, setSaving] = useState(false);

  // 编辑中的价格
  const [editPrices, setEditPrices] = useState<Record<string, { dailyPrice: number; nightPrice: number }>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const infos = await getParkingInfos(houseId);
      setParkingInfos(infos);

      const ownParkings = infos.filter(p => p.type === 'owned');
      const settingsMap: Record<string, ShareSetting | null> = {};
      const overviewMap: Record<string, any> = {};
      const incomesMap: Record<string, ShareIncomeRecord[]> = {};
      const pricesMap: Record<string, { dailyPrice: number; nightPrice: number }> = {};

      for (const p of ownParkings) {
        const setting = await getShareSettings(p.id);
        settingsMap[p.id] = setting;
        const overview = await getShareIncomeOverview(p.id);
        overviewMap[p.id] = overview;
        const incomeList = await getShareIncomes(p.id);
        incomesMap[p.id] = incomeList;
        pricesMap[p.id] = {
          dailyPrice: setting?.dailyPrice || 5,
          nightPrice: setting?.nightPrice || 3,
        };
      }

      setSettings(settingsMap);
      setIncomeOverview(overviewMap);
      setIncomes(incomesMap);
      setEditPrices(pricesMap);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (parkingId: string) => {
    try {
      const updated = await toggleShareStatus(parkingId);
      setSettings(prev => ({ ...prev, [parkingId]: updated }));
    } catch {
      // ignore
    }
  };

  const handleSave = async (parkingId: string) => {
    setSaving(true);
    try {
      const prices = editPrices[parkingId];
      const updated = await updateShareSetting({
        parkingId,
        dailyPrice: prices.dailyPrice,
        nightPrice: prices.nightPrice,
      });
      setSettings(prev => ({ ...prev, [parkingId]: updated }));
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { ...styles.statusBadge, background: '#EBFFEB', color: '#34C759' };
      case 'paused':
        return { ...styles.statusBadge, background: '#FFF5EB', color: '#FF9500' };
      case 'expired':
        return { ...styles.statusBadge, background: '#f5f5f7', color: '#86868b' };
      default:
        return styles.statusBadge;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '共享中';
      case 'paused': return '已暂停';
      case 'expired': return '已过期';
      default: return status;
    }
  };

  const ownParkings = parkingInfos.filter(p => p.type === 'owned');

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/owner/parking')}>‹</button>
          <div style={styles.headerTitle}>车位共享</div>
        </div>
        <div style={styles.loadingContainer}>
          <div style={{
            width: 28,
            height: 28,
            border: '3px solid #e8e8ed',
            borderTopColor: '#007AFF',
            borderRadius: '50%',
            animation: 'shareSpin 0.8s linear infinite',
          }} />
          <style>{`@keyframes shareSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 顶部导航 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/owner/parking')}>‹</button>
        <div style={styles.headerTitle}>车位共享</div>
      </div>

      {ownParkings.length === 0 ? (
        <div style={{ ...styles.card, margin: '12px 16px' }}>
          <div style={styles.emptyState}>
            <div style={styles.emptyEmoji}>🔒</div>
            <div style={{ fontSize: 15, color: '#1d1d1f', marginBottom: 4 }}>暂无自有车位</div>
            <div style={{ fontSize: 13 }}>仅自有车位可开启共享，租赁车位不可共享</div>
          </div>
        </div>
      ) : (
        ownParkings.map(parking => {
          const setting = settings[parking.id];
          const overview = incomeOverview[parking.id];
          const incomeList = incomes[parking.id] || [];
          const prices = editPrices[parking.id] || { dailyPrice: 5, nightPrice: 3 };
          const isActive = setting?.status === 'active';

          return (
            <div key={parking.id} style={styles.section}>
              {/* 收益概览 */}
              {overview && (
                <div style={styles.incomeOverview}>
                  <div style={styles.incomeCard}>
                    <div style={styles.incomeLabel}>累计收益</div>
                    <div style={styles.incomeValue}>¥{overview.totalIncome.toFixed(2)}</div>
                  </div>
                  <div style={styles.incomeCard}>
                    <div style={styles.incomeLabel}>本月收益</div>
                    <div style={styles.incomeValue}>¥{overview.monthIncome.toFixed(2)}</div>
                  </div>
                  <div style={styles.incomeCard}>
                    <div style={styles.incomeLabel}>今日收益</div>
                    <div style={styles.incomeValue}>¥{overview.todayIncome.toFixed(2)}</div>
                  </div>
                </div>
              )}

              {/* 共享设置 */}
              <div style={styles.settingCard}>
                <div style={styles.settingHeader}>
                  <div>
                    <div style={styles.parkingName}>{parking.parkingNo}</div>
                    <div style={{ fontSize: 12, color: '#86868b', marginTop: 2 }}>{parking.location}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={getStatusStyle(setting?.status || 'paused')}>
                      {getStatusText(setting?.status || 'paused')}
                    </span>
                    <button
                      style={isActive ? styles.toggleBtnActive : styles.toggleBtn}
                      onClick={() => handleToggle(parking.id)}>
                      {isActive ? '暂停共享' : '开启共享'}
                    </button>
                  </div>
                </div>

                {/* 价格设置 */}
                <div style={styles.priceRow}>
                  <div style={styles.priceItem}>
                    <div style={styles.priceLabel}>日间价格（元/小时）</div>
                    <input
                      style={styles.priceInput}
                      type="number"
                      value={prices.dailyPrice}
                      onChange={e => setEditPrices(prev => ({
                        ...prev,
                        [parking.id]: { ...prev[parking.id], dailyPrice: Number(e.target.value) }
                      }))}
                      min={1}
                      max={20}
                    />
                  </div>
                  <div style={styles.priceItem}>
                    <div style={styles.priceLabel}>夜间价格（元/小时）</div>
                    <input
                      style={styles.priceInput}
                      type="number"
                      value={prices.nightPrice}
                      onChange={e => setEditPrices(prev => ({
                        ...prev,
                        [parking.id]: { ...prev[parking.id], nightPrice: Number(e.target.value) }
                      }))}
                      min={1}
                      max={20}
                    />
                  </div>
                </div>

                {/* 共享时段 */}
                <div style={{ marginBottom: 8 }}>
                  <div style={styles.priceLabel}>共享时段</div>
                  {setting?.timeSlots.map((slot, idx) => (
                    <div key={idx} style={styles.timeSlotRow}>
                      <span style={styles.timeLabel}>{slot.type === 'day' ? '☀️ 日间' : '🌙 夜间'}</span>
                      <input style={styles.timeInput} type="time" value={slot.start} readOnly />
                      <span style={{ color: '#86868b' }}>至</span>
                      <input style={styles.timeInput} type="time" value={slot.end} readOnly />
                    </div>
                  )) || (
                    <div style={{ fontSize: 12, color: '#86868b' }}>默认 08:00 - 18:00（日间）</div>
                  )}
                </div>

                <button style={styles.saveBtn} onClick={() => handleSave(parking.id)} disabled={saving}>
                  {saving ? '保存中...' : '保存设置'}
                </button>

                <div style={styles.hint}>
                  💡 共享时段内其他业主可预约使用您的车位，收益将自动结算到您的账户。
                  仅自有车位可共享，租赁车位不可共享。
                </div>
              </div>

              {/* 收益记录 */}
              {incomeList.length > 0 && (
                <div style={styles.card}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f7', fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>
                    📊 收益记录
                  </div>
                  {incomeList.map((income, idx) => (
                    <div key={income.id} style={idx === incomeList.length - 1 ? styles.incomeItemLast : styles.incomeItem}>
                      <div>
                        <div style={styles.incomeDate}>{income.date}</div>
                        <div style={styles.incomePlate}>{income.plateNo}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={styles.incomeAmount}>+¥{income.amount.toFixed(2)}</div>
                        <div style={styles.incomeDuration}>{income.duration}小时</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ParkingShare;
