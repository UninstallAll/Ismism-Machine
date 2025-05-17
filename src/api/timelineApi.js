import axios from 'axios';

const API_URL = '/api/timeline';

/**
 * 获取所有时间线节点
 * @returns {Promise<Array>} 返回节点数组
 */
export const fetchTimelineNodes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('获取时间线节点失败:', error);
    throw error;
  }
};

/**
 * 获取单个节点
 * @param {string} id 节点ID
 * @returns {Promise<Object>} 返回节点数据
 */
export const fetchNodeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取节点 ${id} 失败:`, error);
    throw error;
  }
};

/**
 * 创建新节点
 * @param {Object} nodeData 节点数据
 * @returns {Promise<Object>} 返回创建的节点
 */
export const createNode = async (nodeData) => {
  try {
    const response = await axios.post(API_URL, nodeData);
    return response.data;
  } catch (error) {
    console.error('创建节点失败:', error);
    throw error;
  }
};

/**
 * 更新节点信息
 * @param {string} id 节点ID
 * @param {Object} data 要更新的数据
 * @returns {Promise<Object>} 返回更新后的节点
 */
export const updateNode = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`更新节点 ${id} 失败:`, error);
    throw error;
  }
};

/**
 * 删除节点
 * @param {string} id 节点ID
 * @returns {Promise<void>}
 */
export const deleteNode = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`删除节点 ${id} 失败:`, error);
    throw error;
  }
}; 