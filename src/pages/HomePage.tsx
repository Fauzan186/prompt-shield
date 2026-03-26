import { useEffect } from 'react';
import { DetectedItemsList } from '@/components/DetectedItemsList';
import { ModeToggle } from '@/components/ModeToggle';
import { PromptForm } from '@/components/PromptForm';
import { SanitizedOutput } from '@/components/SanitizedOutput';
import { SectionCard } from '@/components/SectionCard';

const appName = import.meta.env.VITE_APP_NAME ?? 'PromptShield';
const appTitle = import.meta.env.VITE_APP_TITLE ?? 'Prompt Sanitizer';

export const HomePage = () => {
  useEffect(() => {
    document.title = appTitle;
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_32%)]" />
      <div className="absolute inset-0 bg-grid-fade bg-[size:44px_44px] opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent-300">
            Browser-only prompt protection
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {appName}
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">{appTitle}</p>
          <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
            Clean prompts before you share them. PromptShield detects secrets, emails,
            phone numbers, and URLs, then sanitizes them with the mode you choose.
          </p>
        </header>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionCard
              title="Prompt Scanner"
              description="Paste content, choose a sanitization strategy, and generate a share-safe version."
            >
              <div className="space-y-6">
                <ModeToggle />
                <PromptForm />
              </div>
            </SectionCard>

            <SectionCard
              title="Sanitized Output"
              description="Review the transformed prompt and copy it directly to your clipboard."
            >
              <SanitizedOutput />
            </SectionCard>
          </div>

          <SectionCard
            title="Detected Items"
            description="Every match found in the original prompt is listed here for easy review."
          >
            <DetectedItemsList />
          </SectionCard>
        </div>
      </div>
    </main>
  );
};
