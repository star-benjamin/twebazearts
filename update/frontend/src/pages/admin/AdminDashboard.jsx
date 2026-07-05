import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/admin.api';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(),
  });

  return (
    <AdminLayout>
      <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Studio <em>Overview</em></h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        {[
          ['Monthly Sales', stats ? `UGX ${stats.monthlySalesValue.toLocaleString()}` : '—', 'border-gold'],
          ['New Inquiries', stats?.inquiries?.new ?? '—', 'border-amber-400'],
          ['In-Progress Inquiries', stats?.inquiries?.inProgress ?? '—', 'border-blue-400'],
          ['Upcoming Classes', stats?.upcomingClassCount ?? '—', 'border-emerald-500'],
          ['Active Class Registrations', stats?.activeClassRegistrations ?? '—', 'border-emerald-500'],
          ['Published Artworks', stats ? `${stats.artworks.published} / ${stats.artworks.total}` : '—', 'border-stone-400'],
        ].map(([label, val, accent]) => (
          <div key={label} className={`bg-white p-6 md:p-8 border-l-[4px] shadow-sm ${accent}`}>
            <div className="font-serif text-3xl md:text-4xl font-light leading-none mb-3">{val}</div>
            <div className="text-[10px] md:text-[11px] tracking-[.2em] uppercase text-stone">{label}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-stone">
        Artwork view counts require wiring up a view-tracking column — see the note in
        <code className="mx-1 bg-white px-1.5 py-0.5 border border-ash">admin.controller.js</code>.
      </p>
    </AdminLayout>
  );
}
