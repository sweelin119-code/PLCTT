import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, RightOutlined } from '@ant-design/icons';

const OwnerServices: React.FC = () => {
  const navigate = useNavigate();

  const serviceCategories = [
    {
      title: '🏠 物业服务',
      items: [
        { icon: '🔧', label: '在线报修', path: '/owner/repair', desc: '水、电、门窗等维修' },
        { icon: '💳', label: '物业缴费', path: '/owner/payment', desc: '物业费、水电费缴纳' },
        { icon: '🚗', label: '停车服务', path: '/owner/parking', desc: '车位查询、租赁' },
        { icon: '🔑', label: '门禁管理', path: '/owner/access', desc: '手机开门、访客授权' },
        { icon: '📦', label: '快递服务', path: '/owner/express', desc: '快递代收查询' },
        { icon: '📋', label: '装修申请', path: '/owner/decoration', desc: '装修备案申请' },
      ]
    },
    {
      title: '🛍️ 生活服务',
      items: [
        { icon: '🧹', label: '家政保洁', path: '/owner/services/housekeeping', desc: '日常保洁、深度清洁' },
        { icon: '🔌', label: '家电维修', path: '/owner/services/appliance', desc: '空调、冰箱等维修' },
        { icon: '🛒', label: '社区团购', path: '/owner/services/groupbuy', desc: '生鲜、日用品团购' },
        { icon: '🚚', label: '搬家服务', path: '/owner/services/moving', desc: '搬家公司预约' },
        { icon: '🌿', label: '绿化服务', path: '/owner/services/greening', desc: '绿植养护、修剪' },
        { icon: '👶', label: '家政月嫂', path: '/owner/services/nanny', desc: '月嫂、育儿嫂' },
      ]
    },
    {
      title: '💬 社区互动',
      items: [
        { icon: '📢', label: '社区公告', path: '/owner/notice', desc: '查看最新通知' },
        { icon: '🗳️', label: '投票表决', path: '/owner/vote', desc: '业主大会投票' },
        { icon: '💡', label: '投诉建议', path: '/owner/complaint', desc: '意见反馈' },
        { icon: '🤝', label: '邻里互助', path: '/owner/community', desc: '邻里交流平台' },
        { icon: '🎪', label: '社区活动', path: '/owner/activities', desc: '活动报名参与' },
        { icon: '🏪', label: '周边商家', path: '/owner/shops', desc: '社区商家服务' },
      ]
    },
  ];

  return (
    <div style={{ padding: '12px 12px 0' }}>
      {/* 搜索框 */}
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <SearchOutlined style={{ color: '#999', fontSize: 16 }} />
        <input
          placeholder="搜索服务..."
          style={{
            border: 'none', outline: 'none', flex: 1,
            fontSize: 14, color: '#333',
            background: 'transparent',
          }}
        />
      </div>

      {/* 服务分类 */}
      {serviceCategories.map((category, catIndex) => (
        <div key={catIndex} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 16, fontWeight: 600, marginBottom: 12,
            padding: '0 4px',
          }}>
            {category.title}
          </div>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {category.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: itemIndex < category.items.length - 1 ? '1px solid #f5f5f5' : 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 24, marginRight: 12 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#333' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{item.desc}</div>
                </div>
                <RightOutlined style={{ color: '#ccc', fontSize: 14 }} />
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
