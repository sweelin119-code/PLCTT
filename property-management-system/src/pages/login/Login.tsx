import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Tabs, Space, Tag } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { generateCaptcha } from '../../services/authService';

const { TabPane } = Tabs;

// 端口信息配置
const PORT_INFO: Record<string, { name: string; icon: string; color: string; gradient: string; desc: string }> = {
  government: {
    name: '政府监管端',
    icon: '🏛️',
    color: '#1890ff',
    gradient: 'linear-gradient(135deg, #1890ff, #096dd9)',
    desc: '市/区/街道三级政府物业管理监管平台',
  },
  property: {
    name: '物业管理端',
    icon: '🏢',
    color: '#52c41a',
    gradient: 'linear-gradient(135deg, #52c41a, #389e0d)',
    desc: '物业企业日常运营管理综合平台',
  },
  merchant: {
    name: '商家管理端',
    icon: '🏪',
    color: '#722ed1',
    gradient: 'linear-gradient(135deg, #722ed1, #531dab)',
    desc: '社区商家店铺运营管理平台',
  },
  owner: {
    name: '业主微信端',
    icon: '📱',
    color: '#07c160',
    gradient: 'linear-gradient(135deg, #07c160, #06ad56)',
    desc: '业主智慧社区生活服务平台',
  },
  superadmin: {
    name: '超级管理端',
    icon: '⚙️',
    color: '#fa8c16',
    gradient: 'linear-gradient(135deg, #fa8c16, #d46b08)',
    desc: '系统全局配置与超级管理平台',
  },
};

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'captcha'>('password');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 从 URL 参数获取端口标识
  const port = searchParams.get('port') || 'property';
  const portInfo = PORT_INFO[port] || PORT_INFO.property;

  // 根据端口显示不同的测试账号
  const testAccounts: Record<string, { role: string; phone: string }[]> = {
    government: [
      { role: '市级管理员', phone: '13800000001' },
      { role: '区级管理员', phone: '13800000002' },
      { role: '街道办人员', phone: '13800000003' },
    ],
    property: [
      { role: '物业管理员', phone: '13800000001' },
      { role: '项目经理', phone: '13800000002' },
      { role: '客服人员', phone: '13800000003' },
      { role: '工程人员', phone: '13800000004' },
    ],
    merchant: [
      { role: '商家管理员', phone: '13800000001' },
      { role: '店铺运营', phone: '13800000002' },
    ],
    superadmin: [
      { role: '超级管理员', phone: '13800000001' },
    ],
  };

  const accounts = testAccounts[port] || testAccounts.property;

  // 生成验证码
  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // 密码登录
  const handlePasswordLogin = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      await login(values);
      message.success('登录成功');
      // 登录成功后跳转到对应端口的首页
      const targetPath = port === 'owner' ? '/owner/home' : `/${port}/dashboard`;
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 验证码登录
  const handleCaptchaLogin = async (values: { phone: string }) => {
    if (captchaInput !== captcha) {
      message.error('验证码错误');
      return;
    }
    setLoading(true);
    try {
      await login({ phone: values.phone, password: values.phone });
      message.success('登录成功');
      const targetPath = port === 'owner' ? '/owner/home' : `/${port}/dashboard`;
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }} />
        ))}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>

      {/* 登录卡片 */}
      <div style={{
        width: 420,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: '40px 36px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(20px)',
      }}>
        {/* 端口标识 */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Tag color={portInfo.color} style={{ fontSize: 11, borderRadius: 4, padding: '0 8px' }}>
            当前登录：{portInfo.name}
          </Tag>
        </div>

        {/* Logo & 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: portInfo.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 32,
            boxShadow: `0 8px 24px ${portInfo.color}44`,
          }}>
            {portInfo.icon}
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>
            {portInfo.name}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>
            {portInfo.desc}
          </p>
        </div>

        <Tabs
          activeKey={loginMode}
          onChange={(key) => setLoginMode(key as any)}
          centered
          size="large"
          style={{ marginBottom: 8 }}
        >
          <TabPane tab="密码登录" key="password" />
          <TabPane tab="验证码登录" key="captcha" />
        </Tabs>

        {loginMode === 'password' ? (
          <Form onFinish={handlePasswordLogin} size="large" autoComplete="off">
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入正确的手机号格式' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bbb' }} />}
                placeholder="手机号"
                maxLength={11}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bbb' }} />}
                placeholder="密码（初始密码为手机号）"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block
                style={{
                  height: 44,
                  borderRadius: 10,
                  background: portInfo.gradient,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                登 录 {portInfo.name}
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form onFinish={handleCaptchaLogin} size="large" autoComplete="off">
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入正确的手机号格式' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bbb' }} />}
                placeholder="手机号"
                maxLength={11}
              />
            </Form.Item>
            <Form.Item
              validateStatus={captchaInput && captchaInput !== captcha ? 'error' : undefined}
              help={captchaInput && captchaInput !== captcha ? '验证码错误' : undefined}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  prefix={<SafetyOutlined style={{ color: '#bbb' }} />}
                  placeholder="验证码"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  maxLength={6}
                />
                <Button
                  onClick={refreshCaptcha}
                  style={{
                    minWidth: 120,
                    background: captcha ? '#f6f8fc' : '#fff',
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: 'bold',
                    letterSpacing: 4,
                    color: portInfo.color,
                    cursor: 'pointer',
                  }}
                >
                  {captcha || '获取验证码'}
                </Button>
              </Space.Compact>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block
                style={{
                  height: 44,
                  borderRadius: 10,
                  background: portInfo.gradient,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                登 录 {portInfo.name}
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* 测试账号提示 */}
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#f6f8fc',
          borderRadius: 10,
          fontSize: 12,
          color: '#666',
          lineHeight: 1.8,
        }}>
          <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>
            💡 {portInfo.name} 测试账号
          </div>
          {accounts.map((acc, i) => (
            <div key={i}>{acc.role}：{acc.phone} / {acc.phone}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
