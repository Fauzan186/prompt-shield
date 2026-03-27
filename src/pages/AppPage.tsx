import { AnimatedBackground } from '@/components/AnimatedBackground';
import { DetectedItemsList } from '@/components/DetectedItemsList';
import { ModeToggle } from '@/components/ModeToggle';
import { PromptForm } from '@/components/PromptForm';
import { SanitizedOutput } from '@/components/SanitizedOutput';
import { SectionCard } from '@/components/SectionCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const appTitle = 'PromptShield App | Sanitize Prompts in Browser';
const appDescription =
  'Use the PromptShield app to scan prompts for API keys, emails, phone numbers, URLs, credit cards, and access tokens, then copy a sanitized version.';

const detectionLabels = ['API Keys', 'Emails', 'Phones', 'URLs', 'Cards', 'Tokens'];

export const AppPage = () => {
  useDocumentMetadata({
    title: appTitle,
    description: appDescription,
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackground variant="app" />
      <SiteHeader showAppCta={false} compact />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="pt-10">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
              Prompt Sanitization Tool
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Scan and sanitize prompts.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Paste a prompt, pick a mode, and copy the cleaned result. The tool stays focused on the task.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {detectionLabels.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-sm text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

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
              description="Review the cleaned prompt and copy it when ready."
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

      <SiteFooter />
    </main>
  );
};
