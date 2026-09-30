import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 animate-fadeIn">
      <div className="relative flex items-center justify-center">
        <Loader2
          className={`${sizeClasses[size] || sizeClasses.md} text-teal-600 animate-spin`}
        />
      </div>
      {message && (
        <p className="text-xs font-semibold text-slate-500 tracking-wide">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-xs flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
