import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ShieldCheck } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { artistApi } from '../../api/artist.api';

const EMPTY_FORM = { full_name: '', biography: '', profile_image_url: '', contact_email: '', contact_phone: '', specializations: '' };

export default function ManageArtists() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: artists = [] } = useQuery({ queryKey: ['artists', 'admin'], queryFn: () => artistApi.list({ admin: '1' }) });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => artistApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['artists', 'admin'] }),
    onError: (err) => alert(err.response?.data?.error || 'Update failed'),
  });

  const removeMutation = useMutation({
    mutationFn: artistApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['artists', 'admin'] }),
    onError: (err) => alert(err.response?.data?.error || 'Delete failed'),
  });

  const statusBadge = (status) => {
    const map = { ACTIVE: 'bg-emerald-50 text-emerald-700', SUSPENDED: 'bg-amber-50 text-amber-700', ARCHIVED: 'bg-stone-100 text-stone-500' };
    return <span className={`px-2 py-0.5 text-[9px] tracking-wide uppercase font-medium ${map[status] || ''}`}>{status}</span>;
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-light">Manage <em>Artists</em></h2>
        <button onClick={() => setEditing('new')} className="bg-ink text-white px-5 py-2.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors">
          + New Artist
        </button>
      </div>

      <div className="hidden lg:block overflow-x-auto bg-white border border-ash">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-smoke/50">
              {['Name', 'Contact', 'Works', 'Status', 'Verified', 'Actions'].map((h) => (
                <th key={h} className="text-[10px] tracking-widest uppercase text-stone px-6 py-4 text-left border-b border-ash">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ash">
            {artists.map((a) => (
              <tr key={a.id} className="hover:bg-smoke/30 transition-colors">
                <td className="px-6 py-4 font-serif text-base">{a.full_name}</td>
                <td className="px-6 py-4 text-stone text-sm">{a.contact_email}</td>
                <td className="px-6 py-4 text-sm">{a.artworks?.[0]?.count || 0}</td>
                <td className="px-6 py-4">{statusBadge(a.status)}</td>
                <td className="px-6 py-4">
                  <button onClick={() => updateMutation.mutate({ id: a.id, body: { verified: !a.verified } })} className={a.verified ? 'text-gold' : 'text-stone-300 hover:text-stone'}>
                    <ShieldCheck size={16} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3 items-center">
                    <button onClick={() => setEditing(a)} className="text-[10px] uppercase tracking-widest border-b border-mist hover:border-ink">Edit</button>
                    <select
                      value={a.status}
                      onChange={(e) => updateMutation.mutate({ id: a.id, body: { status: e.target.value } })}
                      className="text-[10px] border border-ash px-1 py-1"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                    <button onClick={() => window.confirm('Delete this artist?') && removeMutation.mutate(a.id)} className="text-red-400 hover:text-red-600 text-[10px] uppercase tracking-widest">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {artists.map((a) => (
          <div key={a.id} className="bg-white p-5 border border-ash">
            <div className="flex justify-between items-start mb-2">
              <div className="font-serif text-lg">{a.full_name}</div>
              {statusBadge(a.status)}
            </div>
            <p className="text-xs text-stone mb-3">{a.contact_email}</p>
            <div className="flex gap-3">
              <button onClick={() => setEditing(a)} className="text-[10px] uppercase tracking-widest border-b border-mist">Edit</button>
              <button onClick={() => window.confirm('Delete?') && removeMutation.mutate(a.id)} className="text-[10px] uppercase tracking-widest text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ArtistEditor
          artist={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ['artists', 'admin'] }); }}
        />
      )}
    </AdminLayout>
  );
}

function ArtistEditor({ artist, onClose, onSaved }) {
  const [form, setForm] = useState(artist ? {
    full_name: artist.full_name || '', biography: artist.biography || '', profile_image_url: artist.profile_image_url || '',
    contact_email: artist.contact_email || '', contact_phone: artist.contact_phone || '',
    specializations: (artist.specializations || []).join(', '),
  } : EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, specializations: form.specializations.split(',').map((s) => s.trim()).filter(Boolean) };
      if (artist) await artistApi.update(artist.id, payload);
      else await artistApi.create(payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-2xl">{artist ? 'Edit Artist' : 'New Artist'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Full Name" value={form.full_name} onChange={set('full_name')} className="w-full border border-ash px-3 py-2 text-sm" />
          <textarea rows={3} placeholder="Biography" value={form.biography} onChange={set('biography')} className="w-full border border-ash px-3 py-2 text-sm" />
          <input placeholder="Profile Image URL" value={form.profile_image_url} onChange={set('profile_image_url')} className="w-full border border-ash px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="email" placeholder="Contact Email" value={form.contact_email} onChange={set('contact_email')} className="border border-ash px-3 py-2 text-sm" />
            <input placeholder="Contact Phone" value={form.contact_phone} onChange={set('contact_phone')} className="border border-ash px-3 py-2 text-sm" />
          </div>
          <input placeholder="Specializations (comma-separated)" value={form.specializations} onChange={set('specializations')} className="w-full border border-ash px-3 py-2 text-sm" />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={saving} className="w-full bg-ink text-white py-3 text-[11px] tracking-widest uppercase hover:bg-gold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Artist'}
          </button>
        </form>
      </div>
    </div>
  );
}
