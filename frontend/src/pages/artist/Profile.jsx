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
    try {
      await client.patch('/auth/profile', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto lg:mx-0">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-1">Artist <em>Profile</em></h2>
        <p className="text-[12px] md:text-sm text-stone">This information is visible to collectors.</p>
      </div>

      {success && (
        <div className="fixed top-20 right-4 left-4 sm:static sm:w-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[13px] p-4 mb-8 text-center sm:text-left animate-in slide-in-from-top-2 duration-300">
          ✓ Profile updated successfully
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['name', 'Full Name'],
            ['whatsapp_number', 'WhatsApp (e.g. 256700000000)'],
            ['instagram_handle', 'Instagram @handle'],
            ['location', 'Location (City, Country)'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-[10px] md:text-[11px] tracking-[.15em] uppercase text-stone mb-2.5">
                {label}
              </label>
              <input
                className="w-full border border-ash bg-white px-4 py-3.5 text-base md:text-sm focus:outline-none focus:border-ink transition-colors rounded-none appearance-none"
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={`Your ${label.split('(')[0].trim().toLowerCase()}...`}
              />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <label className="block text-[10px] md:text-[11px] tracking-[.15em] uppercase text-stone mb-2.5">Bio</label>
          <textarea
            rows={6}
            className="w-full border border-ash bg-white px-4 py-4 text-base md:text-sm focus:outline-none focus:border-ink resize-y rounded-none appearance-none leading-relaxed"
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell collectors about your journey and inspiration..."
          />
        </div>

        <div className="pt-4 flex justify-center sm:justify-start">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-ink text-white px-12 py-4 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50 transition-all duration-300"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}