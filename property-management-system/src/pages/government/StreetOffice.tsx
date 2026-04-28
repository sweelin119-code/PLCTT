import React, { useState } from 'react';
import { Row, Col, Card, Table, Tag, Typography, Button, Space, Input, Select, DatePicker, Tabs, List, Statistic, Progress, Timeline, Badge } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, TeamOutlined, WarningOutlined, FileTextOutlined, ApartmentOutlined, UserOutlined, EnvironmentOutlined, SwapOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const StreetOffice: React.FC = () => {
  const [activeTab, setActiveTab] = useState('supervise');

  // ========== 日常监督数据 ==========
  const superviseData = [
    { key: '1', community: '碧桂园小区', company: '碧桂园物业', date: '2026-04-22', inspector: '刘志强', score: 92, level: '优秀', status: '已完成', issues: 0 },
    { key: '2', community: '万科城市花园', company: '万科物业', date: '2026-04-21', inspector: '王丽华', score: 78, level: '良好', status: '已完成', issues: 2 },
    { key: '3', community: '龙湖花园', company: '龙湖物业', date: '2026-04-20', inspector: '张明', score: 85, level: '良好', status: '已完成', issues: 1 },
    { key: '4', community: '保利中心', company: '保利物业', date: '2026-04-19', inspector: '陈晓东', score: 55, level: '不合格', status: '待整改', issues: 5 },
    { key: '5', community: '中海国际', company: '中海物业', date: '2026-04-18', inspector: '赵敏', score: 70, level: '合格', status: '整改中', issues: 3 },
    { key: '6', community: '绿城玫瑰园', company: '绿城物业', date: '2026-04-17', inspector: '刘志强', score: 95, level: '优秀', status: '已完成', issues: 0 },
  ];

  // ========== 纠纷调解数据 ==========
  const disputeData = [
    { key: '1', id: 'DIS-2026-021', type: '物业与业主纠纷', parties: '万科物业 vs 3栋203业主', date: '2026-04-20', mediator: '王丽华', status: '调解中', desc: '业主投诉物业费上涨未提前公示，要求合理解释' },
    { key: '2', id: 'DIS-2026-020', type: '邻里纠纷', parties: '5栋801 vs 5栋802', date: '2026-04-18', mediator: '张明', status: '已调解', desc: '楼上住户噪音扰民问题，经调解达成谅解协议' },
    { key: '3', id: 'DIS-2026-019', type: '物业与业主纠纷', parties: '保利物业 vs 2栋1501业主', date: '2026-04-15', mediator: '陈晓东', status: '已调解', desc: '业主房屋漏水物业维修不及时，经协调物业已安排维修' },
    { key: '4', id: 'DIS-2026-018', type: '邻里纠纷', parties: '7栋302 vs 7栋303', date: '2026-04-12', mediator: '赵敏', status: '调解中', desc: '空调外机安装位置争议，双方各执一词' },
    { key: '5', id: 'DIS-2026-017', type: '其他纠纷', parties: '碧桂园物业 vs 商铺租户', date: '2026-04-10', mediator: '刘志强', status: '已调解', desc: '商铺占道经营问题，已达成整改协议' },
  ];

  // ========== 社区协调数据 ==========
  const coordinateData = [
    { key: '1', title: '4月份物业联席会议', date: '2026-04-25', location: '街道办二楼会议室', participants: ['街道办', '住建局', '物业公司', '业委会代表'], status: '已召开', summary: '讨论物业费调整方案、垃圾分类推进工作、消防安全检查安排' },
    { key: '2', title: '社区共建活动协调会', date: '2026-04-28', location: '街道办三楼会议室', participants: ['街道办', '社区居委会', '物业公司', '志愿者团队'], status: '即将召开', summary: '五一社区文化节活动方案讨论、志愿者招募安排' },
    { key: '3', title: '老旧小区改造协调会', date: '2026-05-08', location: '街道办会议室', participants: ['街道办', '住建局', '施工方', '物业公司', '业主代表'], status: '筹备中', summary: '老旧小区改造方案征求意见、施工期间管理方案' },
  ];

  // ========== 应急管理数据 ==========
  const emergencyData = [
    { key: '1', event: '碧桂园小区水管爆裂', level: '一般', date: '2026-04-22', status: '已处置', response: '15分钟', desc: '小区主供水管突发爆裂，物业紧急停水抢修，街道协调供水车应急供水' },
    { key: '2', event: '万科城市花园电梯困人', level: '紧急', date: '2026-04-19', status: '已处置', response: '8分钟', desc: '电梯故障导致2名业主被困，物业、消防、街道联动处置，成功解救' },
    { key: '3', event: '保利中心火警误报', level: '一般', date: '2026-04-15', status: '已处置', response: '5分钟', desc: '消防烟感误报，物业保安迅速到场确认，排除险情' },
    { key: '4', event: '龙湖花园燃气泄漏预警', level: '重大', date: '2026-04-10', status: '已处置', response: '10分钟', desc: '业主报修燃气异味，物业紧急疏散、燃气公司抢修，街道现场协调' },
  ];

  const superviseColumns = [
    { title: '小区名称', dataIndex: 'community', key: 'community', width: 120 },
    { title: '物业企业', dataIndex: 'company', key: 'company', width: 120 },
    { title: '巡查日期', dataIndex: 'date', key: 'date', width: 100 },
    { title: '巡查人', dataIndex: 'inspector', key: 'inspector', width: 80 },
    { title: '评分', dataIndex: 'score', key: 'score', width: 70,
      render: (score: number) => {
        const color = score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f';
        return <Text strong style={{ color }}>{score}分</Text>;
      }
    },
    { title: '等级', dataIndex: 'level', key: 'level', width: 80,
      render: (level: string) => {
        const colorMap: Record<string, string> = { '优秀': 'success', '良好': 'processing', '合格': 'warning', '不合格': 'error' };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      }
    },
    { title: '问题数', dataIndex: 'issues', key: 'issues', width: 70,
      render: (issues: number) => issues > 0 ? <Badge count={issues} size="small" style={{ backgroundColor: '#ff4d4f' }} /> : <Text type="secondary">0</Text>
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '已完成': 'success', '整改中': 'warning', '待整改': 'error' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    { title: '操作', key: 'action', width: 80,
      render: () => <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
    },
  ];

  const disputeColumns = [
    { title: '编号', dataIndex: 'id', key: 'id', width: 120 },
    { title: '纠纷类型', dataIndex: 'type', key: 'type', width: 130,
      render: (type: string) => {
        const colorMap: Record<string, string> = { '物业与业主纠纷': 'red', '邻里纠纷': 'orange', '其他纠纷': 'default' };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    { title: '纠纷双方', dataIndex: 'parties', key: 'parties', width: 200 },
    { title: '调解日期', dataIndex: 'date', key: 'date', width: 100 },
    { title: '调解人', dataIndex: 'mediator', key: 'mediator', width: 80 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (status: string) => <Tag color={status === '已调解' ? 'success' : 'processing'}>{status}</Tag>
    },
    { title: '操作', key: 'action', width: 80,
      render: () => <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        <ApartmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        街道物业管理部门
      </Title>

      {/* 数据概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="管辖小区数" value={32} prefix={<EnvironmentOutlined />} suffix="个" valueStyle={{ color: '#1890ff' }} />
            <Text type="secondary">本月巡查覆盖率 <Text strong>78%</Text></Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="本月巡查次数" value={46} prefix={<FileTextOutlined />} suffix="次" valueStyle={{ color: '#52c41a' }} />
            <Text type="secondary">发现问题 <Text style={{ color: '#ff4d4f' }}>23</Text> 项</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="纠纷调解" value={15} prefix={<SwapOutlined />} suffix="件" valueStyle={{ color: '#fa8c16' }} />
            <Text type="secondary">调解成功率 <Text style={{ color: '#52c41a' }}>86.7%</Text></Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="应急事件" value={4} prefix={<WarningOutlined />} suffix="起" valueStyle={{ color: '#cf1322' }} />
            <Text type="secondary">本月全部 <Text style={{ color: '#52c41a' }}>已处置</Text></Text>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'supervise',
              label: <span><FileTextOutlined /> 日常监督</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索小区/物业企业..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="巡查等级" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '优秀', label: '优秀' },
                          { value: '良好', label: '良好' },
                          { value: '合格', label: '合格' },
                          { value: '不合格', label: '不合格' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="状态" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '已完成', label: '已完成' },
                          { value: '整改中', label: '整改中' },
                          { value: '待整改', label: '待整改' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>新增巡查</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table dataSource={superviseData} columns={superviseColumns} pagination={false} size="middle" />

                  {/* 巡查评分分布 */}
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col xs={24} sm={12}>
                      <Card title="巡查评分分布" size="small">
                        <Row gutter={[8, 16]}>
                          {[
                            { label: '优秀(90+)', count: 2, color: '#52c41a', percent: 33.3 },
                            { label: '良好(80-89)', count: 1, color: '#1890ff', percent: 16.7 },
                            { label: '合格(70-79)', count: 2, color: '#faad14', percent: 33.3 },
                            { label: '不合格(<70)', count: 1, color: '#ff4d4f', percent: 16.7 },
                          ].map(item => (
                            <Col span={12} key={item.label}>
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <Text style={{ fontSize: 12 }}>{item.label}</Text>
                                  <Text strong style={{ fontSize: 12 }}>{item.count}个</Text>
                                </div>
                                <Progress percent={item.percent} size="small" strokeColor={item.color} showInfo={false} />
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card title="问题整改跟踪" size="small">
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>已整改完成</Text><Text strong style={{ color: '#52c41a' }}>15项</Text>
                          </div>
                          <Progress percent={65.2} size="small" strokeColor="#52c41a" />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>整改中</Text><Text strong style={{ color: '#faad14' }}>5项</Text>
                          </div>
                          <Progress percent={21.7} size="small" strokeColor="#faad14" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>待整改</Text><Text strong style={{ color: '#ff4d4f' }}>3项</Text>
                          </div>
                          <Progress percent={13.1} size="small" strokeColor="#ff4d4f" />
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'dispute',
              label: <span><SwapOutlined /> 纠纷调解</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索纠纷编号/双方..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="纠纷类型" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '物业与业主纠纷', label: '物业与业主纠纷' },
                          { value: '邻里纠纷', label: '邻里纠纷' },
                          { value: '其他纠纷', label: '其他纠纷' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="调解状态" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '已调解', label: '已调解' },
                          { value: '调解中', label: '调解中' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>新增调解</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table dataSource={disputeData} columns={disputeColumns} pagination={false} size="middle" />

                  {/* 调解统计 */}
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col xs={24} sm={8}>
                      <Card title="本月调解统计" size="small">
                        <div style={{ textAlign: 'center' }}>
                          <Progress type="circle" percent={86.7} size={100} strokeColor="#52c41a" format={() => '86.7%'} />
                          <div style={{ marginTop: 8 }}><Text strong>调解成功率</Text></div>
                          <div style={{ marginTop: 4 }}><Text type="secondary">已调解13件 / 总计15件</Text></div>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card title="纠纷类型分布" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { type: '物业与业主纠纷', count: 8, color: 'red' },
                            { type: '邻里纠纷', count: 5, color: 'orange' },
                            { type: '其他纠纷', count: 2, color: 'default' },
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
                    <Col xs={24} sm={8}>
                      <Card title="调解员工作量" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { name: '王丽华', count: 4 },
                            { name: '张明', count: 3 },
                            { name: '陈晓东', count: 3 },
                            { name: '赵敏', count: 3 },
                            { name: '刘志强', count: 2 },
                          ]}
                          renderItem={(item) => (
                            <List.Item>
                              <Text><UserOutlined style={{ marginRight: 8 }} />{item.name}</Text>
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
              key: 'coordinate',
              label: <span><TeamOutlined /> 社区协调</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索会议/活动..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="状态" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '已召开', label: '已召开' },
                          { value: '即将召开', label: '即将召开' },
                          { value: '筹备中', label: '筹备中' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                    </Col>
                    <Col xs={12} sm={10}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>组织会议</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    {coordinateData.map(item => (
                      <Col xs={24} lg={8} key={item.key}>
                        <Card
                          hoverable
                          title={
                            <Space>
                              <Tag color={item.status === '已召开' ? 'success' : item.status === '即将召开' ? 'processing' : 'default'}>{item.status}</Tag>
                              <Text strong>{item.title}</Text>
                            </Space>
                          }
                          size="small"
                        >
                          <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
                            <div>📅 {item.date}</div>
                            <div>📍 {item.location}</div>
                          </div>
                          <Paragraph style={{ fontSize: 13, color: '#555' }}>{item.summary}</Paragraph>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>参与方：</Text>
                            <div style={{ marginTop: 4 }}>
                              {item.participants.map(p => <Tag key={p} style={{ fontSize: 11, marginBottom: 4 }}>{p}</Tag>)}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )
            },
            {
              key: 'emergency',
              label: <span><WarningOutlined /> 应急管理</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索应急事件..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="事件级别" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '重大', label: '重大' },
                          { value: '紧急', label: '紧急' },
                          { value: '一般', label: '一般' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                    </Col>
                    <Col xs={12} sm={10}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>应急预案</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Timeline
                    items={emergencyData.map(item => ({
                      color: item.level === '重大' ? 'red' : item.level === '紧急' ? 'orange' : 'blue',
                      children: (
                        <Card size="small" style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Space>
                              <Tag color={item.level === '重大' ? 'red' : item.level === '紧急' ? 'orange' : 'blue'}>{item.level}</Tag>
                              <Text strong>{item.event}</Text>
                            </Space>
                            <Tag color="success">{item.status}</Tag>
                          </div>
                          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                            <Text type="secondary">📅 {item.date} | ⏱ 响应时间：{item.response}</Text>
                          </div>
                          <Paragraph style={{ fontSize: 13, color: '#555', margin: 0 }}>{item.desc}</Paragraph>
                        </Card>
                      )
                    }))}
                  />
                </div>
              )
            },
            {
              key: 'report',
              label: <span><FileTextOutlined /> 数据上报</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card hoverable size="small">
                        <Statistic title="本月应上报报表" value={8} suffix="份" valueStyle={{ color: '#1890ff' }} />
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">已上报 <Text strong style={{ color: '#52c41a' }}>6</Text> 份</Text>
                          <Text type="secondary" style={{ marginLeft: 16 }}>未上报 <Text strong style={{ color: '#ff4d4f' }}>2</Text> 份</Text>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card hoverable size="small">
                        <Statistic title="突发事件上报" value={4} suffix="起" valueStyle={{ color: '#fa8c16' }} />
                        <div style={{ marginTop: 8 }}><Text type="secondary">全部按时上报，无漏报</Text></div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card hoverable size="small">
                        <Statistic title="数据质量评分" value={96.5} suffix="分" precision={1} valueStyle={{ color: '#52c41a' }} />
                        <div style={{ marginTop: 8 }}><Text type="secondary">较上月 <Text style={{ color: '#52c41a' }}>↑1.2分</Text></Text></div>
                      </Card>
                    </Col>
                  </Row>

                  <Card title="待上报报表" style={{ marginTop: 16 }} size="small">
                    <List
                      dataSource={[
                        { name: '4月份物业服务质量巡查月报', deadline: '2026-05-05', status: '未上报', level: '紧急' },
                        { name: '4月份纠纷调解统计报表', deadline: '2026-05-05', status: '未上报', level: '紧急' },
                        { name: '4月份应急事件处置报告', deadline: '2026-05-10', status: '已上报', level: '正常' },
                        { name: '第二季度社区协调工作计划', deadline: '2026-05-15', status: '已上报', level: '正常' },
                        { name: '4月份数据质量自查报告', deadline: '2026-05-08', status: '已上报', level: '正常' },
                        { name: '五一节前安全检查总结报告', deadline: '2026-05-03', status: '已上报', level: '正常' },
                        { name: '4月份投诉处理情况汇总', deadline: '2026-05-05', status: '未上报', level: '紧急' },
                        { name: '老旧小区改造进度月报', deadline: '2026-05-12', status: '已上报', level: '正常' },
                      ]}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button type="link" size="small">{item.status === '未上报' ? '立即上报' : '查看'}</Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                {item.status === '未上报' && <Badge status="error" />}
                                <Text style={{ fontSize: 13 }}>{item.name}</Text>
                                {item.level === '紧急' && item.status === '未上报' && <Tag color="red">紧急</Tag>}
                              </Space>
                            }
                            description={<Text type="secondary" style={{ fontSize: 12 }}>截止日期：{item.deadline} | 状态：<Tag color={item.status === '未上报' ? 'error' : 'success'}>{item.status}</Tag></Text>}
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

export default StreetOffice;
