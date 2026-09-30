import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Phone, Mail, MapPin, HeartHandshake, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
                <Activity className="w-4 h-4 text-slate-950 stroke-[3]" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Health<span className="text-teal-400">Sync</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Modern digital healthcare appointment infrastructure connecting verified patients, doctors, and clinics with zero waiting times and real-time scheduling.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-teal-400 font-medium">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Enterprise Encrypted</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Practitioners</span>
              </div>
            </div>
          </div>

          {/* Patient Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              For Patients
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/doctors" className="hover:text-teal-400 transition">
                  Find Specialists
                </Link>
              </li>
              <li>
                <Link to="/clinics" className="hover:text-teal-400 transition">
                  Hospital & Clinics
                </Link>
              </li>
              <li>
                <Link to="/patient/book" className="hover:text-teal-400 transition">
                  Book Instant Visit
                </Link>
              </li>
              <li>
                <Link to="/patient/appointments" className="hover:text-teal-400 transition">
                  Manage Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Providers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              For Providers
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="hover:text-teal-400 transition">
                  Provider Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-400 transition">
                  Join Provider Network
                </Link>
              </li>
              <li>
                <Link to="/doctor/availability" className="hover:text-teal-400 transition">
                  Schedule Slots
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-teal-400 transition">
                  Clinic Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Locations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Hubs & Support
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Hyderabad • Bangalore • Mumbai</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>1800-HEALTH-SYNC</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>care@healthsync.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 HealthSync Care Technologies. All rights reserved.</p>
          <div className="flex space-x-5 text-slate-400">
            <span className="hover:text-teal-400 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-teal-400 cursor-pointer transition">Terms of Care</span>
            <span className="hover:text-teal-400 cursor-pointer transition">Security Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
