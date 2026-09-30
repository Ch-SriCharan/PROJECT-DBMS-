import User from '../models/User.js';
import Availability from '../models/Availability.js';
import { ROLES } from '../config/constants.js';
import {
  SYMPTOMS_CATALOG,
  SPECIALTY_INFO,
  calculateSpecialistRecommendation,
} from '../services/symptomService.js';

/**
 * @desc Get all available symptoms and categories
 * @route GET /api/symptoms
 */
export const getSymptoms = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    let symptoms = [...SYMPTOMS_CATALOG];

    if (category && category !== 'All') {
      symptoms = symptoms.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      symptoms = symptoms.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.bodyArea.toLowerCase().includes(q)
      );
    }

    // Extract unique categories
    const categories = ['All', ...new Set(SYMPTOMS_CATALOG.map((s) => s.category))];

    return res.status(200).json({
      success: true,
      count: symptoms.length,
      categories,
      data: symptoms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Evaluate selected symptoms and get recommended specialist & matching doctors
 * @route POST /api/symptoms/recommend
 * @route GET /api/symptoms/recommend?symptoms=cough,fever
 */
export const getRecommendation = async (req, res, next) => {
  try {
    let selectedSymptoms = [];

    if (req.method === 'POST') {
      selectedSymptoms = req.body.symptoms || req.body.symptomIds || [];
    } else if (req.query.symptoms) {
      selectedSymptoms = req.query.symptoms.split(',').map((s) => s.trim());
    }

    if (typeof selectedSymptoms === 'string') {
      selectedSymptoms = [selectedSymptoms];
    }

    const recommendation = calculateSpecialistRecommendation(selectedSymptoms);

    // If recommendation produced a specialty, find matching doctors in MongoDB
    let matchingDoctors = [];
    if (recommendation.hasSelection && recommendation.recommendedSpecialty) {
      const specialtyKey = recommendation.recommendedSpecialty;
      
      // Build doctor search query with flexible specialty matching
      // e.g. "Dentistry" matches "Dentist", "Dentistry", "Dental"
      const rootTerm = specialtyKey
        .replace(/(ology|ist|ics|rics|try|ian)$/i, '')
        .trim();

      const query = {
        role: ROLES.DOCTOR,
        $or: [
          { specialty: { $regex: specialtyKey, $options: 'i' } },
          { specialty: { $regex: rootTerm, $options: 'i' } },
        ],
      };

      const { location, availableDate, clinicId } = req.query || req.body || {};

      if (clinicId) {
        query.clinicId = clinicId;
      }

      let doctors = await User.find(query).populate('clinicId');

      if (location) {
        doctors = doctors.filter((doc) => {
          return (
            doc.clinicId &&
            (doc.clinicId.location?.toLowerCase().includes(location.toLowerCase()) ||
              doc.clinicId.address?.toLowerCase().includes(location.toLowerCase()))
          );
        });
      }

      if (availableDate) {
        const availabilities = await Availability.find({ date: availableDate });
        const doctorIdsWithAvailability = availabilities.map((a) => a.doctorId.toString());
        doctors = doctors.filter((doc) => doctorIdsWithAvailability.includes(doc._id.toString()));
      }

      // If specific specialty returned zero doctors (e.g. niche), also find General Physicians as fallback
      if (doctors.length === 0 && specialtyKey !== 'General Physician') {
        const fallbackDoctors = await User.find({
          role: ROLES.DOCTOR,
          specialty: { $regex: 'General', $options: 'i' },
        }).populate('clinicId');
        matchingDoctors = fallbackDoctors;
      } else {
        matchingDoctors = doctors;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ...recommendation,
        matchingDoctorsCount: matchingDoctors.length,
        matchingDoctors,
      },
    });
  } catch (error) {
    next(error);
  }
};
