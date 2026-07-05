import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { blogApi } from '../../api/blog.api';

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogApi.detailBySlug(slug),
  });

  if (isLoading) return <div className="min-h-screen pt-16 flex items-center justify-center text-stone">Loading…</div>;
  if (!post) return <div className="min-h-screen pt-16 flex items-center justify-center text-stone">Post not found.</div>;

  return (
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20 max-w-2xl mx-auto">
      <Link to="/blog" className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-stone hover:text-ink mb-10">
        <ArrowLeft size={14} /> Journal
      </Link>

      <p className="text-[10px] tracking-widest uppercase text-stone mb-3">
        {new Date(post.published_at || post.created_at).toLocaleDateString()}
      </p>
      <h1 className="font-serif text-[clamp(28px,4vw,44px)] font-light mb-8">{post.title}</h1>

      <article className="prose prose-stone max-w-none text-sm leading-relaxed">
        <ReactMarkdown>{post.content_markdown}</ReactMarkdown>
      </article>
    </div>
  );
}
