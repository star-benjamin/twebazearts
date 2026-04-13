import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import client from '../../api/client';
 
export default function UploadArtwork() {
  const { user } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [form, setForm] = useState({
    title: '', price: '', size: '', medium: '', year: '', currency: 'UGX', description: '',
  });
 
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an image.');
    setUploading(true);
    setError('');
 
    try {
      // 1. Upload image directly to Supabase Storage
      const ext      = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('artworks')
        .upload(filePath, file, { cacheControl: '3600' });
      if (uploadErr) throw uploadErr;
 
      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(filePath);
 
      // 3. Save metadata via Express
      await client.post('/artworks', { ...form, price: +form.price, year: form.year ? +form.year : null, image_url: publicUrl });
      setSuccess(true);
      setForm({ title: '', price: '', size: '', medium: '', year: '', currency: 'UGX', description: '' });
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };
 
  const field = (key, label, type = 'text', full = false) => (
    <div key={key} className={full ? 'col-span-2' : ''}>
      <label className="block text-[11px] tracking-widest uppercase text-stone mb-2">{label}</label>
      <input
        type={type}
        className="w-full border border-ash bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  );
 
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-4xl font-light mb-1">Upload <em>Artwork</em></h2>
      <p className="text-sm text-stone mb-8">Add a new piece to your gallery portfolio.</p>
 
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-4 mb-6">
          ✓ Artwork published successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 mb-6">{error}</div>
      )}
 
      <form onSubmit={handleSubmit}>
        <label className="block border-2 border-dashed border-ash hover:border-gold p-12 text-center cursor-pointer mb-8 transition-colors">
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFile} />
          {preview
            ? <img src={preview} alt="preview" className="max-h-64 mx-auto object-contain" />
            : <>
                <Upload size={28} className="mx-auto mb-3 opacity-20" />
                <p className="font-serif text-lg mb-1">Drop artwork image here</p>
                <p className="text-xs text-stone">JPEG, PNG, WebP · Max 10MB · Min 1200px</p>
              </>
          }
        </label>
 
        <div className="grid grid-cols-2 gap-5 mb-5">
          {field('title',       'Title *',       'text', true)}
          {field('medium',      'Medium',        'text')}
          {field('price',       'Price *',       'number')}
          {field('size',        'Size (e.g. 60×90cm)')}
          {field('year',        'Year',          'number')}
          <div>
            <label className="block text-[11px] tracking-widest uppercase text-stone mb-2">Currency</label>
            <select className="w-full border border-ash bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
              <option>UGX</option><option>USD</option><option>KES</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] tracking-widest uppercase text-stone mb-2">Description</label>
            <textarea
              rows={4}
              className="w-full border border-ash bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink resize-y"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>
 
        <button
          type="submit"
          disabled={uploading}
          className="bg-ink text-white px-8 py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Publish Artwork'}
        </button>
      </form>
    </div>
  );
}