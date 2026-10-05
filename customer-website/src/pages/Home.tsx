import { useState, useEffect, useRef } from 'react'
import { useApp } from '../App'

const HERO_IMG = 'https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?w=1800&h=1000&fit=crop&auto=format'
const FACTORY_IMG = 'https://images.unsplash.com/photo-1741176505800-caaa3a52631a?w=1200&h=800&fit=crop&auto=format'
const THREAD_IMG = 'https://images.unsplash.com/photo-1517146783983-418c681b56c5?w=900&h=1100&fit=crop&auto=format'
const FABRIC_IMG = 'https://images.unsplash.com/photo-1593250816874-8edf4f732edb?w=800&h=600&fit=crop&auto=format'
const POLO_IMG = 'https://images.unsplash.com/photo-1714317438040-0e8584215699?w=800&h=1000&fit=crop&auto=format'
const TSHIRT_IMG = 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=1000&fit=crop&auto=format'
const WEAVE_IMG = 'https://images.unsplash.com/photo-1594332495179-d979bcd18142?w=800&h=1000&fit=crop&auto=format'
const KNIT_IMG = 'https://images.unsplash.com/photo-1619459074340-2ad2fbba3014?w=800&h=800&fit=crop&auto=format'
const YELLOW_FABRIC = 'https://images.unsplash.com/photo-1700547949736-024ad8cb56cd?w=800&h=1000&fit=crop&auto=format'
const MACHINE_IMG = 'https://images.unsplash.com/photo-1675176785803-bffbbb0cd2f4?w=1200&h=800&fit=crop&auto=format'

const STATS = [
  { value: '10+', label: 'Years Experience' },
  { value: '50K+', label: 'Garments Produced' },
  { value: '100+', label: 'Active Clients' },
  { value: '98%', label: 'On-Time Delivery' },
]

const WORKFLOW = [
  { step: '01', label: 'Design', icon: '✏️' },
  { step: '02', label: 'Material Selection', icon: '🧵' },
  { step: '03', label: 'Cutting', icon: '✂️' },
  { step: '04', label: 'Production', icon: '⚙️' },
  { step: '05', label: 'Quality Control', icon: '🔍' },
  { step: '06', label: 'Packaging', icon: '📦' },
  { step: '07', label: 'Delivery', icon: '🚚' },
]

const PRODUCTS = [
  { name: 'Polo Shirts', category: 'Casual Wear', img: POLO_IMG, wide: true },
  { name: 'T-Shirts', category: 'Basics', img: TSHIRT_IMG, wide: false },
  { name: 'Premium Fabric', category: 'Material Range', img: WEAVE_IMG, wide: false },
  { name: 'Sportswear', category: 'Performance', img: KNIT_IMG, wide: false },
  { name: 'Custom Garments', category: 'Bespoke', img: YELLOW_FABRIC, wide: false },
]

const SERVICES = [
  { title: 'Custom Manufacturing', desc: 'Fully bespoke garments built to your exact specifications.', icon: '🧵' },
  { title: 'Bulk Production', desc: 'Scalable manufacturing for large volume orders with consistent quality.', icon: '🏭' },
  { title: 'Private Label', desc: 'Your brand, our craftsmanship. Complete private label solutions.', icon: '🏷️' },
  { title: 'Embroidery', desc: 'Precision embroidery for logos, branding and decorative details.', icon: '🪡' },
  { title: 'Screen Printing', desc: 'Vivid, durable screen printing across all garment types.', icon: '🖨️' },
  { title: 'Quality Control', desc: 'Rigorous multi-stage inspection ensuring every piece meets standard.', icon: '✅' },
]

const PROCESS = [
  { num: '01', title: 'Consultation', desc: 'We understand your vision, requirements and timelines.' },
  { num: '02', title: 'Design & Sampling', desc: 'Samples developed for your review and approval.' },
  { num: '03', title: 'Material Selection', desc: 'Premium fabrics sourced to meet your specifications.' },
  { num: '04', title: 'Production', desc: 'Precision manufacturing with skilled teams and modern equipment.' },
  { num: '05', title: 'Quality Control', desc: 'Multi-stage inspection at every step of production.' },
  { num: '06', title: 'Packaging', desc: 'Careful packing to protect garments during transit.' },
  { num: '07', title: 'Delivery', desc: 'On-time delivery to your location, worldwide.' },
]

const FAQS = [
  { q: 'What is the minimum order quantity?', a: 'Our minimum order quantity is typically 50 units per style. For custom projects, we can discuss your specific needs.' },
  { q: 'What garment types do you manufacture?', a: 'T-shirts, polo shirts, hoodies, jackets, sportswear, workwear, and fully custom garments across all fabric types.' },
  { q: 'Can I customize garments with my logo?', a: 'Yes — we offer embroidery, screen printing, heat transfer, and woven label options for full branding customization.' },
  { q: 'How long does production take?', a: 'Standard production is 3–5 weeks after sample approval. Rush orders may be available depending on capacity.' },
  { q: 'Do you provide samples before bulk production?', a: 'Yes. We produce a sample garment for your approval before committing to full production runs.' },
  { q: 'How can I track my order?', a: 'All orders get a unique ID. You can track production status in real time through our customer portal.' },
  { q: 'Do you offer bulk discounts?', a: 'Yes. Pricing scales with volume. Request a quote to receive our current pricing structure for your order size.' },
]

const OFFERS = [
  {
    tag: 'Limited Time',
    title: 'Bulk Order Advantage',
    desc: 'Special pricing for qualifying bulk garment orders of 500+ units.',
    discount: '15% off',
    validity: 'Valid until 31 Dec 2024',
    color: 'bg-charcoal text-ivory',
  },
  {
    tag: 'Seasonal',
    title: 'New Customer Welcome',
    desc: 'First-time customers receive complimentary sample production on first order.',
    discount: 'Free Sample',
    validity: 'Ongoing offer',
    color: 'bg-bronze-pale',
  },
  {
    tag: 'Campaign',
    title: 'Custom Embroidery Deal',
    desc: 'Free embroidery setup on orders over 200 units this month.',
    discount: 'LKR 0 Setup',
    validity: 'Valid until 15 Dec 2024',
    color: 'bg-muted',
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

export default function Home() {
  const { navigate } = useApp()
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [heroHovered, setHeroHovered] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const heroRef = useRef<HTMLDivElement>(null)

  const workflowSection = useInView()
  const aboutSection = useInView()
  const productsSection = useInView()
  const servicesSection = useInView()
  const processSection = useInView()
  const offersSection = useInView()

  const handleHeroPointer = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className="bg-ivory">
      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: 'calc(100vh - 80px)', minHeight: 600 }}
        onPointerMove={handleHeroPointer}
        onPointerEnter={() => setHeroHovered(true)}
        onPointerLeave={() => setHeroHovered(false)}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Garment manufacturing"
            className="w-full h-full object-cover"
            style={{ transform: heroHovered ? `translate(${(cursorPos.x / window.innerWidth - 0.5) * -8}px, ${(cursorPos.y / window.innerHeight - 0.5) * -5}px)` : 'none', transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col justify-center">
          <div className="max-w-2xl">
            <div className="animate-fade-up section-label text-bronze mb-6">
              Premium Garment Manufacturing · Sri Lanka
            </div>
            <h1 className="animate-fade-up delay-100 font-display text-ivory text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] mb-6">
              Crafting What<br/>
              <span className="italic font-normal">You Imagine.</span>
            </h1>
            <p className="animate-fade-up delay-200 text-ivory/70 text-lg leading-relaxed mb-10 max-w-lg">
              Premium textile and garment manufacturing, combining skilled craftsmanship, modern production and reliable delivery.
            </p>
            <div className="animate-fade-up delay-300 flex flex-wrap gap-4">
              <button onClick={() => navigate('custom-builder')} className="btn-bronze text-sm">
                Start Your Order
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
              <button onClick={() => navigate('products')} className="btn-secondary border-ivory text-ivory hover:bg-ivory hover:text-charcoal text-sm">
                Explore Products
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="bg-ivory/95 backdrop-blur-sm grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
              {STATS.map((s, i) => (
                <div key={i} className="px-6 py-4 flex flex-col items-center text-center">
                  <div className="font-display font-bold text-2xl text-charcoal">{s.value}</div>
                  <div className="text-xs text-charcoal-muted tracking-wide uppercase mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="animate-fade-in delay-600 absolute bottom-24 right-12 hidden lg:flex flex-col items-center gap-3">
          <div className="text-ivory/40 text-[10px] tracking-[0.2em] uppercase -rotate-90 mb-4">Scroll</div>
          <div className="w-px h-16 bg-ivory/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-ivory/60" style={{ animation: 'slideDown 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section ref={workflowSection.ref} className="py-20 border-b border-border overflow-x-auto">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className={`text-center mb-12 ${workflowSection.visible ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="section-label mb-3">Our Process</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal">
              From Fabric to Finished Garment.
            </h2>
          </div>
          <div className="flex min-w-max md:min-w-0 md:grid md:grid-cols-7 gap-0">
            {WORKFLOW.map((w, i) => (
              <div
                key={i}
                className={`timeline-step flex flex-col items-center text-center px-4 py-6 ${workflowSection.visible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-12 h-12 bg-bronze-pale rounded-full flex items-center justify-center text-xl mb-3">
                  {w.icon}
                </div>
                <div className="text-xs font-mono text-charcoal-muted mb-1">{w.step}</div>
                <div className="text-sm font-medium text-charcoal">{w.label}</div>
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 w-full border-t border-dashed border-bronze/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT PREVIEW ── */}
      <section ref={aboutSection.ref} className="py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Images */}
            <div className={`relative ${aboutSection.visible ? 'animate-fade-up' : 'opacity-0'}`}>
              <div className="img-zoom aspect-[4/5] overflow-hidden">
                <img src={THREAD_IMG} alt="Premium thread selection" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-6 w-48 h-48 md:w-64 md:h-64 img-zoom overflow-hidden border-4 border-ivory shadow-xl">
                <img src={FACTORY_IMG} alt="Manufacturing facility" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Text */}
            <div className={`lg:pl-8 ${aboutSection.visible ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
              <div className="section-label mb-5">Our Story</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-6">
                Built on Craft,<br/>
                <span className="italic font-normal">Driven by Precision.</span>
              </h2>
              <p className="text-charcoal-muted leading-relaxed mb-5">
                Since 2014, SilkRoute has been producing premium garments for brands across Europe, the Middle East and Asia. Our facility combines Sri Lanka's rich textile tradition with modern production technology.
              </p>
              <p className="text-charcoal-muted leading-relaxed mb-8">
                We work directly with brands, retailers and businesses who need reliable, high-quality garment manufacturing with a partner they can trust.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {[['50K+', 'Garments annually'], ['200+', 'Skilled artisans'], ['25+', 'Countries served'], ['ISO', 'Certified quality']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div className="font-display font-bold text-2xl text-charcoal">{val}</div>
                    <div className="text-sm text-charcoal-muted">{lbl}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('about')} className="btn-secondary">
                Discover Our Story
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section ref={productsSection.ref} className="py-20 bg-ivory-dark">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 ${productsSection.visible ? 'animate-fade-up' : 'opacity-0'}`}>
            <div>
              <div className="section-label mb-3">Product Range</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal">
                What We Make.
              </h2>
            </div>
            <button onClick={() => navigate('products')} className="btn-secondary mt-6 md:mt-0 self-start">
              View All Products
            </button>
          </div>

          {/* Asymmetric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Large featured */}
            <div
              className={`product-card md:col-span-5 relative overflow-hidden group cursor-pointer ${productsSection.visible ? 'animate-fade-up' : 'opacity-0'}`}
              onClick={() => navigate('product-detail')}
              style={{ animationDelay: '0.1s' }}
            >
              <div className="img-zoom aspect-[4/5] md:aspect-[3/4]">
                <img src={POLO_IMG} alt="Polo Shirts" className="w-full h-full object-cover" />
              </div>
              <div className="product-card-overlay absolute inset-0 bg-charcoal/60 flex flex-col justify-end p-6">
                <div className="text-xs text-bronze uppercase tracking-widest mb-1">Casual Wear</div>
                <div className="font-display text-2xl font-bold text-ivory mb-3">Polo Shirts</div>
                <button className="btn-bronze self-start text-xs py-2 px-4">Explore</button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 md:hidden">
                <div className="text-xs text-bronze uppercase tracking-widest mb-0.5">Casual Wear</div>
                <div className="font-display text-xl font-bold text-charcoal">Polo Shirts</div>
              </div>
            </div>

            {/* Right side 2x2 */}
            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              {PRODUCTS.slice(1).map((p, i) => (
                <div
                  key={i}
                  className={`product-card relative overflow-hidden group cursor-pointer ${productsSection.visible ? 'animate-fade-up' : 'opacity-0'}`}
                  onClick={() => navigate('product-detail')}
                  style={{ animationDelay: `${(i + 2) * 0.1}s` }}
                >
                  <div className="img-zoom aspect-square">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="product-card-overlay absolute inset-0 bg-charcoal/60 flex flex-col justify-end p-4">
                    <div className="text-xs text-bronze uppercase tracking-widest mb-0.5">{p.category}</div>
                    <div className="font-display text-lg font-bold text-ivory">{p.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section ref={servicesSection.ref} className="py-24">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className={`max-w-xl mb-14 ${servicesSection.visible ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="section-label mb-3">What We Offer</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal">
              End-to-End<br/><span className="italic font-normal">Manufacturing Services.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <div
                key={i}
                className={`card-hover border border-border p-8 bg-white cursor-pointer group ${servicesSection.visible ? 'animate-fade-up' : 'opacity-0'}`}
                onClick={() => navigate('services')}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="text-3xl mb-5">{s.icon}</div>
                <h3 className="font-display font-bold text-charcoal text-lg mb-3 group-hover:text-bronze transition-colors">{s.title}</h3>
                <p className="text-charcoal-muted text-sm leading-relaxed mb-5">{s.desc}</p>
                <div className="flex items-center gap-2 text-xs font-medium text-bronze uppercase tracking-wide">
                  Learn more
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANUFACTURING PROCESS ── */}
      <section ref={processSection.ref} className="py-24 bg-charcoal text-ivory overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className={`max-w-xl mb-16 ${processSection.visible ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="section-label text-bronze mb-3">Manufacturing Process</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ivory">
              How We Bring<br/><span className="italic font-normal">Your Ideas to Life.</span>
            </h2>
          </div>

          {/* Horizontal timeline desktop */}
          <div className="hidden lg:grid grid-cols-7 gap-0 relative mb-16">
            <div className="absolute top-6 left-[calc(100%/14)] right-[calc(100%/14)] h-px bg-ivory/10" />
            {PROCESS.map((p, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center px-4 ${processSection.visible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-full border border-bronze flex items-center justify-center font-mono text-sm text-bronze mb-5 bg-charcoal relative z-10">
                  {p.num}
                </div>
                <div className="font-medium text-ivory text-sm mb-2">{p.title}</div>
                <div className="text-ivory/40 text-xs leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Vertical timeline mobile */}
          <div className="lg:hidden flex flex-col gap-8 mb-12">
            {PROCESS.map((p, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border border-bronze flex items-center justify-center font-mono text-sm text-bronze shrink-0">
                    {p.num}
                  </div>
                  {i < PROCESS.length - 1 && <div className="flex-1 w-px bg-ivory/10 my-2" />}
                </div>
                <div className="pb-8">
                  <div className="font-medium text-ivory mb-1">{p.title}</div>
                  <div className="text-ivory/50 text-sm leading-relaxed">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Machine Image */}
          <div className="relative h-48 md:h-64 overflow-hidden">
            <img src={MACHINE_IMG} alt="Manufacturing" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={() => navigate('custom-builder')} className="btn-bronze text-sm">
                Start Your Order
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUSTAINABILITY ── */}
      <section className="py-24 bg-ivory-dark">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label mb-4">Sustainability</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mb-6">
                Made Responsibly.
              </h2>
              <p className="text-charcoal-muted leading-relaxed mb-8">
                We believe great manufacturing doesn't have to come at the cost of the environment. Our facility is committed to responsible practices across every stage of production.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {['Responsible Material Selection', 'Waste Reduction Programme', 'Efficient Energy Production', 'Sustainable Packaging', 'Ethical Workforce Standards'].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-bronze-pale flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2" stroke="#B8864E" strokeWidth="1.5"/></svg>
                    </div>
                    <span className="text-sm text-charcoal-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="img-zoom overflow-hidden aspect-[4/3]">
              <img src={FABRIC_IMG} alt="Sustainable fabric" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFERS ── */}
      <section ref={offersSection.ref} className="py-24">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 ${offersSection.visible ? 'animate-fade-up' : 'opacity-0'}`}>
            <div>
              <div className="section-label mb-3">Current Offers</div>
              <h2 className="font-display text-4xl font-bold text-charcoal">Active Promotions.</h2>
            </div>
            <button onClick={() => navigate('offers')} className="btn-secondary mt-6 md:mt-0 self-start">View All Offers</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFERS.map((o, i) => (
              <div
                key={i}
                className={`card-hover ${o.color} border border-border p-8 cursor-pointer ${offersSection.visible ? 'animate-fade-up' : 'opacity-0'}`}
                onClick={() => navigate('offers')}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="status-badge bg-bronze/10 text-bronze text-[10px] mb-5">{o.tag}</div>
                <div className="font-serif text-2xl font-bold mb-1">{o.discount}</div>
                <h3 className="font-display font-bold text-lg mb-3">{o.title}</h3>
                <p className="text-sm leading-relaxed opacity-70 mb-5">{o.desc}</p>
                <div className="text-xs opacity-50">{o.validity}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-ivory-dark">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="section-label mb-4">FAQ</div>
              <h2 className="font-display text-4xl font-bold text-charcoal mb-5">
                Common Questions.
              </h2>
              <p className="text-charcoal-muted leading-relaxed mb-6">
                Everything you need to know about working with us.
              </p>
              <button onClick={() => navigate('contact')} className="btn-primary text-sm">
                Ask a Question
              </button>
            </div>
            <div className="lg:col-span-8">
              <div className="divide-y divide-border">
                {FAQS.map((faq, i) => (
                  <div key={i} className="py-5">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-4 text-left"
                    >
                      <span className="font-medium text-charcoal">{faq.q}</span>
                      <div className={`shrink-0 w-6 h-6 flex items-center justify-center border border-border transition-all duration-300 ${openFaq === i ? 'bg-charcoal border-charcoal' : 'bg-transparent'}`}>
                        <svg
                          width="12" height="12" viewBox="0 0 12 12" fill="none"
                          className={`transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}
                        >
                          <path d="M6 1v10M1 6h10" stroke={openFaq === i ? '#F8F5F0' : '#1A1714'} strokeWidth="1.5"/>
                        </svg>
                      </div>
                    </button>
                    <div className={`accordion-content ${openFaq === i ? 'open' : ''}`}>
                      <p className="text-charcoal-muted text-sm leading-relaxed pt-3 pr-8">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="py-20 bg-charcoal text-ivory">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <div className="section-label text-bronze mb-4">Ready to Start?</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ivory mb-6">
            Let's Build Something<br/>
            <span className="italic font-normal">Exceptional Together.</span>
          </h2>
          <p className="text-ivory/60 mb-10 max-w-lg mx-auto">
            From concept to delivery, we handle every step. Get your custom quote today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('contact')} className="btn-bronze">
              Request a Quote
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5"/></svg>
            </button>
            <button onClick={() => navigate('products')} className="btn-secondary border-ivory text-ivory hover:bg-ivory hover:text-charcoal">
              Browse Products
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
