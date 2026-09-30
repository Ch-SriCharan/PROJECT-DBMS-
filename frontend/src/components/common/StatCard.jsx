import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  className = '',
}) => {
  const variantStyles = {
    default: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBox: 'bg-slate-100 text-slate-700',
      value: 'text-slate-900',
      title: 'text-slate-500',
    },
    teal: {
      bg: 'bg-white',
      border: 'border-teal-200/70',
      iconBox: 'bg-teal-50 text-teal-700',
      value: 'text-teal-900',
      title: 'text-teal-700',
    },
    blue: {
      bg: 'bg-white',
      border: 'border-blue-200/70',
      iconBox: 'bg-blue-50 text-blue-700',
      value: 'text-blue-900',
      title: 'text-blue-700',
    },
    purple: {
      bg: 'bg-white',
      border: 'border-purple-200/70',
      iconBox: 'bg-purple-50 text-purple-700',
      value: 'text-purple-900',
      title: 'text-purple-700',
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-emerald-200/70',
      iconBox: 'bg-emerald-50 text-emerald-700',
      value: 'text-emerald-900',
      title: 'text-emerald-700',
    },
    rose: {
      bg: 'bg-white',
      border: 'border-rose-200/70',
      iconBox: 'bg-rose-50 text-rose-700',
      value: 'text-rose-900',
      title: 'text-rose-700',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`rounded-2xl border p-5 shadow-xs transition-all duration-200 hover:shadow-md ${style.bg} ${style.border} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${style.title}`}>
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBox}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.value}`}>
          {value}
        </div>
        {trend && (
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
