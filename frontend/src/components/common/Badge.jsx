import React from 'react';

const Badge = ({ status, children, variant, size = 'md', className = '' }) => {
  const rawText = (status || children || '').toString();
  const normalized = rawText.toUpperCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs',
  };

  const getRoleStyle = () => {
    switch (normalized) {
      case 'ADMIN':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200/80',
          dot: 'bg-purple-500',
        };
      case 'DOCTOR':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200/80',
          dot: 'bg-teal-500',
        };
      case 'PATIENT':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
          dot: 'bg-blue-500',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const getStatusStyle = () => {
    switch (normalized) {
      case 'CONFIRMED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'BOOKED':
        return {
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
          dot: 'bg-cyan-500',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200/80',
          dot: 'bg-teal-500',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
          dot: 'bg-rose-500',
        };
      case 'RESCHEDULED':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
        };
      case 'NO_SHOW':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
        };
      case 'READ':
        return {
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
      case 'UNREAD':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-500 animate-pulse',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const { bg, dot } = variant === 'role' ? getRoleStyle() : getStatusStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border transition-colors select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span>{children || rawText || normalized}</span>
    </span>
  );
};

export default Badge;
