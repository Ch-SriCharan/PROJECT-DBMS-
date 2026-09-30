import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import { ROLES, APPOINTMENT_STATUS } from '../config/constants.js';

export const getDoctors = async (req, res, next) => {
  try {
    const { specialty, location, availableDate, search } = req.query;

    const query = { role: ROLES.DOCTOR };

    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let doctors = await User.find(query).populate('clinicId');

    // Filter by clinic location if provided
    if (location) {
      doctors = doctors.filter((doc) => {
        return (
          doc.clinicId &&
          (doc.clinicId.location?.toLowerCase().includes(location.toLowerCase()) ||
            doc.clinicId.address?.toLowerCase().includes(location.toLowerCase()))
        );
      });
    }

    // Filter by available date if provided
    if (availableDate) {
      const availabilities = await Availability.find({ date: availableDate });
      const doctorIdsWithAvailability = availabilities.map((a) => a.doctorId.toString());
      doctors = doctors.filter((doc) => doctorIdsWithAvailability.includes(doc._id.toString()));
    }

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: ROLES.DOCTOR }).populate('clinicId');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Fetch upcoming availabilities for this doctor
    const today = new Date().toISOString().split('T')[0];
    const availabilities = await Availability.find({
      doctorId: doctor._id,
      date: { $gte: today },
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      data: {
        ...doctor.toObject(),
        availabilities,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Compare multiple doctors side-by-side
 * @route GET /api/doctors/compare?ids=id1,id2,id3
 */
export const compareDoctors = async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: 'Doctor IDs parameter (ids) is required.',
      });
    }

    const doctorIds = ids.split(',').map((id) => id.trim());
    const doctors = await User.find({
      _id: { $in: doctorIds },
      role: ROLES.DOCTOR,
    }).populate('clinicId');

    const today = new Date().toISOString().split('T')[0];

    // Fetch next available slots for each doctor
    const comparedData = await Promise.all(
      doctors.map(async (doc) => {
        const nextAvail = await Availability.findOne({
          doctorId: doc._id,
          date: { $gte: today },
          'slots.isAvailable': true,
        }).sort({ date: 1 });

        let nextSlot = null;
        if (nextAvail) {
          const openSlot = nextAvail.slots.find((s) => s.isAvailable);
          if (openSlot) {
            nextSlot = {
              date: nextAvail.date,
              time: openSlot.startTime,
            };
          }
        }

        return {
          _id: doc._id,
          name: doc.name,
          specialty: doc.specialty,
          experience: doc.experience || 5,
          consultationFee: doc.consultationFee || 500,
          description: doc.description || '',
          clinic: doc.clinicId
            ? {
                _id: doc.clinicId._id,
                name: doc.clinicId.name,
                location: doc.clinicId.location,
                address: doc.clinicId.address,
                phone: doc.clinicId.phone,
              }
            : null,
          nextSlot,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: comparedData.length,
      data: comparedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Smart Availability Matcher: Find doctors with slots matching preferred date & time of day
 * @route POST /api/doctors/match-slots
 */
export const matchSlots = async (req, res, next) => {
  try {
    const { preferredDate, preferredTime, specialty, location, clinicId } = req.body;

    const query = { role: ROLES.DOCTOR };

    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }
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

    const doctorIds = doctors.map((d) => d._id);

    // Find availabilities on preferredDate
    const targetDate = preferredDate || new Date().toISOString().split('T')[0];
    const availabilities = await Availability.find({
      doctorId: { $in: doctorIds },
      date: targetDate,
    });

    // Filter slots by preferred time of day (Morning: <12:00, Afternoon: 12:00-16:00, Evening: >=16:00, or ANY)
    const matches = [];

    doctors.forEach((doc) => {
      const docAvail = availabilities.find(
        (a) => a.doctorId.toString() === doc._id.toString()
      );

      let matchingSlots = [];
      if (docAvail) {
        matchingSlots = docAvail.slots.filter((slot) => {
          if (!slot.isAvailable) return false;
          if (!preferredTime || preferredTime === 'ANY') return true;

          const hour = parseInt(slot.startTime.split(':')[0], 10);
          if (preferredTime === 'MORNING') return hour < 12;
          if (preferredTime === 'AFTERNOON') return hour >= 12 && hour < 16;
          if (preferredTime === 'EVENING') return hour >= 16;
          return true;
        });
      }

      if (matchingSlots.length > 0) {
        matches.push({
          doctor: doc,
          date: targetDate,
          slotCount: matchingSlots.length,
          slots: matchingSlots,
        });
      }
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      targetDate,
      preferredTime: preferredTime || 'ANY',
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};
