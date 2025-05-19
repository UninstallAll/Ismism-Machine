import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// MongoDB连接
const uri = 'mongodb://localhost:27017/ismism_machine_db';
let db;

// 连接MongoDB
async function connectToDatabase() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('已连接到MongoDB数据库');
    db = client.db('ismism_machine_db');
    
    // 确保存在必要的集合和索引
    await setupDatabase();
    
    return true;
  } catch (err) {
    console.error('数据库连接错误:', err);
    return false;
  }
}

// 设置数据库集合和索引
async function setupDatabase() {
  try {
    // 检查项目集合是否存在
    const collections = await db.listCollections({ name: 'projects_api' }).toArray();
    if (collections.length === 0) {
      // 创建项目集合
      await db.createCollection('projects_api');
      console.log('创建projects_api集合');
      
      // 创建示例项目
      const sampleProjects = [
        {
          title: '主义机前端开发',
          description: '实现主义机的用户界面和交互功能',
          status: 'active',
          priority: 'high',
          tags: ['前端', 'UI', 'React'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: '主义机后端开发',
          description: '实现主义机的服务器和API功能',
          status: 'active',
          priority: 'high',
          tags: ['后端', 'API', 'Node.js'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: '数据库设计',
          description: '设计和实现主义机的数据库结构',
          status: 'completed',
          priority: 'medium',
          tags: ['数据库', 'MongoDB', '设计'],
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-02-01')
        }
      ];
      
      await db.collection('projects_api').insertMany(sampleProjects);
      console.log('添加示例项目数据');
    }
    
    // 创建索引
    await db.collection('projects_api').createIndex({ title: 'text', description: 'text' });
    await db.collection('projects_api').createIndex({ status: 1 });
    await db.collection('projects_api').createIndex({ tags: 1 });
    await db.collection('projects_api').createIndex({ createdAt: 1 });
    
    console.log('数据库设置完成');
  } catch (err) {
    console.error('数据库设置错误:', err);
    throw err;
  }
}

// API路由
// 获取所有项目
app.get('/api/projects', async (req, res) => {
  try {
    // 解析查询参数
    const { status, search, tag, sort } = req.query;
    const query = {};
    
    // 筛选状态
    if (status) {
      query.status = status;
    }
    
    // 搜索标题和描述
    if (search) {
      query.$text = { $search: search };
    }
    
    // 按标签筛选
    if (tag) {
      query.tags = tag;
    }
    
    // 排序
    let sortOption = { createdAt: -1 }; // 默认按创建时间降序
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption = { [field]: order === 'asc' ? 1 : -1 };
    }
    
    const projects = await db.collection('projects_api')
      .find(query)
      .sort(sortOption)
      .toArray();
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    console.error('获取项目错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取单个项目
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.collection('projects_api').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!project) {
      return res.status(404).json({ success: false, message: '项目不存在' });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error('获取单个项目错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 创建项目
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, status, priority, tags } = req.body;
    
    // 验证必填字段
    if (!title || !description) {
      return res.status(400).json({ success: false, message: '标题和描述为必填项' });
    }
    
    const newProject = {
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('projects_api').insertOne(newProject);
    
    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...newProject
      }
    });
  } catch (err) {
    console.error('创建项目错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新项目
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { title, description, status, priority, tags } = req.body;
    
    // 验证更新数据
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (tags) updateData.tags = tags;
    
    // 添加更新时间
    updateData.updatedAt = new Date();
    
    const result = await db.collection('projects_api').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: '项目不存在' });
    }
    
    // 获取更新后的项目
    const updatedProject = await db.collection('projects_api').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    res.json({
      success: true,
      data: updatedProject
    });
  } catch (err) {
    console.error('更新项目错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除项目
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const result = await db.collection('projects_api').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: '项目不存在' });
    }
    
    res.json({
      success: true,
      message: '项目已成功删除'
    });
  } catch (err) {
    console.error('删除项目错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 项目统计
app.get('/api/projects/stats/summary', async (req, res) => {
  try {
    const stats = await db.collection('projects_api').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    // 获取标签统计
    const tagStats = await db.collection('projects_api').aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        counts: stats.length > 0 ? stats[0] : { total: 0, active: 0, completed: 0, pending: 0 },
        tags: tagStats
      }
    });
  } catch (err) {
    console.error('获取统计错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 启动服务器
connectToDatabase().then(connected => {
  if (connected) {
    app.listen(port, () => {
      console.log(`API服务器运行在 http://localhost:${port}`);
      console.log('可用的API端点:');
      console.log(`GET    http://localhost:${port}/api/projects - 获取所有项目`);
      console.log(`GET    http://localhost:${port}/api/projects/:id - 获取单个项目`);
      console.log(`POST   http://localhost:${port}/api/projects - 创建新项目`);
      console.log(`PUT    http://localhost:${port}/api/projects/:id - 更新项目`);
      console.log(`DELETE http://localhost:${port}/api/projects/:id - 删除项目`);
      console.log(`GET    http://localhost:${port}/api/projects/stats/summary - 项目统计`);
    });
  } else {
    console.error('无法启动服务器，因为数据库连接失败');
  }
}); 