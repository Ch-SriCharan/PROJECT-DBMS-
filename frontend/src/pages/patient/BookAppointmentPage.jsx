import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { availabilityService } from '../../services/availabilityService';
import { appointmentService } from '../../services/appointmentService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  Stethoscope,
  Calendar,
  Clock,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  ShieldCheck,
  Search,
  Check,
} from 'lucide-react';

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  // Step management (1: Select Doctor, 2: Select Slot, 3: Confirm Details)
  const [step, setStep] = useState(1);

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('General Consultation');
  const [notes, setNotes] = useState('');

  // Filters for Step 1
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Status
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      try {
        const res = await doctorService.getDoctors();
        if (res.success) {
          setDoctors(res.data);
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  const handleSelectDoctor = async (doc) => {
    setSelectedDoctor(doc);
    setError('');
    setLoading(true);
    try {
      const res = await availabilityService.getDoctorAvailability(doc._id);
      if (res.success) {
        setAvailabilities(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedDate(res.data[0].date);
        }
      }
      setStep(2);
    } catch (err) {
      setError('Could not fetch doctor schedule.');
    } finally {
      setLoading(false);
    }
  };

  const activeDaySchedule = availabilities.find((a) => a.date === selectedDate);
  const availableSlots = activeDaySchedule ? activeDaySchedule.slots : [];

  const handleSlotPick = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError('Missing booking details. Please verify all steps.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        doctorId: selectedDoctor._id,
        clinicId: selectedDoctor.clinicId?._id || selectedDoctor.clinicId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
        notes,
      };

      const res = await appointmentService.bookAppointment(payload);
      if (res.success) {
        showToast('Appointment successfully confirmed!');
        navigate(`/patient/appointments/${res.data._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec =
      !specialtyFilter || doc.specialty?.toLowerCase() === specialtyFilter.toLowerCase();
    const matchesSearch =
      !searchFilter ||
      doc.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header & Stepper Progress */}
      <div className="border-b border-slate-100 pb-6 space-y-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Booking Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Book a Medical Consultation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose your specialist, select an open interval, and confirm your visit
          </p>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs font-bold">
          <div
            onClick={() => setStep(1)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl cursor-pointer transition-all ${
              step === 1
                ? 'bg-teal-600 text-white shadow-xs'
                : step > 1
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-400 bg-slate-50'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                step > 1 ? 'bg-teal-600 text-white' : 'bg-white/20'
              }`}
            >
              {step > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            <span>01 Doctor</span>
          </div>

          <div className="h-0.5 w-6 bg-slate-200" />

          <div
            onClick={() => selectedDoctor && setStep(2)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all ${
              selectedDoctor ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
            } ${
              step === 2
                ? 'bg-teal-600 text-white shadow-xs'
                : step > 2
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-400 bg-slate-50'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                step > 2 ? 'bg-teal-600 text-white' : 'bg-white/20'
              }`}
            >
              {step > 2 ? <Check className="w-3 h-3" /> : '2'}
            </span>
            <span>02 Date & Time</span>
          </div>

          <div className="h-0.5 w-6 bg-slate-200" />

          <div
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all ${
              step === 3
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 bg-slate-50 opacity-60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
              3
            </span>
            <span>03 Confirm</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: SELECT SPECIALIST */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search specialist by name or discipline..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching doctors..." />
          ) : filteredDoctors.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="No specialists found"
              description="Try clearing your search query or choosing another specialty."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => handleSelectDoctor(doc)}
                  className="p-5 rounded-3xl border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between bg-slate-50/40 hover:bg-white group"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200/80">
                        {doc.specialty}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{doc.name}</h4>
                      <p className="text-xs text-slate-500 truncate">
                        {doc.clinicId?.name} ({doc.clinicId?.location})
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{doc.experience} Yrs Exp.</span>
                        <span>•</span>
                        <span className="font-black text-slate-900">
                          ₹{doc.consultationFee || 500}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                    <span>Select Time Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SELECT DATE & SLOT */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center">
                {selectedDoctor.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{selectedDoctor.name}</h4>
                <p className="text-xs text-teal-700 font-semibold">
                  {selectedDoctor.specialty} • {selectedDoctor.clinicId?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 underline"
            >
              Change Doctor
            </button>
          </div>

          {availabilities.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-700">
                No open schedule slots published for Dr. {selectedDoctor.name}.
              </p>
              <Button size="sm" variant="primary" onClick={() => setStep(1)}>
                Choose Another Doctor
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Consultation Date
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
                      <span className="text-[10px] opacity-80">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Available Slots for {selectedDate}
                  </label>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {availableSlots.filter((s) => s.isAvailable).length} slots open
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => handleSlotPick(slot)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                        !slot.isAvailable
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot.startTime}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Doctors</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: CONFIRMATION & DETAILS */}
      {step === 3 && selectedDoctor && selectedSlot && (
        <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-teal-50/70 border border-teal-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Appointment Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Doctor</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedDoctor.name}
                </span>
                <span className="text-teal-700 font-semibold block">
                  {selectedDoctor.specialty}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Hospital / Facility</span>
                <span className="font-extrabold text-slate-900">
                  {selectedDoctor.clinicId?.name}
                </span>
                <span className="text-slate-500 block">{selectedDoctor.clinicId?.address}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Consultation Date</span>
                <span className="font-extrabold text-slate-900">{selectedDate}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Time Slot</span>
                <span className="font-extrabold text-teal-800 text-sm">
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Consultation Fee</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{selectedDoctor.consultationFee || 500}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Reason for Consultation"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up consultation, High blood pressure, General checkup..."
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Additional Notes / Past History (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="List any ongoing medications or previous diagnosis..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Slots</span>
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              loading={submitting}
            >
              <span>Confirm & Lock Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookAppointmentPage;
