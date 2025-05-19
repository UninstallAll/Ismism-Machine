import { MongoClient } from 'mongodb';

async function interactWithMongoDB() {
  const uri = 'mongodb://localhost:27017/';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('已连接到MongoDB');
    
    // 列出所有数据库
    const adminDb = client.db('admin');
    const dbs = await client.db().admin().listDatabases();
    console.log('\n===== 数据库列表 =====');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));
    
    // 使用ismism_demo_db
    const db = client.db('ismism_demo_db');
    
    // 列出所有集合
    const collections = await db.listCollections().toArray();
    console.log('\n===== 集合列表 =====');
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    // 查看artMovements集合数据
    console.log('\n===== 艺术流派数据 =====');
    const movements = await db.collection('artMovements').find({}).toArray();
    movements.forEach(m => console.log(`- ${m.name} (${m.period.start}-${m.period.end})`));
    
    // 创建一个新的艺术流派
    console.log('\n===== 创建新艺术流派 =====');
    const newMovement = {
      name: '波普艺术',
      period: { start: 1950, end: 1970 },
      description: '波普艺术是20世纪中期在英国和美国发展起来的艺术运动，它借用了大众文化中的图像，如广告、漫画书和日常文化对象。',
      keyCharacteristics: ['大众文化', '鲜艳色彩', '商业形象', '平面设计', '日常物品'],
      majorArtists: ['安迪·沃霍尔', '罗伊·利希滕斯坦', '理查德·汉密尔顿'],
      keyArtworks: [{ title: '玛丽莲·梦露', artist: '安迪·沃霍尔', year: 1962 }],
      influences: ['达达主义', '商业艺术'],
      influencedMovements: ['新表现主义', '低俗艺术'],
      tags: ['现代艺术', '美国', '英国', '20世纪']
    };
    
    const result = await db.collection('artMovements').insertOne(newMovement);
    console.log(`插入新艺术流派成功，ID: ${result.insertedId}`);
    
    // 更新已有艺术流派
    console.log('\n===== 更新艺术流派 =====');
    const updateResult = await db.collection('artMovements').updateOne(
      { name: '印象派' },
      { $push: { majorArtists: '莫里索' } }
    );
    console.log(`更新印象派艺术家，匹配文档数: ${updateResult.matchedCount}, 修改文档数: ${updateResult.modifiedCount}`);
    
    // 查看更新后的数据
    const impressionism = await db.collection('artMovements').findOne({ name: '印象派' });
    console.log(`更新后的印象派艺术家列表: ${impressionism.majorArtists.join(', ')}`);
    
    // 对艺术流派进行高级查询
    console.log('\n===== 20世纪的艺术流派 =====');
    const twentieth = await db.collection('artMovements').find({
      'period.start': { $gte: 1900, $lt: 2000 }
    }).toArray();
    twentieth.forEach(m => console.log(`- ${m.name} (${m.period.start}-${m.period.end})`));
    
    // 执行聚合操作 - 分析各个时代的艺术流派数量
    console.log('\n===== 艺术流派时代分布 =====');
    const eraDistribution = await db.collection('artMovements').aggregate([
      {
        $project: {
          name: 1,
          era: {
            $switch: {
              branches: [
                { case: { $lt: ["$period.start", 1800] }, then: "18世纪及以前" },
                { case: { $lt: ["$period.start", 1900] }, then: "19世纪" },
                { case: { $lt: ["$period.start", 1950] }, then: "20世纪前半" },
                { case: { $lt: ["$period.start", 2000] }, then: "20世纪后半" }
              ],
              default: "21世纪"
            }
          }
        }
      },
      {
        $group: {
          _id: "$era",
          count: { $sum: 1 },
          movements: { $push: "$name" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]).toArray();
    
    eraDistribution.forEach(era => {
      console.log(`${era._id}: ${era.count}个流派 (${era.movements.join(', ')})`);
    });
    
    // 删除一个测试文档
    console.log('\n===== 删除测试数据 =====');
    const deleteResult = await db.collection('artMovements').deleteOne({
      name: "测试艺术流派"
    });
    console.log(`删除结果: 删除了${deleteResult.deletedCount}个文档`);
    
    return '✅ MongoDB交互操作完成!';
  } catch (err) {
    console.error('MongoDB操作失败:', err);
    throw err;
  } finally {
    await client.close();
    console.log('\nMongoDB连接已关闭');
  }
}

// 执行交互操作
interactWithMongoDB()
  .then(console.log)
  .catch(console.error); 