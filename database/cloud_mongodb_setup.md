# MongoDB Atlas云数据库设置指南

由于本地MongoDB设置遇到困难，我们可以使用MongoDB Atlas提供的免费云数据库作为替代方案。以下是设置步骤：

## 1. 创建MongoDB Atlas账户

1. 访问[MongoDB Atlas官网](https://www.mongodb.com/cloud/atlas/register)
2. 使用邮箱注册一个新账户
3. 完成注册后登录

## 2. 创建新集群

1. 登录后，点击"Build a Database"按钮
2. 选择"FREE"计划（永久免费）
3. 选择云服务提供商和区域（建议选择距离您最近的区域）
   - AWS, Azure或Google Cloud均可
   - 亚洲用户可选择香港、东京或新加坡区域
4. 保持默认的集群规格（M0 Sandbox）
5. 为集群命名（例如"IsmismMachine"）
6. 点击"Create"按钮创建集群

## 3. 设置数据库访问权限

1. 在左侧导航菜单中点击"Database Access"
2. 点击"Add New Database User"
3. 选择"Password"认证方式
4. 输入用户名（例如"ismism_admin"）
5. 输入或自动生成一个安全密码（请保存此密码！）
6. 权限选择"Read and write to any database"
7. 点击"Add User"完成用户创建

## 4. 设置网络访问权限

1. 在左侧导航菜单中点击"Network Access"
2. 点击"Add IP Address"
3. 选择"Allow Access from Anywhere"（生产环境中建议限制IP范围）
4. 点击"Confirm"

## 5. 获取连接字符串

1. 返回"Database"页面，集群准备完成后点击"Connect"
2. 选择"Connect your application"
3. 驱动选择"Node.js"和最新版本
4. 复制显示的连接字符串，它类似于：
   ```
   mongodb+srv://ismism_admin:<password>@ismsismmachine.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. 将`<password>`替换为您之前创建的密码

## 6. 在项目中配置连接

1. 在项目根目录创建`.env`文件，如果尚未创建
2. 添加以下内容：
   ```
   MONGO_URI=mongodb+srv://ismism_admin:your_password@ismsismmachine.xxxxx.mongodb.net/ismism_machine_db?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key  # 请更改为随机安全字符串
   ```
   注意：
   - 替换`your_password`为您的实际密码
   - 替换连接字符串中的域名部分为您实际的集群域名
   - 添加`/ismism_machine_db`指定数据库名称

## 7. 创建数据库和集合

使用MongoDB Compass连接到云数据库：

1. 下载并安装[MongoDB Compass](https://www.mongodb.com/products/compass)，如果尚未安装
2. 打开MongoDB Compass
3. 在连接字符串字段粘贴您的Atlas连接字符串
4. 点击"Connect"
5. 连接成功后，您可以创建新的数据库和集合：
   - 点击"Create Database"
   - 数据库名称：`ismism_machine_db`
   - 集合名称：`users`（作为初始集合）
   - 点击"Create Database"确认

## 8. 验证连接

修改项目中的数据库连接代码确保使用正确的连接字符串，并运行项目验证连接是否成功。

---

使用MongoDB Atlas的主要优势：
- 无需本地安装和维护MongoDB服务
- 免费套餐提供512MB存储空间，足够开发使用
- 包含自动备份和安全措施
- 可随时从任何地点访问数据库
- 更容易进行团队协作 