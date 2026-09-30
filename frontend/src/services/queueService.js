import api from './api';

export const queueService = {
  // Get live queue status for an appointment
  getQueueStatus: async (appointmentId) => {
    const response = await api.get(`/appointments/queue/status/${appointmentId}`);
    return response.data;
  },

  // Get doctor's today queue
  getDoctorTodayQueue: async () => {
    const response = await api.get('/appointments/queue/today');
    return response.data;
  },

  // Advance queue status (Doctor marks patient IN_CONSULTATION / COMPLETED / DELAYED)
  advanceQueue: async (appointmentId, queueStatus) => {
    const response = await api.put(`/appointments/queue/advance/${appointmentId}`, {
      queueStatus,
    });
    return response.data;
  },
};
