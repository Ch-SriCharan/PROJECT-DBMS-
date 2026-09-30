import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import { sendNotification } from '../services/notificationService.js';
import { ROLES, APPOINTMENT_STATUS, NOTIFICATION_TYPE } from '../config/constants.js';
import { DISEASE_CATALOG } from '../config/diseaseCatalog.js';

/**
 * @desc Get all medical records for the authenticated patient
 * @route GET /api/medical-records/patient
 */
export const getMyMedicalRecords = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name specialty email phone consultationFee')
      .populate('clinicId', 'name location address phone')
      .populate('appointmentId', 'date startTime endTime status reason')
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get structured chronological medical timeline for authenticated patient
 * @route GET /api/medical-records/patient/timeline
 */
export const getPatientTimeline = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    // Fetch medical records and all appointments for the patient
    const [medicalRecords, appointments] = await Promise.all([
      MedicalRecord.find({ patientId })
        .populate('doctorId', 'name specialty email phone')
        .populate('clinicId', 'name location address')
        .populate('appointmentId')
        .sort({ date: -1 }),
      Appointment.find({ patientId })
        .populate('doctorId', 'name specialty email phone')
        .populate('clinicId', 'name location address')
        .sort({ date: -1 }),
    ]);

    // Build chronological timeline events
    const timelineEvents = [];

    // Add medical records (with doctor diagnosis, prescription, notes)
    medicalRecords.forEach((rec) => {
      timelineEvents.push({
        id: `rec-${rec._id}`,
        type: 'DOCTOR_TREATMENT_RECORD',
        date: rec.date,
        doctor: rec.doctorId,
        clinic: rec.clinicId,
        patientReportedCondition: rec.patientReportedCondition,
        patientSymptoms: rec.patientSymptoms,
        diagnosis: rec.diagnosis,
        clinicalNotes: rec.clinicalNotes,
        vitalSigns: rec.vitalSigns,
        medications: rec.medications,
        prescriptionSummary: rec.prescriptionSummary,
        followUpDate: rec.followUpDate,
        followUpInstructions: rec.followUpInstructions,
        additionalRecommendations: rec.additionalRecommendations,
        medicalRecordId: rec._id,
        appointmentId: rec.appointmentId?._id,
      });

      // If follow-up was scheduled, add a follow-up event
      if (rec.followUpDate) {
        timelineEvents.push({
          id: `followup-${rec._id}`,
          type: 'FOLLOW_UP_MILESTONE',
          date: rec.followUpDate,
          doctor: rec.doctorId,
          clinic: rec.clinicId,
          diagnosis: rec.diagnosis,
          followUpInstructions: rec.followUpInstructions,
          isUpcoming: new Date(rec.followUpDate) >= new Date(),
          medicalRecordId: rec._id,
        });
      }
    });

    // Add standalone appointments (if not already represented by medical record)
    const treatedApptIds = new Set(
      medicalRecords.map((r) => r.appointmentId?._id?.toString()).filter(Boolean)
    );

    appointments.forEach((appt) => {
      if (!treatedApptIds.has(appt._id.toString())) {
        timelineEvents.push({
          id: `appt-${appt._id}`,
          type: 'APPOINTMENT_LOG',
          date: appt.date,
          doctor: appt.doctorId,
          clinic: appt.clinicId,
          status: appt.status,
          reason: appt.reason,
          patientCondition: appt.patientCondition,
          patientSymptoms: appt.patientSymptoms,
          notes: appt.notes,
          appointmentId: appt._id,
        });
      }
    });

    // Sort all timeline events newest first
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      success: true,
      count: timelineEvents.length,
      data: timelineEvents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get aggregated medication history for the patient
 * @route GET /api/medical-records/patient/medications
 */
export const getMyMedications = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name location')
      .sort({ date: -1 });

    const activeMedications = [];
    const pastMedications = [];

    records.forEach((rec) => {
      (rec.medications || []).forEach((med) => {
        const item = {
          _id: med._id,
          medicineName: med.medicineName,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
          isActive: med.isActive,
          startDate: med.startDate || rec.date,
          endDate: med.endDate,
          prescribedBy: rec.doctorId?.name,
          prescribingSpecialty: rec.doctorId?.specialty,
          clinicName: rec.clinicId?.name,
          datePrescribed: rec.date,
          diagnosis: rec.diagnosis,
          medicalRecordId: rec._id,
        };

        if (med.isActive) {
          activeMedications.push(item);
        } else {
          pastMedications.push(item);
        }
      });
    });

    return res.status(200).json({
      success: true,
      totalCount: activeMedications.length + pastMedications.length,
      data: {
        activeMedications,
        pastMedications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get patient's condition -> doctor -> appointment -> treatment journey
 * @route GET /api/medical-records/patient/diagnoses
 */
export const getMyDiagnoses = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name specialty email phone')
      .populate('clinicId', 'name location address')
      .populate('appointmentId')
      .sort({ date: -1 });

    const conditionJourneys = records.map((rec) => ({
      _id: rec._id,
      condition: rec.diagnosis,
      patientReportedCondition: rec.patientReportedCondition,
      doctorName: rec.doctorId?.name,
      doctorSpecialty: rec.doctorId?.specialty,
      doctorId: rec.doctorId?._id,
      clinicName: rec.clinicId?.name,
      clinicLocation: rec.clinicId?.location,
      appointmentDate: rec.date,
      appointmentId: rec.appointmentId?._id,
      clinicalNotes: rec.clinicalNotes,
      vitalSigns: rec.vitalSigns,
      medications: rec.medications,
      prescriptionSummary: rec.prescriptionSummary,
      followUpDate: rec.followUpDate,
      followUpInstructions: rec.followUpInstructions,
      createdAt: rec.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: conditionJourneys.length,
      data: conditionJourneys,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get medical records of a patient for an authorized doctor
 * @route GET /api/medical-records/doctor/patient/:patientId
 */
export const getPatientRecordsForDoctor = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;

    // Verify doctor authorization: check if this doctor has had/has an appointment with this patient
    const hasAuthorizedRelationship =
      req.user.role === ROLES.ADMIN ||
      (await Appointment.exists({ doctorId, patientId })) ||
      (await MedicalRecord.exists({ doctorId, patientId }));

    if (!hasAuthorizedRelationship) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this patient’s medical records.',
      });
    }

    const [records, patient, appointments] = await Promise.all([
      MedicalRecord.find({ patientId })
        .populate('doctorId', 'name specialty')
        .populate('clinicId', 'name location')
        .sort({ date: -1 }),
      User.findById(patientId).select('name email phone'),
      Appointment.find({ doctorId, patientId }).sort({ date: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        patient,
        recordsCount: records.length,
        records,
        appointmentsCount: appointments.length,
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single medical record detail
 * @route GET /api/medical-records/:id
 */
export const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('doctorId', 'name specialty email phone consultationFee')
      .populate('clinicId', 'name location address phone email')
      .populate('patientId', 'name email phone')
      .populate('appointmentId');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found.',
      });
    }

    // Access control: Only the patient, doctor who authored, or admin
    const userId = req.user._id.toString();
    const isPatient = record.patientId?._id?.toString() === userId;
    const isDoctor = record.doctorId?._id?.toString() === userId;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view this medical record.',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Doctor creates a new medical record / prescription for an appointment
 * @route POST /api/medical-records
 */
export const createMedicalRecord = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.DOCTOR && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only authorized doctors can create medical records and prescriptions.',
      });
    }

    const {
      patientId,
      appointmentId,
      clinicId,
      date,
      patientReportedCondition,
      patientSymptoms,
      diagnosis,
      clinicalNotes,
      vitalSigns,
      medications,
      prescriptionSummary,
      followUpDate,
      followUpInstructions,
      additionalRecommendations,
    } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and doctor diagnosis are required.',
      });
    }

    const doctorId = req.user._id;

    // Check clinic ID: if not provided, try to get from doctor's profile or appointment
    let resolvedClinicId = clinicId;
    let appointment = null;

    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        resolvedClinicId = resolvedClinicId || appointment.clinicId;
      }
    }

    if (!resolvedClinicId) {
      const doctorUser = await User.findById(doctorId);
      resolvedClinicId = doctorUser?.clinicId;
    }

    const recordDate = date || (appointment ? appointment.date : new Date().toISOString().split('T')[0]);

    // Create MedicalRecord
    const medicalRecord = await MedicalRecord.create({
      patientId,
      doctorId,
      appointmentId: appointmentId || undefined,
      clinicId: resolvedClinicId,
      date: recordDate,
      patientReportedCondition: patientReportedCondition || (appointment?.patientCondition || 'Consultation'),
      patientSymptoms: patientSymptoms || (appointment?.patientSymptoms || []),
      diagnosis,
      clinicalNotes: clinicalNotes || '',
      vitalSigns: vitalSigns || {},
      medications: medications || [],
      prescriptionSummary: prescriptionSummary || '',
      followUpDate: followUpDate || '',
      followUpInstructions: followUpInstructions || '',
      additionalRecommendations: additionalRecommendations || '',
      status: followUpDate ? 'FOLLOW_UP_SCHEDULED' : 'COMPLETED',
    });

    // If linked to an appointment, mark appointment as COMPLETED and attach treatment record
    if (appointment) {
      appointment.status = APPOINTMENT_STATUS.COMPLETED;
      appointment.treatmentRecordId = medicalRecord._id;
      if (followUpDate) {
        appointment.followUpDate = followUpDate;
      }
      appointment.queueStatus = 'COMPLETED';
      await appointment.save();
    }

    // Send notification to the patient
    const doctorUser = await User.findById(doctorId);
    const doctorName = doctorUser?.name || 'Your Doctor';

    await sendNotification({
      userId: patientId,
      appointmentId: appointmentId || undefined,
      message: `${doctorName} has recorded your diagnosis (${diagnosis}) and clinical treatment record for ${recordDate}.`,
      type: NOTIFICATION_TYPE.MEDICAL_RECORD,
    });

    if (followUpDate) {
      await sendNotification({
        userId: patientId,
        appointmentId: appointmentId || undefined,
        message: `Follow-up consultation recommended by ${doctorName} on ${followUpDate}.`,
        type: NOTIFICATION_TYPE.FOLLOW_UP,
      });
    }

    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name location')
      .populate('patientId', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Medical record and prescription created successfully.',
      data: populatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Doctor updates their own clinical record
 * @route PUT /api/medical-records/:id
 */
export const updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found.',
      });
    }

    // Only the authoring doctor or admin can modify the record
    const isAuthor = record.doctorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify another doctor’s medical record.',
      });
    }

    const {
      diagnosis,
      clinicalNotes,
      vitalSigns,
      medications,
      prescriptionSummary,
      followUpDate,
      followUpInstructions,
      additionalRecommendations,
    } = req.body;

    if (diagnosis) record.diagnosis = diagnosis;
    if (clinicalNotes !== undefined) record.clinicalNotes = clinicalNotes;
    if (vitalSigns) record.vitalSigns = { ...record.vitalSigns, ...vitalSigns };
    if (medications) record.medications = medications;
    if (prescriptionSummary !== undefined) record.prescriptionSummary = prescriptionSummary;
    if (followUpDate !== undefined) record.followUpDate = followUpDate;
    if (followUpInstructions !== undefined) record.followUpInstructions = followUpInstructions;
    if (additionalRecommendations !== undefined) record.additionalRecommendations = additionalRecommendations;

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Medical record updated successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get searchable Disease / Condition Catalog
 * @route GET /api/medical-records/conditions
 */
export const getConditions = async (req, res, next) => {
  try {
    const { search, category, specialty } = req.query;

    let conditions = [...DISEASE_CATALOG];

    if (specialty) {
      conditions = conditions.filter(
        (c) => c.recommendedSpecialty.toLowerCase() === specialty.toLowerCase()
      );
    }

    if (category) {
      conditions = conditions.filter(
        (c) => c.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      conditions = conditions.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.recommendedSpecialty.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.commonSymptoms.some((s) => s.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: conditions.length,
      data: conditions,
    });
  } catch (error) {
    next(error);
  }
};
