import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { medicalRecordService } from '../../services/medicalRecordService';
import {
  HeartPulse,
  Search,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  Activity,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const ConditionsPage = () => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        setLoading(true);
        const res = await medicalRecordService.getConditions();
        if (res.success) {
          setConditions(res.data);
        }
      } catch (err) {
        console.error('Failed to load condition catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConditions();
  }, []);

  const categories = ['All', ...new Set(conditions.map((c) => c.category))];

  const filtered = conditions.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.recommendedSpecialty.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.commonSymptoms.some((s) => s.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-extrabold tracking-wider">
          <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
          <span>CLINICAL CONDITION DIRECTORY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Explore Health Conditions & Specialists
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Search for medical conditions to identify the recommended clinical discipline and connect with verified specialist doctors across our healthcare network.
        </p>

        {/* Non-Diagnostic Safety Warning */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5 max-w-3xl">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Important Clinical Notice:</strong> Selecting a condition is a directory search guide. It is not an automated medical diagnosis or prescription. Certified diagnoses and prescriptions are exclusively issued by licensed doctors during consultations.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search condition by name, specialty, or symptoms (e.g. Migraine, Hypertension, Asthma)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Conditions Grid */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading condition catalog..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No conditions found"
          description="Try broadening your search term or select 'All' categories."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {item.category}
                  </span>
                  {item.isEmergency && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                      Urgent Care
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                  {item.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                {/* Common symptoms chips */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Associated Symptoms:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.commonSymptoms.map((sym, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 font-medium"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Specialist Box */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Recommended Clinical Discipline
                  </span>
                  <p className="font-black text-slate-900 flex items-center space-x-1">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <span>{item.recommendedSpecialty}</span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  to={`/doctors?specialty=${encodeURIComponent(item.recommendedSpecialty)}`}
                  className="block"
                >
                  <Button size="sm" variant="primary" className="w-full justify-center">
                    <span>Find {item.recommendedSpecialty} Doctors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConditionsPage;
