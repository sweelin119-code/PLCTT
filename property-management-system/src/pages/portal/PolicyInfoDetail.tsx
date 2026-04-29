import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Spin, Typography, Tag, Divider, Button, Space, message,
} from 'antd';
import { ArrowLeftOutlined, EyeOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { PolicyInfo } from '../../services/portalTypes';
import { getPolicyInfoById } from '../../services/portalService';

const { Title, Text } = Typography;

const PolicyInfoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PolicyInfo | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getPolicyInfoById(Number(id)).then(item => {
        if (item) {
          setData(item);
          document.title = item.title;
        } else {
          message.error('内容不存在');
          navigate('/');
        }
      }).finally(() => setLoading(false));
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '40px 24px',
      minHeight: '100vh',
      background: '#f5f7fa',
    }}>
      {/* 返回按钮 */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16, color: '#666' }}
      >
        返回
      </Button>

      {/* 文章卡片 */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '40px 48px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        {/* 分类和置顶标签 */}
        <Space style={{ marginBottom: 16 }}>
          <Tag color="blue">{data.categoryName}</Tag>
          {data.isTop && <Tag color="red">置顶</Tag>}
          <Tag>{data.status === 'published' ? '已发布' : data.status === 'draft' ? '草稿' : '已归档'}</Tag>
        </Space>

        {/* 标题 */}
        <Title level={2} style={{ marginBottom: 16, fontWeight: 700 }}>
          {data.title}
        </Title>

        {/* 元信息 */}
        <Space style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>
          <span><UserOutlined /> {data.createBy}</span>
          <span><ClockCircleOutlined /> {data.publishTime || data.createTime}</span>
          <span><EyeOutlined /> {data.viewCount} 次阅读</span>
        </Space>

        {/* 标签 */}
        {data.tags && data.tags.length > 0 && (
          <Space style={{ marginBottom: 24 }}>
            {data.tags.map(tag => (
              <Tag key={tag} style={{ borderRadius: 10 }}>{tag}</Tag>
            ))}
          </Space>
        )}

        <Divider />

        {/* 摘要 */}
        <div style={{
          background: '#f5f7fa',
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 32,
          borderLeft: '4px solid #1890ff',
        }}>
          <Text type="secondary" style={{ fontSize: 15, lineHeight: 1.8 }}>
            {data.summary}
          </Text>
        </div>

        {/* 正文内容 - 富文本渲染 */}
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />

        {/* 附件 */}
        {data.attachments && data.attachments.length > 0 && (
          <>
            <Divider />
            <div style={{ marginTop: 24 }}>
              <Text strong>附件：</Text>
              {data.attachments.map((att, i) => (
                <div key={i} style={{ marginTop: 8 }}>
                  <Button type="link" icon={<ArrowLeftOutlined style={{ transform: 'rotate(90deg)' }} />}>
                    {att}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 富文本内容全局样式 */}
      <style>{`
        .rich-content {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
        }
        .rich-content h1 {
          font-size: 26px;
          margin-top: 36px;
          margin-bottom: 18px;
          font-weight: 700;
          color: #1a1a1a;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }
        .rich-content h2 {
          font-size: 22px;
          margin-top: 32px;
          margin-bottom: 16px;
          font-weight: 700;
          color: #262626;
        }
        .rich-content h3 {
          font-size: 18px;
          margin-top: 24px;
          margin-bottom: 12px;
          font-weight: 600;
          color: #333;
        }
        .rich-content p {
          margin-bottom: 16px;
          text-indent: 2em;
        }
        .rich-content ul, .rich-content ol {
          padding-left: 2em;
          margin-bottom: 16px;
        }
        .rich-content li {
          margin-bottom: 8px;
          line-height: 1.8;
        }
        .rich-content blockquote {
          margin: 16px 0;
          padding: 12px 20px;
          background: #f5f7fa;
          border-left: 4px solid #1890ff;
          border-radius: 4px;
          color: #666;
          font-style: italic;
        }
        .rich-content pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 16px 20px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.6;
          margin: 16px 0;
        }
        .rich-content code {
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 14px;
          color: #d63384;
        }
        .rich-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .rich-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        .rich-content a {
          color: #1890ff;
          text-decoration: underline;
        }
        .rich-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .rich-content th, .rich-content td {
          border: 1px solid #e8e8e8;
          padding: 10px 14px;
          text-align: left;
        }
        .rich-content th {
          background: #fafafa;
          font-weight: 600;
        }
        .rich-content .ql-align-center { text-align: center; }
        .rich-content .ql-align-right { text-align: right; }
        .rich-content .ql-align-justify { text-align: justify; }
      `}</style>
    </div>
  );
};

export default PolicyInfoDetail;
