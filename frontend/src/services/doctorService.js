import api from './api.js';

export const doctorService = {
  getDoctors: async (params = {}) => {
    const res = await api.get('/doctors', { params });
    return res.data;
  },

  getDoctorById: async (id) => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  compareDoctors: async (ids) => {
    const res = await api.get('/doctors/compare', { params: { ids: Array.isArray(ids) ? ids.join(',') : ids } });
    return res.data;
  },

  matchSlots: async (data) => {
    const res = await api.post('/doctors/match-slots', data);
    return res.data;
  },
};
