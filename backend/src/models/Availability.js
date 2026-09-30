import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Date is required'],
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
    slotDuration: {
      type: Number,
      default: 30, // in minutes
    },
    slots: [slotSchema],
  },
  {
    timestamps: true,
  }
);

// Unique availability schedule per doctor per day
availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;
