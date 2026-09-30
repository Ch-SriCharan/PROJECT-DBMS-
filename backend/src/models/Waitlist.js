import mongoose from 'mongoose';
import { WAITLIST_STATUS } from '../config/constants.js';

const waitlistSchema = new mongoose.Schema(
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
      index: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      index: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      index: true,
    },
    preferredDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Preferred date is required'],
      index: true,
    },
    preferredTime: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'EVENING', 'ANY'],
      default: 'ANY',
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(WAITLIST_STATUS),
      default: WAITLIST_STATUS.WAITING,
      index: true,
    },
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

waitlistSchema.index({ specialty: 1, preferredDate: 1, status: 1 });
waitlistSchema.index({ doctorId: 1, preferredDate: 1, status: 1 });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
