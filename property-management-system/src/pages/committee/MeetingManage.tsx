import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, Select, DatePicker, Space, message, Timeline, Descriptions, List, Checkbox, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, PlayCircleOutlined, StopOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getMeetings, createMeeting, updateMeeting, startMeeting, endMeeting, signInMeeting, saveMeetingMinutes, getCommitteeMembers, type Meeting, type CommitteeMember, type MeetingMinutes } from '../../services/committeeService';

const { TextArea } = Input;

const meetingTypeMap: Record<string, { label: string; color: string }> = {
  regular: { label: '例会', color: 'blue' },
  extraordinary: { label: '临时会议', color: 'orange' },
  urgent: { label: '紧急会议', color: 'red' },
};

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待召开', color: 'default' },
  in_progress: { label: '进行中', color: 'processing' },
  ended: { label: '已结束', color: 'success' },
};

const CommitteeMeetingManage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [minutesVisible, setMinutesVisible] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [form] = Form.useForm();
  const [minutesForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, mem] = await Promise.all([getMeetings(), getCommitteeMembers()]);
      setMeetings(m);
      setMembers(mem);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    await createMeeting(values);
    message.success('会议已创建');
    setModalVisible(false);
    loadData();
  };

  const handleStart = async (id: string) => {
    await startMeeting(id);
    message.success('会议已开始');
    loadData();
  };

  const handleEnd = async (id: string) => {
    await endMeeting(id);
    message.success('会议已结束');
    loadData();
  };

  const handleSignIn = async (meetingId: string) => {
    await signInMeeting(meetingId, '1', 'manual');
    message.success('签到成功');
    loadData();
  };

  const handleSaveMinutes = async () => {
    if (!currentMeeting) return;
    const values = await minutesForm.validateFields();
    const minutes: MeetingMinutes = {
      content: values.content,
      resolutions: values.resolutions ? values.resolutions.split('\n').filter(Boolean) : [],
      actionItems: values.actionItems ? values.actionItems.split('\n').filter(Boolean).map((item: string) => ({
        content: item,
        assignee: '',
        deadline: '',
        status: 'pending' as const,
      })) : [],
      confirmedBy: [],
      createdAt: new Date().toISOString(),
    };
    await saveMeetingMinutes(currentMeeting.id, minutes);
    message.success('会议纪要已保存');
    setMinutesVisible(false);
    loadData();
  };

  const showDetail = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setDetailVisible(true);
  };

  const showMinutes = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    minutesForm.setFieldsValue({
      content: meeting.minutes?.content || '',
      resolutions: meeting.minutes?.resolutions?.join('\n') || '',
      actionItems: meeting.minutes?.actionItems?.map(a => a.content).join('\n') || '',
    });
    setMinutesVisible(true);
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || id;

  const columns = [
    { title: '会议主题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 100,
      render: (t: string) => <Tag color={meetingTypeMap[t]?.color}>{meetingTypeMap[t]?.label || t}</Tag>,
    },
    { title: '时间', dataIndex: 'startTime', key: 'startTime', width: 160 },
    { title: '地点', dataIndex: 'location', key: 'location', width: 140, ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label || s}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 280,
      render: (_: any, record: Meeting) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>查看</Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleStart(record.id)}>开始</Button>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { form.setFieldsValue(record); setModalVisible(true); }}>编辑</Button>
            </>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" size="small" icon={<StopOutlined />} onClick={() => handleEnd(record.id)}>结束</Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleSignIn(record.id)}>签到</Button>
          )}
          {record.status === 'ended' && (
            <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => showMinutes(record)}>
              {record.minutes ? '编辑纪要' : '写纪要'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新建会议</Button>
        </div>
        <Table dataSource={meetings} columns={columns} rowKey="id" loading={loading} pagination={false} size="middle" />
      </Card>

      {/* 新建/编辑会议 */}
      <Modal title="新建会议" open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="会议主题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="会议类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'regular', label: '例会' },
              { value: 'extraordinary', label: '临时会议' },
              { value: 'urgent', label: '紧急会议' },
            ]} />
          </Form.Item>
          <Form.Item name="startTime" label="会议时间" rules={[{ required: true }]}>
            <Input placeholder="如：2026-05-10 14:00" />
          </Form.Item>
          <Form.Item name="location" label="会议地点" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="agenda" label="会议议程（每行一项）">
            <TextArea rows={3} placeholder="每行输入一项议程" />
          </Form.Item>
          <Form.Item name="attendees" label="参会人员">
            <Select mode="multiple" placeholder="选择参会成员"
              options={members.filter(m => m.status === 'active').map(m => ({ value: m.id, label: m.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 会议详情 */}
      <Modal title="会议详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentMeeting && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="会议主题" span={2}>{currentMeeting.title}</Descriptions.Item>
            <Descriptions.Item label="类型"><Tag color={meetingTypeMap[currentMeeting.type]?.color}>{meetingTypeMap[currentMeeting.type]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusMap[currentMeeting.status]?.color}>{statusMap[currentMeeting.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="时间">{currentMeeting.startTime}</Descriptions.Item>
            <Descriptions.Item label="地点">{currentMeeting.location}</Descriptions.Item>
            <Descriptions.Item label="议程" span={2}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>{currentMeeting.agenda.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </Descriptions.Item>
            <Descriptions.Item label="参会人员" span={2}>
              {currentMeeting.attendees.map(id => getMemberName(id)).join('、')}
            </Descriptions.Item>
            {currentMeeting.signInRecords.length > 0 && (
              <Descriptions.Item label="签到记录" span={2}>
                <List size="small" dataSource={currentMeeting.signInRecords}
                  renderItem={item => <List.Item>{getMemberName(item.memberId)} - {item.signInTime} ({item.method === 'manual' ? '手动' : '扫码'})</List.Item>}
                />
              </Descriptions.Item>
            )}
            {currentMeeting.minutes && (
              <Descriptions.Item label="会议纪要" span={2}>
                <div dangerouslySetInnerHTML={{ __html: currentMeeting.minutes.content }} />
                {currentMeeting.minutes.resolutions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>决议事项：</strong>
                    <ul>{currentMeeting.minutes.resolutions.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                )}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 会议纪要编辑 */}
      <Modal title="会议纪要" open={minutesVisible} onOk={handleSaveMinutes} onCancel={() => setMinutesVisible(false)} width={700}>
        <Form form={minutesForm} layout="vertical">
          <Form.Item name="content" label="纪要内容" rules={[{ required: true }]}>
            <TextArea rows={6} placeholder="请输入会议纪要内容..." />
          </Form.Item>
          <Form.Item name="resolutions" label="决议事项（每行一项）">
            <TextArea rows={3} placeholder="每行输入一项决议" />
          </Form.Item>
          <Form.Item name="actionItems" label="待办事项（每行一项）">
            <TextArea rows={3} placeholder="每行输入一项待办" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommitteeMeetingManage;
