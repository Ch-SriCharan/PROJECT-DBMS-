import api from './api';

export const medicalRecordService = {
  // Get all medical records for the authenticated patient
  getMyMedicalRecords: async () => {
    const response = await api.get('/medical-records/patient');
    return response.data;
  },

  // Get chronological medical timeline for authenticated patient
  getPatientTimeline: async () => {
    const response = await api.get('/medical-records/patient/timeline');
    return response.data;
  },

  // Get aggregated medication history for authenticated patient
  getMyMedications: async () => {
    const response = await api.get('/medical-records/patient/medications');
    return response.data;
  },

  // Get condition -> doctor -> treatment journey
  getMyDiagnoses: async () => {
    const response = await api.get('/medical-records/patient/diagnoses');
    return response.data;
  },

  // Get medical record by ID
  getMedicalRecordById: async (id) => {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },

  // Get patient's records for an authorized doctor
  getPatientRecordsForDoctor: async (patientId) => {
    const response = await api.get(`/medical-records/doctor/patient/${patientId}`);
    return response.data;
  },

  // Doctor creates a clinical treatment record / prescription
  createMedicalRecord: async (data) => {
    const response = await api.post('/medical-records', data);
    return response.data;
  },

  // Doctor updates their own clinical record
  updateMedicalRecord: async (id, data) => {
    const response = await api.put(`/medical-records/${id}`, data);
    return response.data;
  },

  // Get Disease / Condition catalog
  getConditions: async (params = {}) => {
    const response = await api.get('/medical-records/conditions', { params });
    return response.data;
  },
};
