import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      wrapperClassName = '',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 ${wrapperClassName}`}>
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-2xs">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            required={required}
            className={`w-full rounded-xl bg-slate-50/70 border text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:bg-white focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
              Icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5'
            } ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 hover:border-slate-300'
            } ${className}`}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-[11px] font-medium text-rose-600 animate-fadeIn">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
