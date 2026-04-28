import React from 'react';
import { Card, Typography, Tag, Table, Row, Col } from 'antd';
import { WechatOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const WeChatMessageTemplate: React.FC = () => {
  const templateColumns = [
    { title: '模板ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '模板名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: '消息类型', dataIndex: 'type', key: 'type', width: 100,
      render: (type: string) => {
        const colorMap: Record<string, string> = { '缴费提醒': 'red', '报修通知': 'blue', '公告通知': 'orange', '活动通知': 'green', '快递通知': 'purple' };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      }
    },
    { title: '触发场景', dataIndex: 'scene', key: 'scene', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: string) => <Tag color={status === '启用' ? 'success' : 'default'}>{status}</Tag>
    },
    { title: '操作', key: 'action', width: 120,
      render: () => <a href="/wechat/templates">编辑</a>
    },
  ];

  const templateData = [
    { key: '1', id: 'TM0001', name: '物业费缴费提醒', type: '缴费提醒', scene: '每月账单生成后自动推送', status: '启用' },
    { key: '2', id: 'TM0002', name: '物业费欠费催缴', type: '缴费提醒', scene: '欠费超过15天自动推送', status: '启用' },
    { key: '3', id: 'TM0003', name: '报修进度通知', type: '报修通知', scene: '报修工单状态变更时推送', status: '启用' },
    { key: '4', id: 'TM0004', name: '报修完工提醒', type: '报修通知', scene: '维修完成时推送', status: '启用' },
    { key: '5', id: 'TM0005', name: '社区公告通知', type: '公告通知', scene: '物业发布新公告时推送', status: '启用' },
    { key: '6', id: 'TM0006', name: '活动报名通知', type: '活动通知', scene: '社区活动发布时推送', status: '启用' },
    { key: '7', id: 'TM0007', name: '快递代收提醒', type: '快递通知', scene: '快递到达物业时推送', status: '启用' },
    { key: '8', id: 'TM0008', name: '投票提醒通知', type: '公告通知', scene: '业主大会投票开始时推送', status: '启用' },
    { key: '9', id: 'TM0009', name: '门禁授权通知', type: '公告通知', scene: '访客门禁授权成功时推送', status: '停用' },
    { key: '10', id: 'TM0010', name: '装修审核结果', type: '报修通知', scene: '装修申请审核完成时推送', status: '启用' },
  ];

  // 模拟微信公众号模板消息预览
  const templatePreview = {
    title: '物业费缴费提醒',
    template: `尊敬的业主：
您好！您位于{{小区名称}} {{房号}}的物业费账单已生成。

📋 账单详情：
• 缴费周期：{{缴费周期}}
• 应缴金额：{{应缴金额}}元
• 缴费截止：{{缴费截止日期}}

💡 点击下方卡片立即缴费
{{缴费链接}}

感谢您的支持与配合！
{{物业服务中心名称}}
{{推送时间}}`,
    example: `尊敬的业主：
您好！您位于碧桂园小区 3栋2单元1501的物业费账单已生成。

📋 账单详情：
• 缴费周期：2026年4月
• 应缴金额：328.00元
• 缴费截止：2026-05-10

💡 点击下方卡片立即缴费

感谢您的支持与配合！
碧桂园物业服务中心
2026-04-27`,
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        <WechatOutlined style={{ marginRight: 8, color: '#07c160' }} />
        微信公众号消息模板管理
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Text type="secondary">已关注用户数</Text>
            <div><Text strong style={{ fontSize: 28, color: '#07c160' }}>2,856</Text> <Text type="secondary">人</Text></div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Text type="secondary">本月消息推送量</Text>
            <div><Text strong style={{ fontSize: 28, color: '#1890ff' }}>12,580</Text> <Text type="secondary">条</Text></div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Text type="secondary">消息送达率</Text>
            <div><Text strong style={{ fontSize: 28, color: '#52c41a' }}>98.6</Text> <Text type="secondary">%</Text></div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Text type="secondary">消息点击率</Text>
            <div><Text strong style={{ fontSize: 28, color: '#fa8c16' }}>32.4</Text> <Text type="secondary">%</Text></div>
          </div>
        </div>
      </Card>

      <Card title="消息模板列表" style={{ marginBottom: 24 }}>
        <Table dataSource={templateData} columns={templateColumns} pagination={false} size="small" />
      </Card>

      <Card title="模板消息预览 - 物业费缴费提醒" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Title level={5}>模板内容</Title>
            <div style={{
              background: '#f5f5f5', padding: 16, borderRadius: 8,
              whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.8,
            }}>
              {templatePreview.template}
            </div>
          </Col>
          <Col span={12}>
            <Title level={5}>模拟微信推送效果</Title>
            <div style={{
              maxWidth: 360, margin: '0 auto',
              background: '#f5f5f5', borderRadius: 12,
              overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}>
              {/* 模拟微信消息头部 */}
              <div style={{
                background: '#07c160', color: '#fff',
                padding: '12px 16px', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <WechatOutlined style={{ fontSize: 20 }} />
                智慧社区服务
              </div>
              {/* 消息内容 */}
              <div style={{ padding: 16, background: '#fff' }}>
                <div style={{
                  fontSize: 16, fontWeight: 600, color: '#333',
                  marginBottom: 12, textAlign: 'center',
                }}>
                  {templatePreview.title}
                </div>
                <div style={{
                  fontSize: 13, color: '#555', lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}>
                  {templatePreview.example}
                </div>
                {/* 模拟点击卡片 */}
                <div style={{
                  marginTop: 16, padding: '12px 16px',
                  background: '#07c160', color: '#fff',
                  borderRadius: 8, textAlign: 'center',
                  fontSize: 15, fontWeight: 500, cursor: 'pointer',
                }}>
                  查看详情并缴费
                </div>
              </div>
              {/* 模拟消息底部 */}
              <div style={{
                padding: '8px 16px', background: '#fafafa',
                fontSize: 11, color: '#999', textAlign: 'center',
              }}>
                智慧社区 · 物业服务中心
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="消息推送场景配置">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { icon: '💳', title: '缴费提醒', desc: '账单生成、欠费催缴时自动推送模板消息', color: '#ff4d4f' },
            { icon: '🔧', title: '报修通知', desc: '报修进度变更、完工时推送通知', color: '#1890ff' },
            { icon: '📢', title: '公告通知', desc: '社区公告、政策通知发布时推送', color: '#fa8c16' },
            { icon: '🎪', title: '活动通知', desc: '社区活动发布、报名成功时推送', color: '#52c41a' },
            { icon: '📦', title: '快递通知', desc: '快递到达、领取提醒时推送', color: '#722ed1' },
            { icon: '🗳️', title: '投票通知', desc: '业主大会投票开始、结果公示时推送', color: '#13c2c2' },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                flex: '1 1 200px', padding: 16,
                background: '#fafafa', borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WeChatMessageTemplate;
