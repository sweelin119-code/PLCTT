import React, { useState, useEffect, useCallback } from 'react';
// 使用原生 DOM 弹窗，不依赖 antd-mobile
import {
  getDoorDevices,
  generateQRCode,
  remoteOpen,
  createTempPassword,
  getVisitorAuthRecords,
  getAccessRecords,
  type DoorDevice,
  type AccessRecord,
  type TempPassword,
  type VisitorAuthRecord,
} from '../../services/accessService';

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
  deviceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  } as React.CSSProperties,
  deviceCard: {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: '14px 12px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  deviceCardActive: {
    background: 'rgba(64,169,255,0.25)',
    border: '1px solid rgba(64,169,255,0.5)',
  },
  deviceIcon: {
    fontSize: 28,
    marginBottom: 6,
  } as React.CSSProperties,
  deviceName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 2,
  } as React.CSSProperties,
  deviceStatus: {
    fontSize: 11,
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
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },
  tagActive: {
    background: '#e6f7e6',
    color: '#52c41a',
  },
  tagUsed: {
    background: '#e6f7ff',
    color: '#1890ff',
  },
  tagExpired: {
    background: '#fff7e6',
    color: '#fa8c16',
  },
  tagFailed: {
    background: '#fff2f0',
    color: '#ff4d4f',
  },
  actionRow: {
    display: 'flex',
    gap: 10,
    marginTop: 12,
  } as React.CSSProperties,
  actionBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 10,
    textAlign: 'center' as const,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
  } as React.CSSProperties,
  primaryBtn: {
    background: '#1677ff',
    color: '#fff',
  },
  outlineBtn: {
    background: 'transparent',
    color: '#1677ff',
    border: '1px solid #1677ff',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  } as React.CSSProperties,
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: 16,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  modalBody: {
    marginBottom: 20,
  } as React.CSSProperties,
  modalActions: {
    display: 'flex',
    gap: 10,
  } as React.CSSProperties,
  modalBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 10,
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    marginBottom: 10,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    display: 'block',
  } as React.CSSProperties,
  qrContainer: {
    textAlign: 'center' as const,
    padding: '20px 0',
  } as React.CSSProperties,
  qrPlaceholder: {
    width: 180,
    height: 180,
    background: '#f5f5f5',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    fontSize: 13,
    color: '#999',
  } as React.CSSProperties,
  qrExpire: {
    fontSize: 12,
    color: '#999',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#999',
  } as React.CSSProperties,
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.3,
  } as React.CSSProperties,
  loadingState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#999',
  } as React.CSSProperties,
  errorState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#ff4d4f',
  } as React.CSSProperties,
  retryBtn: {
    marginTop: 12,
    padding: '8px 24px',
    borderRadius: 8,
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
  } as React.CSSProperties,
  recordItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  recordInfo: {
    flex: 1,
  } as React.CSSProperties,
  recordDoor: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1d1d1f',
    marginBottom: 2,
  } as React.CSSProperties,
  recordMeta: {
    fontSize: 12,
    color: '#999',
  } as React.CSSProperties,
  recordStatus: {
    fontSize: 12,
    fontWeight: 500,
  } as React.CSSProperties,
  tabBar: {
    display: 'flex',
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  } as React.CSSProperties,
  tab: {
    flex: 1,
    padding: '10px 0',
    textAlign: 'center' as const,
    fontSize: 13,
    fontWeight: 500,
    color: '#666',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  tabActive: {
    color: '#1677ff',
    borderBottom: '2px solid #1677ff',
    fontWeight: 600,
  } as React.CSSProperties,
};

// ===== 子组件：门禁设备卡片 =====
const DoorDeviceCard: React.FC<{
  device: DoorDevice;
  onClick: (device: DoorDevice) => void;
}> = ({ device, onClick }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'main': return '🏛️';
      case 'unit': return '🏠';
      case 'underground': return '🅿️';
      case 'side': return '🚪';
      default: return '🔒';
    }
  };

  return (
    <div
      style={{
        ...styles.deviceCard,
        ...(device.isOnline ? {} : { opacity: 0.5 }),
      }}
      onClick={() => onClick(device)}
    >
      <div style={styles.deviceIcon}>{getIcon(device.type!)}</div>
      <div style={styles.deviceName}>{device.name}</div>
      <div style={styles.deviceStatus}>
        {device.isOnline ? '在线' : '离线'}
      </div>
    </div>
  );
};

// ===== 主组件 =====
const DoorAccess: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'access' | 'visitors' | 'records'>('access');
  const [devices, setDevices] = useState<DoorDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 访客授权记录
  const [visitorRecords, setVisitorRecords] = useState<VisitorAuthRecord[]>([]);
  const [visitorLoading, setVisitorLoading] = useState(false);

  // 开门记录
  const [accessRecords, setAccessRecords] = useState<AccessRecord[]>([]);
  const [recordLoading, setRecordLoading] = useState(false);

  // 弹窗状态
  const [selectedDevice, setSelectedDevice] = useState<DoorDevice | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrContent, setQrContent] = useState('');
  const [qrExpire, setQrExpire] = useState(30);
  const [qrTimer, setQrTimer] = useState<NodeJS.Timeout | null>(null);

  // 临时密码弹窗
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [validHours, setValidHours] = useState(24);
  const [generatedPassword, setGeneratedPassword] = useState<TempPassword | null>(null);
  const [creatingPassword, setCreatingPassword] = useState(false);

  // 远程开门
  const [openingDoor, setOpeningDoor] = useState(false);

  // ===== 加载门禁设备 =====
  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoorDevices();
      setDevices(data);
    } catch (err) {
      setError('加载门禁设备失败，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // ===== 加载访客授权记录 =====
  const loadVisitorRecords = useCallback(async () => {
    setVisitorLoading(true);
    try {
      const data = await getVisitorAuthRecords();
      setVisitorRecords(data);
    } catch {
      // 静默失败
    } finally {
      setVisitorLoading(false);
    }
  }, []);

  // ===== 加载开门记录 =====
  const loadAccessRecords = useCallback(async () => {
    setRecordLoading(true);
    try {
      const { records } = await getAccessRecords({ pageSize: 20 });
      setAccessRecords(records);
    } catch {
      // 静默失败
    } finally {
      setRecordLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'visitors') loadVisitorRecords();
    if (activeTab === 'records') loadAccessRecords();
  }, [activeTab, loadVisitorRecords, loadAccessRecords]);

  // ===== 设备点击 =====
  const handleDeviceClick = (device: DoorDevice) => {
    setSelectedDevice(device);
    setShowDeviceModal(true);
  };

  // ===== 生成二维码 =====
  const handleGenerateQR = async () => {
    if (!selectedDevice) return;
    try {
      const result = await generateQRCode(selectedDevice.id);
      setQrContent(result.qrContent);
      setQrExpire(result.expiresIn);
      setShowQRModal(true);

      // 倒计时
      if (qrTimer) clearInterval(qrTimer);
      const timer = setInterval(() => {
        setQrExpire(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setQrTimer(timer);
    } catch {
      alert('生成二维码失败');
    }
  };

  // ===== 远程开门 =====
  const handleRemoteOpen = async () => {
    if (!selectedDevice) return;
    setOpeningDoor(true);
    try {
      const result = await remoteOpen(selectedDevice.id);
      if (result.success) {
        alert('开门成功');
      } else {
        alert(result.message);
      }
    } catch {
      alert('开门失败，请重试');
    } finally {
      setOpeningDoor(false);
    }
  };

  // ===== 创建临时密码 =====
  const handleCreatePassword = async () => {
    if (!selectedDevice) return;
    if (!visitorName.trim()) {
      alert('请输入访客姓名');
      return;
    }
    if (!/^1\d{10}$/.test(visitorPhone.trim())) {
      alert('请输入正确的手机号');
      return;
    }

    setCreatingPassword(true);
    try {
      const result = await createTempPassword({
        doorId: selectedDevice.id,
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        visitReason: visitReason.trim() || undefined,
        validHours,
      });
      setGeneratedPassword(result as TempPassword);
    } catch {
      alert('生成临时密码失败');
    } finally {
      setCreatingPassword(false);
    }
  };

  // ===== 复制密码 =====
  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password).then(() => {
      alert('已复制密码');
    });
  };

  // ===== 关闭二维码弹窗 =====
  const handleCloseQR = () => {
    setShowQRModal(false);
    if (qrTimer) clearInterval(qrTimer);
    setQrContent('');
  };

  // ===== 获取开门方式标签 =====
  const getMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      bluetooth: '蓝牙',
      qrcode: '二维码',
      remote: '远程',
      password: '密码',
      face: '人脸',
    };
    return map[method] || method;
  };

  // ===== 获取状态标签 =====
  const getStatusTag = (status: string) => {
    if (status === 'success') return <span style={{ ...styles.tag, ...styles.tagActive }}>成功</span>;
    if (status === 'failed') return <span style={{ ...styles.tag, ...styles.tagFailed }}>失败</span>;
    if (status === 'active') return <span style={{ ...styles.tag, ...styles.tagActive }}>有效</span>;
    if (status === 'used') return <span style={{ ...styles.tag, ...styles.tagUsed }}>已使用</span>;
    if (status === 'expired') return <span style={{ ...styles.tag, ...styles.tagExpired }}>已过期</span>;
    return null;
  };

  // ===== 渲染加载状态 =====
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.headerGradient}>
          <div style={styles.headerTitle}>智能门禁</div>
          <div style={styles.headerSub}>蓝牙开门 · 远程开门 · 访客授权</div>
        </div>
        <div style={styles.loadingState}>
          <div style={{ fontSize: 14 }}>加载中...</div>
        </div>
      </div>
    );
  }

  // ===== 渲染错误状态 =====
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.headerGradient}>
          <div style={styles.headerTitle}>智能门禁</div>
          <div style={styles.headerSub}>蓝牙开门 · 远程开门 · 访客授权</div>
        </div>
        <div style={styles.errorState}>
          <div style={{ fontSize: 14, marginBottom: 8 }}>{error}</div>
          <button style={styles.retryBtn} onClick={loadDevices}>重新加载</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 头部 */}
      <div style={styles.headerGradient}>
        <div style={styles.headerTitle}>智能门禁</div>
        <div style={styles.headerSub}>蓝牙开门 · 远程开门 · 访客授权</div>

        {/* 设备网格 */}
        {devices.length > 0 ? (
          <div style={styles.deviceGrid}>
            {devices.map(device => (
              <DoorDeviceCard key={device.id} device={device} onClick={handleDeviceClick} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.5)' }}>
            暂无门禁设备
          </div>
        )}
      </div>

      {/* Tab 切换 */}
      <div style={styles.section}>
        <div style={styles.tabBar}>
          <div
            style={{ ...styles.tab, ...(activeTab === 'access' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('access')}
          >
            快捷操作
          </div>
          <div
            style={{ ...styles.tab, ...(activeTab === 'visitors' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('visitors')}
          >
            访客授权
          </div>
          <div
            style={{ ...styles.tab, ...(activeTab === 'records' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('records')}
          >
            开门记录
          </div>
        </div>

        {/* Tab 内容 */}
        {activeTab === 'access' && (
          <div style={styles.card}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>
                快捷操作
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                点击上方门禁设备进行操作
              </div>
            </div>
            <div style={{ padding: 16, textAlign: 'center', color: '#999', fontSize: 13 }}>
              点击门禁设备卡片可进行远程开门、生成二维码、创建临时密码等操作
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div style={styles.card}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>
                访客授权记录
              </div>
            </div>
            {visitorLoading ? (
              <div style={styles.loadingState}>加载中...</div>
            ) : visitorRecords.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>
                <div>暂无访客授权记录</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  点击门禁设备为访客创建临时密码或远程开门
                </div>
              </div>
            ) : (
              visitorRecords.map((record, index) => (
                <div
                  key={record.id}
                  style={index === visitorRecords.length - 1 ? styles.cardItemLast : styles.cardItem}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>
                      {record.visitorName}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      {record.doorName} · {record.authType === 'password' ? '临时密码' : '远程开门'}
                    </div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>
                      {record.createdAt}
                    </div>
                  </div>
                  {getStatusTag(record.status)}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div style={styles.card}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>
                开门记录
              </div>
            </div>
            {recordLoading ? (
              <div style={styles.loadingState}>加载中...</div>
            ) : accessRecords.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🔓</div>
                <div>暂无开门记录</div>
              </div>
            ) : (
              accessRecords.map((record, index) => (
                <div
                  key={record.id}
                  style={styles.recordItem}
                >
                  <div style={styles.recordInfo}>
                    <div style={styles.recordDoor}>{record.doorName}</div>
                    <div style={styles.recordMeta}>
                      {getMethodLabel(record.method!)}
                      {record.ownerName ? ` · ${record.ownerName}` : ''}
                      {record.visitorName ? ` · 访客:${record.visitorName}` : ''}
                      <span style={{ marginLeft: 8 }}>{record.time}</span>
                    </div>
                  </div>
                  {getStatusTag(record.status)}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ===== 设备操作弹窗 ===== */}
      {showDeviceModal && selectedDevice && (
        <div style={styles.modalOverlay} onClick={() => setShowDeviceModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              {selectedDevice.name}
            </div>
            <div style={styles.modalBody}>
              <div style={{ textAlign: 'center', marginBottom: 16, color: '#666', fontSize: 13 }}>
                {selectedDevice.isOnline ? '设备在线' : '设备离线'}
                {selectedDevice.location ? ` · ${selectedDevice.location}` : ''}
              </div>

              {/* 远程开门 */}
              <div
                style={{
                  ...styles.cardItem,
                  borderRadius: 10,
                  marginBottom: 8,
                  background: '#f5f5f7',
                }}
                onClick={handleRemoteOpen}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>🔓 远程开门</div>
                  <div style={{ fontSize: 12, color: '#999' }}>一键远程开启门禁</div>
                </div>
                <div style={{ color: '#1677ff', fontSize: 13 }}>
                  {openingDoor ? '开门中...' : '开门'}
                </div>
              </div>

              {/* 生成二维码 */}
              <div
                style={{
                  ...styles.cardItem,
                  borderRadius: 10,
                  marginBottom: 8,
                  background: '#f5f5f7',
                }}
                onClick={handleGenerateQR}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>📱 生成二维码</div>
                  <div style={{ fontSize: 12, color: '#999' }}>生成临时通行二维码</div>
                </div>
                <div style={{ color: '#1677ff', fontSize: 13 }}>生成</div>
              </div>

              {/* 创建临时密码 */}
              <div
                style={{
                  ...styles.cardItem,
                  borderRadius: 10,
                  marginBottom: 8,
                  background: '#f5f5f7',
                }}
                onClick={() => {
                  setShowDeviceModal(false);
                  setShowPasswordModal(true);
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>🔑 创建临时密码</div>
                  <div style={{ fontSize: 12, color: '#999' }}>为访客创建临时开门密码</div>
                </div>
                <div style={{ color: '#1677ff', fontSize: 13 }}>创建</div>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button
                style={{ ...styles.modalBtn, background: '#f5f5f7', color: '#666' }}
                onClick={() => setShowDeviceModal(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 二维码弹窗 ===== */}
      {showQRModal && (
        <div style={styles.modalOverlay} onClick={handleCloseQR}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>通行二维码</div>
            <div style={styles.modalBody}>
              <div style={styles.qrContainer}>
                <div style={styles.qrPlaceholder}>
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                    <div style={{ fontSize: 11, color: '#999' }}>
                      请使用门禁扫码器扫描
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#999', wordBreak: 'break-all', marginBottom: 8 }}>
                  {qrContent}
                </div>
                <div style={styles.qrExpire}>
                  二维码将在 <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{qrExpire}</span> 秒后过期
                </div>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button
                style={{ ...styles.modalBtn, background: '#f5f5f7', color: '#666' }}
                onClick={handleCloseQR}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 临时密码弹窗 ===== */}
      {showPasswordModal && (
        <div style={styles.modalOverlay} onClick={() => {
          if (!generatedPassword) setShowPasswordModal(false);
        }}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            {!generatedPassword ? (
              <>
                <div style={styles.modalTitle}>创建临时密码</div>
                <div style={styles.modalBody}>
                  <label style={styles.label}>访客姓名 *</label>
                  <input
                    style={styles.input}
                    placeholder="请输入访客姓名"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                  />
                  <label style={styles.label}>访客手机号 *</label>
                  <input
                    style={styles.input}
                    placeholder="请输入11位手机号"
                    maxLength={11}
                    value={visitorPhone}
                    onChange={e => setVisitorPhone(e.target.value)}
                  />
                  <label style={styles.label}>来访事由</label>
                  <input
                    style={styles.input}
                    placeholder="如：朋友来访、维修等"
                    value={visitReason}
                    onChange={e => setVisitReason(e.target.value)}
                  />
                  <label style={styles.label}>有效期（小时）</label>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {[2, 6, 12, 24, 48].map(h => (
                      <div
                        key={h}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          borderRadius: 6,
                          textAlign: 'center',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          background: validHours === h ? '#1677ff' : '#f5f5f7',
                          color: validHours === h ? '#fff' : '#666',
                        }}
                        onClick={() => setValidHours(h)}
                      >
                        {h}h
                      </div>
                    ))}
                  </div>
                </div>
                <div style={styles.modalActions}>
                  <button
                    style={{ ...styles.modalBtn, background: '#f5f5f7', color: '#666' }}
                    onClick={() => {
                      setShowPasswordModal(false);
                      setVisitorName('');
                      setVisitorPhone('');
                      setVisitReason('');
                      setValidHours(24);
                    }}
                  >
                    取消
                  </button>
                  <button
                    style={{ ...styles.modalBtn, background: '#1677ff', color: '#fff' }}
                    onClick={handleCreatePassword}
                    disabled={creatingPassword}
                  >
                    {creatingPassword ? '生成中...' : '生成密码'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.modalTitle}>临时密码已生成</div>
                <div style={styles.modalBody}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                      访客 {generatedPassword.visitorName}
                    </div>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: '#1677ff',
                        letterSpacing: 6,
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        padding: '12px 0',
                      }}
                      onClick={() => handleCopyPassword(generatedPassword.password)}
                    >
                      {generatedPassword.password}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      点击密码可复制 · 有效期至 {generatedPassword.validTo}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      适用门禁：{generatedPassword.doorName}
                    </div>
                  </div>
                </div>
                <div style={styles.modalActions}>
                  <button
                    style={{ ...styles.modalBtn, background: '#1677ff', color: '#fff' }}
                    onClick={() => {
                      setShowPasswordModal(false);
                      setGeneratedPassword(null);
                      setVisitorName('');
                      setVisitorPhone('');
                      setVisitReason('');
                      setValidHours(24);
                    }}
                  >
                    完成
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoorAccess;
