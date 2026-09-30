import api from './api';

export const waitlistService = {
  joinWaitlist: async (data) => {
    const response = await api.post('/waitlist', data);
    return response.data;
  },

  getMyWaitlist: async () => {
    const response = await api.get('/waitlist/my');
    return response.data;
  },

  cancelWaitlist: async (id) => {
    const response = await api.delete(`/waitlist/${id}`);
    return response.data;
  },
};
