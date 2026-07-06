import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/admin.api';

// Safely format a number that might be missing/malformed on the response —
// this is what was crashing before: calling .toLocaleString() on undefined
// when `stats` came back without the expected fields.
const fmtMoney = (n) => (typeof n === 'number' ? `UGX ${n.toLocaleString()}` : '—');
const fmtNum   = (n) => (typeof n === 'number' ? n : '—');

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(),
  });

  return (
    <AdminLayout>
      <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Studio <em>Overview</em></h2>

      {isError && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-4 mb-6">
          Couldn't load dashboard stats: {error?.response?.data?.error || error?.message || 'Unknown error'}.
          Check that the backend has the latest <code>admin.controller.js</code> deployed.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        {[
          ['Monthly Sales', fmtMoney(stats?.monthlySalesValue), 'border-gold'],
          ['New Inquiries', fmtNum(stats?.inquiries?.new), 'border-amber-400'],
          ['In-Progress Inquiries', fmtNum(stats?.inquiries?.inProgress), 'border-blue-400'],
          ['Upcoming Classes', fmtNum(stats?.upcomingClassCount), 'border-emerald-500'],
          ['Active Class Registrations', fmtNum(stats?.activeClassRegistrations), 'border-emerald-500'],
          ['Published Artworks', stats?.artworks ? `${fmtNum(stats.artworks.published)} / ${fmtNum(stats.artworks.total)}` : '—', 'border-stone-400'],
        ].map(([label, val, accent]) => (
          <div key={label} className={`bg-white p-6 md:p-8 border-l-[4px] shadow-sm ${accent}`}>
            <div className="font-serif text-3xl md:text-4xl font-light leading-none mb-3">
              {isLoading ? '…' : val}
            </div>
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