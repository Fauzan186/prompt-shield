import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'reset';

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-accent-400/20 bg-[linear-gradient(135deg,rgba(255,107,87,0.96),rgba(244,63,94,0.92))] text-white shadow-[0_12px_30px_rgba(255,107,87,0.18)] hover:brightness-105 hover:shadow-[0_16px_36px_rgba(255,107,87,0.24)] hover:text-white',
  secondary:
    'border border-white/10 bg-slate-900/75 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/20 hover:bg-slate-800 hover:text-white',
  reset:
    'border border-slate-800 bg-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900/70 hover:text-white',
};

export const Button = ({
  variant = 'secondary',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-transparent disabled:text-slate-500 disabled:shadow-none disabled:hover:bg-transparent ${fullWidth ? 'w-full' : ''} ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
