import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { featuredBlogPosts } from '@/content/blogPosts';
import { CHROME_EXTENSION_URL } from '@/content/site';
import { BUILT_IN_PATTERN_COUNT } from '@/features/prompt/builtInPatterns';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const appName = import.meta.env.VITE_APP_NAME ?? 'PromptShield';
const landingTitle = import.meta.env.VITE_APP_TITLE ?? 'PromptShield | AI Prompt Sanitizer';
const landingDescription =
  'PromptShield is a browser-first prompt privacy tool with a web app and Chrome extension for detecting and sanitizing API keys, tokens, emails, phone numbers, banking values, and other sensitive content before prompts are shared.';

const heroStats = [
  { value: `${BUILT_IN_PATTERN_COUNT}+`, label: 'Sensitive patterns' },
  { value: '3', label: 'Sanitization modes' },
  { value: '100%', label: 'Browser-based flow' },
];

const featureCards = [
  {
    title: 'Catch hidden prompt leaks',
    description:
      'Detect API keys, emails, phone numbers, URLs, access tokens, and card-like values before they leave your workspace or AI tool.',
  },
  {
    title: 'Choose how data is handled',
    description:
      'Mask values, remove them entirely, or replace them with readable placeholders based on how strict the share flow needs to be.',
  },
  {
    title: 'Keep prompt review simple',
    description:
      'Protect prompt sharing without adding another backend, account system, or complicated review workflow for the team.',
  },
];

const workflowItems = [
  {
    step: '01',
    title: 'Install or Open',
    description: 'Install the Chrome extension or open the web app when you want a manual review flow.',
  },
  {
    step: '02',
    title: 'Type or Paste',
    description: 'Bring in prompts, notes, support text, logs, or copied AI drafts that may contain sensitive values.',
  },
  {
    step: '03',
    title: 'Sanitize and Share',
    description: 'Use mask, remove, or replace and then share a cleaner version with more confidence.',
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-400/10 via-rose-500/5 to-cyan-400/10 blur-2xl" />
            <div className="relative">
              <span className="inline-flex animate-pulse rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
                AI Prompt Sanitizer
              </span>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Clean prompts before{' '}
                <span className="bg-gradient-to-r from-orange-400 via-rose-500 to-cyan-400 bg-clip-text text-transparent">
                  secrets become someone else's problem
                </span>
                .
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                {appName} helps teams clean sensitive prompt content before it reaches AI tools,
                docs, tickets, or shared examples. Fast, local, and built for real workflows.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <a
                  href={CHROME_EXTENSION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center justify-center rounded-full border border-accent-400/20 bg-[linear-gradient(135deg,rgba(255,107,87,0.96),rgba(244,63,94,0.92))] px-8 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,107,87,0.18)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_16px_36px_rgba(255,107,87,0.24)] hover:scale-105"
                >
                  <span>Install Chrome Extension</span>
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <Link
                  to="/prompt-sanitizer"
                  className="group inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/60 px-8 py-4 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-white/20 hover:bg-white/5 hover:text-white hover:scale-105"
                >
                  <span>Open Web App</span>
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
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

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Local First</div>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Keep prompt review in the browser without routing sensitive text through
                    another service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-4 backdrop-blur sm:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-950/50 p-5"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-2xl font-semibold text-white">{stat.value}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="md:pl-4">
                <a
                  href="#features"
                  className="inline-flex items-center text-sm font-semibold text-slate-300 transition hover:text-white"
                >
                  Explore Features
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
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

        <section id="features" className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Why PromptShield
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              A cleaner way to review prompts before they are shared.
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
            title="Simple workflow"
            description="A fast flow that fits directly into daily prompt sharing."
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
            title="Built for real workflows"
            description="Useful when prompt content crosses team, tool, or client boundaries."
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
            description="Quick answers before you try it."
          >
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-5"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <h3 className="text-sm font-semibold text-white">{item.question}</h3>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-sm leading-7 text-slate-300">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Start with the right flow"
            description="Use the extension for live browser protection or the web app for manual review."
          >
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                  <div className="text-sm font-semibold text-white">Chrome extension</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Best when prompts are typed or pasted directly into a supported browser field.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                  <div className="text-sm font-semibold text-white">Web app</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Best when you want a dedicated review space before copying or sharing.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={CHROME_EXTENSION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-accent-400/20 bg-[linear-gradient(135deg,rgba(255,107,87,0.96),rgba(244,63,94,0.92))] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,107,87,0.18)] transition duration-200 hover:brightness-105 hover:shadow-[0_16px_36px_rgba(255,107,87,0.24)]"
                >
                  Install Chrome Extension
                </a>
                <Link
                  to="/prompt-sanitizer"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  Open Web App
                </Link>
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Learn more about prompt privacy
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Useful product guides, extension use cases, and prompt safety content that gives the site more depth and gives users more context.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredBlogPosts.map((post) => (
              <SectionCard
                key={post.slug}
                title={post.title}
                description={post.excerpt}
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                      {post.category}
                    </div>
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {post.publishedAt} · {post.readingTime}
                    </div>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-orange-200 transition hover:text-white"
                  >
                    Read article
                  </Link>
                </div>
              </SectionCard>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              View all blog posts
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 rounded-full border border-white/10 bg-slate-900/80 p-3 text-white shadow-lg backdrop-blur transition-all duration-300 hover:bg-slate-800/80 hover:scale-110 ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
        aria-label="Back to top"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  );
};


