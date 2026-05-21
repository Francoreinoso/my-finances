import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** 'md' por defecto; 'sm' para contextos densos como filas de tabla. */
  size?: Size;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-accent text-text-primary hover:bg-accent-soft hover:text-bg-primary',
  secondary: 'bg-bg-elevated text-text-primary hover:bg-border-strong',
  ghost: 'bg-transparent text-text-muted hover:bg-bg-elevated hover:text-text-primary',
  danger: 'bg-transparent text-danger hover:bg-bg-elevated',
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        SIZE_STYLES[size],
        'transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_STYLES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}
