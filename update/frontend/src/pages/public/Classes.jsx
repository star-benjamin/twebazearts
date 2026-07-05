import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { classApi } from '../../api/class.api';

export default function Classes() {
  const [bookingClass, setBookingClass] = useState(null);

  const { data: classes = [], isLoading, refetch } = useQuery({
    queryKey: ['classes', 'upcoming'],
    queryFn: () => classApi.list(),
  });

  return (
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20">
      <h1 className="font-serif text-[clamp(32px,4vw,52px)] font-light mb-4">
        Art <em>Classes</em>
      </h1>
      <p className="text-sm text-stone max-w-xl mb-12">
        Practical, hands-on workshops led by seasoned, practicing studio artists.
      </p>

      {isLoading ? (
        <p className="text-stone text-sm">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="text-stone text-sm">No upcoming classes scheduled right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((c) => (
            <div key={c.id} className="border border-ash p-6">
              <h3 className="font-serif text-xl mb-2">{c.course_title}</h3>
              <p className="text-sm text-stone mb-4">{c.description}</p>
              <div className="text-xs text-stone space-y-1 mb-4">
                <p>Instructor: {c.instructor}</p>
                <p>{new Date(c.session_datetime).toLocaleString()}</p>
                <p>Fee: UGX {Number(c.registration_fee).toLocaleString()}</p>
                <p className={c.seats_available <= 0 ? 'text-red-600' : ''}>
                  {c.seats_available <= 0 ? 'Fully booked' : `${c.seats_available} of ${c.capacity} seats available`}
                </p>
              </div>

              {bookingClass === c.id ? (
                <BookingForm classId={c.id} onDone={() => { setBookingClass(null); refetch(); }} />
              ) : (
                <button
                  disabled={c.seats_available <= 0}
                  onClick={() => setBookingClass(c.id)}
                  className="w-full bg-ink text-white py-3 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-40"
                >
                  {c.seats_available <= 0 ? 'Fully Booked' : 'Book a Seat'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingForm({ classId, onDone }) {
  const [form, setForm] = useState({ student_name: '', contact_details: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await classApi.book(classId, form);
      setStatus('success');
      setTimeout(onDone, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
      setStatus('idle');
    }
  };

  if (status === 'success') return <p className="text-sm text-green-700">You're booked! See you in class.</p>;

  return (
    <form onSubmit={submit} className="space-y-3">
      <input required placeholder="Student Name" value={form.student_name}
        onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
        className="w-full border border-ash px-3 py-2 text-sm" />
      <input required placeholder="Phone or Email" value={form.contact_details}
        onChange={(e) => setForm((f) => ({ ...f, contact_details: e.target.value }))}
        className="w-full border border-ash px-3 py-2 text-sm" />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={status === 'submitting'}
        className="w-full bg-ink text-white py-2.5 text-[11px] tracking-widest uppercase hover:bg-gold disabled:opacity-50">
        {status === 'submitting' ? 'Booking…' : 'Confirm Booking'}
      </button>
    </form>
  );
}
