// 服务器配置
require('dotenv').config();

// 环境变量配置
const config = {
  // 服务器配置
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB 配置
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ismism-machine',
  
  // 跨域配置
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // JWT配置(如果需要用户认证)
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_for_dev',
  jwtExpiresIn: '1d',
};

module.exports = config; 