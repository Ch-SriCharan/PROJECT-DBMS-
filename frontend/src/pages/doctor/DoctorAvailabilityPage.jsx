import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { availabilityService } from '../../services/availabilityService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import {
  Clock,
  Calendar,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Check,
  X,
} from 'lucide-react';

const DoctorAvailabilityPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchAvailabilities = async () => {
    setLoading(true);
    try {
      const res = await availabilityService.getDoctorAvailability(user._id);
      if (res.success) {
        setAvailabilities(res.data);
      }
    } catch (err) {
      console.error('Failed to load doctor availabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAvailabilities();
    }
  }, [user]);

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    setError('');

    if (startTime >= endTime) {
      setError('Start time must be strictly earlier than end time.');
      return;
    }

    setGenerating(true);
    try {
      const res = await availabilityService.createOrUpdateAvailability({
        doctorId: user._id,
        date,
        startTime,
        endTime,
        slotDuration: Number(slotDuration),
      });

      if (res.success) {
        showToast(`Schedule and slots generated for ${date}!`);
        fetchAvailabilities();
      }
    } catch (err) {
      setError(err.message || 'Failed to generate availability.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSchedule = async (id, scheduleDate) => {
    if (!window.confirm(`Are you sure you want to delete the schedule for ${scheduleDate}?`))
      return;
    try {
      const res = await availabilityService.deleteAvailability(id);
      if (res.success) {
        showToast('Schedule deleted successfully.');
        fetchAvailabilities();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete schedule', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Schedule Generator Header & Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Schedule Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Availability & Slot Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define daily working hours and consultation duration. The system automatically creates bookable time blocks.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleGenerateSlots}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end"
        >
          <Input
            label="Date"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label="Start Time"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <Input
            label="End Time"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Duration
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium transition-all"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes (Standard)</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
            </select>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={generating}
              loading={generating}
              className="w-full py-2.5"
            >
              <Zap className="w-4 h-4" />
              <span>Generate Slots</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Published Schedules Block Display */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Published Doctor Schedules ({availabilities.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active working hours and patient booking intervals
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-medium text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>Available</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Booked / Locked</span>
            </span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching availability schedules..." />
        ) : availabilities.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No availability schedules published"
            description="Use the generator above to publish your consulting hours for patients."
          />
        ) : (
          <div className="space-y-6">
            {availabilities.map((schedule) => {
              const availableCount = schedule.slots.filter((s) => s.isAvailable).length;
              const totalCount = schedule.slots.length;

              return (
                <div
                  key={schedule._id}
                  className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-slate-50/40 space-y-4 shadow-2xs hover:bg-white hover:border-teal-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/60 gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 font-extrabold flex items-center justify-center text-sm shrink-0 border border-teal-200/80">
                        {new Date(schedule.date + 'T00:00:00').toLocaleDateString([], {
                          weekday: 'short',
                        })}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {schedule.date}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Hours: {schedule.startTime} - {schedule.endTime} ({schedule.slotDuration} min intervals)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {availableCount} of {totalCount} open
                      </span>
                      <button
                        onClick={() => handleDeleteSchedule(schedule._id, schedule.date)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition focus:outline-none"
                        title="Delete Day Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Time-Slot Blocks */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {schedule.slots.map((slot, sIdx) => (
                      <div
                        key={sIdx}
                        className={`py-2 px-2.5 rounded-xl text-center text-xs font-bold border transition-all flex items-center justify-center space-x-1 ${
                          slot.isAvailable
                            ? 'bg-white text-teal-800 border-teal-200 shadow-2xs hover:border-teal-400'
                            : 'bg-slate-200/80 text-slate-400 border-slate-200 line-through'
                        }`}
                      >
                        <Clock className="w-3 h-3 opacity-60" />
                        <span>{slot.startTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;
