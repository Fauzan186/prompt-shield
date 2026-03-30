import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const title = 'Terms of Use | PromptShield';
const description =
  'Read the PromptShield terms covering acceptable use, no warranties, responsibility for prompt review, and limitation language.';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: [
      'By using PromptShield, you agree to use the product in accordance with these Terms of Use.',
    ],
  },
  {
    title: 'Product Purpose',
    body: [
      'PromptShield is a browser-based prompt sanitization tool intended to help users reduce accidental sharing of sensitive information.',
      'PromptShield is provided as an assistive privacy and workflow tool, not as legal, compliance, or security certification.',
    ],
  },
  {
    title: 'User Responsibility',
    body: [
      'You are responsible for reviewing prompts, outputs, and any content you choose to share with third-party tools, AI systems, clients, teammates, or public services.',
      'You are also responsible for ensuring your use of PromptShield complies with applicable laws, contracts, policies, and platform rules.',
    ],
  },
  {
    title: 'No Guarantee',
    body: [
      'PromptShield uses best-effort detection logic and configurable rules. It may miss some secrets, identifiers, credentials, personal data, or regulated information.',
      'Use of PromptShield does not guarantee that a prompt is safe, compliant, error-free, or free of all sensitive content.',
    ],
  },
  {
    title: 'Extension and Website Use',
    body: [
      'The browser extension and website are provided for lawful use only.',
      'You agree not to use PromptShield in a way that interferes with websites, violates another party’s rights, or attempts unauthorized access to systems or data.',
    ],
  },
  {
    title: 'Intellectual Property',
    body: [
      'PromptShield branding, design elements, and original product materials may be protected by applicable intellectual property laws.',
      'You remain responsible for the content you input, process, copy, or send through the product.',
    ],
  },
  {
    title: 'Disclaimer of Warranties',
    body: [
      'PromptShield is provided on an "as is" and "as available" basis to the maximum extent permitted by law.',
      'We do not warrant that the product will be uninterrupted, error-free, suitable for every use case, or capable of detecting every type of sensitive content.',
    ],
  },
  {
    title: 'Limitation',
    body: [
      'To the maximum extent permitted by law, PromptShield should not be relied on as the sole safeguard for confidential, personal, regulated, or business-critical information.',
    ],
  },
  {
    title: 'Updates',
    body: ['These Terms may be updated as the product changes. Continued use after updates may constitute acceptance of the revised Terms.'],
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
              These terms explain how PromptShield is intended to be used and the limits of what the
              product can guarantee.
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
