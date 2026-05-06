import React, { useState, useCallback, useEffect } from 'react';
import { Table, Tag, Input, Select, Row, Col, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getParkingChargeRecords,
  type ParkingChargeRecord,
  type ParkingChargeQueryParams,
} from '../../../services/parkingFeeService';

interface Props {
  projectId: number;
}

const TemporaryCharge: React.FC<Props> = ({ projectId }) => {
  const [data, setData] = useState<ParkingChargeRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [payMethod, setPayMethod] = useState<string>('');
  const [page, setPage] = useState(1);

  const loadData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params: ParkingChargeQueryParams = { projectId, page: p, pageSize: 10 };
      if (keyword) params.keyword = keyword;
      if (payMethod) params.payMethod = payMethod;
      const result = await getParkingChargeRecords(params);
      setData(result.list);
      setTotal(result.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [projectId, keyword, payMethod]);

  useEffect(() => { loadData(1); }, [loadData]);

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

  const columns: ColumnsType<ParkingChargeRecord> = [
    { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120, render: (text) => <strong>{text}</strong> },
    { title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 90, render: (t) => t === 'car' ? '小型车' : t === 'motorcycle' ? '摩托车' : '大型车' },
    { title: '入场时间', dataIndex: 'entryTime', key: 'entryTime', width: 160 },
    { title: '出场时间', dataIndex: 'exitTime', key: 'exitTime', width: 160 },
    { title: '停留时长', dataIndex: 'duration', key: 'duration', width: 120 },
    { title: '应收', dataIndex: 'fee', key: 'fee', width: 80, render: (fee) => `¥${fee.toFixed(2)}` },
    { title: '实收', dataIndex: 'actualFee', key: 'actualFee', width: 80, render: (fee) => <strong style={{ color: '#52c41a' }}>¥{fee.toFixed(2)}</strong> },
    { title: '支付方式', dataIndex: 'payMethod', key: 'payMethod', width: 90, render: (m) => getPayMethodText(m) },
    { title: '收费时间', dataIndex: 'payTime', key: 'payTime', width: 160 },
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 80 },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索车牌号"
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
            placeholder="支付方式"
            value={payMethod || undefined}
            onChange={v => setPayMethod(v || '')}
            allowClear
            options={[
              { value: 'wechat', label: '微信支付' },
              { value: 'alipay', label: '支付宝' },
              { value: 'cash', label: '现金' },
              { value: 'monthly', label: '月租' },
              { value: 'free', label: '免费' },
            ]}
          />
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => loadData(1)}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); setPayMethod(''); loadData(1); }}>重置</Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1300 }}
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

export default TemporaryCharge;
