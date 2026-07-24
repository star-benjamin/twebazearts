import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Facebook, Twitter, MessageCircle, Link2, Check } from 'lucide-react';
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

      {post.tagged_artworks?.length > 0 && (
        <div className="mt-14 pt-10 border-t border-ash">
          <p className="text-[10px] tracking-widest uppercase text-stone mb-6">Featured Pieces</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {post.tagged_artworks.map((a) => {
              const img = a.images?.find((i) => i.is_primary) || a.images?.[0];
              return (
                <Link key={a.id} to={`/artwork/${a.id}`} className="group">
                  <div className="aspect-[3/4] bg-smoke overflow-hidden mb-2">
                    {img && (
                      <img
                        src={img.webp_url || img.url}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <p className="text-sm font-serif truncate group-hover:text-gold transition-colors">{a.title}</p>
                  <p className="text-xs text-stone">
                    {a.price != null ? `${a.currency || 'UGX'} ${Number(a.price).toLocaleString()}` : 'Price on request'}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <ShareBar title={post.title} />
    </div>
  );
}

function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buttons = [
    {
      label: 'Facebook', Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: 'X', Icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      label: 'WhatsApp', Icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
    },
  ];

  return (
    <div className="mt-14 pt-8 border-t border-ash flex items-center gap-4">
      <span className="text-[10px] tracking-widest uppercase text-stone">Share</span>
      {buttons.map(({ label, Icon, href }) => (
        <a
          key={label} href={href} target="_blank" rel="noreferrer" title={`Share on ${label}`}
          className="w-9 h-9 flex items-center justify-center border border-ash text-stone hover:text-ink hover:border-ink transition-colors rounded-full"
        >
          <Icon size={15} />
        </a>
      ))}
      <button
        onClick={copyLink} title="Copy link"
        className="w-9 h-9 flex items-center justify-center border border-ash text-stone hover:text-ink hover:border-ink transition-colors rounded-full"
      >
        {copied ? <Check size={15} className="text-emerald-600" /> : <Link2 size={15} />}
      </button>
    </div>
  );
}
