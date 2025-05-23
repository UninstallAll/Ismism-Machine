import { MongoClient, ObjectId } from 'mongodb';import { fileURLToPath } from 'url';class MongoDB {
  constructor(uri = 'mongodb://localhost:27017/ismism_machine_db') {
    this.uri = uri;
    this.client = new MongoClient(uri);
    this.db = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db('ismism_machine_db');
      console.log('MongoDB连接成功');
      return this.db;
    } catch (err) {
      console.error('MongoDB连接失败:', err);
      throw err;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB连接已关闭');
    }
  }

  // 用户相关操作
  async createUser(userData) {
    try {
      const result = await this.db.collection('users').insertOne({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`用户创建成功，ID: ${result.insertedId}`);
      return result;
    } catch (err) {
      console.error('创建用户失败:', err);
      throw err;
    }
  }

  async findUserById(userId) {
    try {
      return await this.db.collection('users').findOne({ _id: new ObjectId(userId) });
    } catch (err) {
      console.error('查找用户失败:', err);
      throw err;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const result = await this.db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (err) {
      console.error('更新用户失败:', err);
      throw err;
    }
  }

  // 项目相关操作
  async createProject(projectData) {
    try {
      const result = await this.db.collection('projects').insertOne({
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`项目创建成功，ID: ${result.insertedId}`);
      return result;
    } catch (err) {
      console.error('创建项目失败:', err);
      throw err;
    }
  }

  async findProjectsByUserId(userId) {
    try {
      return await this.db.collection('projects')
        .find({ userId: new ObjectId(userId) })
        .toArray();
    } catch (err) {
      console.error('查找项目失败:', err);
      throw err;
    }
  }

  async updateProject(projectId, updateData) {
    try {
      const result = await this.db.collection('projects').updateOne(
        { _id: new ObjectId(projectId) },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (err) {
      console.error('更新项目失败:', err);
      throw err;
    }
  }

  // 艺术家相关操作
  async createArtist(artistData) {
    try {
      const result = await this.db.collection('artists').insertOne({
        ...artistData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`艺术家创建成功，ID: ${result.insertedId}`);
      return result;
    } catch (err) {
      console.error('创建艺术家失败:', err);
      throw err;
    }
  }

  async findArtistById(artistId) {
    try {
      return await this.db.collection('artists').findOne({ _id: new ObjectId(artistId) });
    } catch (err) {
      console.error('查找艺术家失败:', err);
      throw err;
    }
  }

  async updateArtist(artistId, updateData) {
    try {
      const result = await this.db.collection('artists').updateOne(
        { _id: new ObjectId(artistId) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
      return result;
    } catch (err) {
      console.error('更新艺术家失败:', err);
      throw err;
    }
  }

  // 艺术品相关操作
  async createArtwork(artworkData) {
    try {
      const result = await this.db.collection('artworks').insertOne({
        ...artworkData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`艺术品创建成功，ID: ${result.insertedId}`);
      return result;
    } catch (err) {
      console.error('创建艺术品失败:', err);
      throw err;
    }
  }

  async findArtworkById(artworkId) {
    try {
      return await this.db.collection('artworks').findOne({ _id: new ObjectId(artworkId) });
    } catch (err) {
      console.error('查找艺术品失败:', err);
      throw err;
    }
  }

  async updateArtwork(artworkId, updateData) {
    try {
      const result = await this.db.collection('artworks').updateOne(
        { _id: new ObjectId(artworkId) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
      return result;
    } catch (err) {
      console.error('更新艺术品失败:', err);
      throw err;
    }
  }

  // 艺术主义相关操作
  async createMovement(movementData) {
    try {
      const result = await this.db.collection('movements').insertOne({
        ...movementData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`艺术主义创建成功，ID: ${result.insertedId}`);
      return result;
    } catch (err) {
      console.error('创建艺术主义失败:', err);
      throw err;
    }
  }

  async findMovementById(movementId) {
    try {
      return await this.db.collection('movements').findOne({ _id: new ObjectId(movementId) });
    } catch (err) {
      console.error('查找艺术主义失败:', err);
      throw err;
    }
  }

  async updateMovement(movementId, updateData) {
    try {
      const result = await this.db.collection('movements').updateOne(
        { _id: new ObjectId(movementId) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
      return result;
    } catch (err) {
      console.error('更新艺术主义失败:', err);
      throw err;
    }
  }

  // 创建索引
  async createIndexes() {
    try {
      await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await this.db.collection('users').createIndex({ username: 1 });
      
      await this.db.collection('projects').createIndex({ userId: 1 });
      await this.db.collection('projects').createIndex({ title: 'text', description: 'text' });
      
      await this.db.collection('items').createIndex({ projectId: 1 });
      
      console.log('所有索引创建成功');
    } catch (err) {
      console.error('创建索引失败:', err);
      throw err;
    }
  }

  // 添加示例数据
  async insertSampleData() {
    try {
      // 创建示例用户
      const user = await this.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password',
        name: '测试用户'
      });
      
      // 创建示例项目
      const project1 = await this.createProject({
        title: '主义机开发项目',
        description: '开发主义机平台的主要项目',
        userId: user.insertedId,
        status: 'active',
        tags: ['开发', '主义机', '平台']
      });
      
      const project2 = await this.createProject({
        title: '数据分析项目',
        description: '分析主义机使用数据',
        userId: user.insertedId,
        status: 'planning',
        tags: ['数据', '分析']
      });
      
      // 创建示例条目
      await this.db.collection('items').insertMany([
        {
          name: '主页设计',
          description: '设计主页界面',
          projectId: project1.insertedId,
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: '用户认证',
          description: '实现用户登录和注册功能',
          projectId: project1.insertedId,
          status: 'in-progress',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: '数据模型设计',
          description: '设计数据库模型',
          projectId: project2.insertedId,
          status: 'todo',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      
      console.log('示例数据添加成功');
    } catch (err) {
      console.error('添加示例数据失败:', err);
      throw err;
    }
  }

  // 执行聚合查询
  async getProjectStatistics() {
    try {
      return await this.db.collection('projects').aggregate([
        {
          $lookup: {
            from: 'items',
            localField: '_id',
            foreignField: 'projectId',
            as: 'items'
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            status: 1,
            itemCount: { $size: '$items' },
            completedItems: {
              $size: {
                $filter: {
                  input: '$items',
                  as: 'item',
                  cond: { $eq: ['$$item.status', 'completed'] }
                }
              }
            }
          }
        }
      ]).toArray();
    } catch (err) {
      console.error('获取项目统计失败:', err);
      throw err;
    }
  }
}

// 演示使用方法
async function demo() {
  const mongodb = new MongoDB();
  
  try {
    await mongodb.connect();
    
    // 创建索引
    await mongodb.createIndexes();
    
    // 添加示例数据
    await mongodb.insertSampleData();
    
    // 获取项目统计
    const stats = await mongodb.getProjectStatistics();
    console.log('项目统计:', JSON.stringify(stats, null, 2));
    
    console.log('MongoDB操作演示完成');
  } catch (err) {
    console.error('演示失败:', err);
  } finally {
    await mongodb.close();
  }
}

// 如果直接运行此文件，则执行演示
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  demo().catch(console.error);
}

export default MongoDB; 