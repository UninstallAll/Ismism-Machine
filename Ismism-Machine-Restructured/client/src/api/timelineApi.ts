import axios from './axios';
import { TimelineItem, ApiResponse } from '../types';

const API_BASE_URL = '/api/timeline';

// 获取所有时间线节点
export const fetchAllTimelineNodes = async (): Promise<TimelineItem[]> => {
  try {
    const response = await axios.get<ApiResponse<TimelineItem[]>>(API_BASE_URL);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching timeline nodes:', error);
    throw error;
  }
};

// 获取单个时间线节点
export const fetchTimelineNodeById = async (id: string): Promise<TimelineItem> => {
  try {
    const response = await axios.get<ApiResponse<TimelineItem>>(`${API_BASE_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching timeline node ${id}:`, error);
    throw error;
  }
};

// 创建新的时间线节点
export const createTimelineNode = async (node: Omit<TimelineItem, 'id'>): Promise<TimelineItem> => {
  try {
    const response = await axios.post<ApiResponse<TimelineItem>>(API_BASE_URL, node);
    return response.data.data;
  } catch (error) {
    console.error('Error creating timeline node:', error);
    throw error;
  }
};

// 更新时间线节点
export const updateTimelineNode = async (id: string, node: Partial<TimelineItem>): Promise<TimelineItem> => {
  try {
    const response = await axios.put<ApiResponse<TimelineItem>>(`${API_BASE_URL}/${id}`, node);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating timeline node ${id}:`, error);
    throw error;
  }
};

// 删除时间线节点
export const deleteTimelineNode = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting timeline node ${id}:`, error);
    throw error;
  }
}; 