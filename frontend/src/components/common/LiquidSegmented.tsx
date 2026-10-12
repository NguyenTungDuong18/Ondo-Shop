import React, { useState, useEffect } from 'react';

export interface SegmentedOption<T = string> {
  label: string;
  value: T;
  icon?: React.ReactNode;
}

export interface LiquidSegmentedProps<T = string> {
  value?: T;
  defaultValue?: T;
  onChange?: (val: T) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  options: SegmentedOption<T>[];
  className?: string;
}

export function LiquidSegmented<T extends string = string>({
  value: controlledValue,
  defaultValue,
  onChange,
  label,
  size = 'sm',
  options,
  className = '',
}: LiquidSegmentedProps<T>) {
  const [internalValue, setInternalValue] = useState<T>(
    controlledValue ?? defaultValue ?? options[0]?.value
  );

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const activeValue = controlledValue ?? internalValue;
  const activeIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === activeValue)
  );

  const handleSelect = (val: T) => {
    if (controlledValue === undefined) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  const optionPadding = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  return (
    <div className={`inline-flex flex-col gap-1 select-none ${className}`}>
      {label && (
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </span>
      )}

      <div
        className="relative inline-flex items-center rounded-full transition-colors"
        role="group"
        aria-label={label}
        style={{
          padding: size === 'sm' ? '2px' : size === 'md' ? '4px' : '6px',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Animated Liquid Pill Active Highlight */}
        <div
          className="absolute rounded-full border shadow-sm transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
          style={{
            width: `calc((100% - 0.25rem) / ${options.length})`,
            left: `calc(0.125rem + (${activeIndex} * (100% - 0.25rem) / ${options.length}))`,
            top: '2px',
            bottom: '2px',
            backgroundColor: 'var(--surface-card)',
            borderColor: 'var(--border-default)',
          }}
        />

        {options.map((opt) => {
          const isActive = opt.value === activeValue;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              aria-pressed={isActive}
              className={`relative z-10 flex-1 inline-flex items-center justify-center gap-1.5 rounded-full font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                optionPadding[size]
              } ${
                isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]'
              }`}
            >
              {opt.icon && (
                <span className={`shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-70'}`}>
                  {opt.icon}
                </span>
              )}
              {opt.label && <span>{opt.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
