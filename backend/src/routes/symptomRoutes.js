import express from 'express';
import { getSymptoms, getRecommendation } from '../controllers/symptomController.js';

const router = express.Router();

// GET /api/symptoms - Get all symptoms and categories
router.get('/', getSymptoms);

// POST /api/symptoms/recommend - Rule-based specialist recommendation from symptoms
router.post('/recommend', getRecommendation);

// GET /api/symptoms/recommend - URL query string support (e.g. ?symptoms=fever,cough)
router.get('/recommend', getRecommendation);

export default router;
