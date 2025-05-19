/**
 * MongoDB数据库配置文件
 */

export const mongoConfig = {
  // 开发环境配置
  development: {
    uri: 'mongodb://localhost:27017/ismism_machine_db',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // 测试环境配置
  test: {
    uri: 'mongodb://localhost:27017/ismism_machine_test_db',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // 生产环境配置
  production: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ismism_machine_db',
    options: {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      useUnifiedTopology: true,
    }
  }
};

/**
 * 获取当前环境的MongoDB配置
 * @returns {Object} 当前环境的MongoDB配置
 */
export function getMongoConfig() {
  const env = process.env.NODE_ENV || 'development';
  return mongoConfig[env];
}

export default getMongoConfig; 