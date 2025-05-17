import api from './axios';

// 获取所有时间线节点
export const fetchTimelineNodes = async () => {
  const response = await api.get('/timeline');
  return response.data;
};

// 获取单个节点
export const fetchNodeById = async (id) => {
  const response = await api.get(`/timeline/${id}`);
  return response.data;
};

// 创建新节点
export const createNode = async (nodeData) => {
  const response = await api.post('/timeline', nodeData);
  return response.data;
};

// 更新节点
export const updateNode = async (id, nodeData) => {
  const response = await api.put(`/timeline/${id}`, nodeData);
  return response.data;
};

// 删除节点
export const deleteNode = async (id) => {
  const response = await api.delete(`/timeline/${id}`);
  return response.data;
}; 