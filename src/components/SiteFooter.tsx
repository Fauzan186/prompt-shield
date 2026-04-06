import { Link } from 'react-router-dom';
import { Brand } from '@/components/Brand';

export const SiteFooter = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between">
          <Brand className="text-white" compact />
          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <Link to="/prompt-sanitizer" className="transition hover:text-white">
              Tool
            </Link>
            <a href="/#features" className="transition hover:text-white">
              Features
            </a>
            <a href="/#faq" className="transition hover:text-white">
              FAQ
            </a>
            <Link to="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link to="/contact" className="transition hover:text-white">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-white/8 pt-3 text-[11px] leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl">PromptShield helps catch sensitive data, but a quick manual review is still recommended before sending.</p>
          <p className="shrink-0 text-slate-600">Runs in your browser.</p>
        </div>
      </div>
    </footer>
  );
};
