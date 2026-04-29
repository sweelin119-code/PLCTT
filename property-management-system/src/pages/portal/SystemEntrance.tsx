import React from 'react';
import {
  BankOutlined, AppstoreOutlined, ShopOutlined,
  WechatOutlined, SettingOutlined,
} from '@ant-design/icons';

interface SystemCard {
  key: string;
  title: string;
  icon: React.ReactNode;
  desc: string;
  color: string;
  gradient: string;
  path: string;
  features: string[];
  emoji: string;
  tag?: string;
  tagColor?: string;
}

const systems: SystemCard[] = [
  {
    key: 'government', title: '政府监管端',
    icon: <BankOutlined />,
    desc: '市区住建 · 街道物业 · 社区管理',
    color: '#1890ff', gradient: 'linear-gradient(135deg, #1890ff, #096dd9)',
    path: '/government/dashboard',
    features: ['政策监管', '投诉督办', '数据大屏'],
    emoji: '🏛️',
  },
  {
    key: 'property', title: '物业管理端',
    icon: <AppstoreOutlined />,
    desc: '物业人员 · 保安保洁 · 维保服务',
    color: '#52c41a', gradient: 'linear-gradient(135deg, #52c41a, #389e0d)',
    path: '/property/dashboard',
    features: ['工单管理', '设备巡检', '财务收费'],
    emoji: '🏢',
  },
  {
    key: 'merchant', title: '商家管理端',
    icon: <ShopOutlined />,
    desc: '社区商家 · 服务提供商 · 供应链',
    color: '#722ed1', gradient: 'linear-gradient(135deg, #722ed1, #531dab)',
    path: '/merchant/dashboard',
    features: ['店铺管理', '订单处理', '营销活动'],
    emoji: '🏪',
  },
  {
    key: 'owner', title: '业主端',
    icon: <WechatOutlined />,
    desc: '业主 · 访客 · 微信H5便捷服务',
    color: '#07c160', gradient: 'linear-gradient(135deg, #07c160, #059b4f)',
    path: '/owner/home',
    features: ['在线报修', '物业缴费', '邻里互动'],
    emoji: '📱',
    tag: '微信 H5',
  },
  {
    key: 'superadmin', title: '配置管理端',
    icon: <SettingOutlined />,
    desc: '系统配置 · 端口管理 · 全局设置',
    color: '#fa8c16', gradient: 'linear-gradient(135deg, #fa8c16, #d46b08)',
    path: '/superadmin/port-config',
    features: ['端口配置', '公众号管理', '系统设置'],
    emoji: '⚙️',
    tag: '管理',
  },
];

const SystemEntrance: React.FC = () => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '24px 28px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#262626' }}>
          🚪 系统快捷入口
        </h3>
        <span style={{ fontSize: 12, color: '#bbb' }}>点击卡片进入对应系统</span>
      </div>

      <div style={{
        display: 'flex',
        gap: 12,
      }}>
        {systems.map(sys => (
          <a
            key={sys.key}
            href={sys.path}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 12,
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #f0f0f0',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${sys.color}20`;
              e.currentTarget.style.borderColor = sys.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = '#f0f0f0';
            }}
          >
            {/* 顶部彩色条 */}
            <div style={{
              background: sys.gradient,
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', right: -5, top: -5,
                fontSize: 40, opacity: 0.1,
              }}>
                {sys.emoji}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {sys.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: '#fff',
                    textShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  }}>
                    {sys.title}
                  </div>
                  <div style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.7)',
                  }}>
                    {sys.desc}
                  </div>
                </div>
              </div>
              {sys.tag && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  padding: '2px 8px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 10,
                }}>
                  {sys.tag}
                </div>
              )}
            </div>

            {/* 底部 */}
            <div style={{
              padding: '10px 16px 12px',
              display: 'flex', flexDirection: 'column', flex: 1,
            }}>
              <div style={{
                display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8,
              }}>
                {sys.features.map((feat, i) => (
                  <span key={i} style={{
                    fontSize: 10,
                    padding: '1px 8px',
                    borderRadius: 8,
                    background: `${sys.color}10`,
                    color: sys.color,
                  }}>
                    {feat}
                  </span>
                ))}
              </div>
              <div style={{
                marginTop: 'auto',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 6, borderTop: '1px solid #f5f5f5',
              }}>
                <span style={{ fontSize: 11, color: '#ccc' }}>点击进入</span>
                <span style={{
                  width: 22, height: 22, borderRadius: 11,
                  background: `${sys.color}10`,
                  color: sys.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12,
                }}>
                  →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SystemEntrance;
