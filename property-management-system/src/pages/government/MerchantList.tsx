import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Input, Select, Button, Descriptions, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { getMerchantList } from '../../services/merchantService';
import type { Merchant, AuditStatus } from '../../services/types';

const auditStatusMap: Record<AuditStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
};

const categoryColors: Record<string, string> = {
  '超市': 'blue',
  '餐饮': 'orange',
  '家政': 'green',
  '维修': 'purple',
  '快递': 'cyan',
  '美容': 'pink',
  '教育': 'geekblue',
  '医疗': 'red',
  '其他': 'default',
};

const MerchantList: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<AuditStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<Merchant | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMerchantList({
        keyword: keyword || undefined,
        auditStatus: (filterStatus as AuditStatus) || undefined,
        category: filterCategory || undefined,
      });
      setMerchants(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      title: '店铺名称',
      dataIndex: 'shopName',
      key: 'shopName',
      width: 180,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '所属公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 180,
    },
    {
      title: '商家类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat: string) => (
        <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>
      ),
    },
    {
      title: '所属物业',
      dataIndex: 'propertyCompanyName',
      key: 'propertyCompanyName',
      width: 160,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 120,
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 100,
      render: (status: AuditStatus) => (
        <Tag color={auditStatusMap[status].color}>{auditStatusMap[status].label}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: Merchant) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setDetailData(record);
            setDetailVisible(true);
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="商家信息查看"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        }
      >
        {/* 搜索栏 */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索店铺名称/公司名称"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={fetchData}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="审核状态"
            value={filterStatus || undefined}
            onChange={v => setFilterStatus(v || '')}
            allowClear
            style={{ width: 120 }}
            options={[
              { label: '待审核', value: 'pending' },
              { label: '已通过', value: 'approved' },
              { label: '已驳回', value: 'rejected' },
            ]}
          />
          <Select
            placeholder="商家类别"
            value={filterCategory || undefined}
            onChange={v => setFilterCategory(v || '')}
            allowClear
            style={{ width: 120 }}
            options={[
              { label: '超市', value: '超市' },
              { label: '餐饮', value: '餐饮' },
              { label: '家政', value: '家政' },
              { label: '维修', value: '维修' },
              { label: '快递', value: '快递' },
              { label: '美容', value: '美容' },
              { label: '教育', value: '教育' },
              { label: '医疗', value: '医疗' },
              { label: '其他', value: '其他' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchData}>
            搜索
          </Button>
        </Space>

        <Table
          dataSource={merchants}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title={`商家详情 - ${detailData?.shopName || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {detailData && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="店铺名称" span={2}>{detailData.shopName}</Descriptions.Item>
            <Descriptions.Item label="所属公司" span={2}>{detailData.companyName}</Descriptions.Item>
            <Descriptions.Item label="统一社会信用代码" span={2}>{detailData.unifiedCode}</Descriptions.Item>
            <Descriptions.Item label="营业执照号" span={2}>{detailData.businessLicense}</Descriptions.Item>
            <Descriptions.Item label="商家类别">{detailData.category}</Descriptions.Item>
            <Descriptions.Item label="所属物业">{detailData.propertyCompanyName || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系人">{detailData.contactPerson}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{detailData.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="店铺地址" span={2}>{detailData.address}</Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag color={auditStatusMap[detailData.auditStatus].color}>
                {auditStatusMap[detailData.auditStatus].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="启用状态">
              <Tag color={detailData.status === 1 ? 'green' : 'red'}>
                {detailData.status === 1 ? '已启用' : '已禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">{detailData.submitTime}</Descriptions.Item>
            <Descriptions.Item label="审核时间">{detailData.auditTime || '-'}</Descriptions.Item>
            {detailData.auditRemark && (
              <Descriptions.Item label="审核意见" span={2}>
                <span style={{ color: detailData.auditStatus === 'rejected' ? '#ff4d4f' : '#52c41a' }}>
                  {detailData.auditRemark}
                </span>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MerchantList;
