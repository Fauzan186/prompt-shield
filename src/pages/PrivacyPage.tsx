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
      'PromptShield processes prompt text locally in your browser to help users identify and sanitize sensitive content before sharing prompts with AI tools or other systems.',
      'PromptShield does NOT collect, store, or transmit any prompt content or personal data.',
    ],
  },
  {
    title: 'Local-First Processing',
    body: [
      'All prompt analysis and sanitization is performed locally within your browser.',
      'PromptShield does NOT send your prompt content to any backend, server, or third party.',
    ],
  },
  {
    title: 'Browser Storage',
    body: [
      'The Chrome extension may store configuration choices such as sanitization mode, auto-mask preferences, accidental-send blocking preferences, custom dictionary terms, and custom patterns using browser-provided local storage.',
      'This local storage is used only to make the extension function consistently for you on your device and browser profile.',
    ],
  },
  {
    title: 'Third-Party Websites',
    body: [
      'If you use the extension on third-party websites, those websites operate under their own terms and privacy practices.',
      'PromptShield helps reduce accidental disclosure, but you remain responsible for reviewing what you send to external platforms.',
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
    body: [
      'This Privacy Policy may be updated over time as the product evolves. Updates will be reflected on this page.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'If you have any questions about this Privacy Policy, contact:',
      'Email: fauzan.khan186@outlook.com',
    ],
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
              This page explains how PromptShield handles prompt processing, local settings, and product limitations in plain language.
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