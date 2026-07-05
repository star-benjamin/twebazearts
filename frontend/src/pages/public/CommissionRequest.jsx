import { useState } from 'react';
import { commissionApi } from '../../api/commission.api';

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
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20 max-w-2xl mx-auto">
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
  );
}
