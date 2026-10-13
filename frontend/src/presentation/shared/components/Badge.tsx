import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const isDotVariant = ['success', 'warning', 'error', 'info', 'neutral'].includes(variant);

  const dotColors = {
    success: 'bg-[var(--text-success)]',
    warning: 'bg-[var(--text-warning)]',
    error: 'bg-[var(--text-danger)]',
    info: 'bg-[var(--text-info)]',
    neutral: 'bg-[var(--text-muted)]',
  };

  const textColors = {
    success: 'text-[var(--text-success)] font-bold',
    warning: 'text-[var(--text-warning)] font-bold',
    error: 'text-[var(--text-danger)] font-bold',
    info: 'text-[var(--text-info)] font-bold',
    purple: 'onda-badge-purple font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
    neutral: 'text-[var(--text-secondary)] font-medium',
  };

  if (!isDotVariant) {
    return (
      <span className={`inline-flex items-center text-xs font-mono ${textColors[variant]} ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono ${textColors[variant]} ${className}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[variant as keyof typeof dotColors]}`} />
      <span>{children}</span>
    </span>
  );
};
