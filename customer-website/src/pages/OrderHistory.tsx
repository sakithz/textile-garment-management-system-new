import { useEffect, useState } from 'react'
import { useApp } from '../App'
import {
  fetchCustomerOrders,
  type CustomerOrder,
} from '../services/customerApi'

export default function OrderHistory() {
  const {
    navigate,
    customer,
  } = useApp()

  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customer) {
      navigate('login')
      return
    }

    const loadOrders = async () => {
      setLoading(true)
      setError('')

      try {
        const data =
            await fetchCustomerOrders(customer.id)

        setOrders(data)
      } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : 'Failed to load your orders.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [customer, navigate])

  const handleViewOrder = (
      orderNumber: string
  ) => {
    sessionStorage.setItem(
        'silkroute_selected_order',
        orderNumber
    )

    navigate('order-details')
  }

  const formatCurrency = (
      value: number
  ) => {
    return new Intl.NumberFormat(
        'en-US',
        {
          style: 'currency',
          currency: 'LKR',
        }
    ).format(value ?? 0)
  }

  const formatDate = (
      value: string
  ) => {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'short',
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
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        )
  }

  const getStatusStyle = (
      status: string
  ) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700'

      case 'IN_PRODUCTION':
        return 'bg-blue-100 text-blue-700'

      case 'QUALITY_CHECK':
        return 'bg-purple-100 text-purple-700'

      case 'READY':
        return 'bg-emerald-100 text-emerald-700'

      case 'APPROVED':
        return 'bg-cyan-100 text-cyan-700'

      case 'CANCELLED':
        return 'bg-red-100 text-red-700'

      default:
        return 'bg-amber-100 text-amber-700'
    }
  }

  if (!customer) {
    return null
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1F4D3A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm text-gray-500">
              Loading your orders...
            </p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-[#F8F8F6] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
                type="button"
                onClick={() => navigate('dashboard')}
                className="text-sm text-gray-500 hover:text-[#1F4D3A] transition-colors mb-4"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-3xl font-semibold text-[#1F2937]">
              Order History
            </h1>

            <p className="mt-2 text-gray-500">
              View your orders and track their current status.
            </p>
          </div>

          {/* Error */}
          {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
          )}

          {/* Empty state */}
          {!error && orders.length === 0 && (
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
                        d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-semibold text-[#1F2937]">
                  No orders yet
                </h2>

                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                  Once one of your quotations is approved and converted into an order, it will appear here.
                </p>

                <button
                    type="button"
                    onClick={() => navigate('custom-builder')}
                    className="mt-6 px-5 py-3 rounded-lg bg-[#1F4D3A] text-white text-sm font-medium hover:bg-[#173A2C] transition-colors"
                >
                  Request a Quotation
                </button>
              </div>
          )}

          {/* Desktop table */}
          {orders.length > 0 && (
              <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="bg-[#F5F7F4] border-b border-gray-200">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Order
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Product
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Quantity
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Order Date
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Delivery
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Status
                      </th>

                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Total
                      </th>

                      <th className="px-6 py-4" />
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                        <tr
                            key={order.id}
                            className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <button
                                type="button"
                                onClick={() =>
                                    handleViewOrder(
                                        order.orderNumber
                                    )
                                }
                                className="text-sm font-semibold text-[#1F4D3A] hover:underline"
                            >
                              {order.orderNumber}
                            </button>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-sm font-medium text-[#1F2937]">
                              {order.garmentType || '—'}
                            </p>

                            {order.fabric && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {order.fabric}
                                </p>
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">
                            {order.quantity.toLocaleString()}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">
                            {formatDate(order.orderDate)}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">
                            {formatDate(order.deliveryDate)}
                          </td>

                          <td className="px-6 py-5">
                        <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                order.status
                            )}`}
                        >
                          {getStatusLabel(
                              order.status
                          )}
                        </span>
                          </td>

                          <td className="px-6 py-5 text-right text-sm font-semibold text-[#1F2937]">
                            {formatCurrency(
                                order.total
                            )}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <button
                                type="button"
                                onClick={() =>
                                    handleViewOrder(
                                        order.orderNumber
                                    )
                                }
                                className="text-sm font-medium text-[#1F4D3A] hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
          )}

          {/* Mobile cards */}
          {orders.length > 0 && (
              <div className="md:hidden space-y-4">
                {orders.map((order) => (
                    <button
                        key={order.id}
                        type="button"
                        onClick={() =>
                            handleViewOrder(
                                order.orderNumber
                            )
                        }
                        className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-[#1F4D3A]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#1F4D3A]">
                            {order.orderNumber}
                          </p>

                          <h2 className="text-base font-semibold text-[#1F2937] mt-1">
                            {order.garmentType || 'Order'}
                          </h2>
                        </div>

                        <span
                            className={`shrink-0 inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                order.status
                            )}`}
                        >
                    {getStatusLabel(
                        order.status
                    )}
                  </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-5">
                        <div>
                          <p className="text-xs text-gray-500">
                            Quantity
                          </p>

                          <p className="text-sm font-medium text-[#1F2937] mt-1">
                            {order.quantity.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Total
                          </p>

                          <p className="text-sm font-semibold text-[#1F2937] mt-1">
                            {formatCurrency(
                                order.total
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Ordered
                          </p>

                          <p className="text-sm text-gray-700 mt-1">
                            {formatDate(
                                order.orderDate
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Delivery
                          </p>

                          <p className="text-sm text-gray-700 mt-1">
                            {formatDate(
                                order.deliveryDate
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Progress
                  </span>

                        <span className="text-sm font-semibold text-[#1F4D3A]">
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

                      <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#1F4D3A] rounded-full"
                            style={{
                              width: `${Math.max(
                                  0,
                                  Math.min(
                                      100,
                                      Number(
                                          order.progress ?? 0
                                      )
                                  )
                              )}%`,
                            }}
                        />
                      </div>

                      <div className="mt-4 text-right text-sm font-medium text-[#1F4D3A]">
                        View Order →
                      </div>
                    </button>
                ))}
              </div>
          )}
        </div>
      </div>
  )
}