import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Star, Upload, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { artworkApi } from '../../api/artwork.api';
import { artistApi } from '../../api/artist.api';
import { supabase } from '../../lib/supabase';

const EMPTY_FORM = {
  title: '', medium: '', style: '', story: '', artist_ref_id: '', category_id: '',
  dimensions_h_cm: '', dimensions_w_cm: '', dimensions_d_cm: '',
  creation_date: '', valuation: '', cost_basis: '', price: '', currency: 'UGX',
};

export default function ManageArtworks() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // artwork object or 'new' or null

  const { data } = useQuery({ queryKey: ['admin-artworks'], queryFn: () => artworkApi.list({ admin: '1', limit: 100 }) });
  const { data: artistsRaw } = useQuery({ queryKey: ['artists', 'admin'], queryFn: () => artistApi.list({ admin: '1' }) });
  const { data: categoriesRaw } = useQuery({ queryKey: ['artwork-categories'], queryFn: () => artworkApi.listCategories() });
  const artists = Array.isArray(artistsRaw) ? artistsRaw : [];
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  const removeMutation = useMutation({
    mutationFn: artworkApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-artworks'] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }) => artworkApi.update(id, { featured }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-artworks'] }),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, visibility }) => artworkApi.update(id, { visibility }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-artworks'] }),
    onError: (err) => alert(err.response?.data?.error || 'Failed to update visibility'),
  });

  const artworks = Array.isArray(data?.items) ? data.items : [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-light">Manage <em>Artworks</em></h2>
        <button onClick={() => setEditing('new')} className="bg-ink text-white px-5 py-2.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors">
          + New Artwork
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {artworks.map((a) => {
          const img = a.images?.find((i) => i.is_primary) || a.images?.[0];
          return (
            <div key={a.id} className="bg-white border border-ash p-3 flex flex-col">
              <div className="w-full aspect-square bg-smoke mb-3 overflow-hidden">
                {img && <img src={img.url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="font-serif text-sm mb-1 truncate">{a.title}</div>
              <div className="text-[11px] text-stone mb-2 italic">{a.artist?.full_name || 'Unattributed'}</div>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-smoke text-stone">{a.tracking_status}</span>
                <span className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 ${a.visibility === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {a.visibility}
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between gap-1">
                <button onClick={() => setEditing(a)} className="text-[10px] uppercase tracking-widest text-ink border-b border-mist hover:border-ink">
                  Edit
                </button>
                <div className="flex items-center gap-1">
                  <button
                    title="Toggle Featured"
                    onClick={() => toggleFeatured.mutate({ id: a.id, featured: !a.featured })}
                    className={a.featured ? 'text-gold' : 'text-stone-300 hover:text-stone'}
                  >
                    <Star size={15} fill={a.featured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    title={a.visibility === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    onClick={() => togglePublish.mutate({ id: a.id, visibility: a.visibility === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED' })}
                    className="text-[9px] uppercase tracking-wide px-2 py-1 border border-ash hover:bg-smoke"
                  >
                    {a.visibility === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => window.confirm('Delete this artwork?') && removeMutation.mutate(a.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <ArtworkEditor
          artwork={editing === 'new' ? null : editing}
          artists={artists}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ['admin-artworks'] }); }}
        />
      )}
    </AdminLayout>
  );
}

function ArtworkEditor({ artwork, artists, categories, onClose, onSaved }) {
  // `savedArtwork` starts as whatever was passed in (existing artwork being
  // edited, or null for a brand-new one). Once a new artwork is created, we
  // store the server's response here so the same modal can flip straight
  // into "attach images" mode instead of closing and asking the admin to
  // reopen it.
  const [savedArtwork, setSavedArtwork] = useState(artwork);
  const [form, setForm] = useState(artwork ? {
    title: artwork.title || '', medium: artwork.medium || '', style: artwork.style || '',
    story: artwork.story || '', artist_ref_id: artwork.artist_ref_id || '', category_id: artwork.category_id || '',
    dimensions_h_cm: artwork.dimensions_h_cm || '', dimensions_w_cm: artwork.dimensions_w_cm || '', dimensions_d_cm: artwork.dimensions_d_cm || '',
    creation_date: artwork.creation_date || '', valuation: artwork.valuation || '', cost_basis: artwork.cost_basis || '',
    price: artwork.price || '', currency: artwork.currency || 'UGX',
  } : EMPTY_FORM);
  const [images, setImages] = useState(artwork?.images || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return setError('Image must be under 15MB (VR-ART-001).');
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      return setError('Only JPG, PNG, or WebP images are accepted.');
    }
    if (!savedArtwork) return setError('Save the artwork once before uploading images.');

    setUploading(true);
    setError(null);
    try {
      const path = `${savedArtwork.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('artworks').upload(path, file, { cacheControl: '3600' });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(path);

      const saved = await artworkApi.addImage(savedArtwork.id, {
        url: publicUrl, is_primary: images.length === 0, mime_type: file.type, size_bytes: file.size,
      });
      setImages((imgs) => [...imgs, saved]);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageId) => {
    if (!savedArtwork) return;
    await artworkApi.removeImage(savedArtwork.id, imageId);
    setImages((imgs) => imgs.filter((i) => i.id !== imageId));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      ['dimensions_h_cm', 'dimensions_w_cm', 'dimensions_d_cm', 'valuation', 'cost_basis', 'price'].forEach((k) => {
        payload[k] = payload[k] === '' ? null : Number(payload[k]);
      });
      payload.artist_ref_id = payload.artist_ref_id || null;
      payload.category_id = payload.category_id || null;
      payload.creation_date = payload.creation_date || null;

      if (savedArtwork) {
        await artworkApi.update(savedArtwork.id, payload);
        onSaved();
      } else {
        // First save of a brand-new artwork: create it, then drop into
        // image-upload mode in the same modal instead of closing.
        const created = await artworkApi.create(payload);
        setSavedArtwork(created);
      }
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
          <h3 className="font-serif text-2xl">{savedArtwork ? 'Edit Artwork' : 'New Artwork'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {artwork == null && savedArtwork && (
          <p className="text-xs text-emerald-700 bg-emerald-50 p-3 mb-4">
            Artwork created. Now add at least one image and confirm the story field before publishing (BR-ART-001).
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Title" value={form.title} onChange={set('title')} className="w-full border border-ash px-3 py-2 text-sm" />

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Medium" value={form.medium} onChange={set('medium')} className="border border-ash px-3 py-2 text-sm" />
            <input placeholder="Style" value={form.style} onChange={set('style')} className="border border-ash px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select value={form.artist_ref_id} onChange={set('artist_ref_id')} className="border border-ash px-3 py-2 text-sm bg-white">
              <option value="">— Artist (optional) —</option>
              {artists.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
            </select>
            <select value={form.category_id} onChange={set('category_id')} className="border border-ash px-3 py-2 text-sm bg-white">
              <option value="">— Category (optional) —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <textarea required rows={4} placeholder="Story / cultural meaning behind the piece"
            value={form.story} onChange={set('story')} className="w-full border border-ash px-3 py-2 text-sm" />

          <div className="grid grid-cols-3 gap-3">
            <input type="number" step="0.1" placeholder="Height (cm)" value={form.dimensions_h_cm} onChange={set('dimensions_h_cm')} className="border border-ash px-3 py-2 text-sm" />
            <input type="number" step="0.1" placeholder="Width (cm)" value={form.dimensions_w_cm} onChange={set('dimensions_w_cm')} className="border border-ash px-3 py-2 text-sm" />
            <input type="number" step="0.1" placeholder="Depth (cm)" value={form.dimensions_d_cm} onChange={set('dimensions_d_cm')} className="border border-ash px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.creation_date} onChange={set('creation_date')} className="border border-ash px-3 py-2 text-sm" />
            <input type="number" placeholder="Public Price (UGX)" value={form.price} onChange={set('price')} min="0" className="border border-ash px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Valuation (internal)" value={form.valuation} onChange={set('valuation')} min="0" className="border border-ash px-3 py-2 text-sm" />
            <input type="number" placeholder="Cost Basis (internal)" value={form.cost_basis} onChange={set('cost_basis')} min="0" className="border border-ash px-3 py-2 text-sm" />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={saving} className="w-full bg-ink text-white py-3 text-[11px] tracking-widest uppercase hover:bg-gold disabled:opacity-50">
            {saving ? 'Saving…' : savedArtwork ? 'Save Changes' : 'Create Artwork & Continue to Images'}
          </button>
        </form>

        {savedArtwork && (
          <div className="mt-6 pt-6 border-t border-ash">
            <label className="block text-[10px] tracking-widest uppercase text-stone mb-2">Images (FR-ART-004)</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img) => (
                <div key={img.id} className="relative w-20 h-20">
                  <img src={img.url} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeImage(img.id)} className="absolute -top-2 -right-2 bg-white rounded-full border border-ash">
                    <X size={14} />
                  </button>
                  {img.is_primary && <span className="absolute bottom-0 left-0 bg-gold text-white text-[8px] px-1">Primary</span>}
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-stone cursor-pointer border border-dashed border-ash p-3 w-fit mb-4">
              <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload image (max 15MB)'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>

            <button
              onClick={onSaved}
              className="w-full border border-ink text-ink py-3 text-[11px] tracking-widest uppercase hover:bg-ink hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}