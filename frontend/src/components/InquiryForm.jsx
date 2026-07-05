import { useState } from 'react';
import { inquiryApi } from '../api/inquiry.api';

const CLASSIFICATIONS = [
  ['ARTWORK_PURCHASE', 'Artwork Purchase'],
  ['CUSTOM_COMMISSION', 'Custom Commission'],
  ['MURAL_PROJECT', 'Mural Project'],
  ['SCULPTURE_INSTALLATION', 'Sculpture Installation'],
  ['ART_CLASS_BOOKING', 'Art Class Booking'],
  ['GENERAL_INFO', 'General Info'],
];

export default function InquiryForm({ artworkId, defaultClassification = 'GENERAL_INFO', onSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', classification: defaultClassification, message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await inquiryApi.submit({ ...form, artwork_id: artworkId });
      setStatus('success');
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="border border-ash p-6 text-center">
        <p className="font-serif text-xl mb-2">Thank you</p>
        <p className="text-sm text-stone">
          Your inquiry has been received. We'll be in touch by email shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required value={form.name} onChange={set('name')} placeholder="Full Name"
          className="border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink"
        />
        <input
          required type="email" value={form.email} onChange={set('email')} placeholder="Email"
          className="border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink"
        />
      </div>
      <input
        value={form.phone} onChange={set('phone')} placeholder="Phone / WhatsApp (optional)"
        className="w-full border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />
      <select
        value={form.classification} onChange={set('classification')}
        className="w-full border border-ash px-4 py-3 text-sm bg-white focus:outline-none focus:border-ink"
      >
        {CLASSIFICATIONS.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <textarea
        required rows={5} value={form.message} onChange={set('message')} placeholder="Tell us what you're looking for…"
        className="w-full border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit" disabled={status === 'submitting'}
        className="w-full bg-ink text-white py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending…' : 'Submit Inquiry'}
      </button>
    </form>
  );
}
