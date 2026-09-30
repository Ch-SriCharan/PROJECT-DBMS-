import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Waitlist from '../models/Waitlist.js';
import { generateSlots } from '../services/slotService.js';
import { ROLES, APPOINTMENT_STATUS, NOTIFICATION_TYPE, NOTIFICATION_STATUS } from '../config/constants.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

export const seedDatabase = async () => {
  try {
    console.log('--- Starting Database Seeding ---');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Clinic.deleteMany({}),
      Availability.deleteMany({}),
      Appointment.deleteMany({}),
      Notification.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Waitlist.deleteMany({}),
    ]);
    console.log('Cleaned existing database collections.');

    // 1. Seed Clinics
    const clinicsData = [
      {
        name: 'Apollo Health City',
        location: 'Hyderabad',
        address: 'Road No 72, Opposite Bharatiya Vidya Bhavan, Jubilee Hills, Hyderabad, Telangana 500033',
        phone: '+91 40 2360 7777',
        email: 'contact@apollohyderabad.com',
        description: 'Multi-specialty quaternary care hospital with state-of-the-art diagnostic and surgical centers.',
        openingHours: '08:00 AM - 08:00 PM',
      },
      {
        name: 'Manipal Hospital',
        location: 'Bangalore',
        address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
        phone: '+91 80 2502 4444',
        email: 'care@manipalbangalore.com',
        description: 'Leading tertiary care hospital renowned for neurology, cardiology, and comprehensive healthcare.',
        openingHours: '08:30 AM - 08:30 PM',
      },
      {
        name: 'Fortis Healthcare Center',
        location: 'Mumbai',
        address: 'Mulund Goregaon Link Rd, Industrial Area, Bhandup West, Mumbai, Maharashtra 400078',
        phone: '+91 22 6799 4444',
        email: 'support@fortismumbai.com',
        description: 'Premier healthcare facility offering cutting-edge orthopedic, pediatric, and dermatology departments.',
        openingHours: '09:00 AM - 09:00 PM',
      },
    ];

    const clinics = await Clinic.insertMany(clinicsData);
    console.log(`Created ${clinics.length} Clinics.`);

    // 2. Seed Admin User
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@healthcare.com',
      phone: '+91 9999900000',
      password: 'Admin@123',
      role: ROLES.ADMIN,
    });
    console.log(`Created Admin: ${adminUser.email} (Password: Admin@123)`);

    // 3. Seed Doctors with comprehensive specialty coverage
    const doctorsData = [
      {
        name: 'Dr. Rajesh Sharma',
        email: 'dr.sharma@healthcare.com',
        phone: '+91 9876543210',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Cardiology',
        clinicId: clinics[0]._id, // Hyderabad
        experience: 14,
        description: 'Senior Consultant Cardiologist specializing in preventive cardiology, coronary interventions, and heart rhythm management.',
        consultationFee: 750,
      },
      {
        name: 'Dr. Priya Patel',
        email: 'dr.patel@healthcare.com',
        phone: '+91 9876543211',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Neurology',
        clinicId: clinics[1]._id, // Bangalore
        experience: 11,
        description: 'Expert Neurologist with extensive research in stroke rehabilitation, migraine disorders, and neuro-muscular conditions.',
        consultationFee: 900,
      },
      {
        name: 'Dr. Vikram Reddy',
        email: 'dr.reddy@healthcare.com',
        phone: '+91 9876543212',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Pediatrics',
        clinicId: clinics[0]._id, // Hyderabad
        experience: 9,
        description: 'Compassionate Pediatrician focused on child nutrition, neonatal critical care, immunizations, and developmental tracking.',
        consultationFee: 500,
      },
      {
        name: 'Dr. Ananya Iyer',
        email: 'dr.ananya@healthcare.com',
        phone: '+91 9876543213',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Dermatology',
        clinicId: clinics[2]._id, // Mumbai
        experience: 8,
        description: 'Board-certified Dermatologist specializing in aesthetic treatments, chronic eczema, acne therapeutics, and laser skin care.',
        consultationFee: 650,
      },
      {
        name: 'Dr. Amit Verma',
        email: 'dr.verma@healthcare.com',
        phone: '+91 9876543214',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Orthopedics',
        clinicId: clinics[2]._id, // Mumbai
        experience: 16,
        description: 'Chief Orthopedic Surgeon specializing in minimally invasive joint replacements, sports injury arthroscopy, and spine care.',
        consultationFee: 1000,
      },
      {
        name: 'Dr. Sneha Kulkarni',
        email: 'dr.sneha@healthcare.com',
        phone: '+91 9876543215',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Dentistry',
        clinicId: clinics[1]._id, // Bangalore
        experience: 10,
        description: 'Dental Surgeon specializing in preventative dentistry, root canal therapy, teeth whitening, and restorative oral care.',
        consultationFee: 600,
      },
      {
        name: 'Dr. Arvind Menon',
        email: 'dr.menon@healthcare.com',
        phone: '+91 9876543216',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Ophthalmology',
        clinicId: clinics[0]._id, // Hyderabad
        experience: 13,
        description: 'Senior Ophthalmologist specializing in refractive eye care, cataract surgery, glaucoma management, and retinal health.',
        consultationFee: 700,
      },
      {
        name: 'Dr. Meera Nambiar',
        email: 'dr.meera@healthcare.com',
        phone: '+91 9876543217',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Gastroenterology',
        clinicId: clinics[2]._id, // Mumbai
        experience: 12,
        description: 'Consultant Gastroenterologist treating digestive disorders, IBS, acid reflux, liver conditions, and endoscopy procedures.',
        consultationFee: 850,
      },
      {
        name: 'Dr. Sanjay Sen',
        email: 'dr.sen@healthcare.com',
        phone: '+91 9876543218',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'ENT Specialist',
        clinicId: clinics[1]._id, // Bangalore
        experience: 15,
        description: 'Head & Neck ENT Specialist dealing with sinus treatments, ear infections, throat disorders, and vertigo management.',
        consultationFee: 650,
      },
      {
        name: 'Dr. Ramesh Rao',
        email: 'dr.rao@healthcare.com',
        phone: '+91 9876543219',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Urology',
        clinicId: clinics[2]._id, // Mumbai
        experience: 17,
        description: 'Urological Surgeon specializing in kidney stones, urinary tract infections, prostate wellness, and uro-oncology.',
        consultationFee: 950,
      },
      {
        name: 'Dr. Kavita Desai',
        email: 'dr.desai@healthcare.com',
        phone: '+91 9876543220',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Gynecology',
        clinicId: clinics[0]._id, // Hyderabad
        experience: 14,
        description: 'Senior Obstetrician & Gynecologist specializing in high-risk pregnancies, PCOS/PCOD care, and laparoscopic pelvic surgery.',
        consultationFee: 800,
      },
      {
        name: 'Dr. Alok Bansal',
        email: 'dr.bansal@healthcare.com',
        phone: '+91 9876543221',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'General Physician',
        clinicId: clinics[0]._id, // Hyderabad
        experience: 18,
        description: 'Senior Internal Medicine Specialist handling diagnostic medicine, fever management, viral infections, and lifestyle diseases.',
        consultationFee: 500,
      },
      {
        name: 'Dr. Sunita Chopra',
        email: 'dr.chopra@healthcare.com',
        phone: '+91 9876543222',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Pulmonology',
        clinicId: clinics[2]._id, // Mumbai
        experience: 11,
        description: 'Chest & Respiratory Consultant specializing in asthma, chronic bronchitis, respiratory allergies, and sleep apnea.',
        consultationFee: 750,
      },
      {
        name: 'Dr. Farhan Akhtar',
        email: 'dr.farhan@healthcare.com',
        phone: '+91 9876543223',
        password: 'Doctor@123',
        role: ROLES.DOCTOR,
        specialty: 'Psychiatry',
        clinicId: clinics[1]._id, // Bangalore
        experience: 12,
        description: 'Consultant Psychiatrist focused on adult anxiety, depressive disorders, stress resilience, and cognitive therapy.',
        consultationFee: 900,
      },
    ];

    const doctors = [];
    for (const docData of doctorsData) {
      const doc = await User.create(docData);
      doctors.push(doc);
    }
    console.log(`Created ${doctors.length} Doctors (Password: Doctor@123).`);

    // 4. Seed 10 Patients
    const patientsData = [
      { name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '+91 9123456780', password: 'Patient@123' },
      { name: 'Sneha Kapoor', email: 'sneha.kapoor@example.com', phone: '+91 9123456781', password: 'Patient@123' },
      { name: 'Amit Kumar', email: 'amit.kumar@example.com', phone: '+91 9123456782', password: 'Patient@123' },
      { name: 'Kavita Reddy', email: 'kavita.reddy@example.com', phone: '+91 9123456783', password: 'Patient@123' },
      { name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+91 9123456784', password: 'Patient@123' },
      { name: 'Anjali Mehta', email: 'anjali.mehta@example.com', phone: '+91 9123456785', password: 'Patient@123' },
      { name: 'Vikas Singh', email: 'vikas.singh@example.com', phone: '+91 9123456786', password: 'Patient@123' },
      { name: 'Pooja Joshi', email: 'pooja.joshi@example.com', phone: '+91 9123456787', password: 'Patient@123' },
      { name: 'Suresh Rao', email: 'suresh.rao@example.com', phone: '+91 9123456788', password: 'Patient@123' },
      { name: 'Deepa Nair', email: 'deepa.nair@example.com', phone: '+91 9123456789', password: 'Patient@123' },
    ];

    const patients = [];
    for (const patData of patientsData) {
      const pat = await User.create({
        ...patData,
        role: ROLES.PATIENT,
      });
      patients.push(pat);
    }
    console.log(`Created ${patients.length} Patients (Password: Patient@123).`);

    // 5. Seed Realistic Availability Schedules (Today and next 7 days)
    const today = new Date();
    for (const doc of doctors) {
      for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + dayOffset);
        const dateStr = formatDate(scheduleDate);

        const startTime = '09:00';
        const endTime = '13:00';
        const slots = generateSlots(startTime, endTime, 30);

        await Availability.create({
          doctorId: doc._id,
          date: dateStr,
          startTime,
          endTime,
          slotDuration: 30,
          slots,
        });
      }
    }
    console.log(`Generated 8-day availability schedules for all ${doctors.length} doctors.`);

    // 6. Seed Realistic Appointments
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const appointmentsData = [
      {
        patientId: patients[0]._id, // Rahul Verma
        doctorId: doctors[0]._id,   // Dr. Rajesh Sharma (Cardiology)
        clinicId: clinics[0]._id,
        date: formatDate(tomorrow),
        startTime: '09:30',
        endTime: '10:00',
        status: APPOINTMENT_STATUS.CONFIRMED,
        reason: 'Routine ECG checkup and chest tightness evaluation',
        notes: 'Patient advised to bring past fasting blood sugar reports.',
      },
      {
        patientId: patients[1]._id, // Sneha Kapoor
        doctorId: doctors[1]._id,   // Dr. Priya Patel (Neurology)
        clinicId: clinics[1]._id,
        date: formatDate(tomorrow),
        startTime: '10:00',
        endTime: '10:30',
        status: APPOINTMENT_STATUS.BOOKED,
        reason: 'Persistent migraine headaches and blurred vision episodes',
      },
      {
        patientId: patients[2]._id, // Amit Kumar
        doctorId: doctors[2]._id,   // Dr. Vikram Reddy (Pediatrics)
        clinicId: clinics[0]._id,
        date: formatDate(dayAfter),
        startTime: '11:00',
        endTime: '11:30',
        status: APPOINTMENT_STATUS.BOOKED,
        reason: 'Annual developmental assessment and immunization review',
      },
      {
        patientId: patients[3]._id, // Kavita Reddy
        doctorId: doctors[3]._id,   // Dr. Ananya Iyer (Dermatology)
        clinicId: clinics[2]._id,
        date: formatDate(today),
        startTime: '10:30',
        endTime: '11:00',
        status: APPOINTMENT_STATUS.COMPLETED,
        reason: 'Skin allergy test and eczema follow-up',
        notes: 'Prescribed topical corticosteroid and moisturizer cream.',
      },
      {
        patientId: patients[4]._id, // Rohan Gupta
        doctorId: doctors[4]._id,   // Dr. Amit Verma (Orthopedics)
        clinicId: clinics[2]._id,
        date: formatDate(today),
        startTime: '09:00',
        endTime: '09:30',
        status: APPOINTMENT_STATUS.CANCELLED,
        reason: 'Right knee pain after sports workout',
      },
    ];

    const createdAppointments = [];
    for (const apptData of appointmentsData) {
      const appt = await Appointment.create(apptData);
      createdAppointments.push(appt);

      // If active, mark slot as unavailable
      if ([APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED].includes(appt.status)) {
        await Availability.updateOne(
          { doctorId: appt.doctorId, date: appt.date, 'slots.startTime': appt.startTime },
          { $set: { 'slots.$.isAvailable': false } }
        );
      }
    }
    console.log(`Created ${createdAppointments.length} realistic initial appointments.`);

    // 7. Seed Notifications
    const notificationsData = [
      {
        userId: patients[0]._id,
        appointmentId: createdAppointments[0]._id,
        message: `Your appointment with Dr. Rajesh Sharma on ${formatDate(tomorrow)} at 09:30 has been confirmed.`,
        type: NOTIFICATION_TYPE.CONFIRMATION,
        status: NOTIFICATION_STATUS.UNREAD,
      },
      {
        userId: doctors[0]._id,
        appointmentId: createdAppointments[0]._id,
        message: `New appointment booked by Rahul Verma for ${formatDate(tomorrow)} at 09:30.`,
        type: NOTIFICATION_TYPE.BOOKING,
        status: NOTIFICATION_STATUS.UNREAD,
      },
      {
        userId: patients[1]._id,
        appointmentId: createdAppointments[1]._id,
        message: `Your appointment with Dr. Priya Patel on ${formatDate(tomorrow)} at 10:00 is awaiting confirmation.`,
        type: NOTIFICATION_TYPE.BOOKING,
        status: NOTIFICATION_STATUS.UNREAD,
      },
      {
        userId: patients[4]._id,
        appointmentId: createdAppointments[4]._id,
        message: `Your appointment with Dr. Amit Verma on ${formatDate(today)} at 09:00 has been cancelled.`,
        type: NOTIFICATION_TYPE.CANCELLATION,
        status: NOTIFICATION_STATUS.READ,
      },
    ];

    await Notification.insertMany(notificationsData);
    console.log(`Created ${notificationsData.length} in-app notifications.`);

    // 8. Seed Realistic Medical Records (Doctor Diagnoses, Clinical Notes, Medications, Follow-ups)
    const date12DaysAgo = new Date(today);
    date12DaysAgo.setDate(today.getDate() - 12);
    const date20DaysAgo = new Date(today);
    date20DaysAgo.setDate(today.getDate() - 20);
    const date45DaysAgo = new Date(today);
    date45DaysAgo.setDate(today.getDate() - 45);

    const followUpIn10Days = new Date(today);
    followUpIn10Days.setDate(today.getDate() + 10);
    const followUpIn30Days = new Date(today);
    followUpIn30Days.setDate(today.getDate() + 30);

    // Dr. Alok Bansal (General Physician), Dr. Rajesh Sharma (Cardiology), Dr. Sneha Kulkarni (Dentistry), Dr. Priya Patel (Neurology)
    const drAlok = doctors.find((d) => d.specialty === 'General Physician') || doctors[0];
    const drRajesh = doctors.find((d) => d.specialty === 'Cardiology') || doctors[0];
    const drSneha = doctors.find((d) => d.specialty === 'Dentistry') || doctors[1];
    const drPriya = doctors.find((d) => d.specialty === 'Neurology') || doctors[1];

    const medicalRecordsData = [
      {
        patientId: patients[0]._id, // Rahul Verma
        doctorId: drAlok._id,
        clinicId: clinics[0]._id,
        date: formatDate(date12DaysAgo),
        patientReportedCondition: 'Fever & Fatigue',
        patientSymptoms: ['Fever', 'Fatigue', 'Cough', 'Headache'],
        diagnosis: 'Acute Viral Upper Respiratory Infection',
        clinicalNotes: 'Patient presented with 3-day history of low-grade pyrexia and productive cough. Lung fields clear on auscultation. Pharyngeal erythema noted. Advised rest and antipyretics.',
        vitalSigns: {
          bloodPressure: '118/76 mmHg',
          heartRate: '78 bpm',
          temperature: '100.2 °F',
          weight: '70 kg',
          spO2: '98%',
        },
        medications: [
          {
            medicineName: 'Paracetamol',
            dosage: '650 mg',
            frequency: 'Thrice daily (TID)',
            duration: '5 days',
            instructions: 'Take after meals for fever or body ache',
            isActive: false,
            startDate: formatDate(date12DaysAgo),
            endDate: formatDate(new Date(date12DaysAgo.getTime() + 5 * 86400000)),
          },
          {
            medicineName: 'Cetirizine',
            dosage: '10 mg',
            frequency: 'Once daily at bedtime (OD)',
            duration: '5 days',
            instructions: 'Take at night with water. May cause drowsiness.',
            isActive: false,
            startDate: formatDate(date12DaysAgo),
            endDate: formatDate(new Date(date12DaysAgo.getTime() + 5 * 86400000)),
          },
          {
            medicineName: 'Vitamin C + Zinc',
            dosage: '500 mg',
            frequency: 'Once daily morning',
            duration: '15 days',
            instructions: 'Chewable tablet with breakfast',
            isActive: true,
            startDate: formatDate(date12DaysAgo),
          },
        ],
        prescriptionSummary: 'Rx: Paracetamol 650mg TDS x 5d, Cetirizine 10mg HS x 5d, Vit C 500mg OD x 15d',
        followUpDate: formatDate(new Date(date12DaysAgo.getTime() + 7 * 86400000)),
        followUpInstructions: 'Return if fever persists beyond 5 days or if breathing difficulty develops.',
        additionalRecommendations: 'Adequate hydration (3L water/day), warm saline gargles twice daily.',
        status: 'COMPLETED',
      },
      {
        patientId: patients[0]._id, // Rahul Verma
        doctorId: drRajesh._id,
        clinicId: clinics[0]._id,
        date: formatDate(date20DaysAgo),
        patientReportedCondition: 'Occasional Chest Tightness & High Blood Pressure',
        patientSymptoms: ['Chest pain', 'Shortness of breath'],
        diagnosis: 'Stage 1 Essential Hypertension',
        clinicalNotes: 'Resting ECG revealed normal sinus rhythm with no ST-T ischemic changes. Mild resting systolic elevation observed on two separate visits. Lipid profile and fasting blood sugar ordered.',
        vitalSigns: {
          bloodPressure: '138/88 mmHg',
          heartRate: '82 bpm',
          temperature: '98.4 °F',
          weight: '71 kg',
          spO2: '99%',
        },
        medications: [
          {
            medicineName: 'Telmisartan',
            dosage: '40 mg',
            frequency: 'Once daily morning',
            duration: '30 days',
            instructions: 'Take in the morning before food. Monitor home BP readings weekly.',
            isActive: true,
            startDate: formatDate(date20DaysAgo),
          },
          {
            medicineName: 'Atorvastatin',
            dosage: '10 mg',
            frequency: 'Once daily bedtime',
            duration: '30 days',
            instructions: 'Take at night after dinner for lipid stabilization.',
            isActive: true,
            startDate: formatDate(date20DaysAgo),
          },
        ],
        prescriptionSummary: 'Rx: Telmisartan 40mg OD x 30d, Atorvastatin 10mg HS x 30d',
        followUpDate: formatDate(followUpIn10Days),
        followUpInstructions: 'Review with weekly home BP log and fasting lipid panel.',
        additionalRecommendations: 'DASH dietary pattern, restrict dietary sodium to < 2g/day, brisk walking 30 mins 5 days/week.',
        status: 'FOLLOW_UP_SCHEDULED',
      },
      {
        patientId: patients[0]._id, // Rahul Verma
        doctorId: drSneha._id,
        clinicId: clinics[1]._id,
        date: formatDate(date45DaysAgo),
        patientReportedCondition: 'Lower Molar Toothache',
        patientSymptoms: ['Tooth pain'],
        diagnosis: 'Dental Caries with Reversible Pulpitis (Tooth #36)',
        clinicalNotes: 'Deep occlusal decay on tooth #36. Direct composite restoration placed under local anesthesia. No periapical radiolucency on bitewing radiograph.',
        vitalSigns: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          temperature: '98.6 °F',
          weight: '70 kg',
        },
        medications: [
          {
            medicineName: 'Ibuprofen',
            dosage: '400 mg',
            frequency: 'As needed (SOS)',
            duration: '3 days',
            instructions: 'Take only if tooth pain occurs, always with or after food.',
            isActive: false,
            startDate: formatDate(date45DaysAgo),
            endDate: formatDate(new Date(date45DaysAgo.getTime() + 3 * 86400000)),
          },
          {
            medicineName: 'Chlorhexidine 0.2% Oral Rinse',
            dosage: '10 ml',
            frequency: 'Twice daily',
            duration: '7 days',
            instructions: 'Rinse mouth for 60 seconds after brushing, do not swallow.',
            isActive: false,
            startDate: formatDate(date45DaysAgo),
            endDate: formatDate(new Date(date45DaysAgo.getTime() + 7 * 86400000)),
          },
        ],
        prescriptionSummary: 'Rx: Ibuprofen 400mg SOS x 3d, Chlorhexidine 0.2% Rinse BD x 7d',
        followUpDate: formatDate(followUpIn30Days),
        followUpInstructions: 'Routine 6-month dental checkup and scaling review.',
        additionalRecommendations: 'Avoid extremely hard or sticky food on the left side for 24 hours. Maintain flossing routine.',
        status: 'COMPLETED',
      },
      {
        patientId: patients[1]._id, // Sneha Kapoor
        doctorId: drPriya._id,
        clinicId: clinics[1]._id,
        date: formatDate(date12DaysAgo),
        patientReportedCondition: 'Severe Recurring Headaches & Light Sensitivity',
        patientSymptoms: ['Headache', 'Dizziness', 'Eye pain / vision problems'],
        diagnosis: 'Chronic Migraine without Aura',
        clinicalNotes: 'Patient reports unilateral throbbing headaches 4-5 times monthly lasting >12 hours. Photophobia and mild nausea. Cranial nerve exam normal. Brain MRI unremarkable.',
        vitalSigns: {
          bloodPressure: '114/74 mmHg',
          heartRate: '70 bpm',
          temperature: '98.6 °F',
          weight: '58 kg',
        },
        medications: [
          {
            medicineName: 'Sumatriptan',
            dosage: '50 mg',
            frequency: 'At onset of acute headache',
            duration: '10 days',
            instructions: 'Take immediately at the start of migraine pain. Max 2 tablets in 24 hours.',
            isActive: true,
            startDate: formatDate(date12DaysAgo),
          },
          {
            medicineName: 'Propranolol',
            dosage: '20 mg',
            frequency: 'Twice daily (BD)',
            duration: '30 days',
            instructions: 'Prophylactic migraine prevention. Do not stop abruptly.',
            isActive: true,
            startDate: formatDate(date12DaysAgo),
          },
        ],
        prescriptionSummary: 'Rx: Sumatriptan 50mg PRN, Propranolol 20mg BD x 30d',
        followUpDate: formatDate(followUpIn30Days),
        followUpInstructions: 'Maintain a headache trigger diary (sleep, screen time, caffeine).',
        additionalRecommendations: 'Stress reduction techniques, consistent sleep hygiene schedule.',
        status: 'FOLLOW_UP_SCHEDULED',
      },
    ];

    const createdMedicalRecords = await MedicalRecord.insertMany(medicalRecordsData);
    console.log(`Created ${createdMedicalRecords.length} comprehensive medical & treatment records.`);

    // 9. Seed Sample Waitlist Entries
    const waitlistData = [
      {
        patientId: patients[0]._id, // Rahul Verma
        doctorId: drPriya._id,
        clinicId: clinics[1]._id,
        specialty: 'Neurology',
        preferredDate: formatDate(new Date(today.getTime() + 3 * 86400000)),
        preferredTime: 'MORNING',
        reason: 'Consultation for occasional tension headaches.',
        status: 'WAITING',
      },
      {
        patientId: patients[2]._id, // Amit Kumar
        doctorId: drRajesh._id,
        clinicId: clinics[0]._id,
        specialty: 'Cardiology',
        preferredDate: formatDate(new Date(today.getTime() + 2 * 86400000)),
        preferredTime: 'AFTERNOON',
        reason: 'Cardio fitness screening and stress test.',
        status: 'WAITING',
      },
    ];

    await Waitlist.insertMany(waitlistData);
    console.log(`Created ${waitlistData.length} active waitlist entries.`);

    console.log('--- Database Seeding Completed Successfully! ---');
  } catch (error) {
    console.error(`Error during database seeding: ${error.message}`);
    throw error;
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
