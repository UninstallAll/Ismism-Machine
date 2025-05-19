# MongoDB 本地安装与配置指南 (Windows)

## 下载MongoDB安装包

1. 访问 [MongoDB 官方下载页面](https://www.mongodb.com/try/download/community)
2. 选择以下选项:
   - 版本: 6.0 或更高版本
   - 平台: Windows
   - 包类型: MSI
3. 点击"Download"按钮下载安装程序

## 安装步骤

1. 双击下载的MSI文件启动安装程序
2. 点击"Next"继续
3. 接受许可协议后点击"Next"
4. 选择"Complete"安装类型，点击"Next"
5. 确保勾选"Install MongoDB as a Service"选项
6. 可以选择"Run service as Network Service user"或使用本地系统账户
7. 【重要】确保勾选"Install MongoDB Compass"选项以安装图形界面工具
8. 点击"Next"然后点击"Install"开始安装

## 验证安装

安装完成后，请执行以下步骤确认MongoDB已正确安装:

1. 打开命令提示符或PowerShell(以管理员身份运行)
2. 检查MongoDB服务是否已启动:
   ```
   sc query MongoDB
   ```
3. 如果服务未启动，可以手动启动:
   ```
   net start MongoDB
   ```

## 创建数据目录

如果MongoDB服务无法启动，可能需要手动创建数据目录:

1. 创建数据和日志目录:
   ```
   mkdir C:\data\db
   mkdir C:\data\log
   ```
2. 创建配置文件 `C:\Program Files\MongoDB\Server\6.0\mongod.cfg`:
   ```yaml
   systemLog:
     destination: file
     path: C:\data\log\mongod.log
   storage:
     dbPath: C:\data\db
   ```
3. 重新安装MongoDB服务:
   ```
   "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\6.0\mongod.cfg" --install
   ```
4. 启动服务:
   ```
   net start MongoDB
   ```

## 使用MongoDB Compass

1. 从开始菜单启动MongoDB Compass
2. 使用以下连接字符串连接到本地数据库:
   ```
   mongodb://localhost:27017
   ```
3. 点击"Connect"

## 创建数据库和用户

1. 在Compass中点击"CREATE DATABASE"
2. 数据库名称输入: `ismism_machine_db`
3. 集合名称输入: `users`
4. 点击"Create Database"

### 创建管理员用户

1. 在Compass中，点击左上角的"MONGOSH"打开MongoDB Shell
2. 执行以下命令选择数据库:
   ```javascript
   use ismism_machine_db
   ```
3. 创建管理员用户:
   ```javascript
   db.createUser({
     user: "ismism_admin",
     pwd: "secure_password",  // 建议修改为更安全的密码
     roles: [{ role: "readWrite", db: "ismism_machine_db" }]
   })
   ```

## 配置项目连接

1. 在项目根目录创建.env文件
2. 添加以下内容:
   ```
   MONGO_URI=mongodb://ismism_admin:secure_password@localhost:27017/ismism_machine_db
   JWT_SECRET=your_jwt_secret_key  # 使用随机字符串
   ```

## 故障排除

### MongoDB服务无法启动

- **检查错误日志**: 查看 `C:\data\log\mongod.log`
- **检查数据目录权限**: 确保MongoDB服务账户有权访问数据目录
- **手动启动MongoDB**:
  ```
  "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
  ```

### 连接被拒绝 (ECONNREFUSED)

1. 确认MongoDB服务正在运行
2. 检查防火墙设置，确保允许端口27017的连接
3. 尝试使用localhost替代127.0.0.1:
   ```
   mongodb://localhost:27017
   ```

---

完成以上步骤后，您应该能够成功连接到本地MongoDB数据库并将其集成到Ismism-Machine项目中。 