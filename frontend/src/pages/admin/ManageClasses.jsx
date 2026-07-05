import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { classApi } from '../../api/class.api';

const EMPTY_FORM = { course_title: '', description: '', instructor: '', session_datetime: '', capacity: '', registration_fee: '' };

export default function ManageClasses() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [rosterFor, setRosterFor] = useState(null);

  const { data: classes = [] } = useQuery({ queryKey: ['classes', 'admin'], queryFn: () => classApi.list({ upcoming: '0' }) });

  const removeMutation = useMutation({
    mutationFn: classApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-light">Art <em>Classes</em></h2>
        <button onClick={() => setEditing('new')} className="bg-ink text-white px-5 py-2.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors">
          + New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="bg-white border border-ash p-5">
            <h3 className="font-serif text-lg mb-1">{c.course_title}</h3>
            <p className="text-xs text-stone mb-3">{c.instructor} · {new Date(c.session_datetime).toLocaleString()}</p>
            <p className="text-xs mb-3">{c.seats_taken}/{c.capacity} booked</p>
            <div className="flex gap-3">
              <button onClick={() => setRosterFor(c)} className="text-[10px] uppercase tracking-widest border-b border-mist hover:border-ink">Roster</button>
              <button onClick={() => setEditing(c)} className="text-[10px] uppercase tracking-widest border-b border-mist hover:border-ink">Edit</button>
              <button onClick={() => window.confirm('Delete this class?') && removeMutation.mutate(c.id)} className="text-red-400 hover:text-red-600 ml-auto"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {classes.length === 0 && <p className="text-sm text-stone">No classes scheduled yet.</p>}
      </div>

      {editing && (
        <ClassEditor cls={editing === 'new' ? null : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ['classes'] }); }} />
      )}
      {rosterFor && <RosterModal cls={rosterFor} onClose={() => setRosterFor(null)} />}
    </AdminLayout>
  );
}

function ClassEditor({ cls, onClose, onSaved }) {
  const [form, setForm] = useState(cls ? {
    course_title: cls.course_title, description: cls.description || '', instructor: cls.instructor || '',
    session_datetime: cls.session_datetime?.slice(0, 16) || '', capacity: cls.capacity, registration_fee: cls.registration_fee,
  } : EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, capacity: Number(form.capacity), registration_fee: Number(form.registration_fee || 0) };
      if (cls) await classApi.update(cls.id, payload);
      else await classApi.create(payload);
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
          <h3 className="font-serif text-2xl">{cls ? 'Edit Class' : 'New Class'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Course Title" value={form.course_title} onChange={set('course_title')} className="w-full border border-ash px-3 py-2 text-sm" />
          <textarea rows={3} placeholder="Description" value={form.description} onChange={set('description')} className="w-full border border-ash px-3 py-2 text-sm" />
          <input placeholder="Instructor" value={form.instructor} onChange={set('instructor')} className="w-full border border-ash px-3 py-2 text-sm" />
          <input required type="datetime-local" value={form.session_datetime} onChange={set('session_datetime')} className="w-full border border-ash px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={set('capacity')} className="border border-ash px-3 py-2 text-sm" />
            <input type="number" min="0" placeholder="Registration Fee (UGX)" value={form.registration_fee} onChange={set('registration_fee')} className="border border-ash px-3 py-2 text-sm" />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={saving} className="w-full bg-ink text-white py-3 text-[11px] tracking-widest uppercase hover:bg-gold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Class'}
          </button>
        </form>
      </div>
    </div>
  );
}

function RosterModal({ cls, onClose }) {
  const qc = useQueryClient();
  const { data: roster = [] } = useQuery({ queryKey: ['roster', cls.id], queryFn: () => classApi.roster(cls.id) });

  const attendMutation = useMutation({
    mutationFn: ({ bookingId, attended }) => classApi.markAttendance(cls.id, bookingId, attended),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roster', cls.id] }),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-2xl">{cls.course_title} — Roster</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[10px] uppercase tracking-widest text-stone border-b border-ash">
            <th className="py-2">Student</th><th>Contact</th><th>Attended</th>
          </tr></thead>
          <tbody className="divide-y divide-ash">
            {roster.map((b) => (
              <tr key={b.id}>
                <td className="py-2">{b.student_name}</td>
                <td className="text-stone">{b.contact_details}</td>
                <td>
                  <input type="checkbox" checked={b.attended} onChange={(e) => attendMutation.mutate({ bookingId: b.id, attended: e.target.checked })} />
                </td>
              </tr>
            ))}
            {roster.length === 0 && <tr><td colSpan={3} className="py-4 text-stone">No sign-ups yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
