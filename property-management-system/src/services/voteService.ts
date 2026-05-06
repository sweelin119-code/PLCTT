// 投票表决共享服务层 - 统一业主端和业委会端的数据类型与API

// ===== 投票类型定义（对齐 P0 5.4 数据字段） =====

/** 投票类型 */
export type VoteType = 'general_assembly' | 'committee_election' | 'community_affair';

/** 投票选项 */
export interface VoteOption {
  id: string;
  label: string;
  description?: string;
  count?: number;        // 得票数（投票后可见）
  percentage?: number;   // 得票率
}

/** 投票结果 */
export interface VoteResult {
  totalVotes: number;
  voterRate: number;            // 投票率（百分比）
  options: VoteOption[];        // 各选项得票
  passed: boolean;              // 是否通过
  passThreshold: number;        // 通过阈值（如 0.667 表示 2/3）
}

/** 投票主数据 */
export interface Vote {
  id: string;
  title: string;
  description: string;
  type: VoteType;
  initiator: string;            // 发起方，如"业委会"
  startTime: string;
  endTime: string;
  options: VoteOption[];
  voteType: 'single' | 'multiple';  // 单选/多选
  maxSelections?: number;           // 多选时最大可选数
  totalVoters: number;              // 总投票权户数
  votedCount: number;               // 已投票数
  status: 'pending' | 'active' | 'ended';
  hasVoted: boolean;                // 当前业主是否已投票
  mySelection?: string[];           // 当前业主的选择（已投票时）
  result?: VoteResult;              // 投票结果（结束后可见）
  createdAt: string;
}

/** 投票类型映射 */
export const voteTypeMap: Record<VoteType, { label: string; color: string }> = {
  general_assembly: { label: '业主大会', color: '#1677ff' },
  committee_election: { label: '业委会选举', color: '#722ed1' },
  community_affair: { label: '小区事务', color: '#13c2c2' },
};

/** 投票状态映射 */
export const voteStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: '#d9d9d9' },
  active: { label: '投票中', color: '#52c41a' },
  ended: { label: '已结束', color: '#999' },
};

// ===== Mock 数据 =====

const mockVotes: Vote[] = [
  {
    id: 'v1',
    title: '关于小区绿化改造方案表决',
    description: '业委会拟对小区绿化进行升级改造，方案预算 35 万元，由公共收益支出。现面向全体业主进行表决。',
    type: 'community_affair',
    initiator: '业委会',
    startTime: '2026-05-20 00:00',
    endTime: '2026-06-05 23:59',
    options: [
      { id: 'o1', label: '同意', description: '同意绿化改造方案' },
      { id: 'o2', label: '不同意', description: '不同意绿化改造方案' },
      { id: 'o3', label: '弃权', description: '放弃表决权' },
    ],
    voteType: 'single',
    totalVoters: 500,
    votedCount: 0,
    status: 'active',
    hasVoted: false,
    createdAt: '2026-05-18 10:00',
  },
  {
    id: 'v2',
    title: '2026年第一次业主大会',
    description: '审议2025年物业工作报告，选举新一届业委会成员。',
    type: 'general_assembly',
    initiator: '业委会',
    startTime: '2026-03-01 00:00',
    endTime: '2026-03-15 23:59',
    options: [
      { id: 'o4', label: '审议2025年物业工作报告', description: '由物业公司汇报2025年度工作情况' },
      { id: 'o5', label: '选举新一届业委会成员', description: '从候选人中选举产生新一届业委会' },
    ],
    voteType: 'multiple',
    maxSelections: 2,
    totalVoters: 500,
    votedCount: 423,
    status: 'ended',
    hasVoted: true,
    mySelection: ['o4'],
    result: {
      totalVotes: 423,
      voterRate: 84.6,
      options: [
        { id: 'o4', label: '审议2025年物业工作报告', count: 380, percentage: 89.8 },
        { id: 'o5', label: '选举新一届业委会成员', count: 356, percentage: 84.2 },
      ],
      passed: true,
      passThreshold: 0.5,
    },
    createdAt: '2026-02-20 09:00',
  },
  {
    id: 'v3',
    title: '小区停车管理规则修订表决',
    description: '拟对小区停车管理规则进行修订，主要涉及外来车辆管理、停车费调整等内容。',
    type: 'community_affair',
    initiator: '业委会',
    startTime: '2026-04-01 00:00',
    endTime: '2026-04-15 23:59',
    options: [
      { id: 'o6', label: '同意修订', description: '同意新修订的停车管理规则' },
      { id: 'o7', label: '不同意', description: '不同意修订方案' },
      { id: 'o8', label: '弃权', description: '放弃表决权' },
    ],
    voteType: 'single',
    totalVoters: 500,
    votedCount: 387,
    status: 'ended',
    hasVoted: false,
    result: {
      totalVotes: 387,
      voterRate: 77.4,
      options: [
        { id: 'o6', label: '同意修订', count: 312, percentage: 80.6 },
        { id: 'o7', label: '不同意', count: 52, percentage: 13.4 },
        { id: 'o8', label: '弃权', count: 23, percentage: 6.0 },
      ],
      passed: true,
      passThreshold: 0.5,
    },
    createdAt: '2026-03-28 14:00',
  },
  {
    id: 'v4',
    title: '关于增补业委会候补委员的选举',
    description: '因现有候补委员辞职，需增补一名候补委员。候选人为刘美琴。',
    type: 'committee_election',
    initiator: '业委会',
    startTime: '2026-06-01 00:00',
    endTime: '2026-06-15 23:59',
    options: [
      { id: 'o9', label: '赞成', description: '赞成刘美琴担任候补委员' },
      { id: 'o10', label: '反对', description: '反对刘美琴担任候补委员' },
      { id: 'o11', label: '弃权', description: '放弃表决权' },
    ],
    voteType: 'single',
    totalVoters: 500,
    votedCount: 0,
    status: 'pending',
    hasVoted: false,
    createdAt: '2026-05-25 10:00',
  },
];

// ===== 模拟延迟 =====

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ===== API 函数 =====

/** 获取投票列表 */
export async function getVotes(): Promise<Vote[]> {
  await delay();
  return [...mockVotes];
}

/** 根据ID获取投票详情 */
export async function getVoteById(id: string): Promise<Vote | undefined> {
  await delay();
  return mockVotes.find(v => v.id === id);
}

/** 提交投票 */
export async function submitVote(voteId: string, selectedOptionIds: string[]): Promise<boolean> {
  await delay(500);
  const vote = mockVotes.find(v => v.id === voteId);
  if (!vote) throw new Error('投票不存在');
  if (vote.hasVoted) throw new Error('您已投过票，不可重复投票');
  if (vote.status !== 'active') throw new Error('投票已结束');

  // 模拟更新投票数据
  vote.hasVoted = true;
  vote.mySelection = selectedOptionIds;
  vote.votedCount += 1;

  // 模拟更新选项得票数
  selectedOptionIds.forEach(optId => {
    const opt = vote.options.find(o => o.id === optId);
    if (opt) {
      opt.count = (opt.count || 0) + 1;
    }
  });

  return true;
}

/** 获取投票结果（投票后可看） */
export async function getVoteResult(voteId: string): Promise<VoteResult | undefined> {
  await delay();
  const vote = mockVotes.find(v => v.id === voteId);
  return vote?.result;
}

/** 创建投票（业委会端使用） */
export async function createVote(data: Partial<Vote>): Promise<Vote> {
  await delay(500);
  const newVote: Vote = {
    id: `v${Date.now()}`,
    title: data.title || '',
    description: data.description || '',
    type: data.type || 'community_affair',
    initiator: '业委会',
    startTime: data.startTime || '',
    endTime: data.endTime || '',
    options: data.options || [],
    voteType: data.voteType || 'single',
    totalVoters: data.totalVoters || 500,
    votedCount: 0,
    status: 'pending',
    hasVoted: false,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
  mockVotes.unshift(newVote);
  return newVote;
}

/** 发布投票结果（业委会端使用） */
export async function publishVoteResult(voteId: string): Promise<void> {
  await delay();
  const vote = mockVotes.find(v => v.id === voteId);
  if (!vote) throw new Error('投票不存在');
  if (vote.status !== 'ended') throw new Error('投票尚未结束');

  // 模拟生成结果
  const total = vote.totalVoters;
  const voted = vote.votedCount || Math.floor(total * (0.6 + Math.random() * 0.3));
  const rate = Math.round((voted / total) * 1000) / 10;

  vote.result = {
    totalVotes: voted,
    voterRate: rate,
    options: vote.options.map(opt => ({
      ...opt,
      count: opt.count || Math.floor(voted * Math.random() * 0.8),
      percentage: opt.count ? Math.round((opt.count / voted) * 1000) / 10 : 0,
    })),
    passed: rate >= 50,
    passThreshold: 0.5,
  };
}
