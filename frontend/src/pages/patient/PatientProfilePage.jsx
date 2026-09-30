import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { User, Mail, Phone, ShieldCheck, Save, CheckCircle } from 'lucide-react';

const PatientProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile({ name, phone });
      if (res.success) {
        updateUser(res.data);
        showToast('Profile updated successfully!');
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
          Account Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
          Patient Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your contact credentials used for appointment reminders and doctor communications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <Input
          label="Full Name"
          type="text"
          required
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email Address (Account Identifier)"
          type="email"
          disabled
          icon={Mail}
          value={user?.email || ''}
          helperText="Email is permanently bound to your clinical health records."
        />

        <Input
          label="Phone Number"
          type="tel"
          required
          icon={Phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          helperText="Used for automated SMS & visit reminder alerts."
        />

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

export default PatientProfilePage;
