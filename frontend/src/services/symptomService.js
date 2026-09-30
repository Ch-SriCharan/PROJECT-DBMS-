import api from './api';

export const symptomService = {
  // Get all predefined symptoms and categories
  getSymptoms: async (params = {}) => {
    const response = await api.get('/symptoms', { params });
    return response.data;
  },

  // Calculate rule-based specialist recommendation from selected symptoms
  getRecommendation: async (symptoms, filters = {}) => {
    const response = await api.post('/symptoms/recommend', {
      symptoms,
      ...filters,
    });
    return response.data;
  },
};
