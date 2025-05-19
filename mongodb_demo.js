import { MongoClient, ObjectId } from 'mongodb';

async function demonstrateMongoOperations() {
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  const client = new MongoClient(uri);

  try {
    console.log('连接到MongoDB...');
    await client.connect();
    console.log('MongoDB连接成功！');
    
    const db = client.db('ismism_machine_db');
    
    // 1. 创建一个演示集合
    console.log('\n===== 创建集合 =====');
    const demoCollection = 'mongodb_demo_collection';
    const collections = await db.listCollections({ name: demoCollection }).toArray();
    
    if (collections.length > 0) {
      console.log(`删除已存在的集合: ${demoCollection}`);
      await db.collection(demoCollection).drop();
    }
    
    await db.createCollection(demoCollection);
    console.log(`创建集合: ${demoCollection}`);
    
    // 2. 插入文档
    console.log('\n===== 插入文档 =====');
    const collection = db.collection(demoCollection);
    
    // 插入单个文档
    const singleInsertResult = await collection.insertOne({
      name: '示例文档1',
      type: 'demo',
      tags: ['test', 'example'],
      createdAt: new Date()
    });
    console.log(`插入单个文档成功，ID: ${singleInsertResult.insertedId}`);
    
    // 插入多个文档
    const multiInsertResult = await collection.insertMany([
      {
        name: '示例文档2',
        type: 'demo',
        tags: ['test', 'batch'],
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '示例文档3',
        type: 'demo',
        tags: ['test', 'batch', 'important'],
        status: 'pending',
        createdAt: new Date()
      },
      {
        name: '示例文档4',
        type: 'production',
        tags: ['important'],
        status: 'active',
        createdAt: new Date()
      }
    ]);
    console.log(`插入多个文档成功，插入数量: ${multiInsertResult.insertedCount}`);
    
    // 3. 查询文档
    console.log('\n===== 查询文档 =====');
    
    // 查询所有文档
    const allDocs = await collection.find({}).toArray();
    console.log(`查询到 ${allDocs.length} 个文档:`);
    allDocs.forEach((doc, i) => {
      console.log(`[${i+1}] ID: ${doc._id}, 名称: ${doc.name}, 类型: ${doc.type}`);
    });
    
    // 使用条件查询
    console.log('\n-- 条件查询: 状态为active的文档 --');
    const activeDocs = await collection.find({ status: 'active' }).toArray();
    activeDocs.forEach(doc => {
      console.log(`ID: ${doc._id}, 名称: ${doc.name}, 状态: ${doc.status}`);
    });
    
    // 使用正则表达式查询
    console.log('\n-- 正则表达式查询: 名称包含"文档"的记录 --');
    const regexDocs = await collection.find({ name: /文档/ }).toArray();
    regexDocs.forEach(doc => {
      console.log(`ID: ${doc._id}, 名称: ${doc.name}`);
    });
    
    // 使用排序和限制
    console.log('\n-- 排序和限制: 按创建时间倒序前2条 --');
    const sortedDocs = await collection.find({})
      .sort({ createdAt: -1 })
      .limit(2)
      .toArray();
    sortedDocs.forEach(doc => {
      console.log(`ID: ${doc._id}, 名称: ${doc.name}, 创建时间: ${doc.createdAt}`);
    });
    
    // 4. 更新文档
    console.log('\n===== 更新文档 =====');
    
    // 更新单个文档
    if (allDocs.length > 0) {
      const updateResult = await collection.updateOne(
        { _id: allDocs[0]._id },
        { 
          $set: { 
            status: 'updated',
            updatedAt: new Date()
          },
          $push: {
            tags: 'updated'
          }
        }
      );
      
      console.log(`更新文档结果: 匹配 ${updateResult.matchedCount}, 修改 ${updateResult.modifiedCount}`);
      
      // 查看更新后的文档
      const updatedDoc = await collection.findOne({ _id: allDocs[0]._id });
      console.log('更新后的文档:');
      console.log(updatedDoc);
    }
    
    // 使用upsert更新或插入文档
    const upsertResult = await collection.updateOne(
      { name: '新插入的文档' },
      {
        $set: {
          type: 'upserted',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log(`Upsert结果: 匹配 ${upsertResult.matchedCount}, 修改 ${upsertResult.modifiedCount}, Upserted ID: ${upsertResult.upsertedId}`);
    
    // 5. 聚合操作
    console.log('\n===== 聚合操作 =====');
    
    // 按类型分组计数
    const typeCountResult = await collection.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    console.log('按类型分组的文档数量:');
    typeCountResult.forEach(result => {
      console.log(`类型: ${result._id}, 数量: ${result.count}`);
    });
    
    // 统计标签出现次数
    const tagStatsResult = await collection.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          documents: { $push: '$name' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n标签统计:');
    tagStatsResult.forEach(result => {
      console.log(`标签: ${result._id}, 出现次数: ${result.count}, 文档: ${result.documents.join(', ')}`);
    });
    
    // 6. 删除文档
    console.log('\n===== 删除文档 =====');
    
    // 删除单个文档
    if (allDocs.length > 0) {
      const deleteOneResult = await collection.deleteOne({ _id: allDocs[allDocs.length - 1]._id });
      console.log(`删除单个文档结果: 删除数量 ${deleteOneResult.deletedCount}`);
    }
    
    // 条件删除
    const deleteResult = await collection.deleteMany({ type: 'demo' });
    console.log(`删除type=demo的文档结果: 删除数量 ${deleteResult.deletedCount}`);
    
    // 查看剩余文档
    const remainingDocs = await collection.find({}).toArray();
    console.log(`\n剩余 ${remainingDocs.length} 个文档:`);
    remainingDocs.forEach(doc => {
      console.log(`ID: ${doc._id}, 名称: ${doc.name}, 类型: ${doc.type}`);
    });
    
    // 7. 索引操作
    console.log('\n===== 索引操作 =====');
    
    // 创建索引
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ type: 1, status: 1 });
    await collection.createIndex({ tags: 1 });
    
    // 查看索引
    const indexes = await collection.indexes();
    console.log('集合索引:');
    indexes.forEach(index => {
      console.log(`索引名: ${index.name}, 键: ${JSON.stringify(index.key)}`);
    });
    
    console.log('\nMongoDB操作演示完成！');
    
  } catch (error) {
    console.error('MongoDB操作失败:', error);
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行演示
demonstrateMongoOperations().catch(console.error); 