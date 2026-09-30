import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { queueService } from '../../services/queueService';
import {
  Clock,
  Users,
  Activity,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  RefreshCw,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const DoctorQueueManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [queueList, setQueueList] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await queueService.getDoctorTodayQueue();
      if (res.success) {
        setQueueList(res.data);
      }
    } catch (err) {
      console.error('Failed to load doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAdvanceStatus = async (appointmentId, nextStatus) => {
    try {
      setActionLoading(true);
      const res = await queueService.advanceQueue(appointmentId, nextStatus);
      if (res.success) {
        fetchQueue();
      }
    } catch (err) {
      console.error('Failed to update queue:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading today's clinical consultation queue..." />;
  }

  const waitingCount = queueList.filter((a) => a.queueStatus === 'WAITING').length;
  const inConsultationCount = queueList.filter((a) => a.queueStatus === 'IN_CONSULTATION').length;
  const completedCount = queueList.filter((a) => a.queueStatus === 'COMPLETED').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>TODAY'S CLINICAL CONSULTATION QUEUE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Appointment Priority Queue Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage live patient check-ins, advance consultation statuses, and initiate treatment recordings for today's roster.
          </p>
        </div>

        <Button
          size="md"
          variant="secondary"
          onClick={fetchQueue}
          className="bg-white text-slate-900 hover:bg-slate-100"
        >
          <RefreshCw className="w-4 h-4 text-teal-600" />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Waiting in Queue
          </span>
          <div className="text-3xl font-black text-amber-600">{waitingCount}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            In Consultation
          </span>
          <div className="text-3xl font-black text-teal-600">{inConsultationCount}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Completed Today
          </span>
          <div className="text-3xl font-black text-emerald-600">{completedCount}</div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Ordered Patient Flow for Today ({queueList.length} scheduled)
          </h3>
        </div>

        {queueList.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No appointments scheduled for today"
            description="You have no patient consultations scheduled on today's queue."
          />
        ) : (
          <div className="space-y-4">
            {queueList.map((appt, idx) => {
              const isCurrent = appt.queueStatus === 'IN_CONSULTATION';
              return (
                <div
                  key={appt._id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    {/* Token Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center shrink-0 shadow-xs ${
                        isCurrent
                          ? 'bg-teal-600 text-white'
                          : appt.queueStatus === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-black text-slate-900">
                          {appt.patientId?.name || 'Walk-in Patient'}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            isCurrent
                              ? 'bg-teal-200 text-teal-900 font-bold'
                              : appt.queueStatus === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {appt.queueStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        Time Slot: <strong>{appt.startTime} - {appt.endTime}</strong> • Phone: {appt.patientId?.phone || 'N/A'}
                      </p>
                      {appt.reason && (
                        <p className="text-[11px] text-slate-600">
                          Reason: <em>{appt.reason}</em>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                    {appt.queueStatus === 'WAITING' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAdvanceStatus(appt._id, 'IN_CONSULTATION')}
                        disabled={actionLoading}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        <span>Call In Patient</span>
                      </Button>
                    )}

                    {appt.queueStatus === 'IN_CONSULTATION' && (
                      <Link to="/doctor/patient-records">
                        <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
                          <Check className="w-3.5 h-3.5 mr-1" />
                          <span>Complete & Add Rx</span>
                        </Button>
                      </Link>
                    )}

                    {appt.queueStatus === 'COMPLETED' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    )}
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

export default DoctorQueueManagementPage;
