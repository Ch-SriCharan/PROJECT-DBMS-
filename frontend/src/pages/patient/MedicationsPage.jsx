import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { medicalRecordService } from '../../services/medicalRecordService';
import { Pill, ShieldCheck, PlusCircle, CheckCircle, Clock, Stethoscope, Search, Info } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const MedicationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [medData, setMedData] = useState({ activeMedications: [], pastMedications: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        setLoading(true);
        const res = await medicalRecordService.getMyMedications();
        if (res.success) {
          setMedData(res.data);
        }
      } catch (err) {
        console.error('Failed to load medication history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeds();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your prescribed medications..." />;
  }

  const filterMeds = (list) => {
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (m) =>
        m.medicineName.toLowerCase().includes(q) ||
        m.diagnosis?.toLowerCase().includes(q) ||
        m.prescribedBy?.toLowerCase().includes(q)
    );
  };

  const activeFiltered = filterMeds(medData.activeMedications);
  const pastFiltered = filterMeds(medData.pastMedications);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Pill className="w-3.5 h-3.5" />
            <span>PRESCRIBED PHARMACY PROFILE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Medication History & Prescriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Authorized prescriptions recorded by your attending healthcare providers with dosage, frequency, and instructions.
          </p>
        </div>

        <Link to="/patient/records">
          <Button size="md" variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
            <span>View Medical Timeline</span>
          </Button>
        </Link>
      </div>

      {/* Strict Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Clinical Safety Rule:</strong> All medications shown below are doctor-authorized prescriptions. The system does not self-prescribe or automatically generate medication recommendations based on symptoms.
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by medicine name, doctor, or condition..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
        />
      </div>

      {/* Active Medications */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Active Therapy ({activeFiltered.length})
          </h2>
        </div>

        {activeFiltered.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
            No active prescriptions match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeFiltered.map((med) => (
              <div
                key={med._id}
                className="p-6 rounded-3xl bg-white border-2 border-teal-500/40 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ACTIVE
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {med.medicineName} <span className="text-teal-700 text-sm">({med.dosage})</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {med.frequency} • {med.duration}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Pill className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <p className="text-slate-800">
                    <strong>Instructions:</strong> {med.instructions || 'Take as instructed by doctor'}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Condition: <strong>{med.diagnosis}</strong>
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    Prescribing Doctor: {med.prescribedBy} ({med.prescribingSpecialty}) on {med.datePrescribed}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past / Completed Medications */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-base sm:text-lg font-black text-slate-800">
          Previous Medications ({pastFiltered.length})
        </h2>

        {pastFiltered.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
            No previous medications recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastFiltered.map((med) => (
              <div
                key={med._id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900">
                    {med.medicineName} ({med.dosage})
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                    Completed
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {med.frequency} for {med.duration}
                </p>
                <p className="text-[11px] text-slate-400">
                  Prescribed by {med.prescribedBy} for {med.diagnosis}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationsPage;
