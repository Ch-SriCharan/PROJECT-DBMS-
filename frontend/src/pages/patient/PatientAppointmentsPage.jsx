import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  Search,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';

const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const { showToast } = useNotifications();

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchAppointments = async () => {
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
    fetchAppointments();
  }, []);

  const handleCancel = async () => {
    if (!selectedAppt) return;
    setCancelLoading(true);
    try {
      const res = await appointmentService.cancelAppointment(selectedAppt._id);
      if (res.success) {
        showToast('Appointment cancelled and slot released.');
        setCancelModalOpen(false);
        setSelectedAppt(null);
        fetchAppointments();
      }
    } catch (err) {
      showToast(err.message || 'Error cancelling appointment', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((appt) => {
    let matchesTab = true;
    if (statusTab === 'UPCOMING') {
      matchesTab =
        ['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(appt.status) && appt.date >= todayStr;
    } else if (statusTab === 'COMPLETED') {
      matchesTab = appt.status === 'COMPLETED' || (appt.date < todayStr && appt.status !== 'CANCELLED');
    } else if (statusTab === 'CANCELLED') {
      matchesTab = appt.status === 'CANCELLED';
    }

    const matchesSearch =
      !search ||
      appt.doctorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      appt.doctorId?.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      appt.clinicId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      appt.reason?.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Care Timeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            My Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, reschedule, or cancel your scheduled medical consultations
          </p>
        </div>

        <Link to="/patient/book" className="self-start sm:self-auto">
          <Button size="sm" variant="primary">
            <PlusCircle className="w-4 h-4" />
            <span>Book Appointment</span>
          </Button>
        </Link>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-auto shadow-inner">
          {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                statusTab === tab
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor, clinic, reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner message="Loading your appointments..." />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={
            search
              ? 'No appointments matched your search query.'
              : `There are no ${statusTab.toLowerCase()} appointments in your record.`
          }
          actionLabel="Book a Doctor"
          actionLink="/patient/book"
        />
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt._id}
              className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 hover:border-teal-500/40 hover:shadow-md transition-all bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {appt.doctorId?.name?.replace('Dr. ', '').charAt(0) || 'D'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {appt.doctorId?.name || 'Consultant'}
                    </h4>
                    <Badge status={appt.status} size="sm" />
                  </div>
                  <p className="text-xs text-teal-700 font-bold">
                    {appt.doctorId?.specialty} • {appt.clinicId?.name} ({appt.clinicId?.location})
                  </p>
                  <p className="text-xs text-slate-600 pt-0.5">
                    <span className="font-semibold text-slate-700">Reason:</span> {appt.reason}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                    <span className="flex items-center space-x-1.5 font-bold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{appt.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{appt.startTime} - {appt.endTime}</span>
                    </span>
                    <span className="font-black text-slate-900">
                      ₹{appt.doctorId?.consultationFee || 500}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2.5 self-end md:self-center">
                <Link to={`/patient/appointments/${appt._id}`}>
                  <Button size="sm" variant="outline">
                    <span>Details & Reschedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                {['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(appt.status) && (
                  <Button
                    size="sm"
                    variant="dangerSoft"
                    onClick={() => {
                      setSelectedAppt(appt);
                      setCancelModalOpen(true);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
              <span className="font-bold">{selectedAppt?.doctorId?.name}</span> on{' '}
              <span className="font-bold">{selectedAppt?.date}</span> at{' '}
              <span className="font-bold">{selectedAppt?.startTime}</span>?
              Your time slot will immediately be released for other patients.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep
            </Button>
            <Button variant="danger" size="sm" loading={cancelLoading} onClick={handleCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientAppointmentsPage;
