import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--btn-primary-bg)]',
    'text-[var(--btn-primary-text)]',
    'border-[var(--btn-primary-border)]',
    'hover:bg-[var(--btn-primary-bg-hover)]',
    'hover:border-[var(--btn-primary-bg-hover)]',
    'shadow-sm',
  ].join(' '),

  secondary: [
    'bg-[var(--btn-secondary-bg)]',
    'text-[var(--btn-secondary-text)]',
    'border-[var(--btn-secondary-border)]',
    'hover:bg-[var(--btn-secondary-bg-hover)]',
    'shadow-sm',
  ].join(' '),

  outline: [
    'bg-[var(--btn-outline-bg)]',
    'text-[var(--btn-outline-text)]',
    'border-[var(--btn-outline-border)]',
    'hover:bg-[var(--btn-outline-bg-hover)]',
    'hover:border-[var(--btn-outline-border-hover)]',
  ].join(' '),

  ghost: [
    'bg-[var(--btn-ghost-bg)]',
    'text-[var(--btn-ghost-text)]',
    'border-[var(--btn-ghost-border)]',
    'hover:bg-[var(--btn-ghost-bg-hover)]',
    'hover:text-[var(--btn-ghost-text-hover)]',
  ].join(' '),

  danger: [
    'bg-[var(--btn-danger-bg)]',
    'text-[var(--btn-danger-text)]',
    'border-transparent',
    'hover:bg-[var(--btn-danger-bg-hover)]',
    'shadow-sm',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-[10px] gap-1.5 rounded-lg',
  sm: 'px-3.5 py-2 text-xs gap-1.5 rounded-xl',
  md: 'px-5 py-2.5 text-xs gap-2 rounded-xl',
  lg: 'px-8 py-3.5 text-sm gap-2 rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      icon,
      iconRight,
      children,
      className = '',
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider',
          'border transition-all duration-200 cursor-pointer select-none',
          'active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:active:translate-y-0',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
