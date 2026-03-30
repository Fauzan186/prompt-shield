import { Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const appName = import.meta.env.VITE_APP_NAME ?? 'PromptShield';
const landingTitle = import.meta.env.VITE_APP_TITLE ?? 'PromptShield | AI Prompt Sanitizer';
const landingDescription =
  'PromptShield is an AI prompt sanitizer that helps teams remove API keys, tokens, emails, phone numbers, URLs, and credit card numbers before prompts are shared.';

const heroStats = [
  { value: '6+', label: 'Sensitive patterns detected' },
  { value: '3', label: 'Redaction modes' },
  { value: '100%', label: 'Browser-based workflow' },
];

const trustSignals = [
  'Built for AI teams cleaning prompts before they reach public tools',
  'Fast enough for daily support, product, and engineering workflows',
  'Simple redaction choices that keep prompts readable and safe',
];

const featureCards = [
  {
    title: 'Detect risky content',
    description:
      'Catch API keys, emails, phone numbers, URLs, bearer tokens, JWTs, and payment card numbers before they spread.',
  },
  {
    title: 'Choose the right action',
    description:
      'Mask values for readability, replace them with useful labels, or remove them entirely for stricter privacy workflows.',
  },
  {
    title: 'Review before sharing',
    description:
      'Review detections and the sanitized output together so nothing leaves your browser unchecked.',
  },
];

const useCases = [
  {
    title: 'Support teams',
    description: 'Clean customer transcripts and internal notes before asking AI tools for summaries or drafts.',
  },
  {
    title: 'Developers',
    description: 'Strip tokens, endpoints, and environment secrets before pasting prompts into copilots or bug reports.',
  },
  {
    title: 'Operations and consulting',
    description: 'Protect sensitive links, contact details, and card-like values in shared workflows and client deliverables.',
  },
];

const workflowSteps = [
  'Paste the prompt or conversation you want to clean.',
  'Run a scan to detect exposed sensitive values.',
  'Copy the sanitized version for safer sharing.',
];

const faqItems = [
  {
    question: 'What is PromptShield used for?',
    answer:
      'PromptShield helps people sanitize prompts before sharing them with AI tools, teammates, vendors, or public examples.',
  },
  {
    question: 'Does PromptShield send prompt data to a server?',
    answer:
      'No. The tool is designed as a browser-first workflow, so detection and sanitization happen on the client side.',
  },
  {
    question: 'Who is it useful for?',
    answer:
      'It is useful for AI teams, developers, consultants, support teams, and anyone who handles prompts that may contain secrets or customer information.',
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
        <section className="grid gap-12 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-16">
          <div>
            <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
              AI Prompt Sanitizer
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Share AI prompts with confidence, not exposed secrets.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {appName} helps teams detect and sanitize sensitive prompt data in seconds, making it
              easier to use AI across support, engineering, and operations without leaking values that
              should stay private.
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

            <div className="mt-8 space-y-3">
              {trustSignals.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-accent-300 shadow-[0_0_18px_rgba(255,138,114,0.45)]" />
                  <span>{item}</span>
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
                      Prompt redaction
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
                  <div className="text-xs uppercase tracking-[0.22em] text-rose-200/80">Before</div>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Use <span className="text-rose-200">sk-prod-84jd92ksl2n2</span> and send the
                    report to <span className="text-rose-200">finance@company.com</span> with
                    token=<span className="text-rose-200">eyJhbGciOi...</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['API Key', 'Email', 'Token'].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-orange-400/15 bg-orange-400/10 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-orange-200/80">After</div>
                  <p className="mt-3 text-sm leading-7 text-orange-50">
                    Use <span className="font-semibold">[API_KEY]</span> and send the report to{' '}
                    <span className="font-semibold">[EMAIL]</span> with{' '}
                    <span className="font-semibold">[TOKEN]</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Built for practical prompt privacy
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              A focused workflow for teams that want safer prompts without extra complexity.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => (
              <SectionCard key={card.title} title={card.title} description={card.description}>
                <div className="text-sm leading-7 text-slate-300">
                  Designed to help teams keep AI workflows moving without exposing secrets that do not belong in prompts.
                </div>
              </SectionCard>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            title="How It Works"
            description="A simple three-step flow for everyday prompt hygiene."
          >
            <div className="space-y-4">
              {workflowSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-sm font-semibold text-orange-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Why teams use PromptShield"
            description="Useful when prompts move across internal tools, vendors, or AI assistants."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                <div className="text-sm font-semibold text-white">Secure sharing</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Remove sensitive values before prompts are pasted into AI tools, tickets, or docs.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                <div className="text-sm font-semibold text-white">Fast review</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Inspect exactly what was detected before copying the cleaned prompt.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 md:col-span-2">
                <div className="text-sm font-semibold text-white">Browser-first workflow</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  PromptShield is designed to keep the core experience lightweight and easy to adopt.
                </p>
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Where PromptShield fits</h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Useful for teams that want AI speed without turning prompt sharing into a privacy risk.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {useCases.map((item) => (
              <SectionCard key={item.title} title={item.title} description={item.description}>
                <div className="text-sm leading-7 text-slate-300">
                  Cleaner prompts mean safer collaboration, better examples, and less manual cleanup.
                </div>
              </SectionCard>
            ))}
          </div>
        </section>

        <section id="faq" className="mt-20 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Frequently Asked Questions"
            description="A few quick answers for first-time visitors."
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
            title="Prompt categories covered"
            description="Useful defaults for everyday prompt sanitation."
          >
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
              className="mt-6 inline-flex items-center justify-center rounded-full border border-accent-400/20 bg-[linear-gradient(135deg,rgba(255,107,87,0.96),rgba(244,63,94,0.92))] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,107,87,0.18)] transition duration-200 hover:brightness-105 hover:shadow-[0_16px_36px_rgba(255,107,87,0.24)]"
            >
              Try PromptShield
            </Link>
          </SectionCard>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
};
