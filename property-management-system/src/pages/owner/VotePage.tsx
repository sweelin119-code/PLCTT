import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleOutlined, ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import { getVotes, submitVote, voteTypeMap } from '../../services/voteService';
import type { Vote } from '../../services/voteService';

// ===== 工具函数 =====

/** 计算倒计时文本 */
function getCountdown(endTime: string): string {
  const now = Date.now();
  const end = new Date(endTime).getTime();
  const diff = end - now;
  if (diff <= 0) return '已截止';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `剩余 ${days} 天 ${hours} 小时`;
  if (hours > 0) return `剩余 ${hours} 小时 ${mins} 分钟`;
  return `剩余 ${mins} 分钟`;
}

/** 计算参与率 */
function getParticipationRate(vote: Vote): number {
  if (vote.totalVoters === 0) return 0;
  return Math.round((vote.votedCount / vote.totalVoters) * 100);
}

// ===== 主组件 =====

const OwnerVotePage: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'ended'>('active');
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getVotes();
      setVotes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // 每分钟刷新倒计时
    timerRef.current = setInterval(loadData, 60000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 过滤投票列表
  const activeVotes = votes.filter(v => v.status === 'active' && !v.hasVoted);
  const endedVotes = votes.filter(v => v.status === 'ended' || v.hasVoted);

  // 当前显示的列表
  const displayVotes = activeTab === 'active' ? activeVotes : endedVotes;

  // 进入投票详情
  const handleVoteClick = (vote: Vote) => {
    setSelectedVote(vote);
    setSelectedOptions(vote.mySelection || []);
    setShowConfirm(false);
    setShowResult(false);
  };

  // 选择选项（单选/多选）
  const handleOptionSelect = (optionId: string) => {
    if (!selectedVote) return;
    if (selectedVote.voteType === 'single') {
      setSelectedOptions([optionId]);
    } else {
      const max = selectedVote.maxSelections || selectedVote.options.length;
      setSelectedOptions(prev => {
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        }
        if (prev.length >= max) return prev;
        return [...prev, optionId];
      });
    }
  };

  // 确认提交
  const handleConfirmSubmit = () => {
    setShowConfirm(true);
  };

  // 提交投票
  const handleSubmit = async () => {
    if (!selectedVote || selectedOptions.length === 0) return;
    setSubmitting(true);
    try {
      await submitVote(selectedVote.id, selectedOptions);
      setShowConfirm(false);
      setShowResult(true);
      loadData();
    } catch (err: any) {
      alert(err.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    setSelectedVote(null);
    setShowResult(false);
    setShowConfirm(false);
  };

  // ===== 渲染：投票详情页 =====
  if (selectedVote) {
    const vote = selectedVote;
    const isEnded = vote.status === 'ended';
    const canVote = vote.status === 'active' && !vote.hasVoted;

    return (
      <div style={{ padding: '12px 12px 80px', minHeight: '100vh', background: '#f5f5f5' }}>
        {/* 顶部导航 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 16, padding: '8px 0',
        }}>
          <div
            onClick={handleBack}
            style={{ fontSize: 20, cursor: 'pointer', color: '#666', padding: '0 4px' }}
          >←</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f' }}>投票详情</div>
        </div>

        {/* 基本信息卡片 */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: 16,
          marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: voteTypeMap[vote.type]?.color + '18',
              color: voteTypeMap[vote.type]?.color,
              fontWeight: 500,
            }}>
              {voteTypeMap[vote.type]?.label}
            </span>
            {isEnded ? (
              <span style={{ fontSize: 11, color: '#999' }}>已结束</span>
            ) : (
              <span style={{ fontSize: 11, color: '#ff4d4f' }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {getCountdown(vote.endTime)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f', marginBottom: 8 }}>
            {vote.title}
          </div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
            {vote.description}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            发起方：{vote.initiator} | 投票时间：{vote.startTime} ~ {vote.endTime}
          </div>
        </div>

        {/* 投票选项 */}
        {showResult || isEnded || vote.hasVoted ? (
          // 结果展示模式
          <div style={{
            background: '#fff', borderRadius: 12, padding: 16,
            marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 12 }}>
              <BarChartOutlined style={{ marginRight: 6 }} />
              投票结果
            </div>
            {vote.options.map(opt => {
              const count = opt.count || 0;
              const pct = opt.percentage || (vote.votedCount > 0 ? Math.round((count / vote.votedCount) * 100) : 0);
              const isSelected = vote.mySelection?.includes(opt.id);
              return (
                <div key={opt.id} style={{ marginBottom: 12 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 14, color: '#1d1d1f', fontWeight: isSelected ? 600 : 400 }}>
                      {isSelected && <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />}
                      {opt.label}
                    </span>
                    <span style={{ fontSize: 13, color: '#666' }}>{count}票 ({pct}%)</span>
                  </div>
                  <div style={{
                    height: 8, borderRadius: 4, background: '#f0f0f0', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: isSelected ? 'linear-gradient(90deg, #1677ff, #69b1ff)' : 'linear-gradient(90deg, #52c41a, #73d13d)',
                      width: `${pct}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
            {vote.result && (
              <div style={{
                marginTop: 12, padding: 12, borderRadius: 8,
                background: vote.result.passed ? '#f6ffed' : '#fff2f0',
                border: `1px solid ${vote.result.passed ? '#b7eb8f' : '#ffccc7'}`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: vote.result.passed ? '#52c41a' : '#ff4d4f' }}>
                  {vote.result.passed ? '✓ 该投票已通过' : '✗ 该投票未通过'}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  参与率 {vote.result.voterRate}% | 通过阈值 {Math.round(vote.result.passThreshold * 100)}%
                </div>
              </div>
            )}
          </div>
        ) : (
          // 投票模式
          <div style={{
            background: '#fff', borderRadius: 12, padding: 16,
            marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 12 }}>
              {vote.voteType === 'single' ? '请选择一个选项' : `请选择（最多 ${vote.maxSelections || vote.options.length} 项）`}
            </div>
            {vote.options.map(opt => {
              const isSelected = selectedOptions.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => canVote && handleOptionSelect(opt.id)}
                  style={{
                    padding: '12px 16px', marginBottom: 8, borderRadius: 10,
                    border: `1.5px solid ${isSelected ? '#1677ff' : '#e8e8e8'}`,
                    background: isSelected ? '#f0f5ff' : '#fff',
                    cursor: canVote ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: vote.voteType === 'single' ? '50%' : 4,
                    border: `2px solid ${isSelected ? '#1677ff' : '#d9d9d9'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSelected && (
                      <div style={{
                        width: 12, height: 12, borderRadius: vote.voteType === 'single' ? '50%' : 2,
                        background: '#1677ff',
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, color: '#1d1d1f' }}>
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{opt.description}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 提交按钮 */}
            {canVote && (
              <div style={{ marginTop: 16 }}>
                <div
                  onClick={selectedOptions.length > 0 ? handleConfirmSubmit : undefined}
                  style={{
                    padding: '14px 0', borderRadius: 10, textAlign: 'center',
                    background: selectedOptions.length > 0 ? '#1677ff' : '#d9d9d9',
                    color: '#fff', fontSize: 16, fontWeight: 600,
                    cursor: selectedOptions.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >
                  提交投票
                </div>
              </div>
            )}
          </div>
        )}

        {/* 投票规则说明 */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 8 }}>投票规则说明</div>
          <ul style={{ fontSize: 12, color: '#999', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
            <li>仅业主可投票，租客/家属无投票权</li>
            <li>同一房屋多产权人时，仅可投一票</li>
            <li>投票提交后不可修改</li>
            <li>超过截止时间自动结束，不可再投票</li>
            <li>投票过程匿名，仅展示结果不展示个人选择</li>
          </ul>
        </div>

        {/* 二次确认弹窗 */}
        {showConfirm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
          }}>
            <div style={{
              background: '#fff', borderRadius: 16, padding: 24, width: 300,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, marginBottom: 12 }}>📮</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', marginBottom: 8 }}>
                确认提交投票
              </div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
                投票提交后将不可修改，请确认您的选择。
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div
                  onClick={() => setShowConfirm(false)}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 10,
                    border: '1px solid #d9d9d9', textAlign: 'center',
                    fontSize: 14, color: '#666', cursor: 'pointer',
                  }}
                >
                  再想想
                </div>
                <div
                  onClick={handleSubmit}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 10,
                    background: '#1677ff', textAlign: 'center',
                    fontSize: 14, color: '#fff', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {submitting ? '提交中...' : '确认提交'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== 渲染：投票列表页 =====
  return (
    <div style={{ padding: '12px 12px 80px', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 页面标题 */}
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', marginBottom: 16 }}>
        投票表决
      </div>

      {/* 进行中的投票 - 头部醒目 */}
      {activeVotes.length > 0 && (
        <div
          onClick={() => handleVoteClick(activeVotes[0])}
          style={{
            background: 'linear-gradient(135deg, #1677ff, #0958d9)',
            borderRadius: 16, padding: 20, marginBottom: 16,
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.1 }}>📋</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 8 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {getCountdown(activeVotes[0].endTime)}
          </div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
            {activeVotes[0].title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: 'rgba(255,255,255,0.2)', color: '#fff',
            }}>
              {voteTypeMap[activeVotes[0].type]?.label}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              参与率 {getParticipationRate(activeVotes[0])}%
            </span>
          </div>
          <div style={{
            display: 'inline-block', padding: '8px 20px', borderRadius: 20,
            background: 'rgba(255,255,255,0.2)', color: '#fff',
            fontSize: 14, fontWeight: 500,
          }}>
            去投票 →
          </div>
        </div>
      )}

      {/* Tab 切换 */}
      <div style={{
        display: 'flex', marginBottom: 12, background: '#fff',
        borderRadius: 10, padding: 4,
      }}>
        {(['active', 'ended'] as const).map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              borderRadius: 8, fontSize: 14, fontWeight: 500,
              background: activeTab === tab ? '#1677ff' : 'transparent',
              color: activeTab === tab ? '#fff' : '#666',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {tab === 'active' ? '进行中' : '已结束'}
          </div>
        ))}
      </div>

      {/* 投票列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div>
      ) : displayVotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          {activeTab === 'active' ? '暂无进行中的投票' : '暂无已结束的投票'}
        </div>
      ) : (
        displayVotes.map(vote => (
          <div
            key={vote.id}
            onClick={() => handleVoteClick(vote)}
            style={{
              background: '#fff', borderRadius: 12, padding: 16,
              marginBottom: 10, cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4,
                background: voteTypeMap[vote.type]?.color + '18',
                color: voteTypeMap[vote.type]?.color, fontWeight: 500,
              }}>
                {voteTypeMap[vote.type]?.label}
              </span>
              {vote.status === 'active' ? (
                <span style={{ fontSize: 11, color: '#52c41a' }}>
                  <ClockCircleOutlined style={{ marginRight: 2 }} />
                  进行中
                </span>
              ) : (
                <span style={{ fontSize: 11, color: '#999' }}>已结束</span>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>
              {vote.title}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#999' }}>
                {vote.status === 'active'
                  ? getCountdown(vote.endTime)
                  : `${vote.votedCount}/${vote.totalVoters} 户参与`
                }
              </span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: '#1677ff',
              }}>
                {vote.hasVoted ? '已投票' : vote.status === 'active' ? '去投票' : '查看结果'}
                <span style={{ fontSize: 12 }}>→</span>
              </div>
            </div>
            {/* 进度条（已结束显示参与率） */}
            {vote.status === 'ended' && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  height: 4, borderRadius: 2, background: '#f0f0f0', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: 'linear-gradient(90deg, #1677ff, #69b1ff)',
                    width: `${getParticipationRate(vote)}%`,
                  }} />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default OwnerVotePage;
