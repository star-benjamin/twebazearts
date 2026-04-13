import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
 
export default function Profile() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', whatsapp_number: '', instagram_handle: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
 
  useEffect(() => {
    if (profile) setForm({
      name:             profile.name             || '',
      bio:              profile.bio              || '',
      whatsapp_number:  profile.whatsapp_number  || '',
      instagram_handle: profile.instagram_handle || '',
      location:         profile.location         || '',
    });
  }, [profile]);
 
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await client.patch('/auth/profile', form);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };
 
  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-4xl font-light mb-1">Artist <em>Profile</em></h2>
      <p className="text-sm text-stone mb-8">This information is visible to collectors.</p>
 
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 mb-6">✓ Profile updated</div>}
 
      <form onSubmit={handleSave} className="space-y-5">
        {[
          ['name',             'Full Name'],
          ['whatsapp_number',  'WhatsApp Number (digits only, e.g. 256700000000)'],
          ['instagram_handle', 'Instagram Handle'],
          ['location',         'Location (e.g. Kampala, Uganda)'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-[11px] tracking-widest uppercase text-stone mb-2">{label}</label>
            <input
              className="w-full border border-ash bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
              value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div>
          <label className="block text-[11px] tracking-widest uppercase text-stone mb-2">Bio</label>
          <textarea
            rows={5}
            className="w-full border border-ash bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink resize-y"
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-white px-8 py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}