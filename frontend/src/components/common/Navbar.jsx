import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Activity,
  Calendar,
  Clock,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  CheckCircle,
  Building2,
  Stethoscope,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  CalendarPlus,
  Users,
} from 'lucide-react';
import Badge from './Badge';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'PATIENT') return '/patient/dashboard';
    if (user.role === 'DOCTOR') return '/doctor/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  const isCurrent = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                  Health<span className="text-teal-600">Sync</span>
                </span>
                <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-slate-400 -mt-1">
                  Clinical Network
                </span>
              </div>
            </Link>

            {/* Public Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/doctors"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isCurrent('/doctors')
                    ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Find Doctors
              </Link>
              <Link
                to="/symptoms"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isCurrent('/symptoms')
                    ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Find by Symptoms</span>
              </Link>
              <Link
                to="/clinics"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isCurrent('/clinics')
                    ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Clinics & Hospitals
              </Link>

              {/* Role-specific shortcut links */}
              {isAuthenticated && user?.role === 'PATIENT' && (
                <>
                  <Link
                    to="/patient/book"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent('/patient/book')
                        ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    Book Visit
                  </Link>
                  <Link
                    to="/patient/appointments"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent('/patient/appointments')
                        ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    My Appointments
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'DOCTOR' && (
                <>
                  <Link
                    to="/doctor/appointments"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent('/doctor/appointments')
                        ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/doctor/availability"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent('/doctor/availability')
                        ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    Availability Slots
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/users"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent('/admin/users')
                        ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/appointments"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent('/admin/appointments')
                        ? 'text-teal-700 bg-teal-50 border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    Appointments
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Direct Dashboard Link Button */}
                <Link
                  to={getDashboardLink()}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Dashboard</span>
                </Link>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Card */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/80 p-4 z-50 animate-scaleUp">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] font-bold text-teal-600 hover:text-teal-800 transition"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto mt-2 divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => notif.status === 'UNREAD' && markAsRead(notif._id)}
                              className={`p-3 rounded-xl transition cursor-pointer text-xs ${
                                notif.status === 'UNREAD'
                                  ? 'bg-teal-50/70 hover:bg-teal-100/70 font-medium'
                                  : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <div className="flex items-start space-x-2.5">
                                <div className="mt-0.5">
                                  <Badge size="sm" status={notif.type}>
                                    {notif.type}
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-slate-800 leading-snug break-words">
                                    {notif.message}
                                  </p>
                                  <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                                    {new Date(notif.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 transition focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-400 font-black flex items-center justify-center text-xs shadow-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-slate-900 leading-tight max-w-[120px] truncate">
                        {user?.name}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        {user?.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* User Dropdown Popover */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-2xl border border-slate-200/80 p-2 z-50 animate-scaleUp">
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email}</p>
                        <div className="mt-1.5">
                          <Badge variant="role" size="sm">
                            {user?.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition"
                        >
                          <Activity className="w-4 h-4 text-teal-600" />
                          <span>Portal Dashboard</span>
                        </Link>

                        {user?.role === 'PATIENT' && (
                          <>
                            <Link
                              to="/patient/appointments"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>My Appointments</span>
                            </Link>
                            <Link
                              to="/patient/book"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <CalendarPlus className="w-4 h-4 text-slate-400" />
                              <span>Book Appointment</span>
                            </Link>
                            <Link
                              to="/patient/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <User className="w-4 h-4 text-slate-400" />
                              <span>Profile Settings</span>
                            </Link>
                          </>
                        )}

                        {user?.role === 'DOCTOR' && (
                          <>
                            <Link
                              to="/doctor/appointments"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <Stethoscope className="w-4 h-4 text-slate-400" />
                              <span>Patient Consultations</span>
                            </Link>
                            <Link
                              to="/doctor/availability"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>Availability Slots</span>
                            </Link>
                            <Link
                              to="/doctor/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <User className="w-4 h-4 text-slate-400" />
                              <span>Doctor Profile</span>
                            </Link>
                          </>
                        )}

                        {user?.role === 'ADMIN' && (
                          <>
                            <Link
                              to="/admin/users"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <Users className="w-4 h-4 text-slate-400" />
                              <span>User Directory</span>
                            </Link>
                            <Link
                              to="/admin/doctors"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <Stethoscope className="w-4 h-4 text-slate-400" />
                              <span>Doctor Management</span>
                            </Link>
                            <Link
                              to="/admin/clinics"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <Building2 className="w-4 h-4 text-slate-400" />
                              <span>Clinic Directory</span>
                            </Link>
                            <Link
                              to="/admin/appointments"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition"
                            >
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>All Appointments</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs shadow-teal-600/20 transition"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          <Link
            to="/doctors"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Find Doctors
          </Link>
          <Link
            to="/symptoms"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50/50 hover:bg-teal-50 flex items-center justify-between"
          >
            <span>Find by Symptoms</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          </Link>
          <Link
            to="/clinics"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Clinics & Hospitals
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/60"
              >
                Go to Dashboard
              </Link>

              {user?.role === 'PATIENT' && (
                <>
                  <Link
                    to="/patient/appointments"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    My Appointments
                  </Link>
                  <Link
                    to="/patient/book"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Book Appointment
                  </Link>
                </>
              )}

              {user?.role === 'DOCTOR' && (
                <>
                  <Link
                    to="/doctor/appointments"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Patient Consultations
                  </Link>
                  <Link
                    to="/doctor/availability"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Availability Slots
                  </Link>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/users"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    User Directory
                  </Link>
                  <Link
                    to="/admin/appointments"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    All Appointments
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-center py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="text-center py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
