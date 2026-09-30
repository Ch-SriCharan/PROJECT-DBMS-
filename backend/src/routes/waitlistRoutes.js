import express from 'express';
import {
  joinWaitlist,
  getMyWaitlist,
  cancelWaitlist,
} from '../controllers/waitlistController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', requireRole(ROLES.PATIENT, ROLES.ADMIN), joinWaitlist);
router.get('/my', requireRole(ROLES.PATIENT, ROLES.ADMIN), getMyWaitlist);
router.delete('/:id', requireRole(ROLES.PATIENT, ROLES.ADMIN), cancelWaitlist);

export default router;
