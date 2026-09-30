import mongoose from 'mongoose';
import { APPOINTMENT_STATUS } from '../config/constants.js';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, 'Clinic ID is required'],
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.BOOKED,
      index: true,
    },
    reason: {
      type: String,
      default: 'General Consultation',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    // Patient-reported condition/symptoms at booking
    patientCondition: {
      type: String,
      default: '',
      trim: true,
    },
    patientSymptoms: {
      type: [String],
      default: [],
    },
    // Digital Queue Status for Clinic Day
    queuePosition: {
      type: Number,
      default: 0,
    },
    queueStatus: {
      type: String,
      enum: ['WAITING', 'IN_CONSULTATION', 'COMPLETED', 'DELAYED'],
      default: 'WAITING',
    },
    // Link to Doctor's clinical MedicalRecord
    treatmentRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    },
    followUpDate: {
      type: String,
      default: '',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Database-level double-booking prevention for active bookings (BOOKED or CONFIRMED)
appointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    },
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
