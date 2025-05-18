const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const artMovementRoutes = require('./routes/artMovementRoutes');

// 连接数据库
connectDB();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/art-movements', artMovementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));

module.exports = app; 