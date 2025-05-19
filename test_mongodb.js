import { MongoClient } from 'mongodb';

async function testMongoDB() {
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  const client = new MongoClient(uri);

  try {
    console.log('正在连接到MongoDB...');
    await client.connect();
    console.log('✅ 成功连接到MongoDB!');
    
    // 获取数据库信息
    const adminDb = client.db('admin');
    const serverInfo = await adminDb.command({ serverStatus: 1 });
    console.log(`MongoDB版本: ${serverInfo.version}`);
    
    // 列出所有数据库
    const dbs = await client.db().admin().listDatabases();
    console.log('数据库列表:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // 测试ismism_machine_db数据库
    const db = client.db('ismism_machine_db');
    
    // 创建测试集合
    if (!(await db.listCollections({name: 'test_collection'}).toArray()).length) {
      await db.createCollection('test_collection');
      console.log('✅ 创建测试集合成功');
    }
    
    // 插入测试文档
    const result = await db.collection('test_collection').insertOne({
      test: true,
      message: '这是一个测试文档',
      createdAt: new Date()
    });
    
    console.log(`✅ 插入文档成功，ID: ${result.insertedId}`);
    
    // 查询文档
    const docs = await db.collection('test_collection').find({}).toArray();
    console.log(`找到 ${docs.length} 个文档:`);
    docs.forEach((doc, i) => {
      console.log(`[${i+1}] ID: ${doc._id}, 消息: ${doc.message}, 创建时间: ${doc.createdAt}`);
    });
    
    return '✅ MongoDB测试完成!';
  } catch (error) {
    console.error('❌ MongoDB测试失败:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

testMongoDB()
  .then(console.log)
  .catch(console.error); 