import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { availabilityService } from '../../services/availabilityService';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
  Stethoscope,
  MapPin,
  Calendar,
  Clock,
  Award,
  Building2,
  Phone,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  CalendarCheck,
} from 'lucide-react';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();

  const [doctor, setDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('General Consultation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const loadDoctorData = async () => {
      setLoading(true);
      try {
        const [docRes, availRes] = await Promise.all([
          doctorService.getDoctorById(id),
          availabilityService.getDoctorAvailability(id),
        ]);

        if (docRes.success) {
          setDoctor(docRes.data);
        }

        if (availRes.success && availRes.data.length > 0) {
          setAvailabilities(availRes.data);
          setSelectedDate(availRes.data[0].date);
        }
      } catch (err) {
        console.error('Failed to load doctor profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctorData();
  }, [id]);

  const activeDaySchedule = availabilities.find((a) => a.date === selectedDate);
  const availableSlots = activeDaySchedule ? activeDaySchedule.slots : [];

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!isAuthenticated) {
      showToast('Please sign in as a patient to book an appointment.', 'warning');
      navigate('/login', { state: { from: { pathname: `/doctors/${id}` } } });
      return;
    }

    if (user.role !== 'PATIENT' && user.role !== 'ADMIN') {
      setBookingError('Only patients can book doctor consultations.');
      return;
    }

    if (!selectedSlot) {
      setBookingError('Please select an available time slot from the schedule.');
      return;
    }

    setBookingLoading(true);

    try {
      const payload = {
        doctorId: doctor._id,
        clinicId: doctor.clinicId?._id || doctor.clinicId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
        notes,
      };

      const res = await appointmentService.bookAppointment(payload);
      if (res.success) {
        setBookingSuccess(res.data);
        showToast('Appointment successfully confirmed!');
        // Refresh availability
        const updatedAvail = await availabilityService.getDoctorAvailability(id, selectedDate);
        if (updatedAvail.success) {
          setAvailabilities((prev) =>
            prev.map((a) => (a.date === selectedDate ? updatedAvail.data[0] || a : a))
          );
        }
        setSelectedSlot(null);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading doctor credentials & schedule..." />;
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-800">Doctor not found</h3>
        <Link to="/doctors" className="mt-4 inline-block text-xs font-bold text-teal-600">
          Back to Doctors Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link to="/doctors" className="hover:text-teal-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Doctors</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">{doctor.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Profile Bio & Facility Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Credentials Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-black text-3xl flex items-center justify-center shrink-0 shadow-lg shadow-teal-600/20">
                {doctor.name.replace('Dr. ', '').charAt(0)}
              </div>
              <div className="space-y-1 min-w-0">
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                  {doctor.specialty}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {doctor.name}
                </h1>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{doctor.experience} Years of Clinical Practice</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Clinical Overview & Bio
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {doctor.description ||
                  'Certified consultant medical specialist dedicated to evidence-based healthcare delivery, accurate diagnosis, and personalized patient management plans.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Consultation Fee
                </span>
                <span className="text-xl font-black text-slate-900">
                  ₹{doctor.consultationFee || 500}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Accreditation
                </span>
                <span className="text-xs font-bold text-teal-700 flex items-center space-x-1 mt-1">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Verified Medical License</span>
                </span>
              </div>
            </div>
          </div>

          {/* Affiliated Practice Location Card */}
          {doctor.clinicId && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-teal-800">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Practice Facility
                </h3>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">{doctor.clinicId.name}</h4>
                <div className="flex items-start space-x-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{doctor.clinicId.address}, {doctor.clinicId.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{doctor.clinicId.openingHours || '09:00 AM - 08:00 PM'}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{doctor.clinicId.phone}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Availability & Instant Booking Wizard */}
        <div className="lg:col-span-7 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600">
                Live Booking Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Select Consultation Slot
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time schedule with instant conflict prevention
              </p>
            </div>

            {/* Booking Success Banner */}
            {bookingSuccess && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-fadeIn">
                <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Appointment Confirmed!</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your appointment for{' '}
                  <span className="font-bold">{bookingSuccess.date}</span> at{' '}
                  <span className="font-bold">{bookingSuccess.startTime}</span> has been locked and confirmed.
                </p>
                <div className="pt-1 flex items-center space-x-3">
                  <Link to={`/patient/appointments/${bookingSuccess._id}`}>
                    <Button size="sm" variant="primary" className="bg-emerald-700 hover:bg-emerald-800">
                      View Booking Details
                    </Button>
                  </Link>
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="text-xs font-semibold text-emerald-800 underline"
                  >
                    Book another slot
                  </button>
                </div>
              </div>
            )}

            {/* Booking Error Banner */}
            {bookingError && (
              <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Date Selector Carousel */}
            {availabilities.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  No open schedule slots published for this doctor yet.
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Please check back shortly or explore another provider in the same discipline.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Available Dates
                  </label>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {availabilities.map((avail) => (
                      <button
                        key={avail._id}
                        type="button"
                        onClick={() => {
                          setSelectedDate(avail.date);
                          setSelectedSlot(null);
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center min-w-[95px] border ${
                          selectedDate === avail.date
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] font-medium opacity-80">
                          {new Date(avail.date + 'T00:00:00').toLocaleDateString([], {
                            weekday: 'short',
                          })}
                        </span>
                        <span>
                          {new Date(avail.date + 'T00:00:00').toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Available Time Slots ({selectedDate})
                    </label>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/70">
                      {availableSlots.filter((s) => s.isAvailable).length} open
                    </span>
                  </div>

                  {availableSlots.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4">No slots configured for this date.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                            !slot.isAvailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : selectedSlot?.startTime === slot.startTime
                              ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-300'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:text-teal-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot.startTime}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consultation Details & Form */}
                <form onSubmit={handleBook} className="pt-4 border-t border-slate-100 space-y-4">
                  <Input
                    label="Reason for Consultation"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Chest pain, Routine wellness checkup, Skin rash..."
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Patient Notes / Medical History (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any relevant past diagnoses, ongoing medication, or queries..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!selectedSlot || bookingLoading}
                    loading={bookingLoading}
                    className="w-full"
                  >
                    {selectedSlot ? (
                      <span>
                        Confirm Booking for {selectedDate} at {selectedSlot.startTime}
                      </span>
                    ) : (
                      <span>Select an Open Time Slot Above</span>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
