import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Search,
  Stethoscope,
  Building2,
  User,
  Filter,
  CheckCircle,
} from 'lucide-react';

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const { showToast } = useNotifications();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await appointmentService.getAppointments(params);
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await appointmentService.updateAppointmentStatus(id, status);
      if (res.success) {
        showToast(`Appointment status updated to ${status}`);
        fetchAppointments();
      }
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const filtered = appointments.filter((a) => {
    return (
      !search ||
      a.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.clinicId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.reason?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Platform Oversight
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
          Master Appointment Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all cross-clinic consultation bookings, scheduling statuses, and patient records
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, clinic, reason..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium transition-all"
          >
            <option value="">All Statuses</option>
            <option value="BOOKED">BOOKED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="RESCHEDULED">RESCHEDULED</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium transition-all"
          />
        </div>
      </div>

      {/* Master Ledger Table */}
      {loading ? (
        <LoadingSpinner message="Fetching appointment records..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="There are no appointment records matching the selected search criteria."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Doctor & Specialty</th>
                <th className="py-3 px-3">Hospital Hub</th>
                <th className="py-3 px-3">Schedule</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((appt) => (
                <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">
                      {appt.patientId?.name || 'Patient'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {appt.patientId?.phone || appt.patientId?.email}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-800 block">
                      {appt.doctorId?.name || 'Doctor'}
                    </span>
                    <span className="text-[10px] text-teal-700 font-bold">
                      {appt.doctorId?.specialty}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    <div className="font-medium">{appt.clinicId?.name}</div>
                    <span className="text-[10px] text-slate-400">{appt.clinicId?.location}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">
                    <span className="font-bold block">{appt.date}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {appt.startTime} - {appt.endTime}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge status={appt.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(appt.status) && (
                      <button
                        onClick={() => handleStatusUpdate(appt._id, 'CANCELLED')}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline"
                      >
                        Cancel Slot
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentsPage;
