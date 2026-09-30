import express from 'express';
import {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  getQueueStatus,
  getDoctorTodayQueue,
  advanceQueue,
} from '../controllers/appointmentController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { validateAppointmentBooking } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', validateAppointmentBooking, bookAppointment);
router.get('/', getAppointments);
router.get('/queue/today', requireRole(ROLES.DOCTOR, ROLES.ADMIN), getDoctorTodayQueue);
router.get('/queue/status/:appointmentId', getQueueStatus);
router.put('/queue/advance/:appointmentId', requireRole(ROLES.DOCTOR, ROLES.ADMIN), advanceQueue);
router.get('/patient/:patientId', getAppointmentsByPatient);
router.get('/doctor/:doctorId', getAppointmentsByDoctor);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointmentStatus);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/cancel', cancelAppointment);
router.delete('/:id', cancelAppointment);

export default router;
