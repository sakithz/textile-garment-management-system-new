import { useState } from 'react'
import { useApp } from '../App'

const FAQS = [
  {
    category: 'Orders & MOQ',
    items: [
      { q: 'What is the minimum order quantity?', a: 'Our minimum order quantity (MOQ) is 50 units per style per colour. For certain products like hoodies and jackets the MOQ may be higher. Contact us to discuss your specific requirements.' },
      { q: 'Can I order different styles in one order?', a: 'Yes. You can combine multiple styles in one order as long as each style meets the individual MOQ. We offer combined shipping for multi-style orders.' },
      { q: 'Do you accept small sample orders?', a: 'Yes, we produce samples before every bulk order. Sample quantities are typically 1–3 pieces. Sample costs are credited back to you upon placing a bulk order.' },
    ]
  },
  {
    category: 'Products',
    items: [
      { q: 'What garment types do you manufacture?', a: 'T-shirts, polo shirts, hoodies, zip-up hoodies, track jackets, performance sportswear, casual shirts, workwear, and fully custom garment styles.' },
      { q: 'What fabric options are available?', a: 'We work with 100% cotton (combed and carded), polyester, cotton/polyester blends, pique, fleece, French terry, and technical performance fabrics. Custom fabric sourcing is available.' },
      { q: 'Can I specify a particular fabric GSM?', a: 'Yes. We can manufacture to your fabric specification including GSM, thread count and finish. Minimum quantities may apply for custom fabric sourcing.' },
    ]
  },
  {
    category: 'Customization',
    items: [
      { q: 'Can I customize garments with my logo?', a: 'Absolutely. We offer embroidery, screen printing, heat transfer, DTG printing and woven/printed label options. Most customization methods are available on all garment types.' },
      { q: 'What file format do you need for logos?', a: 'Vector files (AI or EPS) are required for embroidery and screen printing. High-resolution PNG (300dpi+) is acceptable for heat transfer and DTG. We can help with basic artwork preparation.' },
      { q: 'Do you offer custom labels and packaging?', a: 'Yes. Custom woven labels, hang tags, poly bags, boxes and tissue paper are all available. We can manufacture under your brand completely.' },
    ]
  },
  {
    category: 'Production & Delivery',
    items: [
      { q: 'How long does production take?', a: 'Standard lead time is 3–5 weeks after sample approval, depending on garment type and order volume. Rush production is available in some cases — contact us to discuss.' },
      { q: 'Where do you ship to?', a: 'We ship worldwide via DHL, FedEx and sea freight. We can ship under CIF, FOB or EXW terms. Most European and US orders arrive within 5–8 business days by air.' },
      { q: 'How can I track my order?', a: 'All orders receive a unique order ID. You can track production status in real time through our customer portal, with updates at each production milestone.' },
    ]
  },
  {
    category: 'Pricing',
    items: [
      { q: 'How is pricing structured?', a: 'Pricing depends on garment type, fabric, quantity, and customization options. We provide itemized quotations. Volume discounts apply for orders over 200, 500 and 1,000 units.' },
      { q: 'Do you offer bulk discounts?', a: 'Yes. Orders over 500 units receive a 12–18% discount depending on the product. Repeat customers also receive loyalty pricing on subsequent orders.' },
      { q: 'What payment terms do you offer?', a: 'Standard terms are 50% deposit at order confirmation, 50% before shipment. Established customers with a good order history may qualify for extended terms.' },
    ]
  },
]

export default function FAQ() {
  const { navigate } = useApp()
  const [openItem, setOpenItem] = useState<string | null>('Orders & MOQ-0')
  const [search, setSearch] = useState('')

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero */}
      <div className="py-16 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="section-label mb-3">FAQ</div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-charcoal mb-5">
            Frequently Asked<br/><span className="italic font-normal">Questions.</span>
          </h1>
          {/* Search */}
          <div className="relative max-w-lg mt-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="form-input pl-12"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-32">
              <div className="form-label mb-4">Categories</div>
              <div className="flex flex-col gap-1">
                {FAQS.map(cat => (
                  <a key={cat.category} href={`#${cat.category}`} className="text-sm text-charcoal-muted hover:text-charcoal transition-colors py-1.5 border-l-2 border-transparent hover:border-bronze pl-3">
                    {cat.category}
                  </a>
                ))}
              </div>
              <div className="mt-8 p-5 bg-bronze-pale">
                <div className="font-medium text-charcoal mb-2">Still have questions?</div>
                <p className="text-sm text-charcoal-muted mb-4">Our team is ready to help with any specific requirements.</p>
                <button onClick={() => navigate('contact')} className="btn-primary text-xs w-full justify-center">Contact Us</button>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-9">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-charcoal-muted">No results found for "{search}"</div>
              </div>
            ) : (
              filtered.map(cat => (
                <div key={cat.category} id={cat.category} className="mb-12">
                  <h2 className="font-display text-xl font-bold text-charcoal mb-6 pb-3 border-b border-border">{cat.category}</h2>
                  <div className="flex flex-col gap-0 divide-y divide-border">
                    {cat.items.map((item, i) => {
                      const key = `${cat.category}-${i}`
                      const isOpen = openItem === key
                      return (
                        <div key={i} className="py-5">
                          <button
                            onClick={() => setOpenItem(isOpen ? null : key)}
                            className="w-full flex items-center justify-between gap-4 text-left"
                          >
                            <span className={`font-medium transition-colors ${isOpen ? 'text-bronze' : 'text-charcoal'}`}>{item.q}</span>
                            <div className={`shrink-0 w-6 h-6 flex items-center justify-center border transition-all duration-300 ${isOpen ? 'bg-bronze border-bronze' : 'border-border bg-transparent'}`}>
                              <svg
                                width="12" height="12" viewBox="0 0 12 12" fill="none"
                                className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                              >
                                <path d="M6 1v10M1 6h10" stroke={isOpen ? '#F8F5F0' : '#1A1714'} strokeWidth="1.5"/>
                              </svg>
                            </div>
                          </button>
                          <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                            <p className="text-charcoal-muted text-sm leading-relaxed pt-3 pr-10">{item.a}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
