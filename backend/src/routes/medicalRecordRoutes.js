import express from 'express';
import {
  getMyMedicalRecords,
  getPatientTimeline,
  getMyMedications,
  getMyDiagnoses,
  getPatientRecordsForDoctor,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  getConditions,
} from '../controllers/medicalRecordController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public / Authenticated Disease & Condition catalog search
router.get('/conditions', getConditions);

// All following routes require authentication
router.use(authenticateUser);

// Patient routes
router.get('/patient', requireRole(ROLES.PATIENT, ROLES.ADMIN), getMyMedicalRecords);
router.get('/patient/timeline', requireRole(ROLES.PATIENT, ROLES.ADMIN), getPatientTimeline);
router.get('/patient/medications', requireRole(ROLES.PATIENT, ROLES.ADMIN), getMyMedications);
router.get('/patient/diagnoses', requireRole(ROLES.PATIENT, ROLES.ADMIN), getMyDiagnoses);

// Doctor routes
router.get('/doctor/patient/:patientId', requireRole(ROLES.DOCTOR, ROLES.ADMIN), getPatientRecordsForDoctor);
router.post('/', requireRole(ROLES.DOCTOR, ROLES.ADMIN), createMedicalRecord);
router.put('/:id', requireRole(ROLES.DOCTOR, ROLES.ADMIN), updateMedicalRecord);

// Single record detail
router.get('/:id', getMedicalRecordById);

export default router;
