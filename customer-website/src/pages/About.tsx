import { useApp } from '../App'

export default function About() {
  const { navigate } = useApp()

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero */}
      <div className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?w=1600&h=800&fit=crop&auto=format" alt="Manufacturing" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/75" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="section-label text-bronze mb-4">About SilkRoute</div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-ivory leading-tight mb-6">
            A Decade of<br/><span className="italic font-normal">Craft & Precision.</span>
          </h1>
          <p className="text-ivory/70 max-w-xl leading-relaxed text-lg">
            Founded in Colombo in 2014, SilkRoute has grown from a boutique production house to one of Sri Lanka's leading garment manufacturers.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="py-20 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <div className="section-label mb-4">Our Story</div>
            <h2 className="font-display text-4xl font-bold text-charcoal mb-6">From a Single Sewing Machine to a Modern Facility.</h2>
            <p className="text-charcoal-muted leading-relaxed mb-4">
              SilkRoute was founded in 2014 by a team of textile engineers and fashion graduates who believed Sri Lanka's rich garment heritage deserved a modern face. Starting with a small team of 12 in Colombo, we invested heavily in both people and technology.
            </p>
            <p className="text-charcoal-muted leading-relaxed mb-4">
              Today we operate a 15,000 sq ft manufacturing facility with over 200 skilled craftspeople, producing garments for brands across Europe, the Middle East, Southeast Asia and Australia.
            </p>
            <p className="text-charcoal-muted leading-relaxed">
              We remain a family of makers at heart — dedicated to quality, transparency and building long-term relationships with every client we serve.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '10+', lbl: 'Years in operation' },
                { val: '200+', lbl: 'Skilled craftspeople' },
                { val: '100+', lbl: 'Clients globally' },
                { val: '25+', lbl: 'Countries served' },
                { val: '50K+', lbl: 'Garments per year' },
                { val: '98%', lbl: 'On-time delivery' },
              ].map(s => (
                <div key={s.lbl} className="bg-bronze-pale p-6">
                  <div className="font-display font-bold text-3xl text-charcoal mb-1">{s.val}</div>
                  <div className="text-sm text-charcoal-muted">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manufacturing */}
      <div className="py-16 bg-charcoal text-ivory">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="section-label text-bronze mb-4">Our Facility</div>
          <h2 className="font-display text-4xl font-bold text-ivory mb-12">Manufacturing Capabilities.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏭', title: 'Modern Facility', desc: '15,000 sq ft production floor with the latest Japanese and German machinery.' },
              { icon: '🧵', title: 'Full-Cycle Production', desc: 'Pattern cutting through to final packaging — everything under one roof.' },
              { icon: '🔍', title: 'Quality Systems', desc: 'ISO-compliant QC with multi-stage inspection at every production step.' },
              { icon: '🚚', title: 'Global Shipping', desc: 'Air and sea freight worldwide. Experienced in all major trade compliance requirements.' },
            ].map(c => (
              <div key={c.title} className="border border-ivory/10 p-6">
                <div className="text-3xl mb-4">{c.icon}</div>
                <h3 className="font-medium text-ivory mb-2">{c.title}</h3>
                <p className="text-ivory/50 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Values */}
      <div className="py-20 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="img-zoom overflow-hidden aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1741176505800-caaa3a52631a?w=800&h=600&fit=crop&auto=format" alt="Team at work" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="section-label mb-4">Our Values</div>
            <h2 className="font-display text-4xl font-bold text-charcoal mb-6">What We Stand For.</h2>
            {[
              { title: 'Quality without compromise', desc: 'Every garment undergoes multi-stage inspection. We do not release substandard work.' },
              { title: 'Transparent partnerships', desc: 'Clear pricing, honest timelines and open communication at every stage.' },
              { title: 'Skilled workforce', desc: 'We invest in our team through training, fair wages and a safe working environment.' },
              { title: 'Sustainable practices', desc: 'We actively reduce waste, source responsibly and work towards a more sustainable operation.' },
            ].map(v => (
              <div key={v.title} className="flex gap-4 mb-6">
                <div className="w-1 bg-bronze shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-charcoal mb-1">{v.title}</div>
                  <div className="text-sm text-charcoal-muted">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-ivory-dark border-t border-border text-center">
        <div className="max-w-lg mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-charcoal mb-4">Start a Conversation.</h2>
          <p className="text-charcoal-muted mb-8">We work best when we understand your brand. Tell us about your project.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate('contact')} className="btn-primary">Get in Touch</button>
            <button onClick={() => navigate('products')} className="btn-secondary">View Products</button>
          </div>
        </div>
      </div>
    </div>
  )
}
