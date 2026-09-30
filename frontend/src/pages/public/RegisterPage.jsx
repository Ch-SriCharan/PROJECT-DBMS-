import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { clinicService } from '../../services/clinicService';
import {
  Activity,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  Building2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const RegisterPage = () => {
  const [role, setRole] = useState('PATIENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialty: 'Cardiology',
    clinicId: '',
    experience: 5,
    consultationFee: 500,
    description: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const res = await clinicService.getClinics();
        if (res.success && res.data.length > 0) {
          setClinics(res.data);
          setFormData((prev) => ({ ...prev, clinicId: res.data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load clinics:', err);
      }
    };
    loadClinics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
      };
      const user = await register(payload);
      showToast(`Account created successfully! Welcome, ${user.name}`);

      if (user.role === 'PATIENT') navigate('/patient/dashboard');
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 items-center justify-center text-white shadow-lg shadow-teal-600/30">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create HealthSync Account
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Join the verified digital healthcare network to book visits or manage patient appointments
          </p>
        </div>

        {/* Role Selection Segmented Control */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              role === 'PATIENT'
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>I am a Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              role === 'DOCTOR'
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>I am a Healthcare Provider</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              required
              icon={User}
              value={formData.name}
              onChange={handleChange}
              placeholder={role === 'DOCTOR' ? 'Dr. Rajesh Sharma' : 'Rahul Verma'}
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              required
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Doctor-Specific Fields Section */}
          {role === 'DOCTOR' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Professional Accreditation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Medical Specialty
                  </label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Physician">General Physician</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Affiliated Hospital / Clinic
                  </label>
                  <select
                    name="clinicId"
                    value={formData.clinicId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    {clinics.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.location})
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Experience (Years)"
                  type="number"
                  name="experience"
                  min={0}
                  value={formData.experience}
                  onChange={handleChange}
                />

                <Input
                  label="Consultation Fee (₹)"
                  type="number"
                  name="consultationFee"
                  min={0}
                  value={formData.consultationFee}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Professional Bio / Special Interests
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Summary of qualifications and clinical experience..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            loading={loading}
            className="w-full mt-2"
          >
            <span>Complete Registration</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-700 hover:text-teal-800 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
