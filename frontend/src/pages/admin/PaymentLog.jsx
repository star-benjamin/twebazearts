import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { paymentApi } from '../../api/payment.api';

const RELATED_TYPES = ['INQUIRY', 'COMMISSION', 'PROJECT', 'BOOKING'];

export default function PaymentLog() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ related_type: 'PROJECT', related_id: '', payment_type: 'Bank Transfer', amount: '', invoice_reference: '', notes: '' });

  const { data: payments = [] } = useQuery({ queryKey: ['payments'], queryFn: () => paymentApi.list() });

  const createMutation = useMutation({
    mutationFn: paymentApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); setForm((f) => ({ ...f, related_id: '', amount: '', invoice_reference: '', notes: '' })); },
    onError: (err) => alert(err.response?.data?.error || 'Failed to log payment'),
  });

  const removeMutation = useMutation({
    mutationFn: paymentApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AdminLayout>
      <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Manual <em>Payments</em></h2>
      <p className="text-xs text-stone mb-6">
        BR-GEN-002: no online checkout exists. Log offline bank, mobile money, or cash payments here against the relevant record.
      </p>

      <div className="bg-white border border-ash p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={form.related_type} onChange={set('related_type')} className="border border-ash px-3 py-2 text-sm bg-white">
          {RELATED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input placeholder="Related Record ID (UUID)" value={form.related_id} onChange={set('related_id')} className="border border-ash px-3 py-2 text-sm" />
        <select value={form.payment_type} onChange={set('payment_type')} className="border border-ash px-3 py-2 text-sm bg-white">
          {['Bank Transfer', 'Mobile Money', 'Cash'].map((t) => <option key={t}>{t}</option>)}
        </select>
        <input type="number" placeholder="Amount (UGX)" value={form.amount} onChange={set('amount')} className="border border-ash px-3 py-2 text-sm" />
        <input placeholder="Invoice / Reference ID" value={form.invoice_reference} onChange={set('invoice_reference')} className="border border-ash px-3 py-2 text-sm" />
        <input placeholder="Notes" value={form.notes} onChange={set('notes')} className="border border-ash px-3 py-2 text-sm" />
        <button
          onClick={() => createMutation.mutate({ ...form, amount: Number(form.amount) })}
          className="sm:col-span-2 bg-ink text-white py-2.5 text-[11px] tracking-widest uppercase hover:bg-gold"
        >
          Log Payment
        </button>
      </div>

      <div className="hidden lg:block overflow-x-auto bg-white border border-ash">
        <table className="w-full border-collapse">
          <thead><tr className="bg-smoke/50">
            {['Date', 'Type', 'Related', 'Reference', 'Amount', ''].map((h) => (
              <th key={h} className="text-[10px] tracking-widest uppercase text-stone px-6 py-4 text-left border-b border-ash">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-ash">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-3 text-sm">{p.payment_date}</td>
                <td className="px-6 py-3 text-sm">{p.payment_type}</td>
                <td className="px-6 py-3 text-xs text-stone">{p.related_type} · {p.related_id.slice(0, 8)}…</td>
                <td className="px-6 py-3 text-xs text-stone">{p.invoice_reference}</td>
                <td className="px-6 py-3 text-sm">UGX {Number(p.amount).toLocaleString()}</td>
                <td className="px-6 py-3"><button onClick={() => removeMutation.mutate(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
