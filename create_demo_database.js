import { MongoClient } from 'mongodb';

/**
 * 创建演示数据库
 */
async function createDemoDatabase() {
  // MongoDB连接URI
  const uri = 'mongodb://localhost:27017/';
  const dbName = 'ismism_demo_db';
  
  const client = new MongoClient(uri);

  try {
    console.log('正在连接到MongoDB...');
    await client.connect();
    console.log('✅ MongoDB连接成功!');
    
    // 获取数据库实例 (如果不存在会自动创建)
    const db = client.db(dbName);
    console.log(`\n===== 创建数据库: ${dbName} =====`);
    
    // 1. 创建艺术流派集合
    console.log('\n1. 创建"artMovements"集合');
    if (!(await db.listCollections({name: 'artMovements'}).toArray()).length) {
      await db.createCollection('artMovements');
      console.log('   ✅ "artMovements"集合创建成功');
    } else {
      console.log('   ⚠️ "artMovements"集合已存在');
    }
    
    // 2. 创建艺术家集合
    console.log('\n2. 创建"artists"集合');
    if (!(await db.listCollections({name: 'artists'}).toArray()).length) {
      await db.createCollection('artists');
      console.log('   ✅ "artists"集合创建成功');
    } else {
      console.log('   ⚠️ "artists"集合已存在');
    }
    
    // 3. 创建作品集合
    console.log('\n3. 创建"artworks"集合');
    if (!(await db.listCollections({name: 'artworks'}).toArray()).length) {
      await db.createCollection('artworks');
      console.log('   ✅ "artworks"集合创建成功');
    } else {
      console.log('   ⚠️ "artworks"集合已存在');
    }
    
    // 4. 插入示例数据 - 艺术流派
    const artMovementsCollection = db.collection('artMovements');
    
    // 先清空集合
    await artMovementsCollection.deleteMany({});
    
    const artMovementsData = [
      {
        name: '印象派',
        period: { start: 1867, end: 1886 },
        description: '印象派是19世纪后期在法国兴起的艺术运动，强调捕捉光线和色彩的瞬间效果，户外写生，以及对日常生活场景的描绘。',
        keyCharacteristics: ['户外写生', '捕捉光影', '色彩鲜明', '笔触可见', '日常生活场景'],
        majorArtists: ['莫奈', '雷诺阿', '德加', '毕沙罗'],
        keyArtworks: [
          { 
            title: '印象·日出', 
            artist: '莫奈',
            year: 1872
          }
        ],
        influences: ['浮世绘', '现实主义'],
        influencedMovements: ['后印象派', '野兽派'],
        tags: ['现代艺术', '法国', '19世纪']
      },
      {
        name: '立体主义',
        period: { start: 1907, end: 1922 },
        description: '立体主义是20世纪初由毕加索和布拉克发起的革命性艺术运动，它打破了传统的视角，从多个角度同时表现对象，强调几何形状和平面。',
        keyCharacteristics: ['多角度视觉', '几何形状', '单色调', '平面化', '拼贴'],
        majorArtists: ['毕加索', '布拉克', '格里斯', '莱热'],
        keyArtworks: [
          { 
            title: '亚维农少女', 
            artist: '毕加索',
            year: 1907
          }
        ],
        influences: ['塞尚', '非洲雕塑'],
        influencedMovements: ['未来主义', '达达主义', '构成主义'],
        tags: ['现代艺术', '法国', '西班牙', '20世纪']
      },
      {
        name: '超现实主义',
        period: { start: 1924, end: 1966 },
        description: '超现实主义是一种文化运动，始于1920年代，强调无意识、梦境和想象的力量，通过奇特的意象和非理性的并置来表达。',
        keyCharacteristics: ['梦境意象', '无意识', '奇异并置', '自动性技法', '悖论'],
        majorArtists: ['达利', '马格里特', '恩斯特', '米罗'],
        keyArtworks: [
          { 
            title: '记忆的永恒', 
            artist: '达利',
            year: 1931
          }
        ],
        influences: ['达达主义', '精神分析学'],
        influencedMovements: ['抽象表现主义', '波普艺术'],
        tags: ['现代艺术', '跨国', '20世纪']
      }
    ];
    
    const artMovementsResult = await artMovementsCollection.insertMany(artMovementsData);
    console.log(`\n4. 在"artMovements"集合中插入了 ${artMovementsResult.insertedCount} 条数据`);
    
    // 5. 插入示例数据 - 艺术家
    const artistsCollection = db.collection('artists');
    
    // 先清空集合
    await artistsCollection.deleteMany({});
    
    const artistsData = [
      {
        name: '克劳德·莫奈',
        englishName: 'Claude Monet',
        birthYear: 1840,
        deathYear: 1926,
        nationality: '法国',
        movements: ['印象派'],
        bio: '克劳德·莫奈是印象派的创始人之一，以其对光线和色彩的研究而闻名，尤其是他的睡莲系列作品。',
        notableWorks: ['印象·日出', '睡莲', '卢昂大教堂系列']
      },
      {
        name: '巴勃罗·毕加索',
        englishName: 'Pablo Picasso',
        birthYear: 1881,
        deathYear: 1973,
        nationality: '西班牙',
        movements: ['立体主义', '象征主义', '超现实主义'],
        bio: '巴勃罗·毕加索是20世纪最具影响力的艺术家之一，他与乔治·布拉克共同创立了立体主义。',
        notableWorks: ['亚维农少女', '格尔尼卡', '爱的梦']
      },
      {
        name: '萨尔瓦多·达利',
        englishName: 'Salvador Dalí',
        birthYear: 1904,
        deathYear: 1989,
        nationality: '西班牙',
        movements: ['超现实主义'],
        bio: '萨尔瓦多·达利是超现实主义的代表人物，以其怪诞的意象和卓越的技术而闻名。',
        notableWorks: ['记忆的永恒', '梦的诱惑', '内战的预感']
      }
    ];
    
    const artistsResult = await artistsCollection.insertMany(artistsData);
    console.log(`5. 在"artists"集合中插入了 ${artistsResult.insertedCount} 条数据`);
    
    // 6. 显示数据库信息
    console.log('\n===== 数据库创建成功 =====');
    console.log(`数据库名称: ${dbName}`);
    
    const collections = await db.listCollections().toArray();
    console.log('集合列表:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // 7. 统计集合中的文档数量
    const artMovementsCount = await artMovementsCollection.countDocuments();
    const artistsCount = await artistsCollection.countDocuments();
    
    console.log('\n文档数量统计:');
    console.log(`- artMovements集合: ${artMovementsCount}个艺术流派`);
    console.log(`- artists集合: ${artistsCount}个艺术家`);
    
    return '✅ 演示数据库创建成功!';
  } catch (error) {
    console.error('❌ 创建数据库失败:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\nMongoDB连接已关闭');
  }
}

// 执行创建数据库操作
createDemoDatabase()
  .then(console.log)
  .catch(console.error); 