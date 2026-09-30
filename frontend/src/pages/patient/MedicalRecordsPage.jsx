import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { medicalRecordService } from '../../services/medicalRecordService';
import { waitlistService } from '../../services/waitlistService';
import {
  FileText,
  Activity,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Pill,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Search,
  Building2,
  HeartPulse,
  Filter,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  X,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const MedicalRecordsPage = () => {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'diagnoses' | 'medications' | 'followups' | 'waitlist'
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [medicationData, setMedicationData] = useState({ activeMedications: [], pastMedications: [] });
  const [diagnoses, setDiagnoses] = useState([]);
  const [waitlist, setWaitlist] = useState([]);

  // Detail Modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Search/filter within records
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, timeRes, medRes, diagRes, waitRes] = await Promise.all([
        medicalRecordService.getMyMedicalRecords(),
        medicalRecordService.getPatientTimeline(),
        medicalRecordService.getMyMedications(),
        medicalRecordService.getMyDiagnoses(),
        waitlistService.getMyWaitlist(),
      ]);

      if (recRes.success) setRecords(recRes.data);
      if (timeRes.success) setTimeline(timeRes.data);
      if (medRes.success) setMedicationData(medRes.data);
      if (diagRes.success) setDiagnoses(diagRes.data);
      if (waitRes.success) setWaitlist(waitRes.data);
    } catch (err) {
      console.error('Failed to load medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelWaitlist = async (id) => {
    try {
      const res = await waitlistService.cancelWaitlist(id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to cancel waitlist entry:', err);
    }
  };

  const openRecordDetail = (record) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your comprehensive medical records..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CONFIDENTIAL HEALTHCARE RECORD</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            My Medical & Treatment History
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Review certified doctor diagnoses, clinical consultation notes, prescribed medications, follow-up dates, and active waitlists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/patient/book">
            <Button size="md" variant="primary" className="shadow-md shadow-teal-600/30">
              <PlusCircle className="w-4 h-4" />
              <span>Book New Consultation</span>
            </Button>
          </Link>
          <Link to="/symptoms">
            <Button size="md" variant="secondary" className="bg-slate-800 text-teal-300 hover:bg-slate-700 border border-slate-700">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Check Symptoms</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Diagnoses
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{diagnoses.length}</div>
          <p className="text-[11px] text-slate-400">Doctor-certified conditions</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Meds
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700">
            {medicationData.activeMedications?.length || 0}
          </div>
          <p className="text-[11px] text-slate-400">Currently active prescriptions</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clinical Records
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{records.length}</div>
          <p className="text-[11px] text-slate-400">Consultation receipts & notes</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Waitlists
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {waitlist.filter((w) => w.status === 'WAITING').length}
          </div>
          <p className="text-[11px] text-slate-400">Active slot notifications</p>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'timeline'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Patient Medical Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnoses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'diagnoses'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor Diagnoses & Treatment</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800 font-black">
            {diagnoses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'medications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Medications & Prescriptions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-black">
            {medicationData.activeMedications.length + medicationData.pastMedications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('waitlist')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'waitlist'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Waitlist Requests</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-black">
            {waitlist.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CHRONOLOGICAL MEDICAL TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Chronological Care Timeline
              </h2>
              <p className="text-xs text-slate-500">
                Complete sequential history of clinical appointments, doctor diagnoses, medications, and follow-ups
              </p>
            </div>
            <div className="text-xs text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-xl border border-teal-200/80 self-start sm:self-auto">
              {timeline.length} Recorded Milestones
            </div>
          </div>

          {timeline.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No timeline events recorded"
              description="Your clinical consultation history will appear here once a doctor completes an appointment."
            />
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-teal-600 before:via-slate-200 before:to-slate-100">
              {timeline.map((event, index) => {
                const isRecord = event.type === 'DOCTOR_TREATMENT_RECORD';
                const isFollowUp = event.type === 'FOLLOW_UP_MILESTONE';

                return (
                  <div key={event.id || index} className="relative space-y-3 group">
                    {/* Node Dot Icon */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-xs ${
                        isRecord
                          ? 'bg-teal-600'
                          : isFollowUp
                          ? 'bg-purple-600'
                          : 'bg-slate-700'
                      }`}
                    >
                      {isRecord ? (
                        <Stethoscope className="w-3 h-3" />
                      ) : isFollowUp ? (
                        <Calendar className="w-3 h-3" />
                      ) : (
                        <Activity className="w-3 h-3" />
                      )}
                    </div>

                    {/* Timeline Event Card */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-500/50 hover:shadow-md transition-all space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-slate-900">
                            {new Date(event.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-bold text-teal-700">
                            {event.doctor?.name || 'Assigned Specialist'} ({event.doctor?.specialty})
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider self-start sm:self-auto ${
                            isRecord
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : isFollowUp
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isRecord ? 'Doctor Treatment Record' : isFollowUp ? 'Follow-up Milestone' : event.status}
                        </span>
                      </div>

                      {/* Content Body */}
                      {isRecord && (
                        <div className="space-y-3">
                          {/* Doctor Diagnosis */}
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                              <HeartPulse className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Doctor Certified Diagnosis
                              </span>
                              <h4 className="text-sm font-extrabold text-slate-900">
                                {event.diagnosis}
                              </h4>
                              {event.patientReportedCondition && (
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Patient-reported complaint: <em>"{event.patientReportedCondition}"</em>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Prescriptions preview */}
                          {event.medications?.length > 0 && (
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1">
                                <Pill className="w-3 h-3" />
                                <span>Prescribed Medications ({event.medications.length})</span>
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {event.medications.map((m, mIdx) => (
                                  <span
                                    key={mIdx}
                                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800 flex items-center space-x-1.5 shadow-2xs"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    <span><strong>{m.medicineName}</strong> ({m.dosage}) - {m.frequency}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action to open full modal */}
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              Facility: {event.clinic?.name || 'Apollo Health City'}
                            </span>
                            <button
                              onClick={() => openRecordDetail(event)}
                              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                            >
                              <span>View Full Clinical Record & Rx</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {isFollowUp && (
                        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1 text-xs">
                          <h4 className="font-extrabold text-purple-950">
                            Recommended Follow-up Review
                          </h4>
                          <p className="text-purple-900">
                            {event.followUpInstructions || 'Clinical checkup for ' + event.diagnosis}
                          </p>
                          <div className="pt-2">
                            <Link to="/patient/book">
                              <Button size="sm" variant="primary" className="py-1 px-3 text-xs">
                                Schedule Follow-up Appointment
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {!isRecord && !isFollowUp && (
                        <div className="text-xs text-slate-600 space-y-1">
                          <p>Reason: <strong>{event.reason || 'General Consultation'}</strong></p>
                          {event.notes && <p className="text-slate-500">Notes: {event.notes}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCTOR DIAGNOSES & TREATMENT JOURNEYS */}
      {activeTab === 'diagnoses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Condition → Doctor → Treatment Connections
              </h2>
              <p className="text-xs text-slate-500">
                Trace each medical condition from patient reporting to doctor certification and full treatment history
              </p>
            </div>
          </div>

          {diagnoses.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="No doctor diagnoses recorded yet"
              description="Certified diagnoses recorded by your consulting doctors will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {diagnoses.map((journey) => (
                <div
                  key={journey._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:border-teal-500/50 transition-all space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                          CERTIFIED DIAGNOSIS
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {journey.appointmentDate}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">
                        {journey.condition}
                      </h3>
                      {journey.patientReportedCondition && (
                        <p className="text-xs text-slate-500">
                          Initial Patient Complaint: <strong>{journey.patientReportedCondition}</strong>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => openRecordDetail(journey)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition shrink-0"
                    >
                      View Complete Record
                    </button>
                  </div>

                  {/* Connected Flow Visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Treating Provider
                      </span>
                      <p className="font-extrabold text-slate-900">{journey.doctorName}</p>
                      <p className="text-[11px] text-teal-700">{journey.doctorSpecialty}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Facility / Hospital
                      </span>
                      <p className="font-extrabold text-slate-900">{journey.clinicName}</p>
                      <p className="text-[11px] text-slate-500">{journey.clinicLocation}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Prescription Count
                      </span>
                      <p className="font-extrabold text-purple-800">
                        {journey.medications?.length || 0} Medicines Prescribed
                      </p>
                      <p className="text-[11px] text-slate-500">Doctor authorized</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Follow-Up Review
                      </span>
                      <p className="font-extrabold text-teal-800">
                        {journey.followUpDate || 'As needed'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {journey.followUpDate ? 'Scheduled milestone' : 'No follow-up set'}
                      </p>
                    </div>
                  </div>

                  {/* Clinical Notes snippet */}
                  {journey.clinicalNotes && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 text-xs text-slate-700 leading-relaxed">
                      <strong>Doctor Notes:</strong> {journey.clinicalNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEDICATIONS & PRESCRIPTIONS */}
      {activeTab === 'medications' && (
        <div className="space-y-8">
          {/* Active Medications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Currently Active Medications ({medicationData.activeMedications.length})
                </h3>
              </div>
            </div>

            {medicationData.activeMedications.length === 0 ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
                No active medications currently recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medicationData.activeMedications.map((med) => (
                  <div
                    key={med._id}
                    className="p-5 rounded-3xl bg-white border-2 border-teal-500/30 shadow-xs space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ACTIVE THERAPY
                        </span>
                        <h4 className="text-base font-black text-slate-900">
                          {med.medicineName} <span className="text-teal-700 text-sm">({med.dosage})</span>
                        </h4>
                        <p className="text-xs font-bold text-slate-600">
                          {med.frequency} • Duration: {med.duration}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <p className="text-slate-700">
                        <strong>Instructions:</strong> {med.instructions || 'Take as directed by doctor'}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Prescribed by: {med.prescribedBy} ({med.prescribingSpecialty}) on {med.datePrescribed}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / Completed Medications Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-base font-extrabold text-slate-700">
              Completed / Past Medication History ({medicationData.pastMedications.length})
            </h3>

            {medicationData.pastMedications.length === 0 ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
                No past medication history recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicationData.pastMedications.map((med) => (
                  <div
                    key={med._id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 opacity-90"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {med.medicineName} ({med.dosage})
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                        Completed
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {med.frequency} for {med.duration}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Prescribed by {med.prescribedBy} on {med.datePrescribed}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WAITLIST REQUESTS */}
      {activeTab === 'waitlist' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Active Appointment Waitlists
              </h2>
              <p className="text-xs text-slate-500">
                You will be automatically notified when a doctor adds slots or a slot is cancelled
              </p>
            </div>
            <Link to="/symptoms">
              <Button size="sm" variant="outline">
                Join Another Waitlist
              </Button>
            </Link>
          </div>

          {waitlist.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No active waitlist requests"
              description="When a preferred doctor or date is fully booked, you can join the waitlist to receive instant opening alerts."
            />
          ) : (
            <div className="space-y-4">
              {waitlist.map((item) => (
                <div
                  key={item._id}
                  className="p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {item.specialty}
                      </span>
                      {item.doctorId && (
                        <span className="text-xs text-teal-700 font-bold">
                          • Dr. {item.doctorId.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Preferred Date: <strong>{item.preferredDate}</strong> ({item.preferredTime} Window)
                    </p>
                    {item.clinicId && (
                      <p className="text-[11px] text-slate-400">
                        Hospital: {item.clinicId.name} ({item.clinicId.location})
                      </p>
                    )}
                  </div>

                  {item.status === 'WAITING' && (
                    <Button
                      size="sm"
                      variant="dangerSoft"
                      onClick={() => handleCancelWaitlist(item._id)}
                    >
                      Cancel Waitlist
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAILED MEDICAL RECORD MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Official Doctor Clinical Treatment Record"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Certified Clinical Record
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  Date: {selectedRecord.date}
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                {selectedRecord.diagnosis || selectedRecord.condition}
              </h3>
              <p className="text-xs text-teal-200">
                Provider: {selectedRecord.doctor?.name || selectedRecord.doctorName} • {selectedRecord.doctor?.specialty || selectedRecord.doctorSpecialty}
              </p>
            </div>

            {/* Vital Signs (if present) */}
            {selectedRecord.vitalSigns && Object.values(selectedRecord.vitalSigns).some(Boolean) && (
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
                  Clinical Vital Signs
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedRecord.vitalSigns.bloodPressure && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                      <strong className="text-slate-900">{selectedRecord.vitalSigns.bloodPressure}</strong>
                    </div>
                  )}
                  {selectedRecord.vitalSigns.heartRate && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                      <strong className="text-slate-900">{selectedRecord.vitalSigns.heartRate}</strong>
                    </div>
                  )}
                  {selectedRecord.vitalSigns.temperature && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Temperature</span>
                      <strong className="text-slate-900">{selectedRecord.vitalSigns.temperature}</strong>
                    </div>
                  )}
                  {selectedRecord.vitalSigns.spO2 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Oxygen (SpO2)</span>
                      <strong className="text-slate-900">{selectedRecord.vitalSigns.spO2}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Clinical Notes */}
            {selectedRecord.clinicalNotes && (
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
                  Doctor's Examination & Clinical Notes
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 leading-relaxed text-slate-800">
                  {selectedRecord.clinicalNotes}
                </div>
              </div>
            )}

            {/* Prescribed Medications */}
            {selectedRecord.medications?.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
                  Doctor Prescribed Medications ({selectedRecord.medications.length})
                </span>
                <div className="space-y-2">
                  {selectedRecord.medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 text-xs">{med.medicineName} ({med.dosage})</strong>
                        <span className="text-[10px] text-teal-700 font-bold">{med.frequency}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Duration: {med.duration} • {med.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up & Recommendations */}
            {(selectedRecord.followUpDate || selectedRecord.additionalRecommendations) && (
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 space-y-1.5">
                {selectedRecord.followUpDate && (
                  <p className="font-bold text-teal-950">
                    Follow-Up Date: {selectedRecord.followUpDate} ({selectedRecord.followUpInstructions || 'Review'})
                  </p>
                )}
                {selectedRecord.additionalRecommendations && (
                  <p className="text-teal-900 text-[11px]">
                    <strong>Recommendations:</strong> {selectedRecord.additionalRecommendations}
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close Record
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecordsPage;
