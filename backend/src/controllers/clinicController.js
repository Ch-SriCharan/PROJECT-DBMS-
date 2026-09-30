import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

export const getClinics = async (req, res, next) => {
  try {
    const { location, search } = req.query;

    const query = {};

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const clinics = await Clinic.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clinics.length,
      data: clinics,
    });
  } catch (error) {
    next(error);
  }
};

export const getClinicById = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found.',
      });
    }

    // Find all doctors affiliated with this clinic
    const doctors = await User.find({
      clinicId: clinic._id,
      role: ROLES.DOCTOR,
    }).select('-password');

    return res.status(200).json({
      success: true,
      data: {
        ...clinic.toObject(),
        doctors,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Clinic created successfully.',
      data: clinic,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Clinic updated successfully.',
      data: clinic,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Clinic deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
