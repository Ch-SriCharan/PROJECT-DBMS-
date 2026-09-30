import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { medicalRecordService } from '../../services/medicalRecordService';
import {
  Stethoscope,
  HeartPulse,
  Calendar,
  Building2,
  Pill,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const DiagnosesPage = () => {
  const [loading, setLoading] = useState(true);
  const [diagnoses, setDiagnoses] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        setLoading(true);
        const res = await medicalRecordService.getMyDiagnoses();
        if (res.success) {
          setDiagnoses(res.data);
        }
      } catch (err) {
        console.error('Failed to load diagnoses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiagnoses();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your diagnosis history..." />;
  }

  const filtered = diagnoses.filter(
    (d) =>
      !search ||
      d.condition.toLowerCase().includes(search.toLowerCase()) ||
      d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      d.doctorSpecialty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>CERTIFIED CLINICAL DIAGNOSES</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Condition & Diagnosis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Connected healthcare journey from patient-reported symptoms to doctor-certified diagnoses, prescriptions, and follow-up milestones.
          </p>
        </div>

        <Link to="/patient/records">
          <Button size="md" variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
            <span>View Full Timeline</span>
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by diagnosis or doctor name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
        />
      </div>

      {/* Condition Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No diagnoses found"
          description="Doctor certified diagnoses will appear here once an appointment consultation is completed."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:border-teal-500/50 transition-all space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                      CERTIFIED DIAGNOSIS
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Recorded on {item.appointmentDate}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{item.condition}</h3>
                  {item.patientReportedCondition && (
                    <p className="text-xs text-slate-500">
                      Patient Complaint: <em>"{item.patientReportedCondition}"</em>
                    </p>
                  )}
                </div>

                <Link to={`/patient/records`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    <span>View Record</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              {/* Journey Step Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    01. Specialist Doctor
                  </span>
                  <p className="font-black text-slate-900">{item.doctorName}</p>
                  <p className="text-teal-700 text-[11px]">{item.doctorSpecialty}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    02. Facility
                  </span>
                  <p className="font-black text-slate-900">{item.clinicName}</p>
                  <p className="text-slate-500 text-[11px]">{item.clinicLocation}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    03. Prescriptions
                  </span>
                  <p className="font-black text-purple-800">
                    {item.medications?.length || 0} Medications
                  </p>
                  <p className="text-slate-500 text-[11px]">Doctor authorized Rx</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    04. Follow-Up
                  </span>
                  <p className="font-black text-teal-800">
                    {item.followUpDate || 'As needed'}
                  </p>
                  <p className="text-slate-500 text-[11px]">Next consultation review</p>
                </div>
              </div>

              {/* Prescribed medicines list */}
              {item.medications?.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Prescribed Medicines for {item.condition}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.medications.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800 flex items-center space-x-1.5 shadow-2xs"
                      >
                        <Pill className="w-3.5 h-3.5 text-purple-600" />
                        <span><strong>{m.medicineName}</strong> ({m.dosage}) - {m.frequency}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiagnosesPage;
