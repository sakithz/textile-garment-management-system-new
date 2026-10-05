import { useApp } from '../App'

const SERVICES = [
  {
    num: '01',
    title: 'Custom Garment Manufacturing',
    desc: 'From a sketch to a finished garment. We work from your design files, tech packs, or a simple concept brief to deliver fully custom-made garments to your exact specifications.',
    features: ['Design consultation', 'Pattern making', 'Sample production', 'Bulk manufacturing'],
    img: 'https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?w=800&h=600&fit=crop&auto=format',
  },
  {
    num: '02',
    title: 'Bulk Production',
    desc: "Scale-ready manufacturing for high-volume orders. Our facility handles thousands of units per week with consistent quality at every stage of production.",
    features: ['500–50,000+ units', 'Quality consistency', 'Scalable capacity', 'On-time delivery'],
    img: 'https://images.unsplash.com/photo-1741176505800-caaa3a52631a?w=800&h=600&fit=crop&auto=format',
  },
  {
    num: '03',
    title: 'Private Label Manufacturing',
    desc: 'Build your brand on a foundation of quality. We manufacture garments under your label — from woven labels to custom packaging — completely white-label.',
    features: ['Your branding throughout', 'Custom labels & tags', 'Branded packaging', 'NDA available'],
    img: 'https://images.unsplash.com/photo-1675176785803-bffbbb0cd2f4?w=800&h=600&fit=crop&auto=format',
  },
  {
    num: '04',
    title: 'Embroidery',
    desc: 'High-precision embroidery for logos, monograms and decorative detail. Available on all garment types. Flat, 3D and appliqué embroidery options available.',
    features: ['Up to 15 thread colours', 'High-density stitching', '3D puff embroidery', 'Appliqué options'],
    img: 'https://images.unsplash.com/photo-1593250816874-8edf4f732edb?w=800&h=600&fit=crop&auto=format',
  },
  {
    num: '05',
    title: 'Screen Printing',
    desc: 'Vivid, durable screen printing in up to 8 spot colours. Suitable for T-shirts, hoodies, bags and more. Discharge, plastisol and water-based inks available.',
    features: ['Up to 8 spot colours', 'Discharge printing', 'Water-based inks', 'All garment types'],
    img: 'https://images.unsplash.com/photo-1517146783983-418c681b56c5?w=800&h=600&fit=crop&auto=format',
  },
  {
    num: '06',
    title: 'Quality Control & Inspection',
    desc: 'Multi-stage inspection throughout production. Every batch undergoes fabric, in-line, and final inspection before shipping — conforming to AQL international standards.',
    features: ['AQL 2.5 standard', 'Fabric inspection', 'In-line QC', 'Final pre-ship inspection'],
    img: 'https://images.unsplash.com/photo-1619459074340-2ad2fbba3014?w=800&h=600&fit=crop&auto=format',
  },
]

export default function Services() {
  const { navigate } = useApp()

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero */}
      <div className="py-16 md:py-24 bg-charcoal text-ivory">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="section-label text-bronze mb-4">Our Services</div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-ivory mb-5 leading-tight">
            Everything Under<br/>
            <span className="italic font-normal">One Roof.</span>
          </h1>
          <p className="text-ivory/60 max-w-xl leading-relaxed text-lg">
            End-to-end garment manufacturing services for brands and businesses of every size.
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col gap-0 divide-y divide-border">
          {SERVICES.map((s, i) => (
            <div key={i} className={`py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`lg:col-span-5 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="img-zoom overflow-hidden aspect-[4/3]">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className={`lg:col-span-7 ${i % 2 === 1 ? 'lg:order-1 lg:pr-12' : 'lg:pl-4'}`}>
                <div className="font-mono text-sm text-bronze mb-4">{s.num}</div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">{s.title}</h2>
                <p className="text-charcoal-muted leading-relaxed mb-6">{s.desc}</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {s.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-charcoal-muted">
                      <div className="w-1 h-1 bg-bronze rounded-full shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('contact')} className="btn-primary text-sm">
                  Request a Quote
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-bronze-pale py-20 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-5">
            Ready to Work Together?
          </h2>
          <p className="text-charcoal-muted mb-8">Talk to our team about your project requirements.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('contact')} className="btn-primary">Get a Quote</button>
            <button onClick={() => navigate('custom-builder')} className="btn-secondary">Build Your Garment</button>
          </div>
        </div>
      </div>
    </div>
  )
}
