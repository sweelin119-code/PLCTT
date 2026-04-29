import React, { useState, useEffect, useCallback } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { PortalBanner } from '../../services/portalTypes';

interface BannerCarouselProps {
  banners: PortalBanner[];
  onBannerClick: (banner: PortalBanner) => void;
}

// 渐变色背景映射（没有真实图片时使用）
const bannerGradients = [
  'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
  'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
  'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
  'linear-gradient(135deg, #e65100 0%, #bf360c 100%)',
  'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
];

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, onBannerClick }) => {
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // 自动轮播
  useEffect(() => {
    if (isHovering || banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isHovering, banners.length, next]);

  if (banners.length === 0) {
    return (
      <div style={{
        height: 320, borderRadius: 16,
        background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 20,
      }}>
        暂无 Banner 内容
      </div>
    );
  }

  const banner = banners[current];
  const gradient = bannerGradients[current % bannerGradients.length];

  return (
    <div
      style={{
        position: 'relative',
        height: 320,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        background: gradient,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onBannerClick(banner)}
    >
      {/* 装饰性背景图案 */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', right: 100, bottom: -80,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        <div style={{
          position: 'absolute', left: -40, top: '40%',
          width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
      </div>

      {/* 内容 */}
      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 80px',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 16px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          borderRadius: 20,
          color: '#fff',
          fontSize: 12,
          marginBottom: 16,
          width: 'fit-content',
        }}>
          {banner.linkType === 'policy' ? '📰 政策资讯' : '📋 规章制度'}
        </div>
        <h2 style={{
          color: '#fff',
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 12,
          textShadow: '0 2px 12px rgba(0,0,0,0.2)',
          lineHeight: 1.3,
        }}>
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 16,
            margin: 0,
            textShadow: '0 1px 8px rgba(0,0,0,0.15)',
          }}>
            {banner.subtitle}
          </p>
        )}
      </div>

      {/* 左右箭头 */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(4px)',
              border: 'none', color: '#fff', fontSize: 16,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s',
              zIndex: 2,
            }}
          >
            <LeftOutlined />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(4px)',
              border: 'none', color: '#fff', fontSize: 16,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s',
              zIndex: 2,
            }}
          >
            <RightOutlined />
          </button>
        </>
      )}

      {/* 指示器 */}
      {banners.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8, zIndex: 2,
        }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
