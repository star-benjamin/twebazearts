export default function About() {
  return (
    <div className="pt-16">

      {/* Hero Statement */}
      <div className="px-6 md:px-10 lg:px-16 py-16 lg:py-24 max-w-4xl">
        <p className="text-[10px] md:text-[11px] tracking-[.2em] uppercase text-gold mb-6">
          Kampala, Uganda
        </p>
        <h1 className="font-serif text-[clamp(36px,5vw,72px)] font-light leading-[1.05] mb-0">
          Welcome to<br /><em>Twebaze Art Studio</em>
        </h1>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-ash" />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

        {/* Left — Sticky image */}
        <div className="relative lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] bg-smoke flex items-center justify-center p-10 lg:p-16 order-last lg:order-first">
          <div className="relative w-full max-w-sm">
            {/* offset gold panel behind */}
            <div className="absolute -bottom-4 -right-4 w-2/3 aspect-square bg-gold/10 -z-10" />

            {/* actual image, replacing the gradient placeholder */}
            <div className="relative w-full aspect-[4/5] rounded-sm shadow-2xl overflow-hidden">
              <img
                src="/about.PNG"
                alt="Twebaze Art Studio"
                className="w-full h-full object-cover"
              />
              {/* gradient wash for caption legibility + tying back to the old palette */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            </div>

            {/* caption card */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-3">
              <div className="font-serif text-sm">Twebaze Art Studio</div>
              <div className="text-[10px] tracking-widest uppercase text-stone mt-0.5">Kampala · Uganda</div>
            </div>
          </div>
        </div>

        {/* Right — Text */}
        <div className="px-6 md:px-10 lg:px-16 py-16 lg:py-24 space-y-16">

          {/* Section 1 — Identity */}
          <div>
            <p className="text-[10px] tracking-[.2em] uppercase text-gold mb-6">The Studio</p>
            <p className="text-sm md:text-[15px] text-stone leading-[1.9]">
              Twebaze Art Studio is a space where the boundaries between disciplines dissolve
              to redefine the essence of the contemporary canvas. Driven by a commitment to
              archival excellence and original thought, the studio produces works that are as
              enduring in physical form as they are in conceptual depth.
            </p>
          </div>

          {/* Pullquote */}
          <div className="border-l-2 border-gold pl-8 py-2">
            <p className="font-serif text-[clamp(20px,2.5vw,28px)] font-light leading-[1.3] text-ink">
              "Art is not merely a visual experience — it is a tactile journey."
            </p>
          </div>

          {/* Section 2 — Practice */}
          <div>
            <p className="text-[10px] tracking-[.2em] uppercase text-gold mb-6">The Practice</p>
            <p className="text-sm md:text-[15px] text-stone leading-[1.9]">
              By integrating sculptural textures — from raw gravel to heavy cotton canvas —
              each piece evolves into a three-dimensional object that challenges the flat
              tradition of painting. Every creation is a complex synthesis of rhythm, poetry,
              and form, bridging the gap between fine art, pottery, and the written word.
            </p>
          </div>

          {/* Section 3 — Philosophy */}
          <div>
            <p className="text-[10px] tracking-[.2em] uppercase text-gold mb-6">The Philosophy</p>
            <p className="text-sm md:text-[15px] text-stone leading-[1.9]">
              At the heart of the studio's philosophy is a rejection of the ephemeral.
              We believe in the mastery of materials and the power of satire to reflect
              the intricacies of modern life — high-end craftsmanship meeting sharp social
              commentary, designed for the discerning collector who values art that stands
              the test of time.
            </p>
          </div>

          {/* Pillars */}
          <div>
            <p className="text-[10px] tracking-[.2em] uppercase text-gold mb-8">Studio Pillars</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { title: 'Archival Excellence', desc: 'Every material chosen to endure. Every finish crafted to outlast trends and time.' },
                { title: 'Sculptural Texture',  desc: 'Raw gravel, heavy cotton, found objects — the canvas becomes three-dimensional.' },
                { title: 'Conceptual Depth',    desc: 'Rhythm, poetry, and form synthesised into works that reward repeated contemplation.' },
                { title: 'Satire & Commentary', desc: 'Sharp social observation woven into beauty — art that provokes as much as it pleases.' },
              ].map(v => (
                <div key={v.title} className="border-t border-ash pt-6">
                  <div className="font-serif text-base md:text-lg mb-2">{v.title}</div>
                  <div className="text-xs text-stone leading-relaxed">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-ash pt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/256751482035?text=Hello%2C%20I%27d%20like%20to%20learn%20more%20about%20Twebaze%20Art%20Studio."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 bg-[#25d366] text-white px-8 py-4 text-[11px] tracking-widest uppercase hover:bg-[#128c7e] transition-colors"
            >
              Connect on WhatsApp
            </a>
            <a
            
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 border border-ink text-ink text-[11px] tracking-widest uppercase hover:bg-ink hover:text-white transition-colors"
            >
              View the Collection
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}