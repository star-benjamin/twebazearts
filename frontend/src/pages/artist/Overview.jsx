import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function Overview() {
  const { user, profile } = useAuth();
  const { data } = useQuery({
    queryKey: ['my-artworks-count', user?.id],
    queryFn: () => client.get('/artworks', { params: { artist_id: user.id } }).then(r => r.data),
    enabled: !!user,
  });

  const stats = [
    { label: 'Active Works',    value: data?.total || 0,   accent: 'border-gold' },
    { label: 'Gallery Views',    value: '—',               accent: 'border-ink' },
    { label: 'Inquiries (30d)',  value: '—',               accent: 'border-emerald-600' },
  ];

  return (
    <div className="max-w-4xl">
      {/* Welcome Header */}
      <div className="mb-10 text-center sm:text-left">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-2">
          Good day, <em>{profile?.name?.split(' ')[0]}</em>
        </h2>
        <p className="text-sm text-stone">Here's your studio at a glance.</p>
      </div>

      {/* Stats Cards - Stacks on mobile, 3-wide on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`bg-white p-6 md:p-7 border-l-[3px] shadow-sm ${s.accent}`}>
            <div className="font-serif text-4xl md:text-5xl font-light leading-none">{s.value}</div>
            <div className="text-[10px] md:text-[11px] tracking-[.15em] uppercase text-stone mt-3">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Account Status Card */}
      <div className={`bg-white p-6 md:p-7 border-l-[3px] shadow-sm ${
        profile?.status === 'APPROVED' ? 'border-emerald-500' : 'border-gold'
      }`}>
        <div className="text-[9px] md:text-[10px] tracking-widest uppercase text-stone mb-4">
          Account Status
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className={`px-3 py-1.5 text-[10px] md:text-[11px] font-medium tracking-wide uppercase whitespace-nowrap ${
            profile?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
            profile?.status === 'PENDING'  ? 'bg-amber-50 text-amber-700' :
                                             'bg-red-50 text-red-700'
          }`}>
            {profile?.status === 'APPROVED' ? '✓ Approved' : profile?.status}
          </span>
          <span className="text-[13px] md:text-sm text-stone leading-relaxed">
            {profile?.status === 'APPROVED'
              ? 'Your profile is live and visible in the gallery.'
              : 'Your application is under review. You\'ll be notified when your gallery goes live.'}
          </span>
        </div>
      </div>
    </div>
  );
}