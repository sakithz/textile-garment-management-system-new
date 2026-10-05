import { useState } from 'react'
import { useApp } from '../App'

const IMAGES = [
  'https://images.unsplash.com/photo-1714317438040-0e8584215699?w=800&h=1000&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1720514496268-44bb31c03815?w=800&h=1000&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1720514496505-d6756368b0b3?w=800&h=1000&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=1000&fit=crop&auto=format',
]

const COLORS = ['#1A1714', '#F8F5F0', '#B8864E', '#4A7B9D', '#5A8A5A', '#8B3A3A']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
const FABRICS = ['100% Cotton (180gsm)', 'Cotton Blend (60/40)', 'Performance Polyester', 'Pique Cotton (200gsm)']

const INFO_TABS = ['Fabric', 'Customization', 'Production', 'Packaging', 'Delivery']
const TAB_CONTENT: Record<string, string> = {
  Fabric: 'Available in 100% combed cotton (180gsm, 200gsm), Cotton/Polyester blend (60/40), or performance pique. All fabrics are pre-shrunk and colour-fast. Swatches available on request.',
  Customization: 'Full customization available: embroidered logos, screen printing, heat transfer, woven labels, custom buttons and collar options. Minimum logo size: 2cm. Vector artwork (AI/EPS) required.',
  Production: 'Production begins after sample approval. Standard lead time is 3–4 weeks for orders under 500 units. Larger orders may require 5–7 weeks. Rush orders available on request.',
  Packaging: 'Individual poly bags as standard. Custom branded boxes, tissue paper wrapping, and hang tags available at additional cost. Bulk packing options for large orders.',
  Delivery: 'Worldwide delivery via DHL, FedEx or sea freight. CIF, FOB, and EXW terms available. All shipments include tracking. Average transit: 5–10 days air, 4–6 weeks sea.',
}

export default function ProductDetail() {
  const { navigate } = useApp()
  const [activeImg, setActiveImg] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedFabric, setSelectedFabric] = useState(0)
  const [quantity, setQuantity] = useState(100)
  const [activeTab, setActiveTab] = useState('Fabric')

  return (
    <div className="bg-ivory min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-xs text-charcoal-muted">
          <button onClick={() => navigate('home')} className="hover:text-charcoal transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('products')} className="hover:text-charcoal transition-colors">Products</button>
          <span>/</span>
          <span className="text-charcoal">Premium Polo Shirt</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <div className="img-zoom overflow-hidden aspect-[3/4] bg-muted">
              <img src={IMAGES[activeImg]} alt="Premium Polo Shirt" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden border-2 transition-all ${activeImg === i ? 'border-charcoal' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="text-xs text-charcoal-muted uppercase tracking-widest mb-2">Polo Shirts · SKU: PLO-001</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Premium Polo Shirt
            </h1>
            <p className="text-charcoal-muted leading-relaxed mb-8">
              A classic pique polo shirt manufactured to premium standards. Available in a wide range of colours, fabrics and customization options. Ideal for corporate uniforms, retail collections and branded merchandise.
            </p>

            {/* Color */}
            <div className="mb-6">
              <div className="form-label">Colour — {selectedColor + 1} selected</div>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === i ? 'border-charcoal scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c, boxShadow: '0 0 0 1px #D4CFC6' }}
                    aria-label={`Colour option ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <div className="form-label">Sizes Available</div>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-10 text-sm font-medium border transition-all ${
                      selectedSize === s
                        ? 'border-charcoal bg-charcoal text-ivory'
                        : 'border-border text-charcoal-muted hover:border-charcoal hover:text-charcoal'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div className="mb-6">
              <div className="form-label">Fabric Option</div>
              <div className="flex flex-col gap-2">
                {FABRICS.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFabric(i)}
                    className={`text-left px-4 py-3 border text-sm transition-all ${
                      selectedFabric === i
                        ? 'border-charcoal bg-charcoal text-ivory'
                        : 'border-border text-charcoal hover:border-charcoal'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <div className="form-label">Order Quantity (Minimum 50 pcs)</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(50, quantity - 50))}
                  className="w-10 h-10 border border-border flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(50, parseInt(e.target.value) || 50))}
                  className="w-24 text-center border border-border py-2 outline-none focus:border-charcoal text-charcoal font-medium"
                />
                <button
                  onClick={() => setQuantity(quantity + 50)}
                  className="w-10 h-10 border border-border flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-charcoal-muted">pieces</span>
              </div>
            </div>

            {/* Details box */}
            <div className="bg-bronze-pale p-5 mb-8 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-charcoal-muted uppercase tracking-wide mb-1">Min. Order</div>
                <div className="font-medium text-charcoal">50 pcs</div>
              </div>
              <div>
                <div className="text-xs text-charcoal-muted uppercase tracking-wide mb-1">Lead Time</div>
                <div className="font-medium text-charcoal">3–4 weeks</div>
              </div>
              <div>
                <div className="text-xs text-charcoal-muted uppercase tracking-wide mb-1">Customization</div>
                <div className="font-medium text-charcoal">Available</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-4 flex-wrap mb-8">
              <button onClick={() => navigate('contact')} className="btn-bronze flex-1 justify-center">
                Request a Quote
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
              <button onClick={() => navigate('custom-builder')} className="btn-secondary flex-1 justify-center">
                Customize
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-charcoal-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#3D7A5C" strokeWidth="1.3"/></svg>
              <span>Quality guaranteed · ISO certified manufacturing</span>
            </div>
          </div>
        </div>

        {/* Info Tabs */}
        <div className="mt-20 border-t border-border pt-12">
          <div className="flex gap-0 border-b border-border overflow-x-auto">
            {INFO_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium tracking-wide uppercase whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab ? 'border-charcoal text-charcoal' : 'border-transparent text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="pt-8 max-w-2xl">
            <p className="text-charcoal-muted leading-relaxed">{TAB_CONTENT[activeTab]}</p>
          </div>
        </div>

        {/* Related */}
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold text-charcoal mb-8">More Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { img: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&h=500&fit=crop&auto=format', name: 'Essential T-Shirt', cat: 'T-Shirts' },
              { img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=500&fit=crop&auto=format', name: 'Premium Hoodie', cat: 'Hoodies' },
              { img: 'https://images.unsplash.com/photo-1619459074340-2ad2fbba3014?w=400&h=500&fit=crop&auto=format', name: 'Performance Tee', cat: 'Sportswear' },
              { img: 'https://images.unsplash.com/photo-1700547949736-024ad8cb56cd?w=400&h=500&fit=crop&auto=format', name: 'Custom Garment', cat: 'Bespoke' },
            ].map((p, i) => (
              <div key={i} className="product-card cursor-pointer" onClick={() => navigate('product-detail')}>
                <div className="img-zoom aspect-[3/4] overflow-hidden bg-muted">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="pt-3">
                  <div className="text-xs text-charcoal-muted uppercase tracking-wide">{p.cat}</div>
                  <div className="font-display font-semibold text-charcoal mt-0.5">{p.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
