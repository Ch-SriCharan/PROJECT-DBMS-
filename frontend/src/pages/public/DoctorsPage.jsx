import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import {
  Search,
  Stethoscope,
  MapPin,
  Calendar,
  Award,
  Filter,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const DoctorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    specialty: searchParams.get('specialty') || '',
    location: searchParams.get('location') || '',
    availableDate: searchParams.get('availableDate') || '',
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const activeFilters = {};
      if (filters.search) activeFilters.search = filters.search;
      if (filters.specialty) activeFilters.specialty = filters.specialty;
      if (filters.location) activeFilters.location = filters.location;
      if (filters.availableDate) activeFilters.availableDate = filters.availableDate;

      const res = await doctorService.getDoctors(activeFilters);
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.specialty) params.specialty = filters.specialty;
    if (filters.location) params.location = filters.location;
    if (filters.availableDate) params.availableDate = filters.availableDate;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', specialty: '', location: '', availableDate: '' });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Medical Directory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find Top Healthcare Specialists
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Compare verified clinical specialists, view live available calendar dates, and book appointments directly.
          </p>
        </div>

        {/* Symptom Checker Shortcut Pill */}
        <Link
          to="/symptoms"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100/80 transition self-start md:self-auto shrink-0 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
          <span>Not sure who to see? Find by Symptoms →</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <div className="flex items-center px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 focus-within:border-teal-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Doctor name or keyword..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 focus-within:border-teal-500 focus-within:bg-white transition-all">
          <Stethoscope className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <select
            value={filters.specialty}
            onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Dentistry">Dentistry / Dentist</option>
            <option value="Ophthalmology">Ophthalmology / Eye Care</option>
            <option value="Gastroenterology">Gastroenterology</option>
            <option value="ENT Specialist">ENT Specialist</option>
            <option value="Urology">Urology</option>
            <option value="Gynecology">Gynecology</option>
            <option value="General Physician">General Physician</option>
            <option value="Pulmonology">Pulmonology</option>
            <option value="Psychiatry">Psychiatry</option>
          </select>
        </div>

        <div className="flex items-center px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 focus-within:border-teal-500 focus-within:bg-white transition-all">
          <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">All Locations</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        <div className="flex items-center px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 focus-within:border-teal-500 focus-within:bg-white transition-all">
          <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="date"
            value={filters.availableDate}
            onChange={(e) => setFilters({ ...filters, availableDate: e.target.value })}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none cursor-pointer font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" size="sm" className="flex-1 py-2.5">
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="px-3 py-2.5"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </form>

      {/* Doctor Cards Marketplace Grid */}
      {loading ? (
        <LoadingSpinner message="Searching verified healthcare specialists..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description="We couldn't find any healthcare providers matching your search filters. Try clearing or broadening your criteria."
          actionLabel="Reset All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Showing {doctors.length} accredited doctors</span>
            <span className="text-teal-700 font-bold">100% Verified Profiles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl hover:border-teal-500/50 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Doctor Card Top */}
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80 truncate">
                        {doc.specialty}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 truncate">
                        {doc.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{doc.experience} Years Experience</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doc.description ||
                      'Specialized in diagnostic assessments, clinical evaluations, and ongoing patient care management.'}
                  </p>

                  {/* Clinic Facility Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{doc.clinicId?.name || 'Central Clinic'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 pl-5.5">
                      {doc.clinicId?.location || 'Hyderabad'}
                    </div>
                  </div>
                </div>

                {/* Footer Fee & CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Consultation Fee
                    </span>
                    <span className="text-base font-black text-slate-900">
                      ₹{doc.consultationFee || 500}
                    </span>
                  </div>

                  <Link to={`/doctors/${doc._id}`}>
                    <Button size="sm" variant="primary" className="shadow-xs">
                      <span>Book Visit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
