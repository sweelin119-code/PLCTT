import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';
import {
  getEnabledMineMenuPaths,
  onConfigChange,
} from '../../services/ownerConfigService';

// 我的服务图标映射（基于路径）
const serviceIconMap: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  '/owner/mine/repairs': { emoji: '📋', label: '我的报修', color: '#007AFF', bg: '#EBF5FF' },
  '/owner/mine/payments': { emoji: '💳', label: '缴费记录', color: '#34C759', bg: '#EBFFEB' },
  '/owner/mine/expresses': { emoji: '📦', label: '我的快递', color: '#FF9500', bg: '#FFF5EB' },
  '/owner/mine/coupons': { emoji: '🎫', label: '我的优惠券', color: '#AF52DE', bg: '#F5EBFF' },
  '/owner/mine/houses': { emoji: '🏠', label: '我的房屋', color: '#FF2D55', bg: '#FFEBF0' },
  '/owner/mine/votes': { emoji: '🗳️', label: '我的投票', color: '#5856D6', bg: '#F0EBFF' },
  '/owner/mine/complaints': { emoji: '💡', label: '我的投诉', color: '#FF3B30', bg: '#FFEBEB' },
  '/owner/mine/activities': { emoji: '🎪', label: '我的活动', color: '#FF2D55', bg: '#FFEBF0' },
};

const menuGroups = [
  {
    title: '社区服务',
    items: [
      { emoji: '🗳️', label: '我的投票', path: '/owner/mine/votes' },
      { emoji: '💡', label: '我的投诉', path: '/owner/mine/complaints' },
      { emoji: '🎪', label: '我的活动', path: '/owner/mine/activities' },
    ],
  },
  {
    title: '设置',
    items: [
      { emoji: '👤', label: '个人信息', path: '/owner/mine/profile' },
      { emoji: '🔔', label: '消息设置', path: '/owner/mine/notify-settings' },
      { emoji: '🔒', label: '账号安全', path: '/owner/mine/security' },
      { emoji: '📖', label: '使用帮助', path: '/owner/mine/help' },
      { emoji: 'ℹ️', label: '关于我们', path: '/owner/mine/about' },
    ],
  },
];

const OwnerMine: React.FC = () => {
  const navigate = useNavigate();

  const [mineServices, setMineServices] = useState<{ emoji: string; label: string; path: string; color: string; bg: string }[]>([]);

  const loadConfig = () => {
    const enabledPaths = getEnabledMineMenuPaths();
    const result = enabledPaths
      .map(path => {
        const iconInfo = serviceIconMap[path];
        if (!iconInfo) return null;
        return { ...iconInfo, path };
      })
      .filter(Boolean) as { emoji: string; label: string; path: string; color: string; bg: string }[];
    setMineServices(result);
  };

  useEffect(() => {
    loadConfig();
    const unsubscribe = onConfigChange(loadConfig);
    return unsubscribe;
  }, []);

  return (
    <div>
      {/* ===== Apple 风格用户信息头部 ===== */}
      <div style={{
        background: 'linear-gradient(180deg, #007AFF 0%, #5856D6 100%)',
        padding: '24px 20px 36px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景装饰圆 */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 160, height: 160, borderRadius: 80,
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', right: 20, bottom: -30,
          width: 100, height: 100, borderRadius: 50,
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 34,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34,
            border: '2px solid rgba(255,255,255,0.3)',
          }}>
            👤
          </div>
          <div>
            <div style={{
              fontSize: 22, fontWeight: 700, marginBottom: 4,
              letterSpacing: -0.5,
            }}>
              张先生
            </div>
            <div style={{
              fontSize: 13, opacity: 0.85, fontWeight: 400,
            }}>
              业主 · 碧桂园小区3栋2单元1501
            </div>
            <div style={{
              marginTop: 8, display: 'flex', gap: 16,
              fontSize: 12, opacity: 0.8,
            }}>
              <span>🏠 绑定房屋: 1套</span>
              <span>👨‍👩‍👧‍👦 家庭成员: 3人</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Apple 风格快捷数据卡片 ===== */}
      <div style={{
        background: '#fff',
        margin: '-20px 12px 0',
        borderRadius: 14,
        padding: '18px 0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        border: '1px solid #f2f2f7',
      }}>
        {[
          { value: '3', label: '待处理报修', color: '#FF3B30' },
          { value: '¥328', label: '待缴费用', color: '#FF9500' },
          { value: '2', label: '未读消息', color: '#007AFF' },
          { value: '128', label: '积分', color: '#AF52DE' },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              flex: 1, textAlign: 'center',
              borderRight: index < 3 ? '1px solid #f2f2f7' : 'none',
            }}
          >
            <div style={{
              fontSize: 20, fontWeight: 700, color: item.color,
              letterSpacing: -0.5,
            }}>
              {item.value}
            </div>
            <div style={{
              fontSize: 11, color: '#8e8e93', marginTop: 4,
              fontWeight: 500,
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* ===== 我的服务 - 白底卡片一行平铺 ===== */}
      {mineServices.length > 0 && (
        <div style={{ padding: '16px 12px 0' }}>
          <div style={{
            fontSize: 13, color: '#8e8e93', marginBottom: 10,
            padding: '0 4px', fontWeight: 500, letterSpacing: 0.2,
          }}>
            我的服务
          </div>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: '16px 8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            border: '1px solid #f2f2f7',
          }}>
            <div style={{
              display: 'flex',
              gap: 4,
            }}>
              {mineServices.map((service, index) => (
                <div
                  key={index}
                  onClick={() => navigate(service.path)}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    padding: '10px 4px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f8f8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 11,
                    background: service.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {service.emoji}
                  </div>
                  <span style={{
                    fontSize: 11, color: '#1d1d1f',
                    fontWeight: 500, whiteSpace: 'nowrap',
                  }}>
                    {service.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Apple 风格菜单列表 ===== */}
      <div style={{ padding: '16px 12px 0' }}>
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 13, color: '#8e8e93', marginBottom: 8,
              padding: '0 4px', fontWeight: 500, letterSpacing: 0.2,
            }}>
              {group.title}
            </div>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              border: '1px solid #f2f2f7',
            }}>
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '14px 16px',
                    borderBottom: itemIndex < group.items.length - 1 ? '1px solid #f2f2f7' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                >
                  <span style={{
                    fontSize: 20, marginRight: 12, width: 24, textAlign: 'center',
                  }}>
                    {item.emoji}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 15, color: '#1d1d1f',
                    fontWeight: 500, letterSpacing: -0.2,
                  }}>
                    {item.label}
                  </span>
                  <RightOutlined style={{ color: '#c7c7cc', fontSize: 14 }} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ===== Apple 风格退出登录按钮 ===== */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: '14px 0',
            textAlign: 'center',
            fontSize: 15,
            color: '#FF3B30',
            cursor: 'pointer',
            fontWeight: 500,
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            border: '1px solid #f2f2f7',
            marginBottom: 16,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          退出登录
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
};

export default OwnerMine;
