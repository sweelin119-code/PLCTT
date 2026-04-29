import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';
import {
  getEnabledBanners,
  getEnabledQuickMenus,
  onConfigChange,
} from '../../services/ownerConfigService';
import type { OwnerBannerConfig, OwnerQuickMenuConfig } from '../../services/ownerConfigTypes';

const OwnerHome: React.FC = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [bannerData, setBannerData] = useState<OwnerBannerConfig[]>([]);
  const [quickActions, setQuickActions] = useState<OwnerQuickMenuConfig[]>([]);

  // 加载配置
  const loadConfig = () => {
    setBannerData(getEnabledBanners());
    setQuickActions(getEnabledQuickMenus());
  };

  useEffect(() => {
    loadConfig();
    const unsubscribe = onConfigChange(loadConfig);
    return unsubscribe;
  }, []);

  // 自动轮播
  useEffect(() => {
    if (bannerData.length === 0) return;
    timerRef.current = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % bannerData.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bannerData.length]);

  // 公告列表
  const notices = [
    { title: '关于2026年五一假期物业服务中心值班安排的通知', time: '04-27', type: '公告', tag: '重要' },
    { title: '小区二次供水水箱清洗通知', time: '04-26', type: '通知', tag: '提醒' },
    { title: '社区邻里节活动报名开始啦！', time: '04-25', type: '活动', tag: '热门' },
    { title: '关于规范小区停车秩序的通知', time: '04-24', type: '公告', tag: '重要' },
  ];

  // 社区活动
  const activities = [
    { title: '五一邻里美食节', date: '05-01', status: '报名中', emoji: '🍜', color: '#FF9500', bg: '#FFF5EB' },
    { title: '亲子趣味运动会', date: '05-07', status: '即将开始', emoji: '🏃', color: '#34C759', bg: '#EBFFEB' },
    { title: '社区跳蚤市场', date: '05-15', status: '筹备中', emoji: '🎪', color: '#AF52DE', bg: '#F5EBFF' },
  ];

  const services = [
    { name: '家政保洁', price: '¥50/小时', sales: 128, emoji: '🧹', color: '#007AFF' },
    { name: '家电维修', price: '¥80起', sales: 86, emoji: '🔧', color: '#FF9500' },
    { name: '社区团购', price: '¥29.9起', sales: 256, emoji: '🛒', color: '#34C759' },
    { name: '搬家服务', price: '¥200起', sales: 64, emoji: '🚚', color: '#AF52DE' },
  ];

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* ===== Apple 风格轮播图 ===== */}
      <div style={{
        position: 'relative',
        margin: '12px 12px 0',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        aspectRatio: '2.2 / 1',
      }}>
        {bannerData.map((banner, index) => (
          <div
            key={banner.id}
            onClick={() => navigate(banner.sourceType === 'policy' ? '/owner/notice' : '/owner/activities')}
            style={{
              position: 'absolute',
              inset: 0,
              background: banner.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              cursor: 'pointer',
              opacity: index === currentBanner ? 1 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              zIndex: index === currentBanner ? 1 : 0,
            }}
          >
            <div>
              <div style={{
                fontSize: 22, fontWeight: 700, color: '#fff',
                marginBottom: 6, letterSpacing: -0.5,
              }}>
                {banner.title}
              </div>
              <div style={{
                fontSize: 13, color: 'rgba(255,255,255,0.8)',
                fontWeight: 400,
              }}>
                {banner.subtitle}
              </div>
              <div style={{
                marginTop: 12,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: 20,
                fontSize: 12, color: '#fff', fontWeight: 500,
              }}>
                立即体验 <RightOutlined style={{ fontSize: 10 }} />
              </div>
            </div>
            <div style={{ fontSize: 56, opacity: 0.9 }}>{banner.emoji}</div>
          </div>
        ))}

        {/* 轮播指示器 */}
        <div style={{
          position: 'absolute', bottom: 12, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 6, zIndex: 10,
        }}>
          {bannerData.map((_, index) => (
            <div
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentBanner(index); }}
              style={{
                width: index === currentBanner ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: index === currentBanner ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== 常用功能 - 2行4列 Apple 风格网格 ===== */}
      <div style={{
        margin: '16px 12px 0',
        background: '#fff',
        borderRadius: 16,
        padding: '20px 8px 8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }}>
          {quickActions.map(action => (
            <div
              key={action.id}
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                padding: '12px 4px 16px',
                WebkitTapHighlightColor: 'transparent',
                borderRadius: 12,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f8f8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: action.bg,
                color: action.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                <span style={{ fontSize: 24 }}>{action.icon}</span>
              </div>
              <span style={{
                fontSize: 12, color: '#1d1d1f',
                fontWeight: 500, letterSpacing: 0.2,
              }}>
                {action.label}
              </span>
            </div>
            ))}
        </div>
      </div>

      {/* ===== 社区公告 ===== */}
      <div style={{
        margin: '16px 12px 0',
        background: '#fff',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>📢</span>
            <span style={{
              fontSize: 15, fontWeight: 600, color: '#1d1d1f',
            }}>社区公告</span>
          </div>
          <span
            onClick={() => navigate('/owner/notice')}
            style={{
              fontSize: 13, color: '#007AFF', cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            查看全部
          </span>
        </div>
        {notices.map((notice, index) => (
          <div
            key={index}
            style={{
              padding: '10px 0',
              borderBottom: index < notices.length - 1 ? '1px solid #f2f2f7' : 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
            }}>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 4,
                fontWeight: 600, flexShrink: 0,
                background: notice.tag === '重要' ? '#FFEBEB' : notice.tag === '热门' ? '#FFF5EB' : '#EBF5FF',
                color: notice.tag === '重要' ? '#FF3B30' : notice.tag === '热门' ? '#FF9500' : '#007AFF',
              }}>
                {notice.tag}
              </span>
              <span style={{
                fontSize: 13, color: '#1d1d1f', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontWeight: 500,
              }}>
                {notice.title}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#8e8e93', paddingLeft: 2 }}>{notice.time}</div>
          </div>
        ))}
      </div>

      {/* ===== 社区活动 ===== */}
      <div style={{
        margin: '12px 12px 0',
        background: '#fff',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>🎉</span>
            <span style={{
              fontSize: 15, fontWeight: 600, color: '#1d1d1f',
            }}>社区活动</span>
          </div>
          <span
            onClick={() => navigate('/owner/activities')}
            style={{
              fontSize: 13, color: '#007AFF', cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            查看全部
          </span>
        </div>
        {activities.map((act, index) => (
          <div
            key={index}
            style={{
              padding: '10px 0',
              borderBottom: index < activities.length - 1 ? '1px solid #f2f2f7' : 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: act.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              {act.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: '#1d1d1f',
                marginBottom: 4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {act.title}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 12, color: '#8e8e93' }}>{act.date}</span>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  fontWeight: 600,
                  background: act.status === '报名中' ? '#EBFFEB' : act.status === '即将开始' ? '#EBF5FF' : '#F5EBFF',
                  color: act.status === '报名中' ? '#34C759' : act.status === '即将开始' ? '#007AFF' : '#AF52DE',
                }}>
                  {act.status}
                </span>
              </div>
            </div>
            <RightOutlined style={{ fontSize: 14, color: '#c7c7cc', flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* ===== 热门服务推荐 - Apple 风格横向滚动 ===== */}
      <div style={{ margin: '16px 12px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14, padding: '0 2px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: '#FFF5EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>🔥</div>
            <span style={{
              fontSize: 16, fontWeight: 600, color: '#1d1d1f',
              letterSpacing: -0.3,
            }}>热门服务</span>
          </div>
          <span
            onClick={() => navigate('/owner/services')}
            style={{
              fontSize: 13, color: '#007AFF', cursor: 'pointer',
              fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            全部 <RightOutlined style={{ fontSize: 11 }} />
          </span>
        </div>
        <div style={{
          display: 'flex', gap: 12, overflow: 'auto',
          paddingBottom: 4, scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 16,
                minWidth: 140,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${service.color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 12,
              }}>
                {service.emoji}
              </div>
              <div style={{
                fontSize: 14, fontWeight: 600, color: '#1d1d1f',
                marginBottom: 4, letterSpacing: -0.2,
              }}>
                {service.name}
              </div>
              <div style={{
                fontSize: 17, fontWeight: 700, color: service.color,
                marginBottom: 2,
              }}>
                {service.price}
              </div>
              <div style={{ fontSize: 12, color: '#8e8e93' }}>
                已售 {service.sales}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部留白 */}
      <div style={{ height: 16 }} />
    </div>
  );
};

export default OwnerHome;
