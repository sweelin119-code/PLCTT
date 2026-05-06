import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Select, Radio, Space, Modal, Empty, Tag, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, CopyOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { AssemblyTopic } from '../services/committeeService';

interface TopicEditorProps {
  value?: AssemblyTopic[];
  onChange?: (topics: AssemblyTopic[]) => void;
}

const defaultOptions = ['同意', '不同意', '弃权'];

const thresholdOptions = [
  { value: 0.5, label: '1/2 (50%)' },
  { value: 0.6, label: '3/5 (60%)' },
  { value: 0.667, label: '2/3 (66.7%)' },
  { value: 0.75, label: '3/4 (75%)' },
  { value: 0.8, label: '4/5 (80%)' },
];

const templates = [
  {
    name: '同意/不同意/弃权',
    options: ['同意', '不同意', '弃权'],
    voteType: 'single' as const,
    passThreshold: 0.5,
  },
  {
    name: '赞成/反对/弃权',
    options: ['赞成', '反对', '弃权'],
    voteType: 'single' as const,
    passThreshold: 0.5,
  },
  {
    name: '候选人选举',
    options: ['候选人A', '候选人B', '候选人C'],
    voteType: 'multiple' as const,
    passThreshold: 0.5,
  },
  {
    name: '满意度评价',
    options: ['非常满意', '满意', '一般', '不满意'],
    voteType: 'single' as const,
    passThreshold: 0.5,
  },
];

let topicIdCounter = Date.now();

const createEmptyTopic = (): AssemblyTopic => ({
  id: `t${topicIdCounter++}`,
  title: '',
  description: '',
  options: [...defaultOptions],
  voteType: 'single',
  passThreshold: 0.5,
});

const TopicEditor: React.FC<TopicEditorProps> = ({ value, onChange }) => {
  const [topics, setTopics] = useState<AssemblyTopic[]>(value && value.length > 0 ? value : [createEmptyTopic()]);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 同步外部 value
  useEffect(() => {
    if (value && value.length > 0) {
      setTopics(value);
    }
  }, [value]);

  const notifyChange = useCallback((newTopics: AssemblyTopic[]) => {
    setTopics(newTopics);
    onChange?.(newTopics);
  }, [onChange]);

  // 更新单个议题的字段
  const updateTopic = (index: number, field: keyof AssemblyTopic, val: any) => {
    const newTopics = topics.map((t, i) => (i === index ? { ...t, [field]: val } : t));
    notifyChange(newTopics);
  };

  // 更新选项
  const updateOption = (topicIndex: number, optionIndex: number, val: string) => {
    const newTopics = topics.map((t, i) => {
      if (i !== topicIndex) return t;
      const newOptions = [...t.options];
      newOptions[optionIndex] = val;
      return { ...t, options: newOptions };
    });
    notifyChange(newTopics);
  };

  // 添加选项
  const addOption = (topicIndex: number) => {
    const newTopics = topics.map((t, i) => {
      if (i !== topicIndex) return t;
      return { ...t, options: [...t.options, `选项${t.options.length + 1}`] };
    });
    notifyChange(newTopics);
  };

  // 删除选项
  const removeOption = (topicIndex: number, optionIndex: number) => {
    const topic = topics[topicIndex];
    if (topic.options.length <= 2) {
      message.warning('至少保留2个选项');
      return;
    }
    const newTopics = topics.map((t, i) => {
      if (i !== topicIndex) return t;
      const newOptions = t.options.filter((_, idx) => idx !== optionIndex);
      return { ...t, options: newOptions };
    });
    notifyChange(newTopics);
  };

  // 添加议题
  const addTopic = () => {
    notifyChange([...topics, createEmptyTopic()]);
  };

  // 删除议题
  const removeTopic = (index: number) => {
    if (topics.length <= 1) {
      message.warning('至少保留1个议题');
      return;
    }
    notifyChange(topics.filter((_, i) => i !== index));
  };

  // 上移议题
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newTopics = [...topics];
    [newTopics[index - 1], newTopics[index]] = [newTopics[index], newTopics[index - 1]];
    notifyChange(newTopics);
  };

  // 下移议题
  const moveDown = (index: number) => {
    if (index === topics.length - 1) return;
    const newTopics = [...topics];
    [newTopics[index], newTopics[index + 1]] = [newTopics[index + 1], newTopics[index]];
    notifyChange(newTopics);
  };

  // 应用模板
  const applyTemplate = (templateIndex: number) => {
    const tmpl = templates[templateIndex];
    const newTopic: AssemblyTopic = {
      id: `t${topicIdCounter++}`,
      title: '',
      description: '',
      options: [...tmpl.options],
      voteType: tmpl.voteType,
      passThreshold: tmpl.passThreshold,
    };
    notifyChange([...topics, newTopic]);
  };

  // 复制议题
  const duplicateTopic = (index: number) => {
    const source = topics[index];
    const newTopic: AssemblyTopic = {
      ...source,
      id: `t${topicIdCounter++}`,
      title: source.title ? `${source.title}(副本)` : '',
    };
    const newTopics = [...topics];
    newTopics.splice(index + 1, 0, newTopic);
    notifyChange(newTopics);
  };

  return (
    <div>
      {/* 工具栏 */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          placeholder="📋 选择模板快速添加"
          style={{ width: 200 }}
          options={templates.map((t, i) => ({ value: i, label: t.name }))}
          onChange={applyTemplate}
          value={undefined}
          allowClear
        />
        <Button type="dashed" icon={<PlusOutlined />} onClick={addTopic} size="small">
          添加议题
        </Button>
        <Button icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)} size="small" disabled={topics.length === 0}>
          预览投票界面
        </Button>
        <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
          共 {topics.length} 个议题
        </span>
      </div>

      {/* 议题列表 */}
      {topics.length === 0 ? (
        <Empty description={'暂无议题，请点击"添加议题"或选择模板'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        topics.map((topic, index) => (
          <Card
            key={topic.id}
            size="small"
            style={{ marginBottom: 12, borderLeft: '3px solid #1677ff' }}
            title={
              <Space>
                <span style={{ fontWeight: 600, color: '#1677ff' }}>议题 #{index + 1}</span>
                <Tag color={topic.voteType === 'multiple' ? 'purple' : 'blue'}>
                  {topic.voteType === 'multiple' ? '多选' : '单选'}
                </Tag>
                <Tag>{Math.round(topic.passThreshold * 100)}%通过</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button type="text" size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => moveUp(index)} />
                <Button type="text" size="small" icon={<ArrowDownOutlined />} disabled={index === topics.length - 1} onClick={() => moveDown(index)} />
                <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => duplicateTopic(index)} />
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeTopic(index)} />
              </Space>
            }
          >
            {/* 标题 */}
            <div style={{ marginBottom: 8 }}>
              <Input
                placeholder="请输入议题标题（如：是否同意绿化改造方案）"
                value={topic.title}
                onChange={(e) => updateTopic(index, 'title', e.target.value)}
                status={!topic.title ? 'error' : undefined}
              />
              {!topic.title && <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 2 }}>议题标题不能为空</div>}
            </div>

            {/* 描述 */}
            <div style={{ marginBottom: 8 }}>
              <Input.TextArea
                rows={2}
                placeholder="议题补充说明（可选）"
                value={topic.description}
                onChange={(e) => updateTopic(index, 'description', e.target.value)}
              />
            </div>

            {/* 选项列表 */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#666' }}>投票选项：</div>
              {topic.options.map((opt, optIdx) => (
                <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#999', minWidth: 20 }}>{optIdx + 1}.</span>
                  <Input
                    size="small"
                    value={opt}
                    onChange={(e) => updateOption(index, optIdx, e.target.value)}
                    placeholder={`选项 ${optIdx + 1}`}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeOption(index, optIdx)}
                    disabled={topic.options.length <= 2}
                  />
                </div>
              ))}
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => addOption(index)}>
                添加选项
              </Button>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* 投票类型 & 阈值 */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: 13, color: '#666', marginRight: 8 }}>投票类型：</span>
                <Radio.Group
                  value={topic.voteType}
                  onChange={(e) => updateTopic(index, 'voteType', e.target.value)}
                  size="small"
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="single">单选</Radio.Button>
                  <Radio.Button value="multiple">多选</Radio.Button>
                </Radio.Group>
              </div>
              <div>
                <span style={{ fontSize: 13, color: '#666', marginRight: 8 }}>通过阈值：</span>
                <Select
                  value={topic.passThreshold}
                  onChange={(val) => updateTopic(index, 'passThreshold', val)}
                  size="small"
                  style={{ width: 130 }}
                  options={thresholdOptions}
                />
              </div>
            </div>
          </Card>
        ))
      )}

      {/* 预览弹窗 */}
      <Modal
        title="👁 业主端投票界面预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          {topics.length === 0 ? (
            <Empty description="暂无议题" />
          ) : (
            topics.map((topic, index) => (
              <Card
                key={topic.id}
                size="small"
                style={{ marginBottom: 12 }}
                title={
                  <Space>
                    <span style={{ fontWeight: 600 }}>{topic.title || `议题 ${index + 1}`}</span>
                    <Tag color={topic.voteType === 'multiple' ? 'purple' : 'blue'} style={{ fontSize: 11 }}>
                      {topic.voteType === 'multiple' ? '多选' : '单选'}
                    </Tag>
                  </Space>
                }
              >
                {topic.description && (
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{topic.description}</div>
                )}
                {topic.voteType === 'single' ? (
                  <Radio.Group style={{ width: '100%' }}>
                    {topic.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ padding: '8px 12px', border: '1px solid #e8e8e8', borderRadius: 6, marginBottom: 8 }}>
                        <Radio value={opt} disabled>{opt}</Radio>
                      </div>
                    ))}
                  </Radio.Group>
                ) : (
                  <div>
                    {topic.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ padding: '8px 12px', border: '1px solid #e8e8e8', borderRadius: 6, marginBottom: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'not-allowed' }}>
                          <input type="checkbox" disabled style={{ width: 16, height: 16 }} />
                          <span>{opt}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#999', marginTop: 8, textAlign: 'right' }}>
                  通过阈值：{Math.round(topic.passThreshold * 100)}%
                </div>
              </Card>
            ))
          )}
          <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: '#999' }}>
            ⚠️ 以上为预览效果，实际投票界面以业主端显示为准
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TopicEditor;
