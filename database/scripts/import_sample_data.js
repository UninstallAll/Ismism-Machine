import { fileURLToPath } from 'url';
import MongoDB from './mongodb_operations.js';

/**
 * 导入样本数据到MongoDB数据库
 */
async function importSampleData() {
  console.log('开始导入样本数据...');
  const mongodb = new MongoDB();
  
  try {
    await mongodb.connect();
    
    // 创建必要的索引
    console.log('创建索引...');
    await mongodb.createIndexes();
    
    // 检查是否已存在数据
    const usersCollection = mongodb.db.collection('users');
    const existingUsers = await usersCollection.countDocuments();
    
    if (existingUsers > 0) {
      console.log('数据库中已存在用户数据。如需重新导入，请先清空集合。');
      return;
    }
    
    // 导入样本数据
    console.log('导入用户数据...');
    const usersData = [
      {
        username: 'admin',
        email: 'admin@ismism.com',
        password: 'hashed_password_123',
        name: '管理员',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: 'hashed_password_456',
        name: '测试用户1',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: 'hashed_password_789',
        name: '测试用户2',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const userInsertResult = await usersCollection.insertMany(usersData);
    console.log(`导入了 ${userInsertResult.insertedCount} 个用户`);
    
    // 获取插入的用户ID
    const userIds = Object.values(userInsertResult.insertedIds);
    
    // 导入项目数据
    console.log('导入项目数据...');
    const projectsCollection = mongodb.db.collection('projects');
    
    const projectsData = [
      {
        title: '主义机核心开发',
        description: '开发主义机的核心功能模块',
        userId: userIds[0],
        status: 'active',
        tags: ['开发', '核心', '重要'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '用户界面改进',
        description: '改进用户界面的交互体验',
        userId: userIds[0],
        status: 'active',
        tags: ['UI', '设计', '前端'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '数据分析工具',
        description: '开发数据分析和可视化工具',
        userId: userIds[1],
        status: 'planning',
        tags: ['分析', '工具', '数据'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '文档编写',
        description: '编写项目文档和用户指南',
        userId: userIds[2],
        status: 'active',
        tags: ['文档', '指南'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const projectInsertResult = await projectsCollection.insertMany(projectsData);
    console.log(`导入了 ${projectInsertResult.insertedCount} 个项目`);
    
    // 获取插入的项目ID
    const projectIds = Object.values(projectInsertResult.insertedIds);
    
    // 导入项目条目
    console.log('导入项目条目数据...');
    const itemsCollection = mongodb.db.collection('items');
    
    const itemsData = [
      {
        name: '设计数据模型',
        description: '设计主义机的核心数据模型',
        projectId: projectIds[0],
        status: 'completed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        name: '实现用户认证',
        description: '实现基于JWT的用户认证系统',
        projectId: projectIds[0],
        status: 'completed',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        name: '开发API接口',
        description: '开发RESTful API接口',
        projectId: projectIds[0],
        status: 'in-progress',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        name: '设计主页布局',
        description: '设计应用的主页布局和组件',
        projectId: projectIds[1],
        status: 'completed',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        name: '实现响应式设计',
        description: '确保应用在不同设备上的响应式显示',
        projectId: projectIds[1],
        status: 'in-progress',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        name: '调研数据可视化库',
        description: '调研并评估适合项目的数据可视化库',
        projectId: projectIds[2],
        status: 'todo',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        name: '编写用户指南',
        description: '编写应用的用户使用指南',
        projectId: projectIds[3],
        status: 'in-progress',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
    
    const itemInsertResult = await itemsCollection.insertMany(itemsData);
    console.log(`导入了 ${itemInsertResult.insertedCount} 个项目条目`);
    
    // 导入艺术家数据
    console.log('导入艺术家数据...');
    const artistsCollection = mongodb.db.collection('artists');
    const artistsData = [
      {
        name: 'Vincent van Gogh',
        bio: '荷兰后印象派画家，代表作《星夜》《向日葵》。',
        image: 'url_to_vangogh.jpg',
        artwork_ids: [],
        movement_ids: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pablo Picasso',
        bio: '西班牙画家、雕塑家，立体主义创始人之一。',
        image: 'url_to_picasso.jpg',
        artwork_ids: [],
        movement_ids: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    const artistInsertResult = await artistsCollection.insertMany(artistsData);
    console.log(`导入了 ${artistInsertResult.insertedCount} 个艺术家`);
    const artistIds = Object.values(artistInsertResult.insertedIds);

    // 导入艺术主义数据
    console.log('导入艺术主义数据...');
    const movementsCollection = mongodb.db.collection('movements');
    const movementsData = [
      {
        name: 'Post-Impressionism',
        description: '后印象主义，强调表现力和个人情感。',
        artist_ids: [artistIds[0]],
        artwork_ids: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cubism',
        description: '立体主义，强调几何形体的分解与重组。',
        artist_ids: [artistIds[1]],
        artwork_ids: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    const movementInsertResult = await movementsCollection.insertMany(movementsData);
    console.log(`导入了 ${movementInsertResult.insertedCount} 个艺术主义`);
    const movementIds = Object.values(movementInsertResult.insertedIds);

    // 导入艺术品数据
    console.log('导入艺术品数据...');
    const artworksCollection = mongodb.db.collection('artworks');
    const artworksData = [
      {
        title: 'Starry Night',
        image: 'url_to_starry_night.jpg',
        artist_id: artistIds[0],
        movement_ids: [movementIds[0]],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Les Demoiselles d\'Avignon',
        image: 'url_to_demoiselles.jpg',
        artist_id: artistIds[1],
        movement_ids: [movementIds[1]],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    const artworkInsertResult = await artworksCollection.insertMany(artworksData);
    console.log(`导入了 ${artworkInsertResult.insertedCount} 个艺术品`);
    const artworkIds = Object.values(artworkInsertResult.insertedIds);

    // 更新artists和movements的artwork_ids、movement_ids、artist_ids
    await artistsCollection.updateOne(
      { _id: artistIds[0] },
      { $set: { artwork_ids: [artworkIds[0]], movement_ids: [movementIds[0]] } }
    );
    await artistsCollection.updateOne(
      { _id: artistIds[1] },
      { $set: { artwork_ids: [artworkIds[1]], movement_ids: [movementIds[1]] } }
    );
    await movementsCollection.updateOne(
      { _id: movementIds[0] },
      { $set: { artwork_ids: [artworkIds[0]], artist_ids: [artistIds[0]] } }
    );
    await movementsCollection.updateOne(
      { _id: movementIds[1] },
      { $set: { artwork_ids: [artworkIds[1]], artist_ids: [artistIds[1]] } }
    );
    
    console.log('样本数据导入完成！');
    
    // 获取并显示项目统计
    const stats = await mongodb.getProjectStatistics();
    console.log('项目统计:', JSON.stringify(stats, null, 2));
    
  } catch (err) {
    console.error('导入样本数据失败:', err);
    throw err;
  } finally {
    await mongodb.close();
  }
}

// 如果直接运行此文件，则执行导入
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  importSampleData()
    .then(() => console.log('导入脚本执行完成'))
    .catch(console.error);
}

export default importSampleData; 