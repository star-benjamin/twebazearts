import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '../../api/blog.api';

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog', 'published'],
    queryFn: () => blogApi.list(),
  });

  return (
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20 max-w-3xl mx-auto">
      <h1 className="font-serif text-[clamp(32px,4vw,52px)] font-light mb-12">
        Studio <em>Journal</em>
      </h1>

      {isLoading ? (
        <p className="text-stone text-sm">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-stone text-sm">No posts published yet.</p>
      ) : (
        <div className="divide-y divide-ash">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="block py-8 group">
              <p className="text-[10px] tracking-widest uppercase text-stone mb-2">
                {new Date(post.published_at || post.created_at).toLocaleDateString()}
              </p>
              <h2 className="font-serif text-2xl group-hover:text-gold transition-colors">{post.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
