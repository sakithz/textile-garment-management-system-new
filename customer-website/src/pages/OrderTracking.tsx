import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { useApp } from '../App'
import {
  fetchOrderByNumber,
  type CustomerOrder,
} from '../services/customerApi'

export default function OrderTracking() {
  const {
    navigate,
    customer,
  } = useApp()

  const [order, setOrder] =
      useState<CustomerOrder | null>(null)

  const [orderNumber, setOrderNumber] =
      useState('')

  const [loading, setLoading] =
      useState(false)

  const [error, setError] =
      useState('')

  const loadOrder = async (
      number: string
  ) => {
    const trimmedNumber =
        number.trim()

    if (!trimmedNumber) {
      setError(
          'Please enter an order number.'
      )
      return
    }

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const data =
          await fetchOrderByNumber(
              trimmedNumber
          )

      if (
          data.customer &&
          customer &&
          data.customer.id !== customer.id
      ) {
        setError(
            'You are not authorized to track this order.'
        )
        return
      }

      setOrder(data)

      sessionStorage.setItem(
          'silkroute_tracking_order',
          trimmedNumber
      )

      sessionStorage.setItem(
          'silkroute_selected_order',
          trimmedNumber
      )
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Order could not be found.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!customer) {
      navigate('login')
      return
    }

    const storedOrderNumber =
        sessionStorage.getItem(
            'silkroute_tracking_order'
        )

    if (storedOrderNumber) {
      setOrderNumber(storedOrderNumber)
      void loadOrder(storedOrderNumber)
    }
  }, [customer, navigate])

  const handleSubmit = (
      event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    void loadOrder(orderNumber)
  }

  const handleOrderHistory = () => {
    sessionStorage.removeItem(
        'silkroute_tracking_order'
    )

    navigate('order-history')
  }

  const handleViewDetails = () => {
    if (!order) {
      return
    }

    sessionStorage.setItem(
        'silkroute_selected_order',
        order.orderNumber
    )

    navigate('order-details')
  }

  const formatDate = (
      value: string | null | undefined
  ) => {
    if (!value) {
      return '—'
    }

    const date =
        new Date(value)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
      return value
    }

    return date.toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
    )
  }

  const getStatusLabel = (
      status: string
  ) => {
    return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        )
  }

  const getStatusDescription = (
      status: string
  ) => {
    switch (status) {
      case 'PENDING':
        return 'Your order is waiting for processing.'

      case 'APPROVED':
        return 'Your order has been approved and is ready to move into production.'

      case 'IN_PRODUCTION':
        return 'Your order is currently being manufactured.'

      case 'QUALITY_CHECK':
        return 'Your garments are undergoing quality inspection.'

      case 'READY':
        return 'Your order is ready for delivery.'

      case 'DELIVERED':
        return 'Your order has been delivered.'

      case 'CANCELLED':
        return 'This order has been cancelled.'

      default:
        return 'Your order is being processed.'
    }
  }

  const getStepState = (
      step: number
  ) => {
    if (!order) {
      return 'upcoming'
    }

    if (
        order.status ===
        'CANCELLED'
    ) {
      return 'cancelled'
    }

    const statusStepMap: Record<
        string,
        number
    > = {
      PENDING: 1,
      APPROVED: 1,
      IN_PRODUCTION: 2,
      QUALITY_CHECK: 3,
      READY: 4,
      DELIVERED: 5,
    }

    const currentStep =
        statusStepMap[
            order.status
            ] ?? 1

    if (step < currentStep) {
      return 'completed'
    }

    if (
        step === currentStep
    ) {
      if (
          order.status ===
          'DELIVERED'
      ) {
        return 'completed'
      }

      return 'current'
    }

    return 'upcoming'
  }

  const trackingSteps = [
    {
      number: 1,
      title: 'Order Confirmed',
      description:
          'Your order has been confirmed.',
    },
    {
      number: 2,
      title: 'In Production',
      description:
          'Your garments are currently being produced.',
    },
    {
      number: 3,
      title: 'Quality Check',
      description:
          'The completed garments are being inspected.',
    },
    {
      number: 4,
      title: 'Ready for Delivery',
      description:
          'Your order is ready to be dispatched.',
    },
    {
      number: 5,
      title: 'Delivered',
      description:
          'Your order has been delivered.',
    },
  ]

  if (!customer) {
    return null
  }

  return (
      <div className="min-h-screen bg-[#F8F8F6] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
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

            <h1 className="text-3xl font-semibold text-[#1F2937]">
              Track Your Order
            </h1>

            <p className="mt-2 text-gray-500">
              Enter your order number to view the latest order status.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <label
                    htmlFor="orderNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Order Number
                </label>

                <input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(event) => {
                      setOrderNumber(
                          event.target.value
                      )
                      setError('')
                    }}
                    placeholder="e.g. ORD-1001"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A]"
                />
              </div>

              <div className="sm:self-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#1F4D3A] text-white text-sm font-medium hover:bg-[#173A2C] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading
                      ? 'Tracking...'
                      : 'Track Order'}
                </button>
              </div>
            </form>

            {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
            )}
          </div>

          {order && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order Number
                      </p>

                      <h2 className="text-2xl font-semibold text-[#1F2937] mt-1">
                        {order.orderNumber}
                      </h2>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500">
                        Current Status
                      </p>

                      <p className="text-lg font-semibold text-[#1F4D3A] mt-1">
                        {getStatusLabel(
                            order.status
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-[#F5F7F4] p-5">
                    <p className="text-sm text-gray-700">
                      {getStatusDescription(
                          order.status
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-lg font-semibold text-[#1F2937]">
                        Order Timeline
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Track your order from confirmation to delivery.
                      </p>
                    </div>

                    <span className="text-lg font-semibold text-[#1F4D3A]">
                  {Math.max(
                      0,
                      Math.min(
                          100,
                          Number(
                              order.progress ?? 0
                          )
                      )
                  )}
                      %
                </span>
                  </div>

                  <div className="relative">
                    {trackingSteps.map(
                        (
                            step,
                            index
                        ) => {
                          const state =
                              getStepState(
                                  step.number
                              )

                          return (
                              <div
                                  key={
                                    step.number
                                  }
                                  className="relative flex gap-4 pb-8 last:pb-0"
                              >
                                {index <
                                    trackingSteps.length -
                                    1 && (
                                        <div
                                            className={`absolute left-[15px] top-8 w-0.5 h-full ${
                                                state ===
                                                'completed'
                                                    ? 'bg-[#1F4D3A]'
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    )}

                                <div
                                    className={`relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                        state ===
                                        'completed'
                                            ? 'bg-[#1F4D3A] text-white'
                                            : state ===
                                            'current'
                                                ? 'bg-[#DDE9E2] text-[#1F4D3A] ring-2 ring-[#1F4D3A]'
                                                : state ===
                                                'cancelled'
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-gray-100 text-gray-400'
                                    }`}
                                >
                                  {state ===
                                  'completed'
                                      ? '✓'
                                      : step.number}
                                </div>

                                <div className="pt-1">
                                  <h3
                                      className={`text-sm font-semibold ${
                                          state ===
                                          'upcoming'
                                              ? 'text-gray-400'
                                              : 'text-[#1F2937]'
                                      }`}
                                  >
                                    {step.title}
                                  </h3>

                                  <p
                                      className={`text-sm mt-1 ${
                                          state ===
                                          'upcoming'
                                              ? 'text-gray-400'
                                              : 'text-gray-500'
                                      }`}
                                  >
                                    {step.description}
                                  </p>

                                  {state ===
                                      'current' && (
                                          <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-[#DDE9E2] text-[#1F4D3A] text-xs font-medium">
                              Current stage
                            </span>
                                      )}
                                </div>
                              </div>
                          )
                        }
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-[#1F2937] mb-5">
                      Order Information
                    </h2>

                    <div className="space-y-4">
                      <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Garment Type
                    </span>

                        <span className="text-sm font-medium text-[#1F2937] text-right">
                      {order.garmentType ||
                          '—'}
                    </span>
                      </div>

                      <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Quantity
                    </span>

                        <span className="text-sm font-medium text-[#1F2937]">
                      {order.quantity.toLocaleString()}
                    </span>
                      </div>

                      <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Fabric
                    </span>

                        <span className="text-sm font-medium text-[#1F2937] text-right">
                      {order.fabric ||
                          '—'}
                    </span>
                      </div>

                      <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Color
                    </span>

                        <span className="text-sm font-medium text-[#1F2937] text-right">
                      {order.color ||
                          '—'}
                    </span>
                      </div>

                      <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                      Size
                    </span>

                        <span className="text-sm font-medium text-[#1F2937] text-right">
                      {order.size ||
                          '—'}
                    </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-[#1F2937] mb-5">
                      Delivery
                    </h2>

                    <div className="space-y-5">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Order Date
                        </p>

                        <p className="text-sm font-medium text-[#1F2937]">
                          {formatDate(
                              order.orderDate
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Expected Delivery
                        </p>

                        <p className="text-sm font-medium text-[#1F2937]">
                          {formatDate(
                              order.deliveryDate
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Priority
                        </p>

                        <p className="text-sm font-medium text-[#1F2937]">
                          {getStatusLabel(
                              order.priority
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                      type="button"
                      onClick={handleViewDetails}
                      className="px-5 py-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Full Details
                  </button>

                  <button
                      type="button"
                      onClick={
                        handleOrderHistory
                      }
                      className="px-5 py-3 rounded-lg bg-[#1F4D3A] text-white text-sm font-medium hover:bg-[#173A2C] transition-colors"
                  >
                    Order History
                  </button>
                </div>
              </div>
          )}

          {!order &&
              !loading &&
              !error && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F4F1] flex items-center justify-center mx-auto mb-5">
                      <svg
                          className="w-7 h-7 text-[#1F4D3A]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.7}
                            d="M9 12h6m-6 4h4m-7 5h10a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0012.172 2H6a2 2 0 00-2 2v15a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <h2 className="text-xl font-semibold text-[#1F2937]">
                      Track an Order
                    </h2>

                    <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                      Enter an order number above to see its current
                      production and delivery status.
                    </p>
                  </div>
              )}
        </div>
      </div>
  )
}