import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import DoctorsPage from './pages/public/DoctorsPage';
import DoctorDetailPage from './pages/public/DoctorDetailPage';
import ClinicsPage from './pages/public/ClinicsPage';
import ClinicDetailPage from './pages/public/ClinicDetailPage';
import SymptomCheckerPage from './pages/public/SymptomCheckerPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import AppointmentDetailPage from './pages/patient/AppointmentDetailPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorAvailabilityPage from './pages/doctor/DoctorAvailabilityPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminClinicsPage from './pages/admin/AdminClinicsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailPage />} />
              <Route path="/clinics" element={<ClinicsPage />} />
              <Route path="/clinics/:id" element={<ClinicDetailPage />} />
              <Route path="/symptoms" element={<SymptomCheckerPage />} />
              <Route path="/find-specialist" element={<SymptomCheckerPage />} />
            </Route>

            {/* Patient Protected Routes with DashboardLayout */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="book" element={<BookAppointmentPage />} />
              <Route path="appointments" element={<PatientAppointmentsPage />} />
              <Route path="appointments/:id" element={<AppointmentDetailPage />} />
              <Route path="profile" element={<PatientProfilePage />} />
            </Route>

            {/* Doctor Protected Routes with DashboardLayout */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
              <Route path="availability" element={<DoctorAvailabilityPage />} />
              <Route path="profile" element={<DoctorProfilePage />} />
            </Route>

            {/* Admin Protected Routes with DashboardLayout */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="doctors" element={<AdminDoctorsPage />} />
              <Route path="clinics" element={<AdminClinicsPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
