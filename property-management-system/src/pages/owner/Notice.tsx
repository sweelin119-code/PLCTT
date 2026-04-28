import React from 'react';

const OwnerNotice: React.FC = () => {

  const messageList = [
    {
      date: '2026-04-27',
      items: [
        { icon: '💳', title: '物业费缴费提醒', desc: '您3栋2单元1501的4月物业费¥328.00即将到期，请及时缴纳。', time: '10:30', type: 'payment', unread: true },
        { icon: '🔧', title: '报修进度更新', desc: '您提交的厨房水龙头维修工单，维修师傅已接单，预计30分钟后到达。', time: '09:15', type: 'repair', unread: true },
      ]
    },
    {
      date: '2026-04-26',
      items: [
        { icon: '📢', title: '社区公告', desc: '关于2026年五一假期物业服务中心值班安排的通知', time: '16:00', type: 'notice', unread: false },
        { icon: '🎪', title: '活动通知', desc: '社区邻里节活动报名已开启，点击查看详情。', time: '14:20', type: 'activity', unread: false },
        { icon: '📦', title: '快递代收通知', desc: '您有一个快递已送达物业服务中心，请及时领取。', time: '11:00', type: 'express', unread: true },
      ]
    },
    {
      date: '2026-04-25',
      items: [
        { icon: '🗳️', title: '投票提醒', desc: '小区关于"增设电动车充电桩"的投票正在进行中，请积极参与。', time: '09:00', type: 'vote', unread: false },
      ]
    },
  ];

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      payment: '#ff4d4f',
      repair: '#1890ff',
      notice: '#fa8c16',
      activity: '#52c41a',
      express: '#722ed1',
      vote: '#13c2c2',
    };
    return colorMap[type] || '#999';
  };

  return (
    <div style={{ padding: '12px 12px 0' }}>
      {/* 消息分类标签 */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 16,
        overflow: 'auto', paddingBottom: 4,
      }}>
        {['全部', '缴费', '报修', '公告', '活动', '快递'].map(tag => (
          <span
            key={tag}
            style={{
              padding: '4px 14px',
              borderRadius: 16,
              fontSize: 13,
              background: tag === '全部' ? '#07c160' : '#f0f0f0',
              color: tag === '全部' ? '#fff' : '#666',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 消息列表 */}
      {messageList.map((group, groupIndex) => (
        <div key={groupIndex} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 13, color: '#999', marginBottom: 8,
            padding: '0 4px',
          }}>
            {group.date}
          </div>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {group.items.map((msg, msgIndex) => (
              <div
                key={msgIndex}
                style={{
                  display: 'flex',
                  padding: '14px 16px',
                  borderBottom: msgIndex < group.items.length - 1 ? '1px solid #f5f5f5' : 'none',
                  cursor: 'pointer',
                  background: msg.unread ? '#f0fff4' : '#fff',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${getTypeColor(msg.type)}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginRight: 12, flexShrink: 0,
                }}>
                  {msg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 4,
                  }}>
                    <span style={{
                      fontSize: 14, fontWeight: msg.unread ? 600 : 400,
                      color: '#333',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {msg.title}
                      {msg.unread && <span style={{
                        width: 6, height: 6, borderRadius: 3,
                        background: '#ff4d4f', display: 'inline-block',
                      }} />}
                    </span>
                    <span style={{ fontSize: 12, color: '#ccc' }}>{msg.time}</span>
                  </div>
                  <div style={{
                    fontSize: 13, color: '#666',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {msg.desc}
                  </div>
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

export default OwnerNotice;
