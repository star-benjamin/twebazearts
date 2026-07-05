import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { inquiryApi } from '../../api/inquiry.api';
import { commissionApi } from '../../api/commission.api';

const STATUSES = ['NEW', 'IN_PROGRESS', 'QUOTED', 'CONVERTED', 'CLOSED'];
const STATUS_COLORS = {
  NEW: 'bg-blue-50 text-blue-700', IN_PROGRESS: 'bg-amber-50 text-amber-700',
  QUOTED: 'bg-purple-50 text-purple-700', CONVERTED: 'bg-emerald-50 text-emerald-700', CLOSED: 'bg-stone-100 text-stone-500',
};

export default function InquiryQueue() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const { data } = useQuery({
    queryKey: ['inquiries', statusFilter, q],
    queryFn: () => inquiryApi.list({ status: statusFilter || undefined, q: q || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => inquiryApi.update(id, body),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      setSelected(updated);
    },
  });

  const convertMutation = useMutation({
    mutationFn: (inquiryId) => commissionApi.createFromInquiry(inquiryId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inquiries'] }); alert('Converted to a commission — see the Commissions tab.'); },
  });

  const inquiries = data?.items || [];

  return (
    <AdminLayout>
      <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Inquiry <em>Queue</em></h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages…" className="flex-1 border border-ash px-3 py-2 text-sm" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-ash px-3 py-2 text-sm bg-white">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="divide-y divide-ash bg-white border border-ash">
          {inquiries.length === 0 && <p className="p-6 text-sm text-stone">No inquiries match this filter.</p>}
          {inquiries.map((inq) => (
            <button key={inq.id} onClick={() => setSelected(inq)} className={`w-full text-left p-4 hover:bg-smoke/40 transition-colors ${selected?.id === inq.id ? 'bg-smoke/60' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-serif text-base">{inq.customer?.name}</span>
                <span className={`text-[9px] uppercase tracking-wide px-2 py-0.5 ${STATUS_COLORS[inq.status]}`}>{inq.status}</span>
              </div>
              <p className="text-xs text-stone mb-1">{inq.classification.replace(/_/g, ' ')} {inq.artwork ? `· ${inq.artwork.title}` : ''}</p>
              <p className="text-xs text-mist truncate">{inq.message}</p>
              <p className="text-[10px] text-mist mt-1">{new Date(inq.created_at).toLocaleString()}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="bg-white border border-ash p-6">
            <h3 className="font-serif text-xl mb-1">{selected.customer?.name}</h3>
            <p className="text-xs text-stone mb-4">{selected.customer?.email} · {selected.customer?.phone}</p>
            <p className="text-sm mb-6 whitespace-pre-wrap">{selected.message}</p>

            <label className="block text-[10px] tracking-widest uppercase text-stone mb-2">Status</label>
            <select
              value={selected.status}
              onChange={(e) => updateMutation.mutate({ id: selected.id, body: { status: e.target.value } })}
              className="w-full border border-ash px-3 py-2 text-sm mb-4 bg-white"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="block text-[10px] tracking-widest uppercase text-stone mb-2">Internal Notes</label>
            <NotesEditor inquiry={selected} onSave={(notes) => updateMutation.mutate({ id: selected.id, body: { internal_notes: notes } })} />

            {selected.quote_pdf_url && (
              <a href={selected.quote_pdf_url} target="_blank" rel="noreferrer" className="block text-xs text-ink underline mt-4">
                View generated quote PDF
              </a>
            )}

            <QuoteGenerator inquiry={selected} onGenerated={(updated) => { setSelected(updated); qc.invalidateQueries({ queryKey: ['inquiries'] }); }} />

            <div className="flex gap-3 mt-6">
              {['CUSTOM_COMMISSION', 'MURAL_PROJECT', 'SCULPTURE_INSTALLATION'].includes(selected.classification) && selected.status !== 'CONVERTED' && (
                <button onClick={() => convertMutation.mutate(selected.id)} className="flex-1 border border-ink text-ink py-2.5 text-[10px] uppercase tracking-widest hover:bg-ink hover:text-white transition-colors">
                  Convert to Commission
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function QuoteGenerator({ inquiry, onGenerated }) {
  const [items, setItems] = useState([{ description: '', amount: '' }]);
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  const updateItem = (i, key, val) => setItems((its) => its.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  const generate = async () => {
    setGenerating(true);
    try {
      const updated = await inquiryApi.generateQuote(inquiry.id, {
        line_items: items.filter((i) => i.description && i.amount).map((i) => ({ ...i, amount: Number(i.amount) })),
        notes,
      });
      onGenerated(updated);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate quote');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mt-6 border-t border-ash pt-6">
      <label className="block text-[10px] tracking-widest uppercase text-stone mb-2">Generate PDF Quote (FR-INQ-007)</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input placeholder="Line item description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="flex-1 border border-ash px-2 py-1.5 text-sm" />
          <input type="number" placeholder="UGX" value={item.amount} onChange={(e) => updateItem(i, 'amount', e.target.value)} className="w-28 border border-ash px-2 py-1.5 text-sm" />
        </div>
      ))}
      <button onClick={() => setItems((its) => [...its, { description: '', amount: '' }])} className="text-[10px] uppercase tracking-widest border-b border-mist mb-3">
        + Add Line
      </button>
      <textarea rows={2} placeholder="Quote notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-ash px-3 py-2 text-sm mb-3" />
      <button onClick={generate} disabled={generating} className="w-full border border-ink text-ink py-2.5 text-[10px] uppercase tracking-widest hover:bg-ink hover:text-white transition-colors disabled:opacity-50">
        {generating ? 'Generating…' : 'Generate & Attach Quote'}
      </button>
    </div>
  );
}

function NotesEditor({ inquiry, onSave }) {
  const [notes, setNotes] = useState(inquiry.internal_notes || '');
  return (
    <div>
      <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-ash px-3 py-2 text-sm mb-2" />
      <button onClick={() => onSave(notes)} className="text-[10px] uppercase tracking-widest border-b border-mist hover:border-ink">Save Notes</button>
    </div>
  );
}
