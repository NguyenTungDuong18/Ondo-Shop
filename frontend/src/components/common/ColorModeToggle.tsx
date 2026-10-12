import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ColorModeToggleProps {
  value: 'light' | 'dark';
  onChange: (val: 'light' | 'dark') => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: {
    wrapper: 'p-0.5',
    indicator: 'w-7 h-7',
    button: 'p-1.5 text-[11px]',
    gap: 'gap-1',
  },
  md: {
    wrapper: 'p-1',
    indicator: 'w-9 h-9',
    button: 'p-2 text-xs',
    gap: 'gap-1.5',
  },
  lg: {
    wrapper: 'p-1.5',
    indicator: 'w-11 h-11',
    button: 'p-2.5 text-sm',
    gap: 'gap-2',
  },
};

export const ColorModeToggle: React.FC<ColorModeToggleProps> = ({
  value,
  onChange,
  size = 'sm',
  className = '',
}) => {
  const cfg = sizeConfig[size];
  const isDark = value === 'dark';

  return (
    <div className={`inline-flex flex-col gap-1 select-none ${className}`}>
      <div
        className={`relative inline-flex items-center ${cfg.wrapper} bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-full`}
        role="group"
        aria-label="Color mode"
      >
        {/* Animated pill */}
        <div
          className={`absolute rounded-full shadow-sm transition-all duration-300 ease-out ${cfg.indicator}`}
          style={{
            left: '2px',
            top: '50%',
            transform: isDark
              ? `translateY(-50%) translateX(calc(100% + 2px))`
              : `translateY(-50%) translateX(0)`,
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />

        <button
          type="button"
          onClick={() => onChange('light')}
          aria-pressed={!isDark}
          className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${cfg.button}`}
          style={{
            color: !isDark ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
          title="Switch to Light Mode"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onChange('dark')}
          aria-pressed={isDark}
          className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${cfg.button}`}
          style={{
            color: isDark ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
          title="Switch to Dark Mode"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
