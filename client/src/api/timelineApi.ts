import api from './axios';

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

// 获取所有时间线节点
export const fetchTimelineNodes = async (): Promise<TimelineNode[]> => {
  const response = await api.get('/timeline');
  return response.data;
};

// 获取单个节点
export const fetchNodeById = async (id: string): Promise<TimelineNode> => {
  const response = await api.get(`/timeline/${id}`);
  return response.data;
};

// 创建新节点
export const createNode = async (nodeData: Partial<TimelineNode>): Promise<TimelineNode> => {
  const response = await api.post('/timeline', nodeData);
  return response.data;
};

// 更新节点
export const updateNode = async (id: string, nodeData: Partial<TimelineNode>): Promise<TimelineNode> => {
  const response = await api.put(`/timeline/${id}`, nodeData);
  return response.data;
};

// 删除节点
export const deleteNode = async (id: string): Promise<void> => {
  await api.delete(`/timeline/${id}`);
}; 