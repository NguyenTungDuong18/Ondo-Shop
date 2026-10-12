import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <Loader2 className={`${sizeMap[size]} animate-spin`} style={{ color: 'var(--text-muted)' }} />
      {label && <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-14 rounded-xl w-full"
          style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
          }}
        />
      ))}
    </div>
  );
};
