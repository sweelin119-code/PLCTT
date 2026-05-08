import React, { useState, useEffect, useCallback } from 'react';
import { Spin, Modal, Empty } from 'antd';
import { getOwnerNotifications, markOwnerNotificationRead } from '../../services/dailyService';

/**
 * 类型图标/颜色配置
 */
const typeConfig: Record<string, { color: string; bg: string; icon: string }> = {
  notice: { color: '#FF9500', bg: '#FFF5EB', icon: '📢' },
  payment: { color: '#FF3B30', bg: '#FFF0EF', icon: '💳' },
  repair: { color: '#007AFF', bg: '#EBF5FF', icon: '🔧' },
  activity: { color: '#34C759', bg: '#EBFFEB', icon: '🎪' },
  express: { color: '#AF52DE', bg: '#F5EBFF', icon: '📦' },
  vote: { color: '#5AC8FA', bg: '#EBF8FF', icon: '🗳️' },
};

/** 公告类型 -> 消费端展示类型的映射 */
const typeMap: Record<string, string> = {
  notice: 'notice',
  payment: 'payment',
  repair: 'repair',
  activity: 'activity',
  express: 'express',
  vote: 'vote',
};

/** 标签配置：显示名 -> 筛选类型 */
const tags = [
  { label: '全部', type: '' },
  { label: '缴费', type: 'payment' },
  { label: '报修', type: 'repair' },
  { label: '公告', type: 'notice' },
  { label: '活动', type: 'activity' },
  { label: '快递', type: 'express' },
];

interface NoticeItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
  /** 展示用类型 key（对应 typeConfig） */
  type: string;
  unread: boolean;
  content: string;
  /** 原始发布时间 */
  publishTime: string;
}

interface NoticeGroup {
  date: string;
  items: NoticeItem[];
}

/**
 * 格式化发布时间 -> "YYYY-MM-DD HH:mm"
 */
function formatPublishTime(pubTime: string): { date: string; time: string } {
  if (!pubTime) return { date: '近期', time: '' };
  try {
    const d = new Date(pubTime);
    if (isNaN(d.getTime())) return { date: '近期', time: '' };
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return { date: `${y}-${m}-${day}`, time: `${h}:${min}` };
  } catch {
    return { date: '近期', time: '' };
  }
}

const OwnerNotice: React.FC = () => {
  const [activeTag, setActiveTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<NoticeItem[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<NoticeItem | null>(null);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const list: any[] = await getOwnerNotifications();
      const items: NoticeItem[] = list.map((ann: any) => {
        const rawType = ann.type || 'notice';
        const cfgKey = typeMap[rawType] || 'notice';
        const cfg = typeConfig[cfgKey];
        const { date, time } = formatPublishTime(ann.publishTime || ann.createTime || '');
        const content = ann.content || '';
        return {
          id: String(ann.id),
          icon: cfg.icon,
          title: ann.title || '',
          desc: content.length > 60 ? content.substring(0, 60) + '…' : content,
          time: `${date} ${time}`,
          type: cfgKey,
          unread: !ann.isRead,
          content,
          publishTime: ann.publishTime || ann.createTime || '',
        };
      });
      setAllItems(items);
    } catch (e) {
      console.error('加载通知失败', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  /** 将扁平列表按日期分组 */
  const buildGroupedList = (items: NoticeItem[]): NoticeGroup[] => {
    const groups: Record<string, NoticeItem[]> = {};
    items.forEach(item => {
      const { date } = formatPublishTime(item.publishTime);
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, list]) => ({ date, items: list }));
  };

  /** 点击消息卡片 */
  const handleItemClick = async (item: NoticeItem) => {
    setDetailItem(item);
    setDetailVisible(true);
    if (item.unread) {
      try {
        await markOwnerNotificationRead(item.id);
        setAllItems(prev => prev.map(n => (n.id === item.id ? { ...n, unread: false } : n)));
      } catch {
        // 静默失败
      }
    }
  };

  /** 筛选后的列表 */
  const filteredItems = activeTag
    ? allItems.filter(item => item.type === activeTag)
    : allItems;
  const filteredList = buildGroupedList(filteredItems);

  return (
    <div style={{ padding: '12px 12px 0' }}>
      {/* ===== Apple 风格分类标签 ===== */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          overflow: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        {tags.map(tag => (
          <span
            key={tag.label}
            onClick={() => setActiveTag(tag.type)}
            style={{
              padding: '6px 16px',
              borderRadius: 18,
              fontSize: 13,
              fontWeight: activeTag === tag.type ? 600 : 400,
              background: activeTag === tag.type ? '#007AFF' : '#f2f2f7',
              color: activeTag === tag.type ? '#fff' : '#1d1d1f',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: 0.2,
            }}
          >
            {tag.label}
          </span>
        ))}
      </div>

      {/* ===== 加载中 ===== */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin />
        </div>
      ) : filteredList.length === 0 ? (
        <Empty description="暂无通知" style={{ paddingTop: 60 }} />
      ) : (
        /* ===== Apple 风格消息列表 ===== */
        filteredList.map((group, groupIndex) => (
          <div key={groupIndex} style={{ marginBottom: 20 }}>
            {/* 日期标题 */}
            <div
              style={{
                fontSize: 13,
                color: '#8e8e93',
                marginBottom: 10,
                padding: '0 4px',
                fontWeight: 500,
              }}
            >
              {group.date}
            </div>

            {/* 消息卡片 */}
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                border: '1px solid #f2f2f7',
              }}
            >
              {group.items.map((msg, msgIndex) => {
                const config = typeConfig[msg.type] || { color: '#8e8e93', bg: '#f2f2f7', icon: '📄' };
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleItemClick(msg)}
                    style={{
                      display: 'flex',
                      padding: '14px 16px',
                      borderBottom:
                        msgIndex < group.items.length - 1 ? '1px solid #f2f2f7' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#fafafa';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#fff';
                    }}
                  >
                    {/* 图标 */}
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 11,
                        background: config.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        marginRight: 12,
                        flexShrink: 0,
                      }}
                    >
                      {msg.icon}
                    </div>

                    {/* 内容 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: msg.unread ? 600 : 500,
                            color: '#1d1d1f',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {msg.title}
                          {msg.unread && (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: 4,
                                background: '#FF3B30',
                                display: 'inline-block',
                              }}
                            />
                          )}
                        </span>
                        <span style={{ fontSize: 12, color: '#8e8e93' }}>{msg.time}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#8e8e93',
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {msg.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div style={{ height: 16 }} />

      {/* ===== 通知详情弹窗 ===== */}
      <Modal
        title={detailItem?.title}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={400}
        destroyOnClose
      >
        {detailItem && (
          <>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
              发布时间：{detailItem.time}
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: '#1d1d1f',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {detailItem.content}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default OwnerNotice;
