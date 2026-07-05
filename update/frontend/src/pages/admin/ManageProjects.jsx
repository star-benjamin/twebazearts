import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { projectApi } from '../../api/project.api';
import { paymentApi } from '../../api/payment.api';

const STAGES = ['INITIATION', 'SITE_ASSESSMENT', 'PROPOSAL_PHASE', 'EXECUTION', 'COMPLETED'];

export default function ManageProjects() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => projectApi.list() });
  const { data: detail } = useQuery({
    queryKey: ['project', selected], queryFn: () => projectApi.detail(selected), enabled: !!selected,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => projectApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', 'project'] }),
    onError: (err) => alert(err.response?.data?.error || 'Update failed'),
  });

  const paymentMutation = useMutation({
    mutationFn: (body) => paymentApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project'] }),
    onError: (err) => alert(err.response?.data?.error || 'Failed to log payment'),
  });

  return (
    <AdminLayout>
      <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Large-Scale <em>Projects</em></h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="divide-y divide-ash bg-white border border-ash">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setSelected(p.id)} className={`w-full text-left p-4 hover:bg-smoke/40 ${selected === p.id ? 'bg-smoke/60' : ''}`}>
              <div className="flex justify-between">
                <span className="font-serif">{p.title}</span>
                <span className="text-[9px] uppercase tracking-wide px-2 py-0.5 bg-smoke">{p.stage}</span>
              </div>
              <p className="text-xs text-stone">{p.customer?.name} · {p.site_address}</p>
            </button>
          ))}
          {projects.length === 0 && <p className="p-6 text-sm text-stone">No projects yet — promote a commission first.</p>}
        </div>

        {detail && (
          <div className="bg-white border border-ash p-6 space-y-4">
            <h3 className="font-serif text-xl">{detail.title}</h3>
            <p className="text-xs text-stone">{detail.customer?.name} · {detail.customer?.email}</p>

            <label className="block text-[10px] tracking-widest uppercase text-stone">Stage</label>
            <select
              value={detail.stage}
              onChange={(e) => updateMutation.mutate({ id: detail.id, body: { stage: e.target.value } })}
              className="w-full border border-ash px-3 py-2 text-sm bg-white"
            >
              {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <p className="text-[10px] text-stone">
              BR-PRO-001: can't move to Completed until logged payments cover Operational Costs below.
            </p>

            <FieldEditor label="Site Address" value={detail.site_address} onSave={(v) => updateMutation.mutate({ id: detail.id, body: { site_address: v } })} />
            <FieldEditor label="Architectural Dimensions" value={detail.architectural_dimensions} onSave={(v) => updateMutation.mutate({ id: detail.id, body: { architectural_dimensions: v } })} />
            <FieldEditor label="Surface Characteristics" value={detail.surface_characteristics} onSave={(v) => updateMutation.mutate({ id: detail.id, body: { surface_characteristics: v } })} />
            <FieldEditor label="Assessment Logs" value={detail.assessment_logs} multiline onSave={(v) => updateMutation.mutate({ id: detail.id, body: { assessment_logs: v } })} />
            <FieldEditor label="Execution Schedule" value={detail.execution_schedule} multiline onSave={(v) => updateMutation.mutate({ id: detail.id, body: { execution_schedule: v } })} />
            <FieldEditor label="Assigned Resources" value={detail.assigned_resources} onSave={(v) => updateMutation.mutate({ id: detail.id, body: { assigned_resources: v } })} />
            <FieldEditor label="Operational Costs (UGX)" value={detail.operational_costs} type="number" onSave={(v) => updateMutation.mutate({ id: detail.id, body: { operational_costs: Number(v) } })} />

            <div className="border-t border-ash pt-4">
              <h4 className="text-[10px] tracking-widest uppercase text-stone mb-2">Payments Logged</h4>
              <ul className="text-xs text-stone mb-3 space-y-1">
                {(detail.payments || []).map((p) => (
                  <li key={p.id}>{p.payment_date} — {p.payment_type} — UGX {Number(p.amount).toLocaleString()}</li>
                ))}
                {(!detail.payments || detail.payments.length === 0) && <li>No payments logged yet.</li>}
              </ul>
              <PaymentForm onSubmit={(body) => paymentMutation.mutate({ ...body, related_type: 'PROJECT', related_id: detail.id })} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function FieldEditor({ label, value, onSave, multiline, type = 'text' }) {
  const [val, setVal] = useState(value || '');
  const Input = multiline ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-[10px] tracking-widest uppercase text-stone mb-1">{label}</label>
      <div className="flex gap-2">
        <Input type={type} rows={multiline ? 2 : undefined} value={val} onChange={(e) => setVal(e.target.value)} className="flex-1 border border-ash px-3 py-2 text-sm" />
        <button onClick={() => onSave(val)} className="text-[10px] uppercase tracking-widest border-b border-mist hover:border-ink whitespace-nowrap">Save</button>
      </div>
    </div>
  );
}

function PaymentForm({ onSubmit }) {
  const [type, setType] = useState('Bank Transfer');
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');

  return (
    <div className="flex flex-wrap gap-2">
      <select value={type} onChange={(e) => setType(e.target.value)} className="border border-ash px-2 py-1.5 text-xs bg-white">
        {['Bank Transfer', 'Mobile Money', 'Cash'].map((t) => <option key={t}>{t}</option>)}
      </select>
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28 border border-ash px-2 py-1.5 text-xs" />
      <input placeholder="Reference ID" value={ref} onChange={(e) => setRef(e.target.value)} className="w-32 border border-ash px-2 py-1.5 text-xs" />
      <button
        onClick={() => { onSubmit({ payment_type: type, amount: Number(amount), invoice_reference: ref }); setAmount(''); setRef(''); }}
        className="bg-ink text-white px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-gold"
      >
        Log Payment
      </button>
    </div>
  );
}
