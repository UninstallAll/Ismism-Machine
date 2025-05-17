import axios from 'axios';

console.log('创建Axios实例，baseURL:', 'http://localhost:3000/api');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10秒超时
});

// 添加请求拦截器 - 用于调试
api.interceptors.request.use(
  (config) => {
    console.log(`发送请求: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器 - 用于调试
api.interceptors.response.use(
  (response) => {
    console.log(`接收响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('响应错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('无响应，请求详情:', error.request);
    }
    return Promise.reject(error);
  }
);

export default api; 