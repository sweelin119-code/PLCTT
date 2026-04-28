import React, { useState } from 'react';
import { Row, Col, Card, Table, Tag, Typography, Button, Space, Input, Select, DatePicker, Tabs, List, Statistic, Progress, Badge, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, CheckCircleOutlined, TeamOutlined, UserOutlined, CalendarOutlined, MessageOutlined, NotificationOutlined, AppstoreOutlined, HeartOutlined, GiftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CommunityOffice: React.FC = () => {
  const [activeTab, setActiveTab] = useState('service');

  // ========== 基层服务数据 ==========
  const serviceData = [
    { key: '1', resident: '张建国', type: '老年证办理', date: '2026-04-22', handler: '李社工', status: '已办结', desc: '协助办理老年优待证' },
    { key: '2', resident: '王秀英', type: '低保申请', date: '2026-04-21', handler: '王社工', status: '办理中', desc: '低保申请材料审核中' },
    { key: '3', resident: '李明', type: '居住证明', date: '2026-04-20', handler: '李社工', status: '已办结', desc: '开具居住证明用于子女入学' },
    { key: '4', resident: '赵丽华', type: '残疾人补贴', date: '2026-04-19', handler: '张社工', status: '办理中', desc: '残疾人生活补贴申请' },
    { key: '5', resident: '刘伟', type: '政策咨询', date: '2026-04-18', handler: '王社工', status: '已办结', desc: '咨询老旧小区改造政策' },
    { key: '6', resident: '陈芳', type: '高龄津贴', date: '2026-04-17', handler: '李社工', status: '已办结', desc: '80岁以上高龄津贴申请' },
  ];

  // ========== 社区活动数据 ==========
  const activityData = [
    { key: '1', title: '五一社区文化节', date: '2026-05-01', location: '社区文化广场', organizer: '社区居委会', status: '报名中', type: '文化活动', participants: 86, quota: 200, desc: '文艺表演、趣味运动会、美食分享' },
    { key: '2', title: '健康义诊进社区', date: '2026-04-28', location: '社区卫生服务站', organizer: '社区居委会、市人民医院', status: '即将开始', type: '健康活动', participants: 0, quota: 100, desc: '免费量血压、测血糖、中医问诊' },
    { key: '3', title: '春季植树活动', date: '2026-04-15', location: '社区绿化带', organizer: '社区居委会、物业公司', status: '已结束', type: '环保活动', participants: 156, quota: 150, desc: '种植树木50棵，绿化美化社区环境' },
    { key: '4', title: '老年人智能手机培训', date: '2026-04-12', location: '社区活动中心', organizer: '社区居委会、志愿者团队', status: '已结束', type: '培训活动', participants: 45, quota: 50, desc: '教老年人使用智能手机、微信聊天、预约挂号' },
    { key: '5', title: '社区乒乓球友谊赛', date: '2026-04-08', location: '社区健身中心', organizer: '社区体育协会', status: '已结束', type: '文体活动', participants: 32, quota: 40, desc: '男子单打、女子单打、混合双打' },
  ];

  // ========== 信息发布数据 ==========
  const noticeData = [
    { key: '1', title: '关于五一劳动节放假安排的通知', date: '2026-04-26', type: '社区公告', status: '已发布', views: 568, channel: '公众号+公告栏' },
    { key: '2', title: '2026年度高龄津贴资格认证通知', date: '2026-04-24', type: '政策通知', status: '已发布', views: 326, channel: '公众号+短信' },
    { key: '3', title: '社区垃圾分类积分兑换活动通知', date: '2026-04-22', type: '社区公告', status: '已发布', views: 423, channel: '公众号+公告栏+业主群' },
    { key: '4', title: '关于小区停车位改造的征求意见', date: '2026-04-20', type: '征求意见', status: '已发布', views: 289, channel: '公众号+业主群' },
    { key: '5', title: '夏季用电安全温馨提示', date: '2026-04-28', type: '安全提示', status: '待发布', views: 0, channel: '公众号+短信+公告栏' },
  ];

  // ========== 网格化管理数据 ==========
  const gridData = [
    { key: '1', grid: '第一网格', gridManager: '张社工', area: '1-3栋', households: 286, residents: 856, issues: 3, resolved: 2, status: '正常' },
    { key: '2', grid: '第二网格', gridManager: '王社工', area: '4-6栋', households: 312, residents: 935, issues: 5, resolved: 4, status: '正常' },
    { key: '3', grid: '第三网格', gridManager: '李社工', area: '7-9栋', households: 268, residents: 802, issues: 2, resolved: 2, status: '正常' },
    { key: '4', grid: '第四网格', gridManager: '赵社工', area: '10-12栋', households: 298, residents: 892, issues: 6, resolved: 3, status: '关注' },
  ];

  const serviceColumns = [
    { title: '居民姓名', dataIndex: 'resident', key: 'resident', width: 100 },
    { title: '服务类型', dataIndex: 'type', key: 'type', width: 110,
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    { title: '申请日期', dataIndex: 'date', key: 'date', width: 100 },
    { title: '办理人', dataIndex: 'handler', key: 'handler', width: 80 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: string) => <Tag color={status === '已办结' ? 'success' : 'processing'}>{status}</Tag>
    },
    { title: '描述', dataIndex: 'desc', key: 'desc', width: 250 },
    { title: '操作', key: 'action', width: 80,
      render: () => <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
    },
  ];

  const activityColumns = [
    { title: '活动名称', dataIndex: 'title', key: 'title', width: 200 },
    { title: '活动类型', dataIndex: 'type', key: 'type', width: 100,
      render: (type: string) => {
        const colorMap: Record<string, string> = { '文化活动': 'magenta', '健康活动': 'green', '环保活动': 'cyan', '培训活动': 'purple', '文体活动': 'orange' };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    { title: '活动日期', dataIndex: 'date', key: 'date', width: 100 },
    { title: '地点', dataIndex: 'location', key: 'location', width: 150 },
    { title: '报名/名额', key: 'quota', width: 100,
      render: (_: any, record: any) => `${record.participants}/${record.quota}人`
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '报名中': 'processing', '即将开始': 'blue', '已结束': 'default' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    { title: '操作', key: 'action', width: 80,
      render: () => <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
    },
  ];

  const noticeColumns = [
    { title: '标题', dataIndex: 'title', key: 'title', width: 300 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (type: string) => {
        const colorMap: Record<string, string> = { '社区公告': 'blue', '政策通知': 'red', '征求意见': 'orange', '安全提示': 'green' };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    { title: '发布日期', dataIndex: 'date', key: 'date', width: 100 },
    { title: '浏览量', dataIndex: 'views', key: 'views', width: 70 },
    { title: '推送渠道', dataIndex: 'channel', key: 'channel', width: 160 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: string) => <Tag color={status === '已发布' ? 'success' : 'default'}>{status}</Tag>
    },
    { title: '操作', key: 'action', width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          {record.status === '待发布' && <Button type="link" size="small" icon={<CheckCircleOutlined />}>发布</Button>}
        </Space>
      )
    },
  ];

  const gridColumns = [
    { title: '网格名称', dataIndex: 'grid', key: 'grid', width: 100 },
    { title: '网格员', dataIndex: 'gridManager', key: 'gridManager', width: 80 },
    { title: '管辖区域', dataIndex: 'area', key: 'area', width: 100 },
    { title: '户数', dataIndex: 'households', key: 'households', width: 70 },
    { title: '居民数', dataIndex: 'residents', key: 'residents', width: 70 },
    { title: '待处理事件', dataIndex: 'issues', key: 'issues', width: 100,
      render: (issues: number) => issues > 0 ? <Badge count={issues} size="small" style={{ backgroundColor: '#ff4d4f' }} /> : 0
    },
    { title: '已处理', dataIndex: 'resolved', key: 'resolved', width: 70 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 70,
      render: (status: string) => <Tag color={status === '正常' ? 'success' : 'warning'}>{status}</Tag>
    },
    { title: '操作', key: 'action', width: 80,
      render: () => <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        社区管理部门（居委会/社区工作站）
      </Title>

      {/* 数据概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="服务居民数" value={3485} prefix={<UserOutlined />} suffix="人" valueStyle={{ color: '#1890ff' }} />
            <Text type="secondary">本月服务 <Text strong>156</Text> 人次</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="本月活动" value={5} prefix={<CalendarOutlined />} suffix="场" valueStyle={{ color: '#52c41a' }} />
            <Text type="secondary">参与居民 <Text strong>319</Text> 人次</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="信息发布" value={18} prefix={<NotificationOutlined />} suffix="条" valueStyle={{ color: '#fa8c16' }} />
            <Text type="secondary">本月阅读量 <Text strong>1,606</Text> 次</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="网格事件" value={16} prefix={<AppstoreOutlined />} suffix="件" valueStyle={{ color: '#722ed1' }} />
            <Text type="secondary">已处理 <Text style={{ color: '#52c41a' }}>11</Text> 件</Text>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'service',
              label: <span><HeartOutlined /> 基层服务</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索居民姓名..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="服务类型" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '老年证办理', label: '老年证办理' },
                          { value: '低保申请', label: '低保申请' },
                          { value: '居住证明', label: '居住证明' },
                          { value: '政策咨询', label: '政策咨询' },
                          { value: '高龄津贴', label: '高龄津贴' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="办理状态" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '已办结', label: '已办结' },
                          { value: '办理中', label: '办理中' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>新增服务</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table dataSource={serviceData} columns={serviceColumns} pagination={false} size="middle" />

                  {/* 服务统计 */}
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col xs={24} sm={12}>
                      <Card title="本月服务类型分布" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { type: '老年证办理', count: 8, color: 'blue' },
                            { type: '居住证明', count: 6, color: 'green' },
                            { type: '政策咨询', count: 5, color: 'orange' },
                            { type: '低保申请', count: 3, color: 'red' },
                            { type: '高龄津贴', count: 3, color: 'purple' },
                            { type: '残疾人补贴', count: 2, color: 'cyan' },
                          ]}
                          renderItem={(item) => (
                            <List.Item>
                              <Tag color={item.color}>{item.type}</Tag>
                              <Text strong>{item.count}件</Text>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card title="社工工作量统计" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { name: '李社工', count: 12, avatar: 'L' },
                            { name: '王社工', count: 10, avatar: 'W' },
                            { name: '张社工', count: 8, avatar: 'Z' },
                            { name: '赵社工', count: 6, avatar: 'Z' },
                          ]}
                          renderItem={(item) => (
                            <List.Item>
                              <Avatar size="small" style={{ backgroundColor: '#1890ff', marginRight: 8 }}>{item.avatar}</Avatar>
                              <Text>{item.name}</Text>
                              <Tag color="blue">{item.count}件</Tag>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'activity',
              label: <span><GiftOutlined /> 活动组织</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索活动名称..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="活动类型" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '文化活动', label: '文化活动' },
                          { value: '健康活动', label: '健康活动' },
                          { value: '环保活动', label: '环保活动' },
                          { value: '培训活动', label: '培训活动' },
                          { value: '文体活动', label: '文体活动' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="活动状态" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '报名中', label: '报名中' },
                          { value: '即将开始', label: '即将开始' },
                          { value: '已结束', label: '已结束' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>创建活动</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table dataSource={activityData} columns={activityColumns} pagination={false} size="middle" />

                  {/* 活动风采展示 */}
                  <div style={{ marginTop: 24 }}>
                    <Title level={5} style={{ marginBottom: 16 }}>活动风采</Title>
                    <Row gutter={[16, 16]}>
                      {[
                        { title: '春季植树活动', img: '🌳', participants: 156, desc: '种植树木50棵，美化社区环境' },
                        { title: '智能手机培训', img: '📱', participants: 45, desc: '帮助老年人跨越数字鸿沟' },
                        { title: '乒乓球友谊赛', img: '🏓', participants: 32, desc: '丰富居民文体生活' },
                      ].map((item, index) => (
                        <Col xs={24} sm={8} key={index}>
                          <Card hoverable size="small">
                            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{item.img}</div>
                            <Text strong>{item.title}</Text>
                            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                              <div>👥 参与人数：{item.participants}人</div>
                              <div>{item.desc}</div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>
              )
            },
            {
              key: 'notice',
              label: <span><NotificationOutlined /> 信息发布</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索标题..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="信息类型" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '社区公告', label: '社区公告' },
                          { value: '政策通知', label: '政策通知' },
                          { value: '征求意见', label: '征求意见' },
                          { value: '安全提示', label: '安全提示' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="发布状态" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '已发布', label: '已发布' },
                          { value: '待发布', label: '待发布' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>发布信息</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table dataSource={noticeData} columns={noticeColumns} pagination={false} size="middle" />

                  {/* 推送渠道统计 */}
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col xs={24} sm={8}>
                      <Card title="推送渠道分布" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { channel: '微信公众号', count: 18, color: '#07c160' },
                            { channel: '小区公告栏', count: 12, color: '#1890ff' },
                            { channel: '业主微信群', count: 10, color: '#fa8c16' },
                            { channel: '短信通知', count: 6, color: '#722ed1' },
                          ]}
                          renderItem={(item) => (
                            <List.Item>
                              <Text>{item.channel}</Text>
                              <Tag color="blue">{item.count}次</Tag>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card title="信息阅读量排行" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { title: '五一放假安排通知', views: 568 },
                            { title: '垃圾分类积分兑换', views: 423 },
                            { title: '高龄津贴认证通知', views: 326 },
                            { title: '停车位改造征求意见', views: 289 },
                          ]}
                          renderItem={(item) => (
                            <List.Item>
                              <Text style={{ fontSize: 12 }}>{item.title}</Text>
                              <Text type="secondary">{item.views}次</Text>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card title="居民沟通渠道" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { method: '意见征集箱', count: 23, desc: '本月收集建议' },
                            { method: '居民座谈会', count: 2, desc: '本月召开次数' },
                            { method: '入户走访', count: 86, desc: '本月走访户数' },
                            { method: '满意度调查', count: 92, desc: '满意度评分' },
                          ]}
                          renderItem={(item) => (
                            <List.Item>
                              <Text style={{ fontSize: 12 }}>{item.method}</Text>
                              <Text strong style={{ color: '#1890ff' }}>{item.count}</Text>
                              <Text type="secondary" style={{ fontSize: 11 }}>{item.desc}</Text>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'grid',
              label: <span><AppstoreOutlined /> 网格化管理</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索网格/网格员..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="网格状态" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '正常', label: '正常' },
                          { value: '关注', label: '关注' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={14}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>配置网格</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table dataSource={gridData} columns={gridColumns} pagination={false} size="middle" />

                  {/* 网格地图示意 */}
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col xs={24} sm={12}>
                      <Card title="网格覆盖统计" size="small">
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Statistic title="总网格数" value={4} suffix="个" valueStyle={{ color: '#1890ff' }} />
                          </Col>
                          <Col span={12}>
                            <Statistic title="网格员" value={4} suffix="人" valueStyle={{ color: '#52c41a' }} />
                          </Col>
                          <Col span={12}>
                            <Statistic title="覆盖户数" value={1164} suffix="户" valueStyle={{ color: '#fa8c16' }} />
                          </Col>
                          <Col span={12}>
                            <Statistic title="覆盖居民" value={3485} suffix="人" valueStyle={{ color: '#722ed1' }} />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card title="网格事件处理" size="small">
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>事件处理率</Text><Text strong>68.8%</Text>
                          </div>
                          <Progress percent={68.8} size="small" status="active" />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>平均处理时长</Text><Text strong>2.5天</Text>
                          </div>
                          <Progress percent={75} size="small" strokeColor="#52c41a" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>居民满意度</Text><Text strong>92.3%</Text>
                          </div>
                          <Progress percent={92.3} size="small" strokeColor="#52c41a" />
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'resident',
              label: <span><MessageOutlined /> 居民沟通</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card hoverable size="small">
                        <Statistic title="本月意见征集" value={23} prefix={<MessageOutlined />} suffix="条" valueStyle={{ color: '#1890ff' }} />
                        <Text type="secondary">已处理反馈 <Text style={{ color: '#52c41a' }}>18</Text> 条</Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card hoverable size="small">
                        <Statistic title="入户走访" value={86} prefix={<UserOutlined />} suffix="户" valueStyle={{ color: '#52c41a' }} />
                        <Text type="secondary">本月计划走访 <Text strong>120</Text> 户</Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card hoverable size="small">
                        <Statistic title="居民满意度" value={92.3} prefix={<HeartOutlined />} suffix="%" precision={1} valueStyle={{ color: '#fa8c16' }} />
                        <Text type="secondary">较上月 <Text style={{ color: '#52c41a' }}>↑1.5%</Text></Text>
                      </Card>
                    </Col>
                  </Row>

                  <Card title="近期居民意见与反馈" style={{ marginTop: 16 }} size="small">
                    <List
                      dataSource={[
                        { resident: '3栋203业主', content: '建议小区增加电动车充电桩', date: '2026-04-22', status: '已处理', reply: '已纳入改造计划，预计5月安装' },
                        { resident: '5栋801业主', content: '楼下广场舞噪音太大影响休息', date: '2026-04-20', status: '已处理', reply: '已协调舞蹈队调整时间和音量' },
                        { resident: '7栋1502业主', content: '小区垃圾分类投放点卫生差', date: '2026-04-18', status: '处理中', reply: '已通知物业加强清洁频次' },
                        { resident: '2栋502业主', content: '希望组织亲子活动', date: '2026-04-16', status: '已处理', reply: '已策划六一儿童节亲子活动' },
                      ]}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button type="link" size="small">查看</Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text style={{ fontSize: 13 }}>{item.resident}</Text>
                                <Tag color={item.status === '已处理' ? 'success' : 'processing'}>{item.status}</Tag>
                              </Space>
                            }
                            description={
                              <div>
                                <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>📝 {item.content}</div>
                                <div style={{ fontSize: 12, color: '#999' }}>📅 {item.date} | 回复：{item.reply}</div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </div>
              )
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CommunityOffice;
