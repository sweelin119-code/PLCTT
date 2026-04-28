import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';

const OwnerMine: React.FC = () => {
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: '我的服务',
      items: [
        { icon: '📋', label: '我的报修', path: '/owner/mine/repairs' },
        { icon: '💳', label: '缴费记录', path: '/owner/mine/payments' },
        { icon: '📦', label: '我的快递', path: '/owner/mine/expresses' },
        { icon: '🎫', label: '我的优惠券', path: '/owner/mine/coupons' },
        { icon: '🏠', label: '我的房屋', path: '/owner/mine/houses' },
      ]
    },
    {
      title: '社区服务',
      items: [
        { icon: '🗳️', label: '我的投票', path: '/owner/mine/votes' },
        { icon: '💡', label: '我的投诉', path: '/owner/mine/complaints' },
        { icon: '🎪', label: '我的活动', path: '/owner/mine/activities' },
      ]
    },
    {
      title: '设置',
      items: [
        { icon: '👤', label: '个人信息', path: '/owner/mine/profile' },
        { icon: '🔔', label: '消息设置', path: '/owner/mine/notify-settings' },
        { icon: '🔒', label: '账号安全', path: '/owner/mine/security' },
        { icon: '📖', label: '使用帮助', path: '/owner/mine/help' },
        { icon: 'ℹ️', label: '关于我们', path: '/owner/mine/about' },
      ]
    },
  ];

  return (
    <div>
      {/* 用户信息头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #07c160 0%, #06ad56 100%)',
        padding: '20px 16px 30px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 32,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, border: '2px solid rgba(255,255,255,0.3)',
          }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>张先生</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              业主 · 碧桂园小区3栋2单元1501
            </div>
            <div style={{
              marginTop: 8, display: 'flex', gap: 16,
              fontSize: 13, opacity: 0.9,
            }}>
              <span>🏠 绑定房屋: 1套</span>
              <span>👨‍👩‍👧‍👦 家庭成员: 3人</span>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷数据 */}
      <div style={{
        background: '#fff',
        margin: '-16px 12px 0',
        borderRadius: 12,
        padding: '16px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
      }}>
        {[
          { value: '3', label: '待处理报修', color: '#ff6b6b' },
          { value: '¥328', label: '待缴费用', color: '#fa8c16' },
          { value: '2', label: '未读消息', color: '#1890ff' },
          { value: '128', label: '积分', color: '#722ed1' },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              flex: 1, textAlign: 'center',
              borderRight: index < 3 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* 菜单列表 */}
      <div style={{ padding: '16px 12px 0' }}>
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 14, color: '#999', marginBottom: 8,
              padding: '0 4px',
            }}>
              {group.title}
            </div>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '14px 16px',
                    borderBottom: itemIndex < group.items.length - 1 ? '1px solid #f5f5f5' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 15, color: '#333' }}>{item.label}</span>
                  <RightOutlined style={{ color: '#ccc', fontSize: 14 }} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 退出登录按钮 */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '14px 0',
            textAlign: 'center',
            fontSize: 15,
            color: '#ff4d4f',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            marginBottom: 16,
          }}
        >
          退出登录
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
};

export default OwnerMine;
