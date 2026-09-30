import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Check,
  Building2,
  Phone,
  ChevronRight,
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const upcomingAppointments = appointments.filter(
    (a) => a.date > todayStr && ['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(a.status)
  );
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
  const cancelledAppointments = appointments.filter((a) => a.status === 'CANCELLED');

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const res = await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      if (res.success) {
        showToast(`Appointment status updated to ${newStatus}`);
        fetchDoctorAppointments();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading doctor workstation..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Workstation</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good morning, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Specialty:{' '}
            <span className="text-teal-300 font-extrabold">
              {user?.specialty || 'General Practitioner'}
            </span>{' '}
            • Hospital:{' '}
            <span className="text-white font-medium">
              {user?.clinicId?.name || 'Central Hospital'} ({user?.clinicId?.location || 'Hyderabad'})
            </span>
          </p>
        </div>

        <Link to="/doctor/availability">
          <Button size="md" variant="primary" className="shadow-lg">
            <Clock className="w-4 h-4" />
            <span>Manage Daily Slots</span>
          </Button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Today's Patients"
          value={todayAppointments.length}
          variant="teal"
          icon={Clock}
        />
        <StatCard
          title="Upcoming Bookings"
          value={upcomingAppointments.length}
          variant="blue"
          icon={Calendar}
        />
        <StatCard
          title="Completed Visits"
          value={completedAppointments.length}
          variant="emerald"
          icon={CheckCircle}
        />
        <StatCard
          title="Cancelled Bookings"
          value={cancelledAppointments.length}
          variant="rose"
          icon={XCircle}
        />
      </div>

      {/* Today's Schedule Agenda */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Today's Consultation Agenda ({todayStr})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients scheduled for today with 1-click status transitions
            </p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
          >
            <span>Full Schedule</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No appointments scheduled for today"
            description="You have no patient consultations on today's agenda. Check upcoming bookings or generate new availability slots."
            actionLabel="Manage Availability"
            actionLink="/doctor/availability"
          />
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((appt) => (
              <div
                key={appt._id}
                className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 hover:border-teal-500/40 transition-all bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    {appt.patientId?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {appt.patientId?.name || 'Patient'}
                      </h4>
                      <Badge status={appt.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Reason:</span> {appt.reason}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                      <span className="flex items-center space-x-1.5 font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{appt.startTime} - {appt.endTime}</span>
                      </span>
                      <span className="flex items-center space-x-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appt.patientId?.phone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Status Transitions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  {appt.status === 'BOOKED' && (
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => handleStatusChange(appt._id, 'CONFIRMED')}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Visit</span>
                    </Button>
                  )}

                  {['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(appt.status) && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusChange(appt._id, 'COMPLETED')}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </Button>
                  )}

                  {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="dangerSoft"
                      onClick={() => handleStatusChange(appt._id, 'CANCELLED')}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
