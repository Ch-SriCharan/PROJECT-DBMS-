import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  User,
  Search,
  CheckCircle,
  FileEdit,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const { showToast } = useNotifications();

  // Notes & Status Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const openEditModal = (appt) => {
    setSelectedAppt(appt);
    setNewStatus(appt.status);
    setNotes(appt.notes || '');
    setEditModalOpen(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setSaving(true);
    try {
      const res = await appointmentService.updateAppointmentStatus(
        selectedAppt._id,
        newStatus,
        notes
      );
      if (res.success) {
        showToast('Appointment record updated successfully!');
        setEditModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update appointment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((appt) => {
    let matchesTab = true;
    if (statusTab === 'TODAY') {
      matchesTab = appt.date === todayStr;
    } else if (statusTab === 'UPCOMING') {
      matchesTab =
        appt.date > todayStr && ['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(appt.status);
    } else if (statusTab === 'COMPLETED') {
      matchesTab = appt.status === 'COMPLETED';
    } else if (statusTab === 'CANCELLED') {
      matchesTab = appt.status === 'CANCELLED';
    }

    const matchesSearch =
      !search ||
      appt.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      appt.reason?.toLowerCase().includes(search.toLowerCase()) ||
      appt.patientId?.phone?.includes(search);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Clinical Practice
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
          Patient Appointment Agenda
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review patient history, update consultation statuses, and write clinical notes & prescriptions
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-auto shadow-inner">
          {['ALL', 'TODAY', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                statusTab === tab
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name, phone, reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner message="Fetching consultation schedules..." />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={
            search
              ? 'No appointments matched your query.'
              : `There are no ${statusTab.toLowerCase()} appointments in your agenda.`
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt._id}
              className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-teal-500/40 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {appt.patientId?.name?.charAt(0) || 'P'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {appt.patientId?.name || 'Patient'}
                    </h4>
                    <Badge status={appt.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Reason:</span> {appt.reason}
                  </p>
                  {appt.notes && (
                    <p className="text-xs text-teal-800 bg-teal-50/80 px-3 py-1.5 rounded-xl border border-teal-200/60 mt-1 max-w-xl">
                      <span className="font-bold">Notes:</span> {appt.notes}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                    <span className="flex items-center space-x-1.5 font-bold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{appt.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{appt.startTime} - {appt.endTime}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.patientId?.phone}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="self-end md:self-center shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEditModal(appt)}>
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Update Status & Notes</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Status & Notes Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Manage Appointment Record"
      >
        <form onSubmit={handleSaveUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Appointment Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-semibold"
            >
              <option value="BOOKED">BOOKED (Awaiting Action)</option>
              <option value="CONFIRMED">CONFIRMED (Appointment Approved)</option>
              <option value="COMPLETED">COMPLETED (Consultation Finished)</option>
              <option value="CANCELLED">CANCELLED (Slot Released)</option>
              <option value="NO_SHOW">NO_SHOW (Patient did not attend)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Doctor Consultation Notes / Prescription
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record diagnostic findings, treatment instructions, prescribed medicines, or follow-up plan..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving} loading={saving}>
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorAppointmentsPage;
