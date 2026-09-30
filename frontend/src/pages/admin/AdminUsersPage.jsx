import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { Users, Search, Trash2, Shield, User, Stethoscope, AlertCircle } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const { showToast } = useNotifications();

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(roleFilter);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteUser(userToDelete._id);
      if (res.success) {
        showToast(`User ${userToDelete.name} deleted.`);
        setDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    return (
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Identity Management
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
          User Account Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect, filter, and manage registered patient accounts, doctor profiles, and administrators
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-auto shadow-inner">
          {['', 'PATIENT', 'DOCTOR', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                roleFilter === r
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r ? r.toLowerCase() + 's' : 'All Accounts'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Fetching user directory..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="There are no user accounts matching the selected filter."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">User Profile</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Contact Details</th>
                <th className="py-3 px-3">Registered Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-black flex items-center justify-center shrink-0 border border-slate-200">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">{u.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge variant="role" size="sm">
                      {u.role}
                    </Badge>
                    {u.role === 'DOCTOR' && u.specialty && (
                      <span className="text-[10px] text-teal-700 block mt-1 font-bold">
                        {u.specialty}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    {u.phone}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => {
                          setUserToDelete(u);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User Account"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to permanently delete the account for{' '}
              <span className="font-bold">{userToDelete?.name}</span> ({userToDelete?.email})?
              This action cannot be undone.
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
              onClick={handleDeleteUserConfirm}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
