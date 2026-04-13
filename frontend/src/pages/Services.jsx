const SERVICES = [
  { num: '01', name: 'Commissioned Portraits', desc: 'A fully bespoke portrait of a person, family, or pet. Rendered in the artist\'s signature style.', price: 'From UGX 800,000' },
  { num: '02', name: 'Mural Painting', desc: 'Large-scale wall murals for homes, offices, hotels, and public spaces.', price: 'Price on Request' },
  { num: '03', name: 'Corporate Art Curation', desc: 'We source and install curated artworks for your office or commercial space.', price: 'From UGX 5,000,000' },
  { num: '04', name: 'Custom Illustrations', desc: 'Digital or hand-drawn illustrations for branding, editorial, and book covers.', price: 'From UGX 300,000' },
  { num: '05', name: 'Art for Events', desc: 'Live painting, installations, and curated displays for weddings and galas.', price: 'Price on Request' },
  { num: '06', name: 'Fine Art Photography', desc: 'Portrait, architectural, or conceptual photography printed to gallery standard.', price: 'From UGX 600,000' },
];
 
export default function Services() {
  return (
    <div className="pt-16">
      <div className="px-10 py-16">
        <p className="text-[11px] tracking-[.2em] uppercase text-gold mb-4">What we offer</p>
        <h1 className="font-serif text-[clamp(40px,5vw,72px)] font-light leading-tight mb-4">
          Artist <em className="text-stone">Services</em>
        </h1>
        <p className="text-[15px] text-stone max-w-md leading-[1.8]">
          Commission original work directly from our curated artists. Every inquiry is handled personally via WhatsApp.
        </p>
      </div>
 
      <div className="grid grid-cols-3 gap-px bg-ash">
        {SERVICES.map(s => (
          <div key={s.num} className="bg-white p-12 hover:bg-smoke transition-colors">
            <div className="font-serif text-5xl font-light text-ash leading-none mb-4">{s.num}</div>
            <h3 className="font-serif text-xl mb-3">{s.name}</h3>
            <p className="text-sm text-stone leading-relaxed mb-6">{s.desc}</p>
            <span className="text-xs text-gold tracking-wide font-medium">{s.price}</span>
          </div>
        ))}
      </div>
 
      <div className="bg-smoke px-10 py-16 text-center">
        <p className="font-serif text-2xl font-light mb-6">Ready to begin a conversation?</p>
        <a
          href="https://wa.me/256700000000?text=Hello%2C%20I%27m%20interested%20in%20a%20commission."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#25d366] text-white px-10 py-4 text-[12px] tracking-widest uppercase hover:bg-[#128c7e] transition-colors"
        >
          Inquire on WhatsApp
        </a>
      </div>
    </div>
  );
}