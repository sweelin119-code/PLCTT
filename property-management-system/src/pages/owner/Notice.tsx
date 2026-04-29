import React, { useState } from 'react';

const messageList = [
  {
    date: '2026-04-27',
    items: [
      { icon: '💳', title: '物业费缴费提醒', desc: '您3栋2单元1501的4月物业费¥328.00即将到期，请及时缴纳。', time: '10:30', type: 'payment', unread: true },
      { icon: '🔧', title: '报修进度更新', desc: '您提交的厨房水龙头维修工单，维修师傅已接单，预计30分钟后到达。', time: '09:15', type: 'repair', unread: true },
    ],
  },
  {
    date: '2026-04-26',
    items: [
      { icon: '📢', title: '社区公告', desc: '关于2026年五一假期物业服务中心值班安排的通知', time: '16:00', type: 'notice', unread: false },
      { icon: '🎪', title: '活动通知', desc: '社区邻里节活动报名已开启，点击查看详情。', time: '14:20', type: 'activity', unread: false },
      { icon: '📦', title: '快递代收通知', desc: '您有一个快递已送达物业服务中心，请及时领取。', time: '11:00', type: 'express', unread: true },
    ],
  },
  {
    date: '2026-04-25',
    items: [
      { icon: '🗳️', title: '投票提醒', desc: '小区关于"增设电动车充电桩"的投票正在进行中，请积极参与。', time: '09:00', type: 'vote', unread: false },
    ],
  },
];

const typeConfig: Record<string, { color: string; bg: string }> = {
  payment: { color: '#FF3B30', bg: '#FFF0EF' },
  repair: { color: '#007AFF', bg: '#EBF5FF' },
  notice: { color: '#FF9500', bg: '#FFF5EB' },
  activity: { color: '#34C759', bg: '#EBFFEB' },
  express: { color: '#AF52DE', bg: '#F5EBFF' },
  vote: { color: '#5AC8FA', bg: '#EBF8FF' },
};

const OwnerNotice: React.FC = () => {
  const [activeTag, setActiveTag] = useState('全部');

  const tags = ['全部', '缴费', '报修', '公告', '活动', '快递'];

  const filteredList = activeTag === '全部'
    ? messageList
    : messageList.map(group => ({
        ...group,
        items: group.items.filter(msg => {
          const tagMap: Record<string, string> = {
            '缴费': 'payment', '报修': 'repair', '公告': 'notice',
            '活动': 'activity', '快递': 'express',
          };
          return msg.type === tagMap[activeTag];
        }),
      })).filter(group => group.items.length > 0);

  return (
    <div style={{ padding: '12px 12px 0' }}>
      {/* ===== Apple 风格分类标签 ===== */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 16,
        overflow: 'auto', paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {tags.map(tag => (
          <span
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: '6px 16px',
              borderRadius: 18,
              fontSize: 13,
              fontWeight: activeTag === tag ? 600 : 400,
              background: activeTag === tag ? '#007AFF' : '#f2f2f7',
              color: activeTag === tag ? '#fff' : '#1d1d1f',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: 0.2,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ===== Apple 风格消息列表 ===== */}
      {filteredList.map((group, groupIndex) => (
        <div key={groupIndex} style={{ marginBottom: 20 }}>
          {/* 日期标题 */}
          <div style={{
            fontSize: 13, color: '#8e8e93', marginBottom: 10,
            padding: '0 4px', fontWeight: 500,
          }}>
            {group.date}
          </div>

          {/* 消息卡片 */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            border: '1px solid #f2f2f7',
          }}>
            {group.items.map((msg, msgIndex) => {
              const config = typeConfig[msg.type] || { color: '#8e8e93', bg: '#f2f2f7' };
              return (
                <div
                  key={msgIndex}
                  style={{
                    display: 'flex',
                    padding: '14px 16px',
                    borderBottom: msgIndex < group.items.length - 1 ? '1px solid #f2f2f7' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                >
                  {/* 图标 */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: config.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginRight: 12, flexShrink: 0,
                  }}>
                    {msg.icon}
                  </div>

                  {/* 内容 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 4,
                    }}>
                      <span style={{
                        fontSize: 14, fontWeight: msg.unread ? 600 : 500,
                        color: '#1d1d1f',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        {msg.title}
                        {msg.unread && (
                          <span style={{
                            width: 7, height: 7, borderRadius: 4,
                            background: '#FF3B30', display: 'inline-block',
                          }} />
                        )}
                      </span>
                      <span style={{ fontSize: 12, color: '#8e8e93' }}>
                        {msg.time}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 13, color: '#8e8e93',
                      lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {msg.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ height: 16 }} />
    </div>
  );
};

export default OwnerNotice;
