import { create } from 'zustand';
import { fetchTimelineNodes, updateNode, createNode, deleteNode } from './api/timelineApi';

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

export const useTimelineStore = create<TimelineState>((set) => ({
  nodes: [],
  connections: [],
  loading: false,
  error: null,
  
  // 加载节点数据
  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      const nodes = await fetchTimelineNodes();
      set({ nodes, loading: false });
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
    updateNode(id, { position }).catch(error => {
      console.error('更新节点位置失败:', error);
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
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // 删除节点
  removeNode: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteNode(id);
      set(state => ({
        nodes: state.nodes.filter(node => node.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  }
})); 