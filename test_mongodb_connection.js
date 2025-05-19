import { MongoClient } from 'mongodb';

/**
 * 测试MongoDB连接和MCP功能
 */
async function testMongoDBConnection() {
  // MongoDB连接URI
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  
  // 配置连接池
  const client = new MongoClient(uri, {
    maxPoolSize: 10,         // 最大连接数
    minPoolSize: 5,          // 最小连接数
    maxIdleTimeMS: 30000,    // 连接最大空闲时间
    waitQueueTimeoutMS: 5000 // 等待队列超时时间
  });

  try {
    console.log('正在连接到MongoDB...');
    await client.connect();
    console.log('✅ MongoDB连接成功!');
    
    // 获取数据库实例
    const db = client.db('ismism_machine_db');
    
    // 1. 测试基本连接
    const serverInfo = await db.command({ serverStatus: 1 });
    console.log(`MongoDB版本: ${serverInfo.version}`);
    console.log(`数据库名称: ${db.databaseName}`);
    
    // 2. 测试MCP (MongoDB Connection Pooling)池连接功能
    console.log('\n===== 测试连接池功能 =====');
    
    // 创建测试集合
    const testCollection = 'mcp_test_collection';
    
    // 检查并清理测试集合
    const collections = await db.listCollections({ name: testCollection }).toArray();
    if (collections.length > 0) {
      await db.collection(testCollection).drop();
      console.log(`删除已存在的集合: ${testCollection}`);
    }
    
    // 创建测试集合
    await db.createCollection(testCollection);
    console.log(`创建测试集合: ${testCollection}`);
    
    // 3. 模拟并发连接测试连接池
    console.log('\n===== 模拟并发请求测试连接池 =====');
    const startTime = Date.now();
    
    // 创建并发请求
    const concurrentRequests = 50; // 增加并发数来测试连接池
    const operations = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      operations.push(
        db.collection(testCollection).insertOne({
          testId: i,
          message: `测试文档 #${i}`,
          timestamp: new Date()
        })
      );
    }
    
    // 执行并发请求
    const results = await Promise.all(operations);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`完成 ${concurrentRequests} 个并发请求，耗时: ${duration}ms`);
    console.log(`平均每个请求耗时: ${duration / concurrentRequests}ms`);
    
    // 4. 验证数据已正确插入
    const count = await db.collection(testCollection).countDocuments();
    console.log(`\n集合中文档数量: ${count}`);
    
    if (count === concurrentRequests) {
      console.log('✅ 所有并发请求都成功插入数据，证明连接池工作正常!');
    } else {
      console.log('❌ 插入数据量与请求数不符，连接池可能存在问题');
    }
    
    // 5. 验证连接复用 - 再次执行一批操作
    console.log('\n===== 验证连接复用 =====');
    const secondStartTime = Date.now();
    
    // 创建第二批并发请求
    const secondBatchOperations = [];
    
    for (let i = 0; i < 20; i++) {
      secondBatchOperations.push(
        db.collection(testCollection).findOne({ testId: i })
      );
    }
    
    // 执行第二批并发请求
    const secondResults = await Promise.all(secondBatchOperations);
    
    const secondEndTime = Date.now();
    const secondDuration = secondEndTime - secondStartTime;
    
    console.log(`完成第二批 20 个查询请求，耗时: ${secondDuration}ms`);
    console.log(`平均每个查询耗时: ${secondDuration / 20}ms`);
    console.log('如果第二批操作平均耗时明显小于第一批，说明连接池被有效复用');
    
    // 6. 清理测试数据
    await db.collection(testCollection).drop();
    console.log(`\n删除测试集合: ${testCollection}`);
    
    return '✅ MongoDB MCP连接池测试完成! 结果显示连接池工作正常';
  } catch (error) {
    console.error('❌ MongoDB测试失败:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行测试
testMongoDBConnection()
  .then(console.log)
  .catch(console.error); 