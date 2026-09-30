import api from './api.js';

export const availabilityService = {
  getDoctorAvailability: async (doctorId, date) => {
    const params = date ? { date } : {};
    const res = await api.get(`/availability/doctor/${doctorId}`, { params });
    return res.data;
  },

  createOrUpdateAvailability: async (data) => {
    const res = await api.post('/availability', data);
    return res.data;
  },

  updateAvailability: async (id, data) => {
    const res = await api.put(`/availability/${id}`, data);
    return res.data;
  },

  deleteAvailability: async (id) => {
    const res = await api.delete(`/availability/${id}`);
    return res.data;
  },
};
