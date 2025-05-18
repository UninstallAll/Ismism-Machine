import axios from 'axios';

// 获取API基础URL，生产环境下基于相对路径，开发环境下使用代理或实际后端URL
const baseURL = import.meta.env.PROD 
  ? '' // 生产环境使用相对路径
  : import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 创建axios实例
const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 可以在这里添加授权token等逻辑
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('Request error:', error.request);
    } else {
      // 设置请求时发生错误
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 