import { Link } from 'react-router-dom';

interface BrandProps {
  compact?: boolean;
  linked?: boolean;
  className?: string;
}

const BrandContent = ({ compact = false }: { compact?: boolean }) => (
  <>
    <img
      src="/logo-mark.svg"
      alt="PromptShield logo"
      className="h-11 w-11 rounded-2xl shadow-[0_10px_28px_rgba(249,115,22,0.16)]"
    />
    <div>
      <div className="text-sm font-semibold tracking-[0.18em] text-slate-100">PROMPTSHIELD</div>
      {!compact ? <div className="text-xs text-slate-500">Prompt privacy for modern AI workflows</div> : null}
    </div>
  </>
);

export const Brand = ({ compact = false, linked = false, className = '' }: BrandProps) => {
  const classes = `inline-flex items-center gap-3 ${className}`.trim();

  if (linked) {
    return (
      <Link to="/" className={classes}>
        <BrandContent compact={compact} />
      </Link>
    );
  }

  return (
    <div className={classes}>
      <BrandContent compact={compact} />
    </div>
  );
};
