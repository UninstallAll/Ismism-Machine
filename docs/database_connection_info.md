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