import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  User,
  Search,
  CalendarCheck,
  Building2,
  Phone,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { notifications, showToast } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptToCancel, setSelectedApptToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Failed to load patient appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingAppointments = appointments.filter(
    (a) =>
      ['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(a.status) &&
      a.date >= todayStr
  );

  const nextUpcoming = upcomingAppointments[0] || null;

  const pastAppointments = appointments.filter(
    (a) => a.status === 'COMPLETED' || (a.date < todayStr && a.status !== 'CANCELLED')
  );

  const cancelledAppointments = appointments.filter((a) => a.status === 'CANCELLED');

  const handleCancelConfirm = async () => {
    if (!selectedApptToCancel) return;
    setCancelLoading(true);
    try {
      const res = await appointmentService.cancelAppointment(selectedApptToCancel._id);
      if (res.success) {
        showToast('Appointment cancelled successfully and time slot released.');
        setCancelModalOpen(false);
        setSelectedApptToCancel(null);
        fetchAppointments();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your health portal..." />;
  }

  return (
    <div className="space-y-8">
      {/* Personalized Greeting Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-teal-600/60 text-teal-200 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
            <span>Patient Portal</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good morning, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl leading-relaxed">
            Manage your scheduled medical visits, check real-time doctor availability, and review consultation history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/symptoms">
            <Button size="md" variant="secondary" className="bg-teal-900/80 text-teal-200 hover:bg-teal-900 border border-teal-500/40">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Find by Symptoms</span>
            </Button>
          </Link>
          <Link to="/patient/book">
            <Button size="md" variant="secondary" className="bg-white text-teal-900 hover:bg-teal-50">
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>Book Appointment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Prominent Next Upcoming Appointment Highlight */}
      {nextUpcoming ? (
        <div className="bg-white rounded-3xl border border-teal-200/80 p-6 sm:p-7 shadow-md shadow-teal-600/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Next Upcoming Consultation
              </span>
              <Badge status={nextUpcoming.status} />
            </div>
            <Link
              to={`/patient/appointments/${nextUpcoming._id}`}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
            >
              <span>View Full Details</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                {nextUpcoming.doctorId?.name?.replace('Dr. ', '').charAt(0) || 'D'}
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {nextUpcoming.doctorId?.name}
                </h3>
                <p className="text-xs font-bold text-teal-700">
                  {nextUpcoming.doctorId?.specialty} • {nextUpcoming.clinicId?.name}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{nextUpcoming.date}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{nextUpcoming.startTime} - {nextUpcoming.endTime}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{nextUpcoming.clinicId?.location}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 self-end md:self-center">
              <Link to={`/patient/appointments/${nextUpcoming._id}`}>
                <Button size="sm" variant="outline">
                  Reschedule
                </Button>
              </Link>
              <Button
                size="sm"
                variant="dangerSoft"
                onClick={() => {
                  setSelectedApptToCancel(nextUpcoming);
                  setCancelModalOpen(true);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/symptoms"
          className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/80 shadow-2xs hover:shadow-md hover:border-teal-500 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold text-teal-950 group-hover:text-teal-700 transition-colors">
            Find by Symptoms
          </h4>
          <p className="text-[11px] text-teal-800 mt-0.5">Rule-based specialist discovery</p>
        </Link>

        <Link
          to="/patient/book"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-500/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
            Book Appointment
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Find doctors & reserve slots</p>
        </Link>

        <Link
          to="/patient/appointments"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-500/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
            My Appointments
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Timeline & past visits</p>
        </Link>

        <Link
          to="/patient/profile"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-500/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <User className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Profile Settings
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Contact & notification details</p>
        </Link>
      </div>

      {/* Recent Appointments Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Recent Consultations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your recent clinical visits and booking activity
            </p>
          </div>
          <Link
            to="/patient/appointments"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments booked yet"
            description="You have not scheduled any healthcare appointments yet. Find a specialist to book your first visit."
            actionLabel="Book Consultation"
            actionLink="/patient/book"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Doctor & Specialty</th>
                  <th className="py-3 px-3">Hospital / Clinic</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-slate-900">
                        {appt.doctorId?.name || 'Doctor'}
                      </div>
                      <span className="text-[10px] text-teal-700 font-bold block">
                        {appt.doctorId?.specialty}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <div>{appt.clinicId?.name}</div>
                      <span className="text-[10px] text-slate-400">{appt.clinicId?.location}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      <div>{appt.date}</div>
                      <span className="text-[10px] text-slate-400">{appt.startTime}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge status={appt.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/patient/appointments/${appt._id}`}
                        className="font-bold text-teal-700 hover:text-teal-800 hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to cancel your consultation with{' '}
              <span className="font-bold">{selectedApptToCancel?.doctorId?.name}</span> on{' '}
              <span className="font-bold">{selectedApptToCancel?.date}</span> at{' '}
              <span className="font-bold">{selectedApptToCancel?.startTime}</span>?
              Your time slot will immediately be released for other patients.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={cancelLoading}
              onClick={handleCancelConfirm}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientDashboard;
