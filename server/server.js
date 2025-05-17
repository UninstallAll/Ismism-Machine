import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import timelineRoutes from './routes/timeline.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/timeline', timelineRoutes);

// 基础路由 - 测试服务器是否正常运行
app.get('/', (req, res) => {
  res.json({ message: 'Ismism Machine API is running' });
});

// 连接MongoDB (注释掉直到安装MongoDB)
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 