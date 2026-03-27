import { Link, NavLink } from 'react-router-dom';

interface SiteHeaderProps {
  showAppCta?: boolean;
  compact?: boolean;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`;

export const SiteHeader = ({ showAppCta = true, compact = false }: SiteHeaderProps) => {
  return (
    <header className="relative z-20">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-slate-950/55 px-4 py-3 shadow-panel backdrop-blur md:px-6">
          <Link to="/" className="inline-flex items-center gap-3 text-white">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-sm font-bold text-emerald-200">
              PS
            </span>
            <div>
              <div className="text-sm font-semibold tracking-[0.18em] text-slate-200">PROMPTSHIELD</div>
              {!compact ? <div className="text-xs text-slate-500">AI Prompt Security</div> : null}
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <a href="/#features" className="text-slate-400 transition hover:text-white">
              Features
            </a>
            <a href="/#faq" className="text-slate-400 transition hover:text-white">
              FAQ
            </a>
            <NavLink to="/app" className={navLinkClass}>
              Tool
            </NavLink>
          </nav>

          {showAppCta ? (
            <Link
              to="/app"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Open Tool
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
            >
              Back Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
