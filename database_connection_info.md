# 艺术主义数据库接入位置说明

## 数据库接入位置

根据项目配置，艺术主义数据库的接入位置如下：

### 后端接入位置

1. **数据库连接配置**
   - 文件: `src/config/database.js`
   - 连接字符串: 从 `.env` 文件中的 `MONGODB_URI` 变量获取
   - 默认连接到: `mongodb://localhost:27017/artism-db`

2. **数据模型定义**
   - 文件: `src/models/ArtMovement.js`
   - 模型名称: `ArtMovement`
   - 集合名称: 自动生成为 `artmovements`（MongoDB会自动将模型名称转为小写复数形式）

3. **API接入点**
   - 主文件: `src/app.js`
   - API路由前缀: `/api/art-movements`
   - 可用端点:
     - GET `/api/art-movements` - 获取所有艺术主义
     - GET `/api/art-movements/:id` - 获取单个艺术主义详情
     - GET `/api/art-movements/timeline/all` - 按时间线获取艺术主义
     - GET `/api/art-movements/filter/tags` - 按标签筛选艺术主义

### 前端接入位置

要将数据库与前端集成，需要在以下位置添加代码：

1. **API服务**
   - 建议位置: `src/api/artMovementApi.ts`
   - 功能: 封装与后端API的通信

2. **状态管理**
   - 建议位置: `src/store/artMovementStore.ts`
   - 功能: 使用Zustand管理艺术主义数据状态

3. **组件集成**
   - 建议位置: 各个需要使用艺术主义数据的组件中
   - 示例: `src/components/Timeline.tsx` - 在时间线组件中展示艺术主义数据

## 数据流向

数据在系统中的流向如下：

```
MongoDB数据库 → 后端API服务 → 前端API服务 → 前端状态管理 → React组件
```

1. 数据存储在MongoDB数据库中
2. 通过Express后端API提供数据访问
3. 前端通过API服务调用后端接口
4. 数据通过状态管理存储在前端
5. 组件从状态管理中获取并显示数据

## 启动步骤

1. 确保MongoDB服务已启动
2. 运行 `node scripts/seedDatabase.js` 导入初始数据
3. 运行 `node src/app.js` 启动API服务
4. 启动前端开发服务器 `npm run dev`
5. 访问前端应用，数据将从数据库加载

## 验证数据库连接

可以通过访问以下URL验证数据库连接是否成功：

```
http://localhost:5000/api/art-movements
```

如果返回JSON数据，则表示数据库连接成功。

# MongoDB 数据库连接信息

## 连接参数

- **数据库类型**: MongoDB
- **服务器地址**: localhost (127.0.0.1)
- **端口**: 27017
- **数据库名**: ismism_machine_db
- **连接字符串**: `mongodb://localhost:27017/ismism_machine_db`

## 身份验证信息

- **用户名**: ismism_admin
- **密码**: secure_password
- **认证数据库**: ismism_machine_db
- **身份验证连接字符串**: `mongodb://ismism_admin:secure_password@localhost:27017/ismism_machine_db`

## 数据库结构

### 集合 (Collections)

1. **users** - 用户信息
   - _id: ObjectId
   - username: String
   - email: String (唯一索引)
   - password: String (加密后的密码)
   - name: String
   - createdAt: Date
   - updatedAt: Date

2. **projects** - 项目信息
   - _id: ObjectId
   - title: String
   - description: String
   - userId: ObjectId (外键关联到users集合)
   - status: String (active, completed, archived)
   - tags: Array
   - createdAt: Date
   - updatedAt: Date

3. **items** - 项目条目
   - _id: ObjectId
   - name: String
   - description: String
   - projectId: ObjectId (外键关联到projects集合)
   - status: String (todo, in-progress, completed)
   - createdAt: Date
   - updatedAt: Date

## 索引信息

- **users.email**: 唯一索引
- **users.username**: 普通索引
- **projects.userId**: 普通索引
- **projects.title, projects.description**: 文本索引
- **items.projectId**: 普通索引

## 连接代码示例

### 使用Node.js连接

```javascript
import { MongoClient } from 'mongodb';

async function connectToDatabase() {
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  // 使用身份验证时
  // const uri = 'mongodb://ismism_admin:secure_password@localhost:27017/ismism_machine_db';
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('已连接到MongoDB');
    
    const db = client.db('ismism_machine_db');
    return db;
  } catch (err) {
    console.error('MongoDB连接错误:', err);
    throw err;
  }
}
```

### 使用连接管理器连接

```javascript
import dbConnection from './database/scripts/db_connection.js';

async function example() {
  try {
    // 获取数据库实例
    const db = await dbConnection.getDb();
    
    // 获取集合
    const usersCollection = await dbConnection.getCollection('users');
    
    // 执行查询
    const users = await usersCollection.find({}).toArray();
    console.log('用户列表:', users);
  } catch (err) {
    console.error('操作失败:', err);
  } finally {
    // 关闭连接 (在应用程序关闭时)
    // await dbConnection.close();
  }
}
```

## 注意事项

1. 在生产环境中，必须更改默认密码
2. 确保MongoDB服务已启动
3. 使用适当的索引来优化查询性能
4. 建议使用连接池来管理数据库连接 