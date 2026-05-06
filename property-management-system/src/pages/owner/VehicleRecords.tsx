import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicleRecords, type VehicleRecord } from '../../services/ownerParkingService';

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
  dateFilter: {
    display: 'flex',
    gap: 8,
    padding: '12px 16px',
    overflowX: 'auto' as const,
    whiteSpace: 'nowrap' as const,
    scrollbarWidth: 'none' as const,
  } as React.CSSProperties,
  dateBtn: {
    padding: '6px 16px',
    borderRadius: 16,
    border: '1px solid #e8e8ed',
    background: '#fff',
    fontSize: 13,
    color: '#1d1d1f',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s',
  } as React.CSSProperties,
  dateBtnActive: {
    padding: '6px 16px',
    borderRadius: 16,
    border: '1px solid #007AFF',
    background: '#007AFF',
    fontSize: 13,
    color: '#fff',
    cursor: 'pointer',
    flexShrink: 0,
  } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: 14,
    margin: '0 16px 12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  recordItem: {
    padding: '14px 16px',
    borderBottom: '1px solid #f5f5f7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  recordItemLast: {
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  plateNo: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1d1d1f',
  } as React.CSSProperties,
  timeInfo: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 3,
  } as React.CSSProperties,
  entrance: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 2,
  } as React.CSSProperties,
  typeTag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  } as React.CSSProperties,
  feeAmount: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FF3B30',
  } as React.CSSProperties,
  freeTag: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: 500,
  } as React.CSSProperties,
  duration: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 2,
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
};

const getTypeTag = (type: VehicleRecord['type']) => {
  switch (type) {
    case 'owner':
      return <span style={{ ...styles.typeTag, background: '#EBF5FF', color: '#007AFF' }}>业主</span>;
    case 'visitor':
      return <span style={{ ...styles.typeTag, background: '#FFF5EB', color: '#FF9500' }}>访客</span>;
    case 'temp':
      return <span style={{ ...styles.typeTag, background: '#FFEBEB', color: '#FF3B30' }}>临时</span>;
  }
};

const VehicleRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const houseId = 'H1001';
      const data = await getVehicleRecords(houseId, dateFilter !== 'all' ? dateFilter : undefined);
      setRecords(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 生成日期筛选选项（最近7天）
  const getDateOptions = () => {
    const options = [{ label: '全部', value: 'all' }];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const value = d.toISOString().substring(0, 10);
      const label = i === 0 ? '今天' : i === 1 ? '昨天' : `${d.getMonth() + 1}/${d.getDate()}`;
      options.push({ label, value });
    }
    return options;
  };

  return (
    <div style={styles.container}>
      {/* 顶部导航 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/owner/parking')}>‹</button>
        <div style={styles.headerTitle}>车辆出入记录</div>
      </div>

      {/* 日期筛选 */}
      <div style={styles.dateFilter}>
        {getDateOptions().map(opt => (
          <button
            key={opt.value}
            style={dateFilter === opt.value ? styles.dateBtnActive : styles.dateBtn}
            onClick={() => setDateFilter(opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* 记录列表 */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={{
            width: 28,
            height: 28,
            border: '3px solid #e8e8ed',
            borderTopColor: '#007AFF',
            borderRadius: '50%',
            animation: 'vrSpin 0.8s linear infinite',
          }} />
          <style>{`@keyframes vrSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : records.length === 0 ? (
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <div style={styles.emptyEmoji}>🚗</div>
            <div style={{ fontSize: 15, color: '#1d1d1f', marginBottom: 4 }}>暂无出入记录</div>
            <div style={{ fontSize: 13 }}>选定日期内没有车辆出入记录</div>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          {records.map((record, idx) => (
            <div key={record.id} style={idx === records.length - 1 ? styles.recordItemLast : styles.recordItem}>
              <div>
                <div style={styles.plateNo}>{record.plateNo}</div>
                <div style={styles.timeInfo}>
                  🟢 {record.entryTime}
                </div>
                {record.exitTime && (
                  <div style={styles.timeInfo}>
                    🔴 {record.exitTime}
                  </div>
                )}
                <div style={styles.entrance}>
                  {record.entrance} · {record.duration}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {getTypeTag(record.type)}
                {record.fee ? (
                  <div style={styles.feeAmount}>¥{record.fee.toFixed(2)}</div>
                ) : (
                  <div style={styles.freeTag}>免费</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleRecords;
