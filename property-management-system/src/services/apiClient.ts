// ===== API 客户端 =====
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'plcct_auth_token';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动附加 Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // Token 过期或无效，清除本地存储
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem('plcct_current_user');
        // 跳转到登录页
        window.location.href = '/login';
      }
      const message = data?.message || '请求失败';
      return Promise.reject(new Error(message));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'));
    }
    return Promise.reject(new Error('网络错误，请检查网络连接'));
  }
);

export default apiClient;
