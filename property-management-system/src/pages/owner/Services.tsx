import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getEnabledServiceCategories,
  getEnabledServices,
  onConfigChange,
} from '../../services/ownerConfigService';
import type { OwnerServiceCategoryConfig, OwnerServiceConfig } from '../../services/ownerConfigTypes';

const OwnerServices: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<OwnerServiceCategoryConfig[]>([]);
  const [services, setServices] = useState<OwnerServiceConfig[]>([]);

  const loadConfig = () => {
    setCategories(getEnabledServiceCategories());
    setServices(getEnabledServices());
  };

  useEffect(() => {
    loadConfig();
    const unsubscribe = onConfigChange(loadConfig);
    return unsubscribe;
  }, []);

  // 按分类分组服务
  const groupedServices = categories.map(cat => ({
    ...cat,
    items: services.filter(s => s.categoryId === cat.id),
  })).filter(g => g.items.length > 0);

  return (
    <div style={{ padding: '12px 12px 0' }}>
      {/* ===== 服务分类 - 3列网格 ===== */}
      {groupedServices.map((category, catIndex) => (
        <div key={catIndex} style={{ marginBottom: 20 }}>
          {/* 分类标题 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 12, padding: '0 4px',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: category.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              {category.emoji}
            </div>
            <span style={{
              fontSize: 16, fontWeight: 600, color: '#1d1d1f',
              letterSpacing: -0.3,
            }}>
              {category.title}
            </span>
          </div>

          {/* 3列网格卡片 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
          }}>
            {category.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                onClick={() => navigate(item.path)}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: 16,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  border: '1px solid #f2f2f7',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = category.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#f2f2f7';
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: category.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 8,
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: '#1d1d1f',
                  letterSpacing: -0.2,
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ height: 16 }} />
    </div>
  );
};

export default OwnerServices;
