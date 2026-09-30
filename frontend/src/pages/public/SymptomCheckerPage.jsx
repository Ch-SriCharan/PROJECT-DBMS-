import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { symptomService } from '../../services/symptomService';
import { clinicService } from '../../services/clinicService';
import {
  Search,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  MapPin,
  Calendar,
  Building2,
  Award,
  Clock,
  ChevronRight,
  RotateCcw,
  Info,
  PhoneCall,
  Activity,
  Flame,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const QUICK_PRESETS = [
  {
    name: 'Flu & Cold',
    symptoms: ['fever', 'cough', 'sore-throat', 'fatigue'],
    icon: '🤒',
  },
  {
    name: 'Chest & Breathing',
    symptoms: ['chest-pain', 'shortness-of-breath'],
    icon: '🫁',
  },
  {
    name: 'Digestive Upset',
    symptoms: ['stomach-pain', 'vomiting', 'diarrhea'],
    icon: '🤢',
  },
  {
    name: 'Joints & Back',
    symptoms: ['joint-pain', 'back-pain'],
    icon: '🦴',
  },
  {
    name: 'Skin & Allergy',
    symptoms: ['skin-rash', 'itching'],
    icon: '🩹',
  },
  {
    name: 'Head & Dizziness',
    symptoms: ['headache', 'dizziness'],
    icon: '🧠',
  },
  {
    name: 'Dental Ache',
    symptoms: ['tooth-pain'],
    icon: '🦷',
  },
  {
    name: 'Vision & Eye',
    symptoms: ['eye-pain-vision-problems'],
    icon: '👁️',
  },
];

const SymptomCheckerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Symptoms catalog & selection
  const [symptomsList, setSymptomsList] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptomIds, setSelectedSymptomIds] = useState(() => {
    const initial = searchParams.get('symptoms');
    return initial ? initial.split(',').filter(Boolean) : [];
  });

  // Recommendation & Matching Doctors state
  const [recommendationData, setRecommendationData] = useState(null);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // Doctor filters
  const [doctorFilters, setDoctorFilters] = useState({
    location: '',
    clinicId: '',
    availableDate: '',
  });
  const [clinics, setClinics] = useState([]);

  // Fetch initial symptoms & clinics
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoadingSymptoms(true);
        const [symptomsRes, clinicsRes] = await Promise.all([
          symptomService.getSymptoms(),
          clinicService.getClinics(),
        ]);

        if (symptomsRes.success) {
          setSymptomsList(symptomsRes.data);
          if (symptomsRes.categories) {
            setCategories(symptomsRes.categories);
          }
        }
        if (clinicsRes.success) {
          setClinics(clinicsRes.data);
        }
      } catch (err) {
        console.error('Failed to load symptoms catalog:', err);
      } finally {
        setLoadingSymptoms(false);
      }
    };

    fetchCatalog();
  }, []);

  // Recalculate recommendation whenever selected symptoms or doctor filters change
  useEffect(() => {
    const evaluate = async () => {
      if (selectedSymptomIds.length === 0) {
        setRecommendationData(null);
        return;
      }

      try {
        setEvaluating(true);
        const res = await symptomService.getRecommendation(selectedSymptomIds, {
          location: doctorFilters.location || undefined,
          clinicId: doctorFilters.clinicId || undefined,
          availableDate: doctorFilters.availableDate || undefined,
        });

        if (res.success) {
          setRecommendationData(res.data);
        }
      } catch (err) {
        console.error('Failed to evaluate symptoms:', err);
      } finally {
        setEvaluating(false);
      }
    };

    evaluate();
  }, [selectedSymptomIds, doctorFilters]);

  // Update URL search params when selection changes
  const updateUrlParams = (ids) => {
    if (ids.length > 0) {
      setSearchParams({ symptoms: ids.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // Toggle symptom selection
  const handleToggleSymptom = (symptomId) => {
    let nextSelected;
    if (selectedSymptomIds.includes(symptomId)) {
      nextSelected = selectedSymptomIds.filter((id) => id !== symptomId);
    } else {
      nextSelected = [...selectedSymptomIds, symptomId];
    }
    setSelectedSymptomIds(nextSelected);
    updateUrlParams(nextSelected);
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedSymptomIds([]);
    updateUrlParams([]);
    setRecommendationData(null);
  };

  // Apply a quick preset
  const handleApplyPreset = (presetSymptoms) => {
    setSelectedSymptomIds(presetSymptoms);
    updateUrlParams(presetSymptoms);
  };

  // Filtered symptoms based on search and category tab
  const filteredSymptoms = useMemo(() => {
    return symptomsList.filter((symptom) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        symptom.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        symptom.name.toLowerCase().includes(q) ||
        symptom.category.toLowerCase().includes(q) ||
        symptom.description.toLowerCase().includes(q) ||
        symptom.bodyArea.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [symptomsList, selectedCategory, searchQuery]);

  // Map selected IDs to symptom objects
  const selectedSymptomsObjects = useMemo(() => {
    return symptomsList.filter((s) => selectedSymptomIds.includes(s.id));
  }, [symptomsList, selectedSymptomIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-extrabold tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span>FIND THE RIGHT SPECIALIST</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Symptom-Based Doctor Discovery
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Select one or more symptoms you are experiencing. Our rule-based clinical specialty mapping will recommend the appropriate medical discipline and connect you directly with verified healthcare providers.
        </p>

        {/* Non-Diagnostic Disclaimer Pill */}
        <div className="inline-flex items-start sm:items-center space-x-2 p-2.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-xs">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Discovery Aid:</strong> This tool suggests medical specialties for consultation and does <em>not</em> diagnose conditions or claim disease presence.
          </span>
        </div>
      </div>

      {/* EMERGENCY WARNING CALLOUT (Rendered when emergency red flag symptoms are selected) */}
      {recommendationData?.emergencyAlert?.isEmergency && (
        <div className="p-5 sm:p-6 rounded-3xl bg-rose-50 border-2 border-rose-500/70 shadow-lg shadow-rose-500/10 text-rose-950 space-y-3 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                  URGENT SYMPTOM WARNING
                </span>
                <span className="text-xs font-bold text-rose-800">
                  Potential Red-Flag Symptoms Detected
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-rose-950">
                {recommendationData.emergencyAlert.title}
              </h3>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
                {recommendationData.emergencyAlert.message}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-rose-900 font-bold">
              <PhoneCall className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Emergency Services Hotline: <strong>112</strong> or <strong>911</strong> (Ambulance / ER)</span>
            </div>
            <span className="text-[11px] text-rose-700 italic">
              Do not delay urgent emergency attention for an online scheduled visit.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Selection Panel & Right Recommendation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Symptom Search & Multi-Select List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search & Filter Header */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Select Symptoms
                </h2>
              </div>
              {selectedSymptomIds.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 transition flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All ({selectedSymptomIds.length})</span>
                </button>
              )}
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symptoms by name, body area, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Combo Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Preset Scenarios
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset.symptoms)}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 border border-slate-200/60 text-slate-700 transition flex items-center space-x-1"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
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

          {/* Selected Symptoms Tray (Chips with 'x' to remove) */}
          {selectedSymptomIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-teal-900 font-bold">
                <span>Selected Symptoms ({selectedSymptomIds.length})</span>
                <span className="text-[11px] font-medium text-teal-700">Click × to remove</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSymptomsObjects.map((sym) => (
                  <span
                    key={sym.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition ${
                      sym.isEmergency
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-teal-900 border border-teal-300'
                    }`}
                  >
                    {sym.isEmergency && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{sym.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSymptom(sym.id);
                      }}
                      className="hover:opacity-75 focus:outline-none ml-0.5"
                      title="Remove symptom"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Searchable Symptom Cards / Chips Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Showing {filteredSymptoms.length} symptoms</span>
              <span className="text-teal-700">Select multiple items to combine</span>
            </div>

            {loadingSymptoms ? (
              <LoadingSpinner message="Loading clinical symptoms..." />
            ) : filteredSymptoms.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No symptoms match your search"
                description="Try changing your search terms or selecting 'All' categories."
                actionLabel="Clear Search"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredSymptoms.map((symptom) => {
                  const isSelected = selectedSymptomIds.includes(symptom.id);
                  return (
                    <div
                      key={symptom.id}
                      onClick={() => handleToggleSymptom(symptom.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start space-x-3 group ${
                        isSelected
                          ? symptom.isEmergency
                            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20'
                            : 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-teal-400 hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Checkbox Visual */}
                      <div
                        className={`w-5 h-5 rounded-lg mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? symptom.isEmergency
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'bg-teal-600 border-teal-600 text-white'
                            : 'border-slate-300 bg-white group-hover:border-teal-500'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {/* Symptom Info */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-xs sm:text-sm font-extrabold truncate ${
                              isSelected ? 'text-slate-900' : 'text-slate-800'
                            }`}
                          >
                            {symptom.name}
                          </h4>
                          {symptom.isEmergency && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                              Urgent
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {symptom.description}
                        </p>

                        <div className="pt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {symptom.bodyArea}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {symptom.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Rule-Based Recommendation & Matching Doctors (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {evaluating ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
              <LoadingSpinner message="Analyzing symptoms with clinical rules..." />
            </div>
          ) : !recommendationData?.hasSelection ? (
            /* Empty selection placeholder */
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900">
                  Select Symptoms to Discover Specialists
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Choose one or more symptoms from the list or try one of the quick presets to get an instant specialist recommendation.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Examples:
                </span>
                <ul className="space-y-1 text-slate-500 list-disc list-inside text-[11px]">
                  <li>Tooth pain → <strong>Dentist</strong></li>
                  <li>Eye pain / vision problems → <strong>Ophthalmologist</strong></li>
                  <li>Skin rash / itching → <strong>Dermatologist</strong></li>
                  <li>Joint pain / back pain → <strong>Orthopedist</strong></li>
                  <li>Chest pain / breathing difficulty → <strong>Cardiologist / Pulmonologist</strong></li>
                  <li>Stomach pain / digestive symptoms → <strong>Gastroenterologist</strong></li>
                </ul>
              </div>
            </div>
          ) : (
            /* Active Recommendation Card */
            <div className="space-y-6 animate-scaleUp">
              {/* Core Recommendation Card */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 border border-slate-800 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block">
                      RECOMMENDED CLINICAL DISCIPLINE
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {recommendationData.specialtyDetails?.title || recommendationData.recommendedSpecialty}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono">
                      Department: {recommendationData.specialtyDetails?.department || recommendationData.recommendedSpecialty}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                </div>

                {/* Exact Required Phrasing */}
                <div className="p-4 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  “Based on the symptoms you selected, you may consider consulting a{' '}
                  <span className="text-teal-300 font-extrabold underline decoration-teal-400/50">
                    {recommendationData.specialtyDetails?.title || recommendationData.recommendedSpecialty}
                  </span>
                  .”
                </div>

                {/* Specialty Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {recommendationData.specialtyDetails?.description}
                </p>

                {/* Common Conditions Treated */}
                {recommendationData.specialtyDetails?.commonConditions?.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Common Conditions Addressed:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendationData.specialtyDetails.commonConditions.map((cond) => (
                        <span
                          key={cond}
                          className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 text-teal-300 border border-slate-700"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secondary / Related Specialties */}
                {recommendationData.secondarySpecialties?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Also Relevant for Selected Symptoms:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {recommendationData.secondarySpecialties.map((sec) => (
                        <span
                          key={sec.name}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 flex items-center space-x-1"
                        >
                          <span>•</span>
                          <span>{sec.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* "View Doctors in Directory" Action Button */}
                <div className="pt-2">
                  <Link
                    to={`/doctors?specialty=${encodeURIComponent(recommendationData.recommendedSpecialty)}`}
                    className="w-full"
                  >
                    <Button
                      size="md"
                      variant="primary"
                      className="w-full justify-center shadow-lg shadow-teal-600/30"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>View All {recommendationData.recommendedSpecialty} Doctors</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Matching Doctors Roster Section with Location/Clinic/Date Filters */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Matching Doctors ({recommendationData.matchingDoctorsCount || 0})
                    </h3>
                  </div>
                  <span className="text-[11px] text-teal-700 font-bold">
                    Ready to Book
                  </span>
                </div>

                {/* Secondary In-Place Doctor Filters (Location, Clinic, Date) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <select
                      value={doctorFilters.location}
                      onChange={(e) =>
                        setDoctorFilters({ ...doctorFilters, location: e.target.value })
                      }
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="">All Cities</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={doctorFilters.clinicId}
                      onChange={(e) =>
                        setDoctorFilters({ ...doctorFilters, clinicId: e.target.value })
                      }
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none truncate"
                    >
                      <option value="">All Hospitals</option>
                      {clinics.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="date"
                      value={doctorFilters.availableDate}
                      onChange={(e) =>
                        setDoctorFilters({ ...doctorFilters, availableDate: e.target.value })
                      }
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Matching Doctor List */}
                {recommendationData.matchingDoctors?.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs space-y-2">
                    <p>No specialists found matching the current city/date filters.</p>
                    <button
                      onClick={() =>
                        setDoctorFilters({ location: '', clinicId: '', availableDate: '' })
                      }
                      className="text-xs font-bold text-teal-600 hover:underline"
                    >
                      Reset City & Date Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendationData.matchingDoctors?.map((doc) => (
                      <div
                        key={doc._id}
                        className="p-4 rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition-all space-y-3 bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-11 h-11 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                              {doc.name.replace('Dr. ', '').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {doc.name}
                              </h4>
                              <p className="text-[11px] font-semibold text-teal-700">
                                {doc.specialty} • {doc.experience} Yrs Exp
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {doc.clinicId?.name} ({doc.clinicId?.location})
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">
                              Fee
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              ₹{doc.consultationFee || 500}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <Link
                            to={`/doctors/${doc._id}`}
                            className="text-[11px] font-bold text-slate-600 hover:text-slate-900"
                          >
                            View Full Profile
                          </Link>

                          {/* Direct proceed to existing appointment booking flow */}
                          <Link to={`/patient/book?doctorId=${doc._id}`}>
                            <Button size="sm" variant="primary" className="py-1.5 px-3 text-xs shadow-xs">
                              <span>Book Visit</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance & Advisory Footer */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-2 max-w-3xl mx-auto text-xs text-slate-500">
        <ShieldCheck className="w-6 h-6 text-teal-600 mx-auto" />
        <h4 className="font-bold text-slate-800 text-xs">
          Clinical Guidance & Health Information Disclaimer
        </h4>
        <p className="text-[11px] leading-relaxed">
          The HealthSync Symptom Discovery tool maps common self-reported symptoms to medical specialties for appointment booking convenience. It does not provide medical diagnosis, clinical treatment plans, or emergency triage. For severe or sudden symptoms, please contact emergency health services immediately.
        </p>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;
