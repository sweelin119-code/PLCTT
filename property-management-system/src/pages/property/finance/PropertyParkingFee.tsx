import React, { useState, useCallback, useEffect } from 'react';
import { Table, Tag, Button, Input, Select, Row, Col, Space, message } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getPropertyParkingFees,
  generatePropertyParkingFees,
  payPropertyParkingFee,
  type PropertyParkingFeeRecord,
  type PropertyParkingFeeQueryParams,
} from '../../../services/parkingFeeService';

interface Props {
  projectId: number;
  onStatsChange: () => void;
}

const PropertyParkingFee: React.FC<Props> = ({ projectId, onStatsChange }) => {
  const [data, setData] = useState<PropertyParkingFeeRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [period, setPeriod] = useState<string>('2026-05');
  const [page, setPage] = useState(1);
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params: PropertyParkingFeeQueryParams = { projectId, page: p, pageSize: 10, period };
      if (keyword) params.keyword = keyword;
      if (status) params.status = status;
      const result = await getPropertyParkingFees(params);
      setData(result.list);
      setTotal(result.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [projectId, keyword, status, period]);

  useEffect(() => { loadData(1); }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generatePropertyParkingFees(projectId, period);
      if (result.length === 0) {
        message.info('该账期已存在账单，无需重复生成');
      } else {
        message.success(`成功生成 ${result.length} 条管理费账单`);
      }
      loadData(1);
      onStatsChange();
    } catch (err: any) {
      message.error(err.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handlePay = async (id: number) => {
    try {
      await payPropertyParkingFee(id, 'wechat');
      message.success('缴费成功');
      loadData(page);
      onStatsChange();
    } catch (err: any) {
      message.error(err.message || '缴费失败');
    }
  };

  const getFeeStatusTag = (s: string) => {
    switch (s) {
      case 'pending': return <Tag color="processing">待缴费</Tag>;
      case 'paid': return <Tag color="success">已缴费</Tag>;
      case 'overdue': return <Tag color="error">已逾期</Tag>;
      case 'cancelled': return <Tag color="default">已取消</Tag>;
      default: return <Tag>{s}</Tag>;
    }
  };

  const getPayMethodText = (method?: string) => {
    switch (method) {
      case 'wechat': return <Tag color="#07C160">微信</Tag>;
      case 'alipay': return <Tag color="#1677FF">支付宝</Tag>;
      case 'cash': return <Tag color="#faad14">现金</Tag>;
      case 'monthly': return <Tag color="#722ed1">月租</Tag>;
      case 'free': return <Tag color="#52c41a">免费</Tag>;
      default: return '-';
    }
  };

  const columns: ColumnsType<PropertyParkingFeeRecord> = [
    { title: '车位编号', dataIndex: 'parkingCode', key: 'parkingCode', width: 100 },
    { title: '业主姓名', dataIndex: 'ownerName', key: 'ownerName', width: 100 },
    { title: '房屋信息', dataIndex: 'houseFullName', key: 'houseFullName', width: 150 },
    { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120, render: (text) => text || '-' },
    { title: '管理费(元)', dataIndex: 'managementFee', key: 'managementFee', width: 100, render: (fee) => <strong>¥{fee.toFixed(2)}</strong> },
    { title: '账期', dataIndex: 'period', key: 'period', width: 90 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s) => getFeeStatusTag(s) },
    { title: '缴费时间', dataIndex: 'paidAt', key: 'paidAt', width: 160, render: (t) => t || '-' },
    { title: '支付方式', dataIndex: 'payMethod', key: 'payMethod', width: 90, render: (m) => m ? getPayMethodText(m) : '-' },
    {
      title: '操作', key: 'action', width: 100, fixed: 'right' as const,
      render: (_, record) => (
        record.status === 'pending' || record.status === 'overdue' ? (
          <Button type="primary" size="small" onClick={() => handlePay(record.id)}>缴费</Button>
        ) : (
          <Tag color="#999">已处理</Tag>
        )
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Select
            style={{ width: '100%' }}
            value={period}
            onChange={v => setPeriod(v)}
            options={[
              { value: '2026-05', label: '2026年05月' },
              { value: '2026-04', label: '2026年04月' },
              { value: '2026-03', label: '2026年03月' },
            ]}
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="搜索业主姓名/车位编号/房屋"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={() => loadData(1)}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="缴费状态"
            value={status || undefined}
            onChange={v => setStatus(v || '')}
            allowClear
            options={[
              { value: 'pending', label: '待缴费' },
              { value: 'paid', label: '已缴费' },
              { value: 'overdue', label: '已逾期' },
            ]}
          />
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => loadData(1)}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); setStatus(''); loadData(1); }}>重置</Button>
            <Button type="primary" icon={<PlusOutlined />} loading={generating} onClick={handleGenerate}>
              生成管理费账单
            </Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: loadData,
          showTotal: (t) => `共 ${t} 条记录`,
        }}
      />
    </div>
  );
};

export default PropertyParkingFee;
