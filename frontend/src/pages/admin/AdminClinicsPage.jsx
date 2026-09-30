import React, { useState, useEffect } from 'react';
import { clinicService } from '../../services/clinicService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Building2,
  PlusCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  Trash2,
  Edit,
  AlertCircle,
} from 'lucide-react';

const AdminClinicsPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: 'Hyderabad',
    address: '',
    phone: '',
    email: '',
    description: '',
    openingHours: '08:00 AM - 08:00 PM',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useNotifications();

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await clinicService.getClinics();
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
  }, []);

  const handleOpenAdd = () => {
    setEditingClinic(null);
    setFormData({
      name: '',
      location: 'Hyderabad',
      address: '',
      phone: '',
      email: '',
      description: '',
      openingHours: '08:00 AM - 08:00 PM',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      location: clinic.location,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      description: clinic.description || '',
      openingHours: clinic.openingHours || '08:00 AM - 08:00 PM',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingClinic) {
        const res = await clinicService.updateClinic(editingClinic._id, formData);
        if (res.success) {
          showToast('Clinic facility updated successfully!');
        }
      } else {
        const res = await clinicService.createClinic(formData);
        if (res.success) {
          showToast('New clinic facility registered successfully!');
        }
      }
      setModalOpen(false);
      fetchClinics();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClinicConfirm = async () => {
    if (!clinicToDelete) return;
    setDeleting(true);
    try {
      const res = await clinicService.deleteClinic(clinicToDelete._id);
      if (res.success) {
        showToast(`Clinic ${clinicToDelete.name} deleted.`);
        setDeleteModalOpen(false);
        setClinicToDelete(null);
        fetchClinics();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete clinic', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Infrastructure & Facilities
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Hospital & Clinic Facilities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register and manage hospital campuses, city departments, contact lines, and working hours
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={handleOpenAdd} className="self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          <span>Register New Clinic</span>
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading clinic network..." />
      ) : clinics.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clinic facilities registered"
          description="Click the button above to register your first partner hospital or clinic."
          actionLabel="Add Clinic"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Clinic Facility</th>
                <th className="py-3 px-3">City & Campus Address</th>
                <th className="py-3 px-3">Contact & Email</th>
                <th className="py-3 px-3">Operating Hours</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clinics.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 font-extrabold flex items-center justify-center shrink-0 border border-purple-200/80">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">{c.name}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {c.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    <span className="font-extrabold text-slate-900 block">{c.location}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{c.address}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    <div className="font-bold text-slate-800">{c.phone}</div>
                    <span className="text-[11px] text-slate-400 font-mono">{c.email}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    {c.openingHours}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                        title="Edit Clinic"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setClinicToDelete(c);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Clinic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Clinic Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClinic ? 'Edit Clinic Facility' : 'Register New Hospital Hub'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Clinic / Hospital Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apollo Health City"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City / Location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Hyderabad"
            />

            <Input
              label="Contact Phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 40 2360 7777"
            />
          </div>

          <Input
            label="Campus Street Address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Road No 72, Jubilee Hills..."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Official Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@apollo.com"
            />

            <Input
              label="Operating Hours"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              placeholder="08:00 AM - 08:00 PM"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Facility Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of medical specialties, emergency trauma, imaging..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              loading={submitting}
            >
              {editingClinic ? 'Update Facility' : 'Create Clinic Hub'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Clinic Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Clinic Facility"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold">{clinicToDelete?.name}</span>?
              Doctors affiliated with this hospital will need to be reassigned.
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
              onClick={handleDeleteClinicConfirm}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminClinicsPage;
