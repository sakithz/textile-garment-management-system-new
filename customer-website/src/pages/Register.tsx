import { useState } from 'react'
import { useApp } from '../App'
import {
  registerCustomer,
  saveCustomerSession,
} from '../services/customerApi'

export default function Register() {
  const {
    navigate,
    setLoggedIn,
    setCustomer,
  } = useApp()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    password: '',
    confirm: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update =
      (key: keyof typeof form) =>
          (
              event: React.ChangeEvent<
                  HTMLInputElement | HTMLSelectElement
              >
          ) => {
            setForm((previous) => ({
              ...previous,
              [key]: event.target.value,
            }))
          }

  const submit = async (
      event?: React.FormEvent
  ) => {
    event?.preventDefault()

    setError('')

    if (
        !form.name.trim() ||
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.company.trim() ||
        !form.country ||
        !form.password
    ) {
      setError(
          'Please complete all required fields.'
      )
      return
    }

    if (form.password.length < 6) {
      setError(
          'Password must contain at least 6 characters.'
      )
      return
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      /*
       * This request creates the customer in the
       * shared MySQL customers table.
       */
      const customer = await registerCustomer({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        contact: form.phone.trim(),
        company: form.company.trim(),
        country: form.country,
        password: form.password,
      })

      /*
       * Store the returned customer session.
       */
      saveCustomerSession(customer)

      /*
       * Update global application state.
       */
      setCustomer(customer)
      setLoggedIn(true)

      /*
       * Go directly to the customer dashboard.
       */
      navigate('dashboard')
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Unable to create your account.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-ivory grid grid-cols-1 lg:grid-cols-2">

        {/* ============================================================
          LEFT SIDE
      ============================================================ */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-charcoal text-ivory relative overflow-hidden">

          <div className="absolute inset-0">
            <img
                src="https://images.unsplash.com/photo-1517146783983-418c681b56c5?w=800&h=1200&fit=crop&auto=format"
                alt="Textile threads"
                className="w-full h-full object-cover opacity-20"
            />

            <div className="absolute inset-0 bg-charcoal/70" />
          </div>

          {/* Logo */}
          <div className="relative">

            <button
                onClick={() => navigate('home')}
                className="font-display font-bold text-xl"
            >
              SilkRoute
            </button>

          </div>

          {/* Main message */}
          <div className="relative">

            <h2 className="font-display text-4xl font-bold mb-4">
              Create Your
              <br />

              <span className="text-bronze">
              Customer Account.
            </span>
            </h2>

            <p className="text-ivory/60 leading-relaxed max-w-md">
              Create an account to request quotations,
              track your orders and manage your customer
              information through the SilkRoute portal.
            </p>

          </div>

          {/* Footer */}
          <div className="relative text-xs text-ivory/30">
            © 2026 SilkRoute Textile &amp; Garment Management
          </div>

        </div>

        {/* ============================================================
          RIGHT SIDE
      ============================================================ */}
        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-lg">

            {/* Mobile logo */}
            <div className="lg:hidden mb-8">

              <button
                  onClick={() => navigate('home')}
                  className="font-display text-2xl font-bold text-charcoal"
              >
                SilkRoute
              </button>

            </div>

            {/* Heading */}
            <div className="mb-7">

              <p className="section-label">
                Customer Portal
              </p>

              <h1 className="font-display text-4xl font-bold text-charcoal mt-2">
                Create Account
              </h1>

              <p className="text-charcoal-muted mt-3">
                Register as a customer to access the
                SilkRoute customer portal.
              </p>

            </div>

            {/* Existing account */}
            <p className="text-sm text-charcoal-muted mb-6">

              Already have an account?{' '}

              <button
                  onClick={() => navigate('login')}
                  className="text-bronze font-medium hover:underline"
              >
                Sign in
              </button>

            </p>

            {/* Error */}
            {error && (
                <div className="bg-error/10 border border-error/20 text-error text-sm p-4 mb-5">
                  {error}
                </div>
            )}

            {/* ========================================================
              REGISTRATION FORM
          ======================================================== */}
            <form
                onSubmit={(event) => void submit(event)}
                className="bg-white border border-border p-6 lg:p-8"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>

                  <label className="form-label">
                    Full Name *
                  </label>

                  <input
                      type="text"
                      value={form.name}
                      onChange={update('name')}
                      className="form-input"
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={loading}
                      required
                  />

                </div>

                {/* Email */}
                <div>

                  <label className="form-label">
                    Email *
                  </label>

                  <input
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      className="form-input"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={loading}
                      required
                  />

                </div>

                {/* Phone */}
                <div>

                  <label className="form-label">
                    Phone *
                  </label>

                  <input
                      type="tel"
                      value={form.phone}
                      onChange={update('phone')}
                      className="form-input"
                      placeholder="+94 77 123 4567"
                      autoComplete="tel"
                      disabled={loading}
                      required
                  />

                </div>

                {/* Company */}
                <div>

                  <label className="form-label">
                    Company *
                  </label>

                  <input
                      type="text"
                      value={form.company}
                      onChange={update('company')}
                      className="form-input"
                      placeholder="Company name"
                      autoComplete="organization"
                      disabled={loading}
                      required
                  />

                </div>

                {/* Country */}
                <div>

                  <label className="form-label">
                    Country *
                  </label>

                  <select
                      value={form.country}
                      onChange={update('country')}
                      className="form-input"
                      disabled={loading}
                      required
                  >

                    <option value="">
                      Select country
                    </option>

                    <option value="Sri Lanka">
                      Sri Lanka
                    </option>

                    <option value="Singapore">
                      Singapore
                    </option>

                    <option value="United Kingdom">
                      United Kingdom
                    </option>

                    <option value="Germany">
                      Germany
                    </option>

                    <option value="France">
                      France
                    </option>

                    <option value="United States">
                      United States
                    </option>

                    <option value="Australia">
                      Australia
                    </option>

                    <option value="United Arab Emirates">
                      United Arab Emirates
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* Password */}
                <div>

                  <label className="form-label">
                    Password *
                  </label>

                  <input
                      type="password"
                      value={form.password}
                      onChange={update('password')}
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                  />

                </div>

                {/* Confirm Password */}
                <div className="md:col-span-2">

                  <label className="form-label">
                    Confirm Password *
                  </label>

                  <input
                      type="password"
                      value={form.confirm}
                      onChange={update('confirm')}
                      className="form-input"
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                  />

                </div>

              </div>

              {/* Submit */}
              <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-6"
              >
                {loading
                    ? 'Creating account...'
                    : 'Create Account'}
              </button>

            </form>

            {/* Back */}
            <div className="text-center mt-5">

              <button
                  onClick={() => navigate('home')}
                  className="text-sm text-charcoal-muted hover:text-charcoal"
              >
                ← Back to website
              </button>

            </div>

          </div>

        </div>

      </div>
  )
}