import { useState } from 'react'
import { useApp } from '../App'
import {
  loginCustomer,
  saveCustomerSession,
} from '../services/customerApi'

export default function Login() {
  const {
    navigate,
    setLoggedIn,
    setCustomer,
  } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (
      event?: React.FormEvent
  ) => {
    event?.preventDefault()

    setError('')

    if (!email.trim() || !password) {
      setError(
          'Please enter your email and password.'
      )
      return
    }

    setLoading(true)

    try {
      const customer = await loginCustomer({
        email: email.trim().toLowerCase(),
        password,
      })

      /*
       * Save the authenticated customer so the
       * customer portal can restore the session.
       */
      saveCustomerSession(customer)

      /*
       * Update the global application state.
       */
      setCustomer(customer)
      setLoggedIn(true)

      /*
       * Go to the real customer dashboard.
       */
      navigate('dashboard')
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Invalid email or password.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setError(
        'Password reset is not available yet. Please contact SilkRoute support.'
    )
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
              Welcome Back
              <br />
              <span className="italic font-normal">
              to Your Portal.
            </span>
            </h2>

            <p className="text-ivory/60 leading-relaxed max-w-md">
              Access your real orders, quotations,
              delivery information and account details
              through your customer portal.
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

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="lg:hidden mb-10">

              <button
                  onClick={() => navigate('home')}
                  className="font-display text-2xl font-bold text-charcoal"
              >
                SilkRoute
              </button>

            </div>

            {/* Heading */}
            <div className="mb-8">

              <p className="section-label">
                Customer Portal
              </p>

              <h1 className="font-display text-4xl font-bold text-charcoal mt-2">
                Sign In
              </h1>

              <p className="text-charcoal-muted mt-3">
                Sign in to access your orders,
                quotations and account information.
              </p>

            </div>

            {/* Error */}
            {error && (
                <div className="bg-error/10 border border-error/20 text-error p-4 mb-6">

                  <p className="text-sm">
                    {error}
                  </p>

                </div>
            )}

            {/* Login form */}
            <form
                onSubmit={(event) => void handleLogin(event)}
                className="bg-white border border-border p-6 lg:p-8"
            >

              {/* Email */}
              <div className="mb-5">

                <label className="form-label">
                  Email Address
                </label>

                <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    className="form-input"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                />

              </div>

              {/* Password */}
              <div className="mb-3">

                <label className="form-label">
                  Password
                </label>

                <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    className="form-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                />

              </div>

              {/* Forgot password */}
              <div className="flex justify-end mb-6">

                <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-bronze hover:underline"
                    disabled={loading}
                >
                  Forgot password?
                </button>

              </div>

              {/* Submit */}
              <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
              >
                {loading
                    ? 'Signing in...'
                    : 'Sign In'}
              </button>

            </form>

            {/* Register */}
            <div className="text-center mt-6">

              <p className="text-sm text-charcoal-muted">
                Don't have a customer account?{' '}

                <button
                    onClick={() => navigate('register')}
                    className="text-bronze font-medium hover:underline"
                >
                  Create an account
                </button>
              </p>

            </div>

            {/* Back to website */}
            <div className="text-center mt-4">

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