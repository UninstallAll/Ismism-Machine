# 艺术主义机 (Ismism Machine)

艺术主义机是一个可视化艺术思潮与流派的时间线工具，帮助用户探索和理解不同艺术运动之间的关系和发展历程。

## 项目结构

项目采用前后端分离架构，目录结构如下：

```
Ismism-Machine/
├── client/                  # 前端项目
│   ├── public/              # 静态资源
│   └── src/                 # 源代码
│       ├── api/             # API调用模块
│       ├── components/      # React组件
│       ├── store/           # 状态管理
│       ├── styles/          # 样式文件
│       └── types/           # TypeScript类型定义
├── server/                  # 后端项目
│   └── src/                 # 源代码
│       ├── controllers/     # 控制器
│       ├── models/          # 数据模型
│       └── routes/          # 路由
├── config/                  # 配置文件
└── docs/                    # 文档
```

## 技术栈

### 前端
- React
- TypeScript
- Material UI
- Tailwind CSS
- Zustand (状态管理)
- Axios

### 后端
- Node.js
- Express
- MongoDB
- Mongoose

## 快速开始

### 安装依赖

```bash
# 安装所有依赖（前端和后端）
npm run install-all
```

### 开发模式

```bash
# 同时启动前端和后端服务
npm run dev

# 只启动前端
npm run client

# 只启动后端
npm run server
```

### 构建与部署

```bash
# 构建前端
npm run build

# 启动生产环境服务
npm start

# Docker部署
npm run docker:build
npm run docker:up
```

## 文档

详细文档请参考`docs`目录：
- 启动文档.md - 项目启动和运行说明
- 技术文档.md - 技术实现细节
- deployment.md - 部署指南 