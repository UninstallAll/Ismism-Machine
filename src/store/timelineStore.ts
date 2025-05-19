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
}

// 将本地数据库的格式转换为应用需要的格式
const mapArtStyleToTimelineNode = (artStyle: any): TimelineNode => ({
  id: artStyle.id,
  title: artStyle.title,
  year: artStyle.year,
  description: artStyle.description,
  imageUrl: `/images/${artStyle.id}/main.jpg`, // 默认主图片路径
  artists: artStyle.artists,
  styleMovement: artStyle.styleMovement,
  influences: artStyle.influences || [],
  influencedBy: artStyle.influencedBy || [],
  position: { x: 100 + Math.random() * 800, y: 100 + Math.random() * 300 }, // 随机位置
  tags: artStyle.tags || []
});

// 使用本地数据库中的数据创建节点
const localNodes: TimelineNode[] = artStylesData.map(mapArtStyleToTimelineNode);

// 使用本地数据库中的连接数据
const localConnections: Connection[] = connectionsData.map(conn => ({
  source: conn.source,
  target: conn.target,
  type: conn.type
}));

export const useTimelineStore = create<TimelineState>((set) => ({
  nodes: localNodes, // 使用本地数据
  connections: localConnections, // 使用本地数据
  loading: false,
  error: null,
  
  // 加载节点数据
  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      // 使用本地数据，模拟API加载
      setTimeout(() => {
        set({ 
          nodes: localNodes, 
          connections: localConnections,
          loading: false 
        });
      }, 300); // 模拟加载延迟
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