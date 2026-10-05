import { useState } from 'react'
import { useApp } from '../App'

const CATEGORIES = ['All', 'T-Shirts', 'Polo Shirts', 'Hoodies', 'Sportswear', 'Workwear', 'Custom']

const PRODUCTS = [
  { id: 1, name: 'Classic Polo Shirt', category: 'Polo Shirts', moq: '50 pcs', lead: '3–4 weeks', img: 'https://images.unsplash.com/photo-1714317438040-0e8584215699?w=800&h=1000&fit=crop&auto=format', featured: true },
  { id: 2, name: 'Essential T-Shirt', category: 'T-Shirts', moq: '100 pcs', lead: '2–3 weeks', img: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=1000&fit=crop&auto=format', featured: false },
  { id: 3, name: 'Premium Hoodie', category: 'Hoodies', moq: '50 pcs', lead: '4–5 weeks', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop&auto=format', featured: false },
  { id: 4, name: 'Performance Tee', category: 'Sportswear', moq: '100 pcs', lead: '3–4 weeks', img: 'https://images.unsplash.com/photo-1517146783983-418c681b56c5?w=800&h=1000&fit=crop&auto=format', featured: false },
  { id: 5, name: 'High-vis Workwear', category: 'Workwear', moq: '50 pcs', lead: '4–6 weeks', img: 'https://images.unsplash.com/photo-1624516268152-1e48624026ed?w=800&h=1000&fit=crop&auto=format', featured: false },
  { id: 6, name: 'Bespoke Garment', category: 'Custom', moq: 'On request', lead: '5–8 weeks', img: 'https://images.unsplash.com/photo-1700547949736-024ad8cb56cd?w=800&h=1000&fit=crop&auto=format', featured: true },
  { id: 7, name: 'Slim Fit Polo', category: 'Polo Shirts', moq: '50 pcs', lead: '3–4 weeks', img: 'https://images.unsplash.com/photo-1720514496268-44bb31c03815?w=800&h=1000&fit=crop&auto=format', featured: false },
  { id: 8, name: 'Relaxed Tee', category: 'T-Shirts', moq: '100 pcs', lead: '2–3 weeks', img: 'https://images.unsplash.com/photo-1633655442330-0b44ca0cce9b?w=800&h=1000&fit=crop&auto=format', featured: false },
]

export default function Products() {
  const { navigate } = useApp()
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory)

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero */}
      <div className="py-16 md:py-24 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="section-label mb-4">Product Range</div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-charcoal mb-5">
            What We Make.
          </h1>
          <p className="text-charcoal-muted max-w-xl leading-relaxed">
            Premium garments crafted for brands and businesses. Every piece manufactured to your specifications, with no compromise on quality.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-20 bg-ivory border-b border-border z-30">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex gap-1 py-4 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-5 py-2 text-xs font-medium tracking-widest uppercase transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-charcoal text-ivory'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="product-card animate-fade-up group cursor-pointer"
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => navigate('product-detail')}
            >
              <div className="img-zoom aspect-[3/4] overflow-hidden bg-muted relative">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                {p.featured && (
                  <div className="absolute top-3 left-3 bg-bronze text-ivory text-[10px] font-medium px-2 py-1 uppercase tracking-wide">
                    Featured
                  </div>
                )}
                <div className="product-card-overlay absolute inset-0 bg-charcoal/70 flex flex-col items-center justify-center gap-3">
                  <button className="btn-ivory bg-ivory text-charcoal text-xs py-2 px-5 font-medium tracking-widest uppercase hover:bg-bronze hover:text-ivory transition-colors">
                    Explore
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); navigate('contact') }}
                    className="text-ivory/80 text-xs underline underline-offset-2"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
              <div className="pt-4 pb-2">
                <div className="text-xs text-charcoal-muted uppercase tracking-widest mb-1">{p.category}</div>
                <div className="font-display font-semibold text-charcoal text-lg group-hover:text-bronze transition-colors">{p.name}</div>
                <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-muted">
                  <span>MOQ: {p.moq}</span>
                  <span>Lead: {p.lead}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-charcoal-muted text-sm">No products found in this category.</div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-ivory-dark py-16 mt-4 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <div className="section-label mb-3">Don't see what you need?</div>
          <h2 className="font-display text-3xl font-bold text-charcoal mb-5">We Build to Your Specs.</h2>
          <p className="text-charcoal-muted mb-8">Tell us what you're looking for and we'll make it happen.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('custom-builder')} className="btn-primary">Custom Garment Builder</button>
            <button onClick={() => navigate('contact')} className="btn-secondary">Get a Quote</button>
          </div>
        </div>
      </div>
    </div>
  )
}
