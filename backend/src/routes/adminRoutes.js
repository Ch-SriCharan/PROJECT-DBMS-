import express from 'express';
import { getAdminStats, getAllUsers, deleteUser } from '../controllers/adminController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser);
router.use(requireRole(ROLES.ADMIN));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

export default router;
