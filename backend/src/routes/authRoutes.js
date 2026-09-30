import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

export default router;
