import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, Inbox, Wrench, GraduationCap, Users, Image as ImageIcon, AlertCircle,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/admin.api';

const fmtMoney = (n) => (typeof n === 'number' ? `UGX ${n.toLocaleString()}` : '—');
const fmtNum   = (n) => (typeof n === 'number' ? n : '—');

const CARDS = [
  {
    key: 'sales',
    label: 'Monthly sales',
    icon: DollarSign,
    accent: 'text-gold',
    value: (s) => fmtMoney(s?.monthlySalesValue),
  },
  {
    key: 'newInquiries',
    label: 'New inquiries',
    icon: Inbox,
    accent: 'text-teal',
    value: (s) => fmtNum(s?.inquiries?.new),
  },
  {
    key: 'inProgress',
    label: 'In-progress inquiries',
    icon: Wrench,
    accent: 'text-teal',
    value: (s) => fmtNum(s?.inquiries?.inProgress),
  },
  {
    key: 'upcomingClasses',
    label: 'Upcoming classes',
    icon: GraduationCap,
    accent: 'text-gold',
    value: (s) => fmtNum(s?.upcomingClassCount),
  },
  {
    key: 'registrations',
    label: 'Active class registrations',
    icon: Users,
    accent: 'text-gold',
    value: (s) => fmtNum(s?.activeClassRegistrations),
  },
  {
    key: 'artworks',
    label: 'Published artworks',
    icon: ImageIcon,
    accent: 'text-teal',
    value: (s) => (s?.artworks ? `${fmtNum(s.artworks.published)} / ${fmtNum(s.artworks.total)}` : '—'),
  },
];

function CardSkeleton() {
  return (
    <div className="bg-white p-5 md:p-6 rounded-sm animate-pulse">
      <div className="w-5 h-5 bg-ash rounded-sm mb-4" />
      <div className="h-8 w-2/3 bg-ash rounded-sm mb-3" />
      <div className="h-2.5 w-1/2 bg-ash rounded-sm" />
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(),
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
        <h2 className="font-serif text-3xl md:text-4xl font-light">Studio <em>Overview</em></h2>
        <span className="text-xs text-stone">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <p className="text-sm text-stone mb-8">A snapshot of sales, inquiries, and studio activity.</p>

      {isError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-xs p-4 mb-6 rounded-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            Couldn't load dashboard stats: {error?.response?.data?.error || error?.message || 'Unknown error'}.
            Check that the backend has the latest <code>admin.controller.js</code> deployed.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {isLoading
          ? CARDS.map((c) => <CardSkeleton key={c.key} />)
          : CARDS.map(({ key, label, icon: Icon, accent, value }) => (
              <div key={key} className="bg-white p-5 md:p-6 rounded-sm">
                <Icon size={18} className={`${accent} mb-4`} />
                <div className="font-serif text-3xl md:text-4xl font-light leading-none mb-2">
                  {value(stats)}
                </div>
                <div className="text-[11px] tracking-[.15em] uppercase text-stone">{label}</div>
              </div>
            ))}
      </div>
    </AdminLayout>
  );
}