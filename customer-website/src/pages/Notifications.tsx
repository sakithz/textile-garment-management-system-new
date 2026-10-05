import { useApp } from '../App'

export default function Notifications() {
  const {
    navigate,
    customer,
  } = useApp()

  if (!customer) {
    return null
  }

  return (
      <div className="min-h-screen bg-[#F8F8F6] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
                type="button"
                onClick={() =>
                    navigate('dashboard')
                }
                className="text-sm text-gray-500 hover:text-[#1F4D3A] transition-colors mb-4"
            >
              ← Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#DDE9E2] flex items-center justify-center">
                <svg
                    className="w-5 h-5 text-[#1F4D3A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-3xl font-semibold text-[#1F2937]">
                  Notifications
                </h1>

                <p className="mt-1 text-gray-500">
                  Stay updated about your orders and quotations.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 sm:p-14 text-center">
            <div className="w-20 h-20 rounded-full bg-[#F5F7F4] flex items-center justify-center mx-auto mb-6">
              <svg
                  className="w-9 h-9 text-[#1F4D3A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-[#1F2937]">
              No notifications yet
            </h2>

            <p className="max-w-md mx-auto mt-3 text-sm leading-6 text-gray-500">
              You will see important updates about your quotations,
              orders, production progress, and deliveries here.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <button
                  type="button"
                  onClick={() =>
                      navigate(
                          'order-history'
                      )
                  }
                  className="px-5 py-3 rounded-lg bg-[#1F4D3A] text-white text-sm font-medium hover:bg-[#173A2C] transition-colors"
              >
                View My Orders
              </button>

              <button
                  type="button"
                  onClick={() =>
                      navigate(
                          'dashboard'
                      )
                  }
                  className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#DDE9E2] bg-[#F5F7F4] px-5 py-4">
            <div className="flex gap-3">
              <svg
                  className="w-5 h-5 text-[#1F4D3A] shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>

              <div>
                <p className="text-sm font-medium text-[#1F2937]">
                  Notification updates
                </p>

                <p className="text-xs text-gray-500 mt-1 leading-5">
                  Notification data will be connected to the backend
                  when the customer notification functionality is
                  implemented.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}