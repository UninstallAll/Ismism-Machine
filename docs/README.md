# 主义主义机 (Ismism Machine)

主义主义机是一个交互式的艺术流派可视化平台，用于展示和探索各种艺术主义(ism)之间的关系。项目使用React、Vite和TailwindCSS构建，支持交互式时间线、多层级分类系统和AI辅助艺术创作功能。

## 项目特性

- 📊 **交互式时间线**：可视化展示艺术流派的发展历程
- 🔄 **多层级分类**：通过不同的属性和关系对艺术流派进行分类
- 🏷️ **关键词标签**：使用标签系统快速筛选艺术流派
- 🌐 **响应式设计**：适配桌面和移动设备的界面
- 🎨 **AI生图支持**：基于艺术风格的AI图像生成功能

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：TailwindCSS + CSS Modules
- **状态管理**：Zustand
- **部署方案**：Docker / Nginx

## 快速开始

### 方法一：使用Node.js

#### 前提条件
- Node.js v18.12.1或更高版本
- npm v8.0.0或更高版本

```bash
# 克隆仓库
git clone https://github.com/yourusername/ismism-machine.git
cd ismism-machine

# Windows系统
.\install.bat

# Mac/Linux系统
chmod +x setup.sh
./setup.sh
```

### 方法二：使用Docker

#### 前提条件
- 安装Docker和Docker Compose

```bash
# 开发环境
docker-compose up

# 生产环境
docker build -t ismism-machine:latest .
docker run -d -p 80:80 --name ismism-machine ismism-machine:latest
```

## 项目结构

```
Ismism-Machine/
├── public/             # 静态资源
├── src/
│   ├── components/     # 组件目录
│   │   ├── Navbar.tsx  # 导航栏组件
│   │   ├── Sidebar.tsx # 侧边栏组件
│   │   └── ...         # 其他组件
│   ├── App.tsx         # 主应用组件
│   ├── main.tsx        # 入口文件
│   └── index.css       # 全局样式
├── Dockerfile          # Docker构建文件
├── docker-compose.yml  # Docker Compose配置
├── setup.sh            # Unix/Linux安装脚本
├── install.bat         # Windows安装脚本
└── ...                 # 其他配置文件
```

## 开发指南

### 本地开发

启动本地开发服务器:

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 部署

详细的部署指南请参考 [deployment.md](deployment.md) 文档。

## 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[MIT License](LICENSE) 