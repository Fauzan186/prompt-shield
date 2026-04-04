import { Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { BUILT_IN_PATTERN_COUNT } from '@/features/prompt/builtInPatterns';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const appName = import.meta.env.VITE_APP_NAME ?? 'PromptShield';
const landingTitle = import.meta.env.VITE_APP_TITLE ?? 'PromptShield | AI Prompt Sanitizer';
const landingDescription =
  'PromptShield is an AI prompt sanitizer that helps teams remove API keys, tokens, emails, phone numbers, URLs, and credit card numbers before prompts are shared.';

const heroStats = [
  { value: `${BUILT_IN_PATTERN_COUNT}+`, label: 'Sensitive patterns' },
  { value: '3', label: 'Sanitization modes' },
  { value: '100%', label: 'Browser-based flow' },
];

const featureCards = [
  {
    title: 'Catch hidden prompt leaks',
    description:
      'Detect API keys, emails, phone numbers, URLs, access tokens, and card-like values before they leave your workspace.',
  },
  {
    title: 'Choose how data is handled',
    description:
      'Mask values, replace them with readable labels, or remove them completely based on how strict the share flow needs to be.',
  },
  {
    title: 'Review before you copy',
    description:
      'See the cleaned prompt and every detected match together, so there is no guesswork before sharing.',
  },
];

const workflowItems = [
  {
    step: '01',
    title: 'Paste',
    description: 'Drop in a prompt, support note, transcript, or internal AI draft.',
  },
  {
    step: '02',
    title: 'Sanitize',
    description: 'Pick mask, replace, or remove and run a browser-side scan.',
  },
  {
    step: '03',
    title: 'Share',
    description: 'Copy a safer version for teammates, tickets, docs, or AI tools.',
  },
];

const useCases = [
  {
    title: 'Support and operations',
    description:
      'Clean customer notes, escalation details, and internal references before using AI for summaries or replies.',
  },
  {
    title: 'Engineering and product',
    description:
      'Strip tokens, URLs, emails, and environment hints before sharing prompts in copilots, docs, or bug reports.',
  },
  {
    title: 'Consulting and client work',
    description:
      'Protect client data while still using AI to refine examples, analysis, and deliverable drafts.',
  },
];

const trustCards = [
  {
    title: 'Browser-first privacy',
    description: 'PromptShield runs locally in the browser and does not send prompt data to a backend.',
  },
  {
    title: 'Fast enough for daily work',
    description: 'Built for teams that need a practical prompt check before copy, share, or handoff.',
  },
  {
    title: 'Clear and readable output',
    description: 'Sanitized prompts stay useful for collaboration, debugging, and AI assistance.',
  },
];

const faqItems = [
  {
    question: 'What is PromptShield used for?',
    answer:
      'PromptShield is used to sanitize prompts before sharing them with AI tools, coworkers, vendors, or public examples.',
  },
  {
    question: 'Does PromptShield send prompt data anywhere?',
    answer:
      'No. PromptShield is designed as a browser-first experience, so prompt data is not sent to a backend by the app.',
  },
  {
    question: 'Who is it best for?',
    answer:
      'It is useful for support, operations, engineering, product, consulting, and any workflow where prompts may contain sensitive values.',
  },
];

export const LandingPage = () => {
  useDocumentMetadata({
    title: landingTitle,
    description: landingDescription,
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackground variant="landing" />
      <SiteHeader />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <section className="grid gap-12 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pt-16">
          <div>
            <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
              AI Prompt Sanitizer
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Clean prompts before secrets become someone else&apos;s problem.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {appName} helps teams sanitize prompt content before it gets pasted into AI tools,
              tickets, docs, or shared examples. Catch sensitive values early and share with more
              confidence.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-full border border-accent-400/20 bg-[linear-gradient(135deg,rgba(255,107,87,0.96),rgba(244,63,94,0.92))] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,107,87,0.18)] transition duration-200 hover:brightness-105 hover:shadow-[0_16px_36px_rgba(255,107,87,0.24)]"
              >
                Open Tool
              </Link>
              <a href="#features" className="rounded-full">
                <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/5 hover:text-white">
                  Explore Features
                </span>
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur"
                >
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-orange-400/20 via-rose-500/10 to-cyan-400/5 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/65 shadow-panel backdrop-blur">
              <div className="border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">PromptShield Preview</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                      Safe prompt flow
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                    <span className="h-3 w-3 rounded-full bg-orange-400/80" />
                    <span className="h-3 w-3 rounded-full bg-cyan-400/80" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6">
                <div className="rounded-3xl border border-rose-500/15 bg-rose-500/8 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-rose-200/80">Detected</div>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Use <span className="text-rose-200">sk-prod-84jd92ksl2n2</span>, email{' '}
                    <span className="text-rose-200">finance@company.com</span>, and token=
                    <span className="text-rose-200">eyJhbGciOi...</span>
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {['Mask', 'Replace', 'Remove'].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-orange-400/15 bg-orange-400/10 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-orange-200/80">Ready To Share</div>
                  <p className="mt-3 text-sm leading-7 text-orange-50">
                    Use <span className="font-semibold">[API_KEY]</span>, email{' '}
                    <span className="font-semibold">[EMAIL]</span>, and{' '}
                    <span className="font-semibold">[TOKEN]</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(6,78,59,0.28),rgba(15,23,42,0.48))] shadow-[0_18px_42px_rgba(16,185,129,0.10)] backdrop-blur">
            <div className="grid gap-0 lg:grid-cols-[0.75fr_1.25fr]">
              <div className="border-b border-emerald-400/15 p-6 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10">
                    <span className="privacy-pulse inline-flex h-3.5 w-3.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.6)]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                      Privacy First
                    </div>
                    <div className="mt-1 text-xl font-semibold text-white">
                      Your prompt stays in the browser
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="max-w-3xl text-sm leading-8 text-emerald-50 md:text-[15px]">
                  PromptShield processes prompt content locally in the browser before you copy or
                  share it. The app does not send your prompt data to a backend, database, or
                  external service, which makes it a safer fit for internal notes, support
                  transcripts, engineering prompts, and client-facing workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Why teams trust PromptShield
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Built for practical prompt hygiene, not just one-off redaction.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {trustCards.map((card) => (
              <SectionCard key={card.title} title={card.title} description={card.description}>
                <div className="text-sm leading-7 text-slate-300">
                  Designed for real workflows where prompts move quickly and sensitive values should not.
                </div>
              </SectionCard>
            ))}
          </div>
        </section>

        <section id="features" className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Core product benefits
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Keep the workflow simple while making prompt sharing safer.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => (
              <SectionCard key={card.title} title={card.title} description={card.description}>
                <div className="text-sm leading-7 text-slate-300">
                  PromptShield helps teams move fast without pasting secrets into the wrong place.
                </div>
              </SectionCard>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <SectionCard
            title="How It Works"
            description="A short workflow that fits directly into day-to-day prompt sharing."
          >
            <div className="space-y-4">
              {workflowItems.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent-400/20 bg-accent-500/10 text-sm font-semibold text-accent-300">
                    {item.step}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <p className="mt-1 text-sm leading-7 text-slate-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Where PromptShield Fits"
            description="Useful whenever prompt content crosses team, tool, or client boundaries."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {useCases.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-5"
                >
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 md:col-span-2">
                <div className="text-sm font-semibold text-white">Common prompt risks covered</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  API keys, emails, phone numbers, URLs, credit cards, and tokens can all be
                  detected before a prompt is copied or shared.
                </p>
              </div>
            </div>
          </SectionCard>
        </section>

        <section id="faq" className="mt-20 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title="Frequently Asked Questions"
            description="Quick answers for teams comparing prompt privacy tools."
          >
            <div className="space-y-4">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-5"
                >
                  <h3 className="text-sm font-semibold text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Ready to try it?"
            description="Open the app and sanitize a prompt in a few seconds."
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                {['API keys', 'Emails', 'Phone numbers', 'URLs', 'Credit cards', 'Tokens'].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-full border border-accent-400/20 bg-[linear-gradient(135deg,rgba(255,107,87,0.96),rgba(244,63,94,0.92))] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,107,87,0.18)] transition duration-200 hover:brightness-105 hover:shadow-[0_16px_36px_rgba(255,107,87,0.24)]"
              >
                Launch PromptShield
              </Link>
            </div>
          </SectionCard>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
};
