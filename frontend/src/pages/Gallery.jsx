import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { artworkApi } from '../api/artwork.api';
import ArtCard from '../components/ArtCard';

export default function Gallery() {
  const [categoryId, setCategoryId] = useState('');
  const [availability, setAvailability] = useState('');
  const [q, setQ] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['artwork-categories'],
    queryFn: () => artworkApi.listCategories(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['artworks', categoryId, availability, q],
    queryFn: () => artworkApi.list({
      category_id: categoryId || undefined,
      availability: availability || undefined,
      q: q || undefined,
    }),
  });

  const artworks = data?.items || [];

  return (
    <>
      {/* Hero */}
      <section className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 pt-13">
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-20 text-center lg:text-left">
          <p className="text-[10px] md:text-[11px] tracking-[.2em] uppercase text-gold mb-4 md:mb-6">
            Kampala · East Africa
          </p>
          <h1 className="font-serif text-[clamp(42px,8vw,88px)] leading-[1.1] md:leading-[1.05] font-light mb-6 md:mb-8">
            Stories told in<br /><em className="text-stone italic">canvas</em><br />and stone
          </h1>
          <p className="text-[14px] md:text-[15px] text-stone max-w-sm leading-[1.8] mb-10 md:mb-12 mx-auto lg:mx-0">
            A carefully curated collection of authentic Ugandan fine art, original cultural narratives, and hands-on workshops led directly by practicing studio artists.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <a href="#gallery" className="bg-ink text-white px-8 py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors w-full sm:w-auto">
              Explore Collection
            </a>
          </div>
        </div>

        <div className="relative h-[50vh] lg:h-auto overflow-hidden bg-smoke flex items-center justify-center order-first lg:order-last">
          {artworks[0]?.images?.[0] ? (
            <img src={artworks[0].images[0].webp_url || artworks[0].images[0].url} alt="Featured" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="w-3/5 aspect-[3/4] bg-gradient-to-br from-amber-800 to-amber-950 shadow-2xl animate-pulse" />
          )}
        </div>
      </section>

      {/* Gallery grid */}
      <section id="gallery" className="px-6 md:px-10 py-16 md:py-20">
        <div className="mb-10 md:mb-14 text-center md:text-left">
          <h2 className="font-serif text-[clamp(32px,4vw,52px)] font-light">The <em>Collection</em></h2>
        </div>

        {/* Search + filters — FR-ART-008, FR-ART-009 */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, style, medium, or story…"
            className="flex-1 border border-ash px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-ash px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-ink"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="border border-ash px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-ink"
          >
            <option value="">Any Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-ash border border-ash">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white">
                <div className="aspect-[3/4] bg-smoke animate-pulse" />
                <div className="p-5"><div className="h-4 bg-smoke animate-pulse rounded mb-2 w-2/3" /></div>
              </div>
            ))
          ) : artworks.length === 0 ? (
            <div className="col-span-full text-center py-20 text-stone text-sm">
              No artworks match your search.
            </div>
          ) : (
            artworks.map((a) => <ArtCard key={a.id} artwork={a} />)
          )}
        </div>
      </section>
    </>
  );
}
