import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, Download, Tag } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { blogApi } from '../../api/blog.api';
import { artworkApi } from '../../api/artwork.api';

export default function ManageBlog() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  const { data: posts = [] } = useQuery({ queryKey: ['blog', 'admin'], queryFn: () => blogApi.list({ admin: '1' }) });

  const removeMutation = useMutation({
    mutationFn: blogApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog'] }),
  });

  const exportPdf = async (post) => {
    setExportingId(post.id);
    try {
      const blob = await blogApi.exportPdf(post.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${post.slug}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not export PDF. Try again.');
    } finally {
      setExportingId(null);
    }
  };

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
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-stone">
                <span>{p.published ? 'Published' : 'Draft'}</span>
                {p.tagged_artworks?.length > 0 && (
                  <span className="flex items-center gap-1"><Tag size={10} /> {p.tagged_artworks.length} tagged</span>
                )}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => exportPdf(p)}
                disabled={exportingId === p.id}
                title="Export as PDF"
                className="text-stone hover:text-ink disabled:opacity-50"
              >
                <Download size={15} />
              </button>
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
  const [artworkIds, setArtworkIds] = useState(post?.tagged_artworks?.map((a) => a.id) || []);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: artworksRaw } = useQuery({
    queryKey: ['artworks', 'tagging'],
    queryFn: () => artworkApi.list({ admin: '1', limit: 100 }),
  });
  const artworks = Array.isArray(artworksRaw?.items) ? artworksRaw.items : [];

  const toggleArtwork = (id) => {
    setArtworkIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { title, content_markdown: content, published, artwork_ids: artworkIds };
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
          <textarea required rows={10} placeholder="Markdown content…" value={content} onChange={(e) => setContent(e.target.value)} className="w-full border border-ash px-3 py-2 text-sm font-mono" />

          <div>
            <label className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-stone mb-2">
              <Tag size={11} /> Tag Artworks ({artworkIds.length} selected)
            </label>
            <div className="border border-ash max-h-56 overflow-y-auto divide-y divide-ash">
              {artworks.map((a) => {
                const img = a.images?.find((i) => i.is_primary) || a.images?.[0];
                const checked = artworkIds.includes(a.id);
                return (
                  <label key={a.id} className={`flex items-center gap-3 p-2.5 cursor-pointer hover:bg-smoke/50 ${checked ? 'bg-smoke/60' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleArtwork(a.id)} />
                    <div className="w-10 h-10 bg-smoke flex-shrink-0 overflow-hidden">
                      {img && <img src={img.url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-sm truncate">{a.title}</span>
                  </label>
                );
              })}
              {artworks.length === 0 && <p className="p-3 text-xs text-stone">No artworks available to tag yet.</p>}
            </div>
          </div>

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
