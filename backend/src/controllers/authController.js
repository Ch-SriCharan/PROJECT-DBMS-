import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import { ROLES } from '../config/constants.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'healthcare_jwt_secret_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, specialty, clinicId, experience, description, consultationFee } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const userData = {
      name,
      email: email.toLowerCase().trim(),
      phone,
      password,
      role: role || ROLES.PATIENT,
    };

    if (userData.role === ROLES.DOCTOR) {
      userData.specialty = specialty || 'General Physician';
      userData.clinicId = clinicId || null;
      userData.experience = experience || 0;
      userData.description = description || '';
      userData.consultationFee = consultationFee || 50;
    }

    const user = await User.create(userData);
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('clinicId');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('clinicId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, specialty, clinicId, experience, description, consultationFee } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (user.role === ROLES.DOCTOR) {
      if (specialty !== undefined) user.specialty = specialty;
      if (clinicId !== undefined) user.clinicId = clinicId;
      if (experience !== undefined) user.experience = experience;
      if (description !== undefined) user.description = description;
      if (consultationFee !== undefined) user.consultationFee = consultationFee;
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('clinicId');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
