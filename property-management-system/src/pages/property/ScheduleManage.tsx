import React, { useState, useEffect, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select, Space,
  Typography, message, Badge, Descriptions, Tabs, DatePicker,
} from 'antd';
import {
  PlusOutlined, ScheduleOutlined, TeamOutlined,
  SwapOutlined, CheckCircleOutlined, BarChartOutlined,
  LeftOutlined, RightOutlined, CopyOutlined, ThunderboltOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  getStaffList, getScheduleTemplates, createScheduleTemplate,
  getSchedules, createSchedule, getHandoverRecords, confirmHandover,
  getDutyStats,
  type ScheduleTemplate, type DutySchedule, type HandoverRecord, type DutyStats,
} from '../../services/dailyService';

dayjs.extend(isoWeek);

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const shiftConfig: Record<string, { color: string; label: string }> = {
  morning: { color: 'blue', label: '早班' },
  afternoon: { color: 'orange', label: '中班' },
  night: { color: 'purple', label: '晚班' },
};

const shiftOrder = ['morning', 'afternoon', 'night'];

const ScheduleManage: React.FC = () => {
  const [staffList, setStaffList] = useState<{ id: number; name: string }[]>([]);
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [schedules, setSchedules] = useState<DutySchedule[]>([]);
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [dutyStats, setDutyStats] = useState<DutyStats[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => dayjs().startOf('isoWeek'));

  // 弹窗状态
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [quickModalVisible, setQuickModalVisible] = useState(false);
  const [handoverModalVisible, setHandoverModalVisible] = useState(false);
  const [currentHandover, setCurrentHandover] = useState<HandoverRecord | null>(null);
  const [templateForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [quickForm] = Form.useForm();

  // 点击格子排班弹窗
  const [cellModalVisible, setCellModalVisible] = useState(false);
  const [cellDate, setCellDate] = useState<string>('');
  const [cellShift, setCellShift] = useState<string>('morning');
  const [cellStaffIds, setCellStaffIds] = useState<number[]>([]);
  const [cellLeaderId, setCellLeaderId] = useState<number>(0);

  const fetchData = async () => {
    try {
      const [staff, tmpls, scheds, hand] = await Promise.all([
        getStaffList(),
        getScheduleTemplates(),
        getSchedules(currentWeekStart.year(), currentWeekStart.month() + 1),
        getHandoverRecords(),
      ]);
      setStaffList(staff);
      setTemplates(tmpls);
      setSchedules(scheds);
      setHandovers(hand);
    } catch (err) {
      console.error('Failed to fetch schedule data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentWeekStart]);

  const handleLoadStats = async (month: string) => {
    const stats = await getDutyStats(month);
    setDutyStats(stats);
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      handleLoadStats(month);
    }
  }, [activeTab]);

  // ---- 周视图相关 ----
  const weekDays = useMemo(() => {
    const days: Dayjs[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(currentWeekStart.add(i, 'day'));
    }
    return days;
  }, [currentWeekStart]);

  const weekTitle = `${currentWeekStart.format('MM月DD日')} - ${currentWeekStart.add(6, 'day').format('MM月DD日')}`;

  const prevWeek = () => setCurrentWeekStart(prev => prev.subtract(1, 'week'));
  const nextWeek = () => setCurrentWeekStart(prev => prev.add(1, 'week'));
  const goToday = () => setCurrentWeekStart(dayjs().startOf('isoWeek'));

  // 获取某天某班次的排班
  const getScheduleForCell = (date: string, shift: string): DutySchedule | undefined => {
    return schedules.find(s => s.date === date && s.shift === shift);
  };

  // 点击格子打开排班弹窗
  const handleCellClick = (date: string, shift: string) => {
    const existing = getScheduleForCell(date, shift);
    setCellDate(date);
    setCellShift(shift);
    if (existing) {
      setCellStaffIds(existing.staffIds);
      setCellLeaderId(existing.leaderId);
    } else {
      setCellStaffIds([]);
      setCellLeaderId(0);
    }
    setCellModalVisible(true);
  };

  // 保存格子排班
  const handleCellSave = async () => {
    const existing = getScheduleForCell(cellDate, cellShift);
    if (existing) {
      // 更新现有排班（模拟）
      existing.staffIds = cellStaffIds;
      existing.leaderId = cellLeaderId;
      message.success('排班已更新');
    } else {
      await createSchedule({
        date: cellDate,
        shift: cellShift as 'morning' | 'afternoon' | 'night',
        staffIds: cellStaffIds,
        leaderId: cellLeaderId,
        createdBy: '管理员',
      });
      message.success('排班已添加');
    }
    setCellModalVisible(false);
    fetchData();
  };

  // 清除某格子的排班
  const handleCellClear = () => {
    const existing = getScheduleForCell(cellDate, cellShift);
    if (existing) {
      const idx = schedules.findIndex(s => s.id === existing.id);
      if (idx >= 0) schedules.splice(idx, 1);
      message.success('排班已清除');
    }
    setCellModalVisible(false);
    fetchData();
  };

  // 复制某天的排班到其他天
  const handleCopyDay = (sourceDate: string) => {
    const daySchedules = schedules.filter(s => s.date === sourceDate);
    if (daySchedules.length === 0) {
      message.warning('该日期没有排班');
      return;
    }

    Modal.confirm({
      title: '复制排班',
      content: `将 ${sourceDate} 的排班复制到本周其他日期？`,
      onOk: async () => {
        for (const day of weekDays) {
          const dateStr = day.format('YYYY-MM-DD');
          if (dateStr === sourceDate) continue;
          for (const sched of daySchedules) {
            const existing = getScheduleForCell(dateStr, sched.shift);
            if (!existing) {
              await createSchedule({
                date: dateStr,
                shift: sched.shift,
                staffIds: [...sched.staffIds],
                leaderId: sched.leaderId,
                createdBy: '管理员',
              });
            }
          }
        }
        message.success('排班已复制');
        fetchData();
      },
    });
  };

  // ---- 模板相关 ----
  const handleAddTemplate = async () => {
    const values = await templateForm.validateFields();
    await createScheduleTemplate(values);
    message.success('排班模板已创建');
    setTemplateModalVisible(false);
    templateForm.resetFields();
    fetchData();
  };

  // 从模板快速排班
  const handleQuickSchedule = async () => {
    const values = await quickForm.validateFields();
    const template = templates.find(t => t.id === values.templateId);
    if (!template) return;

    const startDate = values.dateRange[0].format('YYYY-MM-DD');
    const endDate = values.dateRange[1].format('YYYY-MM-DD');
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    let count = 0;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      const existing = getScheduleForCell(dateStr, template.shiftType);
      if (!existing) {
        await createSchedule({
          date: dateStr,
          shift: template.shiftType,
          staffIds: [...template.staffIds],
          leaderId: template.leaderId,
          createdBy: '管理员',
        });
        count++;
      }
      current = current.add(1, 'day');
    }

    message.success(`已从模板「${template.name}」生成 ${count} 天排班`);
    setQuickModalVisible(false);
    quickForm.resetFields();
    fetchData();
  };

  // ---- 交接班相关 ----
  const handleConfirmHandover = async (record: HandoverRecord) => {
    setCurrentHandover(record);
    setHandoverModalVisible(true);
  };

  const doConfirmHandover = async () => {
    if (!currentHandover) return;
    await confirmHandover(currentHandover.id, '管理员');
    message.success('交接班已确认');
    setHandoverModalVisible(false);
    fetchData();
  };

  // ---- 批量排班 ----
  const handleBatchSchedule = async () => {
    const values = await batchForm.validateFields();
    const { dateRange, morningStaff, afternoonStaff, nightStaff, morningLeader, afternoonLeader, nightLeader } = values;

    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    let count = 0;

    const shifts = [
      { shift: 'morning' as const, staffIds: morningStaff || [], leaderId: morningLeader },
      { shift: 'afternoon' as const, staffIds: afternoonStaff || [], leaderId: afternoonLeader },
      { shift: 'night' as const, staffIds: nightStaff || [], leaderId: nightLeader },
    ];

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      for (const s of shifts) {
        if (s.staffIds.length > 0) {
          const existing = getScheduleForCell(dateStr, s.shift);
          if (!existing) {
            await createSchedule({
              date: dateStr,
              shift: s.shift,
              staffIds: s.staffIds,
              leaderId: s.leaderId,
              createdBy: '管理员',
            });
            count++;
          }
        }
      }
      current = current.add(1, 'day');
    }

    message.success(`批量排班完成，共生成 ${count} 条记录`);
    setBatchModalVisible(false);
    batchForm.resetFields();
    fetchData();
  };

  // ---- 渲染周视图 ----
  const renderWeekView = () => (
    <div>
      {/* 周导航 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<LeftOutlined />} onClick={prevWeek} size="small" />
          <Button onClick={goToday} size="small">今天</Button>
          <Button icon={<RightOutlined />} onClick={nextWeek} size="small" />
          <Text strong style={{ fontSize: 16, minWidth: 200, display: 'inline-block', textAlign: 'center' }}>
            {weekTitle}
          </Text>
        </Space>
        <Space>
          <Button icon={<ThunderboltOutlined />} onClick={() => setQuickModalVisible(true)} size="small">
            模板快速排班
          </Button>
          <Button icon={<CopyOutlined />} onClick={() => {
            const today = dayjs().format('YYYY-MM-DD');
            const hasSched = schedules.some(s => s.date === today);
            if (hasSched) {
              handleCopyDay(today);
            } else {
              // 找本周第一个有排班的日期
              for (const day of weekDays) {
                const ds = day.format('YYYY-MM-DD');
                if (schedules.some(s => s.date === ds)) {
                  handleCopyDay(ds);
                  return;
                }
              }
              message.warning('本周暂无排班可复制');
            }
          }} size="small">
            复制排班
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setBatchModalVisible(true)} size="small">
            批量排班
          </Button>
        </Space>
      </div>

      {/* 周视图表格 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ width: 70, padding: '8px 4px', border: '1px solid #f0f0f0', background: '#fafafa', textAlign: 'center' }}>
                班次
              </th>
              {weekDays.map((day, idx) => {
                const isToday = day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
                const dateStr = day.format('YYYY-MM-DD');
                const hasAny = schedules.some(s => s.date === dateStr);
                return (
                  <th key={idx} style={{
                    padding: '8px 4px', border: '1px solid #f0f0f0',
                    background: isToday ? '#e6f7ff' : '#fafafa',
                    textAlign: 'center', position: 'relative',
                    minWidth: 90,
                  }}>
                    <div style={{ fontSize: 12, color: '#999' }}>{day.format('ddd')}</div>
                    <div style={{ fontSize: 14, fontWeight: isToday ? 'bold' : 'normal', color: isToday ? '#1890ff' : undefined }}>
                      {day.format('DD')}
                    </div>
                    {hasAny && (
                      <Button
                        type="link"
                        size="small"
                        icon={<CopyOutlined />}
                        style={{ position: 'absolute', top: 2, right: 2, fontSize: 10, color: '#bbb' }}
                        onClick={(e) => { e.stopPropagation(); handleCopyDay(dateStr); }}
                        title="复制此日排班"
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shiftOrder.map(shift => {
              const cfg = shiftConfig[shift];
              return (
                <tr key={shift}>
                  <td style={{
                    padding: '8px 4px', border: '1px solid #f0f0f0',
                    textAlign: 'center', fontWeight: 500, background: '#fafafa',
                  }}>
                    <Tag color={cfg.color}>{cfg.label}</Tag>
                  </td>
                  {weekDays.map((day, idx) => {
                    const dateStr = day.format('YYYY-MM-DD');
                    const sched = getScheduleForCell(dateStr, shift);
                    const staffNames = sched
                      ? sched.staffIds.map(id => staffList.find(s => s.id === id)?.name || id).join('、')
                      : '';
                    const leaderName = sched
                      ? staffList.find(s => s.id === sched.leaderId)?.name || ''
                      : '';
                    return (
                      <td
                        key={idx}
                        onClick={() => handleCellClick(dateStr, shift)}
                        style={{
                          padding: 6, border: '1px solid #f0f0f0',
                          cursor: 'pointer', verticalAlign: 'top',
                          minHeight: 60, height: 60,
                          background: sched ? '#f6ffed' : '#fff',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => { if (!sched) e.currentTarget.style.background = '#f5f5f5'; }}
                        onMouseLeave={(e) => { if (!sched) e.currentTarget.style.background = '#fff'; }}
                      >
                        {sched ? (
                          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                            <div style={{ fontWeight: 500 }}>
                              {leaderName && <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', marginRight: 2 }}>组长</Tag>}
                              <span>{staffNames}</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center', lineHeight: '48px' }}>
                            +
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ---- 模板表格列 ----
  const templateColumns = [
    { title: '模板名称', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: '班次', dataIndex: 'shiftType', key: 'shiftType', width: 80,
      render: (t: string) => {
        const cfg = shiftConfig[t] || { color: 'default', label: t };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '值班人员', key: 'staff', width: 200,
      render: (_: any, record: ScheduleTemplate) =>
        record.staffIds.map(id => staffList.find(s => s.id === id)?.name || id).join('、'),
    },
    {
      title: '值班组长', key: 'leader', width: 100,
      render: (_: any, record: ScheduleTemplate) =>
        staffList.find(s => s.id === record.leaderId)?.name || record.leaderId,
    },
  ];

  // ---- 交接班表格列 ----
  const handoverColumns = [
    { title: '交班人', dataIndex: 'handoverStaff', key: 'handoverStaff', width: 80 },
    { title: '接班人', dataIndex: 'takeoverStaff', key: 'takeoverStaff', width: 80 },
    { title: '交班时间', dataIndex: 'handoverTime', key: 'handoverTime', width: 150 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => s === 'confirmed'
        ? <Tag color="success">已确认</Tag>
        : <Tag color="warning">待确认</Tag>,
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: any, record: HandoverRecord) => (
        record.status === 'pending' ? (
          <Button type="link" size="small" icon={<CheckCircleOutlined />}
            onClick={() => handleConfirmHandover(record)}>
            确认交接
          </Button>
        ) : (
          <Tag color="success">已完成</Tag>
        )
      ),
    },
  ];

  // ---- 统计表格列 ----
  const statsColumns = [
    { title: '姓名', dataIndex: 'staffName', key: 'staffName', width: 80 },
    { title: '值班天数', dataIndex: 'totalDutyDays', key: 'totalDutyDays', width: 80 },
    {
      title: '出勤率', dataIndex: 'attendanceRate', key: 'attendanceRate', width: 80,
      render: (rate: number) => <span style={{ color: rate >= 90 ? '#3f8600' : '#cf1322' }}>{rate}%</span>,
    },
    { title: '迟到次数', dataIndex: 'lateCount', key: 'lateCount', width: 80 },
    { title: '早退次数', dataIndex: 'earlyLeaveCount', key: 'earlyLeaveCount', width: 80 },
  ];

  const tabItems = [
    { key: 'calendar', label: <><ScheduleOutlined /> 排班视图</> },
    { key: 'template', label: <><TeamOutlined /> 排班模板</> },
    { key: 'handover', label: <><SwapOutlined /> 交接班记录</> },
    { key: 'stats', label: <><BarChartOutlined /> 值班统计</> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>值班管理</Title>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => setTemplateModalVisible(true)}>
            新建模板
          </Button>
        </Space>
      </div>

      <Card size="small">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        {activeTab === 'calendar' && renderWeekView()}

        {activeTab === 'template' && (
          <Table
            dataSource={templates}
            columns={templateColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}

        {activeTab === 'handover' && (
          <Table
            dataSource={handovers}
            columns={handoverColumns}
            rowKey="id"
            pagination={false}
            size="small"
            expandable={{
              expandedRowRender: (record: HandoverRecord) => (
                <div style={{ padding: 8 }}>
                  <Text strong>交接事项：</Text>
                  <ul style={{ margin: '8px 0' }}>
                    {record.items.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>
                        <Space>
                          <Badge status={item.resolved ? 'success' : 'processing'} />
                          <span>{item.content}</span>
                          <Tag color={item.priority === 'urgent' ? 'red' : item.priority === 'important' ? 'orange' : 'default'}>
                            {item.priority === 'urgent' ? '紧急' : item.priority === 'important' ? '重要' : '普通'}
                          </Tag>
                        </Space>
                      </li>
                    ))}
                  </ul>
                  {record.pendingTodos.length > 0 && (
                    <>
                      <Text strong>待办移交：</Text>
                      <ul style={{ margin: '8px 0' }}>
                        {record.pendingTodos.map((todo, idx) => (
                          <li key={idx}>{todo}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ),
            }}
          />
        )}

        {activeTab === 'stats' && (
          <Table
            dataSource={dutyStats}
            columns={statsColumns}
            rowKey="staffId"
            pagination={false}
            size="small"
          />
        )}
      </Card>

      {/* 点击格子排班弹窗 */}
      <Modal
        title={`排班设置 - ${cellDate} ${shiftConfig[cellShift]?.label || cellShift}`}
        open={cellModalVisible}
        onOk={handleCellSave}
        onCancel={() => setCellModalVisible(false)}
        okText="保存"
        cancelText="取消"
        footer={(_, { OkBtn, CancelBtn }) => (
          <Space>
            <Button danger onClick={handleCellClear} icon={<DeleteOutlined />}>
              清除排班
            </Button>
            <CancelBtn />
            <OkBtn />
          </Space>
        )}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>值班人员</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder="选择值班人员"
              value={cellStaffIds}
              onChange={setCellStaffIds}
              options={staffList.map(s => ({ value: s.id, label: s.name }))}
            />
          </div>
          <div>
            <Text strong>值班组长</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="选择值班组长"
              value={cellLeaderId || undefined}
              onChange={setCellLeaderId}
              options={staffList.map(s => ({ value: s.id, label: s.name }))}
              allowClear
            />
          </div>
        </div>
      </Modal>

      {/* 新建排班模板弹窗 */}
      <Modal
        title="新建排班模板"
        open={templateModalVisible}
        onOk={handleAddTemplate}
        onCancel={() => { setTemplateModalVisible(false); templateForm.resetFields(); }}
      >
        <Form form={templateForm} layout="vertical">
          <Form.Item name="name" label="模板名称" rules={[{ required: true }]}>
            <Input placeholder="例如：工作日早班" />
          </Form.Item>
          <Form.Item name="shiftType" label="班次" rules={[{ required: true }]}>
            <Select options={[
              { value: 'morning', label: '早班' },
              { value: 'afternoon', label: '中班' },
              { value: 'night', label: '晚班' },
            ]} />
          </Form.Item>
          <Form.Item name="staffIds" label="值班人员" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="选择值班人员"
              options={staffList.map(s => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="leaderId" label="值班组长" rules={[{ required: true }]}>
            <Select placeholder="选择值班组长"
              options={staffList.map(s => ({ value: s.id, label: s.name }))} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量排班弹窗 */}
      <Modal
        title="批量排班"
        open={batchModalVisible}
        onOk={handleBatchSchedule}
        onCancel={() => { setBatchModalVisible(false); batchForm.resetFields(); }}
        width={600}
      >
        <Form form={batchForm} layout="vertical">
          <Form.Item name="dateRange" label="排班日期范围" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Card size="small" title="早班设置" style={{ marginBottom: 12 }}>
            <Form.Item name="morningStaff" label="值班人员">
              <Select mode="multiple" placeholder="选择人员"
                options={staffList.map(s => ({ value: s.id, label: s.name }))} />
            </Form.Item>
            <Form.Item name="morningLeader" label="值班组长">
              <Select placeholder="选择组长" allowClear
                options={staffList.map(s => ({ value: s.id, label: s.name }))} />
            </Form.Item>
          </Card>
          <Card size="small" title="中班设置" style={{ marginBottom: 12 }}>
            <Form.Item name="afternoonStaff" label="值班人员">
              <Select mode="multiple" placeholder="选择人员"
                options={staffList.map(s => ({ value: s.id, label: s.name }))} />
            </Form.Item>
            <Form.Item name="afternoonLeader" label="值班组长">
              <Select placeholder="选择组长" allowClear
                options={staffList.map(s => ({ value: s.id, label: s.name }))} />
            </Form.Item>
          </Card>
          <Card size="small" title="晚班设置">
            <Form.Item name="nightStaff" label="值班人员">
              <Select mode="multiple" placeholder="选择人员"
                options={staffList.map(s => ({ value: s.id, label: s.name }))} />
            </Form.Item>
            <Form.Item name="nightLeader" label="值班组长">
              <Select placeholder="选择组长" allowClear
                options={staffList.map(s => ({ value: s.id, label: s.name }))} />
            </Form.Item>
          </Card>
        </Form>
      </Modal>

      {/* 模板快速排班弹窗 */}
      <Modal
        title="模板快速排班"
        open={quickModalVisible}
        onOk={handleQuickSchedule}
        onCancel={() => { setQuickModalVisible(false); quickForm.resetFields(); }}
      >
        <Form form={quickForm} layout="vertical">
          <Form.Item name="templateId" label="选择模板" rules={[{ required: true }]}>
            <Select placeholder="选择排班模板"
              options={templates.map(t => ({ value: t.id, label: `${t.name} (${shiftConfig[t.shiftType]?.label})` }))} />
          </Form.Item>
          <Form.Item name="dateRange" label="排班日期范围" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 确认交接班弹窗 */}
      <Modal
        title="确认交接班"
        open={handoverModalVisible}
        onOk={doConfirmHandover}
        onCancel={() => setHandoverModalVisible(false)}
      >
        {currentHandover && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="交班人">{currentHandover.handoverStaff}</Descriptions.Item>
            <Descriptions.Item label="接班人">{currentHandover.takeoverStaff}</Descriptions.Item>
            <Descriptions.Item label="交班时间">{currentHandover.handoverTime}</Descriptions.Item>
            <Descriptions.Item label="交接事项">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {currentHandover.items.map((item, idx) => (
                  <li key={idx}>{item.content}</li>
                ))}
              </ul>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ScheduleManage;
