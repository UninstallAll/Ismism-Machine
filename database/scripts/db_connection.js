import { MongoClient } from 'mongodb';
import { getMongoConfig } from '../config/mongodb.config.js';

/**
 * MongoDB连接管理器
 * 单例模式，确保只有一个数据库连接实例
 */
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    
    this.client = null;
    this.db = null;
    this.connected = false;
    DatabaseConnection.instance = this;
  }
  
  /**
   * 连接到MongoDB数据库
   * @returns {Promise<Object>} MongoDB数据库实例
   */
  async connect() {
    if (this.connected && this.db) {
      return this.db;
    }
    
    try {
      const config = getMongoConfig();
      console.log(`正在连接到MongoDB: ${config.uri}`);
      
      this.client = new MongoClient(config.uri, config.options);
      await this.client.connect();
      
      this.db = this.client.db();
      this.connected = true;
      
      console.log(`已成功连接到MongoDB: ${this.db.databaseName}`);
      
      // 设置连接错误处理
      this.client.on('error', (err) => {
        console.error('MongoDB连接错误:', err);
        this.connected = false;
      });
      
      // 设置关闭连接处理
      this.client.on('close', () => {
        console.log('MongoDB连接已关闭');
        this.connected = false;
      });
      
      return this.db;
    } catch (err) {
      console.error('连接MongoDB失败:', err);
      this.connected = false;
      throw err;
    }
  }
  
  /**
   * 关闭MongoDB连接
   * @returns {Promise<void>}
   */
  async close() {
    if (this.client && this.connected) {
      try {
        await this.client.close();
        this.connected = false;
        this.db = null;
        console.log('MongoDB连接已关闭');
      } catch (err) {
        console.error('关闭MongoDB连接失败:', err);
        throw err;
      }
    }
  }
  
  /**
   * 获取数据库实例
   * @returns {Promise<Object>} MongoDB数据库实例
   */
  async getDb() {
    if (!this.connected) {
      await this.connect();
    }
    return this.db;
  }
  
  /**
   * 获取集合
   * @param {string} collectionName 集合名称
   * @returns {Promise<Collection>} MongoDB集合
   */
  async getCollection(collectionName) {
    const db = await this.getDb();
    return db.collection(collectionName);
  }

  /**
   * 运行健康检查
   * @returns {Promise<boolean>} 数据库是否健康
   */
  async healthCheck() {
    try {
      if (!this.connected) {
        await this.connect();
      }
      
      // 执行简单的命令来验证连接
      const result = await this.db.command({ ping: 1 });
      return result.ok === 1;
    } catch (err) {
      console.error('数据库健康检查失败:', err);
      return false;
    }
  }
}

// 导出数据库连接单例
export default new DatabaseConnection(); 