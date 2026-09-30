import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { clinicService } from '../../services/clinicService';
import { waitlistService } from '../../services/waitlistService';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Stethoscope,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const SmartSlotFinderPage = () => {
  const [filters, setFilters] = useState({
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: 'ANY', // 'ANY' | 'MORNING' | 'AFTERNOON' | 'EVENING'
    specialty: '',
    location: '',
    clinicId: '',
  });

  const [loading, setLoading] = useState(false);
  const [matchedResults, setMatchedResults] = useState([]);
  const [clinics, setClinics] = useState([]);

  // Waitlist Modal state
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistReason, setWaitlistReason] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await clinicService.getClinics();
        if (res.success) setClinics(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClinics();
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await doctorService.matchSlots({
        preferredDate: filters.preferredDate,
        preferredTime: filters.preferredTime,
        specialty: filters.specialty || undefined,
        location: filters.location || undefined,
        clinicId: filters.clinicId || undefined,
      });

      if (res.success) {
        setMatchedResults(res.data);
      }
    } catch (err) {
      console.error('Failed to find matching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    try {
      setWaitlistLoading(true);
      const res = await waitlistService.joinWaitlist({
        specialty: filters.specialty || 'General Physician',
        preferredDate: filters.preferredDate,
        preferredTime: filters.preferredTime,
        reason: waitlistReason || 'Preferred slot matching',
      });

      if (res.success) {
        setWaitlistSuccess(true);
        setTimeout(() => {
          setIsWaitlistModalOpen(false);
          setWaitlistSuccess(false);
          setWaitlistReason('');
        }, 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to join waitlist');
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-extrabold tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>SMART APPOINTMENT SCHEDULER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Smart Availability Matcher
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Enter your preferred consultation date and preferred time window (Morning, Afternoon, Evening) to discover real-time matching slots across our clinical hospital network.
        </p>
      </div>

      {/* Filter Form Toolbar */}
      <form
        onSubmit={handleSearch}
        className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Preferred Date</label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="date"
                value={filters.preferredDate}
                onChange={(e) => setFilters({ ...filters, preferredDate: e.target.value })}
                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Specialty Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Medical Specialty</label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <Stethoscope className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select
                value={filters.specialty}
                onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer font-medium"
              >
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dentistry">Dentistry</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="ENT Specialist">ENT Specialist</option>
                <option value="Urology">Urology</option>
                <option value="Gynecology">Gynecology</option>
                <option value="General Physician">General Physician</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Psychiatry">Psychiatry</option>
              </select>
            </div>
          </div>

          {/* City / Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">City / Location</label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer font-medium"
              >
                <option value="">All Cities</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>
          </div>

          {/* Hospital Facility */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Hospital Facility</label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <Building2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select
                value={filters.clinicId}
                onChange={(e) => setFilters({ ...filters, clinicId: e.target.value })}
                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer font-medium truncate"
              >
                <option value="">All Hospitals</option>
                {clinics.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.location})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Time of Day Windows Selector */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Preferred Time of Day</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Any Time', value: 'ANY', icon: Clock },
                { label: 'Morning (9 AM - 12 PM)', value: 'MORNING', icon: Sun },
                { label: 'Afternoon (12 PM - 4 PM)', value: 'AFTERNOON', icon: Sunset },
                { label: 'Evening (4 PM+)', value: 'EVENING', icon: Moon },
              ].map((timeOpt) => {
                const Icon = timeOpt.icon;
                const isSelected = filters.preferredTime === timeOpt.value;
                return (
                  <button
                    key={timeOpt.value}
                    type="button"
                    onClick={() => setFilters({ ...filters, preferredTime: timeOpt.value })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{timeOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" size="md" variant="primary" className="shrink-0">
            <Search className="w-4 h-4" />
            <span>Search Matching Slots</span>
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {loading ? (
        <LoadingSpinner size="lg" message="Scanning doctor calendars for matching slots..." />
      ) : matchedResults.length === 0 ? (
        /* Zero matches: Offer Waitlist Button */
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-extrabold text-slate-900">
              No matching open slots found for this time window
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All doctors in this specialty/location are currently booked for your selected time. You can join our automated waitlist to be instantly notified when a slot opens!
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            onClick={() => setIsWaitlistModalOpen(true)}
            className="shadow-md shadow-teal-600/20"
          >
            <Bell className="w-4 h-4" />
            <span>Join Appointment Waitlist</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              Found {matchedResults.length} healthcare providers with open slots
            </span>
            <button
              onClick={() => setIsWaitlistModalOpen(true)}
              className="text-teal-700 font-bold hover:underline flex items-center space-x-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Join Waitlist for alternate slots</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchedResults.map(({ doctor, date, slots }) => (
              <div
                key={doctor._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                        {doctor.name.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">{doctor.name}</h3>
                        <p className="text-xs font-bold text-teal-700">{doctor.specialty}</p>
                        <p className="text-[11px] text-slate-400">
                          {doctor.clinicId?.name} ({doctor.clinicId?.location})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Fee</span>
                      <span className="text-sm font-black text-slate-900">₹{doctor.consultationFee || 500}</span>
                    </div>
                  </div>

                  {/* Matching Open Slots Pill Matrix */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Available Time Slots on {date}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {slots.slice(0, 6).map((slot) => (
                        <Link
                          key={slot._id || slot.startTime}
                          to={`/patient/book?doctorId=${doctor._id}&date=${date}&startTime=${slot.startTime}&endTime=${slot.endTime}`}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-900 border border-teal-200 transition"
                        >
                          {slot.startTime} - {slot.endTime}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/doctors/${doctor._id}`}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    View Doctor Profile
                  </Link>

                  <Link to={`/patient/book?doctorId=${doctor._id}`}>
                    <Button size="sm" variant="primary">
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JOIN WAITLIST MODAL */}
      <Modal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        title="Join Automated Slot Waitlist"
      >
        {waitlistSuccess ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900">You are on the Waitlist!</h3>
            <p className="text-xs text-slate-500">
              We will notify you immediately in your notification bell whenever a cancellation or new schedule becomes available for this specialty and date.
            </p>
          </div>
        ) : (
          <form onSubmit={handleJoinWaitlist} className="space-y-4 text-xs text-slate-700">
            <p className="text-slate-500 leading-relaxed">
              When all slots for your preferred date or specialty are booked, our automated system monitors schedule cancellations 24/7 and alerts waitlisted patients.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p><strong>Specialty:</strong> {filters.specialty || 'General Physician'}</p>
              <p><strong>Date:</strong> {filters.preferredDate}</p>
              <p><strong>Time Window:</strong> {filters.preferredTime}</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Reason / Clinical Notes (Optional)</label>
              <textarea
                value={waitlistReason}
                onChange={(e) => setWaitlistReason(e.target.value)}
                placeholder="Describe why you need this consultation slot..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setIsWaitlistModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" loading={waitlistLoading}>
                Confirm Waitlist Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SmartSlotFinderPage;
