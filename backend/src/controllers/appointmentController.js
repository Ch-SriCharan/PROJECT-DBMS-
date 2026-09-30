import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Availability from '../models/Availability.js';
import { sendNotification } from '../services/notificationService.js';
import { ROLES, APPOINTMENT_STATUS, NOTIFICATION_TYPE } from '../config/constants.js';
import { notifyWaitlistedPatients } from './waitlistController.js';

export const bookAppointment = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, clinicId, date, startTime, endTime, reason, notes, patientCondition, patientSymptoms } = req.body;

    // 1. Verify User role
    if (req.user.role !== ROLES.PATIENT && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only patients can book appointments.',
      });
    }

    // 2. Verify Doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: ROLES.DOCTOR });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // 3. Verify Clinic exists
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found.',
      });
    }

    // 4. Concurrency / Double Booking check
    const existingActiveBooking = await Appointment.findOne({
      doctorId,
      date,
      startTime,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    });

    if (existingActiveBooking) {
      return res.status(409).json({
        success: false,
        message: 'Appointment slot is no longer available. Please select another time slot.',
      });
    }

    // Count today's existing active appointments to calculate queue position
    const precedingCount = await Appointment.countDocuments({
      doctorId,
      date,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    });

    // 5. Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      clinicId,
      date,
      startTime,
      endTime,
      reason: reason || 'General Consultation',
      notes: notes || '',
      patientCondition: patientCondition || '',
      patientSymptoms: patientSymptoms || [],
      queuePosition: precedingCount + 1,
      queueStatus: 'WAITING',
      status: APPOINTMENT_STATUS.BOOKED,
    });

    // 6. Update slot availability in Availability schedule if exists
    await Availability.updateOne(
      { doctorId, date, 'slots.startTime': startTime },
      { $set: { 'slots.$.isAvailable': false } }
    );

    // 7. Dispatch in-app notifications
    const patientName = req.user.name;
    const doctorName = doctor.name;
    const clinicName = clinic.name;

    await sendNotification({
      userId: patientId,
      appointmentId: appointment._id,
      message: `Your appointment with Dr. ${doctorName} has been booked for ${date} at ${startTime} at ${clinicName}.`,
      type: NOTIFICATION_TYPE.BOOKING,
    });

    await sendNotification({
      userId: doctorId,
      appointmentId: appointment._id,
      message: `New appointment booked by ${patientName} for ${date} at ${startTime}.`,
      type: NOTIFICATION_TYPE.BOOKING,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty consultationFee')
      .populate('clinicId', 'name location address phone');

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === ROLES.PATIENT) {
      query.patientId = req.user._id;
    } else if (req.user.role === ROLES.DOCTOR) {
      query.doctorId = req.user._id;
    }
    // Admin sees all

    if (status) {
      query.status = status;
    }

    if (date) {
      query.date = date;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty consultationFee experience')
      .populate('clinicId', 'name location address phone')
      .sort({ date: -1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty consultationFee experience description')
      .populate('clinicId', 'name location address phone email openingHours');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Access authorization check
    if (
      req.user.role === ROLES.PATIENT &&
      appointment.patientId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this appointment.',
      });
    }

    if (
      req.user.role === ROLES.DOCTOR &&
      appointment.doctorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this appointment.',
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialty');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Check permissions
    if (
      req.user.role === ROLES.DOCTOR &&
      appointment.doctorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update appointments assigned to you.',
      });
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    if (status && Object.values(APPOINTMENT_STATUS).includes(status)) {
      appointment.status = status;

      // Handle status change side-effects
      if (status === APPOINTMENT_STATUS.CONFIRMED) {
        await sendNotification({
          userId: appointment.patientId._id,
          appointmentId: appointment._id,
          message: `Your appointment with Dr. ${appointment.doctorId.name} on ${appointment.date} at ${appointment.startTime} has been confirmed.`,
          type: NOTIFICATION_TYPE.CONFIRMATION,
        });
      } else if (status === APPOINTMENT_STATUS.CANCELLED) {
        // Release slot
        await Availability.updateOne(
          { doctorId: appointment.doctorId._id, date: appointment.date, 'slots.startTime': appointment.startTime },
          { $set: { 'slots.$.isAvailable': true } }
        );

        await sendNotification({
          userId: appointment.patientId._id,
          appointmentId: appointment._id,
          message: `Your appointment with Dr. ${appointment.doctorId.name} on ${appointment.date} at ${appointment.startTime} has been cancelled.`,
          type: NOTIFICATION_TYPE.CANCELLATION,
        });

        await sendNotification({
          userId: appointment.doctorId._id,
          appointmentId: appointment._id,
          message: `Appointment for ${appointment.patientId.name} on ${appointment.date} at ${appointment.startTime} was cancelled.`,
          type: NOTIFICATION_TYPE.CANCELLATION,
        });
      }
    }

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name location address phone');

    return res.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { newDate, newStartTime, newEndTime } = req.body;

    if (!newDate || !newStartTime || !newEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide newDate, newStartTime, and newEndTime for rescheduling.',
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialty');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Permission check
    if (
      req.user.role === ROLES.PATIENT &&
      appointment.patientId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only reschedule your own appointments.',
      });
    }

    if (appointment.status === APPOINTMENT_STATUS.CANCELLED || appointment.status === APPOINTMENT_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule an appointment that is already ${appointment.status.toLowerCase()}.`,
      });
    }

    // Check if new slot is already occupied
    const conflictingBooking = await Appointment.findOne({
      doctorId: appointment.doctorId._id,
      date: newDate,
      startTime: newStartTime,
      _id: { $ne: appointment._id },
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Selected new appointment slot is no longer available.',
      });
    }

    const oldDate = appointment.date;
    const oldStartTime = appointment.startTime;

    // Release old slot in availability
    await Availability.updateOne(
      { doctorId: appointment.doctorId._id, date: oldDate, 'slots.startTime': oldStartTime },
      { $set: { 'slots.$.isAvailable': true } }
    );

    // Reserve new slot in availability
    await Availability.updateOne(
      { doctorId: appointment.doctorId._id, date: newDate, 'slots.startTime': newStartTime },
      { $set: { 'slots.$.isAvailable': false } }
    );

    // Update appointment
    appointment.date = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.status = APPOINTMENT_STATUS.RESCHEDULED;
    appointment.reminderSent = false;
    await appointment.save();

    // Send notifications
    await sendNotification({
      userId: appointment.patientId._id,
      appointmentId: appointment._id,
      message: `Your appointment with Dr. ${appointment.doctorId.name} has been rescheduled to ${newDate} at ${newStartTime}.`,
      type: NOTIFICATION_TYPE.RESCHEDULE,
    });

    await sendNotification({
      userId: appointment.doctorId._id,
      appointmentId: appointment._id,
      message: `Appointment for ${appointment.patientId.name} was rescheduled to ${newDate} at ${newStartTime}.`,
      type: NOTIFICATION_TYPE.RESCHEDULE,
    });

    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name location address phone');

    return res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialty');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Permission check
    if (
      req.user.role === ROLES.PATIENT &&
      appointment.patientId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own appointments.',
      });
    }

    if (
      req.user.role === ROLES.DOCTOR &&
      appointment.doctorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel appointments assigned to you.',
      });
    }

    if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled.',
      });
    }

    // Release slot
    await Availability.updateOne(
      { doctorId: appointment.doctorId._id, date: appointment.date, 'slots.startTime': appointment.startTime },
      { $set: { 'slots.$.isAvailable': true } }
    );

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();

    // Send notifications
    await sendNotification({
      userId: appointment.patientId._id,
      appointmentId: appointment._id,
      message: `Your appointment with Dr. ${appointment.doctorId.name} on ${appointment.date} at ${appointment.startTime} has been cancelled.`,
      type: NOTIFICATION_TYPE.CANCELLATION,
    });

    await sendNotification({
      userId: appointment.doctorId._id,
      appointmentId: appointment._id,
      message: `Appointment for ${appointment.patientId.name} on ${appointment.date} at ${appointment.startTime} has been cancelled.`,
      type: NOTIFICATION_TYPE.CANCELLATION,
    });

    // Notify any waiting patients for this doctor & date
    notifyWaitlistedPatients(appointment.doctorId._id, appointment.date);

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully and time slot released.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (req.user.role === ROLES.PATIENT && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own appointments.',
      });
    }

    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialty consultationFee')
      .populate('clinicId', 'name location address phone')
      .populate('treatmentRecordId')
      .sort({ date: -1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    if (req.user.role === ROLES.DOCTOR && req.user._id.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own appointments.',
      });
    }

    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email phone')
      .populate('clinicId', 'name location address phone')
      .populate('treatmentRecordId')
      .sort({ date: -1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get real-time digital queue status for an appointment today
 * @route GET /api/appointments/queue/status/:appointmentId
 */
export const getQueueStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name location')
      .populate('patientId', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const isToday = appointment.date === today;

    // Get all active appointments for this doctor on the appointment's date
    const todayAppointments = await Appointment.find({
      doctorId: appointment.doctorId._id,
      date: appointment.date,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.COMPLETED] },
    }).sort({ startTime: 1 });

    // Find current active patient in consultation
    const inConsultation = todayAppointments.find((a) => a.queueStatus === 'IN_CONSULTATION');

    // Calculate queue position of this appointment among waiting/active appointments
    const completedBeforeThis = todayAppointments.filter(
      (a) => a.queueStatus === 'COMPLETED' && a.startTime < appointment.startTime
    ).length;

    const indexInList = todayAppointments.findIndex(
      (a) => a._id.toString() === appointment._id.toString()
    );

    const position = indexInList >= 0 ? indexInList + 1 : 1;
    const peopleAhead = Math.max(0, indexInList - completedBeforeThis);

    // Estimated waiting time (average 15 mins per patient ahead)
    const estimatedWaitMinutes = peopleAhead * 15;

    return res.status(200).json({
      success: true,
      data: {
        appointmentId: appointment._id,
        date: appointment.date,
        startTime: appointment.startTime,
        isToday,
        queuePosition: position,
        peopleAhead,
        estimatedWaitMinutes,
        queueStatus: appointment.queueStatus || 'WAITING',
        currentDoctorProgress: inConsultation
          ? `In consultation with token #${todayAppointments.findIndex((a) => a._id.toString() === inConsultation._id.toString()) + 1}`
          : 'Ready for next patient',
        doctorName: appointment.doctorId?.name,
        clinicName: appointment.clinicId?.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get doctor's today queue list
 * @route GET /api/appointments/queue/today
 */
export const getDoctorTodayQueue = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.find({
      doctorId,
      date: today,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.COMPLETED] },
    })
      .populate('patientId', 'name email phone')
      .populate('treatmentRecordId')
      .sort({ startTime: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      date: today,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Advance appointment queue status (Doctor marks patient IN_CONSULTATION / COMPLETED / DELAYED)
 * @route PUT /api/appointments/queue/advance/:appointmentId
 */
export const advanceQueue = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { queueStatus } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (queueStatus) {
      appointment.queueStatus = queueStatus;
      if (queueStatus === 'COMPLETED') {
        appointment.status = APPOINTMENT_STATUS.COMPLETED;
      }
      await appointment.save();

      // Notify patient of queue change
      await sendNotification({
        userId: appointment.patientId,
        appointmentId: appointment._id,
        message: `Queue update: Your consultation status is now ${queueStatus.replace('_', ' ')}.`,
        type: NOTIFICATION_TYPE.QUEUE_UPDATE,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Queue updated to ${queueStatus}`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
