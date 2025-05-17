import api from './axios';

// 获取所有时间线节点
export const fetchTimelineNodes = async () => {
  try {
    console.log('正在请求时间线数据...');
    const response = await api.get('/timeline');
    console.log('获取数据成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取时间线数据失败:', error);
    throw error;
  }
};

// 获取单个节点
export const fetchNodeById = async (id) => {
  try {
    const response = await api.get(`/timeline/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取节点 ${id} 失败:`, error);
    throw error;
  }
};

// 创建新节点
export const createNode = async (nodeData) => {
  try {
    const response = await api.post('/timeline', nodeData);
    return response.data;
  } catch (error) {
    console.error('创建节点失败:', error);
    throw error;
  }
};

// 更新节点
export const updateNode = async (id, nodeData) => {
  try {
    const response = await api.put(`/timeline/${id}`, nodeData);
    return response.data;
  } catch (error) {
    console.error(`更新节点 ${id} 失败:`, error);
    throw error;
  }
};

// 删除节点
export const deleteNode = async (id) => {
  try {
    const response = await api.delete(`/timeline/${id}`);
    return response.data;
  } catch (error) {
    console.error(`删除节点 ${id} 失败:`, error);
    throw error;
  }
}; 