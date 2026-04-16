import { Link, Navigate, useParams } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { SectionCard } from '@/components/SectionCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { blogPosts, getBlogPostBySlug } from '@/content/blogPosts';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);

  useDocumentMetadata({
    title: `${post.title} | PromptShield Blog`,
    description: post.description,
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackground variant="landing" />
      <SiteHeader />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <section className="pt-12">
          <div className="w-full">
            <Link to="/blog" className="text-sm font-medium text-slate-400 transition hover:text-white">
              Back to Blog
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                {post.category}
              </span>
              <span>{post.publishedAt}</span>
              <span>{post.readingTime}</span>
            </div>
            <h6 className="mt-6 max-w-6xl text-4xl font-semibold tracking-tight text-white sm:text-2xl lg:text-[2.5rem] lg:leading-[1.04]">
              {post.title}
            </h6>
            <p className="mt-6 max-w-5xl text-base leading-8 text-slate-300 sm:text-lg lg:text-[1.3rem] lg:leading-9">
              {post.description}
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SectionCard title="Article" description={post.excerpt}>
            <div className="space-y-8">
              {post.sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">{section.heading}</h2>
                  <div className="mt-3 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-8 text-slate-300 sm:text-[15px]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="More from PromptShield" description="Explore more prompt privacy content.">
            <div className="space-y-4">
              {relatedPosts.map((item) => (
                <div key={item.slug} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.category}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.excerpt}</p>
                  <Link
                    to={`/blog/${item.slug}`}
                    className="mt-3 inline-flex text-sm font-medium text-orange-200 transition hover:text-white"
                  >
                    Read article
                  </Link>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
};
