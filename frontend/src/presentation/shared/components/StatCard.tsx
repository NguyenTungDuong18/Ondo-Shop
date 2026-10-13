import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-amber-100/80 dark:bg-amber-900/30',
      text: 'text-amber-800 dark:text-amber-400',
      border: 'hover:border-amber-700/40',
    },
    emerald: {
      bg: 'bg-emerald-100/80 dark:bg-emerald-900/30',
      text: 'text-emerald-800 dark:text-emerald-400',
      border: 'hover:border-emerald-600/40',
    },
    amber: {
      bg: 'bg-orange-100/80 dark:bg-orange-900/30',
      text: 'text-orange-800 dark:text-orange-400',
      border: 'hover:border-orange-600/40',
    },
    purple: {
      bg: 'bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)]',
      text: 'text-[var(--text-primary)] dark:text-[var(--text-primary)]',
      border: 'hover:border-[var(--border-strong)]',
    },
    rose: {
      bg: 'bg-rose-100/80 dark:bg-rose-900/30',
      text: 'text-rose-800 dark:text-rose-400',
      border: 'hover:border-rose-400/40',
    },
  };

  const current = colorMap[color];

  return (
    <div
      className={`onda-modal p-6 relative overflow-hidden transition-all duration-300 ${current.border}`}
    >
      <div
        className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl opacity-60"
        style={{
          background: `linear-gradient(135deg, var(--surface-raised) 0%, transparent 100%)`,
        }}
      />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">{subtitle}</p>}
        </div>

        <div className={`p-3.5 rounded-2xl shrink-0 ${current.bg} ${current.text}`}
          style={{ border: '1px solid var(--border-default)' }}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
