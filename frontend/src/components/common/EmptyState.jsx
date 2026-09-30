import React from 'react';
import { Calendar, Search } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Calendar,
  title = 'No items found',
  description = 'There are no records matching the selected criteria.',
  actionLabel,
  onAction,
  actionLink,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-14 px-6 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center max-w-lg mx-auto my-4 animate-fadeIn ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 shadow-sm border border-slate-200/80 flex items-center justify-center mb-3.5">
        <Icon className="w-7 h-7 text-teal-600/70" />
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-5">{description}</p>

      {actionLabel && (
        <>
          {actionLink ? (
            <a href={actionLink}>
              <Button size="sm" variant="primary">
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EmptyState;
