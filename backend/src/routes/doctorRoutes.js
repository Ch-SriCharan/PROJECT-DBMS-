import express from 'express';
import {
  getDoctors,
  getDoctorById,
  compareDoctors,
  matchSlots,
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/compare', compareDoctors);
router.post('/match-slots', matchSlots);
router.get('/:id', getDoctorById);

export default router;
