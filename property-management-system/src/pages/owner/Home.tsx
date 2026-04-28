import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ToolOutlined, 
  DollarOutlined, 
  CarOutlined, 
  KeyOutlined,
  BellOutlined,
  RightOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const OwnerHome: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: <ToolOutlined />, label: '报修', color: '#ff6b6b', path: '/owner/repair' },
    { icon: <DollarOutlined />, label: '缴费', color: '#07c160', path: '/owner/payment' },
    { icon: <CarOutlined />, label: '停车', color: '#1890ff', path: '/owner/parking' },
    { icon: <KeyOutlined />, label: '门禁', color: '#722ed1', path: '/owner/access' },
    { icon: <BellOutlined />, label: '投诉', color: '#fa8c16', path: '/owner/complaint' },
    { icon: <EnvironmentOutlined />, label: '快递', color: '#13c2c2', path: '/owner/express' },
  ];

  const notices = [
    { title: '关于2026年五一假期物业服务中心值班安排的通知', time: '2026-04-27', type: '公告' },
    { title: '小区二次供水水箱清洗通知', time: '2026-04-26', type: '通知' },
    { title: '社区邻里节活动报名开始啦！', time: '2026-04-25', type: '活动' },
  ];

  const services = [
    { name: '家政保洁', price: '¥50/小时', sales: 128, image: '🧹' },
    { name: '家电维修', price: '¥80起', sales: 86, image: '🔧' },
    { name: '社区团购', price: '¥29.9起', sales: 256, image: '🛒' },
  ];

  return (
    <div>
      {/* 用户信息卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, #07c160 0%, #06ad56 100%)',
        padding: '16px 16px 24px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 24,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>👤</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>张先生</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>碧桂园小区 · 3栋2单元1501</div>
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 8,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>本月物业费</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>¥328.00</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>缴费状态</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>待缴纳</div>
          </div>
        </div>
      </div>

      {/* 快捷功能入口 */}
      <div style={{
        background: '#fff',
        margin: '-12px 12px 0',
        borderRadius: 12,
        padding: '16px 8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 8,
        }}>
          {quickActions.map(action => (
            <div
              key={action.label}
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${action.color}15`,
                color: action.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {action.icon}
              </div>
              <span style={{ fontSize: 12, color: '#333' }}>{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 公告通知 */}
      <div style={{ margin: '16px 12px 0' }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>📢 社区公告</span>
            <span
              onClick={() => navigate('/owner/notice')}
              style={{ fontSize: 13, color: '#999', cursor: 'pointer' }}
            >
              更多 <RightOutlined style={{ fontSize: 12 }} />
            </span>
          </div>
          {notices.map((notice, index) => (
            <div
              key={index}
              style={{
                padding: '10px 0',
                borderBottom: index < notices.length - 1 ? '1px solid #f0f0f0' : 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 11, padding: '1px 6px', borderRadius: 3,
                  background: notice.type === '公告' ? '#e6f7ff' : notice.type === '通知' ? '#fff7e6' : '#f6ffed',
                  color: notice.type === '公告' ? '#1890ff' : notice.type === '通知' ? '#fa8c16' : '#52c41a',
                }}>
                  {notice.type}
                </span>
                <span style={{ fontSize: 14, color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {notice.title}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>{notice.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 热门服务推荐 */}
      <div style={{ margin: '16px 12px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12, padding: '0 4px',
        }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>🔥 热门服务</span>
          <span
            onClick={() => navigate('/owner/services')}
            style={{ fontSize: 13, color: '#999', cursor: 'pointer' }}
          >
            全部 <RightOutlined style={{ fontSize: 12 }} />
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 4 }}>
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 16,
                minWidth: 140,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{service.image}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{service.name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ff4d4f' }}>{service.price}</div>
              <div style={{ fontSize: 12, color: '#999' }}>已售 {service.sales}</div>
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
