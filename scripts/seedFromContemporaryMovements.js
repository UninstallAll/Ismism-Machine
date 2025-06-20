const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

/**
 * Seed database with contemporary art movements
 */
async function seedContemporaryMovements() {
  // 数据库连接配置
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  const client = new MongoClient(uri);
  
  try {
    // 连接到MongoDB
    await client.connect();
    console.log('已连接到MongoDB');
    
    const db = client.db('ismism_machine_db');
    const collection = db.collection('artmovements');
    
    // 读取contemporary_movements.json文件
    const filePath = path.join(__dirname, '..', 'database', 'example', 'contemporary_movements.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const movements = JSON.parse(fileContent);
    
    console.log(`读取了${movements.length}个当代艺术主义运动`);
    
    // 清除现有数据
    await collection.deleteMany({});
    console.log('已清除现有艺术主义数据');
    
    // 为每个移动添加创建/更新时间戳
    const movementsWithTimestamps = movements.map(movement => ({
      ...movement,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // 插入数据
    const result = await collection.insertMany(movementsWithTimestamps);
    console.log(`成功插入了${result.insertedCount}个当代艺术主义运动`);
    
    // 打印插入的艺术主义列表
    console.log('\n艺术主义列表:');
    movements.forEach((movement, index) => {
      const period = movement.end_year 
        ? `${movement.start_year}-${movement.end_year}`
        : `${movement.start_year}-至今`;
      console.log(`${index + 1}. ${movement.name} (${period})`);
    });
    
  } catch (err) {
    console.error('数据库操作错误:', err);
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行函数
seedContemporaryMovements().catch(console.error); 