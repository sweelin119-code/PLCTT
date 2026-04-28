import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCompanyList, auditCompany } from '../../services/companyService';
import type { PropertyCompany, AuditStatus, QualLevel } from '../../services/types';

const auditStatusMap: Record<AuditStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
};

const qualLevelColors: Record<QualLevel, string> = {
  '一级': 'red',
  '二级': 'orange',
  '三级': 'blue',
  '暂定三级': 'default',
};

const QualificationReview: React.FC = () => {
  const [companies, setCompanies] = useState<PropertyCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<AuditStatus | ''>('');
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [auditCompanyData, setAuditCompanyData] = useState<PropertyCompany | null>(null);
  const [auditRemark, setAuditRemark] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCompanyList({
        keyword: keyword || undefined,
        auditStatus: (filterStatus as AuditStatus) || undefined,
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

  const handleSearch = () => {
    fetchData();
  };

  const handleAudit = async (status: AuditStatus) => {
    if (!auditCompanyData) return;
    try {
      await auditCompany(auditCompanyData.id, status, auditRemark);
      message.success(`企业${status === 'approved' ? '审核通过' : '已驳回'}`);
      setAuditModalVisible(false);
      setAuditRemark('');
      fetchData();
    } catch (err: any) {
      message.error(err.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '企业名称',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 200,
      render: (name: string, record: PropertyCompany) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{name}</span>
          <Tag color={auditStatusMap[record.auditStatus].color}>
            {auditStatusMap[record.auditStatus].label}
          </Tag>
        </Space>
      ),
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
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: PropertyCompany) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setAuditCompanyData(record);
              setAuditRemark('');
              setAuditModalVisible(true);
            }}
          >
            审核
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setAuditCompanyData(record);
              setAuditRemark('');
              setAuditModalVisible(true);
            }}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="企业资质审核"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        }
      >
        {/* 搜索栏 */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索企业名称/信用代码"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
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
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
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

      {/* 审核弹窗 */}
      <Modal
        title={`企业审核 - ${auditCompanyData?.companyName || ''}`}
        open={auditModalVisible}
        onCancel={() => {
          setAuditModalVisible(false);
          setAuditRemark('');
        }}
        width={640}
        footer={
          <Space>
            <Button onClick={() => {
              setAuditModalVisible(false);
              setAuditRemark('');
            }}>
              取消
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleAudit('rejected')}
            >
              驳回
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleAudit('approved')}
            >
              审核通过
            </Button>
          </Space>
        }
      >
        {auditCompanyData && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="企业名称" span={2}>{auditCompanyData.companyName}</Descriptions.Item>
              <Descriptions.Item label="统一社会信用代码">{auditCompanyData.unifiedCode}</Descriptions.Item>
              <Descriptions.Item label="法定代表人">{auditCompanyData.legalPerson}</Descriptions.Item>
              <Descriptions.Item label="注册资本">{auditCompanyData.registeredCapital}</Descriptions.Item>
              <Descriptions.Item label="联系人">{auditCompanyData.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{auditCompanyData.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="企业地址" span={2}>{auditCompanyData.address}</Descriptions.Item>
              <Descriptions.Item label="经营范围" span={2}>{auditCompanyData.businessScope}</Descriptions.Item>
              <Descriptions.Item label="当前状态" span={2}>
                <Tag color={auditStatusMap[auditCompanyData.auditStatus].color}>
                  {auditStatusMap[auditCompanyData.auditStatus].label}
                </Tag>
              </Descriptions.Item>
              {auditCompanyData.auditRemark && (
                <Descriptions.Item label="审核意见" span={2}>
                  <span style={{ color: auditCompanyData.auditStatus === 'rejected' ? '#ff4d4f' : '#52c41a' }}>
                    {auditCompanyData.auditRemark}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500, color: '#333' }}>审核意见：</div>
              <Input.TextArea
                rows={3}
                placeholder={auditCompanyData.auditStatus === 'rejected' ? '请填写驳回原因' : '选填，审核通过备注'}
                value={auditRemark}
                onChange={e => setAuditRemark(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QualificationReview;
