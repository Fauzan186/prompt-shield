import { Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { blogPosts } from '@/content/blogPosts';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const BlogIndexPage = () => {
  useDocumentMetadata({
    title: 'PromptShield Blog | Prompt Privacy, AI Safety, and Extension Use Cases',
    description:
      'Read guides, use cases, and product articles about prompt privacy, AI safety, browser extensions, and safer prompt workflows.',
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackground variant="landing" />
      <SiteHeader />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <section className="pt-12">
          <div className="w-full">
            <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
              PromptShield Blog
            </span>
            <h6 className="mt-6 max-w-6xl text-2xl font-semibold tracking-tight text-white lg:text-[2rem] sm:text-5xl leading-relaxed">
              Prompt privacy guides, product use cases, and safer AI workflow articles.
            </h6>
            <p className="mt-6 max-w-5xl text-lg leading-8 text-slate-300 lg:text-[1rem] lg:leading-9">
              Learn how teams use PromptShield, why prompt sanitization matters, and how browser-side
              privacy workflows fit into real AI-assisted work across support, engineering, consulting,
              and internal knowledge sharing.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          {blogPosts.map((post) => (
            <SectionCard
              key={post.slug}
              title={post.title}
              description={post.excerpt}
              action={
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  {post.category}
                </div>
              }
            >
              <div className="space-y-5">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  {post.publishedAt} - {post.readingTime}
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center rounded-full border border-accent-400/20 bg-[linear-gradient(135deg,rgba(255,107,87,0.96),rgba(244,63,94,0.92))] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,107,87,0.18)] transition duration-200 hover:brightness-105 hover:shadow-[0_16px_36px_rgba(255,107,87,0.24)]"
                >
                  Read Article
                </Link>
              </div>
            </SectionCard>
          ))}
        </section>
      </div>

      <SiteFooter />
    </main>
  );
};

