import { create } from 'zustand';
import { fetchTimelineNodes, updateNode, createNode, deleteNode } from './api/timelineApi';

// 使用JSDoc替代TypeScript接口
/**
 * @typedef {Object} TimelineNode
 * @property {string} id
 * @property {string} title
 * @property {number} year
 * @property {string} description
 * @property {string} [imageUrl]
 * @property {string[]} artists
 * @property {string} styleMovement
 * @property {string[]} influences
 * @property {string[]} influencedBy
 * @property {{x: number, y: number}} [position]
 */

/**
 * @typedef {Object} Connection
 * @property {string} source
 * @property {string} target
 * @property {string} type
 */

/**
 * @typedef {Object} TimelineState
 * @property {TimelineNode[]} nodes
 * @property {Connection[]} connections
 * @property {boolean} loading
 * @property {string|null} error
 */

export const useTimelineStore = create((set) => ({
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