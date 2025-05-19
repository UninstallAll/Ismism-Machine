import { MongoClient } from 'mongodb';

/**
 * 查询演示数据库
 */
async function queryDemoDatabase() {
  // MongoDB连接URI
  const uri = 'mongodb://localhost:27017/';
  const dbName = 'ismism_demo_db';
  
  const client = new MongoClient(uri);

  try {
    console.log('正在连接到MongoDB...');
    await client.connect();
    console.log('✅ MongoDB连接成功!');
    
    // 获取数据库实例
    const db = client.db(dbName);
    console.log(`\n===== 查询数据库: ${dbName} =====`);
    
    // 1. 列出所有艺术流派
    console.log('\n===== 艺术流派列表 =====');
    const artMovements = await db.collection('artMovements').find({}).toArray();
    
    artMovements.forEach((movement, index) => {
      console.log(`\n【${index + 1}】${movement.name} (${movement.period.start}-${movement.period.end})`);
      console.log(`   描述: ${movement.description.substring(0, 70)}...`);
      console.log(`   关键特征: ${movement.keyCharacteristics.join(', ')}`);
      console.log(`   主要艺术家: ${movement.majorArtists.join(', ')}`);
    });
    
    // 2. 查询特定艺术流派的详细信息
    console.log('\n===== 超现实主义详细信息 =====');
    const surrealism = await db.collection('artMovements').findOne({ name: '超现实主义' });
    
    if (surrealism) {
      console.log(`名称: ${surrealism.name}`);
      console.log(`时期: ${surrealism.period.start}-${surrealism.period.end}`);
      console.log(`描述: ${surrealism.description}`);
      console.log(`关键特征:`);
      surrealism.keyCharacteristics.forEach(char => console.log(`- ${char}`));
      console.log(`代表作品: ${surrealism.keyArtworks.map(work => work.title).join(', ')}`);
      console.log(`受影响流派: ${surrealism.influencedMovements.join(', ')}`);
    } else {
      console.log('未找到超现实主义流派信息');
    }
    
    // 3. 查询艺术家信息
    console.log('\n===== 艺术家信息 =====');
    const artists = await db.collection('artists').find({}).toArray();
    
    artists.forEach(artist => {
      console.log(`\n${artist.name} (${artist.englishName}), ${artist.birthYear}-${artist.deathYear}`);
      console.log(`国籍: ${artist.nationality}`);
      console.log(`流派: ${artist.movements.join(', ')}`);
      console.log(`简介: ${artist.bio}`);
      console.log(`代表作品: ${artist.notableWorks.join(', ')}`);
    });
    
    // 4. 高级查询：按时间段查找艺术流派
    console.log('\n===== 19世纪的艺术流派 =====');
    const nineteenthCenturyMovements = await db.collection('artMovements').find({
      'period.start': { $gte: 1800, $lt: 1900 }
    }).toArray();
    
    console.log(`找到 ${nineteenthCenturyMovements.length} 个19世纪的艺术流派:`);
    nineteenthCenturyMovements.forEach(movement => {
      console.log(`- ${movement.name} (${movement.period.start}-${movement.period.end})`);
    });
    
    // 5. 高级查询：查找特定艺术家的流派
    console.log('\n===== 毕加索相关的艺术流派 =====');
    const picassoMovements = await db.collection('artMovements').find({
      majorArtists: '毕加索'
    }).toArray();
    
    console.log(`找到 ${picassoMovements.length} 个与毕加索相关的艺术流派:`);
    picassoMovements.forEach(movement => {
      console.log(`- ${movement.name}`);
    });
    
    // 6. 聚合查询：按国家统计艺术家数量
    console.log('\n===== 各国艺术家统计 =====');
    const artistsByCountry = await db.collection('artists').aggregate([
      {
        $group: {
          _id: '$nationality',
          count: { $sum: 1 },
          artists: { $push: '$name' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    artistsByCountry.forEach(country => {
      console.log(`${country._id}: ${country.count}人 (${country.artists.join(', ')})`);
    });
    
    return '✅ 数据库查询完成!';
  } catch (error) {
    console.error('❌ 查询数据库失败:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\nMongoDB连接已关闭');
  }
}

// 执行查询
queryDemoDatabase()
  .then(console.log)
  .catch(console.error); 