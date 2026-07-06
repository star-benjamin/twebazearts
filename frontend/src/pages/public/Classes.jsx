import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { classApi } from '../../api/class.api';
import ClassPoster from '../../components/ClassPoster';

export default function Classes() {
  const [booking, setBooking] = useState(null); // the class currently being booked

  const { data: classesRaw, isLoading, refetch } = useQuery({
    queryKey: ['classes', 'upcoming'],
    queryFn: () => classApi.list(),
  });
  const classes = Array.isArray(classesRaw) ? classesRaw : [];

  return (
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20">
      <h1 className="font-serif text-[clamp(32px,4vw,52px)] font-light mb-4">
        Art <em>Classes</em>
      </h1>
      <p className="text-sm text-stone max-w-xl mb-12">
        Practical, hands-on workshops led by seasoned, practicing studio artists.
        Tap the share icon on any poster to save or send it.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[680/1000] bg-smoke animate-pulse" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <p className="text-stone text-sm">No upcoming classes scheduled right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          {classes.map((c) => (
            <ClassPoster key={c.id} cls={c} onBook={setBooking} />
          ))}
        </div>
      )}

      {booking && (
        <BookingModal
          cls={booking}
          onClose={() => setBooking(null)}
          onBooked={() => { setBooking(null); refetch(); }}
        />
      )}
    </div>
  );
}

function BookingModal({ cls, onClose, onBooked }) {
  const [form, setForm] = useState({ student_name: '', contact_details: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await classApi.book(cls.id, form);
      setStatus('success');
      setTimeout(onBooked, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-2xl">Book Your Seat</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <p className="text-sm text-stone mb-6">{cls.course_title}</p>

        {status === 'success' ? (
          <p className="text-sm text-green-700">You're booked! See you in class.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              required placeholder="Student Name" value={form.student_name}
              onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
              className="w-full border border-ash px-3 py-2 text-sm"
            />
            <input
              required placeholder="Phone or Email" value={form.contact_details}
              onChange={(e) => setForm((f) => ({ ...f, contact_details: e.target.value }))}
              className="w-full border border-ash px-3 py-2 text-sm"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit" disabled={status === 'submitting'}
              className="w-full bg-ink text-white py-2.5 text-[11px] tracking-widest uppercase hover:bg-gold disabled:opacity-50"
            >
              {status === 'submitting' ? 'Booking…' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
