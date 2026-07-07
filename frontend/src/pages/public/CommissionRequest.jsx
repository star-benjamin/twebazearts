import { useState, useEffect, useRef } from 'react';
import { commissionApi } from '../../api/commission.api';

// Add/remove filenames to match what's in public/commission/
const COMMISSION_IMAGES = [
  '/commission/1.jpeg',
  '/commission/2.jpeg',
  '/commission/3.jpeg',
  '/commission/4.jpeg',
  '/commission/5.jpeg',
  '/commission/6.jpeg',
  '/commission/7.jpeg',
];

const SLIDE_INTERVAL = 5000; // ms
const SWIPE_THRESHOLD = 50; // px

function CommissionSlider({ images = COMMISSION_IMAGES }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  const goTo = (i) => setIndex(((i % images.length) + images.length) % images.length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [images.length, index]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD) {
      if (touchDeltaX.current < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (!images.length) return null;

  return (
    <div
      className="group relative w-full h-full min-h-[320px] overflow-hidden bg-ash/20"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Commissioned project ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100 animate-ken-burns' : 'opacity-0'
          }`}
        />
      ))}

      {/* arrow nav */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center
                       bg-white/70 hover:bg-white text-ink opacity-0 group-hover:opacity-100
                       transition-opacity duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center
                       bg-white/70 hover:bg-white text-ink opacity-0 group-hover:opacity-100
                       transition-opacity duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommissionRequest() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    client_ideas: '', spatial_constraints: '', material_choices: '', target_deadline: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await commissionApi.submit(form);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left column: form */}
        <div>
          <h1 className="font-serif text-[clamp(32px,4vw,52px)] font-light mb-4">
            Custom <em>Commissions</em>
          </h1>
          <p className="text-sm text-stone mb-12">
            Murals, sculptures, and bespoke pieces for commercial and corporate spaces —
            tell us about your project and we'll follow up to arrange a site visit.
          </p>

          {status === 'success' ? (
            <div className="border border-ash p-8 text-center">
              <p className="font-serif text-xl mb-2">Request received</p>
              <p className="text-sm text-stone">We'll review your commission request and reach out by email.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Full Name" value={form.name} onChange={set('name')}
                  className="border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink" />
                <input required type="email" placeholder="Email" value={form.email} onChange={set('email')}
                  className="border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink" />
              </div>
              <input placeholder="Phone / WhatsApp (optional)" value={form.phone} onChange={set('phone')}
                className="w-full border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink" />
              <textarea required rows={4} placeholder="Describe your idea…" value={form.client_ideas} onChange={set('client_ideas')}
                className="w-full border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink" />
              <textarea rows={2} placeholder="Spatial constraints (wall size, site access, etc.)" value={form.spatial_constraints} onChange={set('spatial_constraints')}
                className="w-full border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink" />
              <textarea rows={2} placeholder="Material preferences" value={form.material_choices} onChange={set('material_choices')}
                className="w-full border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink" />
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-stone mb-2">Target Deadline (optional)</label>
                <input type="date" value={form.target_deadline} onChange={set('target_deadline')}
                  className="w-full border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink" />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button type="submit" disabled={status === 'submitting'}
                className="w-full bg-ink text-white py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50">
                {status === 'submitting' ? 'Sending…' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>

        {/* Right column: image slider */}
        <div className="h-[400px] lg:h-full lg:sticky lg:top-24">
          <CommissionSlider />
        </div>
      </div>
    </div>
  );
}