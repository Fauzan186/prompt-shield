import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const title = 'Terms of Use | PromptShield';
const description =
  'Read the PromptShield terms covering acceptable use, no warranties, user responsibility, and limitations.';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: [
      'By using PromptShield, you agree to use the product according to these Terms of Use.',
    ],
  },
  {
    title: 'Product Purpose',
    body: [
      'PromptShield is a browser-based prompt sanitization tool to help users reduce accidental sharing of sensitive information.',
      'It is an assistive privacy tool, not legal, compliance, or security certification.',
    ],
  },
  {
    title: 'User Responsibility',
    body: [
      'You are responsible for reviewing prompts and content before sharing with AI tools, clients, teammates, or public platforms.',
      'Ensure your use complies with laws, contracts, and platform rules.',
    ],
  },
  {
    title: 'No Guarantee',
    body: [
      'PromptShield uses best-effort detection logic and may miss some secrets, identifiers, or regulated information.',
      'Use does not guarantee safety, compliance, or that content is free of sensitive information.',
    ],
  },
  {
    title: 'Extension and Website Use',
    body: [
      'The browser extension and website are for lawful use only.',
      'Do not use PromptShield to interfere with websites, violate others’ rights, or attempt unauthorized access.',
    ],
  },
  {
    title: 'Disclaimer & Limitation',
    body: [
      'PromptShield is provided "as is" to the maximum extent permitted by law.',
      'It should not be relied on as the sole safeguard for confidential, personal, regulated, or business-critical information.',
    ],
  },
  {
    title: 'Updates',
    body: [
      'These Terms may be updated as the product evolves. Continued use after updates indicates acceptance of the revised Terms.',
    ],
  },
];

export const TermsPage = () => {
  useDocumentMetadata({ title, description });

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackground />
      <SiteHeader showAppCta compact />

      <main className="relative z-10">
        <section className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-4">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Terms of Use
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Clear usage terms for a browser-first prompt privacy tool.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              These terms explain how PromptShield is intended to be used and the limits of what the product can guarantee.
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