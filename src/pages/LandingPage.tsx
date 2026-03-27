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

const featureCards = [
  {
    title: 'Detect risky content',
    description:
      'Scan prompts for API keys, emails, phone numbers, URLs, tokens, and payment card numbers.',
  },
  {
    title: 'Choose the right action',
    description:
      'Mask values, replace them with clear labels, or remove them completely depending on the sharing context.',
  },
  {
    title: 'Review before sharing',
    description:
      'Check detections and the cleaned output side by side, then copy the prompt when it is ready.',
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
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
              AI Prompt Sanitizer
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Clean prompts before secrets or customer data leak.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {appName} helps teams sanitize prompts in the browser so examples, support tickets,
              and AI requests are safer to share.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Open Tool
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-slate-900"
              >
                Explore Features
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
            <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-transparent blur-3xl" />
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
                    <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
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

                <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/10 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-emerald-200/80">After</div>
                  <p className="mt-3 text-sm leading-7 text-emerald-50">
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
                  PromptShield keeps the experience simple so prompts can be reviewed and shared quickly.
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
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-200">
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
              className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
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
