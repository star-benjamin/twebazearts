import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { commissionApi } from '../../api/commission.api';
import { projectApi } from '../../api/project.api';

export default function ManageCommissions() {
  const qc = useQueryClient();
  const [promoting, setPromoting] = useState(null);

  const { data: commissions = [] } = useQuery({ queryKey: ['commissions'], queryFn: () => commissionApi.list() });

  const promoteMutation = useMutation({
    mutationFn: (body) => projectApi.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['commissions'] }); setPromoting(null); },
    onError: (err) => alert(err.response?.data?.error || 'Failed to create project'),
  });

  return (
    <AdminLayout>
      <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Custom <em>Commissions</em></h2>

      <div className="grid grid-cols-1 gap-4">
        {commissions.map((c) => (
          <div key={c.id} className="bg-white border border-ash p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-serif text-lg">{c.customer?.name}</h3>
                <p className="text-xs text-stone">{c.customer?.email} · {c.customer?.phone}</p>
              </div>
              <p className="text-[10px] text-mist">{new Date(c.created_at).toLocaleDateString()}</p>
            </div>
            <p className="text-sm mb-3">{c.client_ideas}</p>
            <div className="text-xs text-stone space-y-1 mb-4">
              {c.spatial_constraints && <p><strong>Spatial:</strong> {c.spatial_constraints}</p>}
              {c.material_choices && <p><strong>Materials:</strong> {c.material_choices}</p>}
              {c.target_deadline && <p><strong>Target Deadline:</strong> {c.target_deadline}</p>}
            </div>

            {c.projects?.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {c.projects.map((p) => (
                  <span key={p.id} className="text-[10px] uppercase tracking-wide px-2 py-1 bg-smoke">
                    Project: {p.title} · {p.stage}
                  </span>
                ))}
              </div>
            ) : promoting === c.id ? (
              <PromoteForm commission={c} onSubmit={(body) => promoteMutation.mutate(body)} onCancel={() => setPromoting(null)} />
            ) : (
              <button onClick={() => setPromoting(c.id)} className="text-[10px] uppercase tracking-widest border-b border-mist hover:border-ink">
                Promote to Project
              </button>
            )}
          </div>
        ))}
        {commissions.length === 0 && <p className="text-sm text-stone">No commission requests yet.</p>}
      </div>
    </AdminLayout>
  );
}

function PromoteForm({ commission, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [siteAddress, setSiteAddress] = useState('');

  return (
    <div className="mt-3 space-y-2 border-t border-ash pt-3">
      <input placeholder="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-ash px-3 py-2 text-sm" />
      <input placeholder="Site Address" value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} className="w-full border border-ash px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit({ commission_id: commission.id, customer_id: commission.customer_id, title, site_address: siteAddress })}
          className="flex-1 bg-ink text-white py-2 text-[10px] uppercase tracking-widest hover:bg-gold"
        >
          Create Project
        </button>
        <button onClick={onCancel} className="flex-1 border border-ash text-stone py-2 text-[10px] uppercase tracking-widest">Cancel</button>
      </div>
    </div>
  );
}
