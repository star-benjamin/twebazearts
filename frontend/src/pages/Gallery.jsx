import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ArtCard from '../components/ArtCard';
import ViewInRoom from '../components/ViewInRoom';

const FILTERS = ['All', 'Painting', 'Photography', 'Sculpture', 'Mixed Media', 'Drawing'];

export default function Gallery() {
  const [filter, setFilter] = useState('All');
  const [roomArtwork, setRoomArtwork] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['artworks', filter],
    queryFn: () => client.get('/artworks', { params: { status: 'ACTIVE' } }).then(r => r.data),
  });

  const artworks = data?.items || [];

  return (
    <>
      {/* Hero */}
      <section className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 pt-16">
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-20 text-center lg:text-left">
          <p className="text-[10px] md:text-[11px] tracking-[.2em] uppercase text-gold mb-4 md:mb-6">
            Kampala · East Africa
          </p>
          <h1 className="font-serif text-[clamp(42px,8vw,88px)] leading-[1.1] md:leading-[1.05] font-light mb-6 md:mb-8">
            Art that<br /><em className="text-stone italic">speaks</em><br />across walls
          </h1>
          <p className="text-[14px] md:text-[15px] text-stone max-w-sm leading-[1.8] mb-10 md:mb-12 mx-auto lg:mx-0">
            A curated platform celebrating Uganda's most compelling visual artists.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <a href="#gallery" className="bg-ink text-white px-8 py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors w-full sm:w-auto">
              Explore Collection
            </a>
          </div>
        </div>

        {/* Hero image — first artwork or placeholder */}
        <div className="relative h-[50vh] lg:h-auto overflow-hidden bg-smoke flex items-center justify-center order-first lg:order-last">
          {artworks[0] ? (
            <img src={artworks[0].image_url} alt="Featured" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="w-3/5 aspect-[3/4] bg-gradient-to-br from-amber-800 to-amber-950 shadow-2xl animate-pulse" />
          )}
        </div>
      </section>

      {/* Stats - Grid instead of flex for better wrapping */}
      <div className="bg-ink grid grid-cols-2 lg:flex justify-center gap-8 lg:gap-20 py-10 px-6">
        {[
          ['12', 'Curated Artists'], 
          ['48', 'Active Works'], 
          ['6', 'Disciplines'], 
          ['100%', 'East African']
        ].map(([n, l]) => (
          <div key={l} className="text-center">
            <div className="font-serif text-2xl md:text-3xl font-light text-white">{n}</div>
            <div className="text-[9px] md:text-[10px] tracking-[.15em] uppercase text-mist mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Gallery grid */}
      <section id="gallery" className="px-6 md:px-10 py-16 md:py-20">
        <div className="mb-10 md:mb-14 text-center md:text-left">
          <h2 className="font-serif text-[clamp(32px,4vw,52px)] font-light">The <em>Collection</em></h2>
        </div>

        {/* Filter bar - Scrollable on mobile, flex on desktop */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar md:flex-wrap md:justify-start">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-5 py-2 text-[10px] md:text-[11px] tracking-widest uppercase border transition-colors ${
                filter === f ? 'bg-ink text-white border-ink' : 'border-ash text-stone hover:border-ink hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid handling: 1 col mobile, 2 col tablet, 3-4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-ash border border-ash">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white">
                <div className="aspect-[3/4] bg-smoke animate-pulse" />
                <div className="p-5"><div className="h-4 bg-smoke animate-pulse rounded mb-2 w-2/3" /></div>
              </div>
            ))
          ) : (
            artworks.map(a => (
              <ArtCard key={a.id} artwork={a} onViewInRoom={setRoomArtwork} />
            ))
          )}
        </div>
      </section>

      <ViewInRoom artwork={roomArtwork} onClose={() => setRoomArtwork(null)} />
    </>
  );
}