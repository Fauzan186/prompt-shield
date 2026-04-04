import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const title = 'Contact Us | PromptShield';
const description =
  'Contact PromptShield for product questions, feedback, support, or partnership inquiries.';

export const ContactPage = () => {
  useDocumentMetadata({ title, description });

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackground />
      <SiteHeader showAppCta compact />

      <main className="relative z-10">
        <section className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-4">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Contact Us
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Reach out for support, product questions, or feedback.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              If you need help with PromptShield, want to report an issue, or have a business inquiry,
              use the contact details below.
            </p>
          </div>

          <div className="space-y-4">
            <SectionCard title="Support & Business">
              <div className="space-y-3 text-sm leading-7 text-slate-300">
                <p>Email: fauzan.khan186@outlook.com</p>
                <p>
                  Use this for support, extension issues, website bugs, product questions, partnerships,
                  or general inquiries.
                </p>
                <p>
                  PromptShield does not access or store your prompts. All processing happens locally in
                  your browser.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Response Times">
              <div className="space-y-3 text-sm leading-7 text-slate-300">
                <p>We aim to respond as quickly as possible during normal business days.</p>
              </div>
            </SectionCard>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};