import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startReminderJob } from './services/reminderJob.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import waitlistRoutes from './routes/waitlistRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthcare Appointment System API is healthy and operational.',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/waitlist', waitlistRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;

// Only start the server listening if not imported in a test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    startReminderJob();
    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Healthcare Appointment Server running on port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  }).catch((err) => {
    console.error('Failed to initialize server:', err);
  });
}

export default app;
