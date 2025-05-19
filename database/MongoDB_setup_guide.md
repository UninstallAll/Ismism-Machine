# MongoDB 数据库搭建与集成指南

## 项目概述

本文档详细说明如何将 MongoDB 数据库集成到 Ismism-Machine 项目中，包括所需环境、搭建步骤、集成方法及开发时间线。

## 环境要求

- Node.js 16+ 
- MongoDB 6.0+
- Mongoose 7.0+
- Express 4.18+

## 团队分工

### 数据库与后端工程师职责
- MongoDB 数据库设计与搭建
- MongoDB 与 Node.js 后端连接配置
- API 端点开发与数据模型实现
- 数据库性能优化与安全配置

### 前端集成工程师职责
- 前端 API 服务封装
- 数据获取与状态管理
- UI 组件数据绑定
- 用户交互数据处理

## 实施步骤

### 1. MongoDB 安装与配置

#### 1.1 安装 MongoDB

**Windows:**
```bash
# 下载并运行 MongoDB 安装程序
# 通过 MongoDB Compass 图形界面管理数据库
```

**Linux/MacOS:**
```bash
# 使用包管理器安装
brew install mongodb-community  # MacOS
sudo apt-get install mongodb    # Ubuntu
```

#### 1.2 创建数据库

```javascript
use ismism_machine_db
```

#### 1.3 设置用户权限

```javascript
db.createUser({
  user: "ismism_admin",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "ismism_machine_db" }]
})
```

### 2. 后端集成

#### 2.1 安装依赖

```bash
npm install mongoose dotenv express-validator
```

#### 2.2 配置数据库连接

在 `server/config/db.js` 中：

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB 连接成功');
  } catch (err) {
    console.error('MongoDB 连接失败', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

在 `.env` 文件中添加：

```
MONGO_URI=mongodb://ismism_admin:secure_password@localhost:27017/ismism_machine_db
```

#### 2.3 数据模型定义

在 `server/models/` 目录下创建所需模型：

**User.js:**
```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
```

**Post.js:**
```javascript
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);
```

#### 2.4 API 路由实现

**routes/api/users.js:**
```javascript
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// @route    POST api/users
// @desc     注册用户
// @access   Public
router.post(
  '/',
  [
    check('username', '用户名必填').not().isEmpty(),
    check('email', '请提供有效邮箱').isEmail(),
    check('password', '密码至少需要6个字符').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: '用户已存在' }] });
      }

      user = new User({
        username,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

module.exports = router;
```

### 3. 前端集成

#### 3.1 API 服务创建

在 `client/src/api/index.js` 中：

```javascript
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// 请求拦截器，添加 token
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// 用户相关 API
export const signIn = (formData) => API.post('/auth', formData);
export const signUp = (formData) => API.post('/users', formData);
export const getProfile = () => API.get('/profile/me');

// 内容相关 API
export const fetchPosts = () => API.get('/posts');
export const fetchPost = (id) => API.get(`/posts/${id}`);
export const createPost = (newPost) => API.post('/posts', newPost);
export const updatePost = (id, updatedPost) => API.put(`/posts/${id}`, updatedPost);
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const likePost = (id) => API.put(`/posts/like/${id}`);
export const commentPost = (id, commentData) => API.post(`/posts/comment/${id}`, commentData);
```

#### 3.2 Redux 状态管理

**store/slices/authSlice.js:**
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';

export const signin = createAsyncThunk(
  'auth/signin',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.signIn(formData);
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.signUp(formData);
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signin.pending, (state) => {
        state.loading = true;
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

## 开发时间线

### 第1周：数据库设计与基础架构
- 数据库架构设计和用户权限配置
- 基础数据模型实现
- 数据库连接设置与测试

### 第2周：核心API开发
- 用户认证API实现
- 内容管理API实现
- API安全性和性能优化

### 第3周：前端集成
- 前端API服务开发
- 状态管理与数据流设计
- 组件数据绑定实现

### 第4周：测试与优化
- 集成测试与API性能测试
- 数据库性能优化
- 前端数据加载优化

## 测试与验证

### API测试
```bash
# 使用Postman或类似工具测试所有API端点
# 创建测试套件验证每个数据操作
```

### 数据库性能监控
```javascript
// 在关键查询上添加性能日志
const startTime = Date.now();
const results = await Model.find().limit(100);
console.log(`查询耗时: ${Date.now() - startTime}ms`);
```

## 部署注意事项

1. 确保生产环境中使用环境变量管理数据库连接字符串
2. 配置适当的数据库备份策略
3. 实施数据库连接池以提高性能
4. 对敏感数据进行加密
5. 实施适当的错误处理和监控

## 故障排除

### 常见连接问题

1. 检查MongoDB服务是否正在运行
```bash
systemctl status mongodb
```

2. 验证连接字符串是否正确
3. 确认网络设置允许数据库连接
4. 检查用户权限配置

### 性能问题

1. 添加适当的索引
```javascript
// 为经常查询的字段添加索引
UserSchema.index({ email: 1 });
PostSchema.index({ user: 1, date: -1 });
```

2. 使用投影减少返回数据量
```javascript
const user = await User.findById(id).select('-password');
```

3. 使用分页减轻大型集合的负担
```javascript
const page = 1;
const limit = 10;
const posts = await Post.find()
  .skip((page - 1) * limit)
  .limit(limit)
  .sort({ date: -1 });
```

---

*本文档由技术团队编写，旨在指导Ismism-Machine项目中MongoDB数据库的搭建与集成工作。* 