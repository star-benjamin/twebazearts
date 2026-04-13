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
    { label: 'Active Works',     value: data?.total || 0,  accent: 'border-gold' },
    { label: 'Gallery Views',    value: '—',               accent: 'border-ink' },
    { label: 'Inquiries (30d)',  value: '—',               accent: 'border-emerald-600' },
  ];
 
  return (
    <div>
      <h2 className="font-serif text-4xl font-light mb-1">
        Good day, <em>{profile?.name?.split(' ')[0]}</em>
      </h2>
      <p className="text-sm text-stone mb-10">Here's your studio at a glance.</p>
 
      <div className="grid grid-cols-3 gap-5 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`bg-white p-7 border-l-[3px] ${s.accent}`}>
            <div className="font-serif text-5xl font-light leading-none">{s.value}</div>
            <div className="text-[11px] tracking-widest uppercase text-stone mt-3">{s.label}</div>
          </div>
        ))}
      </div>
 
      <div className={`bg-white p-7 border-l-[3px] ${profile?.status === 'APPROVED' ? 'border-emerald-500' : 'border-gold'}`}>
        <div className="text-[10px] tracking-widest uppercase text-stone mb-3">Account Status</div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-[11px] tracking-wide uppercase ${
            profile?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
            profile?.status === 'PENDING'  ? 'bg-amber-50 text-amber-700' :
                                             'bg-red-50 text-red-700'
          }`}>
            {profile?.status === 'APPROVED' ? '✓ Approved' : profile?.status}
          </span>
          <span className="text-sm text-stone">
            {profile?.status === 'APPROVED'
              ? 'Your profile is live and visible in the gallery.'
              : 'Your application is under review. You\'ll be notified when approved.'}
          </span>
        </div>
      </div>
    </div>
  );
}