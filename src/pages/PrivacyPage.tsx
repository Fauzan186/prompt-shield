import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const title = 'Privacy Policy | PromptShield';
const description =
  'Read how PromptShield handles privacy, browser-only processing, extension settings, and local data storage.';

const sections = [
  {
    title: 'Overview',
    body: [
      'PromptShield is designed to process prompt text locally in your browser. The website and extension are intended to help users identify and sanitize sensitive content before sharing prompts with AI tools or other systems.',
      'We do not intentionally collect or transmit the prompt content you scan through the core browser-based sanitization flow.',
    ],
  },
  {
    title: 'What PromptShield Processes',
    body: [
      'PromptShield may process prompt text, extension settings, and user-defined detection rules directly inside your browser so the sanitization features can function.',
      'When you use custom dictionary entries or custom regex patterns, those values may be stored locally in your browser storage to preserve your settings across sessions.',
    ],
  },
  {
    title: 'Local-First Processing',
    body: [
      'Prompt text entered into PromptShield is intended to be processed locally in the browser.',
      'PromptShield is not designed to send your prompt content to a PromptShield backend for sanitization as part of its core functionality.',
    ],
  },
  {
    title: 'Browser Storage',
    body: [
      'The Chrome extension may store configuration choices such as sanitization mode, auto-mask preferences, accidental-send blocking preferences, custom dictionary terms, and custom patterns using browser-provided local storage.',
      'This local storage is used to make the extension work consistently for you on your device and browser profile.',
    ],
  },
  {
    title: 'Third-Party Websites',
    body: [
      'If you use the extension on third-party websites, those websites operate under their own terms and privacy practices.',
      'PromptShield can help reduce accidental disclosure, but you remain responsible for reviewing what you send to external platforms.',
    ],
  },
  {
    title: 'No Guarantee of Complete Detection',
    body: [
      'PromptShield uses pattern-based detection and configurable rules to identify potential sensitive content. Detection is best-effort and may not identify every secret, identifier, or regulated data element.',
      'Users should review important prompts manually before sending or sharing them.',
    ],
  },
  {
    title: 'Changes',
    body: ['This Privacy Policy may be updated over time as the product evolves.'],
  },
];

export const PrivacyPage = () => {
  useDocumentMetadata({ title, description });

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackground />
      <SiteHeader showAppCta compact />

      <main className="relative z-10">
        <section className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-4">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Privacy Policy
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Privacy-first by design, with local browser processing at the core.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              This page explains how PromptShield handles prompt processing, local settings, and product
              limitations in plain language.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section) => (
              <SectionCard key={section.title} title={section.title}>
                <div className="space-y-3 text-sm leading-7 text-slate-300">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};
