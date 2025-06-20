const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

/**
 * Seed database with all contemporary art movements from multiple JSON files
 */
async function seedAllArtMovements() {
  // 数据库连接配置
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  const client = new MongoClient(uri);
  
  try {
    // 连接到MongoDB
    await client.connect();
    console.log('已连接到MongoDB');
    
    const db = client.db('ismism_machine_db');
    const collection = db.collection('artmovements');
    
    // 清除现有数据
    await collection.deleteMany({});
    console.log('已清除现有艺术主义数据');
    
    // 读取所有JSON文件
    const jsonFiles = [
      'database/example/contemporary_movements.json',
      'database/example/contemporary_movements_part2.json',
      'database/example/contemporary_movements_part3.json'
    ];
    
    let allMovements = [];
    
    // 从每个文件加载艺术主义数据
    for (const filePath of jsonFiles) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        console.log(`读取文件: ${fullPath}`);
        
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const movements = JSON.parse(fileContent);
        
        console.log(`从 ${path.basename(filePath)} 读取了 ${movements.length} 个艺术主义`);
        allMovements = [...allMovements, ...movements];
      } catch (err) {
        console.error(`读取文件 ${filePath} 失败:`, err);
      }
    }
    
    // 为每个移动添加创建/更新时间戳
    const movementsWithTimestamps = allMovements.map(movement => ({
      ...movement,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // 插入数据
    const result = await collection.insertMany(movementsWithTimestamps);
    console.log(`成功插入了 ${result.insertedCount} 个当代艺术主义运动`);
    
    // 打印插入的艺术主义列表
    console.log('\n艺术主义列表:');
    movementsWithTimestamps.forEach((movement, index) => {
      const period = movement.end_year 
        ? `${movement.start_year}-${movement.end_year}`
        : `${movement.start_year}-至今`;
      console.log(`${index + 1}. ${movement.name} (${period})`);
    });
    
    // 创建索引
    console.log('\n创建索引...');
    await collection.createIndex({ name: 1 }, { unique: true });
    await collection.createIndex({ start_year: 1, end_year: 1 });
    await collection.createIndex({ tags: 1 });
    console.log('索引创建完成');
    
  } catch (err) {
    console.error('数据库操作错误:', err);
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行函数
seedAllArtMovements().catch(console.error); 