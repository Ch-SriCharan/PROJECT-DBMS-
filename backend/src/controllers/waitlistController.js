import Waitlist from '../models/Waitlist.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Appointment from '../models/Appointment.js';
import { sendNotification } from '../services/notificationService.js';
import { ROLES, WAITLIST_STATUS, NOTIFICATION_TYPE } from '../config/constants.js';

/**
 * @desc Patient joins a waitlist for a doctor / specialty / date
 * @route POST /api/waitlist
 */
export const joinWaitlist = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, specialty, clinicId, preferredDate, preferredTime, reason } = req.body;

    if (!specialty || !preferredDate) {
      return res.status(400).json({
        success: false,
        message: 'Specialty and preferred date are required to join the waitlist.',
      });
    }

    // Check if patient is already waitlisted for this specialty and date
    const existing = await Waitlist.findOne({
      patientId,
      specialty,
      preferredDate,
      status: WAITLIST_STATUS.WAITING,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You are already on the waitlist for this specialty on the selected date.',
      });
    }

    const waitlistEntry = await Waitlist.create({
      patientId,
      doctorId: doctorId || undefined,
      clinicId: clinicId || undefined,
      specialty,
      preferredDate,
      preferredTime: preferredTime || 'ANY',
      reason: reason || '',
      status: WAITLIST_STATUS.WAITING,
    });

    const populated = await Waitlist.findById(waitlistEntry._id)
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name location');

    // Notify patient
    await sendNotification({
      userId: patientId,
      message: `You have successfully joined the waitlist for ${specialty} on ${preferredDate}. We will notify you when a slot opens.`,
      type: NOTIFICATION_TYPE.WAITLIST,
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully added to appointment waitlist.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get authenticated patient's waitlist entries
 * @route GET /api/waitlist/my
 */
export const getMyWaitlist = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const entries = await Waitlist.find({ patientId })
      .populate('doctorId', 'name specialty consultationFee')
      .populate('clinicId', 'name location address')
      .sort({ preferredDate: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Cancel waitlist entry
 * @route DELETE /api/waitlist/:id
 */
export const cancelWaitlist = async (req, res, next) => {
  try {
    const entry = await Waitlist.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Waitlist entry not found.',
      });
    }

    entry.status = WAITLIST_STATUS.CANCELLED;
    await entry.save();

    return res.status(200).json({
      success: true,
      message: 'Waitlist request cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Check and notify waitlisted patients when slots open (helper function)
 */
export const notifyWaitlistedPatients = async (doctorId, date) => {
  try {
    const doctor = await User.findById(doctorId);
    if (!doctor) return;

    // Find waiting patients for this doctor or specialty on this date
    const waitlisted = await Waitlist.find({
      $or: [
        { doctorId, preferredDate: date, status: WAITLIST_STATUS.WAITING },
        { specialty: doctor.specialty, preferredDate: date, status: WAITLIST_STATUS.WAITING },
      ],
    });

    for (const entry of waitlisted) {
      entry.status = WAITLIST_STATUS.NOTIFIED;
      entry.notifiedAt = new Date();
      await entry.save();

      await sendNotification({
        userId: entry.patientId,
        message: `An appointment slot opened with Dr. ${doctor.name} (${doctor.specialty}) on ${date}! Book now before it gets filled.`,
        type: NOTIFICATION_TYPE.WAITLIST,
      });
    }
  } catch (err) {
    console.error('Error notifying waitlisted patients:', err);
  }
};
