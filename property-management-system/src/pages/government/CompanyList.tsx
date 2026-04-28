import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Input, Select, Button, Descriptions, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { getCompanyList } from '../../services/companyService';
import type { PropertyCompany, QualLevel } from '../../services/types';

const qualLevelColors: Record<QualLevel, string> = {
  '一级': 'red',
  '二级': 'orange',
  '三级': 'blue',
  '暂定三级': 'default',
};

const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<PropertyCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [qualLevel, setQualLevel] = useState<QualLevel | ''>('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<PropertyCompany | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCompanyList({
        keyword: keyword || undefined,
        qualLevel: (qualLevel as QualLevel) || undefined,
      });
      setCompanies(data);
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
      title: '企业名称',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 200,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '统一社会信用代码',
      dataIndex: 'unifiedCode',
      key: 'unifiedCode',
      width: 170,
    },
    {
      title: '法定代表人',
      dataIndex: 'legalPerson',
      key: 'legalPerson',
      width: 100,
    },
    {
      title: '资质等级',
      dataIndex: 'qualLevel',
      key: 'qualLevel',
      width: 100,
      render: (level: QualLevel) => (
        <Tag color={qualLevelColors[level]}>{level}</Tag>
      ),
    },
    {
      title: '资质证书编号',
      dataIndex: 'qualCertNo',
      key: 'qualCertNo',
      width: 130,
    },
    {
      title: '有效期至',
      dataIndex: 'qualExpireDate',
      key: 'qualExpireDate',
      width: 110,
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
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: PropertyCompany) => (
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
        title="物业企业信息管理"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        }
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索企业名称/信用代码"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={fetchData}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="资质等级"
            value={qualLevel || undefined}
            onChange={v => setQualLevel(v || '')}
            allowClear
            style={{ width: 120 }}
            options={[
              { label: '一级', value: '一级' },
              { label: '二级', value: '二级' },
              { label: '三级', value: '三级' },
              { label: '暂定三级', value: '暂定三级' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchData}>
            搜索
          </Button>
        </Space>

        <Table
          dataSource={companies}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
        />
      </Card>

      <Modal
        title={`企业详情 - ${detailData?.companyName || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {detailData && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="企业名称" span={2}>{detailData.companyName}</Descriptions.Item>
            <Descriptions.Item label="统一社会信用代码" span={2}>{detailData.unifiedCode}</Descriptions.Item>
            <Descriptions.Item label="法定代表人">{detailData.legalPerson}</Descriptions.Item>
            <Descriptions.Item label="注册资本">{detailData.registeredCapital}</Descriptions.Item>
            <Descriptions.Item label="资质等级">{detailData.qualLevel}</Descriptions.Item>
            <Descriptions.Item label="资质证书编号">{detailData.qualCertNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="资质有效期">{detailData.qualExpireDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系人">{detailData.contactPerson}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{detailData.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="企业地址" span={2}>{detailData.address}</Descriptions.Item>
            <Descriptions.Item label="经营范围" span={2}>{detailData.businessScope}</Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag color={detailData.auditStatus === 'approved' ? 'success' : detailData.auditStatus === 'rejected' ? 'error' : 'processing'}>
                {detailData.auditStatus === 'approved' ? '已通过' : detailData.auditStatus === 'rejected' ? '已驳回' : '待审核'}
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

export default CompanyList;
