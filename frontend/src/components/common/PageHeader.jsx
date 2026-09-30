import React from 'react';

const PageHeader = ({
  badge,
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 gap-4 ${className}`}
    >
      <div className="space-y-1">
        {badge && (
          <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-teal-600">
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
