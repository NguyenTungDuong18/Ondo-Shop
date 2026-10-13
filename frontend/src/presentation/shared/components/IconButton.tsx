import React from 'react';

type IconButtonVariant = 'default' | 'danger' | 'ghost';
type IconButtonSize = 'xs' | 'sm' | 'md';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
  title?: string;
}

const sizeClasses: Record<IconButtonSize, string> = {
  xs: 'w-6 h-6 rounded-md',
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
};

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'default',
  size = 'sm',
  icon,
  title,
  className = '',
  ...rest
}) => {
  const variantClasses: Record<IconButtonVariant, string> = {
    default: [
      'bg-transparent',
      'text-[var(--text-secondary)]',
      'hover:bg-[var(--surface-raised)]',
      'hover:text-[var(--text-primary)]',
    ].join(' '),

    danger: [
      'bg-transparent',
      'text-[var(--text-secondary)]',
      'hover:bg-[var(--surface-modal-danger)]',
      'hover:text-[var(--text-danger)]',
    ].join(' '),

    ghost: [
      'bg-transparent',
      'text-[var(--text-secondary)]',
      'hover:bg-transparent',
      'hover:text-[var(--text-primary)]',
    ].join(' '),
  };

  return (
    <button
      type="button"
      title={title}
      className={[
        'inline-flex items-center justify-center',
        'transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        'border border-transparent',
        sizeClasses[size],
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon}
    </button>
  );
};
