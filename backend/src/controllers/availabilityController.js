import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { generateSlots } from '../services/slotService.js';
import { ROLES, APPOINTMENT_STATUS } from '../config/constants.js';

export const createOrUpdateAvailability = async (req, res, next) => {
  try {
    const doctorId = req.user.role === ROLES.DOCTOR ? req.user._id : req.body.doctorId;
    const { date, startTime, endTime, slotDuration = 30 } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required.',
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: ROLES.DOCTOR });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or user is not a doctor.',
      });
    }

    // Generate time slots
    const generatedSlots = generateSlots(startTime, endTime, slotDuration);

    // Cross-check with active appointments to preserve booked status
    const activeAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    });

    const bookedStartTimes = new Set(activeAppointments.map((a) => a.startTime));

    const finalSlots = generatedSlots.map((slot) => ({
      ...slot,
      isAvailable: !bookedStartTimes.has(slot.startTime),
    }));

    const availability = await Availability.findOneAndUpdate(
      { doctorId, date },
      {
        doctorId,
        date,
        startTime,
        endTime,
        slotDuration,
        slots: finalSlots,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Availability schedule saved successfully.',
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const query = { doctorId };
    if (date) {
      query.date = date;
    } else {
      const today = new Date().toISOString().split('T')[0];
      query.date = { $gte: today };
    }

    const availabilities = await Availability.find(query).sort({ date: 1 });

    // Ensure real-time accuracy by dynamically checking active appointments
    const activeAppointments = await Appointment.find({
      doctorId,
      date: date ? date : { $gte: new Date().toISOString().split('T')[0] },
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    });

    const bookedKeySet = new Set(
      activeAppointments.map((a) => `${a.date}_${a.startTime}`)
    );

    const updatedAvailabilities = availabilities.map((avail) => {
      const availObj = avail.toObject();
      availObj.slots = availObj.slots.map((slot) => ({
        ...slot,
        isAvailable: slot.isAvailable && !bookedKeySet.has(`${avail.date}_${slot.startTime}`),
      }));
      return availObj;
    });

    return res.status(200).json({
      success: true,
      count: updatedAvailabilities.length,
      data: updatedAvailabilities,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability schedule not found.',
      });
    }

    if (
      req.user.role === ROLES.DOCTOR &&
      availability.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own availability.',
      });
    }

    if (req.body.slots) {
      availability.slots = req.body.slots;
    }

    await availability.save();

    return res.status(200).json({
      success: true,
      message: 'Availability updated successfully.',
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability schedule not found.',
      });
    }

    if (
      req.user.role === ROLES.DOCTOR &&
      availability.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own availability.',
      });
    }

    await Availability.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Availability schedule deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
