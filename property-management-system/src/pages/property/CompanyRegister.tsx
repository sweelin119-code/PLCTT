import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Steps, Descriptions, Tag } from 'antd';
import { submitCompanyRegistration } from '../../services/companyService';

const CompanyRegister: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const result = await submitCompanyRegistration(values);
      setSubmitResult(result);
      setCurrentStep(1);
      message.success('企业注册信息已提交，请等待政府监管部门审核');
    } catch (err: any) {
      message.error(err.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '100vh',
      padding: '40px 24px',
      background: '#f5f5f5',
    }}>
      <Card title="物业企业入驻申请" style={{ maxWidth: 800, width: '100%' }}>
        <Steps
          current={currentStep}
          style={{ marginBottom: 32, maxWidth: 600 }}
          items={[
            { title: '填写企业信息' },
            { title: '提交审核' },
            { title: '审核通过' },
          ]}
        />

        {currentStep === 0 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: 600 }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>基本信息</div>
            <Form.Item
              name="companyName"
              label="企业名称"
              rules={[{ required: true, message: '请输入企业名称' }]}
            >
              <Input placeholder="请输入企业全称" />
            </Form.Item>
            <Form.Item
              name="unifiedCode"
              label="统一社会信用代码"
              rules={[
                { required: true, message: '请输入统一社会信用代码' },
                { len: 18, message: '统一社会信用代码为18位' },
              ]}
            >
              <Input placeholder="请输入18位统一社会信用代码" maxLength={18} />
            </Form.Item>
            <Form.Item
              name="legalPerson"
              label="法定代表人"
              rules={[{ required: true, message: '请输入法定代表人' }]}
            >
              <Input placeholder="请输入法定代表人姓名" />
            </Form.Item>
            <Form.Item
              name="registeredCapital"
              label="注册资本"
              rules={[{ required: true, message: '请输入注册资本' }]}
            >
              <Input placeholder="如：5000万" />
            </Form.Item>

            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>联系信息</div>
            <Form.Item
              name="contactPerson"
              label="联系人"
              rules={[{ required: true, message: '请输入联系人' }]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
            <Form.Item
              name="contactPhone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1\d{10}$/, message: '请输入正确的手机号格式' },
              ]}
            >
              <Input placeholder="请输入手机号" maxLength={11} />
            </Form.Item>
            <Form.Item
              name="address"
              label="企业地址"
              rules={[{ required: true, message: '请输入企业地址' }]}
            >
              <Input.TextArea rows={2} placeholder="请输入企业注册地址" />
            </Form.Item>

            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>业务信息</div>
            <Form.Item
              name="businessScope"
              label="经营范围"
              rules={[{ required: true, message: '请输入经营范围' }]}
            >
              <Input.TextArea rows={3} placeholder="请描述企业经营范围，如：物业管理、物业租赁、停车场经营、家政服务" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                提交入驻申请
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && submitResult && (
          <div>
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>入驻申请已提交</h3>
              <p style={{ color: '#666', marginBottom: 24 }}>
                您的企业信息已成功提交，请等待政府监管部门审核。
              </p>
            </div>

            <Descriptions
              title="提交信息"
              bordered
              column={2}
              size="small"
              style={{ maxWidth: 700, margin: '0 auto' }}
            >
              <Descriptions.Item label="企业名称" span={2}>{submitResult.companyName}</Descriptions.Item>
              <Descriptions.Item label="统一社会信用代码">{submitResult.unifiedCode}</Descriptions.Item>
              <Descriptions.Item label="法定代表人">{submitResult.legalPerson}</Descriptions.Item>
              <Descriptions.Item label="联系人">{submitResult.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{submitResult.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="审核状态" span={2}>
                <Tag color="processing">待审核</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交时间" span={2}>{submitResult.submitTime}</Descriptions.Item>
            </Descriptions>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button onClick={() => {
                setCurrentStep(0);
                form.resetFields();
                setSubmitResult(null);
              }}>
                继续申请其他企业
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CompanyRegister;
