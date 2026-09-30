import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import { ROLES, APPOINTMENT_STATUS } from '../config/constants.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear database before each test
  await Promise.all([
    User.deleteMany({}),
    Clinic.deleteMany({}),
    Availability.deleteMany({}),
    Appointment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
});

describe('Healthcare Appointment System API Test Suite', () => {
  let patientToken;
  let patientId;
  let doctorToken;
  let doctorId;
  let adminToken;
  let clinicId;

  // Setup initial users & clinic for tests
  const setupInitialData = async () => {
    // 1. Create Clinic
    const clinic = await Clinic.create({
      name: 'Apollo Health City',
      location: 'Hyderabad',
      address: 'Jubilee Hills, Hyderabad',
      phone: '+91 40 2360 7777',
      email: 'info@apollo.com',
    });
    clinicId = clinic._id.toString();

    // 2. Register Patient
    const patientRes = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 9876500001',
      password: 'Password@123',
      role: ROLES.PATIENT,
    });
    patientToken = patientRes.body.data.token;
    patientId = patientRes.body.data.user._id;

    // 3. Register Doctor
    const doctorRes = await request(app).post('/api/auth/register').send({
      name: 'Dr. Sarah Connor',
      email: 'dr.sarah@example.com',
      phone: '+91 9876500002',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
      specialty: 'Cardiology',
      clinicId,
      experience: 12,
      consultationFee: 800,
    });
    doctorToken = doctorRes.body.data.token;
    doctorId = doctorRes.body.data.user._id;

    // 4. Register Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin Master',
      email: 'admin.master@example.com',
      phone: '+91 9876500003',
      password: 'Admin@123',
      role: ROLES.ADMIN,
    });
    adminToken = adminRes.body.data.token;
  };

  // ==========================================
  // 1. AUTHENTICATION & AUTHORIZATION
  // ==========================================
  describe('Authentication & Authorization', () => {
    test('POST /api/auth/register - Successfully registers a new patient', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        phone: '+91 9999911111',
        password: 'SecurePassword123',
        role: ROLES.PATIENT,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login - Successfully logs in with correct credentials', async () => {
      await setupInitialData();

      const res = await request(app).post('/api/auth/login').send({
        email: 'john.doe@example.com',
        password: 'Password@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login - Rejects invalid credentials (401)', async () => {
      await setupInitialData();

      const res = await request(app).post('/api/auth/login').send({
        email: 'john.doe@example.com',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/me - Rejects request without token (401)', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/me - Returns current user profile when authenticated', async () => {
      await setupInitialData();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('john.doe@example.com');
    });
  });

  // ==========================================
  // 2. DOCTOR & CLINIC DISCOVERY
  // ==========================================
  describe('Doctor & Clinic Discovery', () => {
    beforeEach(async () => {
      await setupInitialData();
    });

    test('GET /api/doctors - Filters by specialty and location', async () => {
      const res = await request(app).get('/api/doctors?specialty=Cardiology&location=Hyderabad');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe('Dr. Sarah Connor');
      expect(res.body.data[0].specialty).toBe('Cardiology');
    });

    test('GET /api/doctors/:id - Returns complete doctor profile', async () => {
      const res = await request(app).get(`/api/doctors/${doctorId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(doctorId);
    });

    test('GET /api/clinics - Returns clinic list and details', async () => {
      const res = await request(app).get('/api/clinics?search=Apollo');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].location).toBe('Hyderabad');
    });

    test('GET /api/clinics/:id - Returns clinic with affiliated doctors', async () => {
      const res = await request(app).get(`/api/clinics/${clinicId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.doctors).toHaveLength(1);
      expect(res.body.data.doctors[0].name).toBe('Dr. Sarah Connor');
    });
  });

  // ==========================================
  // 3. AVAILABILITY & SLOT GENERATION
  // ==========================================
  describe('Availability & Slot Generation', () => {
    beforeEach(async () => {
      await setupInitialData();
    });

    test('POST /api/availability - Doctor creates working hours and slots are generated', async () => {
      const res = await request(app)
        .post('/api/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          date: '2026-09-20',
          startTime: '09:00',
          endTime: '11:00',
          slotDuration: 30,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slots).toHaveLength(4); // 09:00, 09:30, 10:00, 10:30
      expect(res.body.data.slots[0].startTime).toBe('09:00');
      expect(res.body.data.slots[0].endTime).toBe('09:30');
      expect(res.body.data.slots[0].isAvailable).toBe(true);
    });

    test('GET /api/availability/doctor/:doctorId - Fetches doctor available slots', async () => {
      // Create availability
      await request(app)
        .post('/api/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          date: '2026-09-20',
          startTime: '09:00',
          endTime: '10:00',
          slotDuration: 30,
        });

      const res = await request(app).get(`/api/availability/doctor/${doctorId}?date=2026-09-20`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].slots).toHaveLength(2);
    });
  });

  // ==========================================
  // 4. APPOINTMENT BOOKING & DOUBLE-BOOKING PREVENTION
  // ==========================================
  describe('Appointment Booking & Concurrency Protection', () => {
    beforeEach(async () => {
      await setupInitialData();

      // Setup doctor availability
      await request(app)
        .post('/api/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          date: '2026-09-20',
          startTime: '09:00',
          endTime: '11:00',
          slotDuration: 30,
        });
    });

    test('POST /api/appointments - Successfully books an appointment', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId,
          clinicId,
          date: '2026-09-20',
          startTime: '09:00',
          endTime: '09:30',
          reason: 'Cardiac Health Checkup',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(APPOINTMENT_STATUS.BOOKED);
      expect(res.body.data.patientId.name).toBe('John Doe');

      // Check slot is now marked as unavailable
      const availRes = await request(app).get(`/api/availability/doctor/${doctorId}?date=2026-09-20`);
      const slot0 = availRes.body.data[0].slots.find((s) => s.startTime === '09:00');
      expect(slot0.isAvailable).toBe(false);

      // Check notification was generated for patient
      const notifRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(notifRes.body.count).toBeGreaterThanOrEqual(1);
    });

    test('DOUBLE BOOKING PREVENTION: Simultaneous booking requests for the same slot (One succeeds, one gets 409)', async () => {
      // Create a second patient
      const patient2Res = await request(app).post('/api/auth/register').send({
        name: 'Bob Miller',
        email: 'bob.miller@example.com',
        phone: '+91 9876500099',
        password: 'Password@123',
        role: ROLES.PATIENT,
      });
      const patient2Token = patient2Res.body.data.token;

      // Two simultaneous requests for the exact same slot
      const [res1, res2] = await Promise.all([
        request(app)
          .post('/api/appointments')
          .set('Authorization', `Bearer ${patientToken}`)
          .send({
            doctorId,
            clinicId,
            date: '2026-09-20',
            startTime: '10:00',
            endTime: '10:30',
            reason: 'Patient 1 Booking',
          }),
        request(app)
          .post('/api/appointments')
          .set('Authorization', `Bearer ${patient2Token}`)
          .send({
            doctorId,
            clinicId,
            date: '2026-09-20',
            startTime: '10:00',
            endTime: '10:30',
            reason: 'Patient 2 Booking',
          }),
      ]);

      const statusCodes = [res1.status, res2.status].sort();
      expect(statusCodes).toEqual([201, 409]);

      // Verify that the 409 response has a descriptive conflict message
      const conflictRes = res1.status === 409 ? res1 : res2;
      expect(conflictRes.body.success).toBe(false);
      expect(conflictRes.body.message).toMatch(/no longer available|already exists/i);
    });
  });

  // ==========================================
  // 5. RESCHEDULING & CANCELLATION
  // ==========================================
  describe('Rescheduling & Cancellation', () => {
    let appointmentId;

    beforeEach(async () => {
      await setupInitialData();

      // Availability for doctor
      await request(app)
        .post('/api/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          date: '2026-09-20',
          startTime: '09:00',
          endTime: '12:00',
          slotDuration: 30,
        });

      // Initial booking at 09:00
      const apptRes = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId,
          clinicId,
          date: '2026-09-20',
          startTime: '09:00',
          endTime: '09:30',
          reason: 'Initial consultation',
        });
      appointmentId = apptRes.body.data._id;
    });

    test('PUT /api/appointments/:id/reschedule - Reschedules appointment and updates slot states', async () => {
      const res = await request(app)
        .put(`/api/appointments/${appointmentId}/reschedule`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          newDate: '2026-09-20',
          newStartTime: '10:30',
          newEndTime: '11:00',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.startTime).toBe('10:30');
      expect(res.body.data.status).toBe(APPOINTMENT_STATUS.RESCHEDULED);

      // Verify old slot 09:00 is freed up and new slot 10:30 is reserved
      const availRes = await request(app).get(`/api/availability/doctor/${doctorId}?date=2026-09-20`);
      const slotOld = availRes.body.data[0].slots.find((s) => s.startTime === '09:00');
      const slotNew = availRes.body.data[0].slots.find((s) => s.startTime === '10:30');
      expect(slotOld.isAvailable).toBe(true);
      expect(slotNew.isAvailable).toBe(false);
    });

    test('PUT /api/appointments/:id/cancel - Cancels appointment and releases slot', async () => {
      const res = await request(app)
        .put(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(APPOINTMENT_STATUS.CANCELLED);

      // Verify slot 09:00 is freed
      const availRes = await request(app).get(`/api/availability/doctor/${doctorId}?date=2026-09-20`);
      const slot = availRes.body.data[0].slots.find((s) => s.startTime === '09:00');
      expect(slot.isAvailable).toBe(true);

      // Verify cancellation notification
      const notifs = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${patientToken}`);
      const cancelNotif = notifs.body.data.find((n) => n.type === 'CANCELLATION');
      expect(cancelNotif).toBeDefined();
    });
  });

  // ==========================================
  // 6. ADMIN SYSTEM & STATISTICS
  // ==========================================
  describe('Admin Operations', () => {
    beforeEach(async () => {
      await setupInitialData();
    });

    test('GET /api/admin/stats - Returns platform statistics for admin', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPatients).toBe(1);
      expect(res.body.data.totalDoctors).toBe(1);
      expect(res.body.data.totalClinics).toBe(1);
    });

    test('GET /api/admin/stats - Blocks non-admin users with 403', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
