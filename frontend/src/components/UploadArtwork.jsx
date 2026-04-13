import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import client from '../../api/client';

export default function UploadArtwork() {
  const { user } = useAuth();
  const [preview, setPreview]     = useState(null);
  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0); // 0-100
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [form, setForm] = useState({
    title: '', price: '', size: '', medium: '', year: '', currency: 'UGX', description: '',
  });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    // Warn if file is too large before uploading
    if (f.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB. Please compress it at tinypng.com first.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an image.');
    if (!form.title) return setError('Title is required.');
    if (!form.price) return setError('Price is required.');

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Simulate progress during upload since Supabase JS
      // client doesn't expose real upload progress events
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) { clearInterval(progressInterval); return 85; }
          return prev + Math.random() * 15;
        });
      }, 300);

      // 1. Upload image to Supabase Storage
      const ext      = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('artworks')
        .upload(filePath, file, { cacheControl: '3600' });

      clearInterval(progressInterval);

      if (uploadErr) throw uploadErr;

      setProgress(90);

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(filePath);

      // 3. Save metadata
      await client.post('/artworks', {
        ...form,
        price:    +form.price,
        year:     form.year ? +form.year : null,
        image_url: publicUrl,
      });

      setProgress(100);

      // Show success then reset
      setTimeout(() => {
        setSuccess(true);
        setUploading(false);
        setProgress(0);
        setForm({ title: '', price: '', size: '', medium: '', year: '', currency: 'UGX', description: '' });
        setFile(null);
        setPreview(null);
      }, 400);

    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setProgress(0);
    }
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] tracking-widest uppercase text-stone">
          {progress < 90 ? 'Uploading image…' : progress < 100 ? 'Saving artwork…' : 'Complete!'}
        </span>
        <span className="text-[11px] text-stone">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-0.5 bg-ash overflow-hidden">
        <div
          className="h-full bg-ink transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  const field = (key, label, type = 'text', full = false) => (
    <div key={key} className={full ? 'col-span-2' : ''}>
      <label className="block text-[11px] tracking-widest uppercase text-stone mb-2">{label}</label>
      <input
        type={type}
        className="w-full border border-ash bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors disabled:opacity-50"
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        disabled={uploading}
      />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-4xl font-light mb-1">Upload <em>Artwork</em></h2>
      <p className="text-sm text-stone mb-8">Add a new piece to your gallery portfolio.</p>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-4 mb-6">
          <CheckCircle size={16} />
          Artwork published successfully! It is now live in the gallery.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 mb-6">{error}</div>
      )}

      {uploading && <ProgressBar />}

      <form onSubmit={handleSubmit}>
        {/* Drop zone */}
        <label className={`block border-2 border-dashed transition-colors p-8 text-center mb-8 ${
          uploading ? 'border-ash opacity-50 cursor-not-allowed' : 'border-ash hover:border-gold cursor-pointer'
        }`}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFile}
            disabled={uploading}
          />
          {preview ? (
            <div className="relative">
              <img src={preview} alt="preview" className="max-h-64 mx-auto object-contain" />
              {!uploading && (
                <p className="text-xs text-stone mt-3">Click to change image</p>
              )}
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto mb-3 opacity-20" />
              <p className="font-serif text-lg mb-1">Drop artwork image here</p>
              <p className="text-xs text-stone">JPEG, PNG, WebP · Max 10MB</p>
              <p className="text-xs text-mist mt-1">
                Compress large files at{' '}
                <span className="underline">tinypng.com</span> before uploading
              </p>
            </>
          )}
        </label>

        <div className="grid grid-cols-2 gap-5 mb-5">
          {field('title',       'Title *',              'text',   true)}
          {field('medium',      'Medium',               'text'       )}
          {field('price',       'Price *',              'number'     )}
          {field('size',        'Size (e.g. 60×90cm)',  'text'       )}
          {field('year',        'Year',                 'number'     )}
          <div>
            <label className="block text-[11px] tracking-widests uppercase text-stone mb-2">Currency</label>
            <select
              className="w-full border border-ash bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink disabled:opacity-50"
              value={form.currency}
              onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
              disabled={uploading}
            >
              <option>UGX</option>
              <option>USD</option>
              <option>KES</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] tracking-widests uppercase text-stone mb-2">Description</label>
            <textarea
              rows={4}
              className="w-full border border-ash bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink resize-y disabled:opacity-50"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              disabled={uploading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-3 bg-ink text-white px-8 py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : 'Publish Artwork'}
        </button>
      </form>
    </div>
  );
}