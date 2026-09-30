import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Stethoscope,
  Award,
  MapPin,
  Search,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Building2,
} from 'lucide-react';

const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useNotifications();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDoctors();
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDeleteDoctorConfirm = async () => {
    if (!doctorToDelete) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteUser(doctorToDelete._id);
      if (res.success) {
        showToast(`Doctor ${doctorToDelete.name} removed from medical faculty.`);
        setDeleteModalOpen(false);
        setDoctorToDelete(null);
        fetchDoctors();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove doctor', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    return (
      !search ||
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      doc.clinicId?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Medical Faculty
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Doctor & Specialist Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee practitioner accreditation, clinical specialties, and hospital clinic affiliations
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor or specialty..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching doctors..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description="There are no doctors registered matching your search query."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Doctor Profile</th>
                <th className="py-3 px-3">Specialty</th>
                <th className="py-3 px-3">Hospital Hub & City</th>
                <th className="py-3 px-3">Experience & Fee</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 font-extrabold flex items-center justify-center shrink-0 border border-teal-200/80">
                        {doc.name?.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">
                          {doc.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">{doc.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 inline-block text-[11px]">
                      {doc.specialty}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    <div className="font-bold text-slate-800">
                      {doc.clinicId?.name || 'Central Clinic'}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {doc.clinicId?.location || 'Hyderabad'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">
                    <div>{doc.experience} Years Exp.</div>
                    <span className="font-black text-slate-900">
                      ₹{doc.consultationFee || 500}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => {
                        setDoctorToDelete(doc);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Doctor Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Healthcare Provider"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to remove{' '}
              <span className="font-bold">{doctorToDelete?.name}</span>?
              Their published schedules and active appointments will be unassigned.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDeleteDoctorConfirm}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDoctorsPage;
