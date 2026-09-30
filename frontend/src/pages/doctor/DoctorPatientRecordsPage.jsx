import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { medicalRecordService } from '../../services/medicalRecordService';
import {
  FileText,
  User,
  Stethoscope,
  Pill,
  Calendar,
  Clock,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  Activity,
  Layers,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const DoctorPatientRecordsPage = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');

  // Selected Patient for history viewing
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientHistoryData, setPatientHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // New Medical Record / Prescription Modal state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [modalAppt, setModalAppt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Record Form state
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    clinicalNotes: '',
    patientReportedCondition: '',
    patientSymptoms: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    spO2: '',
    weight: '',
    medications: [
      {
        medicineName: '',
        dosage: '',
        frequency: 'Twice daily after meals',
        duration: '5 days',
        instructions: 'Take with water',
        isActive: true,
      },
    ],
    followUpDate: '',
    followUpInstructions: '',
    additionalRecommendations: '',
  });

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
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
    fetchDoctorAppointments();
  }, []);

  const handleViewPatientHistory = async (patientId) => {
    try {
      setSelectedPatientId(patientId);
      setHistoryLoading(true);
      const res = await medicalRecordService.getPatientRecordsForDoctor(patientId);
      if (res.success) {
        setPatientHistoryData(res.data);
      }
    } catch (err) {
      console.error('Failed to load patient history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openAddRecordModal = (appt) => {
    setModalAppt(appt);
    setRecordForm({
      diagnosis: '',
      clinicalNotes: '',
      patientReportedCondition: appt.patientCondition || appt.reason || '',
      patientSymptoms: (appt.patientSymptoms || []).join(', '),
      bloodPressure: '120/80',
      heartRate: '75',
      temperature: '98.6',
      spO2: '99',
      weight: '70',
      medications: [
        {
          medicineName: '',
          dosage: '',
          frequency: 'Twice daily after meals',
          duration: '5 days',
          instructions: 'Take with water',
          isActive: true,
        },
      ],
      followUpDate: '',
      followUpInstructions: '',
      additionalRecommendations: '',
    });
    setIsRecordModalOpen(true);
  };

  const handleAddMedicationRow = () => {
    setRecordForm({
      ...recordForm,
      medications: [
        ...recordForm.medications,
        {
          medicineName: '',
          dosage: '',
          frequency: 'Twice daily after meals',
          duration: '5 days',
          instructions: 'Take with water',
          isActive: true,
        },
      ],
    });
  };

  const handleRemoveMedicationRow = (idx) => {
    const nextMeds = recordForm.medications.filter((_, i) => i !== idx);
    setRecordForm({ ...recordForm, medications: nextMeds });
  };

  const handleMedChange = (idx, field, value) => {
    const nextMeds = [...recordForm.medications];
    nextMeds[idx][field] = value;
    setRecordForm({ ...recordForm, medications: nextMeds });
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    if (!recordForm.diagnosis.trim()) {
      alert('Please enter a clinical diagnosis.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        patientId: modalAppt.patientId._id,
        appointmentId: modalAppt._id,
        clinicId: modalAppt.clinicId?._id,
        date: modalAppt.date,
        diagnosis: recordForm.diagnosis.trim(),
        clinicalNotes: recordForm.clinicalNotes.trim(),
        patientReportedCondition: recordForm.patientReportedCondition,
        patientSymptoms: recordForm.patientSymptoms ? recordForm.patientSymptoms.split(',').map((s) => s.trim()) : [],
        vitalSigns: {
          bloodPressure: recordForm.bloodPressure,
          heartRate: recordForm.heartRate ? `${recordForm.heartRate} bpm` : '',
          temperature: recordForm.temperature ? `${recordForm.temperature} °F` : '',
          spO2: recordForm.spO2 ? `${recordForm.spO2}%` : '',
          weight: recordForm.weight ? `${recordForm.weight} kg` : '',
        },
        medications: recordForm.medications.filter((m) => m.medicineName.trim()),
        followUpDate: recordForm.followUpDate || '',
        followUpInstructions: recordForm.followUpInstructions || '',
        additionalRecommendations: recordForm.additionalRecommendations || '',
      };

      const res = await medicalRecordService.createMedicalRecord(payload);
      if (res.success) {
        setIsRecordModalOpen(false);
        fetchDoctorAppointments();
        if (selectedPatientId) {
          handleViewPatientHistory(selectedPatientId);
        }
      }
    } catch (err) {
      console.error('Failed to create medical record:', err);
      alert(err.response?.data?.message || err.message || 'Error saving medical record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Unique patient roster from appointments
  const patientsMap = new Map();
  appointments.forEach((appt) => {
    if (appt.patientId && !patientsMap.has(appt.patientId._id)) {
      patientsMap.set(appt.patientId._id, {
        patient: appt.patientId,
        latestAppointment: appt,
        appointmentsCount: 0,
      });
    }
    if (appt.patientId) {
      patientsMap.get(appt.patientId._id).appointmentsCount += 1;
    }
  });

  const patientRoster = Array.from(patientsMap.values()).filter(({ patient }) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return patient.name?.toLowerCase().includes(q) || patient.email?.toLowerCase().includes(q);
  });

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading patient treatment workstation..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>CLINICAL PRACTICE WORKSTATION</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Patient Treatment Records & Clinical History
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Record certified diagnoses, issue structured prescriptions, prescribe medications, and review patient medical histories.
          </p>
        </div>
      </div>

      {/* Main Workstation 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authorized Patients & Appointments (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">
                Patient Directory ({patientRoster.length})
              </h3>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {patientRoster.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No patients found in your consultation records.
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {patientRoster.map(({ patient, latestAppointment, appointmentsCount }) => {
                  const isSelected = selectedPatientId === patient._id;
                  return (
                    <div
                      key={patient._id}
                      onClick={() => handleViewPatientHistory(patient._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-teal-400 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                            {patient.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 truncate">
                              {patient.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">{patient.email}</p>
                            <p className="text-[10px] text-slate-400">{patient.phone}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                          {appointmentsCount} {appointmentsCount === 1 ? 'visit' : 'visits'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Latest: {latestAppointment.date} ({latestAppointment.status})
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          className="py-1 px-2.5 text-[11px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddRecordModal(latestAppointment);
                          }}
                        >
                          <span>+ Add Rx / Diagnosis</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Patient Clinical History (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedPatientId ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Select a Patient to View Clinical History
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click any patient from your roster on the left to inspect their past clinical diagnoses, vital signs, prescriptions, and follow-up milestones.
              </p>
            </div>
          ) : historyLoading ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center">
              <LoadingSpinner message="Fetching patient clinical history..." />
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Patient Header Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    AUTHORIZED PATIENT PROFILE
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    {patientHistoryData?.patient?.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {patientHistoryData?.patient?.email} • {patientHistoryData?.patient?.phone}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Total Records</span>
                  <span className="text-lg font-black text-teal-700">
                    {patientHistoryData?.recordsCount || 0}
                  </span>
                </div>
              </div>

              {/* Patient Treatment Records Timeline */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
                <h3 className="text-sm font-black text-slate-900">
                  Clinical Diagnoses & Treatment History
                </h3>

                {patientHistoryData?.records?.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No clinical treatment records recorded yet for this patient.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientHistoryData?.records?.map((rec) => (
                      <div
                        key={rec._id}
                        className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">
                              Date: {rec.date}
                            </span>
                            <h4 className="text-base font-black text-slate-900">
                              {rec.diagnosis}
                            </h4>
                            <p className="text-xs text-teal-700 font-semibold">
                              Attending: {rec.doctorId?.name} ({rec.doctorId?.specialty})
                            </p>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                            {rec.status}
                          </span>
                        </div>

                        {/* Vitals */}
                        {rec.vitalSigns && Object.values(rec.vitalSigns).some(Boolean) && (
                          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                            {rec.vitalSigns.bloodPressure && (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                BP: {rec.vitalSigns.bloodPressure}
                              </span>
                            )}
                            {rec.vitalSigns.heartRate && (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                HR: {rec.vitalSigns.heartRate}
                              </span>
                            )}
                            {rec.vitalSigns.temperature && (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                Temp: {rec.vitalSigns.temperature}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Clinical notes */}
                        {rec.clinicalNotes && (
                          <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                            <strong>Doctor Notes:</strong> {rec.clinicalNotes}
                          </p>
                        )}

                        {/* Prescribed Meds */}
                        {rec.medications?.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase text-purple-700 block">
                              Prescribed Medications ({rec.medications.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.medications.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800"
                                >
                                  <strong>{m.medicineName}</strong> ({m.dosage}) - {m.frequency}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up */}
                        {rec.followUpDate && (
                          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 font-semibold">
                            Follow-Up Date: {rec.followUpDate} ({rec.followUpInstructions || 'Review'})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DOCTOR TREATMENT RECORD & PRESCRIPTION MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Clinical Treatment, Diagnosis & Prescriptions"
        size="lg"
      >
        {modalAppt && (
          <form onSubmit={handleSubmitRecord} className="space-y-5 text-xs text-slate-700">
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400 block">
                  Patient Consultation
                </span>
                <strong className="text-sm text-white">{modalAppt.patientId?.name}</strong>
              </div>
              <div className="text-right text-xs text-slate-300 font-mono">
                Date: {modalAppt.date} ({modalAppt.startTime} - {modalAppt.endTime})
              </div>
            </div>

            {/* Diagnosis (Required) */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-900">
                Doctor Certified Diagnosis / Condition <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={recordForm.diagnosis}
                onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                placeholder="e.g. Stage 1 Essential Hypertension, Acute Viral Bronchitis, Migraine without Aura..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-slate-900"
              />
            </div>

            {/* Patient Reported Condition & Symptoms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Patient-Reported Complaint</label>
                <input
                  type="text"
                  value={recordForm.patientReportedCondition}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, patientReportedCondition: e.target.value })
                  }
                  placeholder="Patient stated reason for visit"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Presenting Symptoms (comma separated)</label>
                <input
                  type="text"
                  value={recordForm.patientSymptoms}
                  onChange={(e) => setRecordForm({ ...recordForm, patientSymptoms: e.target.value })}
                  placeholder="e.g. Fever, Cough, Chest pain"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Vitals */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Vital Signs</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">BP (mmHg)</span>
                  <input
                    type="text"
                    value={recordForm.bloodPressure}
                    onChange={(e) => setRecordForm({ ...recordForm, bloodPressure: e.target.value })}
                    placeholder="120/80"
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                  <input
                    type="text"
                    value={recordForm.heartRate}
                    onChange={(e) => setRecordForm({ ...recordForm, heartRate: e.target.value })}
                    placeholder="75"
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Temp (°F)</span>
                  <input
                    type="text"
                    value={recordForm.temperature}
                    onChange={(e) => setRecordForm({ ...recordForm, temperature: e.target.value })}
                    placeholder="98.6"
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SpO2 (%)</span>
                  <input
                    type="text"
                    value={recordForm.spO2}
                    onChange={(e) => setRecordForm({ ...recordForm, spO2: e.target.value })}
                    placeholder="99"
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Weight (kg)</span>
                  <input
                    type="text"
                    value={recordForm.weight}
                    onChange={(e) => setRecordForm({ ...recordForm, weight: e.target.value })}
                    placeholder="70"
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Examination Notes */}
            <div className="space-y-1">
              <label className="font-bold text-slate-900 block">Doctor Examination & Clinical Notes</label>
              <textarea
                rows={3}
                value={recordForm.clinicalNotes}
                onChange={(e) => setRecordForm({ ...recordForm, clinicalNotes: e.target.value })}
                placeholder="Physical examination findings, test results review, clinical assessment..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Multi-Row Medications Prescription Form */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="font-black text-slate-900 block uppercase tracking-wider text-[11px]">
                  Prescribed Medications ({recordForm.medications.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddMedicationRow}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Medication</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {recordForm.medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-slate-400 block">Medicine Name</span>
                        <input
                          type="text"
                          value={med.medicineName}
                          onChange={(e) => handleMedChange(idx, 'medicineName', e.target.value)}
                          placeholder="e.g. Telmisartan, Amoxicillin, Paracetamol..."
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Dosage</span>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                          placeholder="e.g. 500 mg, 10 ml"
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Frequency</span>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                          placeholder="e.g. Once daily OD, BD"
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Duration</span>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                          placeholder="e.g. 5 days, 30 days"
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Instructions</span>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                          placeholder="e.g. Take after breakfast"
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div className="flex items-center justify-end space-x-2 pt-4">
                        {recordForm.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicationRow(idx)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                            title="Remove medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up & Recommendations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Follow-Up Consultation Date (Optional)</label>
                <input
                  type="date"
                  value={recordForm.followUpDate}
                  onChange={(e) => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Follow-Up Instructions</label>
                <input
                  type="text"
                  value={recordForm.followUpInstructions}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, followUpInstructions: e.target.value })
                  }
                  placeholder="e.g. Review fasting lipid panel and BP readings"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Additional Recommendations / Lifestyle Advice</label>
              <textarea
                rows={2}
                value={recordForm.additionalRecommendations}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, additionalRecommendations: e.target.value })
                }
                placeholder="Dietary changes, exercise plan, diagnostic laboratory tests to conduct..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
              <Button type="button" size="sm" variant="outline" onClick={() => setIsRecordModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="md" variant="primary" loading={submitting}>
                Save Clinical Record & Issue Rx
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatientRecordsPage;
