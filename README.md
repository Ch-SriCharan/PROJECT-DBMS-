# 🏥 Cross-Platform Appointment System for Healthcare and Clinics

A centralized, enterprise-grade digital healthcare appointment management platform connecting **Patients**, **Doctors / Healthcare Providers**, **Clinics**, and **System Administrators** with real-time schedule slot generation, strict server-level double-booking prevention, automated reminders, and role-based access control.

---

## 📑 Table of Contents
1. [System Architecture](#-system-architecture)
2. [Technology Stack](#-technology-stack)
3. [Folder Structure](#-folder-structure)
4. [User Roles & Capabilities](#-user-roles--capabilities)
5. [Concurrency & Double-Booking Protection](#-concurrency--double-booking-protection)
6. [Demo Accounts & Credentials](#-demo-accounts--credentials)
7. [Prerequisites & Installation](#-prerequisites--installation)
8. [Environment Variables](#-environment-variables)
9. [Database Seeding](#-database-seeding)
10. [Running the Application](#-running-the-application)
11. [Automated Testing Suite](#-automated-testing-suite)
12. [API Reference Documentation](#-api-reference-documentation)
13. [Postman Collection Guide](#-postman-collection-guide)
14. [Cloud Deployment Guide (Render + Vercel + MongoDB Atlas)](#-cloud-deployment-guide)
15. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🏗 System Architecture

```
                                  +-----------------------+
                                  |   Web Browser / App   |
                                  |    (React + Vite)     |
                                  +-----------+-----------+
                                              |
                                     REST APIs / JWT Auth
                                              |
                                              v
                              +---------------+---------------+
                              |    Node.js + Express Server   |
                              +---------------+---------------+
                                  |           |           |
               +------------------+           |           +-------------------+
               |                              |                               |
               v                              v                               v
    +-------------------+          +--------------------+          +---------------------+
    |  Auth & Security  |          |   Booking Engine   |          |    Cron Reminders   |
    | (JWT + bcryptjs)  |          | (Double-Lock Core) |          |     (node-cron)     |
    +-------------------+          +--------------------+          +---------------------+
                                              |
                                              v
                                   +---------------------+
                                   |    MongoDB Atlas    |
                                   | (Mongoose ODM + DB) |
                                   +---------------------+
```

---

## 💻 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React icons
- **Backend**: Node.js, Express.js, REST API, JSON Web Tokens (JWT), `bcryptjs`, `node-cron`
- **Database**: MongoDB & Mongoose ODM (Zero-config development with in-memory fallback + full MongoDB Atlas production support)
- **Testing**: Jest, Supertest, `mongodb-memory-server`
- **Deployment**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Cloud Database)

---

## 📂 Folder Structure

```
healthcare-appointment-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection (Atlas / Local / Memory fallback)
│   │   │   └── constants.js          # Roles, statuses, and notification types
│   │   ├── models/
│   │   │   ├── User.js               # Polymorphic User Model (Patient / Doctor / Admin)
│   │   │   ├── Clinic.js             # Hospital/Clinic facilities
│   │   │   ├── Availability.js       # Doctor schedules and slot definitions
│   │   │   ├── Appointment.js        # Appointments with partial unique collision indexes
│   │   │   └── Notification.js       # In-app notifications & reminders
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification & role authorization (requireRole)
│   │   │   ├── validate.js           # Request payload validations
│   │   │   └── errorHandler.js       # Centralized error formatter (HTTP 400, 401, 403, 404, 409, 500)
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, Login, Me, Profile update
│   │   │   ├── doctorController.js   # Multi-filter search (Specialty, City, Date, Keyword)
│   │   │   ├── clinicController.js   # Clinic directory and affiliated doctors
│   │   │   ├── availabilityController.js # Bulk slot generator and real-time slot state
│   │   │   ├── appointmentController.js  # Booking, rescheduling, cancellation, listings
│   │   │   ├── notificationController.js # In-app notification center & mark read
│   │   │   └── adminController.js    # Platform KPIs, users oversight, facility control
│   │   ├── services/
│   │   │   ├── slotService.js        # Dynamic time interval generator
│   │   │   ├── notificationService.js# Dispatcher for patient/doctor notifications
│   │   │   └── reminderJob.js        # Automated background cron job for appointment reminders
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── doctorRoutes.js
│   │   │   ├── clinicRoutes.js
│   │   │   ├── availabilityRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── seed/
│   │   │   └── seedData.js           # Full seed script with realistic demo data
│   │   ├── tests/
│   │   │   └── appointment.test.js   # Automated Jest/Supertest test suite (17 test cases)
│   │   └── server.js                 # Express application entrypoint
│   ├── .env.example
│   ├── postman_collection.json       # Postman collection for all REST endpoints
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/               # Navbar, Footer, Modal, Badge, ProtectedRoute, LoadingSpinner
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global user state, login, register, token handling
│   │   │   └── NotificationContext.jsx # Live notifications polling & toast dispatcher
│   │   ├── services/                 # Centralized Axios API service layer
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── doctorService.js
│   │   │   ├── clinicService.js
│   │   │   ├── availabilityService.js
│   │   │   ├── appointmentService.js
│   │   │   ├── notificationService.js
│   │   │   └── adminService.js
│   │   ├── pages/
│   │   │   ├── public/               # HomePage, LoginPage, RegisterPage, DoctorsPage, ClinicsPage
│   │   │   ├── patient/              # Dashboard, BookAppointment, AppointmentsList, Detail/Reschedule, Profile
│   │   │   ├── doctor/               # Dashboard, AppointmentsAgenda, AvailabilitySlotGenerator, Profile
│   │   │   └── admin/                # Dashboard, UserDirectory, DoctorManagement, ClinicManagement, AllAppointments
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── App.jsx                   # Route dispatcher with Role guards
│   │   ├── index.css                 # Tailwind CSS styles
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
│
├── README.md
├── .gitignore
└── package.json                      # Monorepo root script runner
```

---

## 👥 User Roles & Capabilities

### 1. Patient
- Register / Login with JWT authentication
- Search doctors with live multi-filtering by specialty, location, available date, or keywords
- Select open time slots on real-time doctor schedule calendars
- Book appointments with instant conflict prevention
- View upcoming, completed, and cancelled appointment timelines
- Reschedule appointments (automatically frees old slot and locks new slot)
- Cancel appointments (immediately releases time slot for other patients)
- Receive in-app notifications on booking, confirmation, rescheduling, cancellation, and reminders

### 2. Doctor / Healthcare Provider
- Register / Login with medical specialty, experience, consultation fee, and clinic affiliation
- Daily workstation agenda of patients scheduled for consultation
- 1-click status transitions: `BOOKED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `COMPLETED` / `CANCELLED`
- Record clinical notes and prescriptions per appointment
- Automated Schedule Slot Generator: define date, working hours (e.g. 09:00 - 13:00), and slot duration (e.g. 30 mins) to produce instant booking intervals
- Remove or modify daily availability

### 3. Administrator
- System Executive Dashboard with real-time KPI metrics (Total Patients, Doctors, Clinics, Active Bookings, Cancellations)
- Manage user directory across all accounts
- Provider accreditation and specialty oversight
- Full CRUD management of hospital & clinic facilities
- Master Appointment Ledger across all clinics

---

## 🔒 Concurrency & Double-Booking Protection

Double-booking is prevented using a **two-layer defensive strategy**:

1. **Database-Level Partial Unique Index**:
   ```javascript
   appointmentSchema.index(
     { doctorId: 1, date: 1, startTime: 1 },
     {
       unique: true,
       partialFilterExpression: {
         status: { $in: ['BOOKED', 'CONFIRMED'] }
       }
     }
   );
   ```
2. **Service-Layer Collision Interceptor**:
   Before creating a booking, the backend queries active appointments for the specified `doctorId`, `date`, and `startTime`. If a collision is detected or a duplicate key error is thrown during concurrent insertion, the server returns an explicit **HTTP 409 Conflict** with:
   ```json
   {
     "success": false,
     "message": "Appointment slot is no longer available. Please select another time slot."
   }
   ```

---

## 🔑 Demo Accounts & Credentials

The database seed script initializes ready-to-use demo accounts for immediate testing:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | System Administrator | `admin@healthcare.com` | `Admin@123` | Platform oversight & clinic manager |
| **DOCTOR** | Dr. Rajesh Sharma | `dr.sharma@healthcare.com` | `Doctor@123` | **Cardiology** • Apollo Health City, Hyderabad |
| **DOCTOR** | Dr. Priya Patel | `dr.patel@healthcare.com` | `Doctor@123` | **Neurology** • Manipal Hospital, Bangalore |
| **DOCTOR** | Dr. Vikram Reddy | `dr.reddy@healthcare.com` | `Doctor@123` | **Pediatrics** • Apollo Health City, Hyderabad |
| **DOCTOR** | Dr. Ananya Iyer | `dr.ananya@healthcare.com` | `Doctor@123` | **Dermatology** • Fortis Healthcare, Mumbai |
| **DOCTOR** | Dr. Amit Verma | `dr.verma@healthcare.com` | `Doctor@123` | **Orthopedics** • Fortis Healthcare, Mumbai |
| **PATIENT** | Rahul Verma | `rahul.verma@example.com` | `Patient@123` | Patient with upcoming Cardiology appointment |
| **PATIENT** | Sneha Kapoor | `sneha.kapoor@example.com` | `Patient@123` | Patient with upcoming Neurology appointment |
| **PATIENT** | Amit Kumar | `amit.kumar@example.com` | `Patient@123` | Patient with Pediatrics appointment |

*Note: On the login screen, 1-click demo buttons are provided to instantly log in as Patient, Doctor, or Admin without typing!*

---

## 🚀 Prerequisites & Installation

### Prerequisites:
- **Node.js**: Version 18.0.0 or higher (`node -v`)
- **npm**: Version 9.0.0 or higher (`npm -v`)

### Step 1: Clone or Navigate to the Monorepo
```bash
cd healthcare-appointment-system
```

### Step 2: Install All Dependencies
```bash
npm run install:all
```
*(Or install individually: `npm install` in root, `backend`, and `frontend`)*

---

## ⚙ Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/healthcare_appointment_system
JWT_SECRET=healthcare_appointment_secure_jwt_secret_2026_dev_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
*Note: If no local MongoDB is running, the backend automatically spins up an in-memory database fallback so you can test immediately without setup.*

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💾 Database Seeding

Populate the database with the Admin, 5 Doctors across 5 specialties, 3 Clinics, 10 Patients, live 8-day availability schedules, and appointments:

```bash
# Run from the root directory:
npm run seed

# Or run directly from backend:
cd backend && npm run seed
```

---

## 🏃 Running the Application

### Option A: Run Full-Stack Concurrently (Recommended)
From the root `healthcare-appointment-system/` directory:
```bash
npm run dev
```
This boots both:
- **Backend API**: `http://localhost:5000/api`
- **Frontend App**: `http://localhost:5173`

### Option B: Run Services Independently
**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 🧪 Automated Testing Suite

The project includes an automated end-to-end integration test suite using **Jest**, **Supertest**, and `mongodb-memory-server`.

To execute all tests:
```bash
# Run from root:
npm run test

# Or run from backend:
cd backend && npm test
```

### Test Coverage Highlights:
- ✅ Patient and Doctor registration with role assignment
- ✅ User login with bcrypt password verification
- ✅ JWT bearer token authentication and unauthenticated 401 rejection
- ✅ Role-based authorization (`requireRole`) and 403 Forbidden enforcement
- ✅ Doctor discovery with multi-filter queries (Specialty, Location, Search terms)
- ✅ Clinic discovery and associated medical specialists
- ✅ Doctor availability schedule and time slot generator
- ✅ Patient appointment booking and real-time slot state locking
- ✅ **Double-Booking & Concurrency Prevention (2 simultaneous requests $\rightarrow$ 1 succeeds with 201, 1 receives 409 Conflict)**
- ✅ Appointment rescheduling with old slot release and new slot reservation
- ✅ Appointment cancellation with slot release and notification generation
- ✅ Executive administration metrics and statistics calculation

---

## 📡 API Reference Documentation

Base URL: `http://localhost:5000/api`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | None | Register Patient or Doctor |
| `POST` | `/auth/login` | None | Log in and receive JWT token |
| `GET` | `/auth/me` | Bearer Token | Get current authenticated user profile |
| `PUT` | `/auth/profile` | Bearer Token | Update contact / clinical credentials |

### 2. Doctors (`/api/doctors`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/doctors` | None | List doctors with `?specialty=&location=&availableDate=&search=` |
| `GET` | `/doctors/:id` | None | Get full doctor profile and upcoming schedule |

### 3. Clinics (`/api/clinics`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/clinics` | None | List clinics with `?location=&search=` |
| `GET` | `/clinics/:id` | None | Get clinic details and affiliated doctor team |
| `POST` | `/clinics` | Admin | Create a new hospital or clinic facility |
| `PUT` | `/clinics/:id` | Admin | Update clinic details |
| `DELETE` | `/clinics/:id` | Admin | Remove clinic facility |

### 4. Availability (`/api/availability`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/availability` | Doctor / Admin | Bulk generate daily time slots for working hours |
| `GET` | `/availability/doctor/:doctorId` | None | Get open booking slots dynamically checked against bookings |
| `PUT` | `/availability/:id` | Doctor / Admin | Update availability slot states |
| `DELETE` | `/availability/:id` | Doctor / Admin | Delete schedule day |

### 5. Appointments (`/api/appointments`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/appointments` | Patient / Admin | Book slot (with double-booking protection) |
| `GET` | `/appointments` | Bearer Token | List appointments for logged-in user |
| `GET` | `/appointments/:id` | Bearer Token | Get appointment summary details |
| `PUT` | `/appointments/:id` | Doctor / Admin | Update appointment status (`CONFIRMED`, `COMPLETED`, `CANCELLED`) |
| `PUT` | `/appointments/:id/reschedule` | Patient / Admin | Atomically reschedule to a new available slot |
| `PUT` | `/appointments/:id/cancel` | Patient / Doctor / Admin | Cancel appointment and release time slot |

### 6. Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Bearer Token | Get user notifications and unread badge count |
| `PUT` | `/notifications/:id/read` | Bearer Token | Mark individual notification as read |
| `PUT` | `/notifications/read-all` | Bearer Token | Mark all user notifications as read |

### 7. Administration (`/api/admin`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | Admin | Platform KPI analytics and recent bookings |
| `GET` | `/admin/users` | Admin | User account directory with role filter |
| `DELETE` | `/admin/users/:id` | Admin | Delete account |

---

## 📮 Postman Collection Guide

1. Open Postman.
2. Click **Import** and select `backend/postman_collection.json`.
3. Set the `baseUrl` variable to `http://localhost:5000/api`.
4. Run the **Login** request to receive your token, then set the collection `token` variable to test protected endpoints.

---

## ☁ Cloud Deployment Guide

### 1. Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist IP addresses (`0.0.0.0/0` for cloud hosting).
3. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/healthcare_db?retryWrites=true&w=majority`.

### 2. Backend: Render
1. Create a **Web Service** on [Render](https://render.com).
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `JWT_SECRET`: `<Your secure random string>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `<Your Vercel frontend URL>`

### 3. Frontend: Vercel
1. Create a new project on [Vercel](https://vercel.com) pointing to the repository.
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-render-backend-url>/api`
5. Click **Deploy**.

---

## ❓ Troubleshooting & FAQ

- **Port 5000 already in use**:
  Change `PORT=5001` in `backend/.env` and update `VITE_API_URL=http://localhost:5001/api` in `frontend/.env`.
- **Local MongoDB not found**:
  The system automatically initializes an in-memory MongoDB fallback in development mode with zero configuration needed.
- **Double booking returns 409**:
  This is the intended security behavior when two requests simultaneously target the same time slot for a doctor.
