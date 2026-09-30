import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5 font-bold',
    icon: 'p-2 rounded-xl',
  };

  const variantStyles = {
    primary:
      'bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/25 hover:shadow-md hover:shadow-teal-600/30 focus:ring-teal-500 border border-teal-500/20',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-sm shadow-slate-900/20 focus:ring-slate-700 border border-slate-800',
    soft:
      'bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200/80 focus:ring-teal-400',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs focus:ring-slate-300',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/25 focus:ring-rose-500 border border-rose-500/20',
    dangerSoft:
      'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 focus:ring-rose-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
