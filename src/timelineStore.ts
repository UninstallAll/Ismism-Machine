import { create } from 'zustand';
import { fetchTimelineNodes, updateNode, createNode, deleteNode } from './api/timelineApi';

interface TimelineNode {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl?: string;
  images?: string[];
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

// 示例数据作为备用
const sampleNodes: TimelineNode[] = [
  {
    id: '1',
    title: '印象派',
    year: 1872,
    description: '强调光线和色彩的即时视觉印象，笔触松散可见',
    artists: ['莫奈', '雷诺阿', '德加'],
    styleMovement: 'impressionism',
    influences: ['巴比松画派', '日本浮世绘'],
    influencedBy: [],
    position: { x: 100, y: 150 },
    tags: ['印象派', '法国', '19世纪']
  },
  {
    id: '2',
    title: '立体主义',
    year: 1907,
    description: '将对象分解为几何形状，从多个角度同时表现',
    artists: ['毕加索', '布拉克'],
    styleMovement: 'cubism',
    influences: ['塞尚', '非洲艺术'],
    influencedBy: ['印象派'],
    position: { x: 350, y: 250 },
    tags: ['立体主义', '法国', '20世纪初']
  },
  {
    id: '3',
    title: '超现实主义',
    year: 1924,
    description: '结合梦境与现实，创造超越理性的奇特视觉',
    artists: ['达利', '马格里特', '米罗'],
    styleMovement: 'surrealism',
    influences: ['达达主义', '弗洛伊德心理学'],
    influencedBy: ['立体主义'],
    position: { x: 600, y: 180 },
    tags: ['超现实主义', '法国', '20世纪']
  }
];

export const useTimelineStore = create<TimelineState>((set) => ({
  nodes: [],
  connections: [],
  loading: false,
  error: null,
  
  // 从API加载节点数据
  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      const nodes = await fetchTimelineNodes();
      // 如果API返回空数据，使用示例数据
      if (!nodes || nodes.length === 0) {
        set({ nodes: sampleNodes, loading: false });
        return;
      }
      set({ nodes, loading: false });
      
      // 生成连接关系
      const connections = nodes.reduce<Connection[]>((acc, node) => {
        node.influencedBy.forEach(influencer => {
          const sourceNode = nodes.find(n => n.title.toLowerCase() === influencer.toLowerCase());
          if (sourceNode) {
            acc.push({
              source: sourceNode.id,
              target: node.id,
              type: 'influence'
            });
          }
        });
        return acc;
      }, []);
      set({ connections });
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      // 如果API请求失败，使用示例数据
      set({ 
        nodes: sampleNodes, 
        connections: [
          { source: '1', target: '2', type: 'influence' },
          { source: '2', target: '3', type: 'influence' }
        ],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      });
    }
  },
  
  // 更新节点位置
  updateNodePosition: (id, position) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, position } : node
      )
    }));
    // 同步到服务器
    updateNode(id, { position }).catch(error => {
      console.error('Failed to update node position:', error);
    });
  },
  
  // 添加新节点
  addNode: async (nodeData) => {
    set({ loading: true, error: null });
    try {
      const newNode = await createNode(nodeData);
      set(state => ({ 
        nodes: [...state.nodes, newNode],
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add node',
        loading: false 
      });
      throw error;
    }
  },
  
  // 删除节点
  removeNode: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteNode(id);
      set(state => ({
        nodes: state.nodes.filter(node => node.id !== id),
        connections: state.connections.filter(
          conn => conn.source !== id && conn.target !== id
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove node',
        loading: false 
      });
      throw error;
    }
  }
})); 