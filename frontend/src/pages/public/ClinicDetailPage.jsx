import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clinicService } from '../../services/clinicService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Stethoscope,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Award,
  ShieldCheck,
} from 'lucide-react';

const ClinicDetailPage = () => {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinic = async () => {
      setLoading(true);
      try {
        const res = await clinicService.getClinicById(id);
        if (res.success) {
          setClinic(res.data);
        }
      } catch (err) {
        console.error('Failed to load clinic:', err);
      } finally {
        setLoading(false);
      }
    };
    loadClinic();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading clinic and medical staff..." />;
  }

  if (!clinic) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-800">Clinic not found</h3>
        <Link to="/clinics" className="mt-4 inline-block text-xs font-bold text-teal-600">
          Back to Clinics Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link to="/clinics" className="hover:text-teal-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Clinics</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">{clinic.name}</span>
      </div>

      {/* Facility Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-teal-600/20 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                {clinic.location}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{clinic.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {clinic.description ||
                  'Comprehensive hospital campus housing advanced diagnostic laboratories, specialty consulting suites, and emergency treatment infrastructure.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Campus Location</span>
              <span className="text-slate-500 leading-snug">{clinic.address}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Contact & Helpline</span>
              <span className="text-slate-500">{clinic.phone}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Operating Hours</span>
              <span className="text-slate-500">{clinic.openingHours || '08:00 AM - 08:00 PM'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Affiliated Doctors Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Specialists Practicing at this Facility ({clinic.doctors?.length || 0})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a certified consultant below to view available appointment slots
          </p>
        </div>

        {!clinic.doctors || clinic.doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">
              No doctors currently listed for this hospital facility.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinic.doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg hover:border-teal-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200/80">
                        {doc.specialty}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-1">{doc.name}</h3>
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{doc.experience} Years Exp.</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doc.description ||
                      'Specialized in diagnostic assessments, clinical evaluations, and ongoing patient care.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                      Fee
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{doc.consultationFee || 500}
                    </span>
                  </div>

                  <Link to={`/doctors/${doc._id}`}>
                    <Button size="sm" variant="primary">
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicDetailPage;
