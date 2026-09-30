import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location/City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    openingHours: {
      type: String,
      default: '09:00 AM - 08:00 PM',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

clinicSchema.index({ name: 'text', location: 'text' });

const Clinic = mongoose.model('Clinic', clinicSchema);

export default Clinic;
