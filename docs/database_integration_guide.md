# 艺术主义数据库接入说明

## 数据库接入点

本项目已经配置了艺术主义数据库的接入点，主要包括以下几个部分：

### 1. 后端接入点

后端API已经设置了以下接入点，可以通过这些端点获取艺术主义数据：

- **获取所有艺术主义列表**
  - 端点: `/api/art-movements`
  - 方法: GET
  - 返回: 所有艺术主义的基本信息列表（名称、时期、简要描述）

- **获取单个艺术主义详情**
  - 端点: `/api/art-movements/:id`
  - 方法: GET
  - 参数: id - 艺术主义的MongoDB ID
  - 返回: 指定艺术主义的完整详细信息

- **按时间线获取艺术主义**
  - 端点: `/api/art-movements/timeline/all`
  - 方法: GET
  - 返回: 按开始年份排序的艺术主义列表

- **按标签筛选艺术主义**
  - 端点: `/api/art-movements/filter/tags?tags=标签1,标签2,...`
  - 方法: GET
  - 参数: tags - 逗号分隔的标签列表
  - 返回: 包含指定标签的艺术主义列表

### 2. 前端接入点

要在前端接入数据库，需要进行以下步骤：

1. **创建API服务**
   
   在 `src/api` 目录下创建 `artMovementApi.ts` 文件：

   ```typescript
   import axios from 'axios';

   const API_BASE_URL = 'http://localhost:5000/api';

   export const fetchAllMovements = async () => {
     const response = await axios.get(`${API_BASE_URL}/art-movements`);
     return response.data;
   };

   export const fetchMovementById = async (id: string) => {
     const response = await axios.get(`${API_BASE_URL}/art-movements/${id}`);
     return response.data;
   };

   export const fetchMovementsByTimeline = async () => {
     const response = await axios.get(`${API_BASE_URL}/art-movements/timeline/all`);
     return response.data;
   };

   export const fetchMovementsByTags = async (tags: string[]) => {
     const tagsString = tags.join(',');
     const response = await axios.get(`${API_BASE_URL}/art-movements/filter/tags?tags=${tagsString}`);
     return response.data;
   };
   ```

2. **创建状态管理**

   在 `src/store` 目录下创建 `artMovementStore.ts` 文件：

   ```typescript
   import { create } from 'zustand';
   import { fetchAllMovements, fetchMovementsByTimeline, fetchMovementsByTags } from '../api/artMovementApi';

   interface ArtMovement {
     _id: string;
     name: string;
     period: {
       start: number;
       end: number;
     };
     description: string;
     // 其他字段...
   }

   interface ArtMovementStore {
     movements: ArtMovement[];
     loading: boolean;
     error: string | null;
     fetchMovements: () => Promise<void>;
     fetchTimelineMovements: () => Promise<void>;
     fetchMovementsByTags: (tags: string[]) => Promise<void>;
   }

   export const useArtMovementStore = create<ArtMovementStore>((set) => ({
     movements: [],
     loading: false,
     error: null,
     fetchMovements: async () => {
       set({ loading: true, error: null });
       try {
         const data = await fetchAllMovements();
         set({ movements: data, loading: false });
       } catch (error) {
         set({ error: '加载艺术主义数据失败', loading: false });
       }
     },
     fetchTimelineMovements: async () => {
       set({ loading: true, error: null });
       try {
         const data = await fetchMovementsByTimeline();
         set({ movements: data, loading: false });
       } catch (error) {
         set({ error: '加载时间线数据失败', loading: false });
       }
     },
     fetchMovementsByTags: async (tags) => {
       set({ loading: true, error: null });
       try {
         const data = await fetchMovementsByTags(tags);
         set({ movements: data, loading: false });
       } catch (error) {
         set({ error: '按标签筛选数据失败', loading: false });
       }
     }
   }));
   ```

3. **在组件中使用**

   在 Timeline 组件中使用数据库数据：

   ```tsx
   import { useEffect } from 'react';
   import { useArtMovementStore } from '../store/artMovementStore';

   const Timeline = () => {
     const { movements, loading, error, fetchTimelineMovements } = useArtMovementStore();

     useEffect(() => {
       fetchTimelineMovements();
     }, [fetchTimelineMovements]);

     if (loading) return <div>加载中...</div>;
     if (error) return <div>错误: {error}</div>;

     return (
       <div className="timeline">
         {movements.map(movement => (
           <div key={movement._id} className="timeline-node">
             <h3>{movement.name}</h3>
             <p>{movement.period.start} - {movement.period.end}</p>
             <p>{movement.description}</p>
           </div>
         ))}
       </div>
     );
   };

   export default Timeline;
   ```

## 配置说明

1. **数据库配置**
   - 数据库连接字符串在 `.env` 文件中配置
   - 默认连接到 `mongodb://localhost:27017/artism-db`
   - 如果使用云数据库，请修改为相应的连接字符串

2. **API服务配置**
   - API服务默认运行在 `http://localhost:5000`
   - 可以通过修改 `.env` 文件中的 `PORT` 变量更改端口

## 启动服务

1. **安装依赖**
   ```bash
   npm install mongoose express dotenv cors
   ```

2. **导入初始数据**
   ```bash
   node scripts/seedDatabase.js
   ```

3. **启动API服务**
   ```bash
   node src/app.js
   ```

4. **验证服务**
   - 访问 http://localhost:5000/api/art-movements 查看是否返回数据

## 注意事项

1. 确保MongoDB服务已经启动
2. 确保已安装所有必要的依赖包
3. 前端项目需要安装axios和zustand 