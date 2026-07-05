import { useQuery } from '@tanstack/react-query';
import { testimonialApi } from '../api/testimonial.api';

// Drop <TestimonialsSection /> into About.jsx or Gallery.jsx wherever you'd
// like published client testimonials to appear (FR-ADM-002).
export default function TestimonialsSection() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials', 'published'],
    queryFn: () => testimonialApi.list(),
  });

  if (testimonials.length === 0) return null;

  return (
    <section className="px-6 md:px-10 py-16 md:py-20 bg-smoke">
      <h2 className="font-serif text-[clamp(28px,4vw,44px)] font-light mb-10 text-center">
        What Clients <em>Say</em>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {testimonials.slice(0, 6).map((t) => (
          <blockquote key={t.id} className="bg-white p-6">
            <p className="text-sm text-stone italic leading-relaxed mb-4">"{t.content}"</p>
            <footer className="text-[11px] tracking-widest uppercase text-ink">
              {t.customer_name}
              {t.related_artwork && <span className="text-mist normal-case tracking-normal"> · {t.related_artwork.title}</span>}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
