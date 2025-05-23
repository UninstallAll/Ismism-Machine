import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const artMovementApi = {
  getAllMovements: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movements:', error);
      throw error;
    }
  },

  getMovementById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movement with id ${id}:`, error);
      throw error;
    }
  },

  getMovementsByTimeline: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movements/timeline`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movements timeline:', error);
      throw error;
    }
  },

  getMovementsByTags: async (tags) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movements/tags`, {
        params: { tags: tags.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movements by tags:', error);
      throw error;
    }
  },

  updateMovement: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/movements/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating movement:', error);
      throw error;
    }
  },

  createMovement: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/movements`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  },

  deleteMovement: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/movements/${id}`);
    } catch (error) {
      console.error('Error deleting movement:', error);
      throw error;
    }
  },

  getAllArtists: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/artists`);
      return response.data;
    } catch (error) {
      console.error('Error fetching artists:', error);
      throw error;
    }
  },

  getAllArtworks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/artworks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching artworks:', error);
      throw error;
    }
  },

  getArtworksByMovement: async (movementId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/artworks/movement/${movementId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching artworks by movement:', error);
      throw error;
    }
  }
}; 