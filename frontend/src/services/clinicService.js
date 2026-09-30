import api from './api.js';

export const clinicService = {
  getClinics: async (params = {}) => {
    const res = await api.get('/clinics', { params });
    return res.data;
  },

  getClinicById: async (id) => {
    const res = await api.get(`/clinics/${id}`);
    return res.data;
  },

  createClinic: async (clinicData) => {
    const res = await api.post('/clinics', clinicData);
    return res.data;
  },

  updateClinic: async (id, clinicData) => {
    const res = await api.put(`/clinics/${id}`, clinicData);
    return res.data;
  },

  deleteClinic: async (id) => {
    const res = await api.delete(`/clinics/${id}`);
    return res.data;
  },
};
