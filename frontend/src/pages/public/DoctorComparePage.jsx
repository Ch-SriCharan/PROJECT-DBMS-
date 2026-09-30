import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import {
  Scale,
  Award,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  ArrowRight,
  Plus,
  X,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const DoctorComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allDoctors, setAllDoctors] = useState([]);
  const [comparedDoctors, setComparedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => {
    const raw = searchParams.get('ids');
    return raw ? raw.split(',').filter(Boolean) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch initial doctor directory
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getDoctors();
        if (res.success) {
          setAllDoctors(res.data);

          // If no IDs passed in URL, preselect the first 2 doctors for instant preview
          let initialIds = selectedIds;
          if (initialIds.length === 0 && res.data.length >= 2) {
            initialIds = [res.data[0]._id, res.data[1]._id];
            setSelectedIds(initialIds);
          }

          if (initialIds.length > 0) {
            const compRes = await doctorService.compareDoctors(initialIds);
            if (compRes.success) {
              setComparedDoctors(compRes.data);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load doctors for comparison:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Update comparison when selectedIds change
  const refreshComparison = async (ids) => {
    if (ids.length === 0) {
      setComparedDoctors([]);
      setSearchParams({});
      return;
    }
    setSearchParams({ ids: ids.join(',') });
    try {
      const res = await doctorService.compareDoctors(ids);
      if (res.success) {
        setComparedDoctors(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDoctor = (docId) => {
    if (selectedIds.length >= 4) {
      alert('You can compare a maximum of 4 specialists at once.');
      return;
    }
    if (!selectedIds.includes(docId)) {
      const next = [...selectedIds, docId];
      setSelectedIds(next);
      refreshComparison(next);
    }
  };

  const handleRemoveDoctor = (docId) => {
    const next = selectedIds.filter((id) => id !== docId);
    setSelectedIds(next);
    refreshComparison(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-extrabold tracking-wider">
          <Scale className="w-3.5 h-3.5 text-teal-600" />
          <span>SIDE-BY-SIDE CLINICAL COMPARISON</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Compare Healthcare Providers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Evaluate accredited specialists side-by-side on clinical discipline, years of experience, hospital facility, consultation fees, and next available calendar slots.
        </p>
      </div>

      {/* Doctor Selector Toolbar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-slate-900">
            Select Specialists to Compare (Up to 4)
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {selectedIds.length} of 4 selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allDoctors.map((doc) => {
            const isSelected = selectedIds.includes(doc._id);
            return (
              <button
                key={doc._id}
                onClick={() => (isSelected ? handleRemoveDoctor(doc._id) : handleAddDoctor(doc._id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{doc.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({doc.specialty})</span>
                {isSelected ? <X className="w-3 h-3 ml-1" /> : <Plus className="w-3 h-3 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading comparison metrics..." />
      ) : comparedDoctors.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No doctors selected for comparison"
          description="Click on any doctor above to add them to the comparison table."
        />
      ) : (
        /* Comparison Table Matrix */
        <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="p-5 font-bold uppercase tracking-wider text-[11px] text-slate-300 w-48">
                  Specialist Attribute
                </th>
                {comparedDoctors.map((doc) => (
                  <th key={doc._id} className="p-5 min-w-[240px]">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-black text-white">{doc.name}</h4>
                        <span className="text-xs text-teal-400 font-semibold">{doc.specialty}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveDoctor(doc._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row: Consultation Fee */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Consultation Fee
                </td>
                {comparedDoctors.map((doc) => (
                  <td key={doc._id} className="p-5">
                    <span className="text-lg font-black text-slate-900">
                      ₹{doc.consultationFee || 500}
                    </span>
                    <span className="text-[10px] text-slate-400 block">per session</span>
                  </td>
                ))}
              </tr>

              {/* Row: Experience */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Clinical Experience
                </td>
                {comparedDoctors.map((doc) => (
                  <td key={doc._id} className="p-5">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-xs">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{doc.experience} Years Practice</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Clinic & Location */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Hospital Clinic & City
                </td>
                {comparedDoctors.map((doc) => (
                  <td key={doc._id} className="p-5 space-y-1">
                    <p className="font-black text-slate-900">{doc.clinic?.name || 'Central Clinic'}</p>
                    <p className="text-slate-500 text-[11px] flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{doc.clinic?.location || 'Hyderabad'}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{doc.clinic?.address}</p>
                  </td>
                ))}
              </tr>

              {/* Row: Next Open Slot */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Earliest Open Slot
                </td>
                {comparedDoctors.map((doc) => (
                  <td key={doc._id} className="p-5">
                    {doc.nextSlot ? (
                      <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-0.5">
                        <span className="font-bold block text-xs">{doc.nextSlot.date}</span>
                        <span className="text-[11px] font-mono text-teal-700 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{doc.nextSlot.time}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-semibold">
                        Check live calendar
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Clinical Bio */}
              <tr className="hover:bg-slate-50/60">
                <td className="p-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Specialist Background
                </td>
                {comparedDoctors.map((doc) => (
                  <td key={doc._id} className="p-5">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {doc.description || 'Specialist in clinical diagnosis, evaluations, and ongoing treatment planning.'}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Row: Booking CTA */}
              <tr className="bg-slate-50/40">
                <td className="p-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Action
                </td>
                {comparedDoctors.map((doc) => (
                  <td key={doc._id} className="p-5">
                    <Link to={`/patient/book?doctorId=${doc._id}`} className="block">
                      <Button size="sm" variant="primary" className="w-full justify-center shadow-xs">
                        <span>Book Visit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorComparePage;
