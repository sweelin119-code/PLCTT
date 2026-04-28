import React, { useState } from 'react';
import { Row, Col, Card, Table, Tag, Typography, Button, Space, Input, Select, DatePicker, Modal, Form, Input as AntInput, Upload, Tabs, List, Statistic, Progress, Timeline, Badge, Divider, Alert } from 'antd';
import { PlusOutlined, SearchOutlined, FileTextOutlined, DownloadOutlined, EyeOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InboxOutlined, BookOutlined, AuditOutlined, ApartmentOutlined, TeamOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = AntInput;
const { RangePicker } = DatePicker;
const { Dragger } = Upload;

const PolicyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [policyDetailVisible, setPolicyDetailVisible] = useState(false);
  const [enforceDetailVisible, setEnforceDetailVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [selectedEnforce, setSelectedEnforce] = useState<any>(null);
  const [caseModalVisible, setCaseModalVisible] = useState(false);
  const [reviseModalVisible, setReviseModalVisible] = useState(false);

  // ========== 政策法规库数据 ==========
  const policyLibraryData = [
    {
      key: '1', id: 'POL-2026-001',
      title: '《XX市物业管理条例（2026年修订版）》',
      category: '地方性法规',
      level: '市级',
      department: '市住房和城乡建设局',
      publishDate: '2026-03-15',
      effectiveDate: '2026-05-01',
      status: '已生效',
      version: 'v2.0',
      summary: '为进一步规范物业管理活动，维护业主、物业使用人和物业服务企业的合法权益，改善人居环境，促进和谐社区建设，根据相关法律法规，结合本市实际，修订本条例。',
      tags: ['物业管理', '业主权益', '服务标准'],
      views: 1256,
      downloads: 386,
      attachments: ['XX市物业管理条例（2026年修订版）.pdf', '条例解读说明.docx'],
      history: [
        { version: 'v1.0', date: '2022-06-01', desc: '首次发布' },
        { version: 'v2.0', date: '2026-03-15', desc: '全面修订，新增智慧物业、垃圾分类等内容' },
      ],
      feedbackCount: 23,
    },
    {
      key: '2', id: 'POL-2026-002',
      title: '《物业服务质量分级管理办法》',
      category: '规范性文件',
      level: '市级',
      department: '市住房和城乡建设局',
      publishDate: '2026-02-20',
      effectiveDate: '2026-04-01',
      status: '已生效',
      version: 'v1.0',
      summary: '建立物业服务质量分级管理制度，对物业服务企业进行等级评定，实行差异化监管，促进物业服务行业高质量发展。',
      tags: ['服务质量', '分级管理', '信用评价'],
      views: 892,
      downloads: 256,
      attachments: ['物业服务质量分级管理办法.pdf'],
      history: [
        { version: 'v1.0', date: '2026-02-20', desc: '首次发布' },
      ],
      feedbackCount: 12,
    },
    {
      key: '3', id: 'POL-2026-003',
      title: '《关于加强住宅小区消防安全管理的通知》',
      category: '通知公告',
      level: '市级',
      department: '市消防救援支队、市住建局',
      publishDate: '2026-02-10',
      effectiveDate: '2026-02-10',
      status: '已生效',
      version: 'v1.0',
      summary: '进一步加强住宅小区消防安全管理，落实物业服务企业消防安全主体责任，排查整治火灾隐患，确保小区消防安全形势稳定。',
      tags: ['消防安全', '隐患排查', '主体责任'],
      views: 1568,
      downloads: 523,
      attachments: ['消防安全管理通知.pdf', '消防安全检查清单.xlsx'],
      history: [
        { version: 'v1.0', date: '2026-02-10', desc: '首次发布' },
      ],
      feedbackCount: 8,
    },
    {
      key: '4', id: 'POL-2026-004',
      title: '《XX市住宅专项维修资金管理办法（征求意见稿）》',
      category: '征求意见',
      level: '市级',
      department: '市住房和城乡建设局',
      publishDate: '2026-04-01',
      effectiveDate: '待定',
      status: '征求意见中',
      version: 'v0.9',
      summary: '规范住宅专项维修资金的交存、使用、管理和监督，保障住宅共用部位、共用设施设备的维修和正常使用，维护业主的合法权益。',
      tags: ['维修资金', '征求意见', '资金管理'],
      views: 723,
      downloads: 189,
      attachments: ['维修资金管理办法（征求意见稿）.pdf', '意见反馈表.docx'],
      history: [
        { version: 'v0.9', date: '2026-04-01', desc: '征求意见稿' },
      ],
      feedbackCount: 45,
    },
    {
      key: '5', id: 'POL-2026-005',
      title: '《物业服务企业信用评价实施细则》',
      category: '规范性文件',
      level: '市级',
      department: '市住房和城乡建设局',
      publishDate: '2026-01-15',
      effectiveDate: '2026-03-01',
      status: '已生效',
      version: 'v1.0',
      summary: '建立物业服务企业信用评价体系，对物业服务企业的信用信息进行采集、评价、发布和应用，构建守信激励、失信惩戒的市场环境。',
      tags: ['信用评价', '物业服务', '诚信体系'],
      views: 1056,
      downloads: 312,
      attachments: ['信用评价实施细则.pdf', '信用评分标准.xlsx'],
      history: [
        { version: 'v1.0', date: '2026-01-15', desc: '首次发布' },
      ],
      feedbackCount: 15,
    },
    {
      key: '6', id: 'POL-2026-006',
      title: '《关于推进智慧物业建设的指导意见》',
      category: '指导意见',
      level: '市级',
      department: '市住房和城乡建设局',
      publishDate: '2026-03-28',
      effectiveDate: '2026-04-15',
      status: '即将生效',
      version: 'v1.0',
      summary: '推动物业服务企业运用物联网、大数据、人工智能等新技术，建设智慧物业管理服务平台，提升物业服务智能化水平。',
      tags: ['智慧物业', '信息化', '科技创新'],
      views: 634,
      downloads: 178,
      attachments: ['智慧物业建设指导意见.pdf'],
      history: [
        { version: 'v1.0', date: '2026-03-28', desc: '首次发布' },
      ],
      feedbackCount: 6,
    },
  ];

  // ========== 政策执行督查数据 ==========
  const enforceData = [
    {
      key: '1', policy: '《XX市物业管理条例（2026年修订版）》',
      company: '碧桂园物业服务有限公司',
      community: '碧桂园小区',
      checkDate: '2026-04-20',
      status: '已达标',
      score: 92,
      inspector: '张建国',
      issues: [],
      suggestion: '继续保持，建议加强业主沟通机制建设',
      rectification: [],
      checkItems: [
        { item: '物业费收支公示', result: '合格', remark: '公示及时、内容完整' },
        { item: '消防设施维护', result: '合格', remark: '设施完好、年检有效' },
        { item: '环境卫生管理', result: '合格', remark: '清洁到位、垃圾分类规范' },
        { item: '安保人员配置', result: '合格', remark: '人员到位、培训记录完整' },
        { item: '投诉处理机制', result: '合格', remark: '渠道畅通、处理及时' },
      ],
    },
    {
      key: '2', policy: '《XX市物业管理条例（2026年修订版）》',
      company: '万科物业服务有限公司',
      community: '万科城市花园',
      checkDate: '2026-04-18',
      status: '基本达标',
      score: 78,
      inspector: '李明辉',
      issues: ['消防通道存在杂物堆放', '物业费收支公示不及时'],
      suggestion: '限期7天整改消防通道问题，完善公示制度',
      rectification: [
        { issue: '消防通道存在杂物堆放', deadline: '2026-04-25', status: '整改中', progress: 60 },
        { issue: '物业费收支公示不及时', deadline: '2026-04-30', status: '待整改', progress: 0 },
      ],
      checkItems: [
        { item: '物业费收支公示', result: '不合格', remark: '未按时公示2026年Q1收支明细' },
        { item: '消防设施维护', result: '合格', remark: '设施完好' },
        { item: '环境卫生管理', result: '合格', remark: '整体良好' },
        { item: '安保人员配置', result: '合格', remark: '人员到位' },
        { item: '投诉处理机制', result: '基本合格', remark: '处理及时但满意度偏低' },
      ],
    },
    {
      key: '3', policy: '《物业服务质量分级管理办法》',
      company: '龙湖物业服务有限公司',
      community: '龙湖花园',
      checkDate: '2026-04-15',
      status: '已达标',
      score: 88,
      inspector: '王芳',
      issues: [],
      suggestion: '服务质量较好，建议申报A级评定',
      rectification: [],
      checkItems: [
        { item: '服务标准执行', result: '合格', remark: '严格按照A级标准执行' },
        { item: '人员资质', result: '合格', remark: '持证上岗率100%' },
        { item: '业主满意度', result: '合格', remark: '满意度评分86分' },
        { item: '服务创新', result: '优秀', remark: '推行管家式服务获好评' },
      ],
    },
    {
      key: '4', policy: '《关于加强住宅小区消防安全管理的通知》',
      company: '保利物业服务有限公司',
      community: '保利中心',
      checkDate: '2026-04-12',
      status: '未达标',
      score: 55,
      inspector: '赵铁军',
      issues: ['消防设施未按期年检', '消防演练记录缺失', '疏散指示标志损坏多处'],
      suggestion: '立即整改，限期15天完成消防设施年检和演练补录',
      rectification: [
        { issue: '消防设施未按期年检', deadline: '2026-04-27', status: '整改中', progress: 30 },
        { issue: '消防演练记录缺失', deadline: '2026-04-27', status: '待整改', progress: 0 },
        { issue: '疏散指示标志损坏多处', deadline: '2026-04-22', status: '已整改', progress: 100 },
      ],
      checkItems: [
        { item: '消防设施年检', result: '不合格', remark: '灭火器过期、消防栓未年检' },
        { item: '消防演练记录', result: '不合格', remark: '2026年无演练记录' },
        { item: '疏散指示标志', result: '不合格', remark: '3处损坏、2处不亮' },
        { item: '消防通道', result: '合格', remark: '通道畅通' },
        { item: '消防控制室', result: '基本合格', remark: '值班记录不完整' },
      ],
    },
    {
      key: '5', policy: '《物业服务企业信用评价实施细则》',
      company: '中海物业服务有限公司',
      community: '中海国际',
      checkDate: '2026-04-10',
      status: '基本达标',
      score: 72,
      inspector: '陈思远',
      issues: ['信用信息报送不及时', '业主投诉处理满意度偏低'],
      suggestion: '加强信用信息管理，提升投诉处理质量',
      rectification: [
        { issue: '信用信息报送不及时', deadline: '2026-04-30', status: '整改中', progress: 50 },
        { issue: '业主投诉处理满意度偏低', deadline: '2026-05-10', status: '待整改', progress: 0 },
      ],
      checkItems: [
        { item: '信用信息报送', result: '不合格', remark: 'Q1信用信息延迟15天报送' },
        { item: '投诉处理满意度', result: '不合格', remark: '满意度评分仅62分' },
        { item: '合同备案', result: '合格', remark: '合同备案完整' },
        { item: '人员资质', result: '合格', remark: '资质齐全' },
      ],
    },
    {
      key: '6', policy: '《XX市物业管理条例（2026年修订版）》',
      company: '绿城物业服务有限公司',
      community: '绿城玫瑰园',
      checkDate: '2026-04-08',
      status: '已达标',
      score: 95,
      inspector: '张建国',
      issues: [],
      suggestion: '优秀案例，建议组织行业学习交流',
      rectification: [],
      checkItems: [
        { item: '物业费收支公示', result: '优秀', remark: '线上实时公示，业主可随时查看' },
        { item: '消防设施维护', result: '合格', remark: '设施完好、年检有效' },
        { item: '环境卫生管理', result: '优秀', remark: '垃圾分类示范小区' },
        { item: '安保人员配置', result: '合格', remark: '24小时巡逻' },
        { item: '投诉处理机制', result: '优秀', remark: '30分钟响应、24小时闭环' },
      ],
    },
  ];

  // ========== 政策宣贯活动数据 ==========
  const promoteData = [
    {
      key: '1', title: '《XX市物业管理条例》宣贯培训会',
      date: '2026-04-25',
      location: '市住建局三楼会议室',
      organizer: '市住房和城乡建设局',
      participants: 156,
      status: '已举办',
      type: '线下培训',
    },
    {
      key: '2', title: '物业服务质量分级管理政策解读直播',
      date: '2026-04-28',
      location: '线上直播平台',
      organizer: '市物业管理行业协会',
      participants: 2836,
      status: '已举办',
      type: '线上直播',
    },
    {
      key: '3', title: '住宅小区消防安全管理专题培训',
      date: '2026-05-10',
      location: '市消防训练基地',
      organizer: '市消防救援支队',
      participants: 0,
      status: '即将举办',
      type: '线下培训',
    },
    {
      key: '4', title: '智慧物业建设经验交流会',
      date: '2026-05-20',
      location: '碧桂园小区智慧物业示范点',
      organizer: '市住建局物业处',
      participants: 0,
      status: '报名中',
      type: '现场观摩',
    },
  ];

  // ========== 政策应用案例数据 ==========
  const caseData = [
    {
      key: '1', title: '碧桂园小区智慧物业建设案例',
      company: '碧桂园物业服务有限公司',
      community: '碧桂园小区',
      date: '2026-04',
      summary: '落实《关于推进智慧物业建设的指导意见》，投入80万元建设智慧物业平台，实现门禁智能化、巡检电子化、缴费线上化，业主满意度提升15%。',
      results: ['业主满意度从82%提升至94%', '物业费收缴率从85%提升至96%', '报修响应时间缩短60%'],
      tags: ['智慧物业', '数字化转型', '标杆案例'],
      submitter: '碧桂园物业',
      submitDate: '2026-04-10',
      status: '已采纳',
    },
    {
      key: '2', title: '万科城市花园消防安全整改案例',
      company: '万科物业服务有限公司',
      community: '万科城市花园',
      date: '2026-03',
      summary: '针对《关于加强住宅小区消防安全管理的通知》要求，全面排查消防隐患，投入12万元更新消防设施，组织全员消防演练，通过消防部门验收。',
      results: ['整改消防隐患47处', '组织消防演练3次', '全员消防培训覆盖率100%'],
      tags: ['消防安全', '隐患整改', '应急演练'],
      submitter: '万科物业',
      submitDate: '2026-03-28',
      status: '已采纳',
    },
    {
      key: '3', title: '龙湖花园物业服务质量提升案例',
      company: '龙湖物业服务有限公司',
      community: '龙湖花园',
      date: '2026-02',
      summary: '依据《物业服务质量分级管理办法》，建立服务质量内部考核体系，推行"管家式"服务模式，成功获评A级物业服务企业。',
      results: ['获评A级物业服务企业', '服务投诉量下降45%', '物业费单价提升8%'],
      tags: ['服务质量', '分级管理', '品牌提升'],
      submitter: '龙湖物业',
      submitDate: '2026-02-25',
      status: '已采纳',
    },
  ];

  const policyColumns = [
    { title: '政策编号', dataIndex: 'id', key: 'id', width: 130 },
    { title: '政策标题', dataIndex: 'title', key: 'title', width: 320,
      render: (text: string, record: any) => (
        <Button type="link" onClick={() => { setSelectedPolicy(record); setPolicyDetailVisible(true); }} style={{ padding: 0 }}>
          {text}
        </Button>
      )
    },
    { title: '版本', dataIndex: 'version', key: 'version', width: 60,
      render: (v: string) => <Tag color="default" style={{ fontSize: 11 }}>{v}</Tag>
    },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100,
      render: (cat: string) => {
        const colorMap: Record<string, string> = { '地方性法规': 'red', '规范性文件': 'blue', '通知公告': 'orange', '征求意见': 'purple', '指导意见': 'green' };
        return <Tag color={colorMap[cat] || 'default'}>{cat}</Tag>;
      }
    },
    { title: '发布部门', dataIndex: 'department', key: 'department', width: 170 },
    { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '已生效': 'success', '即将生效': 'processing', '征求意见中': 'warning', '已废止': 'default' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    { title: '操作', key: 'action', width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedPolicy(record); setPolicyDetailVisible(true); }}>查看</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
          {record.status === '已生效' && <Button type="link" size="small" icon={<StopOutlined />} danger>废止</Button>}
        </Space>
      )
    },
  ];

  const enforceColumns = [
    { title: '督查政策', dataIndex: 'policy', key: 'policy', width: 260 },
    { title: '物业企业', dataIndex: 'company', key: 'company', width: 170 },
    { title: '小区名称', dataIndex: 'community', key: 'community', width: 120 },
    { title: '督查日期', dataIndex: 'checkDate', key: 'checkDate', width: 100 },
    { title: '督查结果', dataIndex: 'status', key: 'status', width: 90,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '已达标': 'success', '基本达标': 'warning', '未达标': 'error' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    { title: '评分', dataIndex: 'score', key: 'score', width: 70,
      render: (score: number) => {
        const color = score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f';
        return <Text strong style={{ color }}>{score}分</Text>;
      }
    },
    { title: '问题数', key: 'issuesCount', width: 70,
      render: (_: any, record: any) => {
        const count = record.issues?.length || 0;
        return count > 0 ? <Badge count={count} size="small" style={{ backgroundColor: '#ff4d4f' }} /> : <Text type="secondary">0</Text>;
      }
    },
    { title: '督查人', dataIndex: 'inspector', key: 'inspector', width: 80 },
    { title: '操作', key: 'action', width: 120,
      render: (_: any, record: any) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedEnforce(record); setEnforceDetailVisible(true); }}>详情</Button>
      )
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        政策监管模块
      </Title>

      {/* 政策数据概览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="现行有效政策" value={18} prefix={<BookOutlined />} suffix="项" valueStyle={{ color: '#1890ff' }} />
            <Text type="secondary">较上月 <Text style={{ color: '#52c41a' }}>↑2项</Text></Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="本月督查次数" value={46} prefix={<AuditOutlined />} suffix="次" valueStyle={{ color: '#52c41a' }} />
            <Text type="secondary">覆盖 <Text strong>32</Text> 个小区</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="政策达标率" value={86.5} prefix={<CheckCircleOutlined />} suffix="%" precision={1} valueStyle={{ color: '#3f8600' }} />
            <Text type="secondary">较上月 <Text style={{ color: '#52c41a' }}>↑3.2%</Text></Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable size="small">
            <Statistic title="待整改问题" value={23} prefix={<ExclamationCircleOutlined />} suffix="项" valueStyle={{ color: '#cf1322' }} />
            <Text type="secondary">其中紧急 <Text style={{ color: '#ff4d4f' }}>5</Text> 项</Text>
          </Card>
        </Col>
      </Row>

      {/* 政策监管主内容 - 使用Tabs切换 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'library',
              label: <span><BookOutlined /> 政策法规库</span>,
              children: (
                <div>
                  {/* 搜索和筛选栏 */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={8}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索政策标题、关键词..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="政策分类" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '地方性法规', label: '地方性法规' },
                          { value: '规范性文件', label: '规范性文件' },
                          { value: '通知公告', label: '通知公告' },
                          { value: '征求意见', label: '征求意见' },
                          { value: '指导意见', label: '指导意见' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="政策状态" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '已生效', label: '已生效' },
                          { value: '即将生效', label: '即将生效' },
                          { value: '征求意见中', label: '征求意见中' },
                          { value: '已废止', label: '已废止' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="发布级别" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '国家级', label: '国家级' },
                          { value: '省级', label: '省级' },
                          { value: '市级', label: '市级' },
                          { value: '区级', label: '区级' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setPolicyModalVisible(true)} block>
                        发布新政策
                      </Button>
                    </Col>
                  </Row>

                  <Table dataSource={policyLibraryData} columns={policyColumns} pagination={{ pageSize: 10 }} size="middle" />

                  {/* 政策宣贯活动 */}
                  <div style={{ marginTop: 24 }}>
                    <Title level={5} style={{ marginBottom: 16 }}>
                      <TeamOutlined style={{ marginRight: 8 }} />
                      政策宣贯活动
                    </Title>
                    <Row gutter={[16, 16]}>
                      {promoteData.map(item => (
                        <Col xs={24} sm={12} lg={6} key={item.key}>
                          <Card size="small" hoverable>
                            <div style={{ marginBottom: 8 }}>
                              <Tag color={item.status === '已举办' ? 'success' : item.status === '即将举办' ? 'processing' : 'blue'}>
                                {item.status}
                              </Tag>
                              <Tag>{item.type}</Tag>
                            </div>
                            <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
                            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                              <div>📅 {item.date}</div>
                              <div>📍 {item.location}</div>
                              <div>🏢 {item.organizer}</div>
                              {item.participants > 0 && <div>👥 参与人数：{item.participants}人</div>}
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
              key: 'enforce',
              label: <span><AuditOutlined /> 政策执行督查</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                      <Input prefix={<SearchOutlined />} placeholder="搜索企业/小区..." />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="督查结果" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '已达标', label: '已达标' },
                          { value: '基本达标', label: '基本达标' },
                          { value: '未达标', label: '未达标' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Select placeholder="督查政策" style={{ width: '100%' }} allowClear
                        options={[
                          { value: '物业管理条例', label: '物业管理条例' },
                          { value: '服务质量分级', label: '服务质量分级' },
                          { value: '消防安全', label: '消防安全' },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Space>
                        <Button type="primary" icon={<SearchOutlined />}>查询</Button>
                        <Button icon={<PlusOutlined />}>新增督查</Button>
                        <Button icon={<DownloadOutlined />}>导出报告</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table dataSource={enforceData} columns={enforceColumns} pagination={{ pageSize: 10 }} size="middle" />

                  {/* 督查结果分布 */}
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col xs={24} sm={8}>
                      <Card title="督查结果分布" size="small">
                        <div style={{ textAlign: 'center', padding: '8px 0' }}>
                          <Progress type="circle" percent={50} size={100} strokeColor="#52c41a" format={() => '50%'} />
                          <div style={{ marginTop: 8 }}><Text strong>已达标</Text> - 3家</div>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card title="常见问题统计" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { issue: '消防设施未按期年检', count: 8 },
                            { issue: '物业费收支公示不及时', count: 6 },
                            { issue: '信用信息报送不及时', count: 5 },
                            { issue: '投诉处理满意度偏低', count: 4 },
                            { issue: '消防通道杂物堆放', count: 3 },
                          ]}
                          renderItem={(item) => (
                            <List.Item>
                              <Text style={{ fontSize: 13 }}>{item.issue}</Text>
                              <Tag color="red">{item.count}项</Tag>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card title="整改跟踪" size="small">
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>整改完成率</Text><Text strong>68.4%</Text>
                          </div>
                          <Progress percent={68.4} size="small" status="active" />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>按期整改率</Text><Text strong>82.1%</Text>
                          </div>
                          <Progress percent={82.1} size="small" status="active" strokeColor="#52c41a" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text>超期未整改</Text><Text strong style={{ color: '#ff4d4f' }}>5项</Text>
                          </div>
                          <Progress percent={100} size="small" strokeColor="#ff4d4f" />
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'cases',
              label: <span><ApartmentOutlined /> 政策应用案例</span>,
              children: (
                <div>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={24}>
                      <Space style={{ float: 'right' }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCaseModalVisible(true)}>
                          提交案例
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    {caseData.map(item => (
                      <Col xs={24} lg={8} key={item.key}>
                        <Card
                          hoverable
                          title={<Text strong>{item.title}</Text>}
                          size="small"
                          style={{ height: '100%' }}
                          extra={<Tag color="success">{item.status}</Tag>}
                        >
                          <div style={{ marginBottom: 12 }}>
                            <Tag color="blue">{item.company}</Tag>
                            <Tag>{item.community}</Tag>
                            <Tag color="green">{item.date}</Tag>
                          </div>
                          <Paragraph style={{ fontSize: 13, color: '#555' }}>
                            {item.summary}
                          </Paragraph>
                          <div style={{ marginBottom: 12 }}>
                            <Text strong style={{ fontSize: 13 }}>应用成效：</Text>
                            <List
                              size="small"
                              dataSource={item.results}
                              renderItem={(result) => (
                                <List.Item>
                                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                  <Text style={{ fontSize: 12 }}>{result}</Text>
                                </List.Item>
                              )}
                            />
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            {item.tags.map(tag => <Tag key={tag} color="purple" style={{ fontSize: 11 }}>{tag}</Tag>)}
                          </div>
                          <div style={{ fontSize: 11, color: '#999' }}>
                            提交：{item.submitter} | {item.submitDate}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )
            },
          ]}
        />
      </Card>

      {/* 发布新政策弹窗 */}
      <Modal
        title="发布新政策法规"
        open={policyModalVisible}
        onCancel={() => setPolicyModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setPolicyModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" icon={<PlusOutlined />}>发布政策</Button>,
        ]}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="政策标题" required>
                <Input placeholder="请输入政策法规标题" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="政策分类" required>
                <Select placeholder="请选择分类"
                  options={[
                    { value: '地方性法规', label: '地方性法规' },
                    { value: '规范性文件', label: '规范性文件' },
                    { value: '通知公告', label: '通知公告' },
                    { value: '指导意见', label: '指导意见' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="发布级别" required>
                <Select placeholder="请选择级别"
                  options={[
                    { value: '国家级', label: '国家级' },
                    { value: '省级', label: '省级' },
                    { value: '市级', label: '市级' },
                    { value: '区级', label: '区级' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="发布部门" required>
                <Input placeholder="请输入发布部门" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="发布日期" required>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="生效日期" required>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="政策摘要" required>
            <TextArea rows={4} placeholder="请输入政策法规摘要内容" />
          </Form.Item>
          <Form.Item label="关键词标签">
            <Select mode="tags" placeholder="输入关键词后回车" />
          </Form.Item>
          <Form.Item label="上传附件">
            <Dragger>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持 PDF、Word、Excel 格式文件</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* 政策详情弹窗 */}
      <Modal
        title="政策法规详情"
        open={policyDetailVisible}
        onCancel={() => setPolicyDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setPolicyDetailVisible(false)}>关闭</Button>,
          <Button key="download" icon={<DownloadOutlined />}>下载文档</Button>,
          <Button key="revise" type="primary" icon={<EditOutlined />} onClick={() => setReviseModalVisible(true)}>修订版本</Button>,
        ]}
      >
        {selectedPolicy && (
          <div>
            <Alert
              message={`政策状态：${selectedPolicy.status} | 版本：${selectedPolicy.version} | 浏览量：${selectedPolicy.views}次 | 下载量：${selectedPolicy.downloads}次`}
              type={selectedPolicy.status === '已生效' ? 'success' : selectedPolicy.status === '征求意见中' ? 'warning' : 'info'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16 }}>{selectedPolicy.title}</Text>
            </div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}><Text type="secondary">政策编号：</Text><Text>{selectedPolicy.id}</Text></Col>
              <Col span={6}><Text type="secondary">分类：</Text><Tag color="blue">{selectedPolicy.category}</Tag></Col>
              <Col span={6}><Text type="secondary">发布级别：</Text><Tag>{selectedPolicy.level}</Tag></Col>
              <Col span={6}><Text type="secondary">发布部门：</Text><Text>{selectedPolicy.department}</Text></Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}><Text type="secondary">发布日期：</Text><Text>{selectedPolicy.publishDate}</Text></Col>
              <Col span={8}><Text type="secondary">生效日期：</Text><Text>{selectedPolicy.effectiveDate}</Text></Col>
              <Col span={8}><Text type="secondary">意见反馈：</Text><Text>{selectedPolicy.feedbackCount}条</Text></Col>
            </Row>
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <Text strong>政策摘要</Text>
              <Paragraph style={{ marginTop: 8, fontSize: 14, color: '#555' }}>{selectedPolicy.summary}</Paragraph>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>关键词标签：</Text>
              <Space style={{ marginLeft: 8 }}>
                {selectedPolicy.tags?.map((tag: string) => <Tag key={tag} color="purple">{tag}</Tag>)}
              </Space>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>附件列表：</Text>
              <List
                size="small"
                dataSource={selectedPolicy.attachments}
                renderItem={(file: string) => (
                  <List.Item>
                    <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <Text style={{ fontSize: 13 }}>{file}</Text>
                    <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
                  </List.Item>
                )}
              />
            </div>
            <Divider />
            <div>
              <Text strong>版本历史</Text>
              <Timeline
                style={{ marginTop: 12 }}
                items={selectedPolicy.history?.map((h: any) => ({
                  color: h.version === selectedPolicy.version ? 'blue' : 'gray',
                  children: (
                    <div>
                      <Text strong>{h.version}</Text>
                      <Text type="secondary" style={{ marginLeft: 12 }}>{h.date}</Text>
                      <div style={{ fontSize: 13, color: '#555' }}>{h.desc}</div>
                    </div>
                  )
                }))}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 政策修订弹窗 */}
      <Modal
        title="修订政策版本"
        open={reviseModalVisible}
        onCancel={() => setReviseModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setReviseModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" icon={<EditOutlined />}>提交修订</Button>,
        ]}
      >
        <Form layout="vertical">
          <Alert message="修订政策将创建新版本，原版本将保留在版本历史中" type="info" showIcon style={{ marginBottom: 16 }} />
          <Form.Item label="修订说明" required>
            <TextArea rows={4} placeholder="请详细说明本次修订的内容和原因" />
          </Form.Item>
          <Form.Item label="修订后政策文件">
            <Dragger>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">上传修订后的政策文件</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* 督查详情弹窗 */}
      <Modal
        title="政策执行督查详情"
        open={enforceDetailVisible}
        onCancel={() => setEnforceDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setEnforceDetailVisible(false)}>关闭</Button>,
          <Button key="export" icon={<DownloadOutlined />}>导出报告</Button>,
        ]}
      >
        {selectedEnforce && (
          <div>
            <Alert
              message={`督查结果：${selectedEnforce.status} | 评分：${selectedEnforce.score}分 | 督查人：${selectedEnforce.inspector} | 督查日期：${selectedEnforce.checkDate}`}
              type={selectedEnforce.status === '已达标' ? 'success' : selectedEnforce.status === '基本达标' ? 'warning' : 'error'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ marginBottom: 16 }}>
              <Text strong>督查政策：</Text><Text>{selectedEnforce.policy}</Text>
              <Text style={{ marginLeft: 24 }}><Text strong>物业企业：</Text>{selectedEnforce.company}</Text>
              <Text style={{ marginLeft: 24 }}><Text strong>小区：</Text>{selectedEnforce.community}</Text>
            </div>

            <Divider />
            <Text strong style={{ fontSize: 15 }}>督查项明细</Text>
            <Table
              dataSource={selectedEnforce.checkItems}
              columns={[
                { title: '督查项目', dataIndex: 'item', key: 'item', width: 150 },
                { title: '结果', dataIndex: 'result', key: 'result', width: 100,
                  render: (result: string) => {
                    const colorMap: Record<string, string> = { '优秀': 'success', '合格': 'processing', '基本合格': 'warning', '不合格': 'error' };
                    return <Tag color={colorMap[result]}>{result}</Tag>;
                  }
                },
                { title: '备注', dataIndex: 'remark', key: 'remark' },
              ]}
              pagination={false}
              size="small"
              style={{ marginTop: 12, marginBottom: 16 }}
            />

            {selectedEnforce.issues?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 15 }}>发现问题</Text>
                <List
                  size="small"
                  dataSource={selectedEnforce.issues}
                  renderItem={(issue: string) => (
                    <List.Item>
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                      <Text>{issue}</Text>
                    </List.Item>
                  )}
                  style={{ marginTop: 8 }}
                />
              </div>
            )}

            {selectedEnforce.suggestion && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 15 }}>整改建议</Text>
                <Paragraph style={{ marginTop: 8, color: '#555' }}>{selectedEnforce.suggestion}</Paragraph>
              </div>
            )}

            {selectedEnforce.rectification?.length > 0 && (
              <div>
                <Text strong style={{ fontSize: 15 }}>整改跟踪</Text>
                <Table
                  dataSource={selectedEnforce.rectification}
                  columns={[
                    { title: '整改事项', dataIndex: 'issue', key: 'issue', width: 250 },
                    { title: '整改期限', dataIndex: 'deadline', key: 'deadline', width: 100 },
                    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
                      render: (status: string) => {
                        const colorMap: Record<string, string> = { '已整改': 'success', '整改中': 'processing', '待整改': 'error' };
                        return <Tag color={colorMap[status]}>{status}</Tag>;
                      }
                    },
                    { title: '进度', dataIndex: 'progress', key: 'progress', width: 150,
                      render: (progress: number) => <Progress percent={progress} size="small" />
                    },
                  ]}
                  pagination={false}
                  size="small"
                  style={{ marginTop: 12 }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 提交案例弹窗 */}
      <Modal
        title="提交政策应用案例"
        open={caseModalVisible}
        onCancel={() => setCaseModalVisible(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setCaseModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" icon={<PlusOutlined />}>提交案例</Button>,
        ]}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="案例标题" required>
                <Input placeholder="请输入案例标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="关联政策" required>
                <Select placeholder="请选择关联政策"
                  options={[
                    { value: '物业管理条例', label: '《XX市物业管理条例（2026年修订版）》' },
                    { value: '服务质量分级', label: '《物业服务质量分级管理办法》' },
                    { value: '消防安全', label: '《关于加强住宅小区消防安全管理的通知》' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="物业企业" required>
                <Input placeholder="请输入企业名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="小区名称" required>
                <Input placeholder="请输入小区名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="应用月份" required>
                <DatePicker picker="month" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="案例描述" required>
            <TextArea rows={4} placeholder="请详细描述政策应用的过程和做法" />
          </Form.Item>
          <Form.Item label="应用成效" required>
            <TextArea rows={3} placeholder="请描述政策应用带来的实际成效（如数据、指标变化）" />
          </Form.Item>
          <Form.Item label="标签">
            <Select mode="tags" placeholder="输入标签后回车" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PolicyManagement;
