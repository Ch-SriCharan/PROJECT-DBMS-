import express from 'express';
import {
  createOrUpdateAvailability,
  getDoctorAvailability,
  updateAvailability,
  deleteAvailability,
} from '../controllers/availabilityController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { validateAvailability } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public / Patient view of doctor availability
router.get('/doctor/:doctorId', getDoctorAvailability);

// Doctor & Admin availability management
router.post(
  '/',
  authenticateUser,
  requireRole(ROLES.DOCTOR, ROLES.ADMIN),
  validateAvailability,
  createOrUpdateAvailability
);

router.put(
  '/:id',
  authenticateUser,
  requireRole(ROLES.DOCTOR, ROLES.ADMIN),
  updateAvailability
);

router.delete(
  '/:id',
  authenticateUser,
  requireRole(ROLES.DOCTOR, ROLES.ADMIN),
  deleteAvailability
);

export default router;
