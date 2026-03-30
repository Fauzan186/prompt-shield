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

const detectionLabels = ['API Keys', 'Tokens', 'Emails'];
const workflowSteps = [
  {
    label: 'Paste',
    detail: 'Drop in your prompt',
    style: 'border-sky-400/20 bg-sky-500/10 text-sky-200',
  },
  {
    label: 'Mode',
    detail: 'Mask or replace',
    style: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
  },
  {
    label: 'Scan',
    detail: 'Find sensitive data',
    style: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
  },
  {
    label: 'Copy',
    detail: 'Share clean text',
    style: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
  },
];

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
        <section className="pt-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(30,41,59,0.72))] px-5 py-6 shadow-panel backdrop-blur sm:px-6 lg:px-8">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/35 to-transparent" />
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative space-y-6">
              <div>
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-300">
                  PromptShield Workspace
                </span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-[2.2rem]">
                  Sanitize prompts quickly.
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                  A simple flow to clean sensitive prompt data before you share it.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {workflowSteps.map((item, index) => (
                  <div
                    key={item.label}
                    className={`relative rounded-[1.5rem] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${item.style}`}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">
                      0{index + 1}
                    </div>
                    <div className="mt-3 text-base font-semibold text-white">{item.label}</div>
                    <div className="mt-1 text-sm opacity-85">{item.detail}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {detectionLabels.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-slate-950/75 px-3.5 py-2 text-xs font-medium text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
          <div>
            <SectionCard
              title="Prompt Scanner"
              description="Paste content, choose a sanitization strategy, and generate a share-safe version."
            >
              <div className="space-y-6">
                <ModeToggle />
                <PromptForm />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Sanitized Output"
              description="Review the cleaned prompt and copy it when ready."
            >
              <SanitizedOutput />
            </SectionCard>

            <SectionCard
              title="Detected Items"
              description="Every match found in the original prompt is listed here for easy review."
            >
              <DetectedItemsList />
            </SectionCard>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
};
