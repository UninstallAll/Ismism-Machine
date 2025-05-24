import axios from 'axios';
import { IArtStyle } from '../types/art';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const artMovementService = {
  // 获取艺术主义详情
  async getArtMovementDetail(id: string): Promise<IArtStyle> {
    try {
      const response = await axios.get(`${API_BASE_URL}/art-movements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch art movement detail:', error);
      throw error;
    }
  },

  // 获取所有艺术主义列表
  async getAllArtMovements(): Promise<IArtStyle[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/art-movements`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch art movements:', error);
      throw error;
    }
  }
}; 