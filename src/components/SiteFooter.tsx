import { Link } from 'react-router-dom';

export const SiteFooter = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-lg">
          <div className="font-semibold tracking-[0.18em] text-slate-200">PROMPTSHIELD</div>
          <p className="mt-1 leading-6">
            Browser-first prompt sanitization for teams that want cleaner prompts and fewer accidental leaks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
          <Link to="/" className="transition hover:text-white">
            Home
          </Link>
          <Link to="/app" className="transition hover:text-white">
            Tool
          </Link>
          <a href="/#features" className="transition hover:text-white">
            Features
          </a>
          <a href="/#faq" className="transition hover:text-white">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
};
