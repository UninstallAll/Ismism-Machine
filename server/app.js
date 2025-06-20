const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const artMovementRoutes = require('./routes/artMovementRoutes');
const movementsRoutes = require('./routes/movements');

// 连接数据库
connectDB();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/art-movements', artMovementRoutes);
app.use('/api/movements', movementsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 