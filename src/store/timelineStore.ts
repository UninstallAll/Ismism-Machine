import { create } from 'zustand';
import { fetchTimelineNodes, updateNode, createNode, deleteNode } from '../api/timelineApi';

// 导入本地数据库
import artStylesData from '../../data/artStyles.json';
import connectionsData from '../../data/connections.json';

interface TimelineNode {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl?: string;
  artists: string[];
  styleMovement: string;
  influences: string[];
  influencedBy: string[];
  position?: { x: number; y: number };
  tags?: string[];
}

interface Connection {
  source: string;
  target: string;
  type: string;
}

interface TimelineState {
  nodes: TimelineNode[];
  connections: Connection[];
  loading: boolean;
  error: string | null;
  fetchNodes: () => Promise<void>;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  addNode: (nodeData: Partial<TimelineNode>) => Promise<void>;
  removeNode: (id: string) => Promise<void>;
  loadArtStylesWithImages: () => Promise<void>;
}

// 将本地数据库的格式转换为应用需要的格式
const mapArtStyleToTimelineNode = (artStyle: any, index: number): TimelineNode => {
  // 图片URL处理
  let imageUrl = `/TestData/${10001 + (index % 30)}.jpg`; // 默认图片
  
  // 如果artStyle中有images属性，使用第一张图片
  if (artStyle.images && artStyle.images.length > 0) {
    imageUrl = artStyle.images[0];
  }
  
  return {
    id: artStyle.id,
    title: artStyle.title,
    year: artStyle.year,
    description: artStyle.description,
    imageUrl: imageUrl,
    artists: artStyle.artists,
    styleMovement: artStyle.styleMovement,
    influences: artStyle.influences || [],
    influencedBy: artStyle.influencedBy || [],
    position: { x: 100 + Math.random() * 800, y: 100 + Math.random() * 300 }, // 随机位置
    tags: artStyle.tags || []
  };
};

// 使用本地数据库中的数据创建节点
const localNodes: TimelineNode[] = artStylesData.map(mapArtStyleToTimelineNode);

// 使用本地数据库中的连接数据
const localConnections: Connection[] = connectionsData.map(conn => ({
  source: conn.source,
  target: conn.target,
  type: conn.type
}));

export const useTimelineStore = create<TimelineState>((set, get) => ({
  nodes: localNodes, // 使用本地数据
  connections: localConnections, // 使用本地数据
  loading: false,
  error: null,
  
  // 尝试加载带图片的艺术风格数据
  loadArtStylesWithImages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/data/artStylesWithImages.json');
      if (response.ok) {
        const data = await response.json();
        
        // 将带图片的艺术风格数据转换为时间线节点
        const nodesWithImages = data.map(mapArtStyleToTimelineNode);
        
        set({ 
          nodes: nodesWithImages,
          loading: false 
        });
      } else {
        // 如果加载失败，保持使用原来的数据
        console.warn('无法加载带图片的艺术风格数据，使用默认数据');
      }
    } catch (error) {
      console.warn('加载带图片的艺术风格数据出错', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // 加载节点数据
  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      // 尝试加载带图片的艺术风格数据
      await get().loadArtStylesWithImages();
      
      // 如果上面的加载失败，会自动回退到默认数据，无需再次设置
      set({ loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // 更新节点位置
  updateNodePosition: (id, position) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, position } : node
      )
    }));
    // 在实际应用中，这里会将更新同步到服务器
    updateNode(id, { position }).catch(error => {
      console.error('更新节点位置失败:', error);
    });
  },
  
  // 添加新节点
  addNode: async (nodeData) => {
    set({ loading: true, error: null });
    try {
      // 在实际应用中，这里会调用API创建节点
      // const newNode = await createNode(nodeData);
      const newNode = {
        id: `${Date.now()}`,
        ...nodeData,
        artists: nodeData.artists || [],
        influences: nodeData.influences || [],
        influencedBy: nodeData.influencedBy || []
      } as TimelineNode;
      
      set(state => ({ 
        nodes: [...state.nodes, newNode],
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // 删除节点
  removeNode: async (id) => {
    set({ loading: true, error: null });
    try {
      // 在实际应用中，这里会调用API删除节点
      // await deleteNode(id);
      set(state => ({
        nodes: state.nodes.filter(node => node.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  }
})); 