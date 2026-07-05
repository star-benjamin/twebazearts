import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { testimonialApi } from '../../api/testimonial.api';

export default function ManageTestimonials() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ customer_name: '', content: '' });

  const { data: testimonials = [] } = useQuery({ queryKey: ['testimonials', 'admin'], queryFn: () => testimonialApi.list({ admin: '1' }) });

  const createMutation = useMutation({
    mutationFn: testimonialApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); setForm({ customer_name: '', content: '' }); },
  });
  const togglePublish = useMutation({
    mutationFn: ({ id, published }) => testimonialApi.update(id, { published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }),
  });
  const removeMutation = useMutation({
    mutationFn: testimonialApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }),
  });

  return (
    <AdminLayout>
      <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Client <em>Testimonials</em></h2>

      <div className="bg-white border border-ash p-6 mb-8">
        <h3 className="font-serif text-lg mb-4">Log a Testimonial</h3>
        <div className="space-y-3">
          <input placeholder="Customer Name" value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} className="w-full border border-ash px-3 py-2 text-sm" />
          <textarea rows={3} placeholder="Testimonial content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="w-full border border-ash px-3 py-2 text-sm" />
          <button onClick={() => createMutation.mutate(form)} className="bg-ink text-white px-5 py-2.5 text-[11px] tracking-widest uppercase hover:bg-gold">
            Add Testimonial
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white border border-ash p-5">
            <p className="text-sm italic mb-3">"{t.content}"</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">{t.customer_name}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-stone">
                  <input type="checkbox" checked={t.published} onChange={(e) => togglePublish.mutate({ id: t.id, published: e.target.checked })} />
                  Published
                </label>
                <button onClick={() => removeMutation.mutate(t.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
