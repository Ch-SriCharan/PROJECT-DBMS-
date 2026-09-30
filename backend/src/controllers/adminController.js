import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Appointment from '../models/Appointment.js';
import { ROLES, APPOINTMENT_STATUS } from '../config/constants.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalDoctors,
      totalClinics,
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      recentAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.PATIENT }),
      User.countDocuments({ role: ROLES.DOCTOR }),
      Clinic.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        date: { $gte: today },
        status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
      }),
      Appointment.countDocuments({ status: APPOINTMENT_STATUS.COMPLETED }),
      Appointment.countDocuments({ status: APPOINTMENT_STATUS.CANCELLED }),
      Appointment.find()
        .populate('patientId', 'name email')
        .populate('doctorId', 'name specialty')
        .populate('clinicId', 'name location')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalClinics,
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role && Object.values(ROLES).includes(role)) {
      query.role = role;
    }

    const users = await User.find(query).populate('clinicId').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If user was doctor, cancel their upcoming appointments
    if (user.role === ROLES.DOCTOR) {
      await Appointment.updateMany(
        { doctorId: user._id, status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] } },
        { status: APPOINTMENT_STATUS.CANCELLED }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
