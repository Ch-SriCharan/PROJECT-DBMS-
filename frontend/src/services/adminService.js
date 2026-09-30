import api from './api.js';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (role = '') => {
    const params = role ? { role } : {};
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
};
