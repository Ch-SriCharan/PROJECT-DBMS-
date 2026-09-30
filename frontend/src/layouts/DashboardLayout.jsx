import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Badge from '../components/common/Badge';
import {
  Calendar,
  Clock,
  User,
  Users,
  Building2,
  Stethoscope,
  LogOut,
  LayoutDashboard,
  CalendarPlus,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (user?.role === 'PATIENT') {
      return [
        { to: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/patient/book', label: 'Book Appointment', icon: CalendarPlus },
        { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
        { to: '/patient/profile', label: 'Profile Settings', icon: User },
      ];
    }

    if (user?.role === 'DOCTOR') {
      return [
        { to: '/doctor/dashboard', label: 'Workstation Overview', icon: LayoutDashboard },
        { to: '/doctor/appointments', label: 'Patient Agenda', icon: Stethoscope },
        { to: '/doctor/availability', label: 'Manage Slots', icon: Clock },
        { to: '/doctor/profile', label: 'Doctor Credentials', icon: User },
      ];
    }

    if (user?.role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Executive Overview', icon: LayoutDashboard },
        { to: '/admin/users', label: 'User Directory', icon: Users },
        { to: '/admin/doctors', label: 'Doctor Management', icon: Stethoscope },
        { to: '/admin/clinics', label: 'Hospital Hubs', icon: Building2 },
        { to: '/admin/appointments', label: 'Master Ledger', icon: Calendar },
      ];
    }

    return [];
  };

  const links = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 sticky top-24 space-y-5">
              {/* User badge card */}
              <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-teal-400 font-extrabold flex items-center justify-center text-base shadow-sm shrink-0 border border-slate-700/50">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {user?.name}
                  </h3>
                  <div className="mt-1">
                    <Badge variant="role" size="sm">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to.endsWith('dashboard')}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center space-x-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-teal-600' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{link.label}</span>
                          </div>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Sign out link */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
