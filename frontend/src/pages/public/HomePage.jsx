import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { clinicService } from '../../services/clinicService';
import {
  Search,
  Calendar,
  ShieldCheck,
  Clock,
  Award,
  Stethoscope,
  Building2,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HeartPulse,
  ChevronRight,
  Zap,
  CalendarCheck,
  Lock,
  Bell,
  Activity,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [counts, setCounts] = useState({
    doctors: 5,
    clinics: 3,
    specialties: 5,
  });

  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveCounts = async () => {
      try {
        const [docsRes, clinicsRes] = await Promise.all([
          doctorService.getDoctors(),
          clinicService.getClinics(),
        ]);
        if (docsRes.success && clinicsRes.success) {
          const uniqueSpecialties = new Set(
            docsRes.data.map((d) => d.specialty).filter(Boolean)
          );
          setCounts({
            doctors: docsRes.data.length || 5,
            clinics: clinicsRes.data.length || 3,
            specialties: uniqueSpecialties.size || 5,
          });
        }
      } catch (err) {
        // Fallback to default accurate counts
      }
    };
    fetchLiveCounts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (specialty) params.append('specialty', specialty);
    navigate(`/doctors?${params.toString()}`);
  };

  const quickDemoLogin = async (email, password) => {
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'PATIENT') navigate('/patient/dashboard');
      else if (loggedUser.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const specialtiesList = [
    {
      name: 'Cardiology',
      icon: HeartPulse,
      desc: 'Heart health, diagnostics & rhythm monitoring',
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      name: 'Neurology',
      icon: Sparkles,
      desc: 'Brain, nerve disorders & migraine treatment',
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      name: 'Pediatrics',
      icon: Users,
      desc: 'Infant, child & adolescent health wellness',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      name: 'Dermatology',
      icon: ShieldCheck,
      desc: 'Clinical skincare, allergies & aesthetics',
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
    {
      name: 'Orthopedics',
      icon: Award,
      desc: 'Joints, spine therapy & sports rehabilitation',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 pb-16 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-teal-50/40 via-white to-[#f8fafc]">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948808_1px,transparent_1px),linear-gradient(to_bottom,#0d948808_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Quick 1-Click Demo Evaluation Toolbar */}
          <div className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                ⚡
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block">
                  Interactive Demo Profiles
                </span>
                <span className="text-xs text-slate-300">
                  Instantly switch between roles with ready-to-test mock profiles:
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => quickDemoLogin('rahul.verma@example.com', 'Patient@123')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition shadow-xs flex items-center space-x-1.5"
              >
                <span>👤 Patient Demo</span>
              </button>
              <button
                onClick={() => quickDemoLogin('dr.sharma@healthcare.com', 'Doctor@123')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-700 hover:bg-cyan-600 text-white transition shadow-xs flex items-center space-x-1.5"
              >
                <span>🩺 Doctor Demo</span>
              </button>
              <button
                onClick={() => quickDemoLogin('admin@healthcare.com', 'Admin@123')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white transition shadow-xs flex items-center space-x-1.5"
              >
                <span>🛡️ Admin Demo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-extrabold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span>SMARTER HEALTHCARE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Book the right doctor.{' '}
                <span className="text-teal-600 underline decoration-teal-300/60 decoration-wavy decoration-2 underline-offset-8">
                  At the right time.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                HealthSync connects verified patients with certified medical specialists across leading hospitals. Enjoy real-time slot generation, guaranteed double-booking protection, and automated visit reminders.
              </p>

              {/* Live Search & Filter Bar */}
              <form
                onSubmit={handleSearch}
                className="p-2 sm:p-2.5 rounded-2xl bg-white shadow-xl shadow-slate-200/70 border border-slate-200/90 flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 flex items-center px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search doctor, specialty, or clinic..."
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="sm:w-48 flex items-center px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Stethoscope className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" size="md" className="shrink-0">
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-600 font-semibold">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Real-Time Slot Engine</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Conflict-Free Locking</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Instant Verification</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Premium SaaS Visual Composition */}
            <div className="lg:col-span-5 relative">
              {/* Background ambient blur */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-4">
                {/* Featured Doctor Profile Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white shadow-xl shadow-slate-200/80 border border-slate-200/80 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                        R
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-extrabold text-slate-900 text-base">
                            Dr. Rajesh Sharma
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                        </div>
                        <p className="text-xs font-semibold text-teal-700">
                          Senior Consultant • Cardiology
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Apollo Health City • Hyderabad
                        </p>
                      </div>
                    </div>
                    <Badge status="CONFIRMED" size="sm">
                      Verified
                    </Badge>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Consultation Fee
                      </span>
                      <span className="font-black text-slate-900 text-sm">₹800</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Experience
                      </span>
                      <span className="font-bold text-slate-700">14 Years</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Next Open Slot
                      </span>
                      <span className="font-bold text-teal-700 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>09:30 AM</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Confirmed Appointment Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-2.5 transform sm:-rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">
                        Appointment Confirmed
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800">
                      ID #89210
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date & Time</span>
                      <span className="font-bold text-white">Tomorrow • 10:00 AM</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Status</span>
                      <span className="text-emerald-400 font-bold flex items-center justify-end space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Instant Lock Active</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / PLATFORM STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {counts.doctors}+
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Accredited Doctors
            </div>
            <p className="text-[11px] text-slate-400">Verified medical specialists</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {counts.clinics}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Hospital & Clinic Hubs
            </div>
            <p className="text-[11px] text-slate-400">Across tier-1 cities</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {counts.specialties}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Clinical Specialties
            </div>
            <p className="text-[11px] text-slate-400">Cardiology, Neurology & more</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              100%
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Double-Booking Lock
            </div>
            <p className="text-[11px] text-slate-400">Zero collision guarantee</p>
          </div>
        </div>
      </section>

      {/* SPECIALTIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600">
              Specialized Care
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Explore by Medical Specialty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a discipline to find certified doctors and open appointment slots
            </p>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 self-start sm:self-auto"
          >
            <span>Browse all specialists</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {specialtiesList.map((spec) => {
            const Icon = spec.icon;
            return (
              <Link
                key={spec.name}
                to={`/doctors?specialty=${spec.name}`}
                className="group p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/10 transition-all flex flex-col justify-between h-48"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border ${spec.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors text-sm">
                    {spec.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{spec.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SYMPTOM-BASED SPECIALIST DISCOVERY HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-teal-950 text-white shadow-xl shadow-slate-900/10 border border-slate-800 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-extrabold tracking-wider border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INTELLIGENT SPECIALIST TRIAGE</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Not sure which specialist to consult?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Select your symptoms to get a rule-based specialty recommendation (e.g. Tooth pain → Dentist, Chest pain → Cardiologist, Skin rash → Dermatologist) and instantly view available doctors.
              </p>
            </div>

            <Link to="/symptoms" className="shrink-0">
              <Button size="lg" variant="primary" className="shadow-lg shadow-teal-600/30">
                <Stethoscope className="w-4 h-4" />
                <span>Launch Symptom Discovery</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Quick Clickable Symptom Pills */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
              Common Symptoms — Click to Start:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Headache', id: 'headache' },
                { name: 'Fever & Cough', id: 'fever,cough' },
                { name: 'Chest Pain', id: 'chest-pain' },
                { name: 'Stomach Pain', id: 'stomach-pain' },
                { name: 'Skin Rash', id: 'skin-rash' },
                { name: 'Joint Pain', id: 'joint-pain' },
                { name: 'Tooth Pain', id: 'tooth-pain' },
                { name: 'Eye / Vision Issues', id: 'eye-pain-vision-problems' },
                { name: 'Ear Pain', id: 'ear-pain' },
                { name: 'Shortness of Breath', id: 'shortness-of-breath' },
                { name: 'Anxiety / Stress', id: 'anxiety-stress' },
                { name: 'Urinary Problems', id: 'urinary-problems' },
              ].map((sym) => (
                <Link
                  key={sym.id}
                  to={`/symptoms?symptoms=${sym.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-200 border border-slate-700 transition flex items-center space-x-1"
                >
                  <span>{sym.name}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (4 ELEGANT STEPS) */}
      <section className="bg-slate-900 text-white py-16 lg:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-400">
              Frictionless Care Flow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              How HealthSync Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Simple, transparent booking workflow designed for zero waiting time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 relative flex flex-col justify-between h-64">
              <span className="text-4xl font-black text-teal-400/30">01</span>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">Find a Doctor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search by medical discipline, experience, hospital facility, or city location.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 relative flex flex-col justify-between h-64">
              <span className="text-4xl font-black text-teal-400/30">02</span>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">Choose a Time Slot</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspect the live schedule calendar and select an open 15-to-30 minute consultation interval.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 relative flex flex-col justify-between h-64">
              <span className="text-4xl font-black text-teal-400/30">03</span>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">Confirm Appointment</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instant lock prevents simultaneous double-bookings and triggers an immediate verification notice.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 relative flex flex-col justify-between h-64">
              <span className="text-4xl font-black text-teal-400/30">04</span>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">Get Care & Follow-Up</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive automated reminders, attend consultation, and access doctor notes and prescriptions in your portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Patients, Providers & Hospitals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Real-Time Slot Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Doctors publish daily working hours and duration intervals. The system dynamically renders open slots in real-time.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Two-Layer Collision Interceptor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Database-level partial unique indexes plus atomic service checks ensure no two patients can ever book the same slot.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Automated Reminders</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Background cron processes monitor upcoming appointments and dispatch in-app notifications so you never miss a visit.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-teal-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-200">
              Ready to begin?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Your next appointment is a few clicks away.
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-lg">
              Join thousands of patients experiencing seamless, verified digital healthcare scheduling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/doctors">
              <Button size="lg" variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
                <span>Find a Doctor</span>
                <ArrowRight className="w-4 h-4 text-teal-600" />
              </Button>
            </Link>
            <Link to="/clinics">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                Explore Clinics
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
