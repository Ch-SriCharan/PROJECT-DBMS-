import api from './api.js';

export const appointmentService = {
  bookAppointment: async (appointmentData) => {
    const res = await api.post('/appointments', appointmentData);
    return res.data;
  },

  getAppointments: async (params = {}) => {
    const res = await api.get('/appointments', { params });
    return res.data;
  },

  getAppointmentById: async (id) => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  updateAppointmentStatus: async (id, status, notes) => {
    const res = await api.put(`/appointments/${id}`, { status, notes });
    return res.data;
  },

  rescheduleAppointment: async (id, rescheduleData) => {
    const res = await api.put(`/appointments/${id}/reschedule`, rescheduleData);
    return res.data;
  },

  cancelAppointment: async (id) => {
    const res = await api.put(`/appointments/${id}/cancel`);
    return res.data;
  },

  getPatientAppointments: async (patientId) => {
    const res = await api.get(`/appointments/patient/${patientId}`);
    return res.data;
  },

  getDoctorAppointments: async (doctorId) => {
    const res = await api.get(`/appointments/doctor/${doctorId}`);
    return res.data;
  },
};
