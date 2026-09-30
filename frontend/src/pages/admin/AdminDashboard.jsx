import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Stethoscope,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
  PlusCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await adminService.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Aggregating platform health statistics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Administration</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Real-time platform oversight across registered patients, certified medical providers, hospital facilities, and booking transactions.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link to="/admin/clinics">
            <Button size="md" variant="primary" className="bg-purple-600 hover:bg-purple-700 border-purple-500">
              <PlusCircle className="w-4 h-4" />
              <span>Add Clinic Facility</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          variant="blue"
          icon={Users}
        />
        <StatCard
          title="Accredited Doctors"
          value={stats?.totalDoctors || 0}
          variant="teal"
          icon={Stethoscope}
        />
        <StatCard
          title="Hospital Hubs"
          value={stats?.totalClinics || 0}
          variant="purple"
          icon={Building2}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalAppointments || 0}
          variant="default"
          icon={Calendar}
        />
      </div>

      {/* Secondary Operational Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Upcoming Visits"
          value={stats?.upcomingAppointments || 0}
          variant="teal"
          subtitle="Scheduled & active sessions"
          icon={Calendar}
        />
        <StatCard
          title="Completed Consultations"
          value={stats?.completedAppointments || 0}
          variant="emerald"
          subtitle="Finished patient appointments"
          icon={CheckCircle}
        />
        <StatCard
          title="Cancelled Bookings"
          value={stats?.cancelledAppointments || 0}
          variant="rose"
          subtitle="Released time slot intervals"
          icon={XCircle}
        />
      </div>

      {/* Recent Platform Appointments */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Recent Platform Appointments
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consultation transactions across all clinic facilities
            </p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
          >
            <span>Master Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {!stats?.recentAppointments || stats.recentAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments recorded yet"
            description="Patient booking sessions will populate here in real-time."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Doctor</th>
                  <th className="py-3 px-3">Hospital Hub</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentAppointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 block">
                        {appt.patientId?.name || 'Patient'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {appt.patientId?.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-800 block">
                        {appt.doctorId?.name || 'Doctor'}
                      </span>
                      <span className="text-[10px] text-teal-700 font-bold block">
                        {appt.doctorId?.specialty}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="font-medium">{appt.clinicId?.name}</div>
                      <span className="text-[10px] text-slate-400">{appt.clinicId?.location}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      <span className="font-bold block">{appt.date}</span>
                      <span className="text-[10px] text-slate-400">{appt.startTime}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge status={appt.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
