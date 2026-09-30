import mongoose from 'mongoose';

const medicationItemSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      default: '',
      trim: true,
    },
    frequency: {
      type: String,
      default: 'Once daily',
      trim: true,
    },
    duration: {
      type: String,
      default: '5 days',
      trim: true,
    },
    instructions: {
      type: String,
      default: 'Take after meals',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    endDate: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const medicalRecordSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Record date is required'],
      index: true,
      default: () => new Date().toISOString().split('T')[0],
    },
    // Distinct labeling: Condition reported by patient vs Doctor's certified diagnosis
    patientReportedCondition: {
      type: String,
      default: 'General Consultation',
      trim: true,
    },
    patientSymptoms: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: String,
      required: [true, 'Doctor diagnosis is required'],
      trim: true,
      index: true,
    },
    clinicalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    vitalSigns: {
      bloodPressure: { type: String, default: '' },
      heartRate: { type: String, default: '' },
      temperature: { type: String, default: '' },
      weight: { type: String, default: '' },
      spO2: { type: String, default: '' },
    },
    medications: [medicationItemSchema],
    prescriptionSummary: {
      type: String,
      default: '',
      trim: true,
    },
    followUpDate: {
      type: String, // YYYY-MM-DD
      default: '',
    },
    followUpInstructions: {
      type: String,
      default: '',
      trim: true,
    },
    additionalRecommendations: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'FOLLOW_UP_SCHEDULED'],
      default: 'COMPLETED',
    },
  },
  {
    timestamps: true,
  }
);

medicalRecordSchema.index({ patientId: 1, date: -1 });
medicalRecordSchema.index({ doctorId: 1, date: -1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
