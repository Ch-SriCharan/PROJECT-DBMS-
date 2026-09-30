import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'PATIENT') {
        navigate('/patient/dashboard', { replace: true });
      } else if (loggedUser.role === 'DOCTOR') {
        navigate('/doctor/dashboard', { replace: true });
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(demoEmail, demoPassword);
      showToast(`Logged in as ${loggedUser.name} (${loggedUser.role})`);

      if (loggedUser.role === 'PATIENT') navigate('/patient/dashboard');
      else if (loggedUser.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 items-center justify-center text-white shadow-lg shadow-teal-600/30">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to HealthSync
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Access your secure appointments, medical schedules, and clinical records
          </p>
        </div>

        {/* Quick 1-Click Demo Login Bar */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-4 space-y-2.5 shadow-xl shadow-slate-900/10">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-400">
            <span>⚡ Instant Demo Access (1-Click):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('rahul.verma@example.com', 'Patient@123')}
              className="flex items-center justify-center space-x-1 p-2 rounded-xl bg-slate-800 hover:bg-teal-600 text-white text-[11px] font-bold transition border border-slate-700 hover:border-teal-500 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('dr.sharma@healthcare.com', 'Doctor@123')}
              className="flex items-center justify-center space-x-1 p-2 rounded-xl bg-slate-800 hover:bg-teal-600 text-white text-[11px] font-bold transition border border-slate-700 hover:border-teal-500 shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@healthcare.com', 'Admin@123')}
              className="flex items-center justify-center space-x-1 p-2 rounded-xl bg-slate-800 hover:bg-teal-600 text-white text-[11px] font-bold transition border border-slate-700 hover:border-teal-500 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 space-y-4"
        >
          <Input
            label="Email Address"
            type="email"
            required
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            loading={loading}
            className="w-full mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Register Prompt */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-teal-700 hover:text-teal-800 underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
