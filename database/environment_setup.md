# Ismism-Machine 项目环境配置指南

本文档提供在 Windows 系统上配置 Ismism-Machine 项目所需环境的详细步骤。

## 环境要求

- Node.js 16+ 
- MongoDB 6.0+
- Mongoose 7.0+
- Express 4.18+

## 安装步骤

### 1. 安装 Node.js

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 Node.js 16.x 或更高版本的 Windows 安装程序
3. 运行安装程序，按照向导完成安装
4. 安装完成后，打开命令提示符验证安装：
   ```bash
   node --version
   npm --version
   ```

### 2. 安装 MongoDB

1. 访问 [MongoDB 下载页面](https://www.mongodb.com/try/download/community)
2. 选择 MongoDB Community Server 6.0 或更高版本
3. 选择 Windows 平台，下载 MSI 安装包
4. 运行安装程序，选择"完整"安装类型
5. 可选：安装 MongoDB Compass（图形化管理工具）
6. 确保选择"将 MongoDB 作为服务运行"选项
7. 完成安装后，MongoDB 服务应自动启动
8. 验证 MongoDB 服务是否正在运行：
   ```bash
   # 在命令提示符或 PowerShell 中执行
   sc query mongodb
   ```

### 3. 安装项目依赖

1. 克隆项目仓库（如果尚未完成）
2. 打开命令提示符或 PowerShell，导航到项目根目录
3. 运行以下命令安装项目依赖：
   ```bash
   npm install
   ```
   这将安装 package.json 中定义的所有依赖，包括 Express 和 Mongoose

### 4. 配置 MongoDB 数据库

1. 打开 MongoDB Compass
2. 连接到本地 MongoDB 服务器（默认 URI: `mongodb://localhost:27017`）
3. 创建新数据库：
   - 数据库名称：`ismism_machine_db`
4. 创建管理员用户：
   - 打开 MongoDB Shell（在 Compass 中或通过命令行）
   - 执行以下命令：
   ```javascript
   use ismism_machine_db
   db.createUser({
     user: "ismism_admin",
     pwd: "secure_password",  // 更改为安全密码
     roles: [{ role: "readWrite", db: "ismism_machine_db" }]
   })
   ```

### 5. 配置环境变量

1. 在项目根目录创建 `.env` 文件
2. 添加以下内容：
   ```
   MONGO_URI=mongodb://ismism_admin:secure_password@localhost:27017/ismism_machine_db
   JWT_SECRET=your_jwt_secret_key  # 更改为随机安全字符串
   ```

### 6. 验证配置

1. 启动后端服务器：
   ```bash
   npm run dev
   # 或
   node server/index.js
   ```
2. 检查终端输出，确认 MongoDB 连接成功消息

## 常见问题解决

### MongoDB 连接失败

1. 确保 MongoDB 服务正在运行
   ```bash
   sc query mongodb
   # 如果服务未运行，可以启动它
   net start mongodb
   ```
2. 检查连接字符串是否正确
3. 验证用户名和密码
4. 确认防火墙未阻止连接

### Node.js 版本不兼容

如果遇到 Node.js 版本不兼容问题，可以使用 NVM for Windows 管理多个 Node.js 版本：

1. 下载并安装 [NVM for Windows](https://github.com/coreybutler/nvm-windows/releases)
2. 安装并使用与项目兼容的 Node.js 版本：
   ```bash
   nvm install 16.x.x
   nvm use 16.x.x
   ```

### 依赖安装失败

如果 npm 依赖安装失败，尝试以下解决方案：

1. 清除 npm 缓存：
   ```bash
   npm cache clean --force
   ```
2. 使用管理员权限运行命令提示符
3. 检查网络连接，必要时使用代理

## 后续步骤

环境配置完成后，请参考项目根目录中的 `README.md` 和 `database/MongoDB_setup_guide.md` 文档，了解如何启动项目、开发新功能以及进行数据库操作。

---

如有任何问题或需要进一步的帮助，请联系项目管理员。 