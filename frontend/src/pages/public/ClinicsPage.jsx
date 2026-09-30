import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clinicService } from '../../services/clinicService';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Search,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const ClinicsPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (location) params.location = location;

      const res = await clinicService.getClinics(params);
      if (res.success) {
        setClinics(res.data);
      }
    } catch (err) {
      console.error('Failed to load clinics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClinics();
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Hospital & Medical Centers
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Partner Clinics & Hospitals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Discover certified medical facilities equipped with comprehensive multi-specialty departments and diagnostic centers.
        </p>
      </div>

      {/* Filter Toolbar */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 flex items-center px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 focus-within:border-teal-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinic by name, city, or address..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="sm:w-60 flex items-center px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 focus-within:border-teal-500 focus-within:bg-white transition-all">
          <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">All Locations</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" size="md" className="shrink-0">
            Search
          </Button>
          {(search || location) && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReset}
              className="shrink-0"
              title="Reset Search"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Clinics Grid */}
      {loading ? (
        <LoadingSpinner message="Loading clinic facilities..." />
      ) : clinics.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clinics found"
          description="We couldn't find any clinic facilities matching your search. Try changing the location filter."
          actionLabel="Reset Filter"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <div
              key={clinic._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl hover:border-teal-500/50 transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                    {clinic.location}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-800 transition-colors">
                    {clinic.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {clinic.description ||
                      'State-of-the-art medical hospital hub with specialized diagnostic and clinical care units.'}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{clinic.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{clinic.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{clinic.openingHours || '08:00 AM - 08:00 PM'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link to={`/clinics/${clinic._id}`}>
                  <Button variant="soft" size="md" className="w-full">
                    <span>View Doctors & Facility</span>
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

export default ClinicsPage;
