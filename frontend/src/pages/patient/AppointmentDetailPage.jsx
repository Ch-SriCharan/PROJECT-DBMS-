import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { availabilityService } from '../../services/availabilityService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  Building2,
  Phone,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  XCircle,
  ArrowLeft,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';

const AppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reschedule state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [availabilities, setAvailabilities] = useState([]);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Cancel state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadAppointment = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointmentById(id);
      if (res.success) {
        setAppointment(res.data);
      }
    } catch (err) {
      console.error('Failed to load appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const openRescheduleModal = async () => {
    setRescheduleError('');
    setRescheduleModalOpen(true);
    try {
      const docId = appointment.doctorId?._id || appointment.doctorId;
      const res = await availabilityService.getDoctorAvailability(docId);
      if (res.success && res.data.length > 0) {
        setAvailabilities(res.data);
        setRescheduleDate(res.data[0].date);
      }
    } catch (err) {
      setRescheduleError('Could not load doctor schedules.');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleSlot || !rescheduleDate) {
      setRescheduleError('Please choose a date and time slot.');
      return;
    }

    setRescheduleLoading(true);
    setRescheduleError('');

    try {
      const res = await appointmentService.rescheduleAppointment(id, {
        newDate: rescheduleDate,
        newStartTime: rescheduleSlot.startTime,
        newEndTime: rescheduleSlot.endTime,
      });

      if (res.success) {
        showToast('Appointment successfully rescheduled!');
        setRescheduleModalOpen(false);
        setRescheduleSlot(null);
        loadAppointment();
      }
    } catch (err) {
      setRescheduleError(err.message || 'Reschedule failed.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCancelSubmit = async () => {
    setCancelLoading(true);
    try {
      const res = await appointmentService.cancelAppointment(id);
      if (res.success) {
        showToast('Appointment cancelled successfully.');
        setCancelModalOpen(false);
        loadAppointment();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading appointment details..." />;
  }

  if (!appointment) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800">Appointment Not Found</h3>
        <Link to="/patient/appointments">
          <Button size="sm" variant="primary">
            Back to My Appointments
          </Button>
        </Link>
      </div>
    );
  }

  const activeRescheduleSchedule = availabilities.find((a) => a.date === rescheduleDate);
  const activeRescheduleSlots = activeRescheduleSchedule ? activeRescheduleSchedule.slots : [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link to="/patient/appointments" className="hover:text-teal-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>My Appointments</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-bold truncate">Booking #{appointment._id}</span>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Appointment Summary
              </h1>
              <Badge status={appointment.status} />
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Reference ID: {appointment._id}
            </p>
          </div>

          {/* Action buttons if appointment is active */}
          {['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(appointment.status) && (
            <div className="flex items-center space-x-2.5 self-start sm:self-auto">
              <Button size="sm" variant="soft" onClick={openRescheduleModal}>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reschedule</span>
              </Button>
              <Button size="sm" variant="dangerSoft" onClick={() => setCancelModalOpen(true)}>
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Schedule Info */}
          <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
              Schedule & Time
            </span>
            <div className="space-y-1.5 text-xs text-slate-800">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span className="font-extrabold text-sm text-slate-900">{appointment.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span className="font-bold">{appointment.startTime} - {appointment.endTime}</span>
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Specialist
            </span>
            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-slate-900 text-sm">
                {appointment.doctorId?.name}
              </div>
              <div className="text-teal-700 font-bold">{appointment.doctorId?.specialty}</div>
              <div className="text-slate-500 font-black mt-1">
                Fee: ₹{appointment.doctorId?.consultationFee || 500}
              </div>
            </div>
          </div>

          {/* Clinic Info */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Hospital / Clinic
            </span>
            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-slate-900 text-sm">
                {appointment.clinicId?.name}
              </div>
              <div className="text-slate-500">{appointment.clinicId?.address}</div>
              <div className="text-slate-500">Phone: {appointment.clinicId?.phone}</div>
            </div>
          </div>
        </div>

        {/* Consultation Reason & Doctor Notes */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Consultation
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
              {appointment.reason || 'General Consultation'}
            </p>
          </div>

          {appointment.notes && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Notes / Prescription
              </h3>
              <p className="text-xs sm:text-sm text-slate-800 bg-teal-50/60 p-3.5 rounded-2xl border border-teal-100 leading-relaxed">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-5">
          {rescheduleError && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rescheduleError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select New Date
            </label>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {availabilities.map((avail) => (
                <button
                  key={avail._id}
                  type="button"
                  onClick={() => {
                    setRescheduleDate(avail.date);
                    setRescheduleSlot(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    rescheduleDate === avail.date
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {avail.date}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select New Open Slot ({rescheduleDate})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {activeRescheduleSlots.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!slot.isAvailable}
                  onClick={() => setRescheduleSlot(slot)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                    !slot.isAvailable
                      ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                      : rescheduleSlot?.startTime === slot.startTime
                      ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-300'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!rescheduleSlot || rescheduleLoading}
              loading={rescheduleLoading}
            >
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to cancel this appointment on{' '}
              <span className="font-bold">{appointment.date}</span> at{' '}
              <span className="font-bold">{appointment.startTime}</span>?
              Your reserved slot will immediately be released for other patients.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={cancelLoading}
              onClick={handleCancelSubmit}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentDetailPage;
