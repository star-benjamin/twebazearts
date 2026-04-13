import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import client from '../../api/client';

export default function UploadArtwork() {
  const { user } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', price: '', size: '', medium: '', year: '', currency: 'UGX', description: '',
  });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuccess(false); // Reset success state if uploading a new one
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an image.');
    setUploading(true);
    setError('');

    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('artworks')
        .upload(filePath, file, { cacheControl: '3600' });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(filePath);

      await client.post('/artworks', { 
        ...form, 
        price: +form.price, 
        year: form.year ? +form.year : null, 
        image_url: publicUrl 
      });

      setSuccess(true);
      setForm({ title: '', price: '', size: '', medium: '', year: '', currency: 'UGX', description: '' });
      setFile(null);
      setPreview(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const field = (key, label, type = 'text', full = false) => (
    <div key={key} className={full ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
      <label className="block text-[10px] md:text-[11px] tracking-[.15em] uppercase text-stone mb-2">
        {label}
      </label>
      <input
        type={type}
        required={label.includes('*')}
        className="w-full border border-ash bg-white px-4 py-3 text-base md:text-sm focus:outline-none focus:border-ink transition-colors rounded-none appearance-none"
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto lg:mx-0">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-1">Upload <em>Artwork</em></h2>
        <p className="text-[12px] md:text-sm text-stone uppercase tracking-widest">Publish to your gallery</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[13px] p-4 mb-8 text-center sm:text-left animate-in fade-in duration-500">
          ✓ Artwork published successfully! It is now live in the gallery.
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-[13px] p-4 mb-8 text-center sm:text-left">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Upload Zone */}
        <div className="relative">
          <label className={`block border-2 border-dashed ${preview ? 'border-ink' : 'border-ash hover:border-gold'} p-6 md:p-12 text-center cursor-pointer transition-all duration-300 bg-white`}>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFile} />
            {preview ? (
              <div className="relative group">
                <img src={preview} alt="preview" className="max-h-72 mx-auto object-contain shadow-md" />
                <div className="mt-4 text-[10px] tracking-widest uppercase text-stone group-hover:text-ink">Tap to change image</div>
              </div>
            ) : (
              <div className="py-4">
                <Upload size={32} className="mx-auto mb-4 text-stone opacity-30" />
                <p className="font-serif text-xl mb-2">Select Artwork Image</p>
                <p className="text-[10px] text-stone uppercase tracking-widest">JPEG, PNG, WebP · Max 10MB</p>
              </div>
            )}
          </label>
          {preview && (
            <button 
              type="button" 
              onClick={() => {setPreview(null); setFile(null);}}
              className="absolute -top-3 -right-3 bg-ink text-white p-1.5 rounded-full shadow-lg"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-6">
          {field('title', 'Title *', 'text', true)}
          {field('medium', 'Medium')}
          {field('price', 'Price *', 'number')}
          {field('size', 'Size (e.g. 60×90cm)')}
          {field('year', 'Year', 'number')}
          
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] md:text-[11px] tracking-[.15em] uppercase text-stone mb-2">Currency</label>
            <select 
              className="w-full border border-ash bg-white px-4 py-3 text-base md:text-sm focus:outline-none focus:border-ink rounded-none appearance-none" 
              value={form.currency} 
              onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
            >
              <option>UGX</option><option>USD</option><option>KES</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] md:text-[11px] tracking-[.15em] uppercase text-stone mb-2">Description</label>
            <textarea
              rows={5}
              className="w-full border border-ash bg-white px-4 py-4 text-base md:text-sm focus:outline-none focus:border-ink resize-y rounded-none appearance-none leading-relaxed"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell collectors the story behind this piece..."
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="w-full sm:w-auto bg-ink text-white px-12 py-4 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50"
          >
            {uploading ? 'Publishing to Gallery...' : 'Publish Artwork'}
          </button>
        </div>
      </form>
    </div>
  );
}