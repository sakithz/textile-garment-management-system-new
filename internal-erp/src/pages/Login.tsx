import { useState } from 'react';
import type { User } from '../data/mockData';
import { loginUser } from '../services/authApi';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
      e: React.FormEvent
  ) => {

    e.preventDefault();

    setLoading(true);
    setError('');

    try {

      const user =
          await loginUser(email, password);

      onLogin(user);

    } catch (err: unknown) {

      setError(
          err instanceof Error
              ? err.message
              : 'Invalid email or password.'
      );

    } finally {

      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex">

        {/* Left panel */}
        <div
            className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
            style={{ background: '#0d1420' }}
        >

          <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                    'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%), repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
                backgroundSize: '20px 20px'
              }}
          />

          <div
              className="absolute inset-0"
              style={{
                background:
                    'radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(217,119,6,0.1) 0%, transparent 50%)'
              }}
          />

          {/* Logo */}
          <div className="relative flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">

              <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>

            </div>

            <span className="text-white font-bold text-xl font-display tracking-wide">
            SilkRoute
          </span>

          </div>

          {/* Main content */}
          <div className="relative">

            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1 mb-6">

              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />

              <span className="text-blue-300 text-xs font-medium">
              Enterprise Management Platform
            </span>

            </div>

            <h1 className="text-white font-display text-4xl font-bold leading-tight mb-4">
              Precision. Production.
              <br />
              <span className="text-blue-400">
              Performance.
            </span>
            </h1>

            <p className="text-[#94a3b8] text-base leading-relaxed max-w-sm">
              The complete ERP solution for textile and garment manufacturing.
              Manage orders, production, inventory and finance from a single
              unified platform.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">

              {[


                {
                  label: 'Production Units',
                  value: '3'
                }
              ].map(stat => (

                  <div
                      key={stat.label}
                      className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >

                    <div className="text-white font-bold text-xl font-display">
                      {stat.value}
                    </div>

                    <div className="text-[#64748b] text-xs mt-0.5">
                      {stat.label}
                    </div>

                  </div>

              ))}

            </div>

          </div>

          {/* Footer */}
          <div className="relative text-[#475569] text-xs">
            © 2026 SilkRoute Garments Pvt. Ltd.
          </div>

          {/* Decorative fabric threads */}
          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">

            <svg
                viewBox="0 0 200 200"
                fill="none"
            >

              {Array.from(
                  { length: 8 },
                  (_, i) => (

                      <line
                          key={i}
                          x1={i * 28}
                          y1="0"
                          x2="200"
                          y2={200 - i * 28}
                          stroke="#3b82f6"
                          strokeWidth="0.5"
                      />

                  )
              )}

              {Array.from(
                  { length: 8 },
                  (_, i) => (

                      <line
                          key={`h${i}`}
                          x1="0"
                          y1={i * 28}
                          x2={200 - i * 28}
                          y2="200"
                          stroke="#d97706"
                          strokeWidth="0.5"
                      />

                  )
              )}

            </svg>

          </div>

        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#f8fafc]">

          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 mb-8">

              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">

                <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>

              </div>

              <span className="font-bold font-display text-[#0d1420]">
              SilkRoute
            </span>

            </div>

            <div className="mb-8">

              <h2 className="text-2xl font-bold font-display text-[#0f172a]">
                Welcome back
              </h2>

              <p className="text-[#64748b] text-sm mt-1">
                Sign in to your workspace
              </p>

            </div>

            {error && (

                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm flex items-start gap-2">

                  <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>

                  {error}

                </div>

            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >

              <div>

                <label className="block text-sm font-medium text-[#334155] mb-1.5">
                  Email address
                </label>

                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-[#0f172a]"
                    placeholder="you@silkroute.com"
                    required
                />

              </div>

              <div>

                <div className="flex items-center justify-between mb-1.5">

                  <label className="block text-sm font-medium text-[#334155]">
                    Password
                  </label>

                  <button
                      type="button"
                      className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-[#0f172a] pr-10"
                      placeholder="••••••••"
                      required
                  />

                  <button
                      type="button"
                      onClick={() =>
                          setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                  >

                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >

                      {showPassword ? (

                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 1.343 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />

                      ) : (

                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-4.057-9.542-7z"
                          />

                      )}

                    </svg>

                  </button>

                </div>

              </div>

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >

                {loading ? (

                    <>
                      <svg
                          className="animate-spin w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                      >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />

                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />

                      </svg>

                      Signing in...
                    </>

                ) : (
                    'Sign In'
                )}

              </button>

            </form>

          </div>

        </div>

      </div>
  );
}