import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { clinicService } from '../../services/clinicService';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import {
  Stethoscope,
  User,
  Mail,
  Phone,
  Building2,
  Award,
  Save,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

const DoctorProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();

  const [clinics, setClinics] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialty: user?.specialty || 'Cardiology',
    clinicId: user?.clinicId?._id || user?.clinicId || '',
    experience: user?.experience || 5,
    consultationFee: user?.consultationFee || 500,
    description: user?.description || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const res = await clinicService.getClinics();
        if (res.success) {
          setClinics(res.data);
          if (!formData.clinicId && res.data.length > 0) {
            setFormData((prev) => ({ ...prev, clinicId: res.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load clinics:', err);
      }
    };
    loadClinics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile(formData);
      if (res.success) {
        updateUser(res.data);
        showToast('Doctor profile and credentials updated successfully!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Professional Credentials
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
          Doctor Profile & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your specialty, hospital affiliation, consultation charges, and patient bio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Doctor Name"
            name="name"
            required
            icon={User}
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="Contact Phone"
            type="tel"
            name="phone"
            required
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Medical Specialty
            </label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium transition-all"
            >
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="General Physician">General Physician</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Affiliated Hospital / Clinic
            </label>
            <select
              name="clinicId"
              value={formData.clinicId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium transition-all"
            >
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.location})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Experience (Years)"
            type="number"
            min={0}
            name="experience"
            value={formData.experience}
            onChange={handleChange}
          />

          <Input
            label="Consultation Fee (₹)"
            type="number"
            min={0}
            name="consultationFee"
            value={formData.consultationFee}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Professional Summary / Bio
          </label>
          <textarea
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Qualifications, fellowship background, diagnostic expertise..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            loading={loading}
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfilePage;
