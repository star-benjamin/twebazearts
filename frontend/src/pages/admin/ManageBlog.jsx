import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { blogApi } from '../../api/blog.api';

export default function ManageBlog() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: posts = [] } = useQuery({ queryKey: ['blog', 'admin'], queryFn: () => blogApi.list({ admin: '1' }) });

  const removeMutation = useMutation({
    mutationFn: blogApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog'] }),
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-light">Studio <em>Journal</em></h2>
        <button onClick={() => setEditing('new')} className="bg-ink text-white px-5 py-2.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors">
          + New Post
        </button>
      </div>

      <div className="divide-y divide-ash bg-white border border-ash">
        {posts.map((p) => (
          <div key={p.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-serif">{p.title}</p>
              <p className="text-[10px] uppercase tracking-widest text-stone">{p.published ? 'Published' : 'Draft'}</p>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={() => setEditing(p)} className="text-[10px] uppercase tracking-widest border-b border-mist hover:border-ink">Edit</button>
              <button onClick={() => removeMutation.mutate(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="p-6 text-sm text-stone">No posts yet.</p>}
      </div>

      {editing && (
        <PostEditor post={editing === 'new' ? null : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ['blog'] }); }} />
      )}
    </AdminLayout>
  );
}

function PostEditor({ post, onClose, onSaved }) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content_markdown || '');
  const [published, setPublished] = useState(post?.published || false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { title, content_markdown: content, published };
      if (post) await blogApi.update(post.id, payload);
      else await blogApi.create(payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-2xl">{post ? 'Edit Post' : 'New Post'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-ash px-3 py-2 text-sm" />
          <textarea required rows={12} placeholder="Markdown content…" value={content} onChange={(e) => setContent(e.target.value)} className="w-full border border-ash px-3 py-2 text-sm font-mono" />
          <label className="flex items-center gap-2 text-xs text-stone">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={saving} className="w-full bg-ink text-white py-3 text-[11px] tracking-widest uppercase hover:bg-gold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
