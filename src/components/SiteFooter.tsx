import { Link } from 'react-router-dom';

export const SiteFooter = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div className="font-semibold tracking-[0.18em] text-slate-200">PROMPTSHIELD</div>
          <p className="mt-2 max-w-xl leading-7">
            Browser-first prompt sanitization for teams that want cleaner prompts and fewer accidental leaks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
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
