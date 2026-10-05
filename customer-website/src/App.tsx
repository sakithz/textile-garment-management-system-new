import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from 'react'

import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Services from './pages/Services'
import CustomBuilder from './pages/CustomBuilder'
import Offers from './pages/Offers'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import OrderTracking from './pages/OrderTracking'
import OrderHistory from './pages/OrderHistory'
import OrderDetails from './pages/OrderDetails'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'

import {
  getCustomerSession,
  clearCustomerSession,
  refreshCustomerSession,
  type Customer,
} from './services/customerApi'

export type Page =
    | 'home'
    | 'about'
    | 'products'
    | 'product-detail'
    | 'services'
    | 'custom-builder'
    | 'offers'
    | 'contact'
    | 'faq'
    | 'login'
    | 'register'
    | 'dashboard'
    | 'order-tracking'
    | 'order-history'
    | 'order-details'
    | 'profile'
    | 'notifications'
    | '404'

interface AppCtx {
  page: Page
  navigate: (p: Page) => void
  isLoggedIn: boolean
  setLoggedIn: (v: boolean) => void
  customer: Customer | null
  setCustomer: (customer: Customer | null) => void
  logout: () => void
}

export const AppContext = createContext<AppCtx>({
  page: 'home',
  navigate: () => {},
  isLoggedIn: false,
  setLoggedIn: () => {},
  customer: null,
  setCustomer: () => {},
  logout: () => {},
})

export const useApp = () => useContext(AppContext)

const PORTAL_PAGES: Page[] = [
  'dashboard',
  'order-tracking',
  'order-history',
  'order-details',
  'profile',
  'notifications',
]

const NAV_ITEMS: { label: string; page: Page }[] = [
  { label: 'Home', page: 'home' },
  { label: 'About', page: 'about' },
  { label: 'Products', page: 'products' },
  { label: 'Services', page: 'services' },
  { label: 'Custom Mfg', page: 'custom-builder' },
  { label: 'Offers', page: 'offers' },
  { label: 'Track Order', page: 'order-tracking' },
  { label: 'Contact', page: 'contact' },
]

function Navbar() {
  const {
    page,
    navigate,
    isLoggedIn,
    logout,
    customer,
  } = useApp()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () =>
        setScrolled(window.scrollY > 40)

    window.addEventListener(
        'scroll',
        onScroll,
        { passive: true }
    )

    return () =>
        window.removeEventListener(
            'scroll',
            onScroll
        )
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [page])

  const isPortal =
      PORTAL_PAGES.includes(page)

  return (
      <>
        <nav
            className={`sticky-nav fixed top-0 left-0 right-0 z-50 ${
                scrolled ? 'scrolled' : ''
            }`}
        >
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div
                className={`flex items-center justify-between transition-all duration-300 ${
                    scrolled ? 'h-16' : 'h-20'
                }`}
            >
              {/* Logo */}
              <button
                  onClick={() => navigate('home')}
                  className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 bg-charcoal flex items-center justify-center">
                  <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                  >
                    <path
                        d="M2 9C2 5.134 5.134 2 9 2s7 3.134 7 7-3.134 7-7 7-7-3.134-7-7Z"
                        stroke="#F8F5F0"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M5 9h8M9 5v8"
                        stroke="#B8864E"
                        strokeWidth="1.4"
                    />
                  </svg>
                </div>

                <div>
                  <div className="font-display font-bold text-charcoal text-[15px] leading-tight tracking-tight">
                    SilkRoute
                  </div>

                  <div className="text-[9px] font-medium tracking-[0.15em] uppercase text-charcoal-muted leading-none">
                    Textile &amp; Garments
                  </div>
                </div>
              </button>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-8">
                {isPortal ? (
                    <>
                      <button
                          onClick={() =>
                              navigate('dashboard')
                          }
                          className={`nav-link ${
                              page === 'dashboard'
                                  ? 'active text-bronze'
                                  : ''
                          }`}
                      >
                        Dashboard
                      </button>

                      <button
                          onClick={() =>
                              navigate('order-history')
                          }
                          className={`nav-link ${
                              page === 'order-history'
                                  ? 'active text-bronze'
                                  : ''
                          }`}
                      >
                        My Orders
                      </button>

                      <button
                          onClick={() =>
                              navigate('order-tracking')
                          }
                          className={`nav-link ${
                              page === 'order-tracking'
                                  ? 'active text-bronze'
                                  : ''
                          }`}
                      >
                        Track
                      </button>

                      <button
                          onClick={() =>
                              navigate('notifications')
                          }
                          className={`nav-link ${
                              page === 'notifications'
                                  ? 'active text-bronze'
                                  : ''
                          }`}
                      >
                        Notifications
                      </button>

                      <button
                          onClick={() =>
                              navigate('profile')
                          }
                          className={`nav-link ${
                              page === 'profile'
                                  ? 'active text-bronze'
                                  : ''
                          }`}
                      >
                        Profile
                      </button>
                    </>
                ) : (
                    NAV_ITEMS.map(item => (
                        <button
                            key={item.page}
                            onClick={() =>
                                navigate(item.page)
                            }
                            className={`nav-link ${
                                page === item.page
                                    ? 'active text-bronze'
                                    : ''
                            }`}
                        >
                          {item.label}
                        </button>
                    ))
                )}
              </div>

              {/* Right Actions */}
              <div className="hidden lg:flex items-center gap-4">
                {isLoggedIn ? (
                    <>
                      <button
                          onClick={() =>
                              navigate('dashboard')
                          }
                          className="nav-link flex items-center gap-1.5"
                      >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                          <circle
                              cx="8"
                              cy="5"
                              r="3"
                              stroke="#1A1714"
                              strokeWidth="1.3"
                          />

                          <path
                              d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
                              stroke="#1A1714"
                              strokeWidth="1.3"
                          />
                        </svg>

                        <span>
                      {customer?.name || 'Portal'}
                    </span>
                      </button>

                      <button
                          onClick={logout}
                          className="btn-secondary text-xs py-2 px-4"
                      >
                        Sign Out
                      </button>
                    </>
                ) : (
                    <>
                      <button
                          onClick={() =>
                              navigate('login')
                          }
                          className="nav-link"
                      >
                        Login
                      </button>

                      <button
                          onClick={() =>
                              navigate('contact')
                          }
                          className="btn-primary text-xs py-2.5 px-5"
                      >
                        Get a Quote
                      </button>
                    </>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                  className="lg:hidden flex flex-col gap-1.5 p-2"
                  onClick={() =>
                      setMenuOpen(!menuOpen)
                  }
                  aria-label="Toggle menu"
              >
              <span
                  className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${
                      menuOpen
                          ? 'rotate-45 translate-y-2'
                          : ''
                  }`}
              />

                <span
                    className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${
                        menuOpen
                            ? 'opacity-0'
                            : ''
                    }`}
                />

                <span
                    className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${
                        menuOpen
                            ? '-rotate-45 -translate-y-2'
                            : ''
                    }`}
                />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
            className={`mobile-menu fixed inset-0 z-40 bg-charcoal flex flex-col ${
                menuOpen ? 'open' : ''
            }`}
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-charcoal-light">
            <div className="font-display font-bold text-ivory text-lg">
              SilkRoute
            </div>

            <button
                onClick={() =>
                    setMenuOpen(false)
                }
                className="text-ivory p-2"
            >
              <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
              >
                <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
            {NAV_ITEMS.map(item => (
                <button
                    key={item.page}
                    onClick={() =>
                        navigate(item.page)
                    }
                    className="text-left font-display text-2xl text-ivory hover:text-bronze transition-colors"
                >
                  {item.label}
                </button>
            ))}

            <div className="border-t border-charcoal-light pt-6 flex flex-col gap-4">
              {isLoggedIn ? (
                  <>
                    <button
                        onClick={() =>
                            navigate('dashboard')
                        }
                        className="btn-bronze w-full justify-center"
                    >
                      My Portal
                    </button>

                    <button
                        onClick={logout}
                        className="btn-secondary border-ivory text-ivory hover:bg-ivory hover:text-charcoal w-full justify-center"
                    >
                      Sign Out
                    </button>
                  </>
              ) : (
                  <>
                    <button
                        onClick={() =>
                            navigate('login')
                        }
                        className="btn-secondary border-ivory text-ivory hover:bg-ivory hover:text-charcoal w-full justify-center"
                    >
                      Login
                    </button>

                    <button
                        onClick={() =>
                            navigate('contact')
                        }
                        className="btn-bronze w-full justify-center"
                    >
                      Get a Quote
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>
      </>
  )
}

function Footer() {
  const { navigate } = useApp()
  const [email, setEmail] = useState('')

  return (
      <footer className="bg-charcoal text-ivory">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 border border-ivory/30 flex items-center justify-center">
                  <svg
                      width="16"
                      height="16"
                      viewBox="0 0 18 18"
                      fill="none"
                  >
                    <path
                        d="M2 9C2 5.134 5.134 2 9 2s7 3.134 7 7-3.134 7-7 7-7-3.134-7-7Z"
                        stroke="#F8F5F0"
                        strokeWidth="1.2"
                    />

                    <path
                        d="M5 9h8M9 5v8"
                        stroke="#B8864E"
                        strokeWidth="1.4"
                    />
                  </svg>
                </div>

                <div>
                  <div className="font-display font-bold text-[15px]">
                    SilkRoute
                  </div>

                  <div className="text-[9px] tracking-[0.15em] uppercase text-ivory/50">
                    Textile &amp; Garments
                  </div>
                </div>
              </div>

              <p className="text-ivory/60 text-sm leading-relaxed mb-6">
                Premium garment manufacturing from Sri Lanka.
                Combining skilled craftsmanship with modern
                production technology since 2014.
              </p>

              <div className="flex gap-4">
                {[
                  'instagram',
                  'facebook',
                  'linkedin',
                ].map(social => (
                    <a
                        key={social}
                        href="#"
                        className="w-9 h-9 border border-ivory/20 flex items-center justify-center text-ivory/50 hover:text-ivory hover:border-ivory/50 transition-colors"
                    >
                      {social === 'instagram' && (
                          <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                          >
                            <rect
                                x="2"
                                y="2"
                                width="20"
                                height="20"
                                rx="5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />

                            <circle
                                cx="12"
                                cy="12"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />

                            <circle
                                cx="17.5"
                                cy="6.5"
                                r="1"
                                fill="currentColor"
                            />
                          </svg>
                      )}

                      {social === 'facebook' && (
                          <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                          >
                            <path
                                d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                          </svg>
                      )}

                      {social === 'linkedin' && (
                          <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                          >
                            <rect
                                x="2"
                                y="2"
                                width="20"
                                height="20"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />

                            <path
                                d="M8 11v6M8 8v.01M12 17v-4a2 2 0 014 0v4M12 11v6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                          </svg>
                      )}
                    </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <div className="section-label mb-5 text-ivory/40">
                Navigation
              </div>

              <div className="flex flex-col gap-3">
                {[
                  ['Products', 'products'],
                  ['Services', 'services'],
                  ['Offers', 'offers'],
                  ['About', 'about'],
                  ['Contact', 'contact'],
                  ['FAQ', 'faq'],
                ].map(([label, pg]) => (
                    <button
                        key={pg}
                        onClick={() =>
                            navigate(pg as Page)
                        }
                        className="text-left text-ivory/60 text-sm hover:text-ivory transition-colors"
                    >
                      {label}
                    </button>
                ))}
              </div>
            </div>

            {/* Customer */}
            <div>
              <div className="section-label mb-5 text-ivory/40">
                Customer
              </div>

              <div className="flex flex-col gap-3">
                {[
                  ['Login', 'login'],
                  ['Track Order', 'order-tracking'],
                  ['Order History', 'order-history'],
                  ['My Dashboard', 'dashboard'],
                ].map(([label, pg]) => (
                    <button
                        key={pg}
                        onClick={() =>
                            navigate(pg as Page)
                        }
                        className="text-left text-ivory/60 text-sm hover:text-ivory transition-colors"
                    >
                      {label}
                    </button>
                ))}
              </div>

              <div className="mt-6 text-sm text-ivory/60 flex flex-col gap-1.5">
                <div>📍 Colombo, Sri Lanka</div>
                <div>✉️ hello@silkroute.lk</div>
                <div>📞 +94 11 234 5678</div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <div className="section-label mb-5 text-ivory/40">
                Newsletter
              </div>

              <p className="text-ivory/60 text-sm mb-4">
                Get updates, new collections and offers
                delivered to your inbox.
              </p>

              <div className="flex">
                <input
                    type="email"
                    value={email}
                    onChange={e =>
                        setEmail(e.target.value)
                    }
                    placeholder="your@email.com"
                    className="flex-1 bg-charcoal-light border border-ivory/20 px-4 py-2.5 text-sm text-ivory placeholder-ivory/30 outline-none focus:border-bronze transition-colors"
                />

                <button className="bg-bronze px-4 py-2.5 text-ivory hover:bg-bronze-light transition-colors">
                  <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                  >
                    <path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-ivory/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-ivory/30 text-xs">
              © 2024 SilkRoute Textile &amp; Garments. All rights reserved.
            </div>

            <div className="flex gap-6 text-xs text-ivory/30">
            <span className="hover:text-ivory/60 cursor-pointer transition-colors">
              Privacy Policy
            </span>

              <span className="hover:text-ivory/60 cursor-pointer transition-colors">
              Terms of Service
            </span>

              <span className="hover:text-ivory/60 cursor-pointer transition-colors">
              Cookie Policy
            </span>
            </div>
          </div>
        </div>
      </footer>
  )
}

function PageRenderer({
                        page,
                      }: {
  page: Page
}) {
  switch (page) {
    case 'home':
      return <Home />

    case 'about':
      return <About />

    case 'products':
      return <Products />

    case 'product-detail':
      return <ProductDetail />

    case 'services':
      return <Services />

    case 'custom-builder':
      return <CustomBuilder />

    case 'offers':
      return <Offers />

    case 'contact':
      return <Contact />

    case 'faq':
      return <FAQ />

    case 'login':
      return <Login />

    case 'register':
      return <Register />

    case 'dashboard':
      return <Dashboard />

    case 'order-tracking':
      return <OrderTracking />

    case 'order-history':
      return <OrderHistory />

    case 'order-details':
      return <OrderDetails />

    case 'profile':
      return <Profile />

    case 'notifications':
      return <Notifications />

    default:
      return <NotFound />
  }
}

const NO_FOOTER_PAGES: Page[] = [
  'login',
  'register',
]

export default function App() {
  const [page, setPage] =
      useState<Page>('home')

  const [customer, setCustomer] =
      useState<Customer | null>(() =>
          getCustomerSession()
      )

  const [isLoggedIn, setLoggedIn] =
      useState<boolean>(() =>
          getCustomerSession() !== null
      )

  /*
   * Restore the customer session when the
   * application starts.
   *
   * The customer object is stored in localStorage
   * after successful registration/login.
   *
   * We also refresh the customer from the backend
   * so the portal uses the latest database values.
   */
  useEffect(() => {
    let mounted = true

    const restoreSession = async () => {
      const storedCustomer =
          getCustomerSession()

      if (!storedCustomer) {
        if (mounted) {
          setCustomer(null)
          setLoggedIn(false)
        }

        return
      }

      /*
       * Immediately restore the saved session.
       * This prevents the UI from appearing logged out
       * while the backend request is being processed.
       */
      if (mounted) {
        setCustomer(storedCustomer)
        setLoggedIn(true)
      }

      try {
        const latestCustomer =
            await refreshCustomerSession()

        if (!mounted) {
          return
        }

        if (latestCustomer) {
          setCustomer(latestCustomer)
          setLoggedIn(true)
        } else {
          setCustomer(null)
          setLoggedIn(false)
        }
      } catch {
        /*
         * If the backend is temporarily unavailable,
         * keep the stored customer session instead of
         * immediately logging the customer out.
         */
      }
    }

    void restoreSession()

    return () => {
      mounted = false
    }
  }, [])

  const navigate = (p: Page) => {
    /*
     * Customer portal pages require a logged-in
     * customer account.
     */
    if (
        PORTAL_PAGES.includes(p) &&
        !isLoggedIn
    ) {
      setPage('login')
      return
    }

    setPage(p)
  }

  const handleSetLoggedIn = (
      value: boolean
  ) => {
    setLoggedIn(value)

    /*
     * When login state is manually changed to false,
     * also remove the customer session.
     */
    if (!value) {
      clearCustomerSession()
      setCustomer(null)
    }
  }

  const handleSetCustomer = (
      nextCustomer: Customer | null
  ) => {
    setCustomer(nextCustomer)

    setLoggedIn(
        nextCustomer !== null
    )
  }

  const logout = () => {
    clearCustomerSession()
    setCustomer(null)
    setLoggedIn(false)
    setPage('home')
  }

  const showFooter =
      !NO_FOOTER_PAGES.includes(page)

  return (
      <AppContext.Provider
          value={{
            page,
            navigate,
            isLoggedIn,
            setLoggedIn:
            handleSetLoggedIn,
            customer,
            setCustomer:
            handleSetCustomer,
            logout,
          }}
      >
        <div className="min-h-screen bg-ivory">
          <Navbar />

          <main className="pt-20">
            <PageRenderer page={page} />
          </main>

          {showFooter && <Footer />}
        </div>
      </AppContext.Provider>
  )
}