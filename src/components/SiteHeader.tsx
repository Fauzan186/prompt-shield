import { Link, NavLink } from 'react-router-dom';
import { Brand } from '@/components/Brand';
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
          <Brand linked compact={compact} className="text-white" />

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
              className="inline-flex items-center justify-center rounded-full border border-accent-400/20 bg-[linear-gradient(135deg,rgba(255,107,87,0.96),rgba(244,63,94,0.92))] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,107,87,0.18)] transition duration-200 hover:brightness-105 hover:shadow-[0_16px_36px_rgba(255,107,87,0.24)]"
            >
              Open Tool
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/75 px-4 py-2 text-sm font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition duration-200 hover:border-white/20 hover:bg-slate-800 hover:text-white"
            >
              Back Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
