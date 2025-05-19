import { MongoClient } from 'mongodb';

async function createXXXDatabase() {
  // 连接URI
  const uri = 'mongodb://localhost:27017/';
  const client = new MongoClient(uri);

  try {
    // 连接到MongoDB
    await client.connect();
    console.log('已连接到MongoDB服务器');
    
    // 创建XXX数据库 (在MongoDB中，只有当你向数据库中插入数据时，才会真正创建数据库)
    const xxxDb = client.db('XXX');
    
    // 创建一个集合并插入一条文档，以确保数据库被创建
    await xxxDb.collection('test_collection').insertOne({
      createdAt: new Date(),
      message: 'XXX数据库初始化成功',
      project: 'Ismism-Machine'
    });
    
    console.log('XXX数据库创建成功!');
    
    // 列出所有数据库以验证创建
    const databasesList = await client.db().admin().listDatabases();
    
    console.log('现有数据库列表:');
    databasesList.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });
    
    // 特别标注我们的新数据库
    const ourDb = databasesList.databases.find(db => db.name === 'XXX');
    if (ourDb) {
      console.log('\n✅ XXX数据库已成功创建并验证!');
      console.log(`   大小: ${ourDb.sizeOnDisk} 字节`);
    }
    
  } catch (err) {
    console.error('操作失败:', err);
  } finally {
    // 关闭连接
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行函数
createXXXDatabase().catch(console.error); 