# 主义主义机 (Ismism Machine) 部署指南

本文档提供了多种部署"主义主义机"项目的方法，根据您的需求和技术环境选择合适的方案。

## 目录
1. [本地开发环境](#本地开发环境)
2. [使用Docker部署](#使用docker部署)
3. [手动部署到服务器](#手动部署到服务器)
4. [部署到Vercel](#部署到vercel)
5. [部署到Netlify](#部署到netlify)
6. [常见问题](#常见问题)

## 本地开发环境

### 方法一：使用Node.js直接安装

#### 前提条件
- Node.js (推荐v14.0.0或更高版本)
- npm (v6.0.0或更高版本)

#### 使用nvm管理Node版本（推荐）
如果您使用nvm管理Node.js版本，可以直接运行：
```bash
# 自动使用.nvmrc中指定的Node.js版本
nvm use
# 如果未安装该版本，请先安装
nvm install
```

#### 安装步骤
1. 克隆或下载项目代码
2. 运行启动脚本
   - Windows用户: 双击 `setup.bat`
   - Mac/Linux用户:
     ```bash
     chmod +x setup.sh
     ./setup.sh
     ```

### 方法二：使用Docker Compose（无需安装Node.js）

#### 前提条件
- Docker
- Docker Compose

#### 运行步骤
```bash
# 启动开发环境
docker-compose up

# 后台运行
docker-compose up -d

# 停止环境
docker-compose down
```

应用将在 http://localhost:5173 可访问。

## 使用Docker部署

### 构建Docker镜像
```bash
# 构建镜像
docker build -t ismism-machine:latest .

# 运行容器
docker run -d -p 80:80 --name ismism-machine ismism-machine:latest
```

应用将在 http://localhost 可访问。

### 使用自定义域名
如果需要使用自定义域名，请修改 `nginx.conf` 文件中的 `server_name` 值。

## 手动部署到服务器

### 前提条件
- 服务器上安装了Node.js v14+
- 能够通过SSH访问服务器
- 服务器上安装了Nginx或其他Web服务器

### 部署步骤
1. 在本地构建项目
```bash
npm install
npm run build
```

2. 将 `dist` 目录上传到服务器
```bash
scp -r dist/ user@your-server:/path/to/web/root
```

3. 配置Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/web/root;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. 重启Nginx
```bash
sudo systemctl restart nginx
```

## 部署到Vercel

### 前提条件
- Vercel账号
- 项目代码已上传到GitHub/GitLab/Bitbucket

### 部署步骤
1. 在Vercel控制台中导入项目
2. 选择您的Git仓库
3. 配置项目:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击"Deploy"按钮

## 部署到Netlify

### 前提条件
- Netlify账号
- 项目代码已上传到GitHub/GitLab/Bitbucket

### 部署步骤
1. 在Netlify控制台中点击"New site from Git"
2. 选择您的Git仓库
3. 配置项目:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. 点击"Deploy site"按钮

## 常见问题

### Q: 依赖安装失败怎么办？
A: 请尝试以下解决方案：
- 检查您的Node.js版本是否满足要求（v14+）
- 尝试清除npm缓存: `npm cache clean -f`
- 如果某个依赖包出现问题，可以尝试单独安装: `npm install [package-name]`

### Q: 构建失败怎么办？
A: 构建失败通常与TypeScript类型错误有关，请检查控制台输出的错误信息。如果是类型错误，可以尝试修复相应的代码问题。

### Q: 如何更新依赖版本？
A: 可以使用以下命令检查和更新依赖：
```bash
# 检查过期依赖
npm outdated

# 更新依赖
npm update

# 特定依赖更新到最新版本
npm install [package-name]@latest
```

### Q: 如何为生产环境优化？
A: 生产环境部署考虑以下优化：
- 启用Gzip/Brotli压缩
- 配置合适的缓存策略
- 使用CDN分发静态资源
- 考虑添加内容安全策略(CSP)
- 启用HTTP/2或HTTP/3 