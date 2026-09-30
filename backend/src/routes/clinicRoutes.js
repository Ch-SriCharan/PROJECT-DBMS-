import express from 'express';
import {
  getClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
} from '../controllers/clinicController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', getClinics);
router.get('/:id', getClinicById);

// Admin-only management routes
router.post('/', authenticateUser, requireRole(ROLES.ADMIN), createClinic);
router.put('/:id', authenticateUser, requireRole(ROLES.ADMIN), updateClinic);
router.delete('/:id', authenticateUser, requireRole(ROLES.ADMIN), deleteClinic);

export default router;
