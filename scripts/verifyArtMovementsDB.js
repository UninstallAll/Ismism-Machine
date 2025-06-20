const { MongoClient } = require('mongodb');

/**
 * 验证艺术主义数据库是否正确填充
 */
async function verifyArtMovementsDB() {
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  const client = new MongoClient(uri);
  
  try {
    // 连接到MongoDB
    await client.connect();
    console.log('已连接到MongoDB');
    
    const db = client.db('ismism_machine_db');
    const collection = db.collection('artmovements');
    
    // 获取艺术主义总数
    const count = await collection.countDocuments();
    console.log(`数据库中共有 ${count} 个艺术主义`);
    
    // 获取所有艺术主义名称
    const movements = await collection.find({}, { projection: { name: 1, start_year: 1, end_year: 1 } }).sort({ name: 1 }).toArray();
    
    console.log('\n艺术主义列表:');
    movements.forEach((movement, index) => {
      const period = movement.end_year 
        ? `${movement.start_year}-${movement.end_year}`
        : `${movement.start_year}-至今`;
      console.log(`${index + 1}. ${movement.name} (${period})`);
    });
    
    // 获取一个示例艺术主义的详细信息
    if (movements.length > 0) {
      const sampleMovement = await collection.findOne({ _id: movements[0]._id });
      console.log('\n示例艺术主义详细信息:');
      console.log(`名称: ${sampleMovement.name}`);
      console.log(`描述: ${sampleMovement.description.substring(0, 150)}...`);
      console.log(`理论基础: ${sampleMovement.theoretical_foundation || '未指定'}`);
      console.log(`代表艺术家: ${sampleMovement.representative_artists.length > 0 ? 
        sampleMovement.representative_artists.map(a => a.name).join(', ') : '未指定'}`);
      console.log(`标签: ${sampleMovement.tags.join(', ')}`);
    }
    
    console.log('\n数据库验证完成!');
    
  } catch (err) {
    console.error('数据库操作错误:', err);
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行函数
verifyArtMovementsDB().catch(console.error); 