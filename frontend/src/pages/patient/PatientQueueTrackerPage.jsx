import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { queueService } from '../../services/queueService';
import { appointmentService } from '../../services/appointmentService';
import {
  Clock,
  Users,
  Activity,
  Calendar,
  Building2,
  Stethoscope,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const PatientQueueTrackerPage = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [selectedApptId, setSelectedApptId] = useState(appointmentId || '');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments();
      if (res.success) {
        // Filter for active appointments (BOOKED / CONFIRMED)
        const active = res.data.filter((a) => ['BOOKED', 'CONFIRMED'].includes(a.status));
        setPatientAppointments(active);

        const currentId = selectedApptId || (active.length > 0 ? active[0]._id : null);
        if (currentId) {
          setSelectedApptId(currentId);
          fetchQueue(currentId);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setLoading(false);
    }
  };

  const fetchQueue = async (id) => {
    try {
      setLoading(true);
      const res = await queueService.getQueueStatus(id);
      if (res.success) {
        setQueueData(res.data);
      }
    } catch (err) {
      console.error('Failed to load queue status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSelectAppointment = (id) => {
    setSelectedApptId(id);
    fetchQueue(id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>LIVE DIGITAL CLINIC QUEUE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Real-Time Queue & Waiting Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Monitor your consultation token position, doctor consultation progress, and estimated wait time live.
          </p>
        </div>

        {selectedApptId && (
          <Button
            size="md"
            variant="secondary"
            onClick={() => fetchQueue(selectedApptId)}
            className="bg-white text-slate-900 hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4 text-teal-600" />
            <span>Refresh Queue Status</span>
          </Button>
        )}
      </div>

      {/* Appointment Picker Tabs if multiple */}
      {patientAppointments.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-2">
            Select Appointment:
          </span>
          {patientAppointments.map((appt) => (
            <button
              key={appt._id}
              onClick={() => handleSelectAppointment(appt._id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedApptId === appt._id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Dr. {appt.doctorId?.name} ({appt.date} • {appt.startTime})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" message="Connecting to live digital clinic queue..." />
      ) : !queueData ? (
        <EmptyState
          icon={Clock}
          title="No active consultation queue found"
          description="You do not have any upcoming appointments scheduled for queue tracking."
          actionLabel="Book Consultation"
          actionLink="/patient/book"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Token Visual Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {queueData.queueStatus}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold">
                Date: {queueData.date}
              </span>
            </div>

            {/* Token & Waiting Time Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-2 shadow-xl shadow-slate-900/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
                  Your Queue Token
                </span>
                <div className="text-5xl font-black text-white">#{queueData.queuePosition}</div>
                <p className="text-xs text-slate-300">
                  {queueData.peopleAhead === 0 ? 'You are next in line!' : `${queueData.peopleAhead} patients ahead of you`}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                  Estimated Waiting Time
                </span>
                <div className="text-5xl font-black text-teal-900">
                  ~{queueData.estimatedWaitMinutes} <span className="text-xl font-bold">min</span>
                </div>
                <p className="text-xs text-teal-800 font-medium">
                  {queueData.currentDoctorProgress}
                </p>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Queue Flow</span>
                <span>Token #{queueData.queuePosition}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, 100 - queueData.peopleAhead * 20))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Consultation Details Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Consultation Details
              </h3>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Attending Specialist
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {queueData.doctorName}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Hospital Facility
                  </span>
                  <p className="font-extrabold text-slate-900">{queueData.clinicName}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Scheduled Interval
                  </span>
                  <p className="font-bold text-slate-900">
                    {queueData.date} at {queueData.startTime}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/patient/appointments">
                  <Button size="sm" variant="outline" className="w-full justify-center">
                    Manage My Appointments
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientQueueTrackerPage;
